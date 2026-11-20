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
import {
  EP3_BGM,
  EP3_COLORS,
  EP3_FONTS,
  EP3_HEIGHT,
  EP3_SAFE,
  EP3_STYLE_PRESET,
  EP3_WIDTH,
  SCENE1_BEATS,
  SCENE1_DURATION_FRAMES,
  SCENE1_WORDS,
} from './constants';
import {
  MONITOR_SCREEN,
  resolveCameraPose,
  WorkstationStage,
  type CamKeyframe,
} from './components/WorkstationStage';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const { badgeIn, titleIn, bridgeIn, risk1In, risk2In } = SCENE1_BEATS;

/** Kartu HUD selalu berlabuh di tepi bawah ini, jadi tinggi fleksibel tidak pernah menabrak subtitle. */
const CARD_BOTTOM = EP3_HEIGHT - EP3_SAFE.panelBottom;

// ============================================================================
// Isi layar monitor 3D (canvas texture, 1340x720 = rasio panel 5.68 x 3.05)
// ============================================================================
type ScreenKey = 'ready' | 'risk' | 'bsod';
const SCREEN_W = 1340;
const SCREEN_H = 720;
const MONO = 'Menlo, Consolas, monospace';
const SANS = 'Inter, Arial, sans-serif';
const screenTexCache = new Map<ScreenKey, THREE.CanvasTexture>();

const drawPill = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, bg: string, fg: string) => {
  ctx.font = `bold 30px ${MONO}`;
  const w = ctx.measureText(text).width + 44;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x, y, w, 56, 12);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.fillText(text, x + 22, y + 38);
};

const drawWarningTriangle = (ctx: CanvasRenderingContext2D, cx: number, top: number, size: number, color: string) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx + size / 2, top + size * 0.88);
  ctx.lineTo(cx - size / 2, top + size * 0.88);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1B0707';
  ctx.fillRect(cx - size * 0.045, top + size * 0.3, size * 0.09, size * 0.3);
  ctx.fillRect(cx - size * 0.045, top + size * 0.67, size * 0.09, size * 0.09);
};

const SCREEN_PAINTERS: Record<ScreenKey, (ctx: CanvasRenderingContext2D) => void> = {
  // Menyambung layar akhir Episode 2: hardware lolos QC, siap masuk tahap sistem
  ready: (ctx) => {
    const g = ctx.createLinearGradient(0, 0, SCREEN_W, SCREEN_H);
    g.addColorStop(0, '#040B16');
    g.addColorStop(1, '#0A1B31');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    drawPill(ctx, '✓ HARDWARE QC LULUS', 96, 96, EP3_COLORS.ground, '#03140D');
    ctx.fillStyle = '#F8FAFC';
    ctx.font = `900 112px ${SANS}`;
    ctx.fillText('SIAP INSTALASI', 96, 320);
    ctx.fillStyle = EP3_COLORS.data;
    ctx.fillText('SISTEM', 96, 440);
    ctx.fillStyle = '#7DD3FC';
    ctx.font = `bold 38px ${MONO}`;
    ctx.fillText('EP 03 • OS, DRIVER & APLIKASI KERJA', 96, 600);
  },
  risk: (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
    g.addColorStop(0, '#2A0909');
    g.addColorStop(1, '#160505');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(0, 0, SCREEN_W, 136);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 66px ${SANS}`;
    ctx.fillText('SYSTEM SECURITY RISK', 96, 92);
    drawWarningTriangle(ctx, 230, 206, 250, '#F87171');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 70px ${SANS}`;
    ctx.fillText('Activator terdeteksi', 420, 268);
    ctx.fillStyle = '#FCA5A5';
    ctx.font = `bold 36px ${MONO}`;
    ctx.fillText('HackTool:Win32/AutoKMS', 420, 332);
    ctx.fillStyle = EP3_COLORS.dangerSoft;
    ctx.font = `700 46px ${SANS}`;
    ctx.fillText('Data usaha berisiko bocor', 420, 418);
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 4;
    ctx.strokeRect(96, 528, SCREEN_W - 192, 112);
    ctx.fillStyle = '#F87171';
    ctx.font = `bold 44px ${MONO}`;
    ctx.fillText('STATUS: TIDAK TERLINDUNGI', 136, 600);
  },
  // Simulasi blue screen bergaya bersih (stop code nyata untuk kegagalan driver GPU)
  bsod: (ctx) => {
    ctx.fillStyle = '#0F55B0';
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `300 190px ${SANS}`;
    ctx.fillText(':(', 96, 230);
    ctx.font = `600 56px ${SANS}`;
    ctx.fillText('PC Anda mengalami masalah', 96, 350);
    ctx.fillText('dan perlu dimulai ulang.', 96, 420);
    ctx.font = `500 40px ${SANS}`;
    ctx.fillText('35% selesai', 96, 500);
    ctx.font = `bold 36px ${MONO}`;
    ctx.fillText('Stop code: VIDEO_TDR_FAILURE', 96, 600);
    ctx.fillStyle = '#BFDBFE';
    ctx.font = `500 32px ${MONO}`;
    ctx.fillText('Gagal: nvlddmkm.sys (driver GPU)', 96, 650);
  },
};

