import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Box, Cyl, Decal, FACE, PART_COLORS, V3, mergeBoxes, mergeGeos } from './partsCommon';
import { MB_H, MB_W, chipsetTexture, ioShroudTexture, pcbTexture } from './textures';

/**
 * MOTHERBOARD ATX (24.4 × 30.5 cm → 2.44 × 3.05 unit; 1 unit = 10 cm)
 * Koordinat lokal: u = sumbu X (belakang/I-O = negatif), v = sumbu Y (atas = positif),
 * permukaan komponen menghadap +Z. Origin = titik tengah papan.
 */
export const MB_LAYOUT = {
  width: MB_W,
  height: MB_H,
  thickness: 0.03,
  frontZ: 0.015,
  socket: [-0.15, 0.62] as const,
  dimmU: [0.4, 0.52, 0.68, 0.8] as const,
  dimmV: 0.68,
  dimmLen: 1.36,
  m2: { connectorU: -0.72, centerU: -0.29, v: -0.18, standoffU: 0.11 },
  pcie1V: -0.48,
  pcieX1V: -0.78,
  pcie2V: -1.08,
  pcieU: [-0.98, -0.09] as const,
  atx24: [1.13, 0.27] as const,
  eps8: [-0.68, 1.47] as const,
} as const;

const Z0 = MB_LAYOUT.frontZ;

const MOUNT_HOLES: [number, number][] = [
  [-1.12, 1.42],
  [0.15, 1.42],
  [1.12, 1.42],
  [-1.12, -0.1],
  [0.15, -0.1],
  [1.12, -0.1],
  [-1.12, -1.42],
  [0.15, -1.42],
  [1.12, -1.42],
];

/** Blok heatsink VRM beralur: base + deretan sirip. */
const VrmHeatsink: React.FC<{
  center: [number, number];
  size: [number, number];
  finsAlong: 'u' | 'v';
}> = ({ center, size, finsAlong }) => {
  const [w, h] = size;
  const baseH = 0.06;
  const finH = 0.17;
  const fins = useMemo(() => {
    const boxes: Array<{ size: V3; pos: V3 }> = [];
    const len = finsAlong === 'u' ? w : h;
    const count = Math.floor(len / 0.07);
    for (let i = 0; i < count; i++) {
      const t = -len / 2 + 0.035 + i * (len / count);
      boxes.push(
        finsAlong === 'u'
          ? { size: [0.036, h, finH], pos: [t, 0, baseH + finH / 2] }
          : { size: [w, 0.036, finH], pos: [0, t, baseH + finH / 2] }
      );
    }
    return mergeBoxes(boxes);
  }, [w, h, finsAlong]);

  return (
    <group position={[center[0], center[1], Z0]}>
      <Box size={[w, h, baseH]} position={[0, 0, baseH / 2]} color="#2c3139" metalness={0.75} roughness={0.35} />
      <mesh geometry={fins}>
        <meshStandardMaterial color="#3a4049" metalness={0.8} roughness={0.32} />
      </mesh>
      {/* Aksen garis oranye di tepi atas heatsink */}
      <Box
        size={finsAlong === 'u' ? [w, 0.02, 0.012] : [0.02, h, 0.012]}
        position={finsAlong === 'u' ? [0, -h / 2 + 0.01, baseH + finH + 0.006] : [w / 2 - 0.01, 0, baseH + finH + 0.006]}
        color="#FF7A2F"
        emissive="#FF7A2F"
        emissiveIntensity={0.9}
      />
      {/* Thermal pad di bawah heatsink */}
      <Box size={[w * 0.96, h * 0.96, 0.01]} position={[0, 0, 0.005]} color="#64748b" roughness={0.9} />
    </group>
  );
};

