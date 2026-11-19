import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Box, Decal, FACE, Fan3D, PART_COLORS, V3, mergeBoxes, normalizeUVs, tubeFromPoints } from './partsCommon';
import { GPU_LEN, GPU_SHROUD_H, gpuBackplateTexture, gpuBracketTexture, gpuShroudTexture } from './textures';

/**
 * KARTU GRAFIS 2.5-slot (30 × 12.5 cm).
 * Frame natural: panjang = X (braket PCIe di x ≈ -0.1), tinggi kartu = Y (gold finger di y < 0),
 * tebal = Z (backplate di -Z, kipas menghadap +Z).
 */
export const GPU_DIM = {
  length: GPU_LEN,
  height: GPU_SHROUD_H,
  fingerStartX: 0.25,
  fingerEndX: 1.14,
  bracketX: -0.1,
  fanZ: 0.39,
  fanCentersX: [0.5, 1.47, 2.44] as const,
  fanCenterY: 0.635,
  fanRadius: 0.42,
} as const;

/** Rotasi saat terpasang di slot PCIe board (kipas menghadap ke bawah / -v). */
export const GPU_ON_BOARD_ROTATION: V3 = [Math.PI / 2, 0, 0];

const SHROUD_X0 = -0.04;
const SHROUD_X1 = 2.95;
const SHROUD_Y0 = 0.02;
const SHROUD_Y1 = GPU_SHROUD_H;

const buildShroudGeometry = () => {
  const c = 0.12; // chamfer modern di ujung depan
  const s = new THREE.Shape();
  s.moveTo(SHROUD_X0, SHROUD_Y0);
  s.lineTo(SHROUD_X1 - c, SHROUD_Y0);
  s.lineTo(SHROUD_X1, SHROUD_Y0 + c);
  s.lineTo(SHROUD_X1, SHROUD_Y1 - c * 1.6);
  s.lineTo(SHROUD_X1 - c * 1.6, SHROUD_Y1);
  s.lineTo(SHROUD_X0, SHROUD_Y1);
  s.closePath();
  for (const x of GPU_DIM.fanCentersX) {
    const h = new THREE.Path();
    h.absarc(x, GPU_DIM.fanCenterY, GPU_DIM.fanRadius + 0.03, 0, Math.PI * 2, true);
    s.holes.push(h);
  }
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 48,
  });
  g.translate(0, 0, 0.4);
  return normalizeUVs(g, SHROUD_X0, SHROUD_X1, SHROUD_Y0, SHROUD_Y1);
};

const heatpipePaths = (): V3[][] => {
  const zs = [0.07, 0.13, 0.19, 0.25, 0.31];
  return zs.map((z, i) => {
    if (i % 2 === 0) {
      const k = i / 2;
      return [
        [0.78 + 0.07 * k, 0.42, z],
        [0.78 + 0.07 * k, 0.95, z],
        [0.9 + 0.07 * k, 1.17, z],
        [1.4, 1.19, z],
        [2.3, 1.19, z],
        [2.62 - 0.05 * k, 1.15, z],
        [2.72 - 0.06 * k, 0.95, z],
        [2.72 - 0.06 * k, 0.45, z],
      ];
    }
    const k = (i - 1) / 2;
    return [
      [1.0 + 0.06 * k, 0.42, z],
      [1.0 + 0.06 * k, 0.95, z],
      [0.88, 1.17, z],
      [0.5, 1.19, z],
      [0.25 + 0.05 * k, 1.12, z],
      [0.2 + 0.05 * k, 0.9, z],
      [0.2 + 0.05 * k, 0.45, z],
    ];
  });
};

