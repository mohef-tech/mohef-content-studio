import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Box, PART_COLORS, V3, mergeBoxes, normalizeUVs } from './partsCommon';
import {
  cpuSubstrateTexture,
  ihsTextTexture,
  ledGradientTexture,
  ramHeatsinkTexture,
  ramPcbTexture,
} from './textures';

// ============================================================================
// PROSESOR (gaya AM5 40×40 mm): substrat PCB tipis + IHS metalik berlekuk
// Frame lokal: rebah di bidang XY, permukaan atas menghadap +Z, origin = tengah dasar substrat.
// ============================================================================
export const CPU_DIM = { size: 0.4, substrate: 0.014, ihsHalf: 0.17, ihsDepth: 0.026 } as const;

const buildIhsGeometry = () => {
  const h = CPU_DIM.ihsHalf;
  const d = 0.03;
  const nw = 0.034;
  const notches = [-0.085, 0.085];
  const s = new THREE.Shape();
  s.moveTo(-h, -h);
  for (const c of notches) {
    s.lineTo(c - nw, -h);
    s.lineTo(c - nw, -h + d);
    s.lineTo(c + nw, -h + d);
    s.lineTo(c + nw, -h);
  }
  s.lineTo(h, -h);
  for (const c of notches) {
    s.lineTo(h, c - nw);
    s.lineTo(h - d, c - nw);
    s.lineTo(h - d, c + nw);
    s.lineTo(h, c + nw);
  }
  s.lineTo(h, h);
  for (const c of [...notches].reverse()) {
    s.lineTo(c + nw, h);
    s.lineTo(c + nw, h - d);
    s.lineTo(c - nw, h - d);
    s.lineTo(c - nw, h);
  }
  s.lineTo(-h, h);
  for (const c of [...notches].reverse()) {
    s.lineTo(-h, c + nw);
    s.lineTo(-h + d, c + nw);
    s.lineTo(-h + d, c - nw);
    s.lineTo(-h, c - nw);
  }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: CPU_DIM.ihsDepth,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
  return normalizeUVs(g, -h - 0.004, h + 0.004, -h - 0.004, h + 0.004);
};

export const CpuChip: React.FC<{ position?: V3; rotation?: V3; scale?: number }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const ihsGeo = useMemo(buildIhsGeometry, []);
  const smd = useMemo(() => {
    const b: Array<{ size: V3; pos: V3 }> = [];
    // kapasitor SMD di celah lekukan IHS
    for (const c of [-0.085, 0.085]) {
      b.push({ size: [0.03, 0.012, 0.008], pos: [c, -0.152, CPU_DIM.substrate + 0.004] });
      b.push({ size: [0.03, 0.012, 0.008], pos: [c, 0.152, CPU_DIM.substrate + 0.004] });
      b.push({ size: [0.012, 0.03, 0.008], pos: [0.152, c, CPU_DIM.substrate + 0.004] });
      b.push({ size: [0.012, 0.03, 0.008], pos: [-0.152, c, CPU_DIM.substrate + 0.004] });
    }
    return mergeBoxes(b);
  }, []);
  const sub = cpuSubstrateTexture();
  const ihs = ihsTextTexture();
  const S = CPU_DIM.size;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Substrat PCB hijau */}
      <mesh position={[0, 0, CPU_DIM.substrate / 2]}>
        <boxGeometry args={[S, S, CPU_DIM.substrate]} />
        <meshStandardMaterial attach="material-0" color="#1f5e3a" roughness={0.6} />
        <meshStandardMaterial attach="material-1" color="#1f5e3a" roughness={0.6} />
        <meshStandardMaterial attach="material-2" color="#1f5e3a" roughness={0.6} />
        <meshStandardMaterial attach="material-3" color="#1f5e3a" roughness={0.6} />
        <meshStandardMaterial attach="material-4" map={sub} roughness={0.55} />
        <meshStandardMaterial attach="material-5" color="#c9a24a" metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh geometry={smd}>
        <meshStandardMaterial color="#8a6d3b" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Segitiga penanda pin-1 emas */}
      <mesh position={[-S / 2 + 0.03, -S / 2 + 0.03, CPU_DIM.substrate + 0.0005]}>
        <circleGeometry args={[0.018, 3]} />
        <meshStandardMaterial color={PART_COLORS.gold} metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Integrated Heat Spreader (IHS) bertekstur teks */}
      <mesh geometry={ihsGeo} position={[0, 0, CPU_DIM.substrate]}>
        <meshStandardMaterial color="#ffffff" map={ihs} metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
};

