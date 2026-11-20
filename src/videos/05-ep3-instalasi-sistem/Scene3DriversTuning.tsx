import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { BottomSubtitleBar, SfxCue } from '../../lib/motion-craft';
import { tubeFromPoints, type V3 } from '../04-ep2-rakit-pc/components/partsCommon';
import { MB_LAYOUT } from '../04-ep2-rakit-pc/components/Motherboard';
import { CASE_DIM, CASE_LAYOUT } from '../04-ep2-rakit-pc/components/PsuAndCase';
import {
  EP3_BGM,
  EP3_COLORS,
  EP3_FONTS,
  EP3_HEIGHT,
  EP3_SAFE,
  EP3_STYLE_PRESET,
  EP3_WIDTH,
  SCENE3_BEATS,
  SCENE3_DURATION_FRAMES,
  SCENE3_WORDS,
} from './constants';
import {
  MONITOR_SCREEN,
  resolveCameraPose,
  WorkstationStage,
  type CamKeyframe,
} from './components/WorkstationStage';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const {
  badgeIn,
  titleIn,
  desktopIn,
  cardIn,
  chipsetStart,
  chipsetDone,
  gpuStart,
  gpuDone,
  nvmeStart,
  nvmeDone,
  tuningStart,
  tuningLocked,
} = SCENE3_BEATS;

// ============================================================================
// Data 3 komponen driver resmi (koordinat lokal casing untuk highlight & garis 3D)
// ============================================================================
const [MB_X, MB_Y, MB_Z] = CASE_LAYOUT.mbOrigin;
const PC_ROT_Y = -0.18;
const PC_CENTER_WORLD: V3 = [
  1.8 + CASE_DIM.halfZ * Math.sin(PC_ROT_Y),
  7.64,
  0.25 + CASE_DIM.halfZ * Math.cos(PC_ROT_Y),
];

/** Konversi titik dunia -> ruang lokal casing (invers dari caseLocalToWorld di WorkstationStage). */
const worldToCaseLocal = (w: V3): V3 => {
  const dx = w[0] - PC_CENTER_WORLD[0];
  const dy = w[1] - PC_CENTER_WORLD[1];
  const dz = w[2] - PC_CENTER_WORLD[2];
  const cosY = Math.cos(PC_ROT_Y);
  const sinY = Math.sin(PC_ROT_Y);
  return [dx * cosY - dz * sinY, dy, dx * sinY + dz * cosY];
};

/** Titik tepi kanan panel monitor di ruang lokal casing (sejajar baris ke-i pada layar). */
const monitorEdgeInCase = (dyFromCenter: number): V3 => {
  const mx = MONITOR_SCREEN.width / 2 + 0.04;
  const my = MONITOR_SCREEN.position[1] + dyFromCenter;
  const mz = 0.02;
  const rot = 0.08;
  const world: V3 = [
    -4.1 + mx * Math.cos(rot) + mz * Math.sin(rot),
    7.5 + my,
    -3.2 - mx * Math.sin(rot) + mz * Math.cos(rot),
  ];
  return worldToCaseLocal(world);
};

interface DriverTarget {
  id: 'chipset' | 'gpu' | 'nvme';
  hudLabel: string;
  hudTag: string;
  screenLine: string;
  startFrame: number;
  doneFrame: number;
  /** Pusat & ukuran frame sorotan 3D (ruang lokal casing). */
  frameCenter: V3;
  frameSize: [number, number];
  /** Titik awal & lengkungan garis penghubung ke tepi monitor. */
  curve: THREE.CatmullRomCurve3;
  tubeGeo: THREE.TubeGeometry;
}

const buildLinkCurve = (start: V3, mid1: V3, mid2: V3, end: V3) => {
  const pts: V3[] = [start, mid1, mid2, end];
  return {
    curve: new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(...p)),
      false,
      'catmullrom',
      0.4
    ),
    tubeGeo: tubeFromPoints(pts, 0.028, 44, 8),
  };
};

