import React from 'react';
import { Audio, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import {
  AnimatedProgressBar,
  AudioStage,
  Card3DItem,
  CardFlip3D,
  CustomSVGIcon,
  SeamlessSceneShell,
  SfxCue,
} from '../../lib/motion-craft';
import {
  EP1_COLORS,
  EP1_DURATIONS,
  EP1_FONTS,
  SCENE2_WORDS,
} from './constants';
import { HybridStageFrame } from './components/HybridStageFrame';
import { XRayRoom3D } from './components/XRayRoom3D';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const renderCardContent = (
  metric: string,
  metricColor: string,
  title: string,
  subtitle: string
): React.ReactNode => (
  <div
    style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 10,
      marginTop: 8,
    }}
  >
    <div
      style={{
        fontFamily: EP1_FONTS.heading,
        fontSize: 44,
        fontWeight: 900,
        letterSpacing: '-0.02em',
        lineHeight: 1.05,
        color: metricColor,
        whiteSpace: 'nowrap',
      }}
    >
      {metric}
    </div>
    <div
      style={{
        fontFamily: EP1_FONTS.heading,
        fontSize: 31,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.18,
        color: '#FFFFFF',
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontFamily: EP1_FONTS.body,
        fontSize: 22,
        fontWeight: 500,
        lineHeight: 1.35,
        color: 'rgba(248, 250, 252, 0.86)',
      }}
    >
      {subtitle}
    </div>
  </div>
);

const FRONT_ITEM: Card3DItem = {
  id: 'mcb-overload',
  indexLabel: 'MASALAH UMUM',
  title: '1 Jalur MCB Campur & Tanpa Grounding',
  subtitle:
    'Listrik langsung jeglek saat PC render + AC menyala bersamaan, dan casing PC terasa nyetrum.',
  metric: 'OVERLOAD',
  surfaceColor: '#2A1215',
  textColor: '#FFFFFF',
  accentColor: '#EF4444',
  content: renderCardContent(
    'OVERLOAD',
    '#EF4444',
    '1 Jalur MCB Campur & Tanpa Grounding',
    'Listrik langsung jeglek saat PC render + AC menyala bersamaan, dan casing PC terasa nyetrum.'
  ),
};

const BACK_ITEM: Card3DItem = {
  id: 'mcb-aman',
  indexLabel: 'STANDAR PRO 01',
  title: 'Jalur MCB Mandiri + Kabel Grounding',
  subtitle:
    'Pisahkan 1 grup MCB khusus ruang kerja & wajib pasang jalur Arde (Grounding) untuk membuang listrik statis.',
  metric: '100% AMAN',
  surfaceColor: '#0F1F4D',
  textColor: '#FFFFFF',
  accentColor: '#10B981',
  content: renderCardContent(
    '100% AMAN',
    '#10B981',
    'Jalur MCB Mandiri + Kabel Grounding',
    'Pisahkan 1 grup MCB khusus ruang kerja & wajib pasang jalur Arde (Grounding) untuk membuang listrik statis.'
  ),
};

