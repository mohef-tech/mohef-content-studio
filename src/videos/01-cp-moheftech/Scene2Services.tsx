import React from 'react';
import {
  AbsoluteFill,
  Audio,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadJakarta } from '@remotion/google-fonts/PlusJakartaSans';
import { BentoGridReveal, SfxCue, type BentoCellItem } from '../../lib/motion-craft';
import { MohefTechHub3D } from './MohefTechHub3D';

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: JAKARTA } = loadJakarta('normal', {
  weights: ['600', '700', '800'],
  subsets: ['latin'],
});

export const SCENE2_DURATION = 330;

const INK = '#1F1F1F';
const MOHEF_BLUE = '#0056D2';
const MOHEF_DARK = '#0A2A35';
const EMERALD = '#10B981';

const BENTO_ITEMS: BentoCellItem[] = [
  {
    id: 'bento-spatial',
    colSpan: 1,
    rowSpan: 1,
    revealWave: 1,
    indexLabel: '01 • SPATIAL & LAYOUT',
    title: 'Desain 3D Ruang, Rak & Meja Kasir',
    subtitle:
      'Simulasi penempatan rak display, alur pengunjung, dan titik meja PC Kasir (POS) sebelum dibangun.',
    surfaceColor: 'linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 100%)',
    textColor: INK,
    accentColor: EMERALD,
  },
  {
    id: 'bento-utility',
    colSpan: 1,
    rowSpan: 1,
    revealWave: 2,
    indexLabel: '02 • UTILITAS FISIK',
    title: 'Skema Jalur Listrik & Air Bersih',
    subtitle:
      'Pemetaan beban daya workstation/kasir, jalur kabel rapi, serta instalasi titik pipa air toko/kafe.',
    surfaceColor: 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)',
    textColor: INK,
    accentColor: '#F97316',
  },
  {
    id: 'bento-security-net',
    colSpan: 2,
    rowSpan: 1,
    revealWave: 3,
    indexLabel: '03 • KEAMANAN & KONEKTIVITAS',
    title: 'Titik Sudut CCTV, Wi-Fi Access Point (AP) & Server Lokal',
    subtitle:
      'Sudut pantau CCTV bebas blind-spot, sebaran sinyal AP merata ke seluruh toko, dan Home/Local Server 24/7.',
    surfaceColor: 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)',
    textColor: INK,
    accentColor: MOHEF_BLUE,
  },
];

// ============================================================================
// ZONA ATAS (Y: 105px s/d 320px) — Header Studi Kasus Pilar 01
// ============================================================================
const CaseStudyHeader: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
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
      {/* Badge Kategori Atas */}
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
            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.3)',
            flexShrink: 0,
          }}
        />
        <span>
          STUDI KASUS 01 <span style={{ color: '#6EE7B7' }}>• DESAIN RUANG & INFRASTRUKTUR TOKO</span>
        </span>
      </div>

      {/* Banner Utama Miring Tegas (-1.5deg) */}
      <div
        style={{
          marginTop: 12,
          padding: '10px 30px',
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
            fontSize: 52,
            lineHeight: 1.04,
            color: '#FFFFFF',
            letterSpacing: '0.015em',
            whiteSpace: 'nowrap',
          }}
        >
          DARI RUANG KOSONG JADI TOKO SIAP JALAN
        </div>
      </div>

      {/* Sub-Banner di Bawahnya (jarak aman tidak bertumpuk) */}
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
        Kolaborasi Arsitek &amp; Teknisi <span style={{ color: MOHEF_BLUE }}>•</span> Layout Rak, Listrik, Air, Kasir POS, CCTV &amp; Wi-Fi AP
      </div>
    </div>
  );
};

