import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Box, Cyl, Decal, FACE, Fan3D, PART_COLORS, V3, mergeBoxes } from './partsCommon';
import {
  glassStreakTexture,
  meshPanelTexture,
  psuGrilleTexture,
  psuLabelTexture,
  psuModularTexture,
  psuRearTexture,
  shroudTexture,
} from './textures';

// ============================================================================
// POWER SUPPLY ATX (15 × 8.6 × 15 cm), fully modular
// Frame natural: origin di tengah. +X = panel modular (menghadap depan casing),
// -X = panel belakang (saklar & soket AC), +Y = kisi kipas, +Z = label samping.
// ============================================================================
export const PSU_DIM = { length: 1.5, height: 0.86, width: 1.5 } as const;

const PL = PSU_DIM.length / 2;
const PH = PSU_DIM.height / 2;
const PW = PSU_DIM.width / 2;

/** Konversi koordinat piksel tekstur panel (600×344) → posisi lokal pada wajah ±X. */
const texToFace = (tx: number, ty: number, side: 'px' | 'nx'): [number, number] => {
  const y = PH - 0.02 - (ty / 344) * (PSU_DIM.height - 0.04);
  const t = (tx / 600) * (PSU_DIM.width - 0.06);
  const z = side === 'px' ? PW - 0.03 - t : -PW + 0.03 + t;
  return [y, z];
};

interface SocketSpec {
  label: string;
  tx: number;
  ty: number;
  wpx: number;
  cols: number;
}

const MODULAR_SOCKETS: SocketSpec[] = [
  { label: '24-PIN', tx: 130, ty: 82, wpx: 180, cols: 12 },
  { label: 'CPU', tx: 305, ty: 82, wpx: 110, cols: 4 },
  { label: 'PCIe', tx: 460, ty: 82, wpx: 120, cols: 4 },
  { label: 'SATA', tx: 120, ty: 250, wpx: 160, cols: 3 },
  { label: 'PCIe', tx: 305, ty: 250, wpx: 110, cols: 4 },
  { label: 'CPU', tx: 460, ty: 250, wpx: 120, cols: 4 },
];

const buildTopPlateGeometry = () => {
  const s = new THREE.Shape();
  s.moveTo(-PL, -PW);
  s.lineTo(PL, -PW);
  s.lineTo(PL, PW);
  s.lineTo(-PL, PW);
  s.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.62, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false, curveSegments: 48 });
  g.rotateX(-Math.PI / 2);
  return g;
};

