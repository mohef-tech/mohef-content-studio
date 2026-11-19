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
  SCENE4_WORDS,
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

/** Pusat alas casing saat berdiri tegak di atas deskmat (sama persis dengan posisi akhir Scene 3). */
const PC_ROT_Y_HERO = -0.18;
const PC_CENTER_WORLD: V3 = [
  1.8 + CASE_DIM.halfZ * Math.sin(PC_ROT_Y_HERO),
  7.64,
  0.25 + CASE_DIM.halfZ * Math.cos(PC_ROT_Y_HERO),
];

/** Konversi koordinat lokal PcCase -> koordinat dunia dengan rotasi Y casing di meja. */
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
// Procedural CanvasTexture Layar POST / BIOS Diagnostic (Tanpa Windows / OS)
// ============================================================================
const biosTexCache = new Map<number, THREE.CanvasTexture>();

const getBiosPostTexture = (stage: 0 | 1 | 2 | 3 | 4): THREE.CanvasTexture => {
  const cached = biosTexCache.get(stage);
  if (cached) return cached;

  const W = 1280;
  const H = 720;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  // Latar gelap teknis BIOS/UEFI
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#040812');
  bgGrad.addColorStop(1, '#081120');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Grid blueprint halus khas firmware diagnostik
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Top Header Bar UEFI BIOS
  ctx.fillStyle = '#0D1B2E';
  ctx.fillRect(0, 0, W, 86);
  ctx.fillStyle = '#00E5FF';
  ctx.fillRect(0, 84, W, 3);

  ctx.fillStyle = '#00E5FF';
  ctx.font = 'bold 26px Menlo, Consolas, monospace';
  ctx.fillText('MOHEF TECH // UEFI BIOS POST DIAGNOSTIC', 42, 52);

  const badgeText = stage >= 4 ? 'POST PASSED' : stage >= 1 ? 'CHECKING...' : 'STANDBY';
  const badgeColor = stage >= 4 ? '#10B981' : '#FF7A2F';
  ctx.fillStyle = badgeColor;
  ctx.fillRect(W - 260, 22, 218, 42);
  ctx.fillStyle = '#030712';
  ctx.font = 'bold 20px Menlo, Consolas, monospace';
  ctx.fillText(badgeText, W - 224, 50);

  // Sub-header hardware info
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 18px Menlo, Consolas, monospace';
  ctx.fillText('BOARD: ATX B650-PRO   |   BIOS VER: 2.40   |   MODE: HARDWARE QC AUDIT', 42, 128);

  // 3 Baris Cek Hardware Utama
  const checks = [
    {
      activeAt: 2,
      code: '01',
      label: 'CPU: DETECTED & TEMP NORMAL',
      detail: '8-Core / 16-Thread • 36°C • VCore 1.18V',
    },
    {
      activeAt: 3,
      label: 'MEMORY: DDR5 DUAL-CHANNEL FULL SPEED',
      code: '02',
      detail: '32 GB (2x16 GB) • 6000 MT/s • XMP/EXPO OK',
    },
    {
      activeAt: 4,
      code: '03',
      label: 'STORAGE: NVMe M.2 100% HEALTHY',
      detail: '1 TB PCIe Gen4 x4 • SMART Status: PASSED',
    },
  ];

  checks.forEach((row, idx) => {
    const y = 166 + idx * 134;
    const verified = stage >= row.activeAt;
    const scanning = !verified && stage >= 1 && stage === row.activeAt - 1;

    ctx.fillStyle = verified
      ? 'rgba(16, 185, 129, 0.14)'
      : scanning
      ? 'rgba(0, 229, 255, 0.10)'
      : 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(42, y, W - 84, 112);

    ctx.strokeStyle = verified
      ? '#10B981'
      : scanning
      ? '#00E5FF'
      : 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = verified ? 3 : 2;
    ctx.strokeRect(42, y, W - 84, 112);

    // Status pill kiri
    ctx.fillStyle = verified ? '#10B981' : scanning ? '#00E5FF' : '#334155';
    ctx.fillRect(64, y + 26, 114, 58);
    ctx.fillStyle = verified || scanning ? '#040812' : '#94A3B8';
    ctx.font = 'bold 22px Menlo, Consolas, monospace';
    ctx.fillText(verified ? '[ OK ]' : scanning ? '[SCAN]' : '[WAIT]', 78, y + 63);

    // Judul baris diagnostik
    ctx.fillStyle = verified ? '#F8FAFC' : scanning ? '#7DD3FC' : '#64748B';
    ctx.font = 'bold 27px Menlo, Consolas, monospace';
    ctx.fillText(row.label, 202, y + 50);

    // Sub-info teknis
    ctx.fillStyle = verified ? '#6EE7B7' : '#94A3B8';
    ctx.font = '600 19px Menlo, Consolas, monospace';
    ctx.fillText(row.detail, 202, y + 86);
  });

  // Footer Summary & Telemetry Tegangan
  const footerY = 586;
  ctx.fillStyle = stage >= 4 ? 'rgba(16, 185, 129, 0.20)' : 'rgba(15, 23, 42, 0.90)';
  ctx.fillRect(42, footerY, W - 84, 92);
  ctx.strokeStyle = stage >= 4 ? '#10B981' : 'rgba(0, 229, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(42, footerY, W - 84, 92);

  ctx.fillStyle = stage >= 4 ? '#6EE7B7' : '#00E5FF';
  ctx.font = 'bold 24px Menlo, Consolas, monospace';
  ctx.fillText(
    stage >= 4
      ? '✓ POST BIOS: ALL HARDWARE DETECTED 100% — NO BOOT ERRORS'
      : '► RUNNING HARDWARE POST CHECK (CPU / RAM / NVMe)...',
    68,
    footerY + 38
  );

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '600 18px Menlo, Consolas, monospace';
  ctx.fillText('+12V RAIL: 12.02V   |   +5V RAIL: 5.01V   |   SYS FAN: 1320 RPM', 68, footerY + 72);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  biosTexCache.set(stage, tex);
  return tex;
};