/** Soket CPU (gaya LGA AM5) dengan bingkai metal, area pin emas, dan tuas pengunci. */
const CpuSocket: React.FC = () => {
  const [su, sv] = MB_LAYOUT.socket;
  const fr = 0.26;
  return (
    <group position={[su, sv, Z0]}>
      <Box size={[0.52, 0.52, 0.02]} position={[0, 0, 0.01]} color="#1f2329" roughness={0.7} />
      <Box size={[0.42, 0.42, 0.004]} position={[0, 0, 0.022]} color="#c9a24a" metalness={0.85} roughness={0.38} />
      {/* Bingkai metal (load plate frame) */}
      <Box size={[0.52, 0.04, 0.045]} position={[0, fr - 0.02, 0.0225]} color={PART_COLORS.metalSilver} metalness={0.95} roughness={0.25} />
      <Box size={[0.52, 0.04, 0.045]} position={[0, -fr + 0.02, 0.0225]} color={PART_COLORS.metalSilver} metalness={0.95} roughness={0.25} />
      <Box size={[0.04, 0.44, 0.045]} position={[fr - 0.02, 0, 0.0225]} color={PART_COLORS.metalSilver} metalness={0.95} roughness={0.25} />
      <Box size={[0.04, 0.44, 0.045]} position={[-fr + 0.02, 0, 0.0225]} color={PART_COLORS.metalSilver} metalness={0.95} roughness={0.25} />
      {/* Sekrup retensi */}
      {[
        [-0.3, 0.3],
        [0.3, 0.3],
        [-0.3, -0.3],
        [0.3, -0.3],
      ].map(([x, y], i) => (
        <Cyl key={i} radius={0.028} height={0.03} axis="z" position={[x, y, 0.015]} color="#d1d5db" metalness={0.9} roughness={0.3} />
      ))}
      {/* Tuas pengunci */}
      <Cyl radius={0.012} height={0.58} axis="y" position={[fr + 0.05, 0, 0.03]} color={PART_COLORS.metalSilver} metalness={0.95} roughness={0.25} />
      <Cyl radius={0.012} height={0.09} axis="x" position={[fr + 0.01, -0.29, 0.03]} color={PART_COLORS.metalSilver} metalness={0.95} roughness={0.25} />
      <Box size={[0.05, 0.04, 0.03]} position={[fr + 0.05, 0.3, 0.03]} color="#111317" />
    </group>
  );
};

const DimmSlot: React.FC<{ u: number; tint: string }> = ({ u, tint }) => {
  const { dimmV, dimmLen } = MB_LAYOUT;
  return (
    <group position={[u, dimmV, Z0]}>
      <Box size={[0.075, dimmLen, 0.075]} position={[0, 0, 0.0375]} color={tint} roughness={0.55} />
      <Box size={[0.03, dimmLen - 0.1, 0.02]} position={[0, 0, 0.07]} color="#0b0d10" />
      {/* Latch pengunci di kedua ujung */}
      <Box size={[0.085, 0.06, 0.11]} position={[0, dimmLen / 2 + 0.02, 0.055]} rotation={[0.18, 0, 0]} color={tint} roughness={0.5} />
      <Box size={[0.085, 0.06, 0.11]} position={[0, -dimmLen / 2 - 0.02, 0.055]} rotation={[-0.18, 0, 0]} color={tint} roughness={0.5} />
    </group>
  );
};

/** Slot PCIe x16 dengan pelindung metal silver (armor). */
const PcieSlot: React.FC<{ v: number; armored: boolean; length: number; startU: number }> = ({
  v,
  armored,
  length,
  startU,
}) => (
  <group position={[startU + length / 2, v, Z0]}>
    <Box size={[length, 0.075, 0.095]} position={[0, 0, 0.0475]} color="#14171c" roughness={0.6} />
    <Box size={[length - 0.04, 0.02, 0.02]} position={[0, 0, 0.09]} color="#050608" />
    {armored && (
      <>
        <Box size={[length + 0.02, 0.01, 0.105]} position={[0, 0.0425, 0.0525]} color={PART_COLORS.metalSilver} metalness={1} roughness={0.22} />
        <Box size={[length + 0.02, 0.01, 0.105]} position={[0, -0.0425, 0.0525]} color={PART_COLORS.metalSilver} metalness={1} roughness={0.22} />
        <Box size={[0.012, 0.095, 0.105]} position={[-length / 2 - 0.01, 0, 0.0525]} color={PART_COLORS.metalSilver} metalness={1} roughness={0.22} />
      </>
    )}
    {/* Latch slot */}
    <Box size={[0.07, 0.085, 0.11]} position={[length / 2 + 0.03, 0, 0.055]} color={armored ? '#2a2f37' : '#14171c'} />
  </group>
);

/** Konektor daya (24-pin / EPS 8-pin) dengan lubang pin. */
const PowerHeader: React.FC<{ center: readonly [number, number]; cols: number; rows: number; vertical: boolean }> = ({
  center,
  cols,
  rows,
  vertical,
}) => {
  const pitch = 0.042;
  const w = (vertical ? cols : rows) * pitch + 0.02;
  const h = (vertical ? rows : cols) * pitch + 0.02;
  const holes = useMemo(() => {
    const b: Array<{ size: V3; pos: V3 }> = [];
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++) {
        const a = -((cols - 1) * pitch) / 2 + c * pitch;
        const bb = -((rows - 1) * pitch) / 2 + r * pitch;
        b.push({ size: [0.028, 0.028, 0.01], pos: vertical ? [a, bb, 0.121] : [bb, a, 0.121] });
      }
    return mergeBoxes(b);
  }, [cols, rows, vertical]);
  return (
    <group position={[center[0], center[1], Z0]}>
      <Box size={[w, h, 0.12]} position={[0, 0, 0.06]} color="#2b2f36" roughness={0.6} />
      <mesh geometry={holes}>
        <meshStandardMaterial color="#050608" roughness={0.9} />
      </mesh>
    </group>
  );
};

