import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  AudioStage,
  BottomSubtitleBar,
  CameraRig,
  Clean3DCardFace,
  CustomSVGIcon,
  FlyText,
  ProceduralBackground,
  SeamlessSceneShell,
  SfxCue,
  type Card3DItem,
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
  SCENE2_WORDS,
} from './constants';
import { CpuChip, RAM_ON_BOARD_ROTATION, RamStick } from './components/CpuRam';
import { GpuCard, GPU_ON_BOARD_ROTATION } from './components/GpuCard';
import { MB_LAYOUT, Motherboard } from './components/Motherboard';
import { NvmeSsd } from './components/NvmeSsd';
import {
  Box,
  Cyl,
  StudioEnvironment,
  type V3,
} from './components/partsCommon';
import { CASE_LAYOUT, PcCase, Psu } from './components/PsuAndCase';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const DEG = Math.PI / 180;

// ============================================================================
// Procedural CanvasTextures untuk Layar Monitor Setup A (POS) & Setup B (3D/Video)
// ============================================================================
const screenTexCache = new Map<string, THREE.CanvasTexture>();

const createCachedCanvasTex = (
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
) => {
  const cached = screenTexCache.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  screenTexCache.set(key, tex);
  return tex;
};

const getPosScreenTexture = () =>
  createCachedCanvasTex('ep2-s2-pos-screen', 1024, 576, (ctx, w, h) => {
    // Latar aplikasi POS & laporan terang bersih
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, w, h);

    // Header bar
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, w, 68);
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(36, 34, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('MOHEF POS • KASIR & LAPORAN KERJA', 62, 42);

    ctx.fillStyle = '#10B981';
    ctx.fillRect(w - 235, 18, 210, 32);
    ctx.fillStyle = '#052E16';
    ctx.font = 'bold 17px monospace';
    ctx.fillText('STABIL • 24 JAM', w - 214, 40);

    // Panel kiri: Tabel transaksi kasir POS
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(24, 90, 560, 460);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 90, 560, 460);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('TRANSAKSI AKTIF #INV-2084', 44, 130);

    const rows = [
      ['Paket Kopi Arabika 250g', '2x', 'Rp 150.000'],
      ['Kertas Thermal 80mm', '5x', 'Rp 95.000'],
      ['Flashdisk 64GB USB 3.2', '1x', 'Rp 115.000'],
      ['Kabel LAN Cat6 5m', '3x', 'Rp 135.000'],
    ];
    rows.forEach(([name, qty, price], i) => {
      const y = 165 + i * 62;
      ctx.fillStyle = i % 2 === 0 ? '#F1F5F9' : '#FFFFFF';
      ctx.fillRect(42, y, 524, 52);
      ctx.fillStyle = '#1E293B';
      ctx.font = '600 19px Inter, sans-serif';
      ctx.fillText(name, 56, y + 32);
      ctx.fillStyle = '#64748B';
      ctx.fillText(qty, 345, y + 32);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 19px monospace';
      ctx.fillText(price, 418, y + 32);
    });

    // Tombol Bayar POS
    ctx.fillStyle = '#10B981';
    ctx.fillRect(42, 434, 524, 92);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('TOTAL: Rp 495.000  •  CETAK STRUK', 68, 490);

    // Panel kanan: Grafik laporan penjualan harian
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(606, 90, 394, 460);
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeRect(606, 90, 394, 460);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 21px Inter, sans-serif';
    ctx.fillText('OMZET & STATUS DAYA', 628, 130);

    const bars = [120, 175, 145, 210, 240, 195, 255];
    bars.forEach((bh, i) => {
      const bx = 638 + i * 48;
      ctx.fillStyle = i === 6 ? '#10B981' : '#38BDF8';
      ctx.fillRect(bx, 420 - bh, 32, bh);
    });

    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(628, 444, 350, 82);
    ctx.fillStyle = '#065F46';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('BEBAN DAYA: 65W (HEMAT)', 648, 492);
  });

