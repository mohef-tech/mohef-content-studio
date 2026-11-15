import React from 'react';
import {
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  AudioStage,
  CustomSVGIcon,
  FlyText,
  ExplodeToGrid,
  SeamlessSceneShell,
  SfxCue,
} from '../../lib/motion-craft';
import { projectToScreen } from '../02-promo-ruang3d/lib/iso';
import { HybridStageFrame } from './components/HybridStageFrame';
import { XRayRoom3D } from './components/XRayRoom3D';
import { EP1_COLORS, EP1_FONTS, EP1_LAYOUT, SCENE5_WORDS } from './constants';

type V3 = [number, number, number];

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const CalloutPill3D: React.FC<{
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  color: string;
  opacity: number;
  anchorDx?: number;
  anchorDy?: number;
}> = ({
  x,
  y,
  title,
  subtitle,
  color,
  opacity,
  anchorDx = 0,
  anchorDy = -40,
}) => {
  if (opacity <= 0.02) return null;

  const boxX = Math.max(155, Math.min(EP1_LAYOUT.contentWidth - 155, x + anchorDx));
  const boxY = Math.max(125, Math.min(EP1_LAYOUT.stageHeight - 80, y + anchorDy));
  const placeBelow = anchorDy > 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
      }}
    >
      <svg
        width={EP1_LAYOUT.contentWidth}
        height={EP1_LAYOUT.stageHeight}
        style={{ position: 'absolute', inset: 0 }}
      >
        <line
          x1={x}
          y1={y}
          x2={boxX}
          y2={boxY}
          stroke={color}
          strokeWidth={2.2}
          strokeDasharray="4 4"
        />
        <circle cx={x} cy={y} r={5.5} fill={color} />
        <circle
          cx={x}
          cy={y}
          r={11}
          fill="none"
          stroke={color}
          strokeWidth={1.6}
          opacity={0.55}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: boxX,
          top: boxY,
          transform: placeBelow ? 'translate(-50%, 0%)' : 'translate(-50%, -100%)',
          padding: '8px 14px',
          borderRadius: 10,
          backgroundColor: 'rgba(8, 13, 23, 0.92)',
          border: `1.5px solid ${color}`,
          boxShadow: `0 8px 22px rgba(0, 0, 0, 0.55), 0 0 18px ${color}33`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontFamily: EP1_FONTS.mono,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color,
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              fontFamily: EP1_FONTS.body,
              fontSize: 12,
              fontWeight: 600,
              color: EP1_COLORS.ink,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