export const Scene2FondasiDaya: React.FC = () => {
  const frame = useCurrentFrame();

  // Fase 1 (0..110): Overload/Jeglek, Fase 2 (115..300): Solusi MCB Mandiri + Grounding
  const isOverloadBlinkWindow = frame >= 85 && frame <= 112;
  const isSafePhase = frame >= 115;

  // Kedip merah cepat saat beban puncak (Frame 85-110)
  const blinkWave = 0.5 + 0.5 * Math.sin((frame - 85) * 0.95);
  const overloadAlert = isOverloadBlinkWindow ? 0.35 + blinkWave * 0.65 : 0;

  const powerColor = isOverloadBlinkWindow
    ? EP1_COLORS.overload
    : EP1_COLORS.power;

  const powerGlow = isOverloadBlinkWindow
    ? 0.45 + blinkWave * 0.55
    : interpolate(frame, [0, 20, 115, 130], [0.7, 1, 0.85, 1], clamp);

  const groundGlow = interpolate(frame, [115, 138], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Kamera 3D zoom-in menyorot Box Panel MCB & jalur daya menuju meja
  const cameraZoom = interpolate(frame, [0, 45, 115, 300], [122, 146, 152, 144], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const roomRotationY = interpolate(frame, [0, EP1_DURATIONS.scene2], [-0.08, 0.06], clamp);
  const offsetX = interpolate(frame, [0, 45, 300], [0.15, 0.46, 0.36], clamp);
  const offsetY = interpolate(frame, [0, 45, 300], [-0.84, -0.98, -0.94], clamp);
  const offsetZ = interpolate(frame, [0, 45, 300], [0.12, 0.42, 0.34], clamp);

  const stageBadge = isSafePhase
    ? 'MCB MANDIRI + GROUNDING AKTIF'
    : isOverloadBlinkWindow
    ? 'PERINGATAN: OVERLOAD / JEGLEK!'
    : 'ANALISIS PANEL MCB & BEBAN DAYA';

  const stageBadgeColor = isSafePhase
    ? EP1_COLORS.ground
    : isOverloadBlinkWindow
    ? EP1_COLORS.overload
    : EP1_COLORS.power;

  const bottomStage = (
    <SeamlessSceneShell
      startFrame={0}
      endFrame={EP1_DURATIONS.scene2}
      enterMode="whip-glide-left"
      exitMode="whip-glide-left"
      background="rgba(12, 18, 29, 0.92)"
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '18px 28px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: `1px solid ${stageBadgeColor}40`,
          borderRadius: 24,
          background:
            'linear-gradient(165deg, rgba(18, 27, 43, 0.94) 0%, rgba(9, 13, 22, 0.97) 100%)',
        }}
      >
        {/* Bagian Atas Deck Bawah: Ikon CPU + Progress Bar Beban Daya */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '12px 20px',
            borderRadius: 16,
            backgroundColor: 'rgba(10, 15, 25, 0.85)',
            border: `1px solid ${
              isOverloadBlinkWindow ? EP1_COLORS.overload : EP1_COLORS.power
            }44`,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 14,
              backgroundColor: isOverloadBlinkWindow
                ? 'rgba(239, 68, 68, 0.16)'
                : 'rgba(255, 122, 47, 0.14)',
              border: `1px solid ${
                isOverloadBlinkWindow ? EP1_COLORS.overload : EP1_COLORS.power
              }55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CustomSVGIcon
              name="cpu-node"
              size={48}
              color="#FFFFFF"
              accentColor="#FF7A2F"
              startFrame={6}
            />
          </div>

          <div style={{ flex: 1 }}>
            <AnimatedProgressBar
              label="BEBAN DAYA WORKSTATION (WATT)"
              startFrame={15}
              endFrame={90}
              accentColor={isOverloadBlinkWindow ? '#EF4444' : '#FF7A2F'}
              trackColor="rgba(255, 255, 255, 0.12)"
              textColor="#F8FAFC"
              monoFont={EP1_FONTS.mono}
              height={12}
              enableProgressSfx={true}
            />
          </div>
        </div>

        {/* Bagian Utama Deck Bawah: CardFlip3D */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 6,
            transform: 'scale(0.92)',
            transformOrigin: 'center center',
          }}
        >
          <CardFlip3D
            frontItem={FRONT_ITEM}
            backItem={BACK_ITEM}
            flipFrame={115}
            cardWidth={820}
            cardHeight={480}
            enableSfx={false}
          />
        </div>
      </div>
    </SeamlessSceneShell>
  );

  return (
    <>
      <Audio src={staticFile('audio/vo/ep1-scene2.mp3')} volume={1.0} />

      <AudioStage
        musicSrc="audio/songs/B26-framer-linear-saas-groove.wav"
        words={SCENE2_WORDS}
        bedSrc=""
        sfxTrackSrc=""
        baseMusicVolume={0.14}
      />

      <SfxCue frame={90} sfx="transition-glitch" volume={0.35} />
      <SfxCue frame={115} sfx="transition-swipe" volume={0.38} />
      <SfxCue frame={140} sfx="confirm-chime" volume={0.35} />

      <HybridStageFrame
        stageBadge={stageBadge}
        stageBadgeColor={stageBadgeColor}
        stageRightTag="POIN 01 • PANEL MCB & ARDE"
        headerTag="EP 01 • SCENE 02"
        words={SCENE2_WORDS}
        topStage={
          <XRayRoom3D
            xrayProgress={1}
            powerColor={powerColor}
            powerGlow={powerGlow}
            groundGlow={groundGlow}
            dataGlow={0.35}
            acPowerColor={isOverloadBlinkWindow ? EP1_COLORS.overload : EP1_COLORS.power}
            acPowerGlow={isOverloadBlinkWindow ? powerGlow : isSafePhase ? 0.42 : 0.72}
            lanGlow={0.3}
            tvConduitGlow={0.25}
            mcbHighlight={1}
            overloadAlert={overloadAlert}
            roomRotationY={roomRotationY}
            cameraZoom={cameraZoom}
            roomOffset={[offsetX, offsetY, offsetZ]}
          />
        }
        bottomStage={bottomStage}
      />
    </>
  );
};
