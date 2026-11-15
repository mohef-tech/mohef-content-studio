import React from 'react';
import {
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
  Card3DItem,
  Clean3DCardFace,
  CustomSVGIcon,
  SeamlessSceneShell,
  SfxCue,
} from '../../lib/motion-craft';
import {
  EP1_COLORS,
  EP1_DURATIONS,
  EP1_FONTS,
  EP1_LAYOUT,
  SCENE4_WORDS,
} from './constants';
import { HybridStageFrame } from './components/HybridStageFrame';
import { XRayRoom3D } from './components/XRayRoom3D';
import { projectToScreen, V3 } from '../02-promo-ruang3d/lib/iso';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const renderPanelContent = (
  metric: string,
  accent: string,
  title: string,
  subtitle: string
): React.ReactNode => (
  <div
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 22,
    }}
  >
    <div
      style={{
        width: 226,
        flexShrink: 0,
        padding: '10px 14px',
        borderRadius: 12,
        backgroundColor: `${accent}1A`,
        border: `1.5px solid ${accent}66`,
        fontFamily: EP1_FONTS.mono,
        fontSize: 22,
        fontWeight: 900,
        letterSpacing: 0.4,
        color: accent,
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {metric}
    </div>

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div
        style={{
          fontFamily: EP1_FONTS.heading,
          fontSize: 22,
          fontWeight: 800,
          lineHeight: 1.18,
          color: '#FFFFFF',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: EP1_FONTS.body,
          fontSize: 16.5,
          fontWeight: 500,
          lineHeight: 1.32,
          color: 'rgba(248, 250, 252, 0.86)',
        }}
      >
        {subtitle}
      </div>
    </div>
  </div>
);

const PANELS: Card3DItem[] = [
  {
    id: 'lapis-avr',
    indexLabel: 'LAPIS PROTEKSI 01',
    metric: 'AVR 220V',
    title: 'Stabilizer Tegangan Otomatis',
    subtitle: 'Menjaga voltase tetap stabil saat listrik rumah sedang naik-turun.',
    surfaceColor: '#0F1F4D',
    textColor: '#FFFFFF',
    accentColor: '#00E5FF',
    content: renderPanelContent(
      'AVR 220V',
      '#00E5FF',
      'Stabilizer Tegangan Otomatis',
      'Menjaga voltase tetap stabil saat listrik rumah sedang naik-turun.'
    ),
  },
  {
    id: 'lapis-surge',
    indexLabel: 'LAPIS PROTEKSI 02',
    metric: 'ANTI-LONJAKAN',
    title: 'Surge Protector (Penahan Petir)',
    subtitle: 'Membuang lonjakan arus & petir sebelum merusak PSU PC dan monitor.',
    surfaceColor: '#1B1426',
    textColor: '#FFFFFF',
    accentColor: '#FF7A2F',
    content: renderPanelContent(
      'ANTI-LONJAKAN',
      '#FF7A2F',
      'Surge Protector (Penahan Petir)',
      'Membuang lonjakan arus & petir sebelum merusak PSU PC dan monitor.'
    ),
  },
  {
    id: 'lapis-ups',
    indexLabel: 'LAPIS PROTEKSI 03',
    metric: 'UPS BACKUP',
    title: 'UPS Battery Backup Darurat',
    subtitle: 'Memberi waktu aman untuk save project & shutdown saat mati lampu mendadak.',
    surfaceColor: '#0B2420',
    textColor: '#FFFFFF',
    accentColor: '#10B981',
    content: renderPanelContent(
      'UPS BACKUP',
      '#10B981',
      'UPS Battery Backup Darurat',
      'Memberi waktu aman untuk save project & shutdown saat mati lampu mendadak.'
    ),
  },
];

const PANEL_START_FRAMES = [18, 54, 90] as const;

export const Scene4ProteksiUPS: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Frame 15-53: pulsa lonjakan arus merah/oranye dari stopkontak ke meja
  const isSurgeSpike = frame >= 15 && frame < 54;
  const isShieldActive = frame >= 90;

  const surgeBlink = 0.5 + 0.5 * Math.sin(frame * 0.85);
  const surgeInflowGlow = isSurgeSpike
    ? 0.55 + surgeBlink * 0.45
    : interpolate(frame, [54, 72], [0.85, 0.72], clamp);
  const surgeInflowColor = isSurgeSpike ? EP1_COLORS.overload : EP1_COLORS.power;

  // Frame 54: Surge Shield mulai aktif; Frame 90: Perisai Hijau UPS aktif penuh
  const upsShieldGlow =
    frame < 54
      ? 0
      : frame < 90
      ? interpolate(frame, [54, 72], [0.1, 0.45], clamp)
      : interpolate(frame, [90, 106], [0.45, 1], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
  const upsOutputGlow = interpolate(frame, [90, 110], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Kamera 3D menyorot area bawah meja tempat UPS & Surge Protector berada
  const cameraZoom = interpolate(frame, [0, 48, 270], [142, 166, 158], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const roomRotationY = interpolate(frame, [0, EP1_DURATIONS.scene4], [-0.1, 0.04], clamp);
  const offsetX = interpolate(frame, [0, 48, 270], [0.06, 0.22, 0.16], clamp);
  const offsetY = interpolate(frame, [0, 48, 270], [-0.8, -0.74, -0.76], clamp);
  const offsetZ = interpolate(frame, [0, 48, 270], [0.42, 0.68, 0.62], clamp);

  const proj3D = (p: V3) =>
    projectToScreen(
      p,
      { rotY: roomRotationY, x: offsetX, y: offsetY, z: offsetZ },
      EP1_LAYOUT.contentWidth,
      EP1_LAYOUT.stageHeight,
      cameraZoom
    );

  // Proyeksi label callout 3D: AVR 220V (Frame 18), SURGE SHIELD (Frame 54), UPS BACKUP (Frame 90)
  const ptSurge = proj3D([-0.17, 0.24, -1.51]);
  const ptUps = proj3D([-0.43, 0.42, -1.33]);
  const ptAvr = proj3D([0.28, 0.42, -1.28]);

  const avrAlpha = interpolate(frame, [18, 30], [0, 1], clamp);
  const surgeAlpha = interpolate(frame, [54, 66], [0, 1], clamp);
  const upsAlpha = interpolate(frame, [90, 102], [0, 1], clamp);

  const overlays = (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 13 }}>
      {/* Indikator Lonjakan Awal (Frame 15-53) */}
      {isSurgeSpike && (
        <div
          style={{
            position: 'absolute',
            left: ptSurge.x,
            top: ptSurge.y - 46,
            transform: 'translate(-50%, -100%)',
            padding: '6px 14px',
            borderRadius: 8,
            backgroundColor: 'rgba(42, 18, 21, 0.92)',
            border: `1.5px solid ${EP1_COLORS.overload}`,
            color: EP1_COLORS.overload,
            fontFamily: EP1_FONTS.mono,
            fontSize: 15,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            opacity: 0.7 + surgeBlink * 0.3,
          }}
        >
          LONJAKAN TEGANGAN!
        </div>
      )}

      {/* 3 Callout Proteksi Sinkron dengan Urutan Kartu */}
      <div
        style={{
          position: 'absolute',
          left: ptSurge.x + 12,
          top: ptSurge.y - 48,
          transform: 'translate(-50%, -100%)',
          opacity: surgeAlpha,
          padding: '5px 12px',
          borderRadius: 8,
          backgroundColor: 'rgba(7, 11, 18, 0.88)',
          border: `1.5px solid ${EP1_COLORS.power}`,
          color: EP1_COLORS.power,
          fontFamily: EP1_FONTS.mono,
          fontSize: 15,
          fontWeight: 800,
          whiteSpace: 'nowrap',
        }}
      >
        SURGE SHIELD
      </div>

      <div
        style={{
          position: 'absolute',
          left: ptUps.x - 18,
          top: ptUps.y - 16,
          transform: 'translate(-100%, -50%)',
          opacity: upsAlpha,
          padding: '5px 12px',
          borderRadius: 8,
          backgroundColor: 'rgba(7, 11, 18, 0.88)',
          border: `1.5px solid ${EP1_COLORS.ground}`,
          color: EP1_COLORS.ground,
          fontFamily: EP1_FONTS.mono,
          fontSize: 15,
          fontWeight: 800,
          whiteSpace: 'nowrap',
        }}
      >
        UPS BACKUP
      </div>

      <div
        style={{
          position: 'absolute',
          left: ptAvr.x + 18,
          top: ptAvr.y + 8,
          transform: 'translate(0, -50%)',
          opacity: avrAlpha,
          padding: '5px 12px',
          borderRadius: 8,
          backgroundColor: 'rgba(7, 11, 18, 0.88)',
          border: `1.5px solid ${EP1_COLORS.data}`,
          color: EP1_COLORS.data,
          fontFamily: EP1_FONTS.mono,
          fontSize: 15,
          fontWeight: 800,
          whiteSpace: 'nowrap',
        }}
      >
        AVR 220V
      </div>
    </div>
  );

  const stageBadge = isShieldActive
    ? 'SHIELD ACTIVE • DAYA TERSARING AMAN'
    : isSurgeSpike
    ? 'MENDETEKSI LONJAKAN TEGANGAN'
    : 'AREA PROTEKSI BAWAH MEJA';

  const stageBadgeColor = isShieldActive
    ? EP1_COLORS.ground
    : isSurgeSpike
    ? EP1_COLORS.overload
    : EP1_COLORS.power;

  const bottomStage = (
    <SeamlessSceneShell
      startFrame={0}
      endFrame={EP1_DURATIONS.scene4}
      enterMode="whip-glide-left"
      exitMode="whip-glide-left"
      background="rgba(12, 18, 29, 0.92)"
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '16px 32px 16px',
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
        {/* Header Deck Bawah */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px',
            borderRadius: 14,
            backgroundColor: 'rgba(10, 15, 25, 0.82)',
            border: `1px solid ${EP1_COLORS.ground}44`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CustomSVGIcon
              name="check-badge"
              size={48}
              color="#FFFFFF"
              accentColor="#10B981"
              startFrame={4}
            />
            <div>
              <div
                style={{
                  fontFamily: EP1_FONTS.mono,
                  fontSize: 14,
                  fontWeight: 700,
                  color: EP1_COLORS.ground,
                  letterSpacing: 0.8,
                }}
              >
                POIN 03 • TAMENG PERANGKAT
              </div>
              <div
                style={{
                  fontFamily: EP1_FONTS.heading,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                3 Lapis Proteksi &amp; UPS Backup
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              backgroundColor: 'rgba(16, 185, 129, 0.14)',
              border: `1px solid ${EP1_COLORS.ground}55`,
              fontFamily: EP1_FONTS.mono,
              fontSize: 13,
              fontWeight: 700,
              color: EP1_COLORS.ground,
            }}
          >
            SHIELD READY
          </div>
        </div>

        {/* Bagian Utama: AccordionFoldCard */}
        <div
          className="ep1-accordion-panels"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
          }}
        >
          <style>{`
            .ep1-accordion-panels > div > div > div > div {
              padding: 14px 24px !important;
              justify-content: flex-start !important;
              gap: 8px !important;
              border: 1.5px solid rgba(255, 255, 255, 0.18) !important;
            }
            .ep1-accordion-panels > div > div > div > div > div:first-child span {
              font-size: 13.5px !important;
              letter-spacing: 0.08em !important;
              opacity: 0.86 !important;
            }
          `}</style>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '1350px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                transformStyle: 'preserve-3d',
              }}
            >
              {PANELS.map((panel, idx) => {
                const start = PANEL_START_FRAMES[idx];
                const pUnfold =
                  frame < start
                    ? 0
                    : spring({
                        frame: frame - start,
                        fps,
                        config: { damping: 15, stiffness: 140, mass: 0.8 },
                      });
                const sign = idx % 2 === 0 ? 1 : -1;
                const foldAngle = (1 - pUnfold) * 76 * sign;
                const ty = (1 - pUnfold) * 22;
                const opacity = interpolate(frame, [start, start + 10], [0, 1], clamp);
                const scale = 0.94 + 0.06 * pUnfold;

                return (
                  <div
                    key={panel.id}
                    style={{
                      width: 860,
                      height: 156,
                      transformOrigin: '50% 0%',
                      transform: `translate3d(0, ${ty.toFixed(1)}px, 0) rotateX(${foldAngle.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
                      opacity,
                      visibility: frame < start ? 'hidden' : 'visible',
                    }}
                  >
                    <Clean3DCardFace
                      item={panel}
                      index={idx}
                      width={860}
                      height={156}
                      isActive={idx === 0}
                      borderRadius={16}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SeamlessSceneShell>
  );

  return (
    <>
      <Audio src={staticFile('audio/vo/ep1-scene4.mp3')} volume={1.0} />

      <AudioStage
        musicSrc="audio/songs/B26-framer-linear-saas-groove.wav"
        words={SCENE4_WORDS}
        bedSrc=""
        sfxTrackSrc=""
        baseMusicVolume={0.14}
      />

      <SfxCue frame={18} sfx="pop-in" volume={0.35} />
      <SfxCue frame={54} sfx="toggle-on" volume={0.35} />
      <SfxCue frame={90} sfx="confirm-glass" volume={0.38} />

      <HybridStageFrame
        stageBadge={stageBadge}
        stageBadgeColor={stageBadgeColor}
        stageRightTag="POIN 03 • SURGE & UPS"
        headerTag="EP 01 • SCENE 04"
        words={SCENE4_WORDS}
        topStage={
          <XRayRoom3D
            xrayProgress={1}
            powerGlow={0.62}
            groundGlow={0.78}
            dataGlow={0.5}
            acPowerGlow={0.28}
            lanGlow={0.35}
            tvConduitGlow={0.25}
            upsShieldGlow={upsShieldGlow}
            surgeInflowGlow={surgeInflowGlow}
            surgeInflowColor={surgeInflowColor}
            upsOutputGlow={upsOutputGlow}
            upsOutputColor={EP1_COLORS.ground}
            overlays={overlays}
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