const getCreatorScreenTexture = () =>
  createCachedCanvasTex('ep2-s2-creator-screen', 1280, 540, (ctx, w, h) => {
    // Latar dark studio 3D modeling + timeline video
    ctx.fillStyle = '#0B101B';
    ctx.fillRect(0, 0, w, h);

    // Top bar software
    ctx.fillStyle = '#131B2E';
    ctx.fillRect(0, 0, w, 48);
    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('STUDIO 3D VIEWPORT  +  TIMELINE RENDER 4K', 24, 31);
    ctx.fillStyle = '#FF7A2F';
    ctx.fillRect(w - 230, 10, 206, 28);
    ctx.fillStyle = '#070B12';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('GPU RENDER: 60 FPS', w - 216, 30);

    // Viewport 3D (kiri atas)
    ctx.fillStyle = '#070C15';
    ctx.fillRect(18, 62, 840, 270);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 62, 840, 270);

    // Grid perspektif 3D di dalam viewport
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.22)';
    for (let i = 0; i <= 10; i++) {
      const gx = 100 + i * 68;
      ctx.beginPath();
      ctx.moveTo(gx, 310);
      ctx.lineTo(438 + (gx - 438) * 0.45, 170);
      ctx.stroke();
    }
    for (let j = 0; j < 5; j++) {
      const gy = 175 + j * 32;
      ctx.beginPath();
      ctx.moveTo(140 - j * 18, gy);
      ctx.lineTo(740 + j * 18, gy);
      ctx.stroke();
    }

    // Wireframe objek 3D di viewport
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(350, 118, 175, 130);
    ctx.strokeStyle = '#FF7A2F';
    ctx.strokeRect(390, 96, 175, 130);
    ctx.beginPath();
    ctx.moveTo(350, 118);
    ctx.lineTo(390, 96);
    ctx.moveTo(525, 118);
    ctx.lineTo(565, 96);
    ctx.moveTo(350, 248);
    ctx.lineTo(390, 226);
    ctx.moveTo(525, 248);
    ctx.lineTo(565, 226);
    ctx.stroke();

    // Panel node & shader (kanan atas)
    ctx.fillStyle = '#111827';
    ctx.fillRect(874, 62, 388, 270);
    ctx.strokeStyle = '#1E293B';
    ctx.strokeRect(874, 62, 388, 270);
    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('INSPECTOR & RENDER', 894, 96);

    const nodes = [
      { y: 118, c: '#00E5FF', label: 'RAYTRACING: AKTIF' },
      { y: 184, c: '#FF7A2F', label: 'VRAM GPU: 12 GB' },
      { y: 250, c: '#10B981', label: 'MULTITASKING: 32 GB' },
    ];
    nodes.forEach((n) => {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(894, n.y, 348, 48);
      ctx.fillStyle = n.c;
      ctx.fillRect(894, n.y, 10, 48);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 17px monospace';
      ctx.fillText(n.label, 916, n.y + 30);
    });

    // Timeline Video Editing (bawah penuh)
    ctx.fillStyle = '#0E1525';
    ctx.fillRect(18, 348, 1244, 174);
    ctx.strokeStyle = '#1E293B';
    ctx.strokeRect(18, 348, 1244, 174);

    // Track V1, V2, A1
    const clips = [
      { x: 40, y: 368, w: 310, c: '#00E5FF', t: '3D_CAM_INTRO.MP4' },
      { x: 362, y: 368, w: 410, c: '#38BDF8', t: 'COLOR_GRADE_4K.MOV' },
      { x: 784, y: 368, w: 450, c: '#FF7A2F', t: 'RENDER_FINAL_VFX' },
      { x: 140, y: 420, w: 480, c: '#A855F7', t: 'MOTION_OVERLAY' },
      { x: 40, y: 470, w: 1194, c: '#10B981', t: 'AUDIO_MIX_MASTER.WAV' },
    ];
    clips.forEach((cl) => {
      ctx.fillStyle = cl.c;
      ctx.fillRect(cl.x, cl.y, cl.w, 38);
      ctx.fillStyle = '#070B12';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(cl.t, cl.x + 12, cl.y + 24);
    });

    // Playhead merah-oranye
    ctx.fillStyle = '#FF7A2F';
    ctx.fillRect(620, 348, 4, 174);
  });

const getSecondaryMonitorTexture = () =>
  createCachedCanvasTex('ep2-s2-secondary-screen', 640, 400, (ctx, w, h) => {
    ctx.fillStyle = '#090F1A';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('EXPORT PROGRESS', 34, 58);

    ctx.fillStyle = '#1E293B';
    ctx.fillRect(34, 92, w - 68, 34);
    ctx.fillStyle = '#FF7A2F';
    ctx.fillRect(34, 92, (w - 68) * 0.78, 34);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('78% • 00:42 SISA', 34, 178);

    // Waveform audio / load monitor
    for (let i = 0; i < 24; i++) {
      const bh = 30 + Math.abs(Math.sin(i * 0.8)) * 95;
      ctx.fillStyle = i % 3 === 0 ? '#FF7A2F' : '#00E5FF';
      ctx.fillRect(34 + i * 24, 345 - bh, 15, bh);
    }
  });

// ============================================================================
// Kamera Perspektif 3D + Transisi Turntable Setup A <-> Setup B
// ============================================================================
interface CamPose {
  dist: number;
  az: number;
  el: number;
  fov: number;
  target: V3;
}