export const GpuCard: React.FC<{
  position?: V3;
  rotation?: V3;
  /** Sudut putar kipas (radian), mis. frame * 0.21 */
  fanAngle?: number;
  ledIntensity?: number;
  ledColor?: string;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], fanAngle = 0, ledIntensity = 1.8, ledColor = '#FF7A2F' }) => {
  const shroudGeo = useMemo(buildShroudGeometry, []);
  const fins = useMemo(() => {
    const b: Array<{ size: V3; pos: V3 }> = [];
    for (let x = 0.12; x <= 2.88; x += 0.046) b.push({ size: [0.012, 1.08, 0.33], pos: [x, 0.6, 0.195] });
    return mergeBoxes(b);
  }, []);
  const pipes = useMemo(() => heatpipePaths().map((p) => tubeFromPoints(p, 0.028, 80, 10)), []);
  const powerHoles = useMemo(() => {
    const b: Array<{ size: V3; pos: V3 }> = [];
    for (const cx of [2.15, 2.37])
      for (let c = 0; c < 4; c++)
        for (let r = 0; r < 2; r++)
          b.push({ size: [0.028, 0.01, 0.028], pos: [cx - 0.063 + c * 0.042, 1.245, 0.1 + r * 0.042] });
    return mergeBoxes(b);
  }, []);
  const shroudTex = gpuShroudTexture();
  const backTex = gpuBackplateTexture();
  const bracketTex = gpuBracketTexture();

  return (
    <group position={position} rotation={rotation}>
      {/* PCB + gold finger PCIe */}
      <Box size={[2.75, 1.12, 0.03]} position={[1.375, 0.58, 0]} color="#0f1a14" roughness={0.6} />
      <Box size={[GPU_DIM.fingerEndX - GPU_DIM.fingerStartX, 0.085, 0.032]} position={[(GPU_DIM.fingerStartX + GPU_DIM.fingerEndX) / 2, -0.04, 0]} color={PART_COLORS.gold} metalness={0.95} roughness={0.28} />

      {/* Backplate metal */}
      <Box size={[2.95, 1.22, 0.02]} position={[1.455, 0.61, -0.04]} color="#1c2026" metalness={0.75} roughness={0.35} />
      <Decal size={[2.95, 1.22]} position={[1.455, 0.61, -0.0505]} rotation={FACE.nz} map={backTex} metalness={0.7} roughness={0.35} />

      {/* Cold plate nikel + sirip aluminium + heatpipe tembaga */}
      <Box size={[0.55, 0.5, 0.04]} position={[1.0, 0.5, 0.035]} color={PART_COLORS.metalSilver} metalness={1} roughness={0.22} />
      <mesh geometry={fins}>
        <meshStandardMaterial color={PART_COLORS.aluminium} metalness={0.85} roughness={0.3} />
      </mesh>
      {pipes.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color={PART_COLORS.copper} metalness={1} roughness={0.26} />
        </mesh>
      ))}

      {/* Shroud modern dengan lubang kipas */}
      <mesh geometry={shroudGeo}>
        <meshStandardMaterial color="#ffffff" map={shroudTex} metalness={0.35} roughness={0.42} />
      </mesh>
      {/* Skirt bawah, skirt atas parsial (sirip tetap terlihat), tutup ujung */}
      <Box size={[2.99, 0.04, 0.4]} position={[1.455, 0.02, 0.22]} color="#1a1e24" metalness={0.3} roughness={0.5} />
      <Box size={[0.29, 0.04, 0.4]} position={[0.105, 1.23, 0.22]} color="#1a1e24" metalness={0.3} roughness={0.5} />
      <Box size={[0.3, 0.04, 0.4]} position={[2.8, 1.12, 0.22]} color="#1a1e24" metalness={0.3} roughness={0.5} />
      <Box size={[0.04, 0.95, 0.42]} position={[2.95, 0.6, 0.22]} color="#1a1e24" metalness={0.3} roughness={0.5} />
      {/* Garis aksen bersudut di antara kipas */}
      {[0.985, 1.955].map((x) => (
        <Box key={x} size={[0.014, 0.5, 0.01]} position={[x, 0.635, 0.452]} rotation={[0, 0, 0.35]} color={ledColor} emissive={ledColor} emissiveIntensity={ledIntensity * 0.6} />
      ))}
      {/* Strip RGB tepi atas */}
      <Box size={[1.9, 0.025, 0.03]} position={[1.45, 1.245, 0.42]} color={ledColor} emissive={ledColor} emissiveIntensity={ledIntensity} />

      {/* 3 kipas berputar halus (kipas tengah berlawanan arah) */}
      {GPU_DIM.fanCentersX.map((x, i) => (
        <Fan3D
          key={x}
          radius={GPU_DIM.fanRadius}
          angle={i === 1 ? -fanAngle * 0.94 : fanAngle}
          blades={11}
          frameStyle="none"
          thickness={0.12}
          bladeColor="#1d2128"
          hubAccent={ledColor}
          position={[x, GPU_DIM.fanCenterY, GPU_DIM.fanZ]}
        />
      ))}

      {/* Konektor PCIe 8-pin ×2 di tepi atas */}
      {[2.15, 2.37].map((x) => (
        <Box key={x} size={[0.2, 0.1, 0.11]} position={[x, 1.19, 0.12]} color="#16191e" roughness={0.6} />
      ))}
      <mesh geometry={powerHoles}>
        <meshStandardMaterial color="#050608" />
      </mesh>

      {/* Braket PCIe metal + tab sekrup */}
      <Box size={[0.02, 1.38, 0.56]} position={[GPU_DIM.bracketX, 0.55, 0.2]} color="#c3c8ce" metalness={0.95} roughness={0.28} />
      <Decal size={[0.56, 1.38]} position={[GPU_DIM.bracketX - 0.0105, 0.55, 0.2]} rotation={FACE.nx} map={bracketTex} metalness={0.9} roughness={0.3} />
      <Box size={[0.14, 0.02, 0.56]} position={[GPU_DIM.bracketX - 0.06, 1.24, 0.2]} color="#c3c8ce" metalness={0.95} roughness={0.28} />
      <Box size={[0.02, 0.12, 0.08]} position={[GPU_DIM.bracketX, -0.2, 0.02]} color="#c3c8ce" metalness={0.95} roughness={0.28} />
    </group>
  );
};