export const Psu: React.FC<{ position?: V3; rotation?: V3; fanAngle?: number; scale?: number }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  fanAngle = 0,
  scale = 1,
}) => {
  const topGeo = useMemo(buildTopPlateGeometry, []);
  const label = psuLabelTexture();
  const modular = psuModularTexture();
  const rear = psuRearTexture();
  const grille = psuGrilleTexture();
  const ws = (PSU_DIM.width - 0.06) / 600;

  const socketHoles = useMemo(() => {
    const b: Array<{ size: V3; pos: V3 }> = [];
    for (const s of MODULAR_SOCKETS) {
      const [y, z] = texToFace(s.tx, s.ty, 'px');
      const w = s.wpx * ws;
      const pitch = (w - 0.04) / s.cols;
      for (let c = 0; c < s.cols; c++)
        for (let r = 0; r < 2; r++)
          b.push({
            size: [0.01, pitch * 0.62, pitch * 0.62],
            pos: [PL + 0.046, y - pitch * 0.5 + r * pitch, z + w / 2 - 0.02 - pitch / 2 - c * pitch],
          });
    }
    return mergeBoxes(b);
  }, [ws]);

  const [iecY, iecZ] = texToFace(470, 150, 'nx');
  const [swY, swZ] = texToFace(480, 250, 'nx');

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Housing baja hitam */}
      <Box size={[PSU_DIM.length, 0.03, PSU_DIM.width]} position={[0, -PH + 0.015, 0]} color="#16191e" metalness={0.55} roughness={0.45} />
      <Box size={[PSU_DIM.length, PSU_DIM.height, 0.03]} position={[0, 0, PW - 0.015]} color="#16191e" metalness={0.55} roughness={0.45} />
      <Box size={[PSU_DIM.length, PSU_DIM.height, 0.03]} position={[0, 0, -PW + 0.015]} color="#16191e" metalness={0.55} roughness={0.45} />
      <Box size={[0.03, PSU_DIM.height, PSU_DIM.width - 0.06]} position={[PL - 0.015, 0, 0]} color="#121418" metalness={0.4} roughness={0.5} />
      <Box size={[0.03, PSU_DIM.height, PSU_DIM.width - 0.06]} position={[-PL + 0.015, 0, 0]} color="#121418" metalness={0.4} roughness={0.5} />
      <mesh geometry={topGeo} position={[0, PH - 0.03, 0]}>
        <meshStandardMaterial color="#16191e" metalness={0.55} roughness={0.45} />
      </mesh>
      {/* Bevel rel tepi */}
      {[
        [PH, PW],
        [PH, -PW],
        [-PH, PW],
        [-PH, -PW],
      ].map(([y, z], i) => (
        <Box key={i} size={[PSU_DIM.length + 0.01, 0.035, 0.035]} position={[0, y, z]} color="#262a31" metalness={0.6} roughness={0.35} />
      ))}

      {/* Kipas internal + kisi-kisi grille di atas */}
      <Box size={[1.3, 0.01, 1.3]} position={[0, PH - 0.2, 0]} color="#07090c" />
      <Fan3D radius={0.58} angle={fanAngle} blades={9} frameStyle="none" thickness={0.1} position={[0, PH - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} hubAccent="#FF7A2F" />
      <Decal size={[1.28, 1.28]} position={[0, PH + 0.003, 0]} rotation={FACE.py} map={grille} transparent alphaTest={0.25} metalness={0.7} roughness={0.35} color="#9aa1aa" />
      <mesh position={[0, PH + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.018, 8, 64]} />
        <meshStandardMaterial color="#2b3038" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Label samping 750W 80+ Gold (dua sisi) */}
      <Decal size={[1.1, 0.733]} position={[0, 0, PW + 0.0012]} map={label} />
      <Decal size={[1.1, 0.733]} position={[0, 0, -PW - 0.0012]} rotation={FACE.nz} map={label} />

      {/* Panel soket modular: 24-PIN, CPU, PCIe, SATA */}
      <Decal size={[PSU_DIM.width - 0.06, PSU_DIM.height - 0.04]} position={[PL + 0.0012, 0, 0]} rotation={FACE.px} map={modular} />
      {MODULAR_SOCKETS.map((s, i) => {
        const [y, z] = texToFace(s.tx, s.ty, 'px');
        const w = s.wpx * ws;
        return <Box key={i} size={[0.04, 0.17, w]} position={[PL + 0.02, y, z]} color="#0b0d10" roughness={0.6} />;
      })}
      <mesh geometry={socketHoles}>
        <meshStandardMaterial color="#2b3038" roughness={0.8} />
      </mesh>

      {/* Panel belakang: honeycomb, soket AC IEC, saklar power */}
      <Decal size={[PSU_DIM.width - 0.06, PSU_DIM.height - 0.04]} position={[-PL - 0.0012, 0, 0]} rotation={FACE.nx} map={rear} />
      <group position={[-PL - 0.02, iecY, iecZ]}>
        <Box size={[0.04, 0.2, 0.28]} color="#0b0d10" />
        {[-0.07, 0, 0.07].map((z) => (
          <Box key={z} size={[0.02, 0.06, 0.016]} position={[-0.02, 0.01, z]} color="#c9ced4" metalness={0.9} roughness={0.3} />
        ))}
      </group>
      <group position={[-PL - 0.03, swY, swZ]}>
        <Box size={[0.03, 0.16, 0.11]} position={[0.01, 0, 0]} color="#0b0d10" />
        <Box size={[0.05, 0.13, 0.085]} rotation={[0.25, 0, 0]} color="#1a1d22" roughness={0.4} />
        <Box size={[0.052, 0.04, 0.008]} position={[-0.001, 0.03, 0]} rotation={[0.25, 0, 0]} color="#f8fafc" />
      </group>
    </group>
  );
};

// ============================================================================
// CASING MID-TOWER (46 × 47 × 22 cm) — kaca samping bertumpu engsel belakang
// Origin = tengah dasar casing. -X = belakang (I/O & exhaust), +X = depan (intake),
// -Z = tray motherboard, +Z = panel kaca.
// ============================================================================
export const CASE_DIM = { halfX: 2.3, height: 4.7, halfZ: 1.1 } as const;

