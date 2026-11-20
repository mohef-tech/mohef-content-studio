import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { BottomSubtitleBar, CustomSVGIcon, SfxCue } from '../../lib/motion-craft';
import {
  EP3_BGM,
  EP3_COLORS,
  EP3_FONTS,
  EP3_HEIGHT,
  EP3_SAFE,
  EP3_STYLE_PRESET,
  EP3_WIDTH,
  SCENE5_BEATS,
  SCENE5_DURATION_FRAMES,
  SCENE5_WORDS,
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
  checklistIn,
  item1In,
  item2In,
  item3In,
  packingIn,
  checklistOut,
  ctaIn,
} = SCENE5_BEATS;

// ============================================================================
// Data Checklist Trilogi Episode 1-3
// ============================================================================
interface TrilogyCheckItem {
  episode: string;
  label: string;
  inFrame: number;
}

const TRILOGY_CHECKLIST: readonly TrilogyCheckItem[] = [
  {
    episode: 'EP 01',
    label: 'Kelistrikan Aman & Bebas Korslet',
    inFrame: item1In,
  },
  {
    episode: 'EP 02',
    label: 'Rakit Presisi Part Original Resmi & Lolos QC',
    inFrame: item2In,
  },
  {
    episode: 'EP 03',
    label: 'OS Bersih, Driver Resmi & Aplikasi Siap Kerja',
    inFrame: item3In,
  },
];

// ============================================================================
// Layar Monitor 3D: Desktop Wallpaper Mohef Tech + Taskbar Tipis (1 CanvasTexture)
// ============================================================================
const SCREEN_W = 1340;
const SCREEN_H = 720;
const WALLPAPER_PATH = 'images/monitor-wallpaper.png';

interface DesktopScreenCache {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  loaded: boolean;
}

let desktopScreenCache: DesktopScreenCache | null = null;

const drawThinTaskbar = (ctx: CanvasRenderingContext2D) => {
  const barH = 52;
  const barY = SCREEN_H - barH;

  // Bar taskbar tipis di tepi bawah agar desain wallpaper utama tetap utuh
  ctx.fillStyle = 'rgba(8, 13, 22, 0.88)';
  ctx.fillRect(0, barY, SCREEN_W, barH);
  ctx.fillStyle = 'rgba(226, 232, 240, 0.22)';
  ctx.fillRect(0, barY, SCREEN_W, 2);

  // Ikon Start + 3 ikon aplikasi pinned di tengah
  const centerX = SCREEN_W / 2;
  const startX = centerX - 78;
  ctx.fillStyle = EP3_COLORS.data;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      ctx.fillRect(startX + c * 11, barY + 15 + r * 11, 9, 9);
    }
  }

  const pinnedColors = [EP3_COLORS.ground, '#60A5FA', EP3_COLORS.power];
  pinnedColors.forEach((color, idx) => {
    const px = centerX - 30 + idx * 40;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.92)';
    ctx.beginPath();
    ctx.roundRect(px, barY + 11, 28, 28, 6);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillRect(px + 8, barY + 42, 12, 3);
  });

  // System tray kanan
  ctx.fillStyle = EP3_COLORS.ground;
  ctx.beginPath();
  ctx.arc(SCREEN_W - 252, barY + 27, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'bold 20px Menlo, Consolas, monospace';
  ctx.textAlign = 'right';
  ctx.fillText('SIAP PAKAI • 14:10', SCREEN_W - 28, barY + 34, 210);
  ctx.textAlign = 'left';
};

const getDesktopScreenCache = (): DesktopScreenCache => {
  if (desktopScreenCache) return desktopScreenCache;

  const canvas = document.createElement('canvas');
  canvas.width = SCREEN_W;
  canvas.height = SCREEN_H;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  // Dasar gelap sementara sebelum img.onload selesai menggambar wallpaper
  ctx.fillStyle = EP3_COLORS.bg;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  desktopScreenCache = { canvas, ctx, texture, loaded: false };
  return desktopScreenCache;
};

