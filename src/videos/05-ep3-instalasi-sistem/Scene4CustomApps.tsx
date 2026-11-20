import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { BottomSubtitleBar, SfxCue } from '../../lib/motion-craft';
import {
  EP3_BGM,
  EP3_COLORS,
  EP3_FONTS,
  EP3_HEIGHT,
  EP3_SAFE,
  EP3_STYLE_PRESET,
  EP3_WIDTH,
  SCENE4_BEATS,
  SCENE4_DURATION_FRAMES,
  SCENE4_WORDS,
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
  appsIn,
  cardIn,
  rowOtherIn,
  rowMohefIn,
  phase1Start,
  p1App1Start,
  p1App1Done,
  p1App2Start,
  p1App2Done,
  p1App3Start,
  p1App3Done,
  phase2Start,
  p2App1Start,
  p2App1Done,
  p2App2Start,
  p2App2Done,
  p2ReadyStart,
  p2ReadyDone,
} = SCENE4_BEATS;

// ============================================================================
// Data 2 Profil Paket Aplikasi (menyambung profil Episode 2)
// ============================================================================
interface AppInstallItem {
  label: string;
  doneLabel: string;
  installingText: string;
  startFrame: number;
  doneFrame: number;
  isFinalStatus?: boolean;
}

const PHASE1_APPS: readonly AppInstallItem[] = [
  {
    label: 'POS Kasir Terintegrasi',
    doneLabel: 'POS Kasir Terintegrasi ✓',
    installingText: 'Memasang POS Kasir Terintegrasi...',
    startFrame: p1App1Start,
    doneFrame: p1App1Done,
  },
  {
    label: 'Driver Printer Struk & Barcode Scanner',
    doneLabel: 'Driver Printer Struk & Barcode Scanner ✓',
    installingText: 'Menyetel Driver Printer Struk & Barcode...',
    startFrame: p1App2Start,
    doneFrame: p1App2Done,
  },
  {
    label: 'Office & Laporan Keuangan',
    doneLabel: 'Office & Laporan Keuangan ✓',
    installingText: 'Memasang Office & Laporan Keuangan...',
    startFrame: p1App3Start,
    doneFrame: p1App3Done,
  },
];

const PHASE2_APPS: readonly AppInstallItem[] = [
  {
    label: 'Software Editing Video & Desain 3D',
    doneLabel: 'Software Editing Video & Desain 3D ✓',
    installingText: 'Memasang Software Editing & Desain 3D...',
    startFrame: p2App1Start,
    doneFrame: p2App1Done,
  },
  {
    label: 'Runtime Grafis & Rendering Tools',
    doneLabel: 'Runtime Grafis & Rendering Tools ✓',
    installingText: 'Mengonfigurasi Runtime Grafis & Render...',
    startFrame: p2App2Start,
    doneFrame: p2App2Done,
  },
  {
    label: 'Status: Siap Langsung Pakai',
    doneLabel: 'Status: Siap Langsung Pakai ✓',
    installingText: 'Memverifikasi Kesiapan Paket Aplikasi...',
    startFrame: p2ReadyStart,
    doneFrame: p2ReadyDone,
    isFinalStatus: true,
  },
];

// ============================================================================
// Layar Monitor 3D (CanvasTexture 1340x720, tajam & kontinyu dari Scene 3)
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