const EmeraldCheckGlyph: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: EP1_COLORS.ground,
      boxShadow: `0 0 12px ${EP1_COLORS.ground}aa`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 16 16" fill="none">
      <path
        d="M3.2 8.4L6.5 11.6L12.8 4.6"
        stroke="#042F1E"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const CheckStatusBadge3D: React.FC<{
  x: number;
  y: number;
  label: string;
  progress: number;
  anchorDx?: number;
  anchorDy?: number;
}> = ({ x, y, label, progress, anchorDx = 0, anchorDy = -48 }) => {
  if (progress <= 0.02) return null;

  const boxX = Math.max(175, Math.min(EP1_LAYOUT.contentWidth - 175, x + anchorDx));
  const boxY = Math.max(138, Math.min(EP1_LAYOUT.stageHeight - 54, y + anchorDy));
  const scale = interpolate(progress, [0, 1], [0.76, 1], clamp);
  const opacity = interpolate(progress, [0, 0.55], [0, 1], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
      }}
    >
      <svg
        width={EP1_LAYOUT.contentWidth}
        height={EP1_LAYOUT.stageHeight}
        style={{ position: 'absolute', inset: 0 }}
      >
        <line
          x1={x}
          y1={y}
          x2={boxX}
          y2={boxY}
          stroke={EP1_COLORS.ground}
          strokeWidth={2}
          strokeDasharray="4 4"
        />
        <circle cx={x} cy={y} r={5.5} fill={EP1_COLORS.ground} />
        <circle
          cx={x}
          cy={y}
          r={11}
          fill="none"
          stroke={EP1_COLORS.ground}
          strokeWidth={1.6}
          opacity={0.55}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: boxX,
          top: boxY,
          transform: `translate(-50%, -100%) scale(${scale})`,
          padding: '8px 14px',
          borderRadius: 999,
          backgroundColor: 'rgba(6, 20, 18, 0.92)',
          border: `1.5px solid ${EP1_COLORS.ground}`,
          boxShadow: `0 10px 24px rgba(0, 0, 0, 0.52), 0 0 20px ${EP1_COLORS.ground}44`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          whiteSpace: 'nowrap',
        }}
      >
        <EmeraldCheckGlyph size={20} />
        <span
          style={{
            fontFamily: EP1_FONTS.mono,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.05em',
            color: '#ECFDF5',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

interface CablePointSpec {
  id: string;
  indexLabel: string;
  badge: string;
  title: string;
  detail: string;
  color: string;
  tintColor: string;
}

const CABLE_POINTS: CablePointSpec[] = [
  {
    id: 'cable-split',
    indexLabel: 'JALUR 01',
    badge: 'PISAH JALUR',
    title: 'Power vs Kabel Data',
    detail: 'Cegah layar monitor flicker akibat interferensi.',
    color: EP1_COLORS.power,
    tintColor: 'rgba(255, 122, 47, 0.14)',
  },
  {
    id: 'cable-tray',
    indexLabel: 'JALUR 02',
    badge: 'CABLE TRAY',
    title: 'Rak Kolong Meja',
    detail: 'Sembunyikan adaptor & stopkontak di bawah meja.',
    color: EP1_COLORS.data,
    tintColor: 'rgba(0, 229, 255, 0.14)',
  },
  {
    id: 'cable-velcro',
    indexLabel: 'JALUR 03',
    badge: 'VELCRO LOOP',
    title: 'Ikat Per Kelompok',
    detail: 'Mudah bongkar-pasang saat upgrade komponen.',
    color: EP1_COLORS.ground,
    tintColor: 'rgba(16, 185, 129, 0.14)',
  },
  {
    id: 'cable-slack',
    indexLabel: 'STANDAR PRO 04',
    badge: 'SLACK LOOP',
    title: 'Sisa Ruang Gerak',
    detail: 'Kabel aman tidak tertarik saat meja dinaik-turunkan.',
    color: '#F59E0B',
    tintColor: 'rgba(245, 158, 11, 0.14)',
  },
];

export const Scene5ManajemenKabel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fase 1 (Frame 0..150): Kamera fokus rapi ke Under-Desk Cable Tray (tanpa miring ekstrem)
  // Fase 2 (Frame 150..195): Kembali mulus ke sudut pandang isometrik utuh Ep1-Scene1 (4x4m Solid)
  const focusSpring = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 85 },
  });
  const returnPhase = interpolate(frame, [150, 195], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const finalDrift = interpolate(frame, [195, 330], [0, 1], clamp);

  const trayZoom = interpolate(focusSpring, [0, 1], [126, 146]);
  const cameraZoom =
    interpolate(returnPhase, [0, 1], [trayZoom, 112]) + finalDrift * 3;

  const trayRotY = interpolate(frame, [0, 150], [-0.25, -0.18], clamp);
  const roomRotationY =
    interpolate(returnPhase, [0, 1], [trayRotY, -0.24]) + finalDrift * 0.14;

  const trayOffsetX = interpolate(focusSpring, [0, 1], [0, -0.2]);
  const trayOffsetZ = interpolate(focusSpring, [0, 1], [0, 0.45]);
  const roomOffset: V3 = [
    interpolate(returnPhase, [0, 1], [trayOffsetX, 0]),
    -0.82,
    interpolate(returnPhase, [0, 1], [trayOffsetZ, 0]),
  ];

  // Transisi X-Ray -> Mode Solid Terang (Frame 154..190) disertai garis scanline
  const xrayProgress = interpolate(frame, [154, 190], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const scanlineProgress = interpolate(frame, [152, 190], [1, 0], clamp);

  // Sembunyikan seluruh pipa kabel X-Ray begitu kembali ke Ruangan Solid (selesai Frame 184)
  const xrayCablesFade = interpolate(frame, [156, 184], [1, 0], clamp);
  const cableTrayGlow =
    interpolate(frame, [10, 30], [0, 1], clamp) * xrayCablesFade;

  const trayCalloutsOpacity =
    interpolate(frame, [18, 34], [0, 1], clamp) *
    interpolate(frame, [144, 160], [1, 0], clamp);

  // Pop-in berurutan 3 Badge Centang Hijau Aman (Frame 194, 216, 240)
  const check1Spring = spring({
    frame: Math.max(0, frame - 194),
    fps,
    config: { damping: 14, stiffness: 170 },
  });
  const check2Spring = spring({
    frame: Math.max(0, frame - 216),
    fps,
    config: { damping: 14, stiffness: 170 },
  });
  const check3Spring = spring({
    frame: Math.max(0, frame - 240),
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  // Proyeksi label 3D panggung atas
  const t = { rotY: roomRotationY, offset: roomOffset };
  const powerLinePt = projectToScreen(
    [0.36, 0.7, -1.52],
    t,
    EP1_LAYOUT.contentWidth,
    EP1_LAYOUT.stageHeight,
    cameraZoom
  );
  const dataLinePt = projectToScreen(
    [0.12, 0.74, -1.4],
    t,
    EP1_LAYOUT.contentWidth,
    EP1_LAYOUT.stageHeight,
    cameraZoom
  );
  const trayPt = projectToScreen(
    [0.05, 0.58, -1.47],
    t,
    EP1_LAYOUT.contentWidth,
    EP1_LAYOUT.stageHeight,
    cameraZoom
  );
  const mcbSafePt = projectToScreen(
    [-1.18, 1.52, -1.82],
    t,
    EP1_LAYOUT.contentWidth,
    EP1_LAYOUT.stageHeight,
    cameraZoom
  );
  const deskSafePt = projectToScreen(
    [0.24, 0.9, -1.25],
    t,
    EP1_LAYOUT.contentWidth,
    EP1_LAYOUT.stageHeight,
    cameraZoom
  );

  // Pergeseran grid ke atas saat Closing Bridge CTA masuk (Frame 188..208)
  const ctaEntrance = spring({
    frame: Math.max(0, frame - 190),
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  const gridShiftY = interpolate(ctaEntrance, [0, 1], [34, 0]);

  const isSolidSafe = frame >= 190;
  const badgeTitle = isSolidSafe
    ? 'STATUS: INSTALASI KELISTRIKAN AMAN & RAPI'
    : 'UNDER-DESK CABLE TRAY • SEPARATED LINES';
  const badgeColor = isSolidSafe ? EP1_COLORS.ground : EP1_COLORS.data;
  const rightTag = isSolidSafe
    ? 'VERIFIED • 4×4M SOLID VIEW'
    : 'POIN 04 • CABLE TRAY';

  const explodeItems: React.ComponentProps<typeof ExplodeToGrid>['items'] = CABLE_POINTS.map((item) => ({
    id: item.id,
    indexLabel: item.indexLabel,
    title: '',
    accentColor: item.color,
    tintColor: item.tintColor,
    content: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: item.color,
              boxShadow: `0 0 10px ${item.color}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: EP1_FONTS.heading,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: '0.02em',
              color: item.color,
              lineHeight: 1.05,
            }}
          >
            {item.badge}
          </span>
        </div>

        <div
          style={{
            fontFamily: EP1_FONTS.heading,
            fontSize: 19,
            fontWeight: 800,
            color: EP1_COLORS.ink,
            lineHeight: 1.18,
          }}
        >
          {item.title}
        </div>

        <div
          style={{
            fontFamily: EP1_FONTS.body,
            fontSize: 14,
            fontWeight: 500,
            color: '#CBD5E1',
            lineHeight: 1.28,
          }}
        >
          {item.detail}
        </div>
      </div>
    ),
  }));

  const ctaDotPulse = 0.5 + 0.5 * Math.sin(frame * 0.25);

  return (
    <>
      <Audio src={staticFile('audio/vo/ep1-scene5.mp3')} volume={1.0} />

      <AudioStage
        musicSrc="audio/songs/B26-framer-linear-saas-groove.wav"
        words={SCENE5_WORDS}
        bedSrc=""
        sfxTrackSrc=""
        baseMusicVolume={0.14}
      />
      <SfxCue frame={16} sfx="transition-swoosh" volume={0.35} />
      <SfxCue frame={44} sfx="pop-drop" volume={0.35} />
      <Sequence from={80} durationInFrames={24}>
        <Audio src={staticFile('audio/sfx/u1.wav')} volume={0.35} />
      </Sequence>
      <Sequence from={110} durationInFrames={24}>
        <Audio src={staticFile('audio/sfx/u2.wav')} volume={0.35} />
      </Sequence>
      <SfxCue frame={195} sfx="confirm-chime" volume={0.38} />
      <SfxCue frame={290} sfx="impact-soft" volume={0.35} />

      <HybridStageFrame
        stageBadge={badgeTitle}
        stageBadgeColor={badgeColor}
        stageRightTag={rightTag}
        words={SCENE5_WORDS}
        topStage={
          <XRayRoom3D
            xrayProgress={xrayProgress}
            scanlineProgress={scanlineProgress}
            conduitGlow={0.85 * xrayCablesFade}
            powerGlow={0.85 * xrayCablesFade}
            groundGlow={0.9 * xrayCablesFade}
            dataGlow={0.9 * xrayCablesFade}
            acPowerGlow={0.35 * xrayCablesFade}
            lanGlow={0.52 * xrayCablesFade}
            tvConduitGlow={0.35 * xrayCablesFade}
            outlet1Glow={0.85 * xrayCablesFade}
            outlet2Glow={0.85 * xrayCablesFade}
            outlet3Glow={0.85 * xrayCablesFade}
            upsShieldGlow={0.85 * xrayCablesFade}
            upsOutputGlow={0.85 * xrayCablesFade}
            cableTrayGlow={cableTrayGlow}
            deskTeaserGlow={0}
            roomRotationY={roomRotationY}
            cameraZoom={cameraZoom}
            roomOffset={roomOffset}
            overlays={
              <>
                <CalloutPill3D
                  x={powerLinePt.x}
                  y={powerLinePt.y}
                  title="POWER LINE"
                  subtitle="Rel Belakang Terpisah"
                  color={EP1_COLORS.power}
                  opacity={trayCalloutsOpacity}
                  anchorDx={20}
                  anchorDy={-105}
                />
                <CalloutPill3D
                  x={dataLinePt.x}
                  y={dataLinePt.y}
                  title="DATA / DISPLAY LINE"
                  subtitle="Rel Depan Terpisah"
                  color={EP1_COLORS.data}
                  opacity={trayCalloutsOpacity}
                  anchorDx={-205}
                  anchorDy={-50}
                />
                <CalloutPill3D
                  x={trayPt.x}
                  y={trayPt.y}
                  title="UNDER-DESK TRAY"
                  subtitle="Adaptor & Slack Loop"
                  color={EP1_COLORS.ground}
                  opacity={trayCalloutsOpacity}
                  anchorDx={10}
                  anchorDy={85}
                />

                <CheckStatusBadge3D
                  x={mcbSafePt.x}
                  y={mcbSafePt.y}
                  label="JALUR MCB & ARDE AMAN"
                  progress={check1Spring}
                  anchorDx={55}
                  anchorDy={-52}
                />
                <CheckStatusBadge3D
                  x={deskSafePt.x}
                  y={deskSafePt.y}
                  label="UPS & KABEL RAPI TERSEMBUNYI"
                  progress={check2Spring}
                  anchorDx={-25}
                  anchorDy={-72}
                />

                {check3Spring > 0.02 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '64%',
                      transform: `translate(-50%, -50%) scale(${interpolate(
                        check3Spring,
                        [0, 1],
                        [0.84, 1],
                        clamp
                      )})`,
                      opacity: interpolate(check3Spring, [0, 0.5], [0, 1], clamp),
                      pointerEvents: 'none',
                      padding: '10px 18px',
                      borderRadius: 999,
                      backgroundColor: 'rgba(6, 22, 19, 0.94)',
                      border: `2px solid ${EP1_COLORS.ground}`,
                      boxShadow:
                        '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 26px rgba(16, 185, 129, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <EmeraldCheckGlyph size={22} />
                    <span
                      style={{
                        fontFamily: EP1_FONTS.mono,
                        fontSize: 15,
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        color: '#ECFDF5',
                      }}
                    >
                      INSTALASI KELISTRIKAN 100% AMAN — SIAP KE EPISODE 02
                    </span>
                  </div>
                )}
              </>
            }
          />
        }
        bottomStage={
          <SeamlessSceneShell
            startFrame={0}
            endFrame={330}
            enterMode="whip-glide-left"
            exitMode="none"
          >
            <style>{`
              .ep1-explode-tight > div > div > div > div {
                padding: 15px 18px !important;
                justify-content: flex-start !important;
                gap: 6px !important;
                border: 1.5px solid rgba(255, 255, 255, 0.2) !important;
              }
            `}</style>
            <div
              style={{
                width: '100%',
                height: '100%',
                padding: '16px 32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: 10,
                boxSizing: 'border-box',
              }}
            >
              {/* Header Panggung Bawah */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  paddingBottom: 8,
                  borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: 'rgba(0, 229, 255, 0.14)',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CustomSVGIcon
                    name="layers-stack"
                    size={44}
                    color="#FFFFFF"
                    accentColor="#00E5FF"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span
                    style={{
                      fontFamily: EP1_FONTS.mono,
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: EP1_COLORS.data,
                    }}
                  >
                    POIN 04 • ARSITEKTUR MANAJEMEN KABEL
                  </span>
                  <span
                    style={{
                      fontFamily: EP1_FONTS.heading,
                      fontSize: 25,
                      fontWeight: 800,
                      color: EP1_COLORS.ink,
                      lineHeight: 1.15,
                    }}
                  >
                    Pisahkan Power &amp; Data di Cable Tray Bawah Meja
                  </span>
                </div>
              </div>

              {/* Grid 2x2 ExplodeToGrid */}
              <div
                className="ep1-explode-tight"
                style={{
                  transform: `translateY(${gridShiftY}px)`,
                  display: 'flex',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ExplodeToGrid
                  items={explodeItems}
                  explodeFrame={16}
                  settleFrame={44}
                  columns={2}
                  cardWidth={438}
                  cardHeight={184}
                  gapPx={14}
                  enableSfx={false}
                />
              </div>

              {/* Closing Bridge & CTA Episode 2 (Frame 195..330) */}
              <div
                style={{
                  opacity: ctaEntrance,
                  transform: `translateY(${interpolate(ctaEntrance, [0, 1], [24, 0])}px)`,
                  padding: '12px 18px',
                  borderRadius: 16,
                  background:
                    'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(0, 229, 255, 0.12) 100%)',
                  border: '1.5px solid rgba(0, 229, 255, 0.45)',
                  boxShadow: '0 8px 26px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: EP1_FONTS.mono,
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: '#070B12',
                      backgroundColor: '#00E5FF',
                      padding: '4px 10px',
                      borderRadius: 999,
                      flexShrink: 0,
                    }}
                  >
                    EP.02 TEASER
                  </span>
                  <FlyText
                    text="NEXT EPISODE 02: KONSTRUKSI & ERGONOMI MEJA KERJA"
                    start={195}
                    stagger={0.6}
                    dur={14}
                    size={19}
                    color="#F8FAFC"
                    flyingColor="#00E5FF"
                    weight={800}
                    family={EP1_FONTS.heading}
                    letterSpacing={0.4}
                    yOffset={18}
                    rotateSpread={0}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      backgroundColor: EP1_COLORS.ground,
                      boxShadow: `0 0 ${8 + ctaDotPulse * 8}px ${EP1_COLORS.ground}`,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: EP1_FONTS.body,
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#E2E8F0',
                    }}
                  >
                    Mau konsultasi setup workstation &amp; IT? Ngobrol bareng{' '}
                    <span style={{ color: EP1_COLORS.ground, fontWeight: 800 }}>
                      Mohammed | Mohef Tech
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </SeamlessSceneShell>
        }
      />
    </>
  );
};