const applyPerspectivePose = (
  cam: THREE.PerspectiveCamera,
  pose: CamPose,
  width: number,
  height: number,
  focusY: number
) => {
  const az = pose.az * DEG;
  const el = pose.el * DEG;
  const [tx, ty, tz] = pose.target;
  cam.fov = pose.fov;
  cam.aspect = width / height;
  cam.near = 0.5;
  cam.far = 180;
  cam.position.set(
    tx + pose.dist * Math.cos(el) * Math.sin(az),
    ty + pose.dist * Math.sin(el),
    tz + pose.dist * Math.cos(el) * Math.cos(az)
  );
  cam.up.set(0, 1, 0);
  cam.lookAt(tx, ty, tz);
  cam.setViewOffset(width, height, 0, height / 2 - focusY, width, height);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
};

const SceneCameraController: React.FC<{
  pose: CamPose;
  width: number;
  height: number;
  focusY: number;
}> = ({ pose, width, height, focusY }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    applyPerspectivePose(camera, pose, width, height, focusY);
  }, [camera, pose, width, height, focusY]);
  return null;
};

const resolveNeedsCameraPose = (frame: number): CamPose => {
  const introPush = interpolate(frame, [0, 56], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const turnArc = Math.sin(
    interpolate(frame, [174, 212], [0, Math.PI], clamp)
  );

  const dist = 27.5 - introPush * 3.4 + turnArc * 3.8;
  const az = 18 - introPush * 4 + Math.sin(frame * 0.025) * 2.2;
  const el = 20 - introPush * 2.5 + turnArc * 3.5;

  return {
    dist,
    az,
    el,
    fov: 40,
    target: [0, 2.3, 1.3],
  };
};

// ============================================================================
// Setup A (Usaha, Kantor & Kasir) & Setup B (Kreator, Desain 3D & Gaming)
// ============================================================================
const OfficeKasirSetup: React.FC<{ frame: number }> = ({ frame }) => {
  const posTex = useMemo(getPosScreenTexture, []);
  const laserPulse = 0.65 + 0.35 * Math.sin(frame * 0.45);
  const receiptRise = interpolate(frame % 120, [0, 75, 120], [0.15, 0.85, 0.85], clamp);

  return (
    <group position={[0, 0, 0.22]}>
      {/* Lantai kantor terang rapi */}
      <Box size={[8.8, 0.26, 4.4]} position={[0, -0.13, 2.2]} color="#E5DED4" roughness={0.75} />
      {/* Dinding kantor terang bersih */}
      <Box size={[8.8, 5.4, 0.22]} position={[0, 2.7, 0.08]} color="#EDF2F7" roughness={0.85} />
      {/* Lis dinding biru-slate lembut */}
      <Box size={[8.8, 0.22, 0.06]} position={[0, 0.11, 0.21]} color="#CBD5E1" roughness={0.6} />
      {/* Papan nama zona kantor di dinding */}
      <Box size={[2.9, 0.72, 0.06]} position={[-2.2, 4.15, 0.22]} color="#0F172A" roughness={0.4} />
      <Box
        size={[2.6, 0.08, 0.04]}
        position={[-2.2, 3.84, 0.24]}
        color="#10B981"
        emissive="#10B981"
        emissiveIntensity={1.2}
      />

      {/* Meja kasir / kantor putih-oak bersih */}
      <group position={[0, 0, 1.9]}>
        {/* Daun meja */}
        <Box size={[7.2, 0.22, 3.1]} position={[0, 2.45, 0]} color="#F8FAFC" roughness={0.45} />
        <Box size={[7.2, 0.08, 3.1]} position={[0, 2.31, 0]} color="#D6B08A" roughness={0.65} />
        {/* Kaki meja bersih */}
        <Box size={[0.24, 2.28, 2.6]} position={[-3.25, 1.14, 0]} color="#94A3B8" metalness={0.35} roughness={0.45} />
        <Box size={[0.24, 2.28, 2.6]} position={[3.25, 1.14, 0]} color="#94A3B8" metalness={0.35} roughness={0.45} />
        {/* Panel depan meja kasir */}
        <Box size={[6.3, 1.75, 0.14]} position={[0, 1.38, -1.1]} color="#E2E8F0" roughness={0.6} />

        {/* Desk mat minimalis */}
        <Box size={[3.2, 0.03, 1.45]} position={[-0.75, 2.575, 0.45]} color="#CBD5E1" roughness={0.85} />
        {/* Keyboard & mouse kantor minimalis */}
        <Box size={[1.45, 0.06, 0.52]} position={[-1.1, 2.61, 0.5]} color="#F1F5F9" roughness={0.4} />
        <Box size={[0.28, 0.07, 0.45]} position={[0.1, 2.61, 0.5]} color="#E2E8F0" roughness={0.4} />

        {/* Monitor POS / Laporan Kerja dengan CanvasTexture */}
        <group position={[-0.7, 2.56, -0.58]}>
          <Box size={[0.95, 0.08, 0.72]} position={[0, 0.04, 0]} color="#CBD5E1" metalness={0.4} />
          <Box size={[0.16, 0.86, 0.14]} position={[0, 0.46, -0.12]} color="#94A3B8" metalness={0.5} />
          <Box size={[2.9, 1.68, 0.1]} position={[0, 1.32, 0]} color="#1E293B" roughness={0.4} />
          <mesh position={[0, 1.32, 0.056]}>
            <planeGeometry args={[2.72, 1.5]} />
            <meshStandardMaterial
              color="#ffffff"
              map={posTex}
              emissive="#ffffff"
              emissiveMap={posTex}
              emissiveIntensity={0.62}
              roughness={0.28}
            />
          </mesh>
        </group>

        {/* Printer Struk Mini (Thermal Receipt Printer) */}
        <group position={[-2.65, 2.56, 0.25]} rotation={[0, 0.22, 0]}>
          <Box size={[0.68, 0.46, 0.78]} position={[0, 0.23, 0]} color="#1E293B" roughness={0.45} />
          <Box size={[0.56, 0.04, 0.14]} position={[0, 0.465, 0.14]} color="#0F172A" />
          {/* Kertas struk keluar dari printer */}
          <Box
            size={[0.42, 0.12 + receiptRise * 0.48, 0.02]}
            position={[0, 0.48 + receiptRise * 0.22, 0.14]}
            rotation={[0.18, 0, 0]}
            color="#FFFFFF"
            emissive="#F8FAFC"
            emissiveIntensity={0.25}
          />
          <Box
            size={[0.1, 0.04, 0.02]}
            position={[0.2, 0.34, 0.395]}
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={1.6}
          />
        </group>

        {/* Handheld Barcode Scanner + Stand + Laser Scan */}
        <group position={[1.15, 2.56, 0.48]} rotation={[0, -0.25, 0]}>
          <Cyl radius={0.22} height={0.07} position={[0, 0.035, 0]} color="#1E293B" />
          <Box size={[0.09, 0.54, 0.09]} position={[0, 0.3, -0.05]} rotation={[0.22, 0, 0]} color="#334155" />
          <group position={[0, 0.56, 0.06]} rotation={[0.42, 0, 0]}>
            <Box size={[0.18, 0.18, 0.42]} position={[0, 0, 0.08]} color="#0F172A" />
            <Box
              size={[0.14, 0.09, 0.03]}
              position={[0, 0, 0.295]}
              color="#EF4444"
              emissive="#EF4444"
              emissiveIntensity={1.6 * laserPulse}
            />
            <Box
              size={[0.32, 0.015, 0.68]}
              position={[0, -0.22, 0.42]}
              rotation={[0.48, 0, 0]}
              color="#EF4444"
              emissive="#EF4444"
              emissiveIntensity={1.5 * laserPulse}
              transparent
              opacity={0.55 * laserPulse}
            />
          </group>
        </group>

        {/* Unit PC Kantor Ringkas & Rapi di Sisi Kanan Meja */}
        <group position={[2.45, 2.56, -0.22]} rotation={[0, -0.18, 0]}>
          <Box size={[0.92, 1.85, 1.75]} position={[0, 0.925, 0]} color="#334155" metalness={0.35} roughness={0.45} />
          <Box size={[0.84, 1.75, 0.05]} position={[0, 0.925, 0.88]} color="#1E293B" roughness={0.5} />
          {/* Kisi ventilasi depan bersih */}
          {[0.45, 0.65, 0.85, 1.05, 1.25].map((vy) => (
            <Box key={vy} size={[0.62, 0.05, 0.02]} position={[0, vy, 0.91]} color="#0F172A" />
          ))}
          {/* Tombol & LED Status Hemat Daya (Hijau Stabil) */}
          <Cyl
            radius={0.055}
            height={0.03}
            axis="z"
            position={[0, 1.54, 0.91]}
            color="#10B981"
            emissive="#10B981"
            emissiveIntensity={1.8}
          />
        </group>
      </group>
    </group>
  );
};

const CreatorGamingSetup: React.FC<{ frame: number }> = ({ frame }) => {
  const creatorTex = useMemo(getCreatorScreenTexture, []);
  const secondTex = useMemo(getSecondaryMonitorTexture, []);
  const fanAngle = frame * 0.28;
  const ledPhase = frame * 0.015;

  return (
    <group position={[0, 0, -0.22]} rotation={[0, Math.PI, 0]}>
      {/* Lantai kayu walnut gelap studio kreator */}
      <Box size={[8.8, 0.26, 4.4]} position={[0, -0.13, 2.2]} color="#29201B" roughness={0.72} />
      {/* Dinding gelap studio dengan panel akustik */}
      <Box size={[8.8, 5.4, 0.22]} position={[0, 2.7, 0.08]} color="#111827" roughness={0.85} />
      {/* Panel akustik 3D di dinding belakang */}
      {[-2.8, -1.7, -0.6, 0.5, 1.6, 2.7].map((ax, idx) => (
        <Box
          key={ax}
          size={[0.88, 1.8, 0.12]}
          position={[ax, 3.85, 0.24]}
          color={idx % 2 === 0 ? '#1E293B' : '#0F172A'}
          roughness={0.88}
        />
      ))}
      {/* Strip LED dinding dual-tone biru-sian & oranye hangat */}
      <Box
        size={[3.5, 0.1, 0.08]}
        position={[-1.95, 2.75, 0.22]}
        color={EP2_COLORS.data}
        emissive={EP2_COLORS.data}
        emissiveIntensity={1.9}
      />
      <Box
        size={[3.5, 0.1, 0.08]}
        position={[1.95, 2.75, 0.22]}
        color={EP2_COLORS.power}
        emissive={EP2_COLORS.power}
        emissiveIntensity={1.9}
      />

      {/* Meja studio kreator luas */}
      <group position={[0, 0, 1.9]}>
        <Box size={[7.6, 0.22, 3.2]} position={[0, 2.45, 0]} color="#1B2230" roughness={0.5} />
        {/* Aksen strip LED tepi belakang meja */}
        <Box
          size={[7.3, 0.05, 0.05]}
          position={[0, 2.45, -1.58]}
          color={EP2_COLORS.power}
          emissive={EP2_COLORS.power}
          emissiveIntensity={1.4}
        />
        <Box size={[0.26, 2.34, 2.7]} position={[-3.45, 1.17, 0]} color="#0F172A" metalness={0.6} roughness={0.4} />
        <Box size={[0.26, 2.34, 2.7]} position={[3.45, 1.17, 0]} color="#0F172A" metalness={0.6} roughness={0.4} />

        {/* Desk mat gelap luas */}
        <Box size={[4.2, 0.03, 1.55]} position={[-1.0, 2.575, 0.45]} color="#0B0F17" roughness={0.9} />
        {/* Keyboard mechanical + mouse dengan aksen LED */}
        <Box size={[1.55, 0.07, 0.56]} position={[-1.35, 2.61, 0.52]} color="#16191E" roughness={0.45} />
        <Box
          size={[1.45, 0.015, 0.46]}
          position={[-1.35, 2.648, 0.52]}
          color={EP2_COLORS.data}
          emissive={EP2_COLORS.data}
          emissiveIntensity={0.9}
        />
        <Box size={[0.28, 0.08, 0.48]} position={[-0.1, 2.61, 0.52]} color="#16191E" roughness={0.4} />

        {/* Headset Stand & Studio Headphones di sisi kiri meja */}
        <group position={[-3.15, 2.56, 0.45]}>
          <Cyl radius={0.22} height={0.05} position={[0, 0.025, 0]} color="#1E293B" metalness={0.6} />
          <Box size={[0.06, 0.92, 0.06]} position={[0, 0.48, 0]} color="#334155" metalness={0.6} />
          <Box size={[0.26, 0.08, 0.14]} position={[0, 0.94, 0]} color="#0F172A" />
          {/* Earcups headset */}
          <Box size={[0.14, 0.34, 0.28]} position={[-0.18, 0.62, 0]} color="#1E293B" />
          <Box size={[0.14, 0.34, 0.28]} position={[0.18, 0.62, 0]} color="#1E293B" />
          <Cyl radius={0.11} height={0.03} axis="x" position={[-0.255, 0.62, 0]} color={EP2_COLORS.power} emissive={EP2_COLORS.power} emissiveIntensity={1.2} />
          <Cyl radius={0.11} height={0.03} axis="x" position={[0.255, 0.62, 0]} color={EP2_COLORS.power} emissive={EP2_COLORS.power} emissiveIntensity={1.2} />
        </group>

        {/* Monitor Utama Ultrawide (Viewport 3D + Timeline Editing) */}
        <group position={[-1.45, 2.56, -0.62]} rotation={[0, 0.06, 0]}>
          <Box size={[1.1, 0.08, 0.72]} position={[0, 0.04, 0]} color="#1E293B" metalness={0.6} />
          <Box size={[0.18, 0.88, 0.14]} position={[0, 0.46, -0.14]} color="#1E293B" metalness={0.6} />
          <Box size={[3.65, 1.62, 0.1]} position={[0, 1.32, 0]} color="#0F172A" roughness={0.4} />
          <mesh position={[0, 1.32, 0.056]}>
            <planeGeometry args={[3.48, 1.46]} />
            <meshStandardMaterial
              color="#ffffff"
              map={creatorTex}
              emissive="#ffffff"
              emissiveMap={creatorTex}
              emissiveIntensity={0.78}
              roughness={0.25}
            />
          </mesh>
        </group>

        {/* Monitor Kedua (Render Queue & Telemetry) */}
        <group position={[0.85, 2.56, -0.45]} rotation={[0, -0.32, 0]}>
          <Box size={[0.6, 0.07, 0.5]} position={[0, 0.035, 0]} color="#1E293B" metalness={0.6} />
          <Box size={[0.12, 0.76, 0.1]} position={[0, 0.4, -0.08]} color="#1E293B" metalness={0.6} />
          <Box size={[1.45, 0.96, 0.08]} position={[0, 1.12, 0]} color="#0F172A" roughness={0.4} />
          <mesh position={[0, 1.12, 0.046]}>
            <planeGeometry args={[1.34, 0.84]} />
            <meshStandardMaterial
              color="#ffffff"
              map={secondTex}
              emissive="#ffffff"
              emissiveMap={secondTex}
              emissiveIntensity={0.72}
              roughness={0.25}
            />
          </mesh>
        </group>

        {/* PC Rakitan Performa Tinggi (Komponen Ep.2 skala proporsional di atas meja) */}
        <group position={[2.45, 2.56, 0.0]} rotation={[0, -0.35, 0]} scale={0.5}>
          <PcCase
            glassOpen={0.42}
            fanAngle={fanAngle}
            intakeColor={EP2_COLORS.data}
            exhaustColor={EP2_COLORS.power}
            ringIntensity={1.85}
          >
            <Psu position={CASE_LAYOUT.psuCenter} fanAngle={fanAngle} />
            <group position={CASE_LAYOUT.mbOrigin}>
              <Motherboard />
              <CpuChip
                position={[MB_LAYOUT.socket[0], MB_LAYOUT.socket[1], MB_LAYOUT.frontZ + 0.018]}
              />
              <RamStick
                position={[MB_LAYOUT.dimmU[1], MB_LAYOUT.dimmV, MB_LAYOUT.frontZ + 0.05]}
                rotation={RAM_ON_BOARD_ROTATION}
                ledPhase={ledPhase}
                ledIntensity={1.9}
              />
              <RamStick
                position={[MB_LAYOUT.dimmU[3], MB_LAYOUT.dimmV, MB_LAYOUT.frontZ + 0.05]}
                rotation={RAM_ON_BOARD_ROTATION}
                ledPhase={ledPhase + 0.35}
                ledIntensity={1.9}
              />
              <NvmeSsd
                position={[MB_LAYOUT.m2.centerU, MB_LAYOUT.m2.v, MB_LAYOUT.frontZ + 0.018]}
              />
              <GpuCard
                position={[-1.23, MB_LAYOUT.pcie1V, 0.14]}
                rotation={GPU_ON_BOARD_ROTATION}
                fanAngle={fanAngle}
                ledColor={EP2_COLORS.data}
              />
            </group>
          </PcCase>
        </group>
      </group>
    </group>
  );
};

interface NeedsDioramaStage3DProps {
  frame: number;
}

const NeedsDioramaStage3D: React.FC<NeedsDioramaStage3DProps> = ({ frame }) => {
  const pose = useMemo(() => resolveNeedsCameraPose(frame), [frame]);

  // Transisi mulus turntable 0° (Setup A: Usaha & Kasir) -> 180° (Setup B: Kreator & Gaming)
  const turnProgress = interpolate(frame, [174, 212], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const turntableRotY = turnProgress * Math.PI;

  const ambientIntensity = interpolate(turnProgress, [0, 1], [0.85, 0.36], clamp);
  const keyColor = interpolateColors(turnProgress, [0, 1], ['#FFFDF8', '#93C5FD']);
  const keyIntensity = interpolate(turnProgress, [0, 1], [2.2, 1.65], clamp);
  const rimColor = interpolateColors(turnProgress, [0, 1], ['#BAE6FD', '#FF7A2F']);

  return (
    <ThreeCanvas
      width={EP2_WIDTH}
      height={EP2_HEIGHT}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      camera={{ fov: 40, near: 0.5, far: 180, position: [8, 10, 24] }}
    >
      <SceneCameraController pose={pose} width={EP2_WIDTH} height={EP2_HEIGHT} focusY={1135} />
      <StudioEnvironment intensity={interpolate(turnProgress, [0, 1], [0.9, 0.65], clamp)} />

      {/* Pencahayaan ruangan bertransisi dari daylight kantor -> studio kreator dramatis */}
      <ambientLight intensity={ambientIntensity} />
      <hemisphereLight
        args={[
          turnProgress < 0.5 ? '#E0F2FE' : '#38BDF8',
          turnProgress < 0.5 ? '#CBD5E1' : '#0F172A',
          interpolate(turnProgress, [0, 1], [0.95, 0.45], clamp),
        ]}
      />
      <directionalLight position={[8, 14, 12]} intensity={keyIntensity} color={keyColor} />
      <directionalLight position={[-9, 6, 8]} intensity={1.15} color={rimColor} />

      {turnProgress > 0.35 && (
        <pointLight
          position={[0, 4.2, 3.2]}
          intensity={1.9 * turnProgress}
          distance={14}
          color={EP2_COLORS.power}
        />
      )}

      {/* Platform Turntable Dua Sisi (Setup A di depan, Setup B di sisi berlawanan) */}
      <group rotation={[0, turntableRotY, 0]}>
        {/* Alas platform studio */}
        <Box size={[9.1, 0.36, 9.1]} position={[0, -0.44, 0]} color="#0F172A" metalness={0.5} roughness={0.45} />
        <Box
          size={[9.22, 0.06, 9.22]}
          position={[0, -0.28, 0]}
          color={turnProgress < 0.5 ? EP2_COLORS.ground : EP2_COLORS.data}
          emissive={turnProgress < 0.5 ? EP2_COLORS.ground : EP2_COLORS.data}
          emissiveIntensity={1.1}
        />

        <OfficeKasirSetup frame={frame} />
        <CreatorGamingSetup frame={frame} />
      </group>
    </ThreeCanvas>
  );
};

export const Scene2Needs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sinkronisasi ketat terhadap public/audio/vo/ep2-scene2-words.json
  const cardsEnter = spring({
    frame: frame - 42,
    fps,
    config: { damping: 16, stiffness: 160 },
  });

  const focusShift = interpolate(frame, [178, 198], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  const isBusinessActive = frame >= 50 && frame < 182;
  const isCreatorActive = frame >= 182;

  const businessScale = isBusinessActive ? 1.02 : isCreatorActive ? 0.95 : 0.98;
  const creatorScale = isCreatorActive ? 1.02 : isBusinessActive ? 0.95 : 0.98;

  const businessOpacity = isCreatorActive ? 0.72 : 1;
  const creatorOpacity = frame < 180 ? (frame < 50 ? 0.9 : 0.72) : 1;

  const businessCard: Card3DItem = {
    id: 'setup-usaha-kasir',
    indexLabel: 'PROFIL 01',
    title: 'Usaha, Kantor & Kasir',
    accentColor: EP2_COLORS.ground,
    surfaceColor: isBusinessActive ? '#0D2620' : '#121B2B',
    textColor: EP2_COLORS.ink,
    content: (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            fontFamily: EP2_FONTS.heading,
            fontSize: 25,
            fontWeight: 800,
            lineHeight: 1.15,
            color: EP2_COLORS.ink,
          }}
        >
          Usaha, Kantor &amp; Kasir
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {['Hemat Daya Listrik', 'Stabil Nyala Seharian', 'Komponen Awet Jangka Panjang'].map(
            (bullet) => (
              <div
                key={bullet}
                style={{
                  padding: '7px 11px',
                  borderRadius: 9,
                  backgroundColor: 'rgba(16, 185, 129, 0.14)',
                  border: `1px solid rgba(16, 185, 129, ${isBusinessActive ? 0.55 : 0.25})`,
                  fontFamily: EP2_FONTS.body,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#6EE7B7',
                }}
              >
                ✓ {bullet}
              </div>
            )
          )}
        </div>
      </div>
    ),
  };

  const creatorCard: Card3DItem = {
    id: 'setup-kreator-gaming',
    indexLabel: 'PROFIL 02',
    title: 'Kreator, Desain 3D & Gaming',
    accentColor: EP2_COLORS.data,
    surfaceColor: isCreatorActive ? '#0D2234' : '#121B2B',
    textColor: EP2_COLORS.ink,
    content: (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            fontFamily: EP2_FONTS.heading,
            fontSize: 25,
            fontWeight: 800,
            lineHeight: 1.15,
            color: EP2_COLORS.ink,
          }}
        >
          Kreator, Desain 3D &amp; Gaming
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {['Rendering Cepat', 'Multitasking Lancar', 'Performa Grafis Tinggi'].map((bullet) => (
            <div
              key={bullet}
              style={{
                padding: '7px 11px',
                borderRadius: 9,
                backgroundColor: 'rgba(0, 229, 255, 0.14)',
                border: `1px solid rgba(0, 229, 255, ${isCreatorActive ? 0.58 : 0.24})`,
                fontFamily: EP2_FONTS.body,
                fontSize: 16,
                fontWeight: 700,
                color: '#7DD3FC',
              }}
            >
              ✓ {bullet}
            </div>
          ))}
        </div>
      </div>
    ),
  };

  const statusText =
    frame < 52
      ? 'PETAKAN KEBUTUHAN SEBELUM PILIH KOMPONEN'
      : frame < 182
      ? 'SETUP A • KANTOR & KASIR POS: HEMAT DAYA & STABIL SEHARIAN'
      : 'SETUP B • STUDIO KREATOR & GAMING: RENDER CEPAT & GRAFIS TINGGI';

  const statusColor =
    frame < 52
      ? EP2_COLORS.power
      : frame < 182
      ? EP2_COLORS.ground
      : EP2_COLORS.data;

  return (
    <AbsoluteFill style={{ backgroundColor: EP2_COLORS.bg, fontFamily: EP2_FONTS.body }}>
      {/* Audio VO Scene 2 (existing) & BGM Auto-Ducking */}
      <Audio src={staticFile('audio/vo/ep2-scene2.mp3')} volume={1.0} />
      <AudioStage
        musicSrc={EP2_BGM}
        words={SCENE2_WORDS}
        bedSrc=""
        sfxTrackSrc=""
        baseMusicVolume={0.14}
      />

      {/* SFX Sinkron Scene 2 */}
      <SfxCue frame={42} sfx="transition-whoosh-soft" volume={0.4} />
      <SfxCue frame={58} sfx="pop-drop" volume={0.42} />
      <SfxCue frame={176} sfx="transition-whoosh-soft" volume={0.44} />
      <SfxCue frame={186} sfx="click-soft" volume={0.44} />
      <SfxCue frame={204} sfx="pop-drop" volume={0.38} />

      {/* Latar Prosedural Studio */}
      <ProceduralBackground stylePreset={EP2_STYLE_PRESET} driftSpeed={0.85} />

      {/* Panggung 3D Diorama Sudut Ruangan & Meja Kerja Setup A <-> Setup B */}
      <AbsoluteFill>
        <NeedsDioramaStage3D frame={frame} />
      </AbsoluteFill>

      {/* Gradien tipis atas & bawah */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(7, 11, 18, 0.88) 0%, rgba(7, 11, 18, 0.44) 32%, rgba(7, 11, 18, 0) 52%, rgba(7, 11, 18, 0.74) 100%)',
        }}
      />

      {/* Lapisan 2D Motion-Craft dalam Safe Zone (X: 90..960, Y: 56..1620) */}
      <SeamlessSceneShell
        startFrame={0}
        endFrame={EP2_DURATIONS.scene2}
        enterMode="portal-zoom-in"
        exitMode="none"
        background="transparent"
        enableTransitionSfx={false}
      >
        <CameraRig
          durationInFrames={EP2_DURATIONS.scene2}
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
              EP 02 • SCENE 02
            </div>
          </div>

          {/* Judul Pemetaan Kebutuhan (Y: 130..236) */}
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
                name="layers-stack"
                size={24}
                color={EP2_COLORS.ink}
                accentColor={EP2_COLORS.data}
                startFrame={4}
              />
              <span
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1.0,
                  color: EP2_COLORS.data,
                }}
              >
                LANGKAH 01 • BISNIS VS PERSONAL
              </span>
            </div>

            <FlyText
              text="PETAKAN KEBUTUHAN PC"
              start={6}
              stagger={1.3}
              dur={12}
              size={50}
              weight={900}
              family={EP2_FONTS.heading}
              color={EP2_COLORS.ink}
              flyingColor={EP2_COLORS.data}
              letterSpacing={-0.8}
            />
          </div>

          {/* Kartu Perbandingan Dua Profil di Area Atas/Tengah (Y: 254..582) */}
          {frame >= 40 && (
            <div
              style={{
                position: 'absolute',
                top: 254,
                left: EP2_SAFE.left,
                width: EP2_SAFE.contentWidth,
                height: 326,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 26,
                opacity: cardsEnter,
                transform: `translate3d(0, ${((1 - cardsEnter) * 28).toFixed(1)}px, 0)`,
              }}
            >
              <div
                style={{
                  opacity: businessOpacity,
                  transform: `scale(${(businessScale * (1 - focusShift * 0.03)).toFixed(3)})`,
                  transition: 'opacity 180ms ease',
                }}
              >
                <Clean3DCardFace
                  item={businessCard}
                  index={0}
                  width={422}
                  height={318}
                  isActive={isBusinessActive}
                  borderRadius={22}
                />
              </div>

              <div
                style={{
                  opacity: creatorOpacity,
                  transform: `scale(${(creatorScale * (0.97 + focusShift * 0.05)).toFixed(3)})`,
                  transition: 'opacity 180ms ease',
                }}
              >
                <Clean3DCardFace
                  item={creatorCard}
                  index={1}
                  width={422}
                  height={318}
                  isActive={isCreatorActive}
                  borderRadius={22}
                />
              </div>
            </div>
          )}

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
        words={SCENE2_WORDS}
        stylePreset={EP2_STYLE_PRESET}
        fontSize={32}
        bottomOffset={EP2_SAFE.subtitleBottomOffset}
        maxWordsPerLine={6}
      />
    </AbsoluteFill>
  );
};