const drawCheck = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) => {
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

const drawCleanDesktopChrome = (ctx: CanvasRenderingContext2D, accentTint: string) => {
  const bg = ctx.createLinearGradient(0, 0, SCREEN_W, SCREEN_H);
  bg.addColorStop(0, '#07111F');
  bg.addColorStop(1, accentTint);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Taskbar OS bersih di tepi bawah (identik dengan Scene 3)
  ctx.fillStyle = 'rgba(8, 13, 22, 0.94)';
  ctx.fillRect(0, SCREEN_H - 64, SCREEN_W, 64);
  ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.fillRect(0, SCREEN_H - 64, SCREEN_W, 2);

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

  ctx.fillStyle = '#CBD5E1';
  ctx.font = `bold 24px ${MONO}`;
  ctx.textAlign = 'right';
  ctx.fillText('OS BERSIH • 14:05', SCREEN_W - 36, SCREEN_H - 24, 340);
  ctx.textAlign = 'left';
};

/** State 0: Kelanjutan mulus layar akhir Scene 3 (Power & Clock Tuning Optimal). */
const paintScene3Bridge = (ctx: CanvasRenderingContext2D) => {
  drawCleanDesktopChrome(ctx, '#06261B');
  const wx = 56;
  const wy = 36;
  const ww = SCREEN_W - 112;
  const wh = SCREEN_H - 126;

  ctx.fillStyle = '#0B1320';
  ctx.beginPath();
  ctx.roundRect(wx, wy, ww, wh, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#101B2D';
  ctx.beginPath();
  ctx.roundRect(wx, wy, ww, 84, [20, 20, 0, 0]);
  ctx.fill();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = `900 32px ${SANS}`;
  ctx.fillText('MOHEF TECH • DRIVER & HARDWARE SYNC', wx + 32, wy + 52, 780);

  ctx.fillStyle = EP3_COLORS.ground;
  ctx.beginPath();
  ctx.roundRect(wx + ww - 270, wy + 18, 240, 48, 10);
  ctx.fill();
  ctx.fillStyle = '#03140D';
  ctx.font = `bold 26px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('OPTIMAL ✓', wx + ww - 150, wy + 50, 224);
  ctx.textAlign = 'left';

  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.beginPath();
  ctx.roundRect(wx + 32, wy + 160, ww - 64, 108, 16);
  ctx.fill();
  ctx.strokeStyle = EP3_COLORS.ground;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.fillStyle = '#6EE7B7';
  ctx.font = `bold 36px ${MONO}`;
  ctx.fillText('POWER & CLOCK TUNING: OPTIMAL PERFORMANCE ✓', wx + 58, wy + 226, ww - 116);

  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 32px ${MONO}`;
  ctx.fillText('MEMBUKA PAKET APLIKASI REQUEST PENGGUNA...', wx + 58, wy + 360, ww - 116);
};

interface ProfileScreenProps {
  activePhase: 1 | 2;
  apps: readonly AppInstallItem[];
  pcts: readonly [number, number, number];
}

const paintProfileScreen = (
  ctx: CanvasRenderingContext2D,
  { activePhase, apps, pcts }: ProfileScreenProps
) => {
  const doneCount = pcts.filter((p) => p >= 100).length;
  const allDone = doneCount === apps.length;
  const tint = activePhase === 2 && allDone ? '#06261B' : activePhase === 2 ? '#0B1E34' : '#0D2138';

  drawCleanDesktopChrome(ctx, tint);

  const wx = 48;
  const wy = 32;
  const ww = SCREEN_W - 96;
  const wh = SCREEN_H - 114;

  // Panel jendela utama
  ctx.fillStyle = '#0B1320';
  ctx.beginPath();
  ctx.roundRect(wx, wy, ww, wh, 20);
  ctx.fill();
  ctx.strokeStyle = allDone ? 'rgba(16, 185, 129, 0.58)' : 'rgba(148, 163, 184, 0.34)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Header jendela
  ctx.fillStyle = '#101B2D';
  ctx.beginPath();
  ctx.roundRect(wx, wy, ww, 74, [20, 20, 0, 0]);
  ctx.fill();
  ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.fillRect(wx, wy + 74, ww, 2);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = `900 30px ${SANS}`;
  ctx.fillText('MOHEF TECH • SETUP APLIKASI SESUAI PROFIL', wx + 30, wy + 47, 820);

  const badgeText =
    activePhase === 2 && allDone
      ? 'SIAP PAKAI ✓'
      : allDone
        ? 'PROFIL 1 OK ✓'
        : `GRATIS • ${doneCount}/${apps.length}`;
  ctx.fillStyle = allDone ? EP3_COLORS.ground : 'rgba(0, 229, 255, 0.18)';
  ctx.beginPath();
  ctx.roundRect(wx + ww - 260, wy + 15, 232, 44, 10);
  ctx.fill();
  ctx.fillStyle = allDone ? '#03140D' : EP3_COLORS.data;
  ctx.font = `bold 24px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, wx + ww - 144, wy + 45, 214);
  ctx.textAlign = 'left';

  // Tab bar 2 profil pengguna (Usaha & Kasir | Kreator, 3D & Gaming)
  const tabY = wy + 90;
  const tabH = 58;
  const tabGap = 20;
  const tabW = (ww - 56 - tabGap) / 2;

  const tabs = [
    {
      num: 1 as const,
      label: activePhase === 2 ? '01 • USAHA & KASIR ✓' : '01 • PROFIL USAHA & KASIR',
      completed: activePhase === 2 || (activePhase === 1 && allDone),
    },
    {
      num: 2 as const,
      label: '02 • KREATOR, 3D & GAMING',
      completed: activePhase === 2 && allDone,
    },
  ];

  tabs.forEach((tab, idx) => {
    const tx = wx + 28 + idx * (tabW + tabGap);
    const isActive = tab.num === activePhase;
    ctx.fillStyle = isActive
      ? tab.completed
        ? 'rgba(16, 185, 129, 0.2)'
        : 'rgba(0, 229, 255, 0.16)'
      : tab.completed
        ? 'rgba(16, 185, 129, 0.1)'
        : '#101A2B';
    ctx.beginPath();
    ctx.roundRect(tx, tabY, tabW, tabH, 12);
    ctx.fill();

    ctx.strokeStyle = isActive
      ? tab.completed
        ? EP3_COLORS.ground
        : EP3_COLORS.data
      : tab.completed
        ? 'rgba(16, 185, 129, 0.45)'
        : 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = isActive ? 3 : 2;
    ctx.stroke();

    ctx.fillStyle = isActive
      ? '#FFFFFF'
      : tab.completed
        ? '#6EE7B7'
        : '#94A3B8';
    ctx.font = `bold 25px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.fillText(tab.label, tx + tabW / 2, tabY + 38, tabW - 28);
    ctx.textAlign = 'left';
  });

  // Daftar 3 paket aplikasi untuk profil aktif
  const listStartY = wy + 168;
  const rowH = 122;
  const rowGap = 18;
  const rw = ww - 56;

  apps.forEach((app, i) => {
    const pct = pcts[i];
    const done = pct >= 100;
    const active = pct > 0 && pct < 100;
    const isHeroFinal = Boolean(app.isFinalStatus && done);
    const ry = listStartY + i * (rowH + rowGap);

    ctx.fillStyle = isHeroFinal
      ? 'rgba(16, 185, 129, 0.24)'
      : done
        ? 'rgba(16, 185, 129, 0.14)'
        : active
          ? 'rgba(0, 229, 255, 0.12)'
          : '#101A2B';
    ctx.beginPath();
    ctx.roundRect(wx + 28, ry, rw, rowH, 14);
    ctx.fill();

    ctx.strokeStyle = done
      ? EP3_COLORS.ground
      : active
        ? EP3_COLORS.data
        : 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = isHeroFinal ? 4 : done || active ? 3 : 2;
    ctx.stroke();

    // Kotak status kiri
    const bx = wx + 50;
    const by = ry + 33;
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
      ctx.font = `bold 23px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.fillText(`${pct}%`, bx + 28, by + 36, 50);
      ctx.textAlign = 'left';
    } else {
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Label baris aplikasi
    const textX = bx + 78;
    ctx.fillStyle = isHeroFinal ? '#6EE7B7' : done ? '#FFFFFF' : active ? '#E0F2FE' : '#94A3B8';
    ctx.font = `900 ${isHeroFinal ? 36 : 33}px ${SANS}`;
    const displayTitle = done ? app.doneLabel : active ? app.installingText : app.label;
    ctx.fillText(displayTitle, textX, ry + 56, rw - 328);

    // Badge status kanan
    const pillW = 186;
    const pillH = 40;
    const pillX = wx + ww - 28 - pillW - 18;
    const pillY = ry + 24;
    ctx.fillStyle = done
      ? isHeroFinal
        ? EP3_COLORS.ground
        : 'rgba(16, 185, 129, 0.22)'
      : active
        ? 'rgba(0, 229, 255, 0.18)'
        : 'rgba(148, 163, 184, 0.1)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 9);
    ctx.fill();

    ctx.fillStyle = done
      ? isHeroFinal
        ? '#03140D'
        : '#6EE7B7'
      : active
        ? EP3_COLORS.data
        : '#94A3B8';
    ctx.font = `bold 21px ${MONO}`;
    ctx.textAlign = 'center';
    const pillText = done
      ? isHeroFinal
        ? 'SIAP PAKAI'
        : 'TERPASANG'
      : active
        ? 'MEMASANG'
        : 'ANTRIAN';
    ctx.fillText(pillText, pillX + pillW / 2, pillY + 27, pillW - 16);
    ctx.textAlign = 'left';

    // Bilah progres bawah baris
    const barX = textX;
    const barY = ry + 84;
    const barW = rw - 170;
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 14, 7);
    ctx.fill();
    if (pct > 0) {
      ctx.fillStyle = done ? EP3_COLORS.ground : EP3_COLORS.data;
      ctx.beginPath();
      ctx.roundRect(barX, barY, Math.max(18, (barW * pct) / 100), 14, 7);
      ctx.fill();
    }
  });
};

// Cache tekstur terpisah per fase (konsisten dengan Scene 3 agar ringan & deterministik)
let bridgeTexCache: THREE.CanvasTexture | null = null;
const getBridgeTexture = () => {
  if (bridgeTexCache) return bridgeTexCache;
  const c = makeCanvas(SCREEN_W, SCREEN_H);
  paintScene3Bridge(c.getContext('2d') as CanvasRenderingContext2D);
  bridgeTexCache = makeTexture(c);
  return bridgeTexCache;
};

let phase1Canvas: HTMLCanvasElement | null = null;
let phase1Tex: THREE.CanvasTexture | null = null;
const getPhase1Texture = (pcts: readonly [number, number, number]) => {
  if (!phase1Canvas || !phase1Tex) {
    phase1Canvas = makeCanvas(SCREEN_W, SCREEN_H);
    phase1Tex = makeTexture(phase1Canvas);
  }
  paintProfileScreen(phase1Canvas.getContext('2d') as CanvasRenderingContext2D, {
    activePhase: 1,
    apps: PHASE1_APPS,
    pcts,
  });
  phase1Tex.needsUpdate = true;
  return phase1Tex;
};

let phase2Canvas: HTMLCanvasElement | null = null;
let phase2Tex: THREE.CanvasTexture | null = null;
const getPhase2Texture = (pcts: readonly [number, number, number]) => {
  if (!phase2Canvas || !phase2Tex) {
    phase2Canvas = makeCanvas(SCREEN_W, SCREEN_H);
    phase2Tex = makeTexture(phase2Canvas);
  }
  paintProfileScreen(phase2Canvas.getContext('2d') as CanvasRenderingContext2D, {
    activePhase: 2,
    apps: PHASE2_APPS,
    pcts,
  });
  phase2Tex.needsUpdate = true;
  return phase2Tex;
};

const MonitorScreens: React.FC<{
  phase1Pcts: readonly [number, number, number];
  phase2Pcts: readonly [number, number, number];
  appsFade: number;
  phase2Fade: number;
}> = ({ phase1Pcts, phase2Pcts, appsFade, phase2Fade }) => {
  const bridgeTex = useMemo(getBridgeTexture, []);
  const [a0, a1, a2] = phase1Pcts;
  const [b0, b1, b2] = phase2Pcts;
  const p1Tex = useMemo(() => getPhase1Texture([a0, a1, a2]), [a0, a1, a2]);
  const p2Tex = useMemo(() => getPhase2Texture([b0, b1, b2]), [b0, b1, b2]);

  const layers = [
    { key: 'bridge', map: bridgeTex, opacity: 1 },
    { key: 'phase1', map: p1Tex, opacity: appsFade },
    { key: 'phase2', map: p2Tex, opacity: phase2Fade },
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
// Kamera: menyambung pose akhir Scene 3 -> sorot monitor tajam -> two-shot akhir
// ============================================================================
const CAM_KEYS: CamKeyframe[] = [
  { frame: 0, dist: 22.8, az: 0.5, el: 11, fov: 38, focusY: 1175, target: [-2.05, 10.15, -1.55] },
  { frame: phase1Start, dist: 19.2, az: 4.2, el: 8.5, fov: 38, focusY: 1185, target: [-3.4, 10.18, -2.85] },
  { frame: p1App3Done + 8, dist: 18.4, az: 5.2, el: 8.0, fov: 38, focusY: 1185, target: [-3.55, 10.18, -2.95] },
  { frame: phase2Start + 16, dist: 18.2, az: 3.4, el: 8.2, fov: 38, focusY: 1185, target: [-3.5, 10.18, -2.95] },
  { frame: p2ReadyDone, dist: 18.8, az: 4.6, el: 8.5, fov: 38, focusY: 1185, target: [-3.35, 10.18, -2.8] },
  { frame: SCENE4_DURATION_FRAMES, dist: 20.4, az: 2.2, el: 9.5, fov: 38, focusY: 1180, target: [-2.95, 10.16, -2.45] },
];

const quantizePct = (frame: number, start: number, done: number) => {
  const raw = interpolate(frame, [start, done], [0, 100], clamp);
  return raw >= 100 ? 100 : Math.floor(raw / 10) * 10;
};

// Frame pendaratan stempel baris MOHEF TECH & pola micro-shake 4 frame (±4-6px)
const SLAM_HIT_FRAME = rowMohefIn + 4;
const SLAM_SHAKE: ReadonlyArray<readonly [number, number]> = [
  [0, 6],
  [-5, -4],
  [4, 3],
  [-2, -2],
];

// ============================================================================
// Scene 4: Bebas Request Aplikasi & Setup Sesuai Profil
// ============================================================================
export const Scene4CustomApps: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = (start: number, damping = 18) =>
    spring({ frame: frame - start, fps, config: { damping, stiffness: 180, mass: 0.75 } });

  const badgeT = enter(badgeIn);
  const line1T = enter(titleIn, 16);
  const line2T = enter(titleIn + 6, 16);
  const cardT = enter(cardIn);
  const rowOtherT = enter(rowOtherIn, 18);

  // Stiff spring untuk efek dilempar/stempel keras dari depan layar (scale 1.55, -4deg -> 1, 0deg)
  const mohefSlam = spring({
    frame: frame - rowMohefIn,
    fps,
    config: { damping: 14, stiffness: 360, mass: 0.65 },
  });
  const mohefOpacity = interpolate(frame, [rowMohefIn, rowMohefIn + 3], [0, 1], clamp);
  const mohefScale = 1.55 - 0.55 * mohefSlam;
  const mohefRotate = -4 * (1 - mohefSlam);
  const mohefDropY = -26 * (1 - mohefSlam);
  const slamGlow = interpolate(
    frame,
    [SLAM_HIT_FRAME - 1, SLAM_HIT_FRAME, SLAM_HIT_FRAME + 4, SLAM_HIT_FRAME + 20],
    [0, 1, 0.72, 0],
    clamp
  );
  const shakeIdx = frame - SLAM_HIT_FRAME;
  const [shakeX, shakeY] =
    shakeIdx >= 0 && shakeIdx < SLAM_SHAKE.length ? SLAM_SHAKE[shakeIdx] : [0, 0];
  const checkPopT = enter(SLAM_HIT_FRAME, 12);

  const phase1Pcts = [
    quantizePct(frame, p1App1Start, p1App1Done),
    quantizePct(frame, p1App2Start, p1App2Done),
    quantizePct(frame, p1App3Start, p1App3Done),
  ] as const;

  const phase2Pcts = [
    quantizePct(frame, p2App1Start, p2App1Done),
    quantizePct(frame, p2App2Start, p2App2Done),
    quantizePct(frame, p2ReadyStart, p2ReadyDone),
  ] as const;

  const appsFade = interpolate(frame, [appsIn, appsIn + 10], [0, 1], clamp);
  const phase2Fade = interpolate(frame, [phase2Start, phase2Start + 10], [0, 1], clamp);
  const allReady = frame >= p2ReadyDone;
  const inPhase2 = frame >= phase2Start;

  // Warna pantulan layar ke meja mengikuti fase layar monitor
  const screenGlowColor = frame < appsIn + 4 || allReady ? EP3_COLORS.ground : EP3_COLORS.data;
  const screenGlowIntensity = allReady ? 1.8 : 1.45;

  // Kilat halus tepi hijau saat status Siap Langsung Pakai terkunci
  const readyFlash = interpolate(frame, [p2ReadyDone, p2ReadyDone + 4, p2ReadyDone + 22], [0, 1, 0], clamp);

  const pose = useMemo(() => resolveCameraPose(CAM_KEYS, frame), [frame]);
  const bgmVolume = (f: number) =>
    interpolate(f, [0, 15, durationInFrames - 40, durationInFrames], [0, 0.045, 0.045, 0], clamp);

  const activeProfileLabel = allReady
    ? 'SIAP LANGSUNG PAKAI ✓'
    : inPhase2
      ? 'PROFIL 2/2 • KREATOR & GAMING'
      : 'PROFIL 1/2 • USAHA & KASIR';

  return (
    <AbsoluteFill style={{ backgroundColor: EP3_COLORS.bg, fontFamily: EP3_FONTS.body }}>
      <Audio src={staticFile('audio/vo/ep3-scene4.mp3')} volume={1.0} />
      <Audio src={staticFile(EP3_BGM)} loop volume={bgmVolume} />

      {/* SFX konfirmasi ringan dari KATALOG-AI.md */}
      <SfxCue frame={badgeIn} sfx="click-soft" volume={0.4} />
      <SfxCue frame={titleIn} sfx="transition-whoosh-soft" volume={0.4} />
      <SfxCue frame={cardIn} sfx="pop-in" volume={0.3} />

      {/* SFX hantaman/stempel keras + alert tegas tepat saat kotak MOHEF TECH mendarat */}
      <Sequence from={SLAM_HIT_FRAME} layout="none">
        <Audio src={staticFile('audio/sfx/impact-punch.wav')} volume={0.96} />
      </Sequence>
      <Sequence from={SLAM_HIT_FRAME} layout="none">
        <Audio src={staticFile('audio/sfx/impact-cinematic.wav')} volume={0.85} />
      </Sequence>
      <Sequence from={SLAM_HIT_FRAME + 2} layout="none">
        <Audio src={staticFile('audio/sfx/ding-bell.wav')} volume={0.62} />
      </Sequence>

      <SfxCue frame={p1App1Done} sfx="click-soft" volume={0.5} />
      <SfxCue frame={p1App2Done} sfx="click-soft" volume={0.5} />
      <SfxCue frame={p1App3Done} sfx="confirm-chime" volume={0.52} />
      <SfxCue frame={phase2Start} sfx="click-soft" volume={0.42} />
      <SfxCue frame={p2App1Done} sfx="click-soft" volume={0.5} />
      <SfxCue frame={p2App2Done} sfx="click-soft" volume={0.5} />
      <SfxCue frame={p2ReadyDone} sfx="confirm-chime" volume={0.58} />

      {/* Panggung 3D: meja kerja, PC menyala stabil & layar monitor paket aplikasi */}
      <AbsoluteFill>
        <WorkstationStage
          frame={frame}
          pose={pose}
          width={EP3_WIDTH}
          height={EP3_HEIGHT}
          screenGlowColor={screenGlowColor}
          screenGlowIntensity={screenGlowIntensity}
        >
          <MonitorScreens
            phase1Pcts={phase1Pcts}
            phase2Pcts={phase2Pcts}
            appsFade={appsFade}
            phase2Fade={phase2Fade}
          />
        </WorkstationStage>
      </AbsoluteFill>

      {/* Gradien kontras untuk HUD atas & area subtitle bawah */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(7, 11, 18, 0.94) 0%, rgba(7, 11, 18, 0.8) 24%, rgba(7, 11, 18, 0) 44%, rgba(7, 11, 18, 0) 70%, rgba(7, 11, 18, 0.8) 80%, rgba(7, 11, 18, 0.9) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 150px rgba(16, 185, 129, ${(0.38 * readyFlash).toFixed(3)})`,
        }}
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
          letterSpacing: 0.8,
          lineHeight: 1.2,
          color: EP3_COLORS.data,
          whiteSpace: 'nowrap',
          opacity: badgeT,
          transform: `translate3d(${((1 - badgeT) * -24).toFixed(1)}px, 0, 0)`,
        }}
      >
        TAHAP 03 • REQUEST APLIKASI BEBAS
      </div>

      {/* Judul besar dua baris (terukur agar pas di lebar aman 870px) */}
      <div
        style={{
          position: 'absolute',
          top: 210,
          left: EP3_SAFE.left,
          width: EP3_SAFE.contentWidth,
          fontFamily: EP3_FONTS.heading,
          fontSize: 72,
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: -1.4,
          textShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        }}
      >
        {[
          { text: 'INSTALL APP GRATIS', color: '#FFFFFF', t: line1T },
          { text: 'SESUAI KEBUTUHAN', color: '#34D399', t: line2T },
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

      {/* Kartu Perbandingan Layanan (height: auto, padding lega, anti-overflow + micro-shake saat impact) */}
      {cardT > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 386,
            left: EP3_SAFE.left,
            width: EP3_SAFE.contentWidth,
            height: 'auto',
            boxSizing: 'border-box',
            padding: '18px 22px 20px',
            borderRadius: 22,
            backgroundColor: 'rgba(12, 14, 20, 0.94)',
            border: `1.5px solid ${
              slamGlow > 0.25 || allReady ? EP3_COLORS.ground : `${EP3_COLORS.data}55`
            }`,
            boxShadow: `0 24px 56px rgba(0, 0, 0, 0.55), 0 0 ${(32 * slamGlow).toFixed(0)}px rgba(16, 185, 129, ${(0.4 * slamGlow).toFixed(3)})`,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            opacity: cardT,
            transform: `translate3d(${shakeX}px, ${((1 - cardT) * 24 + shakeY).toFixed(1)}px, 0)`,
          }}
        >
          {/* Header kartu + indikator profil aktif yang tersinkron ke monitor 3D */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              paddingBottom: 2,
            }}
          >
            <span
              style={{
                fontFamily: EP3_FONTS.mono,
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: 0.7,
                lineHeight: 1.3,
                color: EP3_COLORS.muted,
              }}
            >
              PERBANDINGAN LAYANAN
            </span>
            <span
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                backgroundColor: allReady
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(0, 229, 255, 0.14)',
                border: `1px solid ${allReady ? EP3_COLORS.ground : `${EP3_COLORS.data}66`}`,
                fontFamily: EP3_FONTS.mono,
                fontSize: 16,
                fontWeight: 800,
                lineHeight: 1.25,
                color: allReady ? '#6EE7B7' : EP3_COLORS.data,
                whiteSpace: 'nowrap',
              }}
            >
              {activeProfileLabel}
            </span>
          </div>

          {/* Baris Kontras 1 (Kecil, ringkas & redup): Tempat Lain */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '10px 14px',
              height: 'auto',
              boxSizing: 'border-box',
              borderRadius: 11,
              backgroundColor: 'rgba(127, 29, 29, 0.14)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              opacity: 0.78 * rowOtherT,
              transform: `translate3d(${((1 - rowOtherT) * 14).toFixed(1)}px, 0, 0)`,
            }}
          >
            <div
              style={{
                minWidth: 0,
                flex: 1,
                fontFamily: EP3_FONTS.body,
                fontSize: 19,
                fontWeight: 500,
                lineHeight: 1.3,
                color: '#CBD5E1',
              }}
            >
              <span
                style={{
                  fontFamily: EP3_FONTS.mono,
                  fontWeight: 800,
                  color: '#FCA5A5',
                }}
              >
                TEMPAT LAIN
              </span>
              {' • '}Request di Luar Paket Dasar ={' '}
              <span style={{ color: '#F87171', fontWeight: 700 }}>Biaya Tambahan</span>
            </div>

            <div
              aria-hidden="true"
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                borderRadius: 7,
                backgroundColor: 'rgba(239, 68, 68, 0.16)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: EP3_FONTS.mono,
                fontSize: 16,
                fontWeight: 800,
                color: '#FCA5A5',
                lineHeight: 1,
              }}
            >
              ✕
            </div>
          </div>

          {/* Baris Kontras 2 (Dominan, besar & stempel slam impact): Mohef Tech */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 18,
              padding: '20px 22px',
              height: 'auto',
              boxSizing: 'border-box',
              borderRadius: 16,
              background:
                'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(0, 229, 255, 0.2) 52%, rgba(6, 78, 59, 0.36) 100%)',
              border: `2.5px solid ${slamGlow > 0.35 ? '#A7F3D0' : EP3_COLORS.ground}`,
              boxShadow: `0 12px 30px rgba(16, 185, 129, ${(0.22 + 0.36 * slamGlow).toFixed(3)}), 0 0 ${(22 + 44 * slamGlow).toFixed(0)}px rgba(0, 229, 255, ${(0.14 + 0.62 * slamGlow).toFixed(3)}), inset 0 0 ${(28 * slamGlow).toFixed(0)}px rgba(110, 231, 183, ${(0.45 * slamGlow).toFixed(3)})`,
              opacity: mohefOpacity,
              transform: `translate3d(0, ${mohefDropY.toFixed(1)}px, 0) scale(${mohefScale.toFixed(3)}) rotate(${mohefRotate.toFixed(2)}deg)`,
              transformOrigin: 'center center',
            }}
          >
            <div
              style={{
                minWidth: 0,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                  fontFamily: EP3_FONTS.heading,
                  fontSize: 28,
                  fontWeight: 900,
                  lineHeight: 1.2,
                  color: '#FFFFFF',
                }}
              >
                <span
                  style={{
                    fontFamily: EP3_FONTS.mono,
                    fontSize: 23,
                    fontWeight: 900,
                    letterSpacing: 0.4,
                    color: EP3_COLORS.data,
                  }}
                >
                  MOHEF TECH
                </span>
                <span style={{ color: '#6EE7B7' }}>•</span>
                <span>Jasa Install Aplikasi</span>
                <span
                  style={{
                    padding: '2px 11px',
                    borderRadius: 7,
                    backgroundColor: '#34D399',
                    color: '#03140D',
                    fontSize: 28,
                    fontWeight: 900,
                    letterSpacing: 0.4,
                    lineHeight: 1.2,
                  }}
                >
                  GRATIS
                </span>
              </div>

              <div
                style={{
                  fontFamily: EP3_FONTS.body,
                  fontSize: 24,
                  fontWeight: 800,
                  lineHeight: 1.25,
                  color: '#ECFDF5',
                }}
              >
                • Bebas Request Apa Pun
              </div>
            </div>

            <div
              aria-hidden="true"
              style={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #34D399 0%, #00E5FF 100%)',
                boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: EP3_FONTS.mono,
                fontSize: 28,
                fontWeight: 900,
                color: '#03140D',
                lineHeight: 1,
                transform: `scale(${checkPopT.toFixed(3)})`,
              }}
            >
              ✓
            </div>
          </div>

          {/* Catatan transparan di dalam kartu */}
          <div
            style={{
              marginTop: 2,
              paddingTop: 12,
              borderTop: `1px solid ${EP3_COLORS.border}`,
              fontFamily: EP3_FONTS.body,
              fontSize: 19,
              fontWeight: 500,
              lineHeight: 1.4,
              color: '#CBD5E1',
              opacity: mohefOpacity,
            }}
          >
            *Untuk aplikasi berbayar, lisensi disiapkan pembeli — jasa instalasi &amp; setup tetap
            gratis.
          </div>
        </div>
      )}

      <BottomSubtitleBar
        words={SCENE4_WORDS}
        stylePreset={EP3_STYLE_PRESET}
        fontSize={32}
        bottomOffset={EP3_SAFE.subtitleBottomOffset}
        maxWordsPerLine={6}
      />
    </AbsoluteFill>
  );
};

export default Scene4CustomApps;
