import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadJakarta } from '@remotion/google-fonts/PlusJakartaSans';
import { CustomSVGIcon, ExplodeToGrid, SfxCue, type Card3DItem } from '../../lib/motion-craft';
import { HubPill, MohefTechHub3D, type RoomInfo } from './MohefTechHub3D';

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: JAKARTA } = loadJakarta('normal', {
  weights: ['600', '700', '800'],
  subsets: ['latin'],
});

export const SCENE1_DURATION = 270;

const SWITCH = 115;
const NAVY = '#0F172A';
const INK = '#1F1F1F';
const MUTED = '#555555';
const MOHEF_BLUE = '#0056D2';
const MOHEF_DARK = '#0A2A35';
const RED = '#EF4444';
const CARD_ORANGE = '#F97316';

const PROBLEM_PILLS = ['Arsitek Sendiri', 'Teknisi PC & Laptop Sendiri', 'Programmer Sendiri'];
const SOLUTION_PILLS = [
  'Ruang 3D, Listrik, CCTV & Server',
  'Rakit PC & Service Hardware',
  'Web, Sistem Kasir POS & Mobile App',
];

const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ============================================================================
// ZONA ATAS — Giant Tilted Banner
// ============================================================================
const TiltedBanner: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 160, mass: 0.7 } });
  const subEnter = spring({ frame: frame - 6, fps, config: { damping: 15, stiffness: 150 } });
  const swap = spring({ frame: frame - SWITCH, fps, config: { damping: 15, stiffness: 170, mass: 0.7 } });
  const subSwap = spring({ frame: frame - (SWITCH + 8), fps, config: { damping: 16, stiffness: 160 } });

  const punch = 1 + 0.07 * Math.sin(Math.PI * interpolate(frame, [SWITCH, SWITCH + 12], [0, 1], clampOpts));
  const bgStart = interpolateColors(frame, [SWITCH - 2, SWITCH + 6], [RED, MOHEF_BLUE]);
  const bgEnd = interpolateColors(frame, [SWITCH - 2, SWITCH + 6], [RED, MOHEF_DARK]);
  const bannerBorder = interpolateColors(frame, [SWITCH - 2, SWITCH + 6], [RED, MOHEF_DARK]);
  const tilt = interpolate(swap, [0, 0.5, 1], [-2, -4.5, -2]);
  const subBg = interpolateColors(frame, [SWITCH + 6, SWITCH + 14], [NAVY, '#FFFFFF']);
  const subBorder = interpolateColors(frame, [SWITCH + 6, SWITCH + 14], [NAVY, MOHEF_DARK]);

  return (
    <div style={{ position: 'absolute', top: 110, left: 0, right: 0, height: 245, zIndex: 30 }}>
      {/* Banner utama */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: `translateX(-50%) rotate(${tilt}deg) scale(${(0.82 + enter * 0.18) * punch})`,
          opacity: enter,
          background: `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd} 100%)`,
          border: `2px solid ${bannerBorder}`,
          padding: '13px 36px',
          boxShadow:
            frame >= SWITCH
              ? '0 18px 40px rgba(10, 42, 53, 0.38), 0 4px 0 #0A2A35'
              : '0 18px 40px rgba(15, 23, 42, 0.28)',
        }}
      >
        <div style={{ position: 'relative', height: 112, overflow: 'hidden' }}>
          <div
            style={{
              fontFamily: ANTON,
              fontSize: 112,
              lineHeight: 1,
              color: '#FFFFFF',
              letterSpacing: '0.005em',
              whiteSpace: 'nowrap',
              transform: `translateY(${-swap * 120}px)`,
              opacity: 1 - swap,
            }}
          >
            VENDOR TERPISAH?
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              fontFamily: ANTON,
              fontSize: 112,
              lineHeight: 1,
              color: '#FFFFFF',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              transform: `translateY(${(1 - swap) * 120}px)`,
              opacity: swap,
            }}
          >
            MOHEF TECH
          </div>
        </div>
      </div>

      {/* Sub-banner */}
      <div
        style={{
          position: 'absolute',
          top: 158,
          left: '50%',
          width: 880,
          height: 76,
          transform: `translateX(-50%) translateY(${(1 - subEnter) * 24}px) rotate(-1deg)`,
          opacity: subEnter,
          background: subBg,
          border: `2px solid ${subBorder}`,
          boxShadow: '0 12px 28px rgba(10, 42, 53, 0.22)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 22px',
            textAlign: 'center',
            fontFamily: JAKARTA,
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.2,
            color: '#FFFFFF',
            opacity: 1 - subSwap,
            transform: `translateY(${-subSwap * 30}px)`,
          }}
        >
          Bikin ruang usaha atau setup impian sering ribet karena jalan sendiri-sendiri?
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 22px',
            textAlign: 'center',
            fontFamily: JAKARTA,
            fontSize: 24,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '0.01em',
            color: INK,
            opacity: subSwap,
            transform: `translateY(${(1 - subSwap) * 30}px)`,
          }}
        >
          <span>
            SATU PARTNER TEKNIS <span style={{ color: MOHEF_BLUE }}>•</span> DARI RUANG KOSONG SAMPAI SISTEM SIAP PAKAI
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ZONA TENGAH — Pill problem → solusi (wave)
// ============================================================================
const SwapPill: React.FC<{ room: RoomInfo; index: number; frame: number; fps: number }> = ({
  room,
  index,
  frame,
  fps,
}) => {
  const inAt = 15 + index * 6;
  const outAt = SWITCH + index * 6;
  const solAt = outAt + 4;

  const probIn = spring({ frame: frame - inAt, fps, config: { damping: 11, stiffness: 190, mass: 0.6 } });
  const probOut = interpolate(frame, [outAt, outAt + 5], [1, 0], clampOpts);
  const solIn = spring({ frame: frame - solAt, fps, config: { damping: 10, stiffness: 200, mass: 0.6 } });

  const wobble = frame < outAt ? Math.sin((frame + index * 9) * 0.22) * 2.2 : 0;
  const probScale = probIn * probOut;
  const float = Math.sin((frame + index * 20) * 0.07) * 4;

  return (
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        alignItems: 'end',
        transform: `translateY(${float}px)`,
      }}
    >
      <div
        style={{
          gridArea: '1 / 1',
          transformOrigin: '50% 100%',
          transform: `scale(${probScale}) rotate(${wobble}deg)`,
          opacity: Math.min(1, probScale * 1.5),
        }}
      >
        <HubPill text={PROBLEM_PILLS[index]} accent={RED} variant="problem" />
      </div>
      <div
        style={{
          gridArea: '1 / 1',
          transformOrigin: '50% 100%',
          transform: `scale(${solIn})`,
          opacity: Math.min(1, solIn * 1.5),
        }}
      >
        <HubPill text={SOLUTION_PILLS[index]} accent={room.accent} sub={room.sub} />
      </div>
    </div>
  );
};