const DRIVER_TARGETS: readonly DriverTarget[] = [
  {
    id: 'chipset',
    hudLabel: 'Chipset Motherboard',
    hudTag: 'OFFICIAL DRIVER ✓',
    screenLine: 'CHIPSET MOTHERBOARD: OFFICIAL DRIVER ✓',
    startFrame: chipsetStart,
    doneFrame: chipsetDone,
    frameCenter: [MB_X + 0.65, MB_Y - 0.875, MB_Z + MB_LAYOUT.frontZ + 0.11],
    frameSize: [0.68, 0.72],
    ...buildLinkCurve(
      [MB_X + 0.65, MB_Y - 0.875, MB_Z + 0.14],
      [-0.5, 2.1, 1.35],
      [-2.1, 2.75, -0.75],
      monitorEdgeInCase(0.45)
    ),
  },
  {
    id: 'gpu',
    hudLabel: 'GPU Triple-Fan',
    hudTag: 'WHQL RELEASE ✓',
    screenLine: 'GPU TRIPLE-FAN: WHQL RELEASE DRIVER ✓',
    startFrame: gpuStart,
    doneFrame: gpuDone,
    frameCenter: [MB_X + 0.22, MB_Y - 0.68, MB_Z + 1.43],
    frameSize: [3.06, 0.56],
    ...buildLinkCurve(
      [MB_X - 0.6, MB_Y - 0.68, MB_Z + 1.45],
      [-1.7, 2.35, 1.45],
      [-2.6, 2.55, -0.95],
      monitorEdgeInCase(-0.02)
    ),
  },
  {
    id: 'nvme',
    hudLabel: 'NVMe M.2 Storage',
    hudTag: 'CONTROLLER OPTIMAL ✓',
    screenLine: 'NVMe M.2 STORAGE: CONTROLLER OPTIMAL ✓',
    startFrame: nvmeStart,
    doneFrame: nvmeDone,
    frameCenter: [MB_X + MB_LAYOUT.m2.centerU, MB_Y + MB_LAYOUT.m2.v, MB_Z + MB_LAYOUT.frontZ + 0.06],
    frameSize: [0.9, 0.3],
    ...buildLinkCurve(
      [MB_X + MB_LAYOUT.m2.centerU, MB_Y + MB_LAYOUT.m2.v, MB_Z + 0.1],
      [-1.35, 3.05, 1.28],
      [-2.35, 2.95, -0.85],
      monitorEdgeInCase(-0.48)
    ),
  },
];

// ============================================================================
// Isi layar monitor 3D (CanvasTexture 1340x720, Desktop OS Bersih + Sync & Tuning)
// ============================================================================
const SCREEN_W = 1340;
const SCREEN_H = 720;
const MONO = 'Menlo, Consolas, monospace';
const SANS = 'Inter, Arial, sans-serif';

const makeCanvas = (w: number, h: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
};

const makeTexture = (canvas: HTMLCanvasElement) => {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

const drawCheck = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y + size * 0.52);
  ctx.lineTo(x + size * 0.43, y + size * 0.72);
  ctx.lineTo(x + size * 0.77, y + size * 0.3);
  ctx.stroke();
};

/** Wallpaper Desktop OS bersih + taskbar bawah (dipakai di kedua layar agar kontinuitas terjaga). */
const drawCleanDesktopChrome = (ctx: CanvasRenderingContext2D, accentTint: string) => {
  const bg = ctx.createLinearGradient(0, 0, SCREEN_W, SCREEN_H);
  bg.addColorStop(0, '#07111F');
  bg.addColorStop(1, accentTint);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Taskbar OS bersih di tepi bawah
  ctx.fillStyle = 'rgba(8, 13, 22, 0.94)';
  ctx.fillRect(0, SCREEN_H - 64, SCREEN_W, 64);
  ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.fillRect(0, SCREEN_H - 64, SCREEN_W, 2);

  // Ikon menu OS (4 kotak presisi) + ikon aktif Mohef Sync di tengah taskbar
  const startX = SCREEN_W / 2 - 58;
  ctx.fillStyle = EP3_COLORS.data;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      ctx.fillRect(startX + c * 14, SCREEN_H - 46 + r * 14, 11, 11);
    }
  }
  ctx.fillStyle = '#162436';
  ctx.beginPath();
  ctx.roundRect(startX + 48, SCREEN_H - 52, 42, 40, 8);
  ctx.fill();
  ctx.fillStyle = EP3_COLORS.ground;
  ctx.fillRect(startX + 59, SCREEN_H - 14, 20, 4);

  // Jam & indikator jaringan bersih di sudut kanan taskbar
  ctx.fillStyle = '#CBD5E1';
  ctx.font = `bold 24px ${MONO}`;
  ctx.textAlign = 'right';
  ctx.fillText('OS BERSIH • 14:00', SCREEN_W - 36, SCREEN_H - 24, 340);
  ctx.textAlign = 'left';
};