export const CASE_LAYOUT = {
  mbOrigin: [-0.88, 2.95, -1.0] as V3,
  psuCenter: [-1.43, 0.51, 0.15] as V3,
  fanRadius: 0.52,
  frontFanX: 2.12,
  frontFansY: [1.52, 2.7, 3.88] as const,
  rearFan: [-2.12, 3.85, 0] as V3,
  trayZ: -1.04,
  shroudTop: 0.92,
  grommets: [
    [0.62, 1.45],
    [0.62, 2.45],
    [0.62, 3.45],
    [-1.62, 4.52],
  ] as const,
} as const;

export const PcCase: React.FC<{
  position?: V3;
  rotation?: V3;
  scale?: number;
  /** 0 = kaca tertutup, 1 = kaca terbuka penuh (engsel di sisi belakang) */
  glassOpen?: number;
  glassOpacity?: number;
  fanAngle?: number;
  intakeColor?: string;
  exhaustColor?: string;
  ringIntensity?: number;
  children?: React.ReactNode;
}> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  glassOpen = 0,
  glassOpacity = 1,
  fanAngle = 0,
  intakeColor = '#38BDF8',
  exhaustColor = '#FF7A2F',
  ringIntensity = 1.6,
  children,
}) => {
  const { halfX: HX, height: H, halfZ: HZ } = CASE_DIM;
  const mesh = meshPanelTexture();
  const streak = glassStreakTexture();
  const shroud = shroudTexture();
  const chassis = { color: PART_COLORS.chassis, metalness: 0.55, roughness: 0.45 };

  const slotCovers = useMemo(() => {
    const b: Array<{ size: V3; pos: V3 }> = [];
    for (let i = 0; i < 7; i++) {
      b.push({ size: [0.02, 0.15, 1.2], pos: [-HX + 0.07, 2.55 - i * 0.2, -0.25] });
      for (let k = 0; k < 6; k++) b.push({ size: [0.006, 0.03, 0.12], pos: [-HX + 0.081, 2.55 - i * 0.2, -0.65 + k * 0.17] });
    }
    return mergeBoxes(b);
  }, [HX]);

  const rails = useMemo(() => {
    const b: Array<{ size: V3; pos: V3 }> = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.push({ size: [0.07, H, 0.07], pos: [sx * (HX - 0.035), H / 2, sz * (HZ - 0.035)] });
    for (const y of [0.035, H - 0.035]) {
      b.push({ size: [HX * 2, 0.07, 0.07], pos: [0, y, HZ - 0.035] });
      b.push({ size: [HX * 2, 0.07, 0.07], pos: [0, y, -HZ + 0.035] });
    }
    return mergeBoxes(b);
  }, [HX, HZ, H]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Rangka & panel baja */}
      <mesh geometry={rails}>
        <meshStandardMaterial color="#0f1216" metalness={0.7} roughness={0.35} />
      </mesh>
      <Box size={[HX * 2, 0.06, HZ * 2]} position={[0, 0.03, 0]} {...chassis} />
      <Box size={[HX * 2, 0.05, HZ * 2]} position={[0, H - 0.025, 0]} {...chassis} />
      <Decal size={[HX * 2 - 0.3, HZ * 2 - 0.3]} position={[0, H + 0.002, 0]} rotation={FACE.py} map={mesh} />
      <Decal size={[HX * 2 - 0.3, HZ * 2 - 0.3]} position={[0, H - 0.052, 0]} rotation={FACE.ny} map={mesh} />
      {/* Panel depan mesh (intake) */}
      <Box size={[0.06, H, HZ * 2]} position={[HX - 0.03, H / 2, 0]} {...chassis} />
      <Decal size={[HZ * 2 - 0.2, H - 0.3]} position={[HX + 0.002, H / 2, 0]} rotation={FACE.px} map={mesh} />
      <Decal size={[HZ * 2 - 0.2, H - 0.3]} position={[HX - 0.062, H / 2, 0]} rotation={FACE.nx} map={mesh} />
      {/* Panel belakang: slot cover PCIe, bukaan I/O, bukaan PSU */}
      <Box size={[0.06, H, HZ * 2]} position={[-HX + 0.03, H / 2, 0]} {...chassis} />
      <mesh geometry={slotCovers}>
        <meshStandardMaterial color="#9aa1aa" metalness={0.85} roughness={0.35} />
      </mesh>
      <Box size={[0.02, 1.22, 0.42]} position={[-HX + 0.07, 3.8, -0.8]} color="#07090c" />
      <Box size={[0.02, 0.84, 1.48]} position={[-HX + 0.07, 0.51, 0.15]} color="#07090c" />
      <mesh position={[-HX + 0.065, CASE_LAYOUT.rearFan[1], 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.5, 0.025, 8, 64]} />
        <meshStandardMaterial color="#2b3038" metalness={0.7} />
      </mesh>
      {/* Tray motherboard + grommet karet manajemen kabel */}
      <Box size={[HX * 2 - 0.1, H - 0.1, 0.06]} position={[0, H / 2, -HZ + 0.03]} color="#14181e" metalness={0.5} roughness={0.5} />
      {CASE_LAYOUT.grommets.map(([x, y], i) => (
        <group key={i} position={[x, y, CASE_LAYOUT.trayZ + 0.005]}>
          <mesh>
            <circleGeometry args={[0.13, 32]} />
            <meshStandardMaterial color="#020304" />
          </mesh>
          <mesh>
            <torusGeometry args={[0.13, 0.03, 10, 40]} />
            <meshStandardMaterial color={PART_COLORS.rubber} roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* Shroud PSU (bagian depan) */}
      <Box size={[2.76, 0.86, HZ * 2 - 0.12]} position={[0.83, 0.49, 0]} color="#15191f" metalness={0.5} roughness={0.45} />
      <Decal size={[2.6, 0.65]} position={[0.83, 0.49, HZ - 0.059]} map={shroud} />
      {/* Kaki karet */}
      {[
        [1.9, 0.8],
        [-1.9, 0.8],
        [1.9, -0.8],
        [-1.9, -0.8],
      ].map(([x, z], i) => (
        <Cyl key={i} radius={0.13} height={0.1} position={[x, -0.05, z]} color={PART_COLORS.rubber} roughness={0.9} />
      ))}
      {/* Front I/O atas: tombol power + port USB */}
      <Cyl radius={0.07} height={0.03} position={[1.95, H + 0.015, 0.55]} color="#1a1d22" metalness={0.6} />
      <mesh position={[1.95, H + 0.031, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.01, 8, 32]} />
        <meshStandardMaterial color={intakeColor} emissive={intakeColor} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {[0.2, -0.05].map((z) => (
        <Box key={z} size={[0.1, 0.02, 0.16]} position={[1.95, H + 0.01, z]} color="#07090c" />
      ))}

      {/* Kipas intake depan ×3 & exhaust belakang */}
      {CASE_LAYOUT.frontFansY.map((y, i) => (
        <Fan3D
          key={y}
          radius={CASE_LAYOUT.fanRadius}
          angle={fanAngle + i * 0.7}
          blades={7}
          position={[CASE_LAYOUT.frontFanX, y, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          ringColor={intakeColor}
          ringIntensity={ringIntensity}
          hubAccent={intakeColor}
        />
      ))}
      <Fan3D
        radius={CASE_LAYOUT.fanRadius}
        angle={-fanAngle}
        blades={7}
        position={CASE_LAYOUT.rearFan}
        rotation={[0, Math.PI / 2, 0]}
        ringColor={exhaustColor}
        ringIntensity={ringIntensity}
        hubAccent={exhaustColor}
      />

      {children}

      {/* Panel kaca tempered (engsel di tepi belakang) */}
      {glassOpacity > 0.01 && (
        <group position={[-HX, 0, HZ]} rotation={[0, -glassOpen * 1.75, 0]}>
          <mesh position={[HX, H / 2, 0.0125]} renderOrder={10}>
            <boxGeometry args={[HX * 2, H, 0.025]} />
            <meshStandardMaterial
              color="#a5b8cc"
              metalness={0.3}
              roughness={0.05}
              transparent
              opacity={0.13 * glassOpacity}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[HX, H / 2, 0.027]} renderOrder={11}>
            <planeGeometry args={[HX * 2, H]} />
            <meshBasicMaterial map={streak} transparent opacity={0.55 * glassOpacity} depthWrite={false} />
          </mesh>
          {[
            [0.12, 0.12],
            [HX * 2 - 0.12, 0.12],
            [0.12, H - 0.12],
            [HX * 2 - 0.12, H - 0.12],
          ].map(([x, y], i) => (
            <Cyl key={i} radius={0.05} height={0.05} axis="z" position={[x, y, 0.05]} color="#cbd5e1" metalness={0.95} roughness={0.25} transparent={glassOpacity < 1} opacity={glassOpacity} />
          ))}
        </group>
      )}
    </group>
  );
};
