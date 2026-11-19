import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  AudioStage,
  BottomSubtitleBar,
  CameraRig,
  CustomSVGIcon,
  FlyText,
  ProceduralBackground,
  SeamlessSceneShell,
  SfxCue,
} from '../../lib/motion-craft';
import {
  EP2_BGM,
  EP2_COLORS,
  EP2_DURATIONS,
  EP2_FONTS,
  EP2_HEIGHT,
  EP2_SAFE,
  EP2_STYLE_PRESET,
  EP2_WIDTH,
  SCENE5_WORDS,
} from './constants';
import { CpuChip, RAM_ON_BOARD_ROTATION, RamStick } from './components/CpuRam';
import { GpuCard, GPU_ON_BOARD_ROTATION } from './components/GpuCard';
import { MB_LAYOUT, Motherboard } from './components/Motherboard';
import { NvmeSsd } from './components/NvmeSsd';
import {
  Box,
  Cyl,
  PART_COLORS,
  StudioEnvironment,
  StudioLights,
  tubeFromPoints,
  type V3,
} from './components/partsCommon';
import { CASE_DIM, CASE_LAYOUT, PcCase, Psu } from './components/PsuAndCase';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const DEG = Math.PI / 180;
const FLOOR_PLANK_INDICES = Array.from({ length: 18 }, (_, i) => i);

/** Posisi & rotasi unit PC di atas deskmat (menyambung presisi dari akhir Scene 4). */
const PC_ROT_Y_HERO = -0.18;
const PC_CENTER_WORLD: V3 = [
  1.8 + CASE_DIM.halfZ * Math.sin(PC_ROT_Y_HERO),
  7.64,
  0.25 + CASE_DIM.halfZ * Math.cos(PC_ROT_Y_HERO),
];

