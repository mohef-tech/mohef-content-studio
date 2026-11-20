import React, { useMemo } from 'react';
import * as THREE from 'three';
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
import { BottomSubtitleBar, SfxCue } from '../../lib/motion-craft';
import { Box, Decal, FACE, PART_COLORS, type V3 } from '../04-ep2-rakit-pc/components/partsCommon';
import { CASE_DIM } from '../04-ep2-rakit-pc/components/PsuAndCase';
import {
  EP3_BGM,
  EP3_COLORS,
  EP3_FONTS,
  EP3_HEIGHT,
  EP3_SAFE,
  EP3_STYLE_PRESET,
  EP3_WIDTH,
  SCENE2_BEATS,
  SCENE2_DURATION_FRAMES,
  SCENE2_WORDS,
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
  usbIn,
  usbAlign,
  usbSeated,
  cardIn,
  installStart,
  point1In,
  point2In,
  installDone,
  licenseIn,
} = SCENE2_BEATS;

/** Progres instalasi (%) dari frame; laju sengaja tidak rata seperti installer sungguhan. */
const installProgress = (frame: number) =>
  Math.floor(interpolate(frame, [installStart, point1In, point2In, installDone], [0, 33, 66, 100], clamp));

// ============================================================================
// Isi layar monitor 3D (canvas texture 1340x720, rasio panel sama dengan Scene 1)
// ============================================================================
const SCREEN_W = 1340;
const SCREEN_H = 720;
const PAD = 80;
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

const fillBg = (ctx: CanvasRenderingContext2D, from: string, to: string) => {
  const g = ctx.createLinearGradient(0, 0, SCREEN_W, SCREEN_H);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
};

const drawCheck = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.13;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y + size * 0.52);
  ctx.lineTo(x + size * 0.43, y + size * 0.71);
  ctx.lineTo(x + size * 0.77, y + size * 0.31);
  ctx.stroke();
};

/** Indikator layar install: menyala saat progres melewati ambangnya. */
const SCREEN_INDICATORS = [
  { label: 'ZERO BLOATWARE RESMI', at: 33 },
  { label: 'OPTIMAL RAM FOOTPRINT', at: 66 },
  { label: 'SESUAI SPESIFIKASI', at: 100 },
] as const;

const installStep = (pct: number) =>
  pct >= 100
    ? 'Instalasi selesai'
    : pct >= 66
      ? 'Menyelesaikan konfigurasi sistem…'
      : pct >= 33
        ? 'Memasang komponen inti sistem…'
        : 'Menyalin file sistem dari USB…';

// fillText(maxWidth) dipakai di semua teks layar agar tidak pernah keluar panel bila font fallback lebih lebar.
const paintSetup = (ctx: CanvasRenderingContext2D) => {
  fillBg(ctx, '#040B16', '#0A1B31');
  const maxW = SCREEN_W - PAD * 2;
  ctx.fillStyle = '#7DD3FC';
  ctx.font = `bold 32px ${MONO}`;
  ctx.fillText('BOOT MENU • UEFI', PAD, 96, maxW);
  ctx.fillStyle = '#F8FAFC';
  ctx.font = `900 100px ${SANS}`;
  ctx.fillText('Menunggu Media', PAD, 262, maxW);
  ctx.fillStyle = EP3_COLORS.data;
  ctx.fillText('Instalasi', PAD, 372, maxW);
  ctx.strokeStyle = EP3_COLORS.caution;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(PAD, 468, maxW, 120, 18);
  ctx.stroke();
  ctx.fillStyle = EP3_COLORS.cautionSoft;
  ctx.font = `bold 42px ${MONO}`;
  ctx.fillText('USB INSTALLER: BELUM TERDETEKSI', PAD + 40, 543, maxW - 80);
};

