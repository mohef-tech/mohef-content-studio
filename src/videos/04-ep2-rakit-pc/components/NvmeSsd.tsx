import React from 'react';
import { Box, Cyl, Decal, PART_COLORS, V3 } from './partsCommon';
import { ssdLabelTexture, ssdPcbTexture } from './textures';

/**
 * SSD NVMe M.2 2280 (22 × 80 mm → 0.22 × 0.8 unit).
 * Frame natural: panjang = X (gold finger di x = -0.4), lebar = Y, rebah menghadap +Z.
 * Origin = tengah dasar PCB.
 */
export const SSD_DIM = { length: 0.8, width: 0.22, pcb: 0.008 } as const;

export const NvmeSsd: React.FC<{ position?: V3; rotation?: V3; scale?: number }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const pcb = ssdPcbTexture();
  const label = ssdLabelTexture();
  const top = SSD_DIM.pcb;
  const chipH = 0.012;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* PCB hitam dengan gold finger kunci-M */}
      <mesh position={[0, 0, top / 2]}>
        <boxGeometry args={[SSD_DIM.length, SSD_DIM.width, top]} />
        <meshStandardMaterial attach="material-0" color="#101317" />
        <meshStandardMaterial attach="material-1" color={PART_COLORS.gold} metalness={0.9} roughness={0.3} />
        <meshStandardMaterial attach="material-2" color="#101317" />
        <meshStandardMaterial attach="material-3" color="#101317" />
        <meshStandardMaterial attach="material-4" map={pcb} roughness={0.55} metalness={0.2} />
        <meshStandardMaterial attach="material-5" color="#0c0e11" />
      </mesh>
      {/* Takik kunci M */}
      <Box size={[0.03, 0.012, top + 0.002]} position={[-0.39, -0.045, top / 2]} color="#05070a" />

      {/* Kontroler dengan tutup silver (nickel heatspreader) */}
      <group position={[-0.235, 0, top]}>
        <Box size={[0.11, 0.11, chipH]} position={[0, 0, chipH / 2]} color="#1a1d22" />
        <Box size={[0.096, 0.096, 0.004]} position={[0, 0, chipH + 0.002]} color={PART_COLORS.metalSilver} metalness={1} roughness={0.2} />
      </group>
      {/* Chip DRAM cache */}
      <Box size={[0.07, 0.09, 0.01]} position={[-0.115, 0, top + 0.005]} color="#0c0e11" roughness={0.35} />
      {/* NAND flash hitam ×2 */}
      <Box size={[0.15, 0.15, chipH]} position={[0.04, 0, top + chipH / 2]} color="#0c0e11" roughness={0.3} metalness={0.2} />
      <Box size={[0.15, 0.15, chipH]} position={[0.23, 0, top + chipH / 2]} color="#0c0e11" roughness={0.3} metalness={0.2} />
      {/* Kapasitor & resistor kecil */}
      {[-0.32, -0.3, -0.28, -0.155, -0.155].map((x, i) => (
        <Box key={i} size={[0.012, 0.022, 0.008]} position={[x, i < 3 ? 0.07 : i === 3 ? -0.08 : 0.08, top + 0.004]} color="#8a6d3b" metalness={0.5} />
      ))}
      {/* Stiker label melintang di atas NAND (chip hitam tetap terlihat di tepinya) */}
      <Decal size={[0.36, 0.1]} position={[0.14, 0, top + chipH + 0.0012]} map={label} roughness={0.45} />
      {/* Sekrup mounting di ujung setengah lingkaran */}
      <Cyl radius={0.026} height={0.012} axis="z" position={[0.4, 0, top + 0.006]} color="#cbd5e1" metalness={0.95} roughness={0.25} />
    </group>
  );
};