const WallpaperDesktopScreen: React.FC = () => {
  const screen = useMemo(getDesktopScreenCache, []);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (screen.loaded) return;

    const handle = delayRender('load-ep3-scene5-wallpaper');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      screen.ctx.drawImage(img, 0, 0, SCREEN_W, SCREEN_H);
      drawThinTaskbar(screen.ctx);
      screen.texture.colorSpace = THREE.SRGBColorSpace;
      screen.texture.needsUpdate = true;
      screen.loaded = true;
      invalidate();
      continueRender(handle);
    };

    img.onerror = () => {
      cancelRender(new Error(`Gagal memuat wallpaper monitor: ${WALLPAPER_PATH}`));
    };

    img.src = staticFile(WALLPAPER_PATH);
  }, [invalidate, screen]);

  const [sx, sy, sz] = MONITOR_SCREEN.position;

  return (
    <mesh position={[sx, sy, sz]}>
      <planeGeometry args={[MONITOR_SCREEN.width, MONITOR_SCREEN.height]} />
      <meshStandardMaterial
        color="#ffffff"
        map={screen.texture}
        emissive="#ffffff"
        emissiveMap={screen.texture}
        emissiveIntensity={0.9}
        roughness={0.22}
        metalness={0.04}
      />
    </mesh>
  );
};

// ============================================================================
// Kamera 3D: Smooth Pull-Back & Subtle Orbit ke Hero Shot Lega
// ============================================================================
const CAM_KEYS: CamKeyframe[] = [
  // Menyambung mulus dari pose akhir Scene 4
  { frame: 0, dist: 20.4, az: 2.2, el: 9.5, fov: 38, focusY: 1185, target: [-2.9, 10.14, -2.4] },
  // Pull-back halus menampakkan monitor desktop wallpaper + PC + meja + stopkontak Ep 1
  { frame: 110, dist: 24.4, az: 11.5, el: 13.5, fov: 38, focusY: 1280, target: [-1.2, 9.55, -1.05] },
  // Orbit lembut menuju hero shot penutup selama CTA
  { frame: ctaIn, dist: 25.8, az: 17.0, el: 15.0, fov: 38, focusY: 1300, target: [-0.95, 9.45, -0.9] },
  {
    frame: SCENE5_DURATION_FRAMES,
    dist: 26.8,
    az: 21.5,
    el: 16.0,
    fov: 38,
    focusY: 1315,
    target: [-0.85, 9.4, -0.85],
  },
];

// ============================================================================
// Ikon Inline Relevan (Crate Packing Kayu & WhatsApp Chat)
// ============================================================================
const PackingCrateIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2.5" stroke={color} strokeWidth="2.1" />
    <path d="M3 8.5H21M3 15.5H21" stroke={color} strokeWidth="1.8" />
    <path d="M8.5 8.5L15.5 15.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const WhatsAppPhoneIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 3a9 9 0 0 0-7.77 13.54L3 21l4.6-1.2A9 9 0 1 0 12 3Z"
      stroke={color}
      strokeWidth="2.1"
      strokeLinejoin="round"
    />
    <path
      d="M9.4 9.2c.25-.4.62-.42.9-.1l.9 1.05c.2.24.22.58.04.84l-.45.65c.54.9 1.28 1.64 2.18 2.18l.65-.45c.26-.18.6-.16.84.04l1.05.9c.32.28.3.65-.1.9-.75.46-1.7.54-2.64.15a9.2 9.2 0 0 1-3.52-3.52c-.39-.94-.31-1.89.15-2.64Z"
      fill={color}
    />
  </svg>
);