// ============================================================================
// ZONA BAWAH — 3 Kartu Pilar
// ============================================================================
const PillarContent: React.FC<{
  icon: 'layers-stack' | 'cpu-node' | 'globe-meridian';
  accent: string;
  title: string;
  desc: string;
}> = ({ icon, accent, title, desc }) => (
  <div
    style={{
      alignSelf: 'stretch',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      paddingTop: 10,
      fontFamily: JAKARTA,
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: `${accent}1F`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CustomSVGIcon name={icon} size={40} color={INK} accentColor={accent} />
      </div>
      <div style={{ width: 52, height: 7, borderRadius: 999, background: accent }} />
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color: INK }}>
        {title}
      </div>
      <div style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.35, color: MUTED }}>{desc}</div>
    </div>
    <div style={{ width: '100%', height: 8, borderRadius: 999, background: accent }} />
  </div>
);

const PILLARS: Card3DItem[] = [
  {
    id: 'pillar-ruang',
    indexLabel: '01',
    title: 'RUANG & 3D',
    surfaceColor: 'linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 100%)',
    textColor: INK,
    accentColor: '#10B981',
    content: (
      <PillarContent
        icon="layers-stack"
        accent="#10B981"
        title="RUANG & 3D"
        desc="Desain Ruang, Listrik, CCTV & Server"
      />
    ),
  },
  {
    id: 'pillar-hardware',
    indexLabel: '02',
    title: 'RAKIT PC & SERVICE',
    surfaceColor: 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)',
    textColor: INK,
    accentColor: CARD_ORANGE,
    content: (
      <PillarContent
        icon="cpu-node"
        accent={CARD_ORANGE}
        title="RAKIT PC & SERVICE"
        desc="Rakit PC, Service Laptop & Komputer, Printer"
      />
    ),
  },
  {
    id: 'pillar-software',
    indexLabel: '03',
    title: 'WEB & MOBILE APP',
    surfaceColor: 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)',
    textColor: INK,
    accentColor: MOHEF_BLUE,
    content: (
      <PillarContent
        icon="globe-meridian"
        accent={MOHEF_BLUE}
        title="WEB & MOBILE APP"
        desc="Sistem POS, Website Bisnis & Aplikasi"
      />
    ),
  },
];

