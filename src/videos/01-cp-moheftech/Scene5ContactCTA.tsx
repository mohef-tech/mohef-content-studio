import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadJakarta } from '@remotion/google-fonts/PlusJakartaSans';
import { AnimatedCursor, SfxCue } from '../../lib/motion-craft';
import { MohefTechHub3D } from './MohefTechHub3D';

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: JAKARTA } = loadJakarta('normal', {
  weights: ['600', '700', '800'],
  subsets: ['latin'],
});

export const SCENE5_DURATION = 330;

const INK = '#1F1F1F';
const MUTED = '#555555';
const MOHEF_BLUE = '#0056D2';
const MOHEF_DARK = '#0A2A35';
const EMERALD = '#10B981';
const ORANGE = '#F97316';

const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

interface SyncCardDef {
  id: string;
  badge: string;
  title: string;
  desc: string;
  startFrame: number;
  endFrame: number;
  accent: string;
  badgeColor: string;
  bg: string;
  shadow: string;
}

const SYNC_CARDS: SyncCardDef[] = [
  {
    id: 'sync-r1',
    badge: '01 • RUANG & INFRA',
    title: 'Bangun Ruang & Infra',
    desc: 'Layout 3D, Listrik, Air, CCTV & Wi-Fi AP',
    startFrame: 35,
    endFrame: 95,
    accent: EMERALD,
    badgeColor: '#059669',
    bg: 'linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 100%)',
    shadow: 'rgba(16, 185, 129, 0.25)',
  },
  {
    id: 'sync-r2',
    badge: '02 • HARDWARE & PC',
    title: 'PC, Kasir & Service',
    desc: 'Rakit PC, Printer POS & Service Laptop',
    startFrame: 95,
    endFrame: 155,
    accent: ORANGE,
    badgeColor: '#EA580C',
    bg: 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)',
    shadow: 'rgba(249, 115, 22, 0.25)',
  },
  {
    id: 'sync-r3',
    badge: '03 • WEB & APLIKASI',
    title: 'Web, POS & App Custom',
    desc: 'Sistem Kasir, Website & Aplikasi QR',
    startFrame: 155,
    endFrame: 215,
    accent: MOHEF_BLUE,
    badgeColor: MOHEF_BLUE,
    bg: 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)',
    shadow: 'rgba(0, 86, 210, 0.25)',
  },
];