/** Panel jendela aplikasi Mohef Tech di tengah desktop. */
const drawAppWindowFrame = (
  ctx: CanvasRenderingContext2D,
  subtitle: string,
  badgeText: string,
  badgeBg: string,
  badgeFg: string
) => {
  const wx = 56;
  const wy = 36;
  const ww = SCREEN_W - 112;
  const wh = SCREEN_H - 126;

  ctx.fillStyle = '#0B1320';
  ctx.beginPath();
  ctx.roundRect(wx, wy, ww, wh, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.34)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Header jendela
  ctx.fillStyle = '#101B2D';
  ctx.beginPath();
  ctx.roundRect(wx, wy, ww, 84, [20, 20, 0, 0]);
  ctx.fill();
  ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.fillRect(wx, wy + 84, ww, 2);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = `900 32px ${SANS}`;
  ctx.fillText('MOHEF TECH • DRIVER & HARDWARE SYNC', wx + 32, wy + 52, 780);

  ctx.fillStyle = badgeBg;
  ctx.beginPath();
  ctx.roundRect(wx + ww - 270, wy + 18, 240, 48, 10);
  ctx.fill();
  ctx.fillStyle = badgeFg;
  ctx.font = `bold 26px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, wx + ww - 150, wy + 50, 224);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#94A3B8';
  ctx.font = `600 28px ${SANS}`;
  ctx.fillText(subtitle, wx + 32, wy + 132, ww - 64);

  return { wx, wy, ww, wh };
};

/** State 0: Kelanjutan mulus layar Lisensi Resmi dari Scene 2 sebelum masuk desktop. */
const paintScene2Bridge = (ctx: CanvasRenderingContext2D) => {
  const g = ctx.createLinearGradient(0, 0, SCREEN_W, SCREEN_H);
  g.addColorStop(0, '#03140D');
  g.addColorStop(1, '#062A1C');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.fillStyle = EP3_COLORS.ground;
  ctx.beginPath();
  ctx.arc(210, 270, 130, 0, Math.PI * 2);
  ctx.fill();
  drawCheck(ctx, 80, 140, 260, '#03140D');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 84px ${SANS}`;
  ctx.fillText('LISENSI RESMI', 380, 246, 880);
  ctx.fillStyle = '#6EE7B7';
  ctx.font = `900 62px ${SANS}`;
  ctx.fillText('& AKTIVASI AMAN ✓', 380, 334, 880);
  ctx.strokeStyle = EP3_COLORS.ground;
  ctx.lineWidth = 4;
  ctx.strokeRect(80, 500, SCREEN_W - 160, 124);
  ctx.fillStyle = '#34D399';
  ctx.font = `bold 44px ${MONO}`;
  ctx.fillText('MEMUAT DESKTOP BERSIH...', 120, 577, SCREEN_W - 240);
};

interface SyncScreenState {
  /** Progres 0..100 tiap driver (dikuantisasi per 10% agar cache tekstur hemat). */
  pcts: readonly [number, number, number];
}