const caseLocalToWorld = (local: V3, rotY: number): V3 => {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
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

// ============================================================================
// Layar Monitor Bersih (Hardware QC Passed & Ready for Episode 3 OS Install)
// ============================================================================
let readyMonitorTexCache: THREE.CanvasTexture | null = null;

const getReadyMonitorTexture = (): THREE.CanvasTexture => {
  if (readyMonitorTexCache) return readyMonitorTexCache;

  const W = 1280;
  const H = 720;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#040B16');
  grad.addColorStop(0.55, '#09182D');
  grad.addColorStop(1, '#061423');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle ambient glow circles
  const glow1 = ctx.createRadialGradient(340, 260, 20, 340, 260, 420);
  glow1.addColorStop(0, 'rgba(0, 229, 255, 0.22)');
  glow1.addColorStop(1, 'rgba(0, 229, 255, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(960, 480, 20, 960, 480, 400);
  glow2.addColorStop(0, 'rgba(16, 185, 129, 0.20)');
  glow2.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Center card on monitor
  ctx.fillStyle = 'rgba(10, 20, 36, 0.86)';
  ctx.fillRect(160, 150, W - 320, H - 300);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 4;
  ctx.strokeRect(160, 150, W - 320, H - 300);

  // Top status pill
  ctx.fillStyle = '#10B981';
  ctx.fillRect(210, 198, 340, 46);
  ctx.fillStyle = '#030712';
  ctx.font = 'bold 22px Menlo, Consolas, monospace';
  ctx.fillText('✓ HARDWARE QC PASSED', 234, 229);

  // Main title
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 54px Inter, Arial, sans-serif';
  ctx.fillText('WORKSTATION READY', 210, 326);

  // Sub-details
  ctx.fillStyle = '#7DD3FC';
  ctx.font = '600 26px Menlo, Consolas, monospace';
  ctx.fillText('CPU 62°C  •  RAM 32GB OK  •  +12V: 12.02V', 210, 386);

  // Footer strip
  ctx.fillStyle = 'rgba(0, 229, 255, 0.14)';
  ctx.fillRect(210, 438, W - 420, 74);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(210, 438, W - 420, 74);

  ctx.fillStyle = '#00E5FF';
  ctx.font = 'bold 24px Menlo, Consolas, monospace';
  ctx.fillText('NEXT: EPISODE 03 — INSTALASI SISTEM & APLIKASI', 236, 484);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  readyMonitorTexCache = tex;
  return tex;
};

const ReadyMonitorScreen: React.FC = () => {
  const tex = useMemo(() => getReadyMonitorTexture(), []);
  return (
    <mesh position={[0, 2.7, -0.05]}>
      <planeGeometry args={[5.68, 3.05]} />
      <meshStandardMaterial
        color="#ffffff"
        map={tex}
        emissive="#ffffff"
        emissiveMap={tex}
        emissiveIntensity={0.68}
        roughness={0.22}
        metalness={0.05}
      />
    </mesh>
  );
};

// ============================================================================
// Kamera 3D Penutup: Smooth Pull-Back & Subtle Orbit ke Hero Shot Lega
// ============================================================================
interface CamPose {
  dist: number;
  az: number;
  el: number;
  fov: number;
  focusY: number;
  target: V3;
}

interface CamKeyframe extends CamPose {
  frame: number;
}

const CAM_KEYFRAMES: CamKeyframe[] = [
  // Menyambung mulus dari pose akhir Scene 4
  { frame: 0, dist: 16.9, az: 27.5, el: 19.5, fov: 38, focusY: 980, target: [1.45, 9.65, 0.75] },
  // Pull-back halus menampakkan PC, monitor bersih, meja & stopkontak Ep.1 di zona bawah-tengah
  { frame: 76, dist: 22.8, az: 30.0, el: 21.0, fov: 38, focusY: 1205, target: [-0.45, 9.15, -0.35] },
  // Orbit hero shot lembut selama Teaser & CTA
  { frame: 184, dist: 24.0, az: 33.2, el: 22.0, fov: 38, focusY: 1225, target: [-0.65, 9.05, -0.45] },
  {
    frame: EP2_DURATIONS.scene5,
    dist: 24.8,
    az: 36.0,
    el: 22.8,
    fov: 38,
    focusY: 1235,
    target: [-0.75, 9.0, -0.5],
  },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const resolveClosingCameraPose = (frame: number): CamPose => {
  if (frame <= CAM_KEYFRAMES[0].frame) return CAM_KEYFRAMES[0];
  const last = CAM_KEYFRAMES[CAM_KEYFRAMES.length - 1];
  if (frame >= last.frame) return last;

  let idx = 0;
  for (let i = 0; i < CAM_KEYFRAMES.length - 1; i++) {
    if (frame >= CAM_KEYFRAMES[i].frame && frame <= CAM_KEYFRAMES[i + 1].frame) {
      idx = i;
      break;
    }
  }
  const a = CAM_KEYFRAMES[idx];
  const b = CAM_KEYFRAMES[idx + 1];
  const rawT = (frame - a.frame) / Math.max(1, b.frame - a.frame);
  const t = Easing.inOut(Easing.cubic)(rawT);

  return {
    dist: lerp(a.dist, b.dist, t),
    az: lerp(a.az, b.az, t) + Math.sin(frame * 0.016) * 0.12,
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

const SceneCameraController: React.FC<{
  pose: CamPose;
  width: number;
  height: number;
}> = ({ pose, width, height }) => {
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
// Panggung 3D Penutup: Clean Hero Shot Menyambung dari Scene 4
// ============================================================================
const ClosingHeroStage3D: React.FC<{ frame: number }> = ({ frame }) => {
  const pose = useMemo(() => resolveClosingCameraPose(frame), [frame]);

  // Putaran kipas & LED tenang stabil (menunjukkan PC menyala sehat & siap kerja)
  const fanAngle = frame * 0.22;
  const psuFanAngle = frame * 0.16;
  const ledPhase = frame * 0.012;

  // Kabel daya AC terhubung rapi dari stopkontak dinding Ep.1 ke PSU
  const deskTopY = 7.5;
  const outletPos: V3 = [-2.4, 4.2, -5.54];
  const outletSocketPos: V3 = [outletPos[0] + 0.32, outletPos[1] - 0.05, outletPos[2] + 0.2];
  const psuSocketWorld = useMemo(() => caseLocalToWorld([-2.24, 0.51, 0.15], PC_ROT_Y_HERO), []);

  const cablePoints: V3[] = useMemo(
    () => [
      [outletSocketPos[0], outletSocketPos[1], outletSocketPos[2] + 0.1],
      [-1.75, 3.3, -4.2],
      [-1.1, 5.4, -4.3],
      [-0.45, 6.45, -3.65],
      [0.2, 7.45, -2.55],
      psuSocketWorld,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [psuSocketWorld[0], psuSocketWorld[1], psuSocketWorld[2]]
  );

  const cableCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        cablePoints.map((p) => new THREE.Vector3(...p)),
        false,
        'catmullrom',
        0.35
      ),
    [cablePoints]
  );

  const powerCordGeo = useMemo(() => tubeFromPoints(cablePoints, 0.085, 56, 10), [cablePoints]);

  useEffect(() => {
    return () => {
      powerCordGeo.dispose();
    };
  }, [powerCordGeo]);

  const pulseT = (frame % 48) / 48;
  const pulsePos = cableCurve.getPointAt(pulseT);

  return (
    <ThreeCanvas
      width={EP2_WIDTH}
      height={EP2_HEIGHT}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      camera={{ fov: 38, near: 0.35, far: 220, position: [12, 14, 24] }}
    >
      <SceneCameraController pose={pose} width={EP2_WIDTH} height={EP2_HEIGHT} />
      <StudioEnvironment intensity={0.88} />
      <StudioLights keyIntensity={2.15} />
      <pointLight position={[2.2, 13.5, -1.5]} intensity={1.95} distance={20} color="#e0f2fe" />
      <pointLight position={[1.8, 9.6, 0.8]} intensity={1.8} distance={14} color="#38BDF8" />
      <pointLight position={[-5.2, 10.4, -0.5]} intensity={1.2} distance={12} color="#6EE7B7" />

      {/* ===== LANTAI KAYU PAPAN KONTINUITAS EPISODE 1 ===== */}
      <group>
        {FLOOR_PLANK_INDICES.map((i) => (
          <Box
            key={i}
            size={[36, 0.25, 1.5]}
            position={[2, -0.125, -5.0 + i * 1.5]}
            color={i % 2 === 0 ? EP2_COLORS.plankA : EP2_COLORS.plankB}
            roughness={0.78}
          />
        ))}
      </group>

      {/* ===== SUDUT DINDING BERGAYA EPISODE 1 (#2B4766) ===== */}
      <Box size={[36, 24, 0.4]} position={[2, 12, -5.8]} color={EP2_COLORS.wall} roughness={0.84} />
      <Box size={[0.4, 24, 28]} position={[-12.6, 12, 6]} color="#233B57" roughness={0.84} />
      <Box size={[36, 0.65, 0.08]} position={[2, 0.325, -5.56]} color="#1B2E46" roughness={0.65} />
      <Box size={[0.08, 0.65, 28]} position={[-12.36, 0.325, 6]} color="#1B2E46" roughness={0.65} />

      <group position={[-12.35, 12.2, 0.6]}>
        <Box size={[0.12, 7.2, 8.2]} color="#16283D" roughness={0.5} />
        <mesh position={[0.08, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[7.6, 6.6]} />
          <meshBasicMaterial color="#7DD3FC" transparent opacity={0.18} />
        </mesh>
      </group>

      {/* ===== TITIK STOPKONTAK DINDING EPISODE 1 (TERCOLOK AMAN) ===== */}
      <group position={outletPos}>
        <Box size={[1.55, 1.05, 0.14]} color="#E2E8F0" roughness={0.4} />
        <Box size={[0.5, 0.56, 0.06]} position={[-0.36, -0.04, 0.08]} color="#0F172A" roughness={0.55} />
        <Box size={[0.5, 0.56, 0.06]} position={[0.32, -0.04, 0.08]} color="#0F172A" roughness={0.55} />
        <Box
          size={[0.32, 0.08, 0.04]}
          position={[0, 0.35, 0.08]}
          color={EP2_COLORS.ground}
          emissive={EP2_COLORS.ground}
          emissiveIntensity={1.6}
        />
        <mesh position={[0.32, -0.05, 0.115]}>
          <ringGeometry args={[0.38, 0.48, 32]} />
          <meshBasicMaterial color={EP2_COLORS.ground} transparent opacity={0.85} />
        </mesh>
      </group>
      <Box size={[0.38, 0.42, 0.26]} position={outletSocketPos} color="#16191E" roughness={0.42} />

      {/* ===== MEJA KERJA WORKSTATION ===== */}
      <group position={[0.0, 0, -1.2]}>
        <Box size={[16.5, 0.38, 7.6]} position={[0, deskTopY - 0.19, 0]} color="#B7865A" roughness={0.65} />
        <Box size={[15.4, 0.26, 6.4]} position={[0, deskTopY - 0.5, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        <Box size={[0.48, 7.12, 5.8]} position={[-7.55, 3.56, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        <Box size={[0.48, 7.12, 5.8]} position={[7.55, 3.56, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        <Box size={[0.62, 0.16, 6.2]} position={[-7.55, 0.08, 0]} color="#0F172A" roughness={0.7} />
        <Box size={[0.62, 0.16, 6.2]} position={[7.55, 0.08, 0]} color="#0F172A" roughness={0.7} />

        {/* Under-Desk Cable Tray */}
        <Box size={[11.2, 0.42, 1.1]} position={[0, 6.45, -2.75]} color="#0F172A" metalness={0.5} roughness={0.5} />
        <Box
          size={[10.4, 0.07, 0.08]}
          position={[0, 6.45, -2.18]}
          color={EP2_COLORS.ground}
          emissive={EP2_COLORS.ground}
          emissiveIntensity={1.1}
        />

        {/* Periferal & Monitor Bersih di Sisi Kiri Meja */}
        <Box size={[5.2, 0.04, 3.2]} position={[-5.2, deskTopY + 0.02, 0.9]} color="#111827" roughness={0.9} />
        <Box size={[2.6, 0.1, 1.0]} position={[-5.5, deskTopY + 0.09, 1.05]} color="#1F2937" roughness={0.55} />
        <Box size={[0.55, 0.12, 0.92]} position={[-3.5, deskTopY + 0.09, 1.05]} color="#1F2937" roughness={0.45} />
        <group position={[-5.2, deskTopY, -2.0]} rotation={[0, 0.22, 0]}>
          <Box size={[1.7, 0.1, 1.3]} position={[0, 0.05, 0]} color="#1E293B" metalness={0.6} roughness={0.4} />
          <Box size={[0.24, 1.8, 0.22]} position={[0, 0.95, -0.32]} color="#1E293B" metalness={0.6} roughness={0.4} />
          <Box size={[5.8, 3.25, 0.18]} position={[0, 2.7, -0.15]} color="#0F172A" roughness={0.4} />
          <ReadyMonitorScreen />
        </group>

        {/* Deskmat Perakitan Sisi Kanan Meja */}
        <Box size={[7.6, 0.04, 6.2]} position={[2.1, deskTopY + 0.02, -0.35]} color="#0F172A" roughness={0.86} />
        <Box
          size={[7.4, 0.01, 0.04]}
          position={[2.1, deskTopY + 0.042, 2.7]}
          color={EP2_COLORS.data}
          emissive={EP2_COLORS.data}
          emissiveIntensity={0.65}
        />
      </group>

      {/* ===== KABEL DAYA AC STOPKONTAK -> PSU ===== */}
      <mesh geometry={powerCordGeo}>
        <meshStandardMaterial color="#14181F" roughness={0.6} metalness={0.2} />
      </mesh>
      <Box size={[0.3, 0.22, 0.3]} position={psuSocketWorld} color="#111419" roughness={0.48} />
      <mesh position={[pulsePos.x, pulsePos.y, pulsePos.z]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={EP2_COLORS.ground}
          emissive={EP2_COLORS.ground}
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>

      {/* ===== UNIT PC RAKITAN BERSIH & STABIL DI ATAS DESKMAT ===== */}
      <group position={PC_CENTER_WORLD} rotation={[0, PC_ROT_Y_HERO, 0]}>
        <PcCase
          glassOpacity={1}
          fanAngle={fanAngle}
          intakeColor={EP2_COLORS.cold}
          exhaustColor={EP2_COLORS.warm}
          ringIntensity={1.65}
        >
          {/* 9 Standoff Kuningan */}
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
          </group>

          {/* Motherboard + CPU + NVMe + RAM + GPU */}
          <group position={CASE_LAYOUT.mbOrigin}>
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
              <RamStick
                rotation={RAM_ON_BOARD_ROTATION}
                ledPhase={ledPhase + 0.32}
                ledIntensity={1.65}
              />
            </group>
            <group position={[-1.23, MB_LAYOUT.pcie1V, 0.14]}>
              <GpuCard
                rotation={GPU_ON_BOARD_ROTATION}
                fanAngle={fanAngle}
                ledColor={EP2_COLORS.data}
                ledIntensity={1.65}
              />
            </group>
          </group>

          {/* PSU 750W Modular */}
          <group position={CASE_LAYOUT.psuCenter}>
            <Psu fanAngle={psuFanAngle} />
          </group>
        </PcCase>
      </group>
    </ThreeCanvas>
  );
};

// ============================================================================
// Scene 5 — Penutup, Jembatan ke Episode 3 & Kartu Kontak Bisnis
// ============================================================================
export const Scene5ClosingCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sinkron dengan ep2-scene5-words.json:
  // - 0..63 (0.0s..2.11s): "PC siap kerja di meja yang listriknya aman."
  // - 85..166 (2.84s..5.54s): "Episode 3, instal sistem dan aplikasi kerja."
  // - 188..243 (6.28s..8.11s): "Konsultasi spek gratis di Mohef Tech!"
  const TEASER_IN_FRAME = 74;
  const CTA_IN_FRAME = 182;

  // Kartu Status Pembuka Ringkas (f 8..74)
  const introEnter = spring({
    frame: frame - 6,
    fps,
    config: { damping: 18, stiffness: 190, mass: 0.7 },
  });
  const introExit = interpolate(frame, [66, 80], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const introOpacity = introEnter * (1 - introExit);

  // Tahap 1: Kartu Roadmap / Teaser Episode 3 (f 74..182)
  const teaserEnter = spring({
    frame: frame - TEASER_IN_FRAME,
    fps,
    config: { damping: 16, stiffness: 175, mass: 0.78 },
  });
  const teaserExit = interpolate(frame, [176, 192], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const teaserOpacity = teaserEnter * (1 - teaserExit);
  const teaserTranslateX = -teaserExit * 960;
  const teaserTranslateY = (1 - teaserEnter) * 32;
  const teaserScale = 0.94 + teaserEnter * 0.06 - teaserExit * 0.04;

  // Sorotan halus kartu Next Episode 3 saat narasi menyebut Episode 3 (f 85..168)
  const ep3Highlight = interpolate(frame, [85, 102], [0, 1], clamp);

  // Tahap 2: Kartu Penawaran & Kontak CTA Utama (f 182..295)
  const ctaEnter = spring({
    frame: frame - CTA_IN_FRAME,
    fps,
    config: { damping: 15, stiffness: 165, mass: 0.8 },
  });
  const ctaTranslateX = (1 - ctaEnter) * 140;
  const ctaTranslateY = (1 - ctaEnter) * 28;
  const ctaScale = 0.93 + ctaEnter * 0.07;

  // Denyut halus pada badge WhatsApp agar fokus mata tertuju ke nomor kontak
  const waPulse = frame >= CTA_IN_FRAME ? 1 + 0.014 * Math.sin((frame - CTA_IN_FRAME) * 0.16) : 1;

  const stageStatusLabel =
    frame < TEASER_IN_FRAME
      ? 'UNIT SELESAI QC • MEJA & LISTRIK AMAN EPISODE 01'
      : frame < CTA_IN_FRAME
      ? 'LANJUT KE EPISODE 03 • INSTALASI SISTEM & APLIKASI KERJA'
      : 'SIAP RAKIT & KIRIM • HUBUNGI MOHAMMED | MOHEF TECH';

  const stageStatusColor =
    frame < TEASER_IN_FRAME
      ? EP2_COLORS.ground
      : frame < CTA_IN_FRAME
      ? EP2_COLORS.data
      : EP2_COLORS.power;

  return (
    <AbsoluteFill style={{ backgroundColor: EP2_COLORS.bg, fontFamily: EP2_FONTS.body }}>
      {/* Audio VO Scene 5 (existing edge-tts) & BGM Auto-Ducking */}
      <Audio src={staticFile('audio/vo/ep2-scene5.mp3')} volume={1.0} />
      <AudioStage
        musicSrc={EP2_BGM}
        words={SCENE5_WORDS}
        bedSrc=""
        sfxTrackSrc=""
        baseMusicVolume={0.12}
      />

      {/* SFX Penutup & Transisi Kartu (dari KATALOG-AI.md) */}
      <SfxCue frame={TEASER_IN_FRAME} sfx="transition-whoosh-soft" volume={0.5} />
      <SfxCue frame={CTA_IN_FRAME} sfx="confirm-chime" volume={0.62} />

      {/* Latar Studio */}
      <ProceduralBackground stylePreset={EP2_STYLE_PRESET} driftSpeed={0.65} />

      {/* Panggung 3D Penutup (Clean Hero Shot Menyambung dari Scene 4) */}
      <AbsoluteFill>
        <ClosingHeroStage3D frame={frame} />
      </AbsoluteFill>

      {/* Gradien lembut agar area kartu atas & subtitle bawah tetap kontras */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(7, 11, 18, 0.90) 0%, rgba(7, 11, 18, 0.56) 34%, rgba(7, 11, 18, 0.08) 54%, rgba(7, 11, 18, 0.78) 100%)',
        }}
      />

      {/* Lapisan 2D Motion-Craft dalam Safe Zone (X: 90..960, Y: 56..1620) */}
      <SeamlessSceneShell
        startFrame={0}
        endFrame={EP2_DURATIONS.scene5}
        enterMode="none"
        exitMode="none"
        background="transparent"
        enableTransitionSfx={false}
      >
        <CameraRig
          durationInFrames={EP2_DURATIONS.scene5}
          mode="calm-steady"
          stylePreset={EP2_STYLE_PRESET}
          enableVelocityBlur={false}
          enableRackFocusSpotlight={false}
        >
          {/* Header Brand Bar (Y: 56..114) */}
          <div
            style={{
              position: 'absolute',
              top: 56,
              left: EP2_SAFE.left,
              width: EP2_SAFE.contentWidth,
              height: 58,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 16px',
                borderRadius: 12,
                backgroundColor: 'rgba(15, 22, 34, 0.9)',
                border: `1px solid ${EP2_COLORS.border}`,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  backgroundColor: EP2_COLORS.ground,
                  boxShadow: `0 0 10px ${EP2_COLORS.ground}`,
                }}
              />
              <span
                style={{
                  fontFamily: EP2_FONTS.heading,
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  color: EP2_COLORS.ink,
                }}
              >
                MOHAMMED <span style={{ color: EP2_COLORS.muted }}>|</span>{' '}
                <span style={{ color: EP2_COLORS.power }}>MOHEF TECH</span>
              </span>
            </div>

            <div
              style={{
                padding: '9px 15px',
                borderRadius: 12,
                backgroundColor: 'rgba(15, 22, 34, 0.9)',
                border: `1px solid ${EP2_COLORS.ground}55`,
                fontFamily: EP2_FONTS.mono,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: EP2_COLORS.ground,
              }}
            >
              EP 02 • SCENE 05
            </div>
          </div>

          {/* Judul Penutup (Y: 132..242) */}
          <div
            style={{
              position: 'absolute',
              top: 132,
              left: EP2_SAFE.left,
              width: EP2_SAFE.contentWidth,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CustomSVGIcon
                name="check-badge"
                size={24}
                color={EP2_COLORS.ink}
                accentColor={EP2_COLORS.ground}
                startFrame={2}
              />
              <span
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1.0,
                  color: stageStatusColor,
                }}
              >
                {stageStatusLabel}
              </span>
            </div>

            <FlyText
              text="PC SIAP KERJA & TERUJI"
              start={4}
              stagger={1.0}
              dur={12}
              size={50}
              weight={900}
              family={EP2_FONTS.heading}
              color={EP2_COLORS.ink}
              flyingColor={EP2_COLORS.ground}
              letterSpacing={-0.8}
            />
          </div>

          {/* Kartu Pembuka Ringkas (f 6..80) agar transisi dari Scene 4 terasa penuh */}
          {introOpacity > 0.01 && (
            <div
              style={{
                position: 'absolute',
                top: 274,
                left: EP2_SAFE.left,
                width: EP2_SAFE.contentWidth,
                padding: '18px 22px',
                borderRadius: 20,
                backgroundColor: 'rgba(12, 22, 38, 0.9)',
                border: `1.5px solid ${EP2_COLORS.ground}77`,
                boxShadow: '0 18px 40px rgba(0, 0, 0, 0.45)',
                boxSizing: 'border-box',
                opacity: introOpacity,
                transform: `translate3d(0, ${((1 - introEnter) * 18 - introExit * 24).toFixed(1)}px, 0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span
                  style={{
                    fontFamily: EP2_FONTS.mono,
                    fontSize: 14,
                    fontWeight: 800,
                    color: EP2_COLORS.ground,
                    letterSpacing: 0.8,
                  }}
                >
                  ✓ HARDWARE &amp; KELISTRIKAN TERVERIFIKASI
                </span>
                <span
                  style={{
                    fontFamily: EP2_FONTS.heading,
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#FFFFFF',
                  }}
                >
                  Meja Kerja Aman Episode 1 • PC Lolos QC 3 Tahap
                </span>
              </div>
              <div
                style={{
                  padding: '8px 14px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(16, 185, 129, 0.16)',
                  border: `1.5px solid ${EP2_COLORS.ground}`,
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 16,
                  fontWeight: 900,
                  color: '#6EE7B7',
                  whiteSpace: 'nowrap',
                }}
              >
                100% READY
              </div>
            </div>
          )}

          {/* Tahap 1 — Kartu Jembatan Teaser ke Episode 3 (Y: 268..636) */}
          {teaserOpacity > 0.01 && (
            <div
              style={{
                position: 'absolute',
                top: 268,
                left: EP2_SAFE.left,
                width: EP2_SAFE.contentWidth,
                padding: '20px 24px',
                borderRadius: 22,
                background: 'linear-gradient(155deg, rgba(12, 22, 38, 0.96) 0%, rgba(15, 29, 50, 0.96) 100%)',
                border: `2px solid ${ep3Highlight > 0.5 ? EP2_COLORS.data : 'rgba(0, 229, 255, 0.55)'}`,
                boxShadow:
                  '0 24px 56px rgba(0, 0, 0, 0.55), 0 0 36px rgba(0, 229, 255, 0.16)',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                opacity: teaserOpacity,
                transform: `translate3d(${teaserTranslateX.toFixed(1)}px, ${teaserTranslateY.toFixed(1)}px, 0) scale(${teaserScale.toFixed(3)})`,
              }}
            >
              {/* Header Roadmap */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: EP2_FONTS.mono,
                    fontSize: 13.5,
                    fontWeight: 800,
                    letterSpacing: 1.0,
                    color: EP2_COLORS.data,
                  }}
                >
                  ROADMAP SERI WORKSTATION MOHEF TECH
                </span>
                <span
                  style={{
                    fontFamily: EP2_FONTS.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: EP2_COLORS.muted,
                  }}
                >
                  2 / 3 SELESAI
                </span>
              </div>

              {/* Baris EP 01 -> EP 02 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: '12px 15px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(16, 185, 129, 0.14)',
                    border: `1.5px solid ${EP2_COLORS.ground}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: EP2_FONTS.mono,
                      fontSize: 15.5,
                      fontWeight: 800,
                      color: '#ECFDF5',
                    }}
                  >
                    EP 01: Kelistrikan Aman
                  </span>
                  <span
                    style={{
                      fontFamily: EP2_FONTS.mono,
                      fontSize: 18,
                      fontWeight: 900,
                      color: EP2_COLORS.ground,
                    }}
                  >
                    ✓
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: EP2_FONTS.heading,
                    fontSize: 22,
                    fontWeight: 900,
                    color: EP2_COLORS.data,
                  }}
                >
                  →
                </span>

                <div
                  style={{
                    flex: 1,
                    padding: '12px 15px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(16, 185, 129, 0.14)',
                    border: `1.5px solid ${EP2_COLORS.ground}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: EP2_FONTS.mono,
                      fontSize: 15.5,
                      fontWeight: 800,
                      color: '#ECFDF5',
                    }}
                  >
                    EP 02: Rakit &amp; QC Hardware
                  </span>
                  <span
                    style={{
                      fontFamily: EP2_FONTS.mono,
                      fontSize: 18,
                      fontWeight: 900,
                      color: EP2_COLORS.ground,
                    }}
                  >
                    ✓
                  </span>
                </div>
              </div>

              {/* Sorotan Utama: NEXT • EPISODE 3 */}
              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: 16,
                  background:
                    'linear-gradient(135deg, rgba(0, 229, 255, 0.18) 0%, rgba(15, 23, 42, 0.92) 100%)',
                  border: `2px solid ${ep3Highlight > 0.5 ? EP2_COLORS.data : 'rgba(0, 229, 255, 0.5)'}`,
                  boxShadow:
                    ep3Highlight > 0.5
                      ? '0 12px 30px rgba(0, 229, 255, 0.2), inset 0 0 22px rgba(0, 229, 255, 0.08)'
                      : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      padding: '5px 12px',
                      borderRadius: 999,
                      backgroundColor: EP2_COLORS.data,
                      color: '#040812',
                      fontFamily: EP2_FONTS.mono,
                      fontSize: 14,
                      fontWeight: 900,
                      letterSpacing: 0.7,
                    }}
                  >
                    NEXT • EPISODE 3
                  </span>
                  <span
                    style={{
                      fontFamily: EP2_FONTS.mono,
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: '#7DD3FC',
                    }}
                  >
                    TAHAP SOFTWARE &amp; PRODUKTIVITAS
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: EP2_FONTS.heading,
                    fontSize: 32,
                    fontWeight: 900,
                    lineHeight: 1.15,
                    letterSpacing: -0.4,
                    color: '#FFFFFF',
                  }}
                >
                  Instalasi Sistem &amp; Aplikasi Kerja
                </div>

                <div
                  style={{
                    fontFamily: EP2_FONTS.body,
                    fontSize: 17.5,
                    fontWeight: 600,
                    color: '#CBD5E1',
                  }}
                >
                  Setup OS bersih, driver resmi &amp; aplikasi siap kerja tanpa bloatware.
                </div>
              </div>
            </div>
          )}

          {/* Tahap 2 — Kartu Penawaran & Kontak CTA Utama (Y: 268..668) */}
          {ctaEnter > 0.01 && (
            <div
              style={{
                position: 'absolute',
                top: 268,
                left: EP2_SAFE.left,
                width: EP2_SAFE.contentWidth,
                padding: '20px 24px',
                borderRadius: 22,
                background: 'linear-gradient(155deg, rgba(10, 19, 34, 0.97) 0%, rgba(16, 30, 52, 0.97) 100%)',
                border: `2.5px solid ${EP2_COLORS.ground}`,
                boxShadow:
                  '0 26px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.22)',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                opacity: ctaEnter,
                transform: `translate3d(${ctaTranslateX.toFixed(1)}px, ${ctaTranslateY.toFixed(1)}px, 0) scale(${ctaScale.toFixed(3)})`,
              }}
            >
              {/* Header Brand Utama */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CustomSVGIcon
                    name="check-badge"
                    size={36}
                    color={EP2_COLORS.ink}
                    accentColor={EP2_COLORS.ground}
                    startFrame={CTA_IN_FRAME}
                  />
                  <div
                    style={{
                      fontFamily: EP2_FONTS.heading,
                      fontSize: 32,
                      fontWeight: 900,
                      letterSpacing: -0.4,
                      color: '#FFFFFF',
                    }}
                  >
                    Mohammed <span style={{ color: EP2_COLORS.muted }}>|</span>{' '}
                    <span style={{ color: EP2_COLORS.power }}>Mohef Tech</span>
                  </div>
                </div>

                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(255, 122, 47, 0.16)',
                    border: `1.5px solid ${EP2_COLORS.power}`,
                    fontFamily: EP2_FONTS.mono,
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#FDBA74',
                    whiteSpace: 'nowrap',
                  }}
                >
                  CUSTOM PC WORKSTATION
                </span>
              </div>

              {/* Badge WhatsApp Menonjol Kontras Tinggi */}
              <div
                style={{
                  padding: '16px 22px',
                  borderRadius: 18,
                  backgroundColor: '#FFFFFF',
                  border: `3px solid ${EP2_COLORS.ground}`,
                  boxShadow: '0 14px 32px rgba(16, 185, 129, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  transform: `scale(${waPulse.toFixed(4)})`,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span
                    style={{
                      fontFamily: EP2_FONTS.mono,
                      fontSize: 14,
                      fontWeight: 800,
                      letterSpacing: 0.9,
                      color: '#047857',
                    }}
                  >
                    WHATSAPP • KONSULTASI &amp; PEMESANAN
                  </span>
                  <span
                    style={{
                      fontFamily: EP2_FONTS.heading,
                      fontSize: 52,
                      fontWeight: 900,
                      letterSpacing: 1.2,
                      lineHeight: 1.02,
                      color: '#070B12',
                    }}
                  >
                    082336744354
                  </span>
                </div>

                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: 14,
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontFamily: EP2_FONTS.heading,
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: 0.3,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 6px 16px rgba(5, 150, 105, 0.35)',
                  }}
                >
                  CHAT WA →
                </div>
              </div>

              {/* Layanan & Jaminan */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.45fr',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    padding: '13px 15px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(16, 185, 129, 0.14)',
                    border: '1.5px solid rgba(16, 185, 129, 0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: EP2_FONTS.mono,
                      fontSize: 18,
                      fontWeight: 900,
                      color: EP2_COLORS.ground,
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      fontFamily: EP2_FONTS.body,
                      fontSize: 17,
                      fontWeight: 700,
                      color: '#ECFDF5',
                    }}
                  >
                    Konsultasi Spek Gratis
                  </span>
                </div>

                <div
                  style={{
                    padding: '13px 15px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(0, 229, 255, 0.12)',
                    border: '1.5px solid rgba(0, 229, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: EP2_FONTS.mono,
                      fontSize: 18,
                      fontWeight: 900,
                      color: EP2_COLORS.data,
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      fontFamily: EP2_FONTS.body,
                      fontSize: 17,
                      fontWeight: 700,
                      color: '#F0F9FF',
                    }}
                  >
                    Siap Kirim Packing Kayu ke Seluruh Indonesia
                  </span>
                </div>
              </div>
            </div>
          )}
        </CameraRig>
      </SeamlessSceneShell>

      {/* Bottom Subtitle Bar di Area Aman Bawah (>= 300px dari tepi bawah) */}
      <BottomSubtitleBar
        words={SCENE5_WORDS}
        stylePreset={EP2_STYLE_PRESET}
        fontSize={32}
        bottomOffset={EP2_SAFE.subtitleBottomOffset}
        maxWordsPerLine={6}
      />
    </AbsoluteFill>
  );
};

export default Scene5ClosingCTA;