// ============================================================================
// SCENE 2 — STUDI KASUS RUANG TOKO & INFRASTRUKTUR DARI NOL
// ============================================================================
export const Scene2Services: React.FC<{ withBgm?: boolean }> = ({ withBgm = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #CFE8FB 0%, #E8F3FB 38%, #FBF3E8 72%, #F6E9D7 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Audio & SFX Presisi (Tanpa Voiceover) */}
      {withBgm && <Audio src={staticFile('audio/songs/B25-apple-keynote-pluck.wav')} volume={0.5} loop />}
      <SfxCue frame={8} sfx="transition-whoosh-soft" volume={0.55} />
      <SfxCue frame={35} sfx="pop-in" volume={0.55} />
      <SfxCue frame={85} sfx="toggle-on" volume={0.55} />
      <SfxCue frame={135} sfx="confirm-chime" volume={0.5} />

      {/* Awan lembut latar belakang */}
      <div
        style={{
          position: 'absolute',
          top: 65 + Math.sin(frame / 42) * 5,
          left: -90 + frame * 0.22,
          width: 500,
          height: 150,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.72)',
          filter: 'blur(28px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 390,
          right: -130 + frame * 0.16,
          width: 440,
          height: 135,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.58)',
          filter: 'blur(30px)',
        }}
      />

      {/* Zona Tengah (Y: 320px s/d 1110px — Panggung 3D Close-Up Ruangan 1) */}
      <MohefTechHub3D
        cameraStage="room1-infra"
        fromStage="overview"
        transitionStart={0}
        transitionDuration={45}
        frame={frame}
        width={1080}
        height={1920}
        focusY={775}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
      />

      {/* Zona Atas */}
      <CaseStudyHeader frame={frame} fps={fps} />

      {/* Zona Bawah (Y: 1125px s/d 1620px — Bento Grid Studi Kasus, Safe Zone >300px) */}
      <div
        className="mohef-bento-grid"
        style={{
          position: 'absolute',
          top: 1125,
          left: 50,
          width: 980,
          height: 495,
          zIndex: 30,
        }}
      >
        <style>{`
          .mohef-bento-grid > div > div > div {
            position: relative !important;
            justify-content: flex-start !important;
            gap: 10px !important;
            padding: 20px 24px 24px !important;
            border-radius: 22px !important;
          }
          .mohef-bento-grid > div > div > div:nth-child(1) {
            border: 2px solid #10B981 !important;
            box-shadow: 0 14px 30px rgba(16, 185, 129, 0.16) !important;
          }
          .mohef-bento-grid > div > div > div:nth-child(2) {
            border: 2px solid #F97316 !important;
            box-shadow: 0 14px 30px rgba(249, 115, 22, 0.16) !important;
          }
          .mohef-bento-grid > div > div > div:nth-child(3) {
            border: 2px solid #0056D2 !important;
            box-shadow: 0 14px 30px rgba(0, 86, 210, 0.16) !important;
          }
          .mohef-bento-grid > div > div > div::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 7px;
          }
          .mohef-bento-grid > div > div > div:nth-child(1)::after { background: #10B981; }
          .mohef-bento-grid > div > div > div:nth-child(2)::after { background: #F97316; }
          .mohef-bento-grid > div > div > div:nth-child(3)::after { background: #0056D2; }

          .mohef-bento-grid > div > div > div > div:first-child > span {
            font-family: ${JAKARTA} !important;
            font-size: 15px !important;
            font-weight: 800 !important;
            letter-spacing: 0.08em !important;
            opacity: 1 !important;
          }
          .mohef-bento-grid > div > div > div:nth-child(1) > div:first-child > span { color: #059669 !important; }
          .mohef-bento-grid > div > div > div:nth-child(2) > div:first-child > span { color: #EA580C !important; }
          .mohef-bento-grid > div > div > div:nth-child(3) > div:first-child > span { color: #0056D2 !important; }

          .mohef-bento-grid > div > div > div > div:last-child {
            gap: 8px !important;
          }
          .mohef-bento-grid > div > div > div > div:last-child > div:first-child {
            font-family: ${JAKARTA} !important;
            font-size: 25px !important;
            font-weight: 800 !important;
            line-height: 1.18 !important;
            letter-spacing: -0.015em !important;
            color: #1F1F1F !important;
          }
          .mohef-bento-grid > div > div > div > div:last-child > div:last-child {
            font-family: ${JAKARTA} !important;
            font-size: 19px !important;
            font-weight: 600 !important;
            line-height: 1.32 !important;
            color: #555555 !important;
            opacity: 1 !important;
          }
        `}</style>
        <BentoGridReveal
          items={BENTO_ITEMS}
          startFrame={30}
          waveGapFrames={24}
          stageWidth={980}
          stageHeight={495}
          columns={2}
          gapPx={18}
          enableSfx={false}
        />
      </div>
    </AbsoluteFill>
  );
};

export default Scene2Services;
