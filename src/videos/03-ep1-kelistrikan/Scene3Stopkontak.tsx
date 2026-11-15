import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import {
  AnimatedCursor,
  AudioStage,
  BentoCellItem,
  BentoGridReveal,
  CustomSVGIcon,
  SeamlessSceneShell,
  SfxCue,
} from '../../lib/motion-craft';
import {
  EP1_COLORS,
  EP1_DURATIONS,
  EP1_FONTS,
  EP1_LAYOUT,
  SCENE3_WORDS,
} from './constants';
import { HybridStageFrame } from './components/HybridStageFrame';
import { XRayRoom3D } from './components/XRayRoom3D';
import { projectToScreen, V3 } from '../02-promo-ruang3d/lib/iso';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const BENTO_ITEMS: BentoCellItem[] = [
  {
    id: 'zona-bawah-30cm',
    colSpan: 1,
    rowSpan: 1,
    revealWave: 1,
    indexLabel: 'ZONA BAWAH',
    metric: '30 CM',
    title: 'Titik Utama UPS & PC',
    subtitle: 'Di bawah meja untuk sumber daya utama.',
    surfaceColor: '#0F1F4D',
    textColor: '#FFFFFF',
    accentColor: '#FF7A2F',
  },
  {
    id: 'zona-atas-85cm',
    colSpan: 1,
    rowSpan: 1,
    revealWave: 2,
    indexLabel: 'ZONA ATAS MEJA',
    metric: '85 CM',
    title: 'Titik Akses Cepat',
    subtitle: 'Sejajar meja untuk charger laptop & gadget.',
    surfaceColor: '#0F1F4D',
    textColor: '#FFFFFF',
    accentColor: '#00E5FF',
  },
  {
    id: 'zona-kluster-meja',
    colSpan: 2,
    rowSpan: 1,
    revealWave: 3,
    indexLabel: 'STANDAR PRO 02',
    metric: 'BEBAS KABEL LANTAI',
    title: 'Tepat di Belakang Zona Meja Kerja',
    subtitle: 'Kabel langsung naik ke kaki meja tanpa melintang di jalur jalan.',
    surfaceColor: '#0B2420',
    textColor: '#FFFFFF',
    accentColor: '#10B981',
  },
];