// ============================================================================
// ZONA ATAS (Y: 105px s/d 320px) — Memory Anchor untuk Semua Kalangan
// ============================================================================
const CtaHeader: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const badgeIn = spring({ frame, fps, config: { damping: 16, stiffness: 170 } });
  const bannerIn = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 160, mass: 0.75 } });
  const subIn = spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 155 } });

  return (
    <div
      style={{
        position: 'absolute',
        top: 105,
        left: 0,
        right: 0,
        height: 215,
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '7px 22px',
          borderRadius: 999,
          background: MOHEF_DARK,
          boxShadow: '0 8px 20px rgba(10, 42, 53, 0.24)',
          fontFamily: JAKARTA,
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: '0.07em',
          color: '#FFFFFF',
          opacity: badgeIn,
          transform: `translateY(${(1 - badgeIn) * -14}px) scale(${0.92 + badgeIn * 0.08})`,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: EMERALD,
            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.32)',
            flexShrink: 0,
          }}
        />
        <span>
          SATU PINTU SOLUSI IT <span style={{ color: '#6EE7B7' }}>• UNTUK BISNIS &amp; PERSONAL</span>
        </span>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: '10px 32px',
          background: MOHEF_BLUE,
          border: `2px solid ${MOHEF_DARK}`,
          boxShadow: '0 14px 32px rgba(10, 42, 53, 0.34), 0 4px 0 #0A2A35',
          transform: `rotate(-1.5deg) scale(${0.86 + bannerIn * 0.14})`,
          opacity: bannerIn,
        }}
      >
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 54,
            lineHeight: 1.04,
            color: '#FFFFFF',
            letterSpacing: '0.015em',
            whiteSpace: 'nowrap',
          }}
        >
          BUTUH SOLUSI IT? INGAT MOHEF TECH
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          width: 940,
          padding: '9px 24px',
          borderRadius: 14,
          background: '#FFFFFF',
          border: `2px solid ${EMERALD}`,
          boxShadow: '0 10px 24px rgba(10, 42, 53, 0.14)',
          textAlign: 'center',
          fontFamily: JAKARTA,
          fontSize: 20,
          fontWeight: 800,
          lineHeight: 1.25,
          color: INK,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 18}px)`,
        }}
      >
        UMKM &amp; Toko <span style={{ color: MOHEF_BLUE }}>•</span> Kantor &amp; Instansi{' '}
        <span style={{ color: MOHEF_BLUE }}>•</span> Karyawan, Mahasiswa &amp; Kebutuhan Pribadi
      </div>
    </div>
  );
};

// ============================================================================
// SCENE 5 — GRAND FINALE CTA & RUJUKAN IT
// ============================================================================
export const Scene5ContactCTA: React.FC<{ withBgm?: boolean }> = ({ withBgm = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const allLit = frame >= 215;
  const ctaEnter = spring({ frame: frame - 212, fps, config: { damping: 14, stiffness: 155, mass: 0.8 } });
  const saveClickPulse =
    frame >= 268
      ? 1 - 0.05 * Math.sin(Math.PI * interpolate(frame, [268, 280], [0, 1], clampOpts))
      : 1;
  const saveActive = frame >= 272;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #CFE8FB 0%, #E8F3FB 38%, #FBF3E8 72%, #F6E9D7 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Audio BGM & SFX Presisi */}
      {withBgm && <Audio src={staticFile('audio/songs/B25-apple-keynote-pluck.wav')} volume={0.5} loop />}
      <SfxCue frame={8} sfx="transition-whoosh-soft" volume={0.55} />
      <SfxCue frame={35} sfx="pop-in" volume={0.55} />
      <SfxCue frame={95} sfx="pop-in" volume={0.55} />
      <SfxCue frame={155} sfx="pop-in" volume={0.55} />
      <SfxCue frame={215} sfx="confirm-chime" volume={0.65} />

      {/* Awan lembut latar belakang */}
      <div
        style={{
          position: 'absolute',
          top: 66 + Math.sin(frame / 42) * 5,
          left: -85 + frame * 0.2,
          width: 500,
          height: 150,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.7)',
          filter: 'blur(28px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 390,
          right: -120 + frame * 0.16,
          width: 440,
          height: 135,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.56)',
          filter: 'blur(30px)',
        }}
      />

      {/* Zona Tengah (Y: 320px s/d 1105px — Pull-Back & Sequential Spotlight 1->2->3->All) */}
      <MohefTechHub3D
        cameraStage="final-cta"
        fromStage="room3-software"
        transitionStart={0}
        transitionDuration={45}
        frame={frame}
        width={1080}
        height={1920}
        focusY={730}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
      />

      {/* Zona Atas */}
      <CtaHeader frame={frame} fps={fps} />

      {/* Zona Bawah Baris 1 (Y: 1110px s/d 1282px — 3 Kartu Sinkron Sorotan Ruangan) */}
      <div
        style={{
          position: 'absolute',
          top: 1110,
          left: 50,
          width: 980,
          height: 172,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 18,
          zIndex: 30,
        }}
      >
        {SYNC_CARDS.map((card) => {
          const enter = spring({
            frame: frame - card.startFrame,
            fps,
            config: { damping: 14, stiffness: 170, mass: 0.7 },
          });
          const isFocused = frame >= card.startFrame && frame < card.endFrame;
          const activeLift = isFocused ? -7 : allLit ? -2 : 0;
          const activeScale = isFocused ? 1.03 : 1;

          return (
            <div
              key={card.id}
              style={{
                position: 'relative',
                borderRadius: 20,
                background: card.bg,
                border: `${isFocused || allLit ? 2.5 : 2}px solid ${card.accent}`,
                padding: '14px 18px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                opacity: enter,
                transform: `translateY(${(1 - enter) * 26 + activeLift}px) scale(${(0.86 + enter * 0.14) * activeScale})`,
                boxShadow: isFocused
                  ? `0 18px 36px ${card.shadow}, 0 0 0 4px ${card.accent}2A`
                  : allLit
                    ? `0 14px 28px ${card.shadow}`
                    : '0 10px 22px rgba(15, 23, 42, 0.08)',
              }}
            >
              <div
                style={{
                  fontFamily: JAKARTA,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.07em',
                  color: card.badgeColor,
                }}
              >
                {card.badge}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: JAKARTA,
                    fontSize: 21,
                    fontWeight: 800,
                    lineHeight: 1.18,
                    color: INK,
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    marginTop: 5,
                    fontFamily: JAKARTA,
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.28,
                    color: MUTED,
                  }}
                >
                  {card.desc}
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 6,
                  background: card.accent,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Zona Bawah Baris 2 (Y: 1300px s/d 1620px — Hero Contact & Save CTA Card, Safe Zone >300px) */}
      <div
        style={{
          position: 'absolute',
          top: 1300,
          left: 50,
          width: 980,
          height: 320,
          borderRadius: 24,
          background: `linear-gradient(135deg, ${MOHEF_DARK} 0%, #0F3548 100%)`,
          border: `3px solid ${MOHEF_BLUE}`,
          boxShadow: allLit
            ? '0 22px 46px rgba(10, 42, 53, 0.38), 0 0 0 5px rgba(0, 86, 210, 0.22)'
            : '0 18px 38px rgba(10, 42, 53, 0.3)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          opacity: ctaEnter,
          transform: `translateY(${(1 - ctaEnter) * 32}px) scale(${0.92 + ctaEnter * 0.08})`,
          zIndex: 30,
          boxSizing: 'border-box',
        }}
      >
        {/* Header Bar dalam Card */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 14px',
              borderRadius: 999,
              background: 'rgba(16, 185, 129, 0.18)',
              border: '1.5px solid rgba(16, 185, 129, 0.55)',
              fontFamily: JAKARTA,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: '#6EE7B7',
            }}
          >
            <span>SEMUA TERHUBUNG • KONSULTASI GRATIS DULU</span>
          </div>
          <div
            style={{
              fontFamily: JAKARTA,
              fontSize: 15,
              fontWeight: 700,
              color: '#BAE6FD',
            }}
          >
            UMKM • Kantor • Personal &amp; Mahasiswa
          </div>
        </div>

        {/* 2 Kolom Kontak Jelas & Save Rujukan */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 1fr',
            gap: 18,
            flex: 1,
            marginTop: 14,
          }}
        >
          {/* Kolom Kiri: Nomor WhatsApp & Nama Mohammed */}
          <div
            style={{
              borderRadius: 18,
              background: '#FFFFFF',
              border: `2px solid ${EMERALD}`,
              padding: '16px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 10px 24px rgba(0, 0, 0, 0.16)',
            }}
          >
            <div
              style={{
                fontFamily: JAKARTA,
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#059669',
              }}
            >
              WHATSAPP / HUBUNGI LANGSUNG
            </div>
            <div
              style={{
                fontFamily: JAKARTA,
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: '0.02em',
                lineHeight: 1.05,
                color: MOHEF_DARK,
              }}
            >
              082336744354
            </div>
            <div
              style={{
                fontFamily: JAKARTA,
                fontSize: 21,
                fontWeight: 800,
                color: MOHEF_BLUE,
              }}
            >
              Mohammed <span style={{ color: MUTED, fontWeight: 700 }}>• Mohef Tech</span>
            </div>
          </div>

          {/* Kolom Kanan: DM / Klik Link di Bio + Save Video Button */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div
              style={{
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.09)',
                border: '1.5px solid rgba(125, 211, 252, 0.45)',
                padding: '13px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div
                style={{
                  fontFamily: JAKARTA,
                  fontSize: 21,
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                📩 DM / Klik Link di Bio
              </div>
              <div
                style={{
                  fontFamily: JAKARTA,
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#CBD5E1',
                }}
              >
                Tanya masalah IT, ruang usaha, PC, atau aplikasi custom kamu
              </div>
            </div>

            <div
              style={{
                borderRadius: 16,
                background: saveActive
                  ? 'linear-gradient(90deg, #059669 0%, #10B981 100%)'
                  : 'linear-gradient(90deg, #0056D2 0%, #10B981 100%)',
                border: '2px solid rgba(255, 255, 255, 0.65)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                fontFamily: JAKARTA,
                fontSize: 19,
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                transform: `scale(${saveClickPulse})`,
                boxShadow: saveActive
                  ? '0 10px 26px rgba(16, 185, 129, 0.48)'
                  : '0 8px 20px rgba(0, 86, 210, 0.32)',
              }}
            >
              <span>{saveActive ? '✅ TERSIMPAN! JADIKAN RUJUKAN IT' : '🔖 SAVE VIDEO INI JADI RUJUKAN IT'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kursor interaktif mengklik tombol Save Video */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40 }}>
        <AnimatedCursor
          waypoints={[
            [235, 920, 1660],
            [265, 780, 1558],
            [330, 780, 1558],
          ]}
          clicks={[{ frame: 268, label: 'SAVE' }]}
          size={36}
          accentColor={EMERALD}
          enableClickSfx={true}
        />
      </div>
    </AbsoluteFill>
  );
};

export default Scene5ContactCTA;