const getScreenTexture = (key: ScreenKey): THREE.CanvasTexture => {
  const cached = screenTexCache.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = SCREEN_W;
  canvas.height = SCREEN_H;
  SCREEN_PAINTERS[key](canvas.getContext('2d') as CanvasRenderingContext2D);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  screenTexCache.set(key, tex);
  return tex;
};

/** Tiga lapis layar ditumpuk; lapis atas memudar masuk saat risikonya disebut. */
const MonitorScreens: React.FC<{ riskIn: number; bsodIn: number; riskPulse: number }> = ({
  riskIn,
  bsodIn,
  riskPulse,
}) => {
  const textures = useMemo(
    () => ({ ready: getScreenTexture('ready'), risk: getScreenTexture('risk'), bsod: getScreenTexture('bsod') }),
    []
  );
  const layers: Array<{ key: ScreenKey; opacity: number; brightness: number }> = [
    { key: 'ready', opacity: 1, brightness: 1 },
    { key: 'risk', opacity: riskIn, brightness: riskPulse },
    { key: 'bsod', opacity: bsodIn, brightness: 1 },
  ];
  const [x, y, z] = MONITOR_SCREEN.position;

  return (
    <>
      {layers.map(({ key, opacity, brightness }, i) =>
        opacity > 0.001 ? (
          <mesh key={key} position={[x, y, z + i * 0.004]} renderOrder={i}>
            <planeGeometry args={[MONITOR_SCREEN.width, MONITOR_SCREEN.height]} />
            <meshBasicMaterial
              map={textures[key]}
              color={new THREE.Color(brightness, brightness, brightness)}
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
// Kamera: wide PC + monitor, lalu mendorong pelan ke monitor saat risiko muncul
// ============================================================================
const CAM_KEYS: CamKeyframe[] = [
  { frame: 0, dist: 31, az: 3, el: 13, fov: 38, focusY: 900, target: [-1.3, 9.8, -1.2] },
  { frame: risk1In - 10, dist: 28.5, az: 1.5, el: 12.5, fov: 38, focusY: 890, target: [-1.3, 9.8, -1.2] },
  { frame: risk1In + 26, dist: 24, az: -1.5, el: 11.5, fov: 38, focusY: 850, target: [-2.5, 10.0, -2.0] },
  { frame: risk2In, dist: 23, az: -2.5, el: 11, fov: 38, focusY: 850, target: [-2.6, 10.0, -2.1] },
  { frame: risk2In + 26, dist: 21.5, az: -3.5, el: 10.5, fov: 38, focusY: 840, target: [-2.9, 10.05, -2.3] },
  { frame: SCENE1_DURATION_FRAMES, dist: 21, az: -4.5, el: 10.5, fov: 38, focusY: 840, target: [-2.9, 10.05, -2.3] },
];

// ============================================================================
// Elemen HUD
// ============================================================================
const ShieldAlertIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={60} height={60} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill={color} />
    <rect x="11" y="7" width="2" height="7" rx="1" fill="#1B0707" />
    <rect x="11" y="15.6" width="2" height="2" rx="1" fill="#1B0707" />
  </svg>
);

const ChipAlertIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={60} height={60} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 2.5 22.5 20.5h-21L12 2.5Z" fill={color} />
    <rect x="11" y="8.5" width="2" height="6.5" rx="1" fill="#1A1203" />
    <rect x="11" y="16.6" width="2" height="2" rx="1" fill="#1A1203" />
  </svg>
);

interface RiskCardContent {
  index: string;
  tag: string;
  title: string;
  point: string;
  color: string;
  softColor: string;
  inkOnColor: string;
  icon: React.ReactNode;
}

const RISK_CARDS: [RiskCardContent, RiskCardContent] = [
  {
    index: 'RISIKO 01 / 02',
    tag: 'KEAMANAN DATA',
    title: 'OS BAJAKAN / ACTIVATOR',
    point: 'Rawan Malware & Kebocoran Data Usaha',
    color: EP3_COLORS.danger,
    softColor: EP3_COLORS.dangerSoft,
    inkOnColor: '#1B0707',
    icon: <ShieldAlertIcon color={EP3_COLORS.danger} />,
  },
  {
    index: 'RISIKO 02 / 02',
    tag: 'STABILITAS SISTEM',
    title: 'DRIVER SEADANYA',
    point: 'Performa GPU Tertahan & Rawan Blue Screen',
    color: EP3_COLORS.caution,
    softColor: EP3_COLORS.cautionSoft,
    inkOnColor: '#1A1203',
    icon: <ChipAlertIcon color={EP3_COLORS.caution} />,
  },
];

/** Tinggi kartu mengikuti isi (padding lega, tanpa height tetap) dan berlabuh di bawah. */
const RiskCard: React.FC<{ card: RiskCardContent; style: React.CSSProperties }> = ({ card, style }) => (
  <div
    style={{
      position: 'absolute',
      left: EP3_SAFE.left,
      bottom: CARD_BOTTOM,
      width: EP3_SAFE.contentWidth,
      boxSizing: 'border-box',
      padding: '24px 28px 28px',
      borderRadius: 24,
      backgroundColor: 'rgba(12, 14, 20, 0.94)',
      border: `2px solid ${card.color}`,
      boxShadow: '0 24px 56px rgba(0, 0, 0, 0.55)',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      ...style,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <span
        style={{
          padding: '7px 14px',
          borderRadius: 10,
          backgroundColor: card.color,
          color: card.inkOnColor,
          fontFamily: EP3_FONTS.mono,
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: 0.6,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
        }}
      >
        {card.index}
      </span>
      <span
        style={{
          fontFamily: EP3_FONTS.mono,
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: 0.8,
          color: card.softColor,
          whiteSpace: 'nowrap',
        }}
      >
        {card.tag}
      </span>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      {card.icon}
      <span
        style={{
          fontFamily: EP3_FONTS.heading,
          fontSize: 46,
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: -0.6,
          color: '#FFFFFF',
        }}
      >
        {card.title}
      </span>
    </div>

    <div
      style={{
        padding: '16px 20px',
        borderRadius: 14,
        backgroundColor: `${card.color}1F`,
        border: `1.5px solid ${card.color}66`,
        fontFamily: EP3_FONTS.body,
        fontSize: 28,
        fontWeight: 700,
        lineHeight: 1.3,
        color: card.softColor,
      }}
    >
      {card.point}
    </div>
  </div>
);

// ============================================================================
// Scene 1: Hook Episode 3
// ============================================================================
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = (start: number, damping = 18) =>
    spring({ frame: frame - start, fps, config: { damping, stiffness: 180, mass: 0.75 } });

  // Paruh awal: badge episode, judul dua baris (reveal bertopeng), kartu jembatan Ep2
  const badgeT = enter(badgeIn);
  const line1T = enter(titleIn, 16);
  const line2T = enter(titleIn + 6, 16);
  const bridgeT = enter(bridgeIn);
  const bridgeExit = interpolate(frame, [risk1In - 12, risk1In], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

  // Paruh kedua: kartu risiko 1 lalu digantikan kartu risiko 2
  const card1T = enter(risk1In, 17);
  const card1Exit = interpolate(frame, [risk2In - 4, risk2In + 10], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const card2T = enter(risk2In + 4, 17);

  // Layar monitor & cahaya yang memantul ke meja
  const riskIn = interpolate(frame, [risk1In, risk1In + 6], [0, 1], clamp);
  const bsodIn = interpolate(frame, [risk2In, risk2In + 6], [0, 1], clamp);
  const riskPulse = 0.88 + 0.12 * Math.sin(frame * 0.35);
  const screenGlowColor = frame < risk1In ? '#38BDF8' : frame < risk2In ? '#EF4444' : '#3B82F6';
  const screenGlowIntensity = frame < risk1In ? 1.1 : frame < risk2In ? 1.9 * riskPulse : 1.6;

  // Kilat tepi layar satu kali saat tiap risiko muncul (menandai peringatan, bukan dekorasi)
  const alertFlash = (start: number) =>
    interpolate(frame, [start, start + 4, start + 22], [0, 1, 0], clamp);
  const flash1 = alertFlash(risk1In);
  const flash2 = alertFlash(risk2In);

  const pose = useMemo(() => resolveCameraPose(CAM_KEYS, frame), [frame]);

  const bgmVolume = (f: number) =>
    interpolate(f, [0, 15, durationInFrames - 40, durationInFrames], [0, 0.045, 0.045, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: EP3_COLORS.bg, fontFamily: EP3_FONTS.body }}>
      {/* VO & BGM seri (file 10 detik, di-loop agar tidak putus bila scene lebih panjang) */}
      <Audio src={staticFile('audio/vo/ep3-scene1.mp3')} volume={1.0} />
      <Audio src={staticFile(EP3_BGM)} loop volume={bgmVolume} />

      {/* SFX dari KATALOG-AI.md */}
      <SfxCue frame={badgeIn} sfx="click-soft" volume={0.4} />
      <SfxCue frame={titleIn} sfx="transition-whoosh-soft" volume={0.45} />
      <SfxCue frame={risk1In} sfx="impact-soft" volume={0.5} />
      <SfxCue frame={risk1In + 3} sfx="click-soft" volume={0.4} />
      <SfxCue frame={risk2In - 4} sfx="transition-whoosh-soft" volume={0.45} />
      <SfxCue frame={risk2In + 2} sfx="impact-soft" volume={0.45} />

      {/* Panggung 3D: PC Episode 2 menyala di samping monitor */}
      <AbsoluteFill>
        <WorkstationStage
          frame={frame}
          pose={pose}
          width={EP3_WIDTH}
          height={EP3_HEIGHT}
          screenGlowColor={screenGlowColor}
          screenGlowIntensity={screenGlowIntensity}
        >
          <MonitorScreens riskIn={riskIn} bsodIn={bsodIn} riskPulse={riskPulse} />
        </WorkstationStage>
      </AbsoluteFill>

      {/* Gradien kontras: area judul atas & area kartu/subtitle bawah */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(7, 11, 18, 0.92) 0%, rgba(7, 11, 18, 0.62) 20%, rgba(7, 11, 18, 0) 34%, rgba(7, 11, 18, 0) 58%, rgba(7, 11, 18, 0.82) 76%, rgba(7, 11, 18, 0.9) 100%)',
        }}
      />

      {/* Kilat tepi peringatan */}
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 160px rgba(239, 68, 68, ${(0.55 * flash1).toFixed(3)}), inset 0 0 160px rgba(245, 158, 11, ${(0.5 * flash2).toFixed(3)})`,
        }}
      />

      {/* Header brand (Y 56..110) */}
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

      {/* Badge episode: sian = warna "NEXT EPISODE 3" di akhir Episode 2 */}
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
        EP 03 • INSTALASI &amp; SISTEM
      </div>

      {/* Judul besar dua baris, tiap baris naik dari balik topeng */}
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
          { text: 'JANGAN ASAL', color: '#F87171', t: line1T },
          { text: 'INSTALL SISTEM!', color: '#FFFFFF', t: line2T },
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

      {/* Kartu jembatan dari Episode 2 (paruh awal) */}
      {bridgeExit < 1 && (
        <div
          style={{
            position: 'absolute',
            left: EP3_SAFE.left,
            bottom: CARD_BOTTOM,
            width: EP3_SAFE.contentWidth,
            boxSizing: 'border-box',
            padding: '20px 26px 22px',
            borderRadius: 20,
            backgroundColor: 'rgba(12, 22, 38, 0.92)',
            border: `1.5px solid ${EP3_COLORS.ground}88`,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            opacity: bridgeT * (1 - bridgeExit),
            transform: `translate3d(0, ${((1 - bridgeT) * 28 + bridgeExit * 24).toFixed(1)}px, 0)`,
          }}
        >
          <span
            style={{
              fontFamily: EP3_FONTS.mono,
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: 0.8,
              color: EP3_COLORS.ground,
            }}
          >
            ✓ LANJUTAN EPISODE 02
          </span>
          <span
            style={{
              fontFamily: EP3_FONTS.heading,
              fontSize: 30,
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#FFFFFF',
            }}
          >
            PC rakitan lolos QC &amp; menyala stabil. Sekarang tahap sistem.
          </span>
        </div>
      )}

      {/* Kartu risiko (paruh kedua) */}
      {card1T > 0.01 && card1Exit < 1 && (
        <RiskCard
          card={RISK_CARDS[0]}
          style={{
            opacity: card1T * (1 - card1Exit),
            transform: `translate3d(${(-card1Exit * 140).toFixed(1)}px, ${((1 - card1T) * 36).toFixed(1)}px, 0)`,
          }}
        />
      )}
      {card2T > 0.01 && (
        <RiskCard
          card={RISK_CARDS[1]}
          style={{
            opacity: card2T,
            transform: `translate3d(${((1 - card2T) * 140).toFixed(1)}px, 0, 0)`,
          }}
        />
      )}

      {/* Slot subtitle VO di area aman bawah (>= 300px dari tepi bawah) */}
      <BottomSubtitleBar
        words={SCENE1_WORDS}
        stylePreset={EP3_STYLE_PRESET}
        fontSize={32}
        bottomOffset={EP3_SAFE.subtitleBottomOffset}
        maxWordsPerLine={6}
      />
    </AbsoluteFill>
  );
};

export default Scene1Hook;