const paintInstall = (ctx: CanvasRenderingContext2D, pct: number) => {
  fillBg(ctx, '#04101C', '#08192B');
  const maxW = SCREEN_W - PAD * 2;

  ctx.fillStyle = EP3_COLORS.data;
  ctx.font = `bold 32px ${MONO}`;
  ctx.fillText('MOHEF TECH • CLEAN OS INSTALLER', PAD, 96, 760);
  ctx.textAlign = 'right';
  ctx.fillStyle = EP3_COLORS.ground;
  ctx.fillText('USB BOOT ✓', SCREEN_W - PAD, 96);

  ctx.fillStyle = EP3_COLORS.ground;
  ctx.font = `900 104px ${SANS}`;
  ctx.fillText(`${pct}%`, SCREEN_W - PAD, 246);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#F8FAFC';
  ctx.font = `900 78px ${SANS}`;
  ctx.fillText('Menginstal Sistem', PAD, 240, maxW - 300);

  ctx.fillStyle = '#132A40';
  ctx.beginPath();
  ctx.roundRect(PAD, 284, maxW, 48, 24);
  ctx.fill();
  if (pct > 0) {
    ctx.fillStyle = EP3_COLORS.ground;
    ctx.beginPath();
    ctx.roundRect(PAD, 284, Math.max(48, (maxW * pct) / 100), 48, 24);
    ctx.fill();
  }

  ctx.fillStyle = '#A5B8CC';
  ctx.font = `600 38px ${SANS}`;
  ctx.fillText(installStep(pct), PAD, 398, maxW);

  SCREEN_INDICATORS.forEach(({ label, at }, i) => {
    const done = pct >= at;
    const y = 450 + i * 82;
    ctx.beginPath();
    ctx.roundRect(PAD, y, 56, 56, 12);
    if (done) {
      ctx.fillStyle = EP3_COLORS.ground;
      ctx.fill();
      drawCheck(ctx, PAD, y, 56, '#03140D');
    } else {
      ctx.strokeStyle = '#3A5671';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    ctx.fillStyle = done ? '#F8FAFC' : '#7189A3';
    ctx.font = `bold 40px ${MONO}`;
    ctx.fillText(label, PAD + 84, y + 42, maxW - 84);
  });
};

const paintLicensed = (ctx: CanvasRenderingContext2D) => {
  fillBg(ctx, '#03140D', '#062A1C');
  ctx.fillStyle = EP3_COLORS.ground;
  ctx.beginPath();
  ctx.arc(PAD + 130, 270, 130, 0, Math.PI * 2);
  ctx.fill();
  drawCheck(ctx, PAD, 140, 260, '#03140D');

  const textX = PAD + 300;
  const textW = SCREEN_W - PAD - textX;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 84px ${SANS}`;
  ctx.fillText('LISENSI RESMI', textX, 246, textW);
  ctx.fillStyle = '#6EE7B7';
  ctx.font = `900 62px ${SANS}`;
  ctx.fillText('& AKTIVASI AMAN ✓', textX, 334, textW);

  // Cermin layar "STATUS: TIDAK TERLINDUNGI" di Scene 1
  ctx.strokeStyle = EP3_COLORS.ground;
  ctx.lineWidth = 4;
  ctx.strokeRect(PAD, 500, SCREEN_W - PAD * 2, 124);
  ctx.fillStyle = '#34D399';
  ctx.font = `bold 44px ${MONO}`;
  ctx.fillText('STATUS: TERLINDUNGI • 100% SELESAI', PAD + 40, 577, SCREEN_W - PAD * 2 - 80);
};

const staticTexCache = new Map<'setup' | 'licensed', THREE.CanvasTexture>();
const getStaticTexture = (key: 'setup' | 'licensed') => {
  const cached = staticTexCache.get(key);
  if (cached) return cached;
  const canvas = makeCanvas(SCREEN_W, SCREEN_H);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (key === 'setup') paintSetup(ctx);
  else paintLicensed(ctx);
  const tex = makeTexture(canvas);
  staticTexCache.set(key, tex);
  return tex;
};

/** Satu canvas dipakai ulang; digambar ulang hanya saat angka persen berubah. */
let installCanvas: HTMLCanvasElement | null = null;
let installTex: THREE.CanvasTexture | null = null;
const getInstallTexture = (pct: number) => {
  if (!installCanvas || !installTex) {
    installCanvas = makeCanvas(SCREEN_W, SCREEN_H);
    installTex = makeTexture(installCanvas);
  }
  paintInstall(installCanvas.getContext('2d') as CanvasRenderingContext2D, pct);
  installTex.needsUpdate = true;
  return installTex;
};

const MonitorScreens: React.FC<{ pct: number; installIn: number; licenseFade: number }> = ({
  pct,
  installIn,
  licenseFade,
}) => {
  const setupTex = useMemo(() => getStaticTexture('setup'), []);
  const licensedTex = useMemo(() => getStaticTexture('licensed'), []);
  const progressTex = useMemo(() => getInstallTexture(pct), [pct]);
  const layers = [
    { key: 'setup', map: setupTex, opacity: 1 },
    { key: 'install', map: progressTex, opacity: installIn },
    { key: 'licensed', map: licensedTex, opacity: licenseFade },
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
// Flashdisk installer 3D (skala casing: 1 unit = 10 cm)
// ============================================================================
/** Port USB atas casing, sama dengan front I/O di PsuAndCase (koordinat lokal casing). */
const USB_PORT: V3 = [1.95, CASE_DIM.height + 0.02, 0.2];

let usbLabelTex: THREE.CanvasTexture | null = null;
const getUsbLabelTexture = () => {
  if (usbLabelTex) return usbLabelTex;
  const canvas = makeCanvas(192, 336);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = '#16191E';
  ctx.fillRect(0, 0, 192, 336);
  ctx.translate(96, 168);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = EP3_COLORS.power;
  ctx.font = `900 48px ${SANS}`;
  ctx.fillText('MOHEF', 0, -10, 300);
  ctx.fillStyle = '#E2E8F0';
  ctx.font = `bold 26px ${MONO}`;
  ctx.fillText('CLEAN OS', 0, 34, 300);
  usbLabelTex = makeTexture(canvas);
  return usbLabelTex;
};

const UsbInstaller: React.FC<{ frame: number }> = ({ frame }) => {
  const labelTex = useMemo(getUsbLabelTexture, []);
  if (frame < usbIn) return null;

  // Meluncur dari atas frame hingga sejajar port, lalu didorong lurus ke bawah dan berhenti di klik
  const approach = interpolate(frame, [usbIn, usbAlign], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const push = interpolate(frame, [usbAlign + 2, usbSeated], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const away = 1 - approach;
  const tilt = away * 0.55;

  // LED: mati -> menyala saat terpasang -> berkedip selama data disalin -> stabil
  const seated = frame > usbSeated;
  const copying = frame >= installStart && frame < installDone;
  const led = !seated ? 0 : copying ? (Math.floor(frame / 3) % 2 ? 2.6 : 0.7) : 2.2;

  return (
    <group
      position={[USB_PORT[0] + away * 0.8, USB_PORT[1] + away * 5 + (1 - push) * 0.3, USB_PORT[2] + away * 0.3]}
      rotation={[tilt * 0.4, -tilt, tilt]}
    >
      {/* Konektor USB-A: lebar mengikuti sumbu panjang slot port (Z) */}
      <Box size={[0.045, 0.13, 0.12]} position={[0, -0.053, 0]} color={PART_COLORS.metalSilver} metalness={0.9} roughness={0.25} />
      <Box size={[0.09, 0.5, 0.2]} position={[0, 0.262, 0]} color="#16191E" roughness={0.5} />
      <Box size={[0.094, 0.07, 0.204]} position={[0, 0.48, 0]} color={EP3_COLORS.power} roughness={0.45} />
      <Decal size={[0.17, 0.3]} position={[0.0455, 0.22, 0]} rotation={FACE.px} map={labelTex} />
      <Box
        size={[0.012, 0.03, 0.06]}
        position={[0.046, 0.415, 0]}
        color={led > 0 ? EP3_COLORS.data : '#123038'}
        emissive={EP3_COLORS.data}
        emissiveIntensity={led}
      />
      {led > 0 && <pointLight position={[0.2, 0.42, 0]} intensity={0.35 * led} distance={1.4} color={EP3_COLORS.data} />}
    </group>
  );
};

// ============================================================================
// Kamera: lanjut dari pose akhir Scene 1 -> close-up port USB -> two-shot -> dorong ke monitor
// ============================================================================
const CAM_KEYS: CamKeyframe[] = [
  { frame: 0, dist: 21, az: -4.5, el: 10.5, fov: 38, focusY: 840, target: [-2.9, 10.05, -2.3] },
  { frame: 8, dist: 21, az: -4.5, el: 10.5, fov: 38, focusY: 840, target: [-2.9, 10.05, -2.3] },
  { frame: 44, dist: 7.5, az: 46, el: 24, fov: 38, focusY: 1140, target: [3.3, 12.5, 1.8] },
  { frame: cardIn, dist: 7.0, az: 44, el: 23, fov: 38, focusY: 1140, target: [3.3, 12.45, 1.8] },
  { frame: 126, dist: 29, az: 4, el: 13, fov: 38, focusY: 1110, target: [-0.9, 10.4, -1.0] },
  { frame: point2In, dist: 26, az: 1.5, el: 12.5, fov: 38, focusY: 1110, target: [-1.6, 10.35, -1.4] },
  { frame: licenseIn, dist: 21.5, az: -2, el: 11, fov: 38, focusY: 1100, target: [-2.9, 10.2, -2.3] },
  { frame: SCENE2_DURATION_FRAMES, dist: 20.5, az: -3, el: 11, fov: 38, focusY: 1100, target: [-2.9, 10.2, -2.3] },
];

// ============================================================================
// HUD
// ============================================================================
const POINTS = [
  { text: 'Clean Install Tanpa Bloatware Penguras RAM', verifyAt: point1In },
  { text: 'Sistem Operasi Resmi & Sesuai Spesifikasi', verifyAt: point2In },
  { text: 'Aktivasi Aman — Ringan & Stabil Jangka Panjang', verifyAt: licenseIn + 4 },
] as const;

/** Baris checklist: masuk sebagai "menunggu", lalu tercentang saat layar install mencapai tahapnya. */
const ChecklistRow: React.FC<{ text: string; enterT: number; verifyT: number; first: boolean }> = ({
  text,
  enterT,
  verifyT,
  first,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: '13px 0',
      borderTop: first ? 'none' : `1px solid ${EP3_COLORS.border}`,
      opacity: enterT,
      transform: `translate3d(${((1 - enterT) * 18).toFixed(1)}px, 0, 0)`,
    }}
  >
    <div
      style={{
        position: 'relative',
        width: 44,
        height: 44,
        flexShrink: 0,
        borderRadius: 22,
        boxSizing: 'border-box',
        border: '2.5px solid #3B4A5E',
      }}
    >
      <svg
        width={44}
        height={44}
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{ position: 'absolute', left: -2.5, top: -2.5, transform: `scale(${verifyT.toFixed(3)})` }}
      >
        <circle cx="12" cy="12" r="12" fill={EP3_COLORS.ground} />
        <path d="m7 12.4 3.2 3.2L17.2 8.6" fill="none" stroke="#03140D" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <span
      style={{
        fontFamily: EP3_FONTS.body,
        fontSize: 29,
        fontWeight: 700,
        lineHeight: 1.28,
        color: '#FFFFFF',
        opacity: 0.55 + 0.45 * Math.min(1, verifyT),
      }}
    >
      {text}
    </span>
  </div>
);

// ============================================================================
// Scene 2: Clean Install OS & Lisensi Aman
// ============================================================================
export const Scene2CleanInstall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = (start: number, damping = 18) =>
    spring({ frame: frame - start, fps, config: { damping, stiffness: 180, mass: 0.75 } });

  const badgeT = enter(badgeIn);
  const line1T = enter(titleIn, 16);
  const line2T = enter(titleIn + 6, 16);
  const cardT = enter(cardIn);
  const verifiedCount = POINTS.filter((p) => frame >= p.verifyAt).length;

  // Layar monitor & pantulan cahayanya ke meja
  const pct = installProgress(frame);
  const installIn = interpolate(frame, [usbSeated + 4, usbSeated + 12], [0, 1], clamp);
  const licenseFade = interpolate(frame, [licenseIn, licenseIn + 8], [0, 1], clamp);
  const screenGlowColor = frame < usbSeated + 8 ? '#38BDF8' : frame < licenseIn ? EP3_COLORS.data : EP3_COLORS.ground;
  const screenGlowIntensity = frame < usbSeated + 8 ? 1.1 : frame < licenseIn ? 1.4 : 1.7;

  // Kilat tepi hijau satu kali saat lisensi terkunci (penanda sukses, cermin kilat merah Scene 1)
  const successFlash = interpolate(frame, [licenseIn, licenseIn + 4, licenseIn + 24], [0, 1, 0], clamp);

  const pose = useMemo(() => resolveCameraPose(CAM_KEYS, frame), [frame]);

  const bgmVolume = (f: number) =>
    interpolate(f, [0, 15, durationInFrames - 40, durationInFrames], [0, 0.045, 0.045, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: EP3_COLORS.bg, fontFamily: EP3_FONTS.body }}>
      <Audio src={staticFile('audio/vo/ep3-scene2.mp3')} volume={1.0} />
      <Audio src={staticFile(EP3_BGM)} loop volume={bgmVolume} />

      {/* SFX dari KATALOG-AI.md */}
      <SfxCue frame={badgeIn} sfx="click-soft" volume={0.4} />
      <SfxCue frame={titleIn} sfx="transition-whoosh-soft" volume={0.45} />
      <SfxCue frame={usbIn} sfx="transition-whoosh-soft" volume={0.35} />
      <SfxCue frame={usbSeated} sfx="click-soft" volume={0.6} />
      <SfxCue frame={cardIn} sfx="pop-in" volume={0.3} />
      <SfxCue frame={point1In} sfx="tick-soft" volume={0.4} />
      <SfxCue frame={point2In} sfx="tick-soft" volume={0.4} />
      <SfxCue frame={licenseIn} sfx="confirm-chime" volume={0.55} />

      {/* Panggung 3D: meja, PC & monitor Scene 1 + flashdisk installer */}
      <AbsoluteFill>
        <WorkstationStage
          frame={frame}
          pose={pose}
          width={EP3_WIDTH}
          height={EP3_HEIGHT}
          screenGlowColor={screenGlowColor}
          screenGlowIntensity={screenGlowIntensity}
          pcChildren={<UsbInstaller frame={frame} />}
        >
          <MonitorScreens pct={pct} installIn={installIn} licenseFade={licenseFade} />
        </WorkstationStage>
      </AbsoluteFill>

      {/* Gradien kontras untuk judul atas & subtitle bawah */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(7, 11, 18, 0.92) 0%, rgba(7, 11, 18, 0.72) 18%, rgba(7, 11, 18, 0) 36%, rgba(7, 11, 18, 0) 70%, rgba(7, 11, 18, 0.8) 80%, rgba(7, 11, 18, 0.9) 100%)',
        }}
      />
      <AbsoluteFill
        style={{ boxShadow: `inset 0 0 160px rgba(16, 185, 129, ${(0.45 * successFlash).toFixed(3)})` }}
      />

      {/* Header brand (identik Scene 1) */}
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

      {/* Badge tahap (sian = penanda navigasi seri, sama dengan badge Scene 1) */}
      <div
        style={{
          position: 'absolute',
          top: 142,
          left: EP3_SAFE.left,
          padding: '10px 18px',
          borderRadius: 12,
          backgroundColor: 'rgba(0, 229, 255, 0.12)',
          border: `2px solid ${EP3_COLORS.data}`,
          fontFamily: EP3_FONTS.mono,
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: 1,
          lineHeight: 1.2,
          color: EP3_COLORS.data,
          whiteSpace: 'nowrap',
          opacity: badgeT,
          transform: `translate3d(${((1 - badgeT) * -24).toFixed(1)}px, 0, 0)`,
        }}
      >
        TAHAP 01 • CLEAN INSTALL OS
      </div>

      {/* Judul dua baris (reveal bertopeng, pola Scene 1); hijau = status aman/lulus di seri ini */}
      <div
        style={{
          position: 'absolute',
          top: 214,
          left: EP3_SAFE.left,
          width: EP3_SAFE.contentWidth,
          fontFamily: EP3_FONTS.heading,
          fontSize: 84,
          fontWeight: 900,
          lineHeight: 1.04,
          letterSpacing: -1.6,
          textShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
        }}
      >
        {[
          { text: 'SISTEM BERSIH', color: '#FFFFFF', t: line1T },
          { text: '& RESMI', color: '#34D399', t: line2T },
        ].map(({ text, color, t }) => (
          <div key={text} style={{ overflow: 'hidden', paddingBottom: 4 }}>
            <div style={{ color, whiteSpace: 'nowrap', transform: `translate3d(0, ${((1 - t) * 105).toFixed(1)}%, 0)` }}>
              {text}
            </div>
          </div>
        ))}
      </div>

      {/* Kartu checklist: tinggi mengikuti isi (height auto), teks boleh membungkus di dalam kotak */}
      {cardT > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 428,
            left: EP3_SAFE.left,
            width: EP3_SAFE.contentWidth,
            height: 'auto',
            boxSizing: 'border-box',
            padding: '20px 28px 14px',
            borderRadius: 22,
            backgroundColor: 'rgba(12, 14, 20, 0.94)',
            border: `1.5px solid ${EP3_COLORS.ground}66`,
            boxShadow: '0 24px 56px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            opacity: cardT,
            transform: `translate3d(0, ${((1 - cardT) * 28).toFixed(1)}px, 0)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              paddingBottom: 6,
              fontFamily: EP3_FONTS.mono,
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: 0.8,
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: EP3_COLORS.muted }}>CHECKLIST CLEAN INSTALL</span>
            <span style={{ color: verifiedCount === POINTS.length ? '#34D399' : EP3_COLORS.ink }}>
              {verifiedCount}/{POINTS.length} TERVERIFIKASI
            </span>
          </div>
          {POINTS.map((p, i) => (
            <ChecklistRow
              key={p.text}
              text={p.text}
              first={i === 0}
              enterT={enter(cardIn + 4 + i * 6)}
              verifyT={enter(p.verifyAt, 12)}
            />
          ))}
        </div>
      )}

      <BottomSubtitleBar
        words={SCENE2_WORDS}
        stylePreset={EP3_STYLE_PRESET}
        fontSize={32}
        bottomOffset={EP3_SAFE.subtitleBottomOffset}
        maxWordsPerLine={6}
      />
    </AbsoluteFill>
  );
};

export default Scene2CleanInstall;
