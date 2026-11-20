import React, { useLayoutEffect } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { Easing } from 'remotion';
import { CpuChip, RAM_ON_BOARD_ROTATION, RamStick } from '../../04-ep2-rakit-pc/components/CpuRam';
import { GpuCard, GPU_ON_BOARD_ROTATION } from '../../04-ep2-rakit-pc/components/GpuCard';
import { MB_LAYOUT, Motherboard } from '../../04-ep2-rakit-pc/components/Motherboard';
import { NvmeSsd } from '../../04-ep2-rakit-pc/components/NvmeSsd';
import {
  Box,
  Cyl,
  PART_COLORS,
  StudioEnvironment,
  StudioLights,
  tubeFromPoints,
  type V3,
} from '../../04-ep2-rakit-pc/components/partsCommon';
import { CASE_DIM, CASE_LAYOUT, PcCase, Psu } from '../../04-ep2-rakit-pc/components/PsuAndCase';
import { EP3_COLORS } from '../constants';

/*
 * Workstation Episode 3: ruangan, meja, PC rakitan & stopkontak identik dengan
 * hero shot Scene 5 Episode 2. Satu-satunya perubahan: monitor digeser mendekati
 * PC (x -5.2 -> -4.1) agar keduanya muat berdampingan di frame vertikal.
 */

const DEG = Math.PI / 180;
const DESK_TOP_Y = 7.5;
const FLOOR_PLANK_INDICES = Array.from({ length: 18 }, (_, i) => i);

const PC_ROT_Y = -0.18;
const PC_CENTER_WORLD: V3 = [
  1.8 + CASE_DIM.halfZ * Math.sin(PC_ROT_Y),
  7.64,
  0.25 + CASE_DIM.halfZ * Math.cos(PC_ROT_Y),
];

const caseLocalToWorld = (local: V3): V3 => {
  const cosY = Math.cos(PC_ROT_Y);
  const sinY = Math.sin(PC_ROT_Y);
  return [
    PC_CENTER_WORLD[0] + local[0] * cosY + local[2] * sinY,
    PC_CENTER_WORLD[1] + local[1],
    PC_CENTER_WORLD[2] - local[0] * sinY + local[2] * cosY,
  ];
};

const STANDOFF_COORDS: ReadonlyArray<readonly [number, number]> = [
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

// Kabel daya AC: stopkontak dinding Episode 1 -> PSU (jalur sama dengan Ep2 Scene 5).
const OUTLET_POS: V3 = [-2.4, 4.2, -5.54];
const OUTLET_SOCKET_POS: V3 = [OUTLET_POS[0] + 0.32, OUTLET_POS[1] - 0.05, OUTLET_POS[2] + 0.2];
const PSU_SOCKET_WORLD = caseLocalToWorld([-2.24, 0.51, 0.15]);
const CABLE_POINTS: V3[] = [
  [OUTLET_SOCKET_POS[0], OUTLET_SOCKET_POS[1], OUTLET_SOCKET_POS[2] + 0.1],
  [-1.75, 3.3, -4.2],
  [-1.1, 5.4, -4.3],
  [-0.45, 6.45, -3.65],
  [0.2, 7.45, -2.55],
  PSU_SOCKET_WORLD,
];
const CABLE_CURVE = new THREE.CatmullRomCurve3(
  CABLE_POINTS.map((p) => new THREE.Vector3(...p)),
  false,
  'catmullrom',
  0.35
);
const POWER_CORD_GEO = tubeFromPoints(CABLE_POINTS, 0.085, 56, 10);

/** Ukuran & posisi layar di ruang lokal monitor (untuk konten layar dari scene). */
export const MONITOR_SCREEN = {
  width: 5.68,
  height: 3.05,
  position: [0, 2.7, -0.05] as V3,
} as const;

// ============================================================================
// Kamera orbit (dist/azimuth/elevasi) + setViewOffset untuk menaruh target di focusY
// ============================================================================
export interface CamPose {
  dist: number;
  az: number;
  el: number;
  fov: number;
  focusY: number;
  target: V3;
}

export type CamKeyframe = CamPose & { frame: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const resolveCameraPose = (keys: CamKeyframe[], frame: number): CamPose => {
  if (frame <= keys[0].frame) return keys[0];
  const last = keys[keys.length - 1];
  if (frame >= last.frame) return last;

  const idx = keys.findIndex((k, i) => frame >= k.frame && frame <= keys[i + 1].frame);
  const a = keys[idx];
  const b = keys[idx + 1];
  const t = Easing.inOut(Easing.cubic)((frame - a.frame) / Math.max(1, b.frame - a.frame));

  return {
    dist: lerp(a.dist, b.dist, t),
    az: lerp(a.az, b.az, t),
    el: lerp(a.el, b.el, t),
    fov: lerp(a.fov, b.fov, t),
    focusY: lerp(a.focusY, b.focusY, t),
    target: [
      lerp(a.target[0], b.target[0], t),
      lerp(a.target[1], b.target[1], t),
      lerp(a.target[2], b.target[2], t),
    ],
  };
};

const CameraController: React.FC<{ pose: CamPose; width: number; height: number }> = ({
  pose,
  width,
  height,
}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    const az = pose.az * DEG;
    const el = pose.el * DEG;
    const [tx, ty, tz] = pose.target;
    camera.fov = pose.fov;
    camera.aspect = width / height;
    camera.near = 0.35;
    camera.far = 220;
    camera.position.set(
      tx + pose.dist * Math.cos(el) * Math.sin(az),
      ty + pose.dist * Math.sin(el),
      tz + pose.dist * Math.cos(el) * Math.cos(az)
    );
    camera.up.set(0, 1, 0);
    camera.lookAt(tx, ty, tz);
    camera.setViewOffset(width, height, 0, height / 2 - pose.focusY, width, height);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  }, [camera, pose, width, height]);
  return null;
};

