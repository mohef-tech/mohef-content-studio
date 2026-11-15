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
  CameraRig,
  CustomSVGIcon,
  SeamlessSceneShell,
  SfxCue,
  TypeText,
} from '../../lib/motion-craft';
import {
  EP1_COLORS,
  EP1_DURATIONS,
  EP1_FONTS,
  EP1_STYLE_PRESET,
  SCENE1_WORDS,
} from './constants';
import { HybridStageFrame } from './components/HybridStageFrame';
import { XRayRoom3D } from './components/XRayRoom3D';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const CONDUIT_LEGEND = [
  { label: 'POWER 220V', detail: 'MCB & Stopkontak', color: EP1_COLORS.power },
  { label: 'DATA / MONITOR', detail: 'Display & LAN', color: EP1_COLORS.data },
  { label: 'GROUND & UPS', detail: 'Arde & Proteksi', color: EP1_COLORS.ground },
  { label: 'OVERLOAD', detail: 'Alert Beban', color: EP1_COLORS.overload },
] as const;

export const Scene1HookXRay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 2 detik pertama (frame 0..60) terang, lalu scanline sapu (frame 54..86) -> Dark Blueprint X-Ray
  const xrayProgress = interpolate(frame, [58, 86], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  const scanlineProgress = interpolate(frame, [52, 84], [0, 1], clamp);

  const conduitGlow = interpolate(frame, [66, 98], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const roomRotationY = interpolate(frame, [0, EP1_DURATIONS.scene1], [-0.26, -0.08], clamp);
  const cameraZoom = interpolate(
    frame,
    [0, 60, 180, EP1_DURATIONS.scene1],
    [108, 112, 118, 115],
    clamp
  );

  const isXRay = frame >= 64;

  const bottomStage = (
    <SeamlessSceneShell
      startFrame={0}
      endFrame={EP1_DURATIONS.scene1}
      enterMode="portal-zoom-in"
      exitMode="whip-glide-left"
      background="rgba(12, 18, 29, 0.92)"
    >
      <CameraRig
        durationInFrames={EP1_DURATIONS.scene1}
        mode="push-in-settle"
        stylePreset={EP1_STYLE_PRESET}
        enableVelocityBlur={false}
        enableRackFocusSpotlight={false}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: '38px 40px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `1px solid ${isXRay ? EP1_COLORS.power : EP1_COLORS.data}33`,
            borderRadius: 24,
            background:
              'linear-gradient(160deg, rgba(18, 27, 43, 0.92) 0%, rgba(9, 13, 22, 0.96) 100%)',
          }}
        >
          {/* Baris Meta Atas */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 122, 47, 0.14)',
                  border: `1px solid ${EP1_COLORS.power}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CustomSVGIcon
                  name="cpu-node"
                  size={30}
                  color={EP1_COLORS.ink}
                  accentColor={EP1_COLORS.power}
                  startFrame={10}
                />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: EP1_FONTS.mono,
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    color: EP1_COLORS.data,
                  }}
                >
                  SERI WORKSTATION 4×4M • EPISODE 01
                </div>
                <div
                  style={{
                    fontFamily: EP1_FONTS.mono,
                    fontSize: 14,
                    color: EP1_COLORS.muted,
                    marginTop: 2,
                  }}
                >
                  TAHAP 01: PRE-BUILD INFRASTRUCTURE
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                backgroundColor: isXRay
                  ? 'rgba(255, 122, 47, 0.15)'
                  : 'rgba(0, 229, 255, 0.12)',
                border: `1px solid ${isXRay ? EP1_COLORS.power : EP1_COLORS.data}55`,
                fontFamily: EP1_FONTS.mono,
                fontSize: 14,
                fontWeight: 700,
                color: isXRay ? EP1_COLORS.power : EP1_COLORS.data,
              }}
            >
              {isXRay ? 'X-RAY AKTIF' : 'LAYOUT 4×4M'}
            </div>
          </div>

          {/* Judul Utama Episode */}
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <TypeText
              text={'MODAL WAJIB WORKSTATION:\nLISTRIK & MANAJEMEN KABEL'}
              start={75}
              cps={0.95}
              size={44}
              weight={800}
              family={EP1_FONTS.heading}
              color={EP1_COLORS.ink}
              newestColor="#FF7A2F"
              typingVariant="digital"
              enableTypingSfx={true}
              typingSfxVolume={0.34}
              style={{ lineHeight: 1.18, letterSpacing: -0.5 }}
            />
            <div
              style={{
                marginTop: 14,
                fontSize: 22,
                lineHeight: 1.4,
                color: EP1_COLORS.muted,
                opacity: interpolate(frame, [95, 118], [0, 1], clamp),
              }}
            >
              Rancang jalur daya, grounding, dan jalur data sebelum meja &amp; PC dirakit.
            </div>
          </div>

          {/* 4 Kartu Legenda Kode Warna Pipa/Kabel */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
            }}
          >
            {CONDUIT_LEGEND.map((item, idx) => {
              const cardSpring = spring({
                frame: frame - (78 + idx * 7),
                fps,
                config: { damping: 16, stiffness: 180 },
              });
              const ty = (1 - cardSpring) * 18;
              return (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(15, 22, 34, 0.9)',
                    border: `1px solid ${item.color}48`,
                    opacity: cardSpring,
                    transform: `translate3d(0, ${ty.toFixed(1)}px, 0)`,
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: item.color,
                      boxShadow: `0 0 12px ${item.color}88`,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: EP1_FONTS.mono,
                        fontSize: 15,
                        fontWeight: 700,
                        color: item.color,
                        letterSpacing: 0.6,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        color: EP1_COLORS.ink,
                        fontWeight: 500,
                        marginTop: 2,
                      }}
                    >
                      {item.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CameraRig>
    </SeamlessSceneShell>
  );

  return (
    <>
      <Audio src={staticFile('audio/vo/ep1-scene1.mp3')} volume={1.0} />

      <AudioStage
        musicSrc="audio/songs/B26-framer-linear-saas-groove.wav"
        words={SCENE1_WORDS}
        bedSrc=""
        sfxTrackSrc=""
        baseMusicVolume={0.14}
      />

      <SfxCue frame={45} sfx="transition-cinematic" volume={0.35} />
      <SfxCue frame={75} sfx="data-reveal" volume={0.35} />

      <HybridStageFrame
        stageBadge={isXRay ? 'MODE: DARK BLUEPRINT X-RAY' : 'MODE: LAYOUT RUANG 4×4M'}
        stageBadgeColor={isXRay ? EP1_COLORS.power : EP1_COLORS.data}
        stageRightTag="ISOMETRIC X-RAY STAGE"
        headerTag="EP 01 • SCENE 01"
        words={SCENE1_WORDS}
        topStage={
          <XRayRoom3D
            xrayProgress={xrayProgress}
            scanlineProgress={scanlineProgress}
            conduitGlow={conduitGlow}
            roomRotationY={roomRotationY}
            cameraZoom={cameraZoom}
          />
        }
        bottomStage={bottomStage}
      />
    </>
  );
};