export const Scene3Stopkontak: React.FC = () => {
  const frame = useCurrentFrame();

  // 3 titik stopkontak menyala berurutan sesuai gelombang Bento Grid
  const outlet1Glow = interpolate(frame, [14, 30], [0.18, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const outlet2Glow = interpolate(frame, [38, 55], [0.15, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const outlet3Glow = interpolate(frame, [62, 85], [0.1, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const heightGuidesGlow = interpolate(frame, [18, 42], [0, 1], clamp);

  // Kamera 3D fokus ke dinding belakang meja kerja
  const cameraZoom = interpolate(frame, [0, 45, 270], [134, 156, 148], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const roomRotationY = interpolate(frame, [0, EP1_DURATIONS.scene3], [-0.14, -0.04], clamp);
  const offsetX = interpolate(frame, [0, 45, 270], [0.02, -0.08, -0.04], clamp);
  const offsetY = interpolate(frame, [0, 45, 270], [-0.82, -0.84, -0.82], clamp);
  const offsetZ = interpolate(frame, [0, 45, 270], [0.32, 0.58, 0.52], clamp);

  const transformForFrame = (f: number) => {
    const z = interpolate(f, [0, 45, 270], [134, 156, 148], {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    });
    const r = interpolate(f, [0, EP1_DURATIONS.scene3], [-0.14, -0.04], clamp);
    const ox = interpolate(f, [0, 45, 270], [0.02, -0.08, -0.04], clamp);
    const oy = interpolate(f, [0, 45, 270], [-0.82, -0.84, -0.82], clamp);
    const oz = interpolate(f, [0, 45, 270], [0.32, 0.58, 0.52], clamp);
    return { z, t: { rotY: r, x: ox, y: oy, z: oz } };
  };

  const proj3D = (p: V3, f = frame) => {
    const { z, t } = transformForFrame(f);
    return projectToScreen(p, t, EP1_LAYOUT.contentWidth, EP1_LAYOUT.stageHeight, z);
  };

  // Titik proyeksi untuk label ukur 3D di atas panggung
  const label30 = proj3D([-0.55, 0.34, -1.72]);
  const label85 = proj3D([0.52, 0.96, -1.72]);
  const labelCluster = proj3D([0.74, 0.4, -1.68]);

  // Target kursor tepat di titik stopkontak pada frame klik (30, 55, 85)
  const click1Screen = proj3D([-0.25, 0.42, -1.78], 30);
  const click2Screen = proj3D([0.25, 0.96, -1.78], 55);
  const click3Screen = proj3D([0.68, 0.36, -1.78], 85);

  const cursorWaypoints: [number, number, number][] = [
    [10, EP1_LAYOUT.safeX + 220, EP1_LAYOUT.stageTop + 620],
    [30, EP1_LAYOUT.safeX + click1Screen.x, EP1_LAYOUT.stageTop + click1Screen.y],
    [55, EP1_LAYOUT.safeX + click2Screen.x, EP1_LAYOUT.stageTop + click2Screen.y],
    [85, EP1_LAYOUT.safeX + click3Screen.x, EP1_LAYOUT.stageTop + click3Screen.y],
    [108, 540, 1480],
  ];

  const cursorClicks = [
    { frame: 30, label: '30 CM' },
    { frame: 55, label: '85 CM' },
    { frame: 85, label: 'KLUSTER' },
  ];

  const overlays = (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 13 }}>
      <div
        style={{
          position: 'absolute',
          left: label30.x - 16,
          top: label30.y,
          transform: 'translate(-100%, -50%)',
          opacity: outlet1Glow,
          padding: '5px 12px',
          borderRadius: 8,
          backgroundColor: 'rgba(7, 11, 18, 0.86)',
          border: `1.5px solid ${EP1_COLORS.power}`,
          color: EP1_COLORS.power,
          fontFamily: EP1_FONTS.mono,
          fontSize: 16,
          fontWeight: 800,
          whiteSpace: 'nowrap',
        }}
      >
        30 CM • UPS/PC
      </div>

      <div
        style={{
          position: 'absolute',
          left: label85.x + 14,
          top: label85.y,
          transform: 'translate(0, -50%)',
          opacity: outlet2Glow,
          padding: '5px 12px',
          borderRadius: 8,
          backgroundColor: 'rgba(7, 11, 18, 0.86)',
          border: `1.5px solid ${EP1_COLORS.data}`,
          color: EP1_COLORS.data,
          fontFamily: EP1_FONTS.mono,
          fontSize: 16,
          fontWeight: 800,
          whiteSpace: 'nowrap',
        }}
      >
        85 CM • MEJA
      </div>

      <div
        style={{
          position: 'absolute',
          left: labelCluster.x + 16,
          top: labelCluster.y + 6,
          transform: 'translate(0, -50%)',
          opacity: outlet3Glow,
          padding: '5px 12px',
          borderRadius: 8,
          backgroundColor: 'rgba(7, 11, 18, 0.86)',
          border: `1.5px solid ${EP1_COLORS.ground}`,
          color: EP1_COLORS.ground,
          fontFamily: EP1_FONTS.mono,
          fontSize: 15,
          fontWeight: 800,
          whiteSpace: 'nowrap',
        }}
      >
        KLUSTER KAKI MEJA
      </div>
    </div>
  );

  const stageBadge =
    frame >= 62
      ? '3 TITIK ZONA STOPKONTAK TERKUNCI'
      : frame >= 38
      ? 'ZONA ATAS MEJA: 85 CM'
      : 'ZONA BAWAH MEJA: 30 CM';

  const stageBadgeColor =
    frame >= 62 ? EP1_COLORS.ground : frame >= 38 ? EP1_COLORS.data : EP1_COLORS.power;

  const bottomStage = (
    <SeamlessSceneShell
      startFrame={0}
      endFrame={EP1_DURATIONS.scene3}
      enterMode="whip-glide-left"
      exitMode="whip-glide-left"
      background="rgba(12, 18, 29, 0.92)"
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '18px 32px 18px',
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
            border: `1px solid ${EP1_COLORS.data}44`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <CustomSVGIcon
              name="target-crosshair"
              size={48}
              color="#FFFFFF"
              accentColor="#00E5FF"
              startFrame={4}
            />
            <div>
              <div
                style={{
                  fontFamily: EP1_FONTS.mono,
                  fontSize: 14,
                  fontWeight: 700,
                  color: EP1_COLORS.data,
                  letterSpacing: 0.8,
                }}
              >
                POIN 02 • PENEMPATAN PRESISI
              </div>
              <div
                style={{
                  fontFamily: EP1_FONTS.heading,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                Zona Titik Stopkontak Meja Kerja
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
            3 TITIK AKTIF
          </div>
        </div>

        {/* Bento Grid Reveal */}
        <div
          className="ep1-bento-tight"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
          }}
        >
          <style>{`
            .ep1-bento-tight > div > div > div {
              justify-content: flex-start !important;
              gap: 10px !important;
              padding: 20px 24px !important;
            }
            .ep1-bento-tight > div > div > div > div:last-child {
              gap: 6px !important;
            }
            .ep1-bento-tight > div > div > div > div:last-child > div:last-child {
              opacity: 0.86 !important;
              font-size: 16.5px !important;
              line-height: 1.32 !important;
            }
          `}</style>
          <BentoGridReveal
            items={BENTO_ITEMS}
            startFrame={14}
            waveGapFrames={22}
            columns={2}
            stageWidth={896}
            stageHeight={470}
            gapPx={16}
            enableSfx={false}
          />
        </div>
      </div>
    </SeamlessSceneShell>
  );

  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio/vo/ep1-scene3.mp3')} volume={1.0} />

      <AudioStage
        musicSrc="audio/songs/B26-framer-linear-saas-groove.wav"
        words={SCENE3_WORDS}
        bedSrc=""
        sfxTrackSrc=""
        baseMusicVolume={0.14}
      />

      <SfxCue frame={18} sfx="pop-in" volume={0.35} />
      <SfxCue frame={40} sfx="tick-soft" volume={0.35} />
      <SfxCue frame={62} sfx="tick-soft" volume={0.35} />
      <SfxCue frame={95} sfx="confirm-chime" volume={0.38} />

      <HybridStageFrame
        stageBadge={stageBadge}
        stageBadgeColor={stageBadgeColor}
        stageRightTag="POIN 02 • ZONA STOPKONTAK"
        headerTag="EP 01 • SCENE 03"
        words={SCENE3_WORDS}
        topStage={
          <XRayRoom3D
            xrayProgress={1}
            powerGlow={0.85}
            groundGlow={0.45}
            dataGlow={0.65}
            acPowerGlow={0.35}
            lanGlow={0.62}
            tvConduitGlow={0.38}
            outlet1Glow={outlet1Glow}
            outlet2Glow={outlet2Glow}
            outlet3Glow={outlet3Glow}
            heightGuidesGlow={heightGuidesGlow}
            overlays={overlays}
            roomRotationY={roomRotationY}
            cameraZoom={cameraZoom}
            roomOffset={[offsetX, offsetY, offsetZ]}
          />
        }
        bottomStage={bottomStage}
      />

      {/* Kursor Interaktif Mengklik 3 Titik Stopkontak */}
      <AnimatedCursor
        waypoints={cursorWaypoints}
        clicks={cursorClicks}
        accentColor={EP1_COLORS.data}
        enableClickSfx={true}
      />
    </AbsoluteFill>
  );
};