// ============================================================================
// Panggung Workstation
// ============================================================================
export const WorkstationStage: React.FC<{
  frame: number;
  pose: CamPose;
  width: number;
  height: number;
  /** Warna cahaya layar yang memantul ke meja (mengikuti isi layar). */
  screenGlowColor: string;
  screenGlowIntensity: number;
  /** Konten layar monitor, dirender di ruang lokal monitor. */
  children?: React.ReactNode;
  /** Objek tambahan di ruang lokal casing (origin = tengah dasar casing, +X = depan). */
  pcChildren?: React.ReactNode;
}> = ({ frame, pose, width, height, screenGlowColor, screenGlowIntensity, children, pcChildren }) => {
  // PC menyala stabil: kipas berputar tenang, LED RAM bernapas pelan
  const fanAngle = frame * 0.22;
  const psuFanAngle = frame * 0.16;
  const ledPhase = frame * 0.012;
  const pulsePos = CABLE_CURVE.getPointAt((frame % 48) / 48);

  return (
    <ThreeCanvas
      width={width}
      height={height}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      camera={{ fov: 38, near: 0.35, far: 220, position: [12, 14, 24] }}
    >
      <CameraController pose={pose} width={width} height={height} />
      <StudioEnvironment intensity={0.88} />
      <StudioLights keyIntensity={2.15} />
      <pointLight position={[2.2, 13.5, -1.5]} intensity={1.95} distance={20} color="#e0f2fe" />
      <pointLight position={[1.8, 9.6, 0.8]} intensity={1.8} distance={14} color="#38BDF8" />

      {/* Lantai kayu Episode 1 */}
      {FLOOR_PLANK_INDICES.map((i) => (
        <Box
          key={i}
          size={[36, 0.25, 1.5]}
          position={[2, -0.125, -5.0 + i * 1.5]}
          color={i % 2 === 0 ? EP3_COLORS.plankA : EP3_COLORS.plankB}
          roughness={0.78}
        />
      ))}

      {/* Dinding Episode 1 */}
      <Box size={[36, 24, 0.4]} position={[2, 12, -5.8]} color={EP3_COLORS.wall} roughness={0.84} />
      <Box size={[0.4, 24, 28]} position={[-12.6, 12, 6]} color="#233B57" roughness={0.84} />
      <Box size={[36, 0.65, 0.08]} position={[2, 0.325, -5.56]} color="#1B2E46" roughness={0.65} />

      {/* Stopkontak dinding Episode 1 (tercolok aman) */}
      <group position={OUTLET_POS}>
        <Box size={[1.55, 1.05, 0.14]} color="#E2E8F0" roughness={0.4} />
        <Box size={[0.5, 0.56, 0.06]} position={[-0.36, -0.04, 0.08]} color="#0F172A" roughness={0.55} />
        <Box size={[0.5, 0.56, 0.06]} position={[0.32, -0.04, 0.08]} color="#0F172A" roughness={0.55} />
        <Box
          size={[0.32, 0.08, 0.04]}
          position={[0, 0.35, 0.08]}
          color={EP3_COLORS.ground}
          emissive={EP3_COLORS.ground}
          emissiveIntensity={1.6}
        />
      </group>
      <Box size={[0.38, 0.42, 0.26]} position={OUTLET_SOCKET_POS} color="#16191E" roughness={0.42} />

      {/* Meja kerja */}
      <group position={[0, 0, -1.2]}>
        <Box size={[16.5, 0.38, 7.6]} position={[0, DESK_TOP_Y - 0.19, 0]} color="#B7865A" roughness={0.65} />
        <Box size={[15.4, 0.26, 6.4]} position={[0, DESK_TOP_Y - 0.5, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        <Box size={[0.48, 7.12, 5.8]} position={[-7.55, 3.56, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        <Box size={[0.48, 7.12, 5.8]} position={[7.55, 3.56, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        <Box size={[11.2, 0.42, 1.1]} position={[0, 6.45, -2.75]} color="#0F172A" metalness={0.5} roughness={0.5} />

        {/* Periferal + monitor (sisi kiri, berdampingan dengan PC) */}
        <Box size={[4.6, 0.04, 3.2]} position={[-4.3, DESK_TOP_Y + 0.02, 0.9]} color="#111827" roughness={0.9} />
        <Box size={[2.6, 0.1, 1.0]} position={[-4.6, DESK_TOP_Y + 0.09, 1.05]} color="#1F2937" roughness={0.55} />
        <Box size={[0.55, 0.12, 0.92]} position={[-2.6, DESK_TOP_Y + 0.09, 1.05]} color="#1F2937" roughness={0.45} />
        <group position={[-4.1, DESK_TOP_Y, -2.0]} rotation={[0, 0.08, 0]}>
          <Box size={[1.7, 0.1, 1.3]} position={[0, 0.05, 0]} color="#1E293B" metalness={0.6} roughness={0.4} />
          <Box size={[0.24, 1.8, 0.22]} position={[0, 0.95, -0.32]} color="#1E293B" metalness={0.6} roughness={0.4} />
          <Box size={[5.8, 3.25, 0.18]} position={[0, 2.7, -0.15]} color="#0F172A" roughness={0.4} />
          {children}
          <pointLight
            position={[0, 2.7, 1.8]}
            intensity={screenGlowIntensity}
            distance={9}
            color={screenGlowColor}
          />
        </group>

        {/* Deskmat PC */}
        <Box size={[7.6, 0.04, 6.2]} position={[2.1, DESK_TOP_Y + 0.02, -0.35]} color="#0F172A" roughness={0.86} />
      </group>

      {/* Kabel daya AC + denyut arus aman */}
      <mesh geometry={POWER_CORD_GEO}>
        <meshStandardMaterial color="#14181F" roughness={0.6} metalness={0.2} />
      </mesh>
      <Box size={[0.3, 0.22, 0.3]} position={PSU_SOCKET_WORLD} color="#111419" roughness={0.48} />
      <mesh position={[pulsePos.x, pulsePos.y, pulsePos.z]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={EP3_COLORS.ground}
          emissive={EP3_COLORS.ground}
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>

      {/* Unit PC rakitan Episode 2 (menyala) */}
      <group position={PC_CENTER_WORLD} rotation={[0, PC_ROT_Y, 0]}>
        <PcCase
          glassOpacity={1}
          fanAngle={fanAngle}
          intakeColor={EP3_COLORS.cold}
          exhaustColor={EP3_COLORS.warm}
          ringIntensity={1.65}
        >
          <group position={CASE_LAYOUT.mbOrigin}>
            {STANDOFF_COORDS.map(([u, v], i) => (
              <Cyl
                key={i}
                radius={0.032}
                height={0.04}
                axis="z"
                position={[u, v, -0.025]}
                color={PART_COLORS.gold}
                metalness={0.92}
                roughness={0.28}
              />
            ))}
            <Motherboard />
            <group position={[MB_LAYOUT.socket[0], MB_LAYOUT.socket[1], MB_LAYOUT.frontZ + 0.018]}>
              <CpuChip />
            </group>
            <group position={[MB_LAYOUT.m2.centerU, MB_LAYOUT.m2.v, MB_LAYOUT.frontZ + 0.018]}>
              <NvmeSsd />
            </group>
            <group position={[MB_LAYOUT.dimmU[1], MB_LAYOUT.dimmV, MB_LAYOUT.frontZ + 0.05]}>
              <RamStick rotation={RAM_ON_BOARD_ROTATION} ledPhase={ledPhase} ledIntensity={1.65} />
            </group>
            <group position={[MB_LAYOUT.dimmU[3], MB_LAYOUT.dimmV, MB_LAYOUT.frontZ + 0.05]}>
              <RamStick rotation={RAM_ON_BOARD_ROTATION} ledPhase={ledPhase + 0.32} ledIntensity={1.65} />
            </group>
            <group position={[-1.23, MB_LAYOUT.pcie1V, 0.14]}>
              <GpuCard
                rotation={GPU_ON_BOARD_ROTATION}
                fanAngle={fanAngle}
                ledColor={EP3_COLORS.data}
                ledIntensity={1.65}
              />
            </group>
          </group>
          <group position={CASE_LAYOUT.psuCenter}>
            <Psu fanAngle={psuFanAngle} />
          </group>
        </PcCase>
        {pcChildren}
      </group>
    </ThreeCanvas>
  );
};