export const Motherboard: React.FC<{ position?: V3; rotation?: V3 }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const pcb = pcbTexture();
  const chipset = chipsetTexture();
  const ioTex = ioShroudTexture();

  // Deret choke & kapasitor solid di sekitar VRM
  const chokes = useMemo(() => {
    const b: Array<{ size: V3; pos: V3 }> = [];
    for (let i = 0; i < 9; i++) b.push({ size: [0.085, 0.085, 0.07], pos: [-0.58 + i * 0.1, 1.06, Z0 + 0.035] });
    for (let i = 0; i < 7; i++) b.push({ size: [0.085, 0.085, 0.07], pos: [-0.6, 0.22 + i * 0.12, Z0 + 0.035] });
    return mergeBoxes(b);
  }, []);
  const caps = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    const add = (u: number, v: number) => {
      const g = new THREE.CylinderGeometry(0.03, 0.03, 0.09, 16);
      g.rotateX(Math.PI / 2);
      g.translate(u, v, Z0 + 0.045);
      parts.push(g);
    };
    for (let i = 0; i < 9; i++) add(-0.58 + i * 0.1, 0.97);
    for (let i = 0; i < 7; i++) add(-0.5, 0.22 + i * 0.12);
    for (let i = 0; i < 5; i++) add(0.98 + (i % 2) * 0.08, -1.18 - i * 0.05);
    return mergeGeos(parts);
  }, []);

  const pins = useMemo(() => {
    const b: Array<{ size: V3; pos: V3 }> = [];
    for (let i = 0; i < 9; i++)
      for (let r = 0; r < 2; r++) b.push({ size: [0.014, 0.014, 0.06], pos: [0.6 + i * 0.04, -1.43 + r * 0.04, Z0 + 0.04] });
    for (let i = 0; i < 4; i++) b.push({ size: [0.014, 0.014, 0.06], pos: [0.46 + i * 0.04, 1.47, Z0 + 0.04] });
    return mergeBoxes(b);
  }, []);

  return (
    <group position={position} rotation={rotation}>
      {/* PCB matte bertekstur jalur sirkuit */}
      <mesh>
        <boxGeometry args={[MB_W, MB_H, MB_LAYOUT.thickness]} />
        <meshStandardMaterial attach="material-0" color="#0f1216" roughness={0.8} />
        <meshStandardMaterial attach="material-1" color="#0f1216" roughness={0.8} />
        <meshStandardMaterial attach="material-2" color="#0f1216" roughness={0.8} />
        <meshStandardMaterial attach="material-3" color="#0f1216" roughness={0.8} />
        <meshStandardMaterial attach="material-4" map={pcb} roughness={0.82} metalness={0.08} />
        <meshStandardMaterial attach="material-5" color="#0c0e11" roughness={0.9} />
      </mesh>

      {/* Shroud I/O belakang */}
      <group position={[-1.07, 0.85, Z0]}>
        <Box size={[0.3, 1.2, 0.34]} position={[0, 0, 0.17]} color="#262a31" metalness={0.5} roughness={0.4} />
        <Decal size={[0.3, 1.2]} position={[0, 0, 0.3405]} map={ioTex} metalness={0.4} roughness={0.4} />
        <Decal size={[0.34, 1.2]} position={[0.1505, 0, 0.17]} rotation={FACE.px} map={ioTex} />
        {/* Cover miring + strip LED */}
        <Box size={[0.2, 1.22, 0.03]} position={[0.07, 0, 0.36]} rotation={[0, 0.32, 0]} color="#30353d" metalness={0.7} roughness={0.3} />
        <Box size={[0.012, 1.0, 0.02]} position={[0.155, 0, 0.33]} color="#FF7A2F" emissive="#FF7A2F" emissiveIntensity={1.4} />
        {/* Port I/O di sisi belakang */}
        {[0.45, 0.28, 0.1, -0.08].map((y, i) => (
          <Box key={i} size={[0.1, 0.13, 0.08]} position={[-0.19, y, 0.07]} color={i === 1 ? '#1d4ed8' : '#111317'} metalness={0.4} />
        ))}
        <Box size={[0.1, 0.16, 0.1]} position={[-0.19, -0.27, 0.08]} color="#9ca3af" metalness={0.8} roughness={0.3} />
        {['#22c55e', '#ec4899', '#3b82f6'].map((c, i) => (
          <Cyl key={c} radius={0.025} height={0.08} axis="x" position={[-0.19, -0.46 - i * 0.065, 0.06]} color={c} />
        ))}
      </group>

      {/* Heatsink VRM beralur */}
      <VrmHeatsink center={[-0.26, 1.3]} size={[1.12, 0.24]} finsAlong="u" />
      <VrmHeatsink center={[-0.8, 0.62]} size={[0.2, 0.95]} finsAlong="v" />
      <mesh geometry={chokes}>
        <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh geometry={caps}>
        <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.35} />
      </mesh>

      <CpuSocket />

      {/* 4 slot DIMM (abu gelap/terang bergantian) */}
      {MB_LAYOUT.dimmU.map((u, i) => (
        <DimmSlot key={u} u={u} tint={i % 2 === 0 ? '#2b2f36' : '#6b7280'} />
      ))}

      {/* Slot PCIe silver + x1 */}
      <PcieSlot v={MB_LAYOUT.pcie1V} armored length={0.89} startU={MB_LAYOUT.pcieU[0]} />
      <PcieSlot v={MB_LAYOUT.pcieX1V} armored={false} length={0.25} startU={MB_LAYOUT.pcieU[0]} />
      <PcieSlot v={MB_LAYOUT.pcie2V} armored length={0.89} startU={MB_LAYOUT.pcieU[0]} />

      {/* Slot M.2 + standoff */}
      <Box size={[0.05, 0.22, 0.045]} position={[MB_LAYOUT.m2.connectorU, MB_LAYOUT.m2.v, Z0 + 0.0225]} color="#111317" />
      <Cyl radius={0.03} height={0.035} axis="z" position={[MB_LAYOUT.m2.standoffU, MB_LAYOUT.m2.v, Z0 + 0.0175]} color={PART_COLORS.gold} metalness={0.9} roughness={0.3} />

      {/* Heatsink chipset */}
      <group position={[0.65, -0.875, Z0]}>
        <Box size={[0.6, 0.65, 0.07]} position={[0, 0, 0.035]} color="#2a2f37" metalness={0.7} roughness={0.35} />
        <Box size={[0.54, 0.59, 0.02]} position={[0, 0, 0.08]} color="#ffffff" map={chipset} metalness={0.6} roughness={0.35} />
      </group>

      {/* Baterai CMOS CR2032 */}
      <Cyl radius={0.118} height={0.02} axis="z" position={[0.6, -0.22, Z0 + 0.01]} color="#111317" />
      <Cyl radius={0.1} height={0.032} axis="z" position={[0.6, -0.22, Z0 + 0.03]} color="#d7dbe0" metalness={1} roughness={0.2} segments={40} />
      <Box size={[0.03, 0.12, 0.02]} position={[0.6, -0.22, Z0 + 0.052]} color="#9ca3af" metalness={0.9} roughness={0.3} />

      {/* Konektor daya 24-pin & EPS 8-pin */}
      <PowerHeader center={MB_LAYOUT.atx24} cols={2} rows={12} vertical />
      <PowerHeader center={MB_LAYOUT.eps8} cols={2} rows={4} vertical={false} />

      {/* Port SATA bertumpuk */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[1.16, -0.65 - i * 0.1, Z0]}>
          <Box size={[0.09, 0.07, 0.08]} position={[0, 0, 0.04]} color="#1f2329" />
          <Box size={[0.03, 0.04, 0.01]} position={[0.03, 0, 0.081]} color="#050608" />
        </group>
      ))}

      {/* Header front panel & CPU_FAN (pin emas) */}
      <mesh geometry={pins}>
        <meshStandardMaterial color={PART_COLORS.gold} metalness={0.95} roughness={0.3} />
      </mesh>
      <Box size={[0.38, 0.1, 0.02]} position={[0.76, -1.41, Z0 + 0.01]} color="#111317" />
      <Box size={[0.18, 0.06, 0.02]} position={[0.52, 1.47, Z0 + 0.01]} color="#e5e7eb" />

      {/* Sekrup mounting */}
      {MOUNT_HOLES.map(([u, v], i) => (
        <Cyl key={i} radius={0.04} height={0.02} axis="z" position={[u, v, Z0 + 0.01]} color="#cbd5e1" metalness={0.95} roughness={0.25} />
      ))}

      {/* Penanda tepi atas board (label belakang) */}
      <Decal size={[MB_W, MB_H]} position={[0, 0, -0.0155]} rotation={FACE.nz} color="#0c0e11" />
    </group>
  );
};