// ============================================================================
// Scene 5: Final Checklist Trilogi, Packing Kayu & Kartu Penawaran CTA
// ============================================================================
export const Scene5ClosingCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = (start: number, damping = 18) =>
    spring({ frame: frame - start, fps, config: { damping, stiffness: 180, mass: 0.75 } });

  const badgeT = enter(badgeIn);
  const line1T = enter(titleIn, 16);
  const line2T = enter(titleIn + 6, 16);

  // Paruh Awal: Kartu Final Checklist Trilogi & Packing Kayu
  const checklistEnterT = enter(checklistIn, 17);
  const checklistExitT = interpolate(frame, [checklistOut, checklistOut + 15], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const checklistOpacity = checklistEnterT * (1 - checklistExitT);
  const checklistTranslateX = -checklistExitT * 960;
  const checklistTranslateY = (1 - checklistEnterT) * 26;
  const packingT = enter(packingIn, 16);

  // Paruh Kedua: Kartu Penawaran & Kontak CTA Utama
  const ctaEnterT = spring({
    frame: frame - ctaIn,
    fps,
    config: { damping: 16, stiffness: 170, mass: 0.8 },
  });
  const ctaTranslateX = (1 - ctaEnterT) * 140;
  const ctaTranslateY = (1 - ctaEnterT) * 20;
  const ctaScale = 0.95 + ctaEnterT * 0.05;

  // Sorotan fokus satu kali saat kartu CTA mendarat (tanpa loop berkedip terus-menerus)
  const ctaArrivalFlash = interpolate(frame, [ctaIn, ctaIn + 6, ctaIn + 26], [0, 1, 0], clamp);

  const pose = useMemo(() => resolveCameraPose(CAM_KEYS, frame), [frame]);
  const bgmVolume = (f: number) =>
    interpolate(f, [0, 15, durationInFrames - 40, durationInFrames], [0, 0.045, 0.045, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: EP3_COLORS.bg, fontFamily: EP3_FONTS.body }}>
      <Audio src={staticFile('audio/vo/ep3-scene5.mp3')} volume={1.0} />
      <Audio src={staticFile(EP3_BGM)} loop volume={bgmVolume} />

      {/* SFX dari KATALOG-AI.md */}
      <SfxCue frame={badgeIn} sfx="click-soft" volume={0.38} />
      <SfxCue frame={item1In} sfx="click-soft" volume={0.44} />
      <SfxCue frame={item2In} sfx="click-soft" volume={0.44} />
      <SfxCue frame={item3In} sfx="click-soft" volume={0.48} />
      <SfxCue frame={packingIn} sfx="transition-whoosh-soft" volume={0.5} />
      <SfxCue frame={checklistOut} sfx="transition-whoosh-soft" volume={0.42} />
      <SfxCue frame={ctaIn} sfx="confirm-chime" volume={0.62} />

      {/* Panggung 3D Penutup: Workstation menyala stabil & monitor desktop wallpaper */}
      <AbsoluteFill>
        <WorkstationStage
          frame={frame}
          pose={pose}
          width={EP3_WIDTH}
          height={EP3_HEIGHT}
          screenGlowColor="#38BDF8"
          screenGlowIntensity={1.55}
        >
          <WallpaperDesktopScreen />
        </WorkstationStage>
      </AbsoluteFill>

      {/* Gradien kontras untuk HUD atas & area subtitle bawah (tengah tetap jernih ke 3D) */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(7, 11, 18, 0.94) 0%, rgba(7, 11, 18, 0.78) 26%, rgba(7, 11, 18, 0.04) 48%, rgba(7, 11, 18, 0.02) 72%, rgba(7, 11, 18, 0.78) 84%, rgba(7, 11, 18, 0.92) 100%)',
        }}
      />

      {/* Header brand konsisten Episode 3 (X: 90..960, Y: 56..114) */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: EP3_SAFE.left,
          width: EP3_SAFE.contentWidth,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            borderRadius: 12,
            backgroundColor: 'rgba(15, 22, 34, 0.92)',
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

        <div
          style={{
            padding: '10px 15px',
            borderRadius: 12,
            backgroundColor: 'rgba(15, 22, 34, 0.92)',
            border: `1px solid ${EP3_COLORS.ground}66`,
            fontFamily: EP3_FONTS.mono,
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: 0.6,
            color: EP3_COLORS.ground,
            whiteSpace: 'nowrap',
          }}
        >
          EP 03 • FINAL
        </div>
      </div>

      {/* Badge status penutup */}
      <div
        style={{
          position: 'absolute',
          top: 136,
          left: EP3_SAFE.left,
          padding: '10px 18px',
          borderRadius: 10,
          backgroundColor: 'rgba(16, 185, 129, 0.14)',
          border: `2px solid ${EP3_COLORS.ground}`,
          fontFamily: EP3_FONTS.mono,
          fontSize: 22,
          fontWeight: 900,
          letterSpacing: 0.7,
          lineHeight: 1.2,
          color: '#6EE7B7',
          whiteSpace: 'nowrap',
          opacity: badgeT,
          transform: `translate3d(${((1 - badgeT) * -24).toFixed(1)}px, 0, 0)`,
        }}
      >
        FINAL CHECKLIST • SIAP KIRIM
      </div>

      {/* Judul besar dua baris (pas di lebar aman 870px) */}
      <div
        style={{
          position: 'absolute',
          top: 204,
          left: EP3_SAFE.left,
          width: EP3_SAFE.contentWidth,
          fontFamily: EP3_FONTS.heading,
          fontSize: 68,
          fontWeight: 900,
          lineHeight: 1.06,
          letterSpacing: -1.4,
          textShadow: '0 4px 24px rgba(0, 0, 0, 0.65)',
        }}
      >
        {[
          { text: 'TERVERIFIKASI 100%', color: '#FFFFFF', t: line1T },
          { text: 'SIAP PAKAI', color: '#34D399', t: line2T },
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

      {/* Paruh Awal: Kartu Final Checklist Trilogi (Ep 1-3) & Packing Kayu */}
      {checklistOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 374,
            left: EP3_SAFE.left,
            width: EP3_SAFE.contentWidth,
            height: 'auto',
            boxSizing: 'border-box',
            padding: '20px 24px 22px',
            borderRadius: 20,
            backgroundColor: 'rgba(11, 16, 26, 0.95)',
            border: `1.5px solid ${EP3_COLORS.ground}88`,
            boxShadow: '0 22px 52px rgba(0, 0, 0, 0.56)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            opacity: checklistOpacity,
            transform: `translate3d(${checklistTranslateX.toFixed(1)}px, ${checklistTranslateY.toFixed(1)}px, 0)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              paddingBottom: 2,
            }}
          >
            <span
              style={{
                fontFamily: EP3_FONTS.mono,
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 0.6,
                color: EP3_COLORS.muted,
              }}
            >
              CHECKLIST TRILOGI WORKSTATION
            </span>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                backgroundColor: 'rgba(16, 185, 129, 0.18)',
                border: `1px solid ${EP3_COLORS.ground}`,
                fontFamily: EP3_FONTS.mono,
                fontSize: 15,
                fontWeight: 900,
                color: '#6EE7B7',
                whiteSpace: 'nowrap',
              }}
            >
              3 / 3 LOLOS QC
            </span>
          </div>

          {TRILOGY_CHECKLIST.map(({ episode, label, inFrame }) => {
            const itemT = enter(inFrame, 17);
            return (
              <div
                key={episode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                  height: 'auto',
                  boxSizing: 'border-box',
                  padding: '13px 16px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.36)',
                  opacity: itemT,
                  transform: `translate3d(${((1 - itemT) * 20).toFixed(1)}px, 0, 0)`,
                }}
              >
                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                    fontFamily: EP3_FONTS.body,
                    fontSize: 21,
                    fontWeight: 700,
                    lineHeight: 1.32,
                    color: '#F8FAFC',
                  }}
                >
                  <span
                    style={{
                      fontFamily: EP3_FONTS.mono,
                      fontWeight: 900,
                      color: EP3_COLORS.data,
                    }}
                  >
                    {episode}
                  </span>
                  <span style={{ color: EP3_COLORS.muted }}>{' • '}</span>
                  {label}
                </div>

                <div
                  aria-hidden="true"
                  style={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: 8,
                    backgroundColor: EP3_COLORS.ground,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: EP3_FONTS.mono,
                    fontSize: 19,
                    fontWeight: 900,
                    color: '#03140D',
                    lineHeight: 1,
                  }}
                >
                  ✓
                </div>
              </div>
            );
          })}

          {/* Sorotan Jaminan Pengiriman Packing Kayu */}
          <div
            style={{
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              height: 'auto',
              boxSizing: 'border-box',
              padding: '14px 18px',
              borderRadius: 14,
              backgroundColor: 'rgba(255, 122, 47, 0.16)',
              border: `1.5px solid ${EP3_COLORS.power}`,
              opacity: packingT,
              transform: `translate3d(0, ${((1 - packingT) * 14).toFixed(1)}px, 0)`,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: 10,
                backgroundColor: 'rgba(255, 122, 47, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PackingCrateIcon color="#FDBA74" />
            </div>
            <div
              style={{
                minWidth: 0,
                flex: 1,
                fontFamily: EP3_FONTS.heading,
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: 0.2,
                lineHeight: 1.3,
                color: '#FFF7ED',
              }}
            >
              SIAP KIRIM PACKING KAYU AMAN KE SELURUH INDONESIA
            </div>
          </div>
        </div>
      )}

      {/* Paruh Kedua: Kartu Penawaran & Kontak CTA Utama */}
      {ctaEnterT > 0.01 && (
        <div
          style={{
            position: 'absolute',
            top: 374,
            left: EP3_SAFE.left,
            width: EP3_SAFE.contentWidth,
            height: 'auto',
            boxSizing: 'border-box',
            padding: '22px 26px 24px',
            borderRadius: 22,
            backgroundColor: 'rgba(10, 17, 29, 0.96)',
            border: `2px solid ${EP3_COLORS.ground}`,
            boxShadow: `0 26px 60px rgba(0, 0, 0, 0.62), 0 0 ${(26 + 24 * ctaArrivalFlash).toFixed(0)}px rgba(16, 185, 129, ${(0.18 + 0.28 * ctaArrivalFlash).toFixed(3)})`,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            opacity: ctaEnterT,
            transform: `translate3d(${ctaTranslateX.toFixed(1)}px, ${ctaTranslateY.toFixed(1)}px, 0) scale(${ctaScale.toFixed(3)})`,
          }}
        >
          {/* Brand Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <CustomSVGIcon
                name="check-badge"
                size={36}
                color={EP3_COLORS.ink}
                accentColor={EP3_COLORS.ground}
                startFrame={ctaIn}
              />
              <div
                style={{
                  fontFamily: EP3_FONTS.heading,
                  fontSize: 33,
                  fontWeight: 900,
                  letterSpacing: -0.4,
                  lineHeight: 1.15,
                  color: '#FFFFFF',
                }}
              >
                Mohammed <span style={{ color: EP3_COLORS.muted }}>|</span>{' '}
                <span style={{ color: EP3_COLORS.power }}>Mohef Tech</span>
              </div>
            </div>

            <span
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                backgroundColor: 'rgba(255, 122, 47, 0.16)',
                border: `1.5px solid ${EP3_COLORS.power}`,
                fontFamily: EP3_FONTS.mono,
                fontSize: 13.5,
                fontWeight: 800,
                color: '#FDBA74',
                whiteSpace: 'nowrap',
              }}
            >
              PC WORKSTATION CUSTOM
            </span>
          </div>

          {/* WhatsApp Badge Menonjol Kontras Tinggi */}
          <div
            style={{
              padding: '18px 22px',
              borderRadius: 16,
              height: 'auto',
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              border: `3px solid ${EP3_COLORS.ground}`,
              boxShadow: '0 14px 32px rgba(16, 185, 129, 0.24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <span
                style={{
                  fontFamily: EP3_FONTS.mono,
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  color: '#047857',
                }}
              >
                WHATSAPP • KONSULTASI &amp; PEMESANAN
              </span>
              <span
                style={{
                  fontFamily: EP3_FONTS.heading,
                  fontSize: 54,
                  fontWeight: 900,
                  letterSpacing: 1.3,
                  lineHeight: 1.04,
                  fontVariantNumeric: 'tabular-nums',
                  color: '#070B12',
                }}
              >
                082336744354
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '13px 18px',
                borderRadius: 12,
                backgroundColor: '#047857',
                color: '#FFFFFF',
                fontFamily: EP3_FONTS.heading,
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: 0.3,
                whiteSpace: 'nowrap',
              }}
            >
              <WhatsAppPhoneIcon color="#FFFFFF" />
              <span>CHAT WHATSAPP</span>
            </div>
          </div>

          {/* Layanan & Jaminan */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              height: 'auto',
              boxSizing: 'border-box',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1.5px solid rgba(16, 185, 129, 0.48)',
              fontFamily: EP3_FONTS.body,
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.4,
              color: '#ECFDF5',
              textAlign: 'center',
            }}
          >
            Konsultasi Spek Gratis <span style={{ color: EP3_COLORS.ground }}>•</span> Bebas Request
            Aplikasi <span style={{ color: EP3_COLORS.ground }}>•</span> Packing Kayu Aman
          </div>
        </div>
      )}

      <BottomSubtitleBar
        words={SCENE5_WORDS}
        stylePreset={EP3_STYLE_PRESET}
        fontSize={32}
        bottomOffset={EP3_SAFE.subtitleBottomOffset}
        maxWordsPerLine={6}
      />
    </AbsoluteFill>
  );
};

export default Scene5ClosingCTA;