const paintDriverSync = (ctx: CanvasRenderingContext2D, { pcts }: SyncScreenState) => {
  const doneCount = pcts.filter((p) => p >= 100).length;
  drawCleanDesktopChrome(ctx, '#0D2138');
  const { wx, wy, ww } = drawAppWindowFrame(
    ctx,
    doneCount === 3
      ? 'Seluruh driver resmi terverifikasi. Menyiapkan penyetelan performa...'
      : 'Memverifikasi tanda tangan digital & paket driver resmi pabrikan',
    doneCount === 3 ? '3/3 RESMI ✓' : `SYNC ${doneCount}/3`,
    doneCount === 3 ? EP3_COLORS.ground : 'rgba(0, 229, 255, 0.18)',
    doneCount === 3 ? '#03140D' : EP3_COLORS.data
  );

  DRIVER_TARGETS.forEach((item, i) => {
    const pct = pcts[i];
    const done = pct >= 100;
    const active = pct > 0 && pct < 100;
    const ry = wy + 162 + i * 130;
    const rw = ww - 64;

    ctx.fillStyle = done
      ? 'rgba(16, 185, 129, 0.14)'
      : active
        ? 'rgba(0, 229, 255, 0.12)'
        : '#101A2B';
    ctx.beginPath();
    ctx.roundRect(wx + 32, ry, rw, 110, 14);
    ctx.fill();
    ctx.strokeStyle = done
      ? EP3_COLORS.ground
      : active
        ? EP3_COLORS.data
        : 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = done || active ? 3 : 2;
    ctx.stroke();

    // Kotak status kiri
    const bx = wx + 54;
    const by = ry + 27;
    ctx.beginPath();
    ctx.roundRect(bx, by, 56, 56, 12);
    if (done) {
      ctx.fillStyle = EP3_COLORS.ground;
      ctx.fill();
      drawCheck(ctx, bx, by, 56, '#03140D');
    } else if (active) {
      ctx.fillStyle = 'rgba(0, 229, 255, 0.22)';
      ctx.fill();
      ctx.strokeStyle = EP3_COLORS.data;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = EP3_COLORS.data;
      ctx.font = `bold 24px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.fillText(`${pct}%`, bx + 28, by + 37, 50);
      ctx.textAlign = 'left';
    } else {
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Teks utama driver
    ctx.fillStyle = done ? '#FFFFFF' : active ? '#E0F2FE' : '#94A3B8';
    ctx.font = `bold 34px ${MONO}`;
    const lineText = done
      ? item.screenLine
      : active
        ? `${item.hudLabel.toUpperCase()}: MEMASANG DRIVER RESMI...`
        : `${item.hudLabel.toUpperCase()}: MENUNGGU VERIFIKASI`;
    ctx.fillText(lineText, bx + 78, ry + 54, rw - 168);

    // Bilah progres tipis di bagian bawah baris
    const barX = bx + 78;
    const barY = ry + 76;
    const barW = rw - 178;
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 14, 7);
    ctx.fill();
    if (pct > 0) {
      ctx.fillStyle = done ? EP3_COLORS.ground : EP3_COLORS.data;
      ctx.beginPath();
      ctx.roundRect(barX, barY, Math.max(16, (barW * pct) / 100), 14, 7);
      ctx.fill();
    }
  });
};

const TUNING_METRICS = [
  { label: 'PCIe BUS LINK', value: 'GEN4 x16 • FULL BANDWIDTH', color: EP3_COLORS.ground },
  { label: 'MEMORY PROFILE', value: 'XMP / EXPO • DUAL CHANNEL', color: EP3_COLORS.data },
  { label: 'POWER PROFILE', value: 'STABIL • ZERO THROTTLE', color: EP3_COLORS.ground },
] as const;

const paintTuningScreen = (ctx: CanvasRenderingContext2D, tunePct: number) => {
  const locked = tunePct >= 100;
  drawCleanDesktopChrome(ctx, '#06261B');
  const { wx, wy, ww } = drawAppWindowFrame(
    ctx,
    locked
      ? 'Profil daya, jalur PCIe, dan kecepatan RAM terkunci optimal'
      : 'Menyetel profil daya, jalur PCIe, dan kecepatan memori...',
    locked ? 'OPTIMAL ✓' : `TUNING ${tunePct}%`,
    locked ? EP3_COLORS.ground : 'rgba(0, 229, 255, 0.2)',
    locked ? '#03140D' : EP3_COLORS.data
  );

  // Banner utama Power & Clock Tuning
  const bannerY = wy + 156;
  const rw = ww - 64;
  ctx.fillStyle = locked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 229, 255, 0.14)';
  ctx.beginPath();
  ctx.roundRect(wx + 32, bannerY, rw, 86, 14);
  ctx.fill();
  ctx.strokeStyle = locked ? EP3_COLORS.ground : EP3_COLORS.data;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.fillStyle = locked ? '#6EE7B7' : '#7DD3FC';
  ctx.font = `bold 34px ${MONO}`;
  ctx.fillText(
    locked
      ? 'POWER & CLOCK TUNING: OPTIMAL PERFORMANCE ✓'
      : `POWER & CLOCK TUNING: KALIBRASI ${tunePct}%`,
    wx + 58,
    bannerY + 55,
    rw - 52
  );

  // 3 bar parameter hardware tuning
  TUNING_METRICS.forEach((m, i) => {
    const ry = wy + 272 + i * 94;
    ctx.fillStyle = '#F8FAFC';
    ctx.font = `bold 29px ${MONO}`;
    ctx.fillText(m.label, wx + 36, ry + 26, 420);

    ctx.textAlign = 'right';
    ctx.fillStyle = locked ? '#6EE7B7' : '#CBD5E1';
    ctx.font = `bold 27px ${MONO}`;
    ctx.fillText(m.value, wx + ww - 36, ry + 26, 620);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#132638';
    ctx.beginPath();
    ctx.roundRect(wx + 36, ry + 44, rw - 8, 22, 11);
    ctx.fill();
    if (tunePct > 0) {
      ctx.fillStyle = locked ? EP3_COLORS.ground : m.color;
      ctx.beginPath();
      ctx.roundRect(wx + 36, ry + 44, Math.max(24, ((rw - 8) * tunePct) / 100), 22, 11);
      ctx.fill();
    }
  });
};

// Cache tekstur terpisah agar hanya menggambar ulang ketika langkah persentase berubah
let bridgeTexCache: THREE.CanvasTexture | null = null;
const getBridgeTexture = () => {
  if (bridgeTexCache) return bridgeTexCache;
  const c = makeCanvas(SCREEN_W, SCREEN_H);
  paintScene2Bridge(c.getContext('2d') as CanvasRenderingContext2D);
  bridgeTexCache = makeTexture(c);
  return bridgeTexCache;
};

let syncCanvas: HTMLCanvasElement | null = null;
let syncTex: THREE.CanvasTexture | null = null;
const getSyncTexture = (pcts: readonly [number, number, number]) => {
  if (!syncCanvas || !syncTex) {
    syncCanvas = makeCanvas(SCREEN_W, SCREEN_H);
    syncTex = makeTexture(syncCanvas);
  }
  paintDriverSync(syncCanvas.getContext('2d') as CanvasRenderingContext2D, { pcts });
  syncTex.needsUpdate = true;
  return syncTex;
};

let tuningCanvas: HTMLCanvasElement | null = null;
let tuningTex: THREE.CanvasTexture | null = null;
const getTuningTexture = (tunePct: number) => {
  if (!tuningCanvas || !tuningTex) {
    tuningCanvas = makeCanvas(SCREEN_W, SCREEN_H);
    tuningTex = makeTexture(tuningCanvas);
  }
  paintTuningScreen(tuningCanvas.getContext('2d') as CanvasRenderingContext2D, tunePct);
  tuningTex.needsUpdate = true;
  return tuningTex;
};

const MonitorScreens: React.FC<{
  pcts: readonly [number, number, number];
  desktopFade: number;
  tuningFade: number;
  tunePct: number;
}> = ({ pcts, desktopFade, tuningFade, tunePct }) => {
  const bridgeTex = useMemo(getBridgeTexture, []);
  const [p0, p1, p2] = pcts;
  const driverTex = useMemo(() => getSyncTexture([p0, p1, p2]), [p0, p1, p2]);
  const tuneTex = useMemo(() => getTuningTexture(tunePct), [tunePct]);

  const layers = [
    { key: 'bridge', map: bridgeTex, opacity: 1 },
    { key: 'sync', map: driverTex, opacity: desktopFade },
    { key: 'tuning', map: tuneTex, opacity: tuningFade },
  ];
  const [x, y, z] = MONITOR_SCREEN.position;

  return (
    <>
      {layers.map(({ key, map, opacity }, i) =>
        opacity > 0.001 ? (
          <mesh key={key} position={[x, y, z + i * 0.004]} renderOrder={i}>
            <planeGeometry args={[MONITOR_SCREEN.width, MONITOR_SCREEN.height]} />
            <meshBasicMaterial
              map={map}
              transparent={i > 0}
              opacity={opacity}
              depthWrite={i === 0}
              toneMapped={false}
            />
          </mesh>
        ) : null
      )}
    </>
  );
};

// ============================================================================
// Sorotan Komponen 3D + Garis Penghubung Data ke Monitor (ruang lokal casing)
// ============================================================================
const HardwareHighlightFrame: React.FC<{
  center: V3;
  size: [number, number];
  color: string;
  intensity: number;
  opacity: number;
}> = ({ center, size: [w, h], color, intensity, opacity }) => {
  if (opacity <= 0.01) return null;
  const bar = 0.036;
  const depth = 0.032;
  const edges: Array<{ pos: V3; dim: V3 }> = [
    { pos: [0, h / 2, 0], dim: [w + bar, bar, depth] },
    { pos: [0, -h / 2, 0], dim: [w + bar, bar, depth] },
    { pos: [-w / 2, 0, 0], dim: [bar, h, depth] },
    { pos: [w / 2, 0, 0], dim: [bar, h, depth] },
  ];
  return (
    <group position={center}>
      {edges.map((e, i) => (
        <mesh key={i} position={e.pos}>
          <boxGeometry args={e.dim} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={intensity}
            transparent
            opacity={opacity}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
};

const HardwareSyncOverlays: React.FC<{ frame: number }> = ({ frame }) => {
  const inTuning = frame >= tuningStart;
  const tuningPulse = interpolate(frame, [tuningStart, tuningLocked], [0, 1], clamp);

  return (
    <group>
      {DRIVER_TARGETS.map((item) => {
        const appear = interpolate(frame, [item.startFrame - 2, item.startFrame + 6], [0, 1], clamp);
        if (appear <= 0.01) return null;

        const progress = interpolate(frame, [item.startFrame, item.doneFrame], [0, 1], clamp);
        const done = frame >= item.doneFrame;
        const color = done || inTuning ? EP3_COLORS.ground : EP3_COLORS.data;
        const frameIntensity = done ? (inTuning ? 1.5 : 1.05) : 2.1;
        const lineOpacity = done ? (inTuning ? 0.52 : 0.28) : 0.85 * appear;

        // Paket data bergerak dari komponen ke monitor saat sinkronisasi atau tuning
        const showPacket = (!done && progress > 0 && progress < 1) || (inTuning && tuningPulse > 0 && tuningPulse < 1);
        const packetT = inTuning ? tuningPulse : progress;
        const packetPos = showPacket ? item.curve.getPointAt(packetT) : null;

        return (
          <group key={item.id}>
            <HardwareHighlightFrame
              center={item.frameCenter}
              size={item.frameSize}
              color={color}
              intensity={frameIntensity}
              opacity={done ? (inTuning ? 0.92 : 0.72) : appear}
            />
            <pointLight
              position={[item.frameCenter[0], item.frameCenter[1], item.frameCenter[2] + 0.35]}
              intensity={done ? (inTuning ? 1.15 : 0.55) : 1.55 * appear}
              distance={2.6}
              color={color}
            />
            <mesh geometry={item.tubeGeo}>
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={done ? 0.9 : 1.8}
                transparent
                opacity={lineOpacity}
                toneMapped={false}
              />
            </mesh>
            {packetPos && (
              <mesh position={[packetPos.x, packetPos.y, packetPos.z]}>
                <sphereGeometry args={[0.095, 16, 16]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  emissive={color}
                  emissiveIntensity={2.8}
                  toneMapped={false}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

// ============================================================================
// Kamera: menyambung pose akhir Scene 2 -> two-shot lebar (PC + Monitor) -> hero tuning
// ============================================================================
const CAM_KEYS: CamKeyframe[] = [
  { frame: 0, dist: 20.5, az: -3, el: 11, fov: 38, focusY: 1100, target: [-2.9, 10.2, -2.3] },
  { frame: desktopIn, dist: 27.5, az: 5.5, el: 12.5, fov: 38, focusY: 1185, target: [-1.15, 10.1, -1.05] },
  { frame: chipsetDone, dist: 26.8, az: 7.5, el: 12, fov: 38, focusY: 1185, target: [-0.9, 10.05, -0.95] },
  { frame: gpuDone, dist: 26.2, az: 6, el: 11.5, fov: 38, focusY: 1185, target: [-1.05, 10.05, -1.0] },
  { frame: nvmeDone, dist: 26.5, az: 4.5, el: 12.5, fov: 38, focusY: 1185, target: [-1.15, 10.15, -1.05] },
  { frame: tuningLocked, dist: 23.8, az: 1.5, el: 11.5, fov: 38, focusY: 1175, target: [-1.85, 10.15, -1.45] },
  { frame: SCENE3_DURATION_FRAMES, dist: 22.8, az: 0.5, el: 11, fov: 38, focusY: 1175, target: [-2.05, 10.15, -1.55] },
];

// ============================================================================
// HUD Status Terstruktur (height: auto, anti-overflow)
// ============================================================================
const DriverStatusRow: React.FC<{
  label: string;
  tag: string;
  active: boolean;
  done: boolean;
  enterT: number;
  verifyT: number;
  first: boolean;
}> = ({ label, tag, active, done, enterT, verifyT, first }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      padding: '11px 0',
      borderTop: first ? 'none' : `1px solid ${EP3_COLORS.border}`,
      opacity: enterT,
      transform: `translate3d(${((1 - enterT) * 16).toFixed(1)}px, 0, 0)`,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
      <div
        style={{
          position: 'relative',
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: 17,
          boxSizing: 'border-box',
          border: `2.5px solid ${active ? EP3_COLORS.data : '#3B4A5E'}`,
          backgroundColor: active ? 'rgba(0, 229, 255, 0.14)' : 'transparent',
        }}
      >
        <svg
          width={34}
          height={34}
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ position: 'absolute', left: -2.5, top: -2.5, transform: `scale(${verifyT.toFixed(3)})` }}
        >
          <circle cx="12" cy="12" r="12" fill={EP3_COLORS.ground} />
          <path
            d="m7 12.4 3.2 3.2L17.2 8.6"
            fill="none"
            stroke="#03140D"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        style={{
          fontFamily: EP3_FONTS.body,
          fontSize: 27,
          fontWeight: 700,
          lineHeight: 1.25,
          color: done || active ? '#FFFFFF' : '#CBD5E1',
          opacity: done || active ? 1 : 0.72,
        }}
      >
        {label}
      </span>
    </div>

    <div
      style={{
        flexShrink: 0,
        padding: '6px 12px',
        borderRadius: 8,
        backgroundColor: done
          ? 'rgba(16, 185, 129, 0.18)'
          : active
            ? 'rgba(0, 229, 255, 0.16)'
            : 'rgba(148, 163, 184, 0.1)',
        border: `1.5px solid ${done ? EP3_COLORS.ground : active ? EP3_COLORS.data : 'rgba(148, 163, 184, 0.25)'}`,
        fontFamily: EP3_FONTS.mono,
        fontSize: 18,
        fontWeight: 800,
        lineHeight: 1.2,
        color: done ? '#6EE7B7' : active ? EP3_COLORS.data : EP3_COLORS.muted,
        whiteSpace: 'nowrap',
      }}
    >
      {done ? tag : active ? 'SINKRONISASI...' : 'MENUNGGU'}
    </div>
  </div>
);

// ============================================================================
// Scene 3: Driver Resmi & Tuning Hardware
// ============================================================================
export const Scene3DriversTuning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = (start: number, damping = 18) =>
    spring({ frame: frame - start, fps, config: { damping, stiffness: 180, mass: 0.75 } });

  const badgeT = enter(badgeIn);
  const line1T = enter(titleIn, 16);
  const line2T = enter(titleIn + 6, 16);
  const cardT = enter(cardIn);
  const tuningLockT = enter(tuningLocked, 14);

  // Progres driver dikuantisasi per 10% agar update tekstur monitor ringan & tajam
  const driverPcts = DRIVER_TARGETS.map((item) => {
    const raw = interpolate(frame, [item.startFrame, item.doneFrame], [0, 100], clamp);
    return raw >= 100 ? 100 : Math.floor(raw / 10) * 10;
  }) as unknown as readonly [number, number, number];

  const verifiedCount = DRIVER_TARGETS.filter((d) => frame >= d.doneFrame).length;
  const desktopFade = interpolate(frame, [desktopIn, desktopIn + 10], [0, 1], clamp);
  const tuningFade = interpolate(frame, [tuningStart, tuningStart + 10], [0, 1], clamp);
  const rawTunePct = interpolate(frame, [tuningStart + 2, tuningLocked], [0, 100], clamp);
  const tunePct = rawTunePct >= 100 ? 100 : Math.floor(rawTunePct / 10) * 10;
  const tuningDone = frame >= tuningLocked;

  // Warna pantulan layar ke meja mengikuti fase layar
  const screenGlowColor = frame < desktopIn + 5 ? EP3_COLORS.ground : frame < tuningStart ? EP3_COLORS.data : EP3_COLORS.ground;
  const screenGlowIntensity = frame < tuningStart ? 1.35 : tuningDone ? 1.75 : 1.5;

  // Kilat tepi hijau sekali saat profil performa terkunci optimal
  const optimalFlash = interpolate(frame, [tuningLocked, tuningLocked + 4, tuningLocked + 24], [0, 1, 0], clamp);

  const pose = useMemo(() => resolveCameraPose(CAM_KEYS, frame), [frame]);
  const bgmVolume = (f: number) =>
    interpolate(f, [0, 15, durationInFrames - 40, durationInFrames], [0, 0.045, 0.045, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: EP3_COLORS.bg, fontFamily: EP3_FONTS.body }}>
      <Audio src={staticFile('audio/vo/ep3-scene3.mp3')} volume={1.0} />
      <Audio src={staticFile(EP3_BGM)} loop volume={bgmVolume} />

      {/* SFX dari KATALOG-AI.md */}
      <SfxCue frame={badgeIn} sfx="click-soft" volume={0.4} />
      <SfxCue frame={titleIn} sfx="transition-whoosh-soft" volume={0.42} />
      <SfxCue frame={cardIn} sfx="pop-in" volume={0.3} />
      <SfxCue frame={chipsetDone} sfx="click-soft" volume={0.55} />
      <SfxCue frame={gpuDone} sfx="click-soft" volume={0.55} />
      <SfxCue frame={nvmeDone} sfx="click-soft" volume={0.55} />
      <SfxCue frame={tuningLocked} sfx="confirm-chime" volume={0.58} />

      {/* Panggung 3D: meja, PC & monitor yang menyambung dari Scene 2 + highlight hardware */}
      <AbsoluteFill>
        <WorkstationStage
          frame={frame}
          pose={pose}
          width={EP3_WIDTH}
          height={EP3_HEIGHT}
          screenGlowColor={screenGlowColor}
          screenGlowIntensity={screenGlowIntensity}
          pcChildren={<HardwareSyncOverlays frame={frame} />}
        >
          <MonitorScreens
            pcts={driverPcts}
            desktopFade={desktopFade}
            tuningFade={tuningFade}
            tunePct={tunePct}
          />
        </WorkstationStage>
      </AbsoluteFill>

      {/* Gradien kontras untuk HUD atas & subtitle bawah */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(7, 11, 18, 0.94) 0%, rgba(7, 11, 18, 0.76) 22%, rgba(7, 11, 18, 0) 42%, rgba(7, 11, 18, 0) 70%, rgba(7, 11, 18, 0.8) 80%, rgba(7, 11, 18, 0.9) 100%)',
        }}
      />
      <AbsoluteFill
        style={{ boxShadow: `inset 0 0 160px rgba(16, 185, 129, ${(0.42 * optimalFlash).toFixed(3)})` }}
      />

      {/* Header brand konsisten Episode 3 */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: EP3_SAFE.left,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          borderRadius: 12,
          backgroundColor: 'rgba(15, 22, 34, 0.9)',
          border: `1px solid ${EP3_COLORS.border}`,
          fontFamily: EP3_FONTS.heading,
          fontSize: 19,
          fontWeight: 800,
          letterSpacing: 0.5,
          color: EP3_COLORS.ink,
        }}
      >
        MOHAMMED <span style={{ color: EP3_COLORS.muted }}>|</span>
        <span style={{ color: EP3_COLORS.power }}>MOHEF TECH</span>
      </div>

      {/* Badge tahap */}
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: EP3_SAFE.left,
          padding: '10px 18px',
          borderRadius: 12,
          backgroundColor: 'rgba(0, 229, 255, 0.12)',
          border: `2px solid ${EP3_COLORS.data}`,
          fontFamily: EP3_FONTS.mono,
          fontSize: 23,
          fontWeight: 900,
          letterSpacing: 0.9,
          lineHeight: 1.2,
          color: EP3_COLORS.data,
          whiteSpace: 'nowrap',
          opacity: badgeT,
          transform: `translate3d(${((1 - badgeT) * -24).toFixed(1)}px, 0, 0)`,
        }}
      >
        TAHAP 02 • DRIVER RESMI &amp; TUNING
      </div>

      {/* Judul besar dua baris (skala terukur agar pas di 870px) */}
      <div
        style={{
          position: 'absolute',
          top: 210,
          left: EP3_SAFE.left,
          width: EP3_SAFE.contentWidth,
          fontFamily: EP3_FONTS.heading,
          fontSize: 74,
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: -1.4,
          textShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        }}
      >
        {[
          { text: 'PERFORMA MAKSIMAL', color: '#FFFFFF', t: line1T },
          { text: '& STABIL', color: '#34D399', t: line2T },
        ].map(({ text, color, t }) => (
          <div key={text} style={{ overflow: 'hidden', paddingBottom: 4 }}>
            <div
              style={{
                color,
                whiteSpace: 'nowrap',
                transform: `translate3d(0, ${((1 - t) * 105).toFixed(1)}%, 0)`,
              }}
            >
              {text}
            </div>
          </div>
        ))}
      </div>

      {/* Kartu status terstruktur (height: auto + padding lega, anti-overflow) */}
      {cardT > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 394,
            left: EP3_SAFE.left,
            width: EP3_SAFE.contentWidth,
            height: 'auto',
            boxSizing: 'border-box',
            padding: '20px 26px 22px',
            borderRadius: 22,
            backgroundColor: 'rgba(12, 14, 20, 0.94)',
            border: `1.5px solid ${tuningDone ? EP3_COLORS.ground : `${EP3_COLORS.data}66`}`,
            boxShadow: '0 24px 56px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            opacity: cardT,
            transform: `translate3d(0, ${((1 - cardT) * 24).toFixed(1)}px, 0)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              paddingBottom: 8,
              fontFamily: EP3_FONTS.mono,
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: 0.8,
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: EP3_COLORS.muted }}>SINKRONISASI DRIVER RESMI</span>
            <span style={{ color: verifiedCount === 3 ? '#34D399' : EP3_COLORS.data }}>
              {verifiedCount}/3 TERVERIFIKASI
            </span>
          </div>

          {DRIVER_TARGETS.map((item, i) => (
            <DriverStatusRow
              key={item.id}
              label={item.hudLabel}
              tag={item.hudTag}
              first={i === 0}
              active={frame >= item.startFrame && frame < item.doneFrame}
              done={frame >= item.doneFrame}
              enterT={enter(cardIn + 4 + i * 5)}
              verifyT={enter(item.doneFrame, 12)}
            />
          ))}

          {/* Strip status Power & Clock Tuning di bagian bawah kartu */}
          <div
            style={{
              marginTop: 10,
              paddingTop: 14,
              borderTop: `1px solid ${EP3_COLORS.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: EP3_FONTS.mono,
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: 0.6,
                  color: EP3_COLORS.muted,
                }}
              >
                POWER &amp; CLOCK TUNING
              </span>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  backgroundColor: tuningDone
                    ? EP3_COLORS.ground
                    : frame >= tuningStart
                      ? 'rgba(0, 229, 255, 0.16)'
                      : 'rgba(148, 163, 184, 0.1)',
                  border: `1.5px solid ${
                    tuningDone
                      ? EP3_COLORS.ground
                      : frame >= tuningStart
                        ? EP3_COLORS.data
                        : 'rgba(148, 163, 184, 0.22)'
                  }`,
                  fontFamily: EP3_FONTS.mono,
                  fontSize: 18,
                  fontWeight: 900,
                  lineHeight: 1.2,
                  color: tuningDone ? '#03140D' : frame >= tuningStart ? EP3_COLORS.data : EP3_COLORS.muted,
                  transform: `scale(${(0.96 + 0.04 * tuningLockT).toFixed(3)})`,
                  whiteSpace: 'nowrap',
                }}
              >
                {tuningDone
                  ? 'OPTIMAL PERFORMANCE ✓'
                  : frame >= tuningStart
                    ? `KALIBRASI ${tunePct}%`
                    : 'MENUNGGU DRIVER'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              {['PCIe Gen4 x16', 'RAM XMP/EXPO', 'Power Profile Stabil'].map((chip) => (
                <span
                  key={chip}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 8,
                    backgroundColor: tuningDone ? 'rgba(16, 185, 129, 0.14)' : 'rgba(148, 163, 184, 0.08)',
                    border: `1px solid ${tuningDone ? 'rgba(16, 185, 129, 0.45)' : 'rgba(148, 163, 184, 0.2)'}`,
                    fontFamily: EP3_FONTS.mono,
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    color: tuningDone ? '#A7F3D0' : '#94A3B8',
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomSubtitleBar
        words={SCENE3_WORDS}
        stylePreset={EP3_STYLE_PRESET}
        fontSize={32}
        bottomOffset={EP3_SAFE.subtitleBottomOffset}
        maxWordsPerLine={6}
      />
    </AbsoluteFill>
  );
};

export default Scene3DriversTuning;