const BiosMonitorScreen: React.FC<{ stage: 0 | 1 | 2 | 3 | 4 }> = ({ stage }) => {
  const tex = useMemo(() => getBiosPostTexture(stage), [stage]);

  return (
    <mesh position={[0, 2.7, -0.05]}>
      <planeGeometry args={[5.68, 3.05]} />
      <meshStandardMaterial
        color="#ffffff"
        map={tex}
        emissive="#ffffff"
        emissiveMap={tex}
        emissiveIntensity={0.62}
        roughness={0.22}
        metalness={0.05}
      />
    </mesh>
  );
};

// ============================================================================
// Manajemen Kabel Tray Belakang (-Z), Velcro Straps & Titik Soket Terkunci
// ============================================================================
interface RearCableProps {
  frame: number;
  rearPanelOpen: number;
  rearPanelOpacity: number;
}

const RearCableManagement: React.FC<RearCableProps> = ({
  frame,
  rearPanelOpen,
  rearPanelOpacity,
}) => {
  const { halfX: HX, height: H, halfZ: HZ } = CASE_DIM;

  // Geometri 3 jalur kabel utama dari PSU modular ke motherboard & GPU
  const atx24Geo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-0.65, 0.62, -0.35],
          [-0.25, 0.58, -1.13],
          [0.62, 1.15, -1.15],
          [0.62, 2.45, -1.15],
          [0.62, 3.38, -1.13],
          [0.42, 3.32, -0.96],
          [0.25, 3.22, -0.91],
        ],
        0.048,
        56,
        10
      ),
    []
  );

  const cpuEpsGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-0.65, 0.62, -0.1],
          [-1.35, 0.72, -1.13],
          [-1.62, 1.65, -1.15],
          [-1.62, 3.2, -1.15],
          [-1.62, 4.42, -1.13],
          [-1.58, 4.46, -0.96],
          [-1.56, 4.42, -0.91],
        ],
        0.036,
        56,
        10
      ),
    []
  );

  const pcieGpuGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-0.65, 0.44, 0.15],
          [-0.1, 0.48, -1.13],
          [0.46, 0.95, -1.15],
          [0.62, 1.45, -1.13],
          [0.42, 1.75, -0.7],
          [0.16, 2.25, 0.25],
          [0.16, 2.35, 0.33],
        ],
        0.038,
        56,
        10
      ),
    []
  );

  useEffect(() => {
    return () => {
      atx24Geo.dispose();
      cpuEpsGeo.dispose();
      pcieGpuGeo.dispose();
    };
  }, [atx24Geo, cpuEpsGeo, pcieGpuGeo]);

  // Animasi audit penguncian velcro & soket (f 165..245)
  const auditProgress = interpolate(frame, [162, 244], [0, 1], clamp);
  const pulse = 0.78 + 0.22 * Math.sin(frame * 0.22);

  const velcroStraps: Array<{ pos: V3; size: V3; unlockAt: number }> = [
    { pos: [0.62, 1.85, -1.14], size: [0.18, 0.075, 0.08], unlockAt: 0.12 },
    { pos: [0.62, 2.95, -1.14], size: [0.18, 0.075, 0.08], unlockAt: 0.28 },
    { pos: [-1.62, 1.85, -1.14], size: [0.16, 0.075, 0.08], unlockAt: 0.42 },
    { pos: [-1.62, 3.45, -1.14], size: [0.16, 0.075, 0.08], unlockAt: 0.56 },
    { pos: [0.08, 0.62, -1.14], size: [0.075, 0.18, 0.08], unlockAt: 0.7 },
  ];

  // Titik soket daya terkunci (PSU modular + grommet jalur + header belakang)
  const lockedSockets: Array<{ pos: V3; unlockAt: number; radius: number }> = [
    { pos: [-0.66, 0.62, -0.35], unlockAt: 0.48, radius: 0.09 },
    { pos: [-0.66, 0.62, -0.1], unlockAt: 0.58, radius: 0.08 },
    { pos: [-0.66, 0.44, 0.15], unlockAt: 0.68, radius: 0.085 },
    { pos: [0.62, 3.42, -1.17], unlockAt: 0.78, radius: 0.12 },
    { pos: [-1.62, 4.44, -1.17], unlockAt: 0.86, radius: 0.11 },
    { pos: [0.62, 1.45, -1.17], unlockAt: 0.94, radius: 0.12 },
  ];

  return (
    <group>
      {/* Rel saluran kabel (cable routing channel) di balik tray motherboard */}
      <Box size={[0.24, 3.3, 0.04]} position={[0.62, 2.3, -1.11]} color="#0b0f17" roughness={0.6} />
      <Box size={[0.22, 3.6, 0.04]} position={[-1.62, 2.7, -1.11]} color="#0b0f17" roughness={0.6} />

      {/* 3 Bundel Kabel Daya Braided PSU */}
      <mesh geometry={atx24Geo}>
        <meshStandardMaterial color="#1f2937" roughness={0.65} metalness={0.18} />
      </mesh>
      <mesh geometry={cpuEpsGeo}>
        <meshStandardMaterial color="#1e293b" roughness={0.65} metalness={0.18} />
      </mesh>
      <mesh geometry={pcieGpuGeo}>
        <meshStandardMaterial color="#1e293b" roughness={0.65} metalness={0.18} />
      </mesh>

      {/* Kepala konektor yang mengunci di Motherboard & GPU (terlihat juga dari sisi kaca) */}
      <Box
        size={[0.14, 0.56, 0.16]}
        position={[0.25, 3.22, -0.9]}
        color="#111827"
        roughness={0.5}
      />
      <Box
        size={[0.22, 0.14, 0.16]}
        position={[-1.56, 4.42, -0.9]}
        color="#111827"
        roughness={0.5}
      />
      <Box size={[0.42, 0.14, 0.16]} position={[0.16, 2.35, 0.34]} color="#111827" roughness={0.5} />

      {/* Pengikat Velcro Strap / Cable Ties */}
      {velcroStraps.map((strap, idx) => {
        const locked = auditProgress >= strap.unlockAt;
        return (
          <group key={idx} position={strap.pos}>
            <Box
              size={strap.size}
              color={locked ? '#064e3b' : '#1e293b'}
              roughness={0.75}
            />
            <Box
              size={[strap.size[0] * 0.88, strap.size[1] * 0.45, strap.size[2] + 0.015]}
              color={locked ? EP2_COLORS.ground : EP2_COLORS.power}
              emissive={locked ? EP2_COLORS.ground : EP2_COLORS.power}
              emissiveIntensity={locked ? 1.5 * pulse : 0.6}
            />
          </group>
        );
      })}

      {/* Indikator Titik Hijau Soket Terkunci (Aman dari Korslet / Kendor) */}
      {lockedSockets.map((sock, idx) => {
        const active = auditProgress >= sock.unlockAt;
        if (!active) return null;
        return (
          <group key={idx} position={sock.pos}>
            <mesh>
              <sphereGeometry args={[sock.radius * 0.42, 16, 16]} />
              <meshStandardMaterial
                color={EP2_COLORS.ground}
                emissive={EP2_COLORS.ground}
                emissiveIntensity={2.0 * pulse}
                toneMapped={false}
              />
            </mesh>
            <mesh rotation={[0, Math.PI, 0]}>
              <ringGeometry args={[sock.radius * 0.75, sock.radius, 28]} />
              <meshBasicMaterial
                color={EP2_COLORS.ground}
                transparent
                opacity={0.9 * pulse}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* Tutup Panel Baja Belakang Tray Motherboard (terbuka saat Stage 1) */}
      {rearPanelOpacity > 0.01 && (
        <group position={[-rearPanelOpen * 3.8, H / 2, -HZ - 0.025 - rearPanelOpen * 0.6]}>
          <Box
            size={[HX * 2 - 0.04, H - 0.04, 0.04]}
            color="#151920"
            metalness={0.55}
            roughness={0.42}
            transparent={rearPanelOpacity < 1}
            opacity={rearPanelOpacity}
          />
          {/* Aksen garis kontur panel belakang */}
          <Box
            size={[0.14, H * 0.65, 0.05]}
            position={[HX - 0.25, 0, -0.01]}
            color="#262d38"
            metalness={0.7}
            transparent={rearPanelOpacity < 1}
            opacity={rearPanelOpacity}
          />
        </group>
      )}
    </group>
  );
};

// ============================================================================
// Simulasi Aliran Partikel & Panah Airflow 3D (Intake Biru -> Exhaust Oranye)
// ============================================================================
interface AirflowStream {
  points: V3[];
  color: string;
  count: number;
  speed: number;
}

const AIRFLOW_STREAMS: AirflowStream[] = [
  // 3 Aliran Udara Dingin Intake (masuk dari depan/bawah menuju RAM, CPU & GPU)
  {
    points: [
      [3.35, 3.92, 0.05],
      [2.15, 3.88, 0.05],
      [0.85, 3.78, -0.25],
      [-0.45, 3.65, -0.45],
    ],
    color: EP2_COLORS.cold,
    count: 4,
    speed: 0.024,
  },
  {
    points: [
      [3.35, 2.72, 0.1],
      [2.15, 2.7, 0.05],
      [0.75, 2.68, -0.1],
      [-0.55, 2.85, -0.25],
    ],
    color: EP2_COLORS.data,
    count: 4,
    speed: 0.026,
  },
  {
    points: [
      [3.35, 1.5, 0.12],
      [2.15, 1.52, 0.12],
      [0.85, 1.65, 0.05],
      [-0.45, 2.05, 0.0],
    ],
    color: EP2_COLORS.cold,
    count: 4,
    speed: 0.023,
  },
  // 2 Aliran Udara Panas Exhaust (keluar lewat kipas belakang & mesh atas)
  {
    points: [
      [-0.45, 3.35, -0.25],
      [-1.35, 3.72, -0.1],
      [-2.15, 3.85, 0.0],
      [-3.45, 3.95, 0.0],
    ],
    color: EP2_COLORS.warm,
    count: 4,
    speed: 0.027,
  },
  {
    points: [
      [0.15, 3.15, 0.0],
      [-0.35, 4.05, -0.15],
      [-0.75, 4.78, -0.1],
      [-1.05, 5.75, -0.05],
    ],
    color: EP2_COLORS.warm,
    count: 3,
    speed: 0.024,
  },
];

const AirflowSimulation3D: React.FC<{ frame: number; visibility: number }> = ({
  frame,
  visibility,
}) => {
  const curves = useMemo(
    () =>
      AIRFLOW_STREAMS.map(
        (s) =>
          new THREE.CatmullRomCurve3(
            s.points.map((p) => new THREE.Vector3(...p)),
            false,
            'catmullrom',
            0.4
          )
      ),
    []
  );

  const guideGeos = useMemo(
    () => curves.map((c) => new THREE.TubeGeometry(c, 36, 0.014, 6, false)),
    [curves]
  );

  useEffect(() => {
    return () => {
      guideGeos.forEach((g) => g.dispose());
    };
  }, [guideGeos]);

  if (visibility <= 0.02) return null;

  const upAxis = new THREE.Vector3(0, 1, 0);

  return (
    <group>
      {AIRFLOW_STREAMS.map((stream, sIdx) => {
        const curve = curves[sIdx];
        return (
          <group key={sIdx}>
            {/* Garis jalur aliran tipis semi-transparan */}
            <mesh geometry={guideGeos[sIdx]} renderOrder={14}>
              <meshBasicMaterial
                color={stream.color}
                transparent
                opacity={0.28 * visibility}
                depthWrite={false}
              />
            </mesh>

            {/* Partikel panah 3D bergerak sepanjang kurva */}
            {Array.from({ length: stream.count }, (_, k) => {
              const t = (frame * stream.speed + k / stream.count) % 1;
              const pos = curve.getPointAt(t);
              const tan = curve.getTangentAt(t).normalize();
              const quat = new THREE.Quaternion().setFromUnitVectors(upAxis, tan);
              const euler = new THREE.Euler().setFromQuaternion(quat);
              const edgeFade = Math.sin(t * Math.PI);
              const alpha = Math.min(1, edgeFade * 1.45) * visibility;

              return (
                <group
                  key={k}
                  position={[pos.x, pos.y, pos.z]}
                  rotation={[euler.x, euler.y, euler.z]}
                >
                  {/* Kepala panah 3D */}
                  <mesh position={[0, 0.11, 0]} renderOrder={16}>
                    <coneGeometry args={[0.075, 0.18, 12]} />
                    <meshStandardMaterial
                      color={stream.color}
                      emissive={stream.color}
                      emissiveIntensity={1.8}
                      transparent
                      opacity={0.95 * alpha}
                      toneMapped={false}
                      depthWrite={false}
                    />
                  </mesh>
                  {/* Ekor aliran udara */}
                  <mesh position={[0, -0.09, 0]} renderOrder={16}>
                    <cylinderGeometry args={[0.024, 0.012, 0.24, 10]} />
                    <meshStandardMaterial
                      color={stream.color}
                      emissive={stream.color}
                      emissiveIntensity={1.5}
                      transparent
                      opacity={0.82 * alpha}
                      toneMapped={false}
                      depthWrite={false}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

// ============================================================================
// Kamera 3D Scene 4: Hero PC -> Putar Belakang Tray -> Monitor BIOS -> Hero Airflow
// ============================================================================
interface CamPose {
  dist: number;
  az: number;
  el: number;
  fov: number;
  target: V3;
}

interface CamKeyframe extends CamPose {
  frame: number;
}

const CAM_KEYFRAMES: CamKeyframe[] = [
  // 0. Pembuka kontinu dari akhir Scene 3 (PC menyala di atas meja)
  { frame: 0, dist: 17.8, az: 24.5, el: 18.5, fov: 38, target: [1.45, 9.65, 0.65] },
  { frame: 48, dist: 17.4, az: 24.0, el: 18.0, fov: 38, target: [1.5, 9.7, 0.85] },
  // 1. Tahap 1 — Audit tray belakang casing & manajemen kabel PSU
  { frame: 112, dist: 12.2, az: 16.0, el: 16.5, fov: 38, target: [1.58, 9.85, 1.35] },
  { frame: 146, dist: 11.4, az: 14.5, el: 15.5, fov: 38, target: [1.55, 9.75, 1.35] },
  { frame: 274, dist: 11.6, az: 19.5, el: 14.0, fov: 38, target: [1.55, 9.75, 1.35] },
  // 2. Tahap 2 — Geser ke monitor di sisi kiri meja untuk cek POST BIOS
  { frame: 332, dist: 15.2, az: 13.5, el: 6.5, fov: 42, target: [-5.2, 10.16, -3.25] },
  { frame: 472, dist: 14.6, az: 12.6, el: 6.0, fov: 41, target: [-5.2, 10.18, -3.25] },
  // 3. Tahap 3 — Kembali ke hero 3/4 sisi kaca untuk simulasi airflow & stress test QC
  { frame: 528, dist: 17.4, az: 24.5, el: 18.5, fov: 38, target: [1.45, 9.65, 0.75] },
  { frame: EP2_DURATIONS.scene4, dist: 16.9, az: 27.5, el: 19.5, fov: 38, target: [1.45, 9.65, 0.75] },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const resolveQcCameraPose = (frame: number): CamPose => {
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
    az: lerp(a.az, b.az, t) + Math.sin(frame * 0.02) * 0.14,
    el: lerp(a.el, b.el, t),
    fov: lerp(a.fov, b.fov, t),
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
  focusY: number;
}> = ({ pose, width, height, focusY }) => {
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
    camera.setViewOffset(width, height, 0, height / 2 - focusY, width, height);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  }, [camera, pose, width, height, focusY]);
  return null;
};

// ============================================================================
// Panggung 3D Utama Scene 4
// ============================================================================
const QcStage3D: React.FC<{ frame: number }> = ({ frame }) => {
  const pose = useMemo(() => resolveQcCameraPose(frame), [frame]);

  // Putaran halus casing untuk memperlihatkan panel belakang tray motherboard di Tahap 1
  const spinToRear = interpolate(frame, [52, 128], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const spinToFront = interpolate(frame, [272, 326], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const rearViewFactor = spinToRear * (1 - spinToFront);
  const pcRotY = lerp(PC_ROT_Y_HERO, -2.72, rearViewFactor);

  // Panel baja belakang terbuka / transparan saat inspeksi kabel (f 78..288)
  const rearPanelOpen =
    interpolate(frame, [78, 126], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) *
    (1 -
      interpolate(frame, [264, 294], [0, 1], {
        ...clamp,
        easing: Easing.inOut(Easing.cubic),
      }));
  const rearPanelOpacity =
    frame < 260
      ? interpolate(frame, [95, 124], [1, 0], clamp)
      : interpolate(frame, [268, 292], [0, 1], clamp);

  // Tahap 2: Tahapan tampilan BIOS POST pada monitor
  const biosStage: 0 | 1 | 2 | 3 | 4 =
    frame >= 428 ? 4 : frame >= 402 ? 3 : frame >= 376 ? 2 : frame >= 324 ? 1 : 0;

  // Tahap 3: Kemunculan partikel panah airflow 3D
  const airflowVisibility = interpolate(frame, [506, 534], [0, 1], clamp);

  // Putaran kipas & LED konstan (sistem dalam keadaan menyala stabil)
  const fanAngle = frame * 0.24;
  const psuFanAngle = frame * 0.18;
  const ledPhase = frame * 0.015;

  // Kabel daya AC dari stopkontak dinding Ep.1 ke PSU (mengikuti putaran casing)
  const deskTopY = 7.5;
  const outletPos: V3 = [-2.4, 4.2, -5.54];
  const outletSocketPos: V3 = [outletPos[0] + 0.32, outletPos[1] - 0.05, outletPos[2] + 0.2];
  const psuSocketWorld = caseLocalToWorld([-2.24, 0.51, 0.15], pcRotY);

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

  const pulseT = (frame % 40) / 40;
  const pulsePos = cableCurve.getPointAt(pulseT);

  return (
    <ThreeCanvas
      width={EP2_WIDTH}
      height={EP2_HEIGHT}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      camera={{ fov: 38, near: 0.35, far: 220, position: [10, 14, 20] }}
    >
      <SceneCameraController pose={pose} width={EP2_WIDTH} height={EP2_HEIGHT} focusY={980} />
      <StudioEnvironment intensity={0.86} />
      <StudioLights keyIntensity={2.1} />
      <pointLight position={[2.2, 13.5, -1.5]} intensity={1.95} distance={18} color="#e0f2fe" />
      <pointLight position={[1.8, 9.6, 0.8]} intensity={1.85} distance={12} color="#38BDF8" />
      {/* Cahaya pengisi halus di sisi belakang tray saat casing diputar */}
      {rearViewFactor > 0.05 && (
        <pointLight
          position={[1.4, 10.2, 5.2]}
          intensity={1.5 * rearViewFactor}
          distance={12}
          color="#e2e8f0"
        />
      )}

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

      {/* ===== MEJA KERJA WORKSTATION (PROPORSIONAL DENGAN SCENE 3) ===== */}
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

        {/* Periferal & Monitor POST/BIOS di Sisi Kiri Meja */}
        <Box size={[5.2, 0.04, 3.2]} position={[-5.2, deskTopY + 0.02, 0.9]} color="#111827" roughness={0.9} />
        <Box size={[2.6, 0.1, 1.0]} position={[-5.5, deskTopY + 0.09, 1.05]} color="#1F2937" roughness={0.55} />
        <Box size={[0.55, 0.12, 0.92]} position={[-3.5, deskTopY + 0.09, 1.05]} color="#1F2937" roughness={0.45} />
        <group position={[-5.2, deskTopY, -2.0]} rotation={[0, 0.22, 0]}>
          <Box size={[1.7, 0.1, 1.3]} position={[0, 0.05, 0]} color="#1E293B" metalness={0.6} roughness={0.4} />
          <Box size={[0.24, 1.8, 0.22]} position={[0, 0.95, -0.32]} color="#1E293B" metalness={0.6} roughness={0.4} />
          <Box size={[5.8, 3.25, 0.18]} position={[0, 2.7, -0.15]} color="#0F172A" roughness={0.4} />
          <BiosMonitorScreen stage={biosStage} />
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
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial
          color={EP2_COLORS.ground}
          emissive={EP2_COLORS.ground}
          emissiveIntensity={2.3}
          toneMapped={false}
        />
      </mesh>

      {/* ===== CASING PC LENGKAP + HARDWARE + MANAJEMEN KABEL + AIRFLOW ===== */}
      <group position={PC_CENTER_WORLD} rotation={[0, pcRotY, 0]}>
        <PcCase
          glassOpacity={1}
          fanAngle={fanAngle}
          intakeColor={EP2_COLORS.cold}
          exhaustColor={EP2_COLORS.warm}
          ringIntensity={1.9}
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
              <RamStick rotation={RAM_ON_BOARD_ROTATION} ledPhase={ledPhase} ledIntensity={1.9} />
            </group>
            <group position={[MB_LAYOUT.dimmU[3], MB_LAYOUT.dimmV, MB_LAYOUT.frontZ + 0.05]}>
              <RamStick
                rotation={RAM_ON_BOARD_ROTATION}
                ledPhase={ledPhase + 0.32}
                ledIntensity={1.9}
              />
            </group>
            <group position={[-1.23, MB_LAYOUT.pcie1V, 0.14]}>
              <GpuCard
                rotation={GPU_ON_BOARD_ROTATION}
                fanAngle={fanAngle}
                ledColor={EP2_COLORS.data}
                ledIntensity={1.95}
              />
            </group>
          </group>

          {/* PSU 750W Modular */}
          <group position={CASE_LAYOUT.psuCenter}>
            <Psu fanAngle={psuFanAngle} />
          </group>

          {/* Tahap 1: Jalur Kabel Tray Belakang + Velcro + Indikator Hijau */}
          <RearCableManagement
            frame={frame}
            rearPanelOpen={rearPanelOpen}
            rearPanelOpacity={rearPanelOpacity}
          />

          {/* Tahap 3: Simulasi Panah & Partikel Airflow 3D */}
          <AirflowSimulation3D frame={frame} visibility={airflowVisibility} />
        </PcCase>
      </group>
    </ThreeCanvas>
  );
};

// ============================================================================
// Spesifikasi 3 Tahap QC (Sinkron Timestamp ep2-scene4-words.json)
// ============================================================================
interface QcStageSpec {
  id: string;
  startFrame: number;
  passFrame: number;
  badgeIndex: string;
  title: string;
  subtitle: string;
  accent: string;
  surface: string;
  shortLabel: string;
}

const QC_STAGES: QcStageSpec[] = [
  {
    id: 'cable-audit',
    startFrame: 138,
    passFrame: 245,
    badgeIndex: 'TAHAP 01 • AUDIT FISIK',
    title: '01 • AUDIT KABEL & SOKET AMAN',
    subtitle: '24-PIN, CPU 8-PIN & PCIe Terikat Rapi • Bebas Korslet',
    accent: EP2_COLORS.ground,
    surface: '#0C241E',
    shortLabel: '1. KABEL & SOKET',
  },
  {
    id: 'post-bios',
    startFrame: 297,
    passFrame: 432,
    badgeIndex: 'TAHAP 02 • DETEKSI MONITOR',
    title: '02 • POST BIOS: HARDWARE TERBACA 100%',
    subtitle: 'CPU Normal • RAM Dual-Channel • NVMe 100% Healthy',
    accent: EP2_COLORS.data,
    surface: '#0D2134',
    shortLabel: '2. POST BIOS',
  },
  {
    id: 'airflow-stress',
    startFrame: 492,
    passFrame: 588,
    badgeIndex: 'TAHAP 03 • AIRFLOW & STRESS TEST',
    title: '03 • STRESS TEST: SUHU STABIL & TEGANGAN PSU AMAN — LOLOS QC',
    subtitle: 'Intake Dingin → Exhaust Panas • CPU 62°C • +12V: 12.02V',
    accent: EP2_COLORS.power,
    surface: '#1F1714',
    shortLabel: '3. AIRFLOW & QC',
  },
];

export const Scene4Airflow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeStage = useMemo(() => {
    for (let i = QC_STAGES.length - 1; i >= 0; i--) {
      if (frame >= QC_STAGES[i].startFrame) return QC_STAGES[i];
    }
    return null;
  }, [frame]);

  const phaseTrigger =
    frame >= 588
      ? 588
      : activeStage
      ? activeStage.startFrame
      : frame >= 52
      ? 52
      : 4;

  const badgePop = spring({
    frame: frame - phaseTrigger,
    fps,
    config: { damping: 18, stiffness: 220, mass: 0.7 },
  });

  const passedCount = QC_STAGES.filter((s) => frame >= s.passFrame).length;
  const qcProgress = Math.round((passedCount / QC_STAGES.length) * 100);

  // Suhu & beban telemetry dinamis saat stress test QC (f 492..678)
  const stressLoadPct = Math.round(interpolate(frame, [492, 570], [32, 100], clamp));
  const cpuTempC = Math.round(interpolate(frame, [492, 578], [38, 62], clamp));
  const gpuTempC = Math.round(interpolate(frame, [492, 578], [41, 65], clamp));

  const calloutCard = useMemo(() => {
    if (!activeStage) {
      return {
        indexLabel: 'QC STANDAR • 0/3',
        headline: 'PC Menyala → Mulai Audit QC 3 Tahap',
        headlineSize: 22,
        detail: '→ Cek Kabel, POST BIOS & Uji Beban Suhu',
        detailColor: '#7DD3FC',
        accentColor: EP2_COLORS.data,
        surfaceColor: '#0F1826',
      };
    }

    const passed = frame >= activeStage.passFrame;
    const isFinalPassed = activeStage.id === 'airflow-stress' && passed;

    return {
      indexLabel: isFinalPassed ? 'QC PASSED • 3/3 LOLOS' : activeStage.badgeIndex,
      headline: activeStage.title,
      headlineSize: activeStage.id === 'airflow-stress' ? 19 : 21,
      detail: passed ? `✓ ${activeStage.subtitle}` : `► Menguji: ${activeStage.subtitle}`,
      detailColor: passed ? '#6EE7B7' : '#E2E8F0',
      accentColor: isFinalPassed ? EP2_COLORS.ground : activeStage.accent,
      surfaceColor: isFinalPassed ? '#0B2720' : activeStage.surface,
    };
  }, [activeStage, frame]);

  const statusText =
    frame < 138
      ? 'UNIT MENYALA • MEMULAI 3 TAHAP UJI KEAMANAN & QC HARDWARE'
      : frame < 297
      ? 'TAHAP 1/3 • AUDIT JALUR KABEL PSU, VELCRO & SOKET TERKUNCI AMAN'
      : frame < 492
      ? 'TAHAP 2/3 • POST BIOS MONITOR: CPU, DDR5 RAM & NVMe TERBACA 100%'
      : frame < 588
      ? 'TAHAP 3/3 • SIMULASI AIRFLOW DINGIN-PANAS & STRESS TEST BEBAN SUHU'
      : 'LOLOS QC 3/3 • SUHU STABIL 62°C & TEGANGAN PSU AMAN — SIAP KIRIM';

  const statusColor =
    frame < 138
      ? EP2_COLORS.data
      : frame < 297
      ? EP2_COLORS.ground
      : frame < 492
      ? EP2_COLORS.data
      : frame < 588
      ? EP2_COLORS.power
      : EP2_COLORS.ground;

  return (
    <AbsoluteFill style={{ backgroundColor: EP2_COLORS.bg, fontFamily: EP2_FONTS.body }}>
      {/* Audio VO Scene 4 (regenerated edge-tts) & BGM Auto-Ducking */}
      <Audio src={staticFile('audio/vo/ep2-scene4.mp3')} volume={1.0} />
      <AudioStage
        musicSrc={EP2_BGM}
        words={SCENE4_WORDS}
        bedSrc=""
        sfxTrackSrc=""
        baseMusicVolume={0.12}
      />

      {/* SFX Sinkron 3 Tahap QC (dari KATALOG-AI.md) */}
      <SfxCue frame={84} sfx="transition-whoosh-soft" volume={0.42} />
      {/* Tahap 1: penguncian velcro & soket kabel */}
      <SfxCue frame={205} sfx="click-soft" volume={0.55} />
      <SfxCue frame={245} sfx="pop-in" volume={0.48} />
      {/* Tahap 2: POST BIOS mendeteksi CPU, RAM, NVMe */}
      <SfxCue frame={376} sfx="click-soft" volume={0.58} />
      <SfxCue frame={402} sfx="click-soft" volume={0.58} />
      <SfxCue frame={428} sfx="click-soft" volume={0.62} />
      {/* Tahap 3: Simulasi airflow & konfirmasi Lolos QC */}
      <SfxCue frame={516} sfx="data-reveal" volume={0.42} />
      <SfxCue frame={588} sfx="confirm-chime" volume={0.64} />

      {/* Latar Studio */}
      <ProceduralBackground stylePreset={EP2_STYLE_PRESET} driftSpeed={0.8} />

      {/* Panggung 3D Audit Kabel -> POST BIOS Monitor -> Airflow & Stress Test */}
      <AbsoluteFill>
        <QcStage3D frame={frame} />
      </AbsoluteFill>

      {/* Gradien lembut agar HUD & Subtitle tajam */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(7, 11, 18, 0.88) 0%, rgba(7, 11, 18, 0.34) 27%, rgba(7, 11, 18, 0) 47%, rgba(7, 11, 18, 0.72) 100%)',
        }}
      />

      {/* Lapisan 2D Motion-Craft dalam Safe Zone (X: 90..960, Y: 56..1620) */}
      <SeamlessSceneShell
        startFrame={0}
        endFrame={EP2_DURATIONS.scene4}
        enterMode="none"
        exitMode="none"
        background="transparent"
        enableTransitionSfx={false}
      >
        <CameraRig
          durationInFrames={EP2_DURATIONS.scene4}
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
                backgroundColor: 'rgba(15, 22, 34, 0.88)',
                border: `1px solid ${EP2_COLORS.border}`,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  backgroundColor: EP2_COLORS.power,
                  boxShadow: `0 0 10px ${EP2_COLORS.power}`,
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
                backgroundColor: 'rgba(15, 22, 34, 0.88)',
                border: `1px solid ${EP2_COLORS.data}44`,
                fontFamily: EP2_FONTS.mono,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: EP2_COLORS.data,
              }}
            >
              EP 02 • SCENE 04
            </div>
          </div>

          {/* Judul Quality Control (Y: 130..236) */}
          <div
            style={{
              position: 'absolute',
              top: 130,
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
                startFrame={4}
              />
              <span
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1.0,
                  color: EP2_COLORS.ground,
                }}
              >
                LANGKAH 03 • STANDAR UJI KEAMANAN &amp; QC HARDWARE
              </span>
            </div>

            <FlyText
              text="UJI KEAMANAN 3 TAHAP"
              start={6}
              stagger={1.2}
              dur={12}
              size={48}
              weight={900}
              family={EP2_FONTS.heading}
              color={EP2_COLORS.ink}
              flyingColor={EP2_COLORS.ground}
              letterSpacing={-0.6}
              xOffset={0}
              rotateSpread={4}
              style={{ paddingLeft: 4 }}
            />
          </div>

          {/* Zona Call-Out Tahap Aktif + Panel Checklist & Telemetry QC (Y: 254..426) */}
          <div
            style={{
              position: 'absolute',
              top: 254,
              left: EP2_SAFE.left,
              width: EP2_SAFE.contentWidth,
              height: 172,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'stretch',
              gap: 18,
            }}
          >
            <div
              style={{
                width: 524,
                height: 172,
                padding: '13px 18px 14px',
                borderRadius: 18,
                backgroundColor: calloutCard.surfaceColor,
                border: `1.5px solid ${calloutCard.accentColor}99`,
                boxShadow: '0 18px 40px rgba(0, 0, 0, 0.42)',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 6,
                opacity: 0.35 + 0.65 * badgePop,
                transform: `translate3d(0, ${((1 - badgePop) * 14).toFixed(1)}px, 0) scale(${(0.96 + 0.04 * badgePop).toFixed(3)})`,
              }}
            >
              <div
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 0.7,
                  color: calloutCard.accentColor,
                }}
              >
                {calloutCard.indexLabel}
              </div>

              <div
                style={{
                  fontFamily: EP2_FONTS.heading,
                  fontSize: calloutCard.headlineSize,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  color: EP2_COLORS.ink,
                }}
              >
                {calloutCard.headline}
              </div>

              <div
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: calloutCard.detailColor,
                }}
              >
                {calloutCard.detail}
              </div>
            </div>

            {/* Panel Checklist 3 Tahap & Telemetry Stress Test */}
            <div
              style={{
                width: 328,
                height: 172,
                padding: '12px 14px',
                borderRadius: 18,
                backgroundColor: 'rgba(13, 20, 32, 0.9)',
                border: `1px solid ${
                  passedCount === 3 ? 'rgba(16, 185, 129, 0.55)' : EP2_COLORS.border
                }`,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: EP2_COLORS.muted,
                }}
              >
                <span>TELEMETRY QC</span>
                <span style={{ color: passedCount === 3 ? EP2_COLORS.ground : EP2_COLORS.data }}>
                  {passedCount === 3 ? '3/3 LOLOS QC' : `${passedCount}/3 VERIFIED`}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {QC_STAGES.map((stage) => {
                  const passed = frame >= stage.passFrame;
                  const active = !passed && frame >= stage.startFrame;
                  return (
                    <div
                      key={stage.id}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 7,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: passed
                          ? 'rgba(16, 185, 129, 0.16)'
                          : active
                          ? 'rgba(0, 229, 255, 0.14)'
                          : 'rgba(30, 41, 59, 0.55)',
                        border: `1px solid ${
                          passed
                            ? 'rgba(16, 185, 129, 0.55)'
                            : active
                            ? 'rgba(0, 229, 255, 0.6)'
                            : 'rgba(148, 163, 184, 0.18)'
                        }`,
                        fontFamily: EP2_FONTS.mono,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: passed
                          ? '#6EE7B7'
                          : active
                          ? '#7DD3FC'
                          : EP2_COLORS.muted,
                      }}
                    >
                      <span>
                        {passed ? '✓' : active ? '●' : '○'} {stage.shortLabel}
                      </span>
                      <span>{passed ? 'OK' : active ? 'RUN' : 'WAIT'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Telemetry mini bar saat tahap stress test aktif / selesai */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  color: frame >= 492 ? '#6EE7B7' : EP2_COLORS.muted,
                }}
              >
                <span>
                  {frame >= 492 ? `CPU ${cpuTempC}°C • GPU ${gpuTempC}°C` : 'BEBAN: STANDBY'}
                </span>
                <span>{frame >= 492 ? `LOAD ${stressLoadPct}%` : '+12V: 12.02V'}</span>
              </div>

              <div
                style={{
                  width: '100%',
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: 'rgba(148, 163, 184, 0.18)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${qcProgress}%`,
                    height: '100%',
                    borderRadius: 999,
                    background:
                      passedCount === 3
                        ? EP2_COLORS.ground
                        : `linear-gradient(90deg, ${EP2_COLORS.data}, ${EP2_COLORS.ground})`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Status Pill di Bawah Area 3D & di Atas Subtitle (Y: 1388) */}
          <div
            style={{
              position: 'absolute',
              top: 1388,
              left: EP2_SAFE.left,
              width: EP2_SAFE.contentWidth,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                borderRadius: 999,
                backgroundColor: 'rgba(11, 17, 29, 0.88)',
                border: `1px solid ${statusColor}66`,
                boxShadow: '0 10px 28px rgba(0, 0, 0, 0.45)',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: statusColor,
                  boxShadow: `0 0 10px ${statusColor}`,
                }}
              />
              <span
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 0.7,
                  color: EP2_COLORS.ink,
                }}
              >
                {statusText}
              </span>
            </div>
          </div>
        </CameraRig>
      </SeamlessSceneShell>

      {/* Bottom Subtitle Bar di Area Aman Bawah (>= 300px dari tepi bawah) */}
      <BottomSubtitleBar
        words={SCENE4_WORDS}
        stylePreset={EP2_STYLE_PRESET}
        fontSize={32}
        bottomOffset={EP2_SAFE.subtitleBottomOffset}
        maxWordsPerLine={6}
      />
    </AbsoluteFill>
  );
};