// ============================================================================
// SCENE 1
// ============================================================================
export const Scene1Home: React.FC<{ withBgm?: boolean }> = ({ withBgm = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardsIn = interpolate(frame, [4, 18], [0, 1], clampOpts);
  const flash = interpolate(frame, [SWITCH, SWITCH + 4, SWITCH + 18], [0, 0.35, 0], clampOpts);

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #CFE8FB 0%, #E8F3FB 38%, #FBF3E8 72%, #F6E9D7 100%)',
        overflow: 'hidden',
      }}
    >
      {withBgm && <Audio src={staticFile('audio/songs/B25-apple-keynote-pluck.wav')} volume={0.5} loop />}
      <SfxCue frame={15} sfx="pop-plop" volume={0.55} />
      <SfxCue frame={45} sfx="pop-in" volume={0.55} />
      <SfxCue frame={115} sfx="impact-soft" volume={0.6} />
      <SfxCue frame={130} sfx="confirm-chime" volume={0.55} />

      {/* Awan lembut */}
      <div
        style={{
          position: 'absolute',
          top: 60 + Math.sin(frame / 40) * 6,
          left: -120 + frame * 0.25,
          width: 520,
          height: 160,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.75)',
          filter: 'blur(28px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 380,
          right: -160 + frame * 0.18,
          width: 460,
          height: 140,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.6)',
          filter: 'blur(30px)',
        }}
      />

      {/* Zona tengah: panggung 3D (kanvas penuh, fokus di Y≈740) */}
      <MohefTechHub3D
        cameraStage="overview"
        frame={frame}
        width={1080}
        height={1920}
        focusY={740}
        introFrames={60}
        renderPill={(room, i) => <SwapPill room={room} index={i} frame={frame} fps={fps} />}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
      />

      {/* Flash transisi solusi */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(255, 196, 150, 0.9), transparent 65%)',
          opacity: flash,
          zIndex: 20,
          pointerEvents: 'none',
        }}
      />

      <TiltedBanner frame={frame} fps={fps} />

      {/* Zona bawah: 3 kartu pilar */}
      <div
        className="mohef-pillars-grid"
        style={{
          position: 'absolute',
          top: 1160,
          left: 0,
          width: 1080,
          height: 460,
          zIndex: 30,
          opacity: cardsIn,
          transform: `translateY(${(1 - cardsIn) * 40}px)`,
        }}
      >
        <style>{`
          .mohef-pillars-grid > div > div > div:nth-child(1) > div { border: 2px solid #10B981 !important; }
          .mohef-pillars-grid > div > div > div:nth-child(2) > div { border: 2px solid #F97316 !important; }
          .mohef-pillars-grid > div > div > div:nth-child(3) > div { border: 2px solid #0056D2 !important; }
        `}</style>
        <ExplodeToGrid
          items={PILLARS}
          explodeFrame={20}
          settleFrame={48}
          columns={3}
          cardWidth={320}
          cardHeight={420}
          gapPx={20}
          enableSfx={false}
        />
      </div>
    </AbsoluteFill>
  );
};

export default Scene1Home;