// ============================================================================
// RAM DDR5 DIMM (13.3 cm): PCB + pin emas, heatsink bertingkat bersudut, light bar LED
// Frame natural: panjang = X, tinggi = Y (pin di y=0), tebal = Z.
// ============================================================================
export const RAM_DIM = { length: 1.33, pcbH: 0.31, height: 0.46, thickness: 0.075 } as const;

/** Rotasi untuk menancapkan RAM ke slot DIMM motherboard (X→v, Y→normal board, Z→u). */
export const RAM_ON_BOARD_ROTATION: V3 = (() => {
  const m = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(1, 0, 0)
  );
  const e = new THREE.Euler().setFromRotationMatrix(m);
  return [e.x, e.y, e.z];
})();

const buildHeatsinkPlate = () => {
  const L = RAM_DIM.length / 2;
  const s = new THREE.Shape();
  s.moveTo(-L, 0.075);
  s.lineTo(L, 0.075);
  s.lineTo(L, 0.36);
  s.lineTo(0.28, 0.36);
  s.lineTo(0.2, 0.41);
  s.lineTo(-0.38, 0.41);
  s.lineTo(-0.46, 0.36);
  s.lineTo(-L, 0.36);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 1,
  });
  g.translate(0, 0, -0.006);
  return normalizeUVs(g, -L, L, 0.075, 0.41);
};

export const RamStick: React.FC<{
  position?: V3;
  rotation?: V3;
  /** Pergeseran gradasi LED (mis. frame * 0.01) */
  ledPhase?: number;
  ledIntensity?: number;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], ledPhase = 0, ledIntensity = 1.6 }) => {
  const plate = useMemo(buildHeatsinkPlate, []);
  const heat = ramHeatsinkTexture();
  const pcb = ramPcbTexture();
  const led = useMemo(() => {
    const t = ledGradientTexture().clone();
    t.wrapS = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, []);
  led.offset.x = ledPhase;
  const L = RAM_DIM.length;
  const zOff = RAM_DIM.thickness / 2 - 0.008;

  return (
    <group position={position} rotation={rotation}>
      {/* PCB dengan pin emas (tampak di bawah heatsink) */}
      <mesh position={[0, RAM_DIM.pcbH / 2, 0]}>
        <boxGeometry args={[L, RAM_DIM.pcbH, 0.012]} />
        <meshStandardMaterial attach="material-0" color="#14301f" />
        <meshStandardMaterial attach="material-1" color="#14301f" />
        <meshStandardMaterial attach="material-2" color="#14301f" />
        <meshStandardMaterial attach="material-3" color={PART_COLORS.gold} metalness={0.9} roughness={0.3} />
        <meshStandardMaterial attach="material-4" map={pcb} roughness={0.5} metalness={0.3} />
        <meshStandardMaterial attach="material-5" map={pcb} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Heatsink bersudut dua sisi */}
      <mesh geometry={plate} position={[0, 0, zOff]}>
        <meshStandardMaterial color="#ffffff" map={heat} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh geometry={plate} position={[0, 0, -zOff]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial color="#ffffff" map={heat} metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Tulang atas penghubung heatsink */}
      <Box size={[L - 0.04, 0.03, RAM_DIM.thickness - 0.01]} position={[0, 0.375, 0]} color="#1a1d22" metalness={0.6} roughness={0.4} />
      {/* Light bar LED + diffuser */}
      <mesh position={[0, 0.405, 0]}>
        <boxGeometry args={[L - 0.1, 0.04, RAM_DIM.thickness - 0.025]} />
        <meshStandardMaterial
          color="#ffffff"
          map={led}
          emissive="#ffffff"
          emissiveMap={led}
          emissiveIntensity={ledIntensity}
          toneMapped={false}
        />
      </mesh>
      <Box size={[L - 0.08, 0.05, RAM_DIM.thickness - 0.012]} position={[0, 0.41, 0]} color="#e2e8f0" transparent opacity={0.22} roughness={0.2} />
      {/* Klip ujung */}
      <Box size={[0.04, 0.3, RAM_DIM.thickness]} position={[L / 2 - 0.02, 0.22, 0]} color="#2a2f37" metalness={0.6} />
      <Box size={[0.04, 0.3, RAM_DIM.thickness]} position={[-L / 2 + 0.02, 0.22, 0]} color="#2a2f37" metalness={0.6} />
    </group>
  );
};
