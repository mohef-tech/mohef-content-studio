import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  BottomSubtitleBar,
  ProceduralBackground,
  WordItem,
} from '../../../lib/motion-craft';
import {
  EP1_COLORS,
  EP1_FONTS,
  EP1_LAYOUT,
  EP1_STYLE_PRESET,
} from '../constants';

export interface HybridStageFrameProps {
  /** Teks mode/status di pojok kiri atas panggung 3D */
  stageBadge: string;
  /** Warna aksen badge status panggung 3D */
  stageBadgeColor?: string;
  /** Label kanan atas panggung 3D (mis. X-RAY BLUEPRINT) */
  stageRightTag?: string;
  /** Konten Panggung 3D Atas (Y: 130..960) */
  topStage: React.ReactNode;
  /** Konten Panggung Interaktif Bawah (Y: 980..1640) */
  bottomStage: React.ReactNode;
  /** Kata narasi untuk BottomSubtitleBar (Y: 1650..1820) */
  words: WordItem[];
  /** Nomor episode / step di header */
  headerTag?: string;
}

export const HybridStageFrame: React.FC<HybridStageFrameProps> = ({
  stageBadge,
  stageBadgeColor = EP1_COLORS.data,
  stageRightTag = '4×4M WORKSTATION',
  topStage,
  bottomStage,
  words,
  headerTag = 'EP 01 • KELISTRIKAN',
}) => {
  const frame = useCurrentFrame();
  const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(frame * 0.22));

  return (
    <AbsoluteFill style={{ backgroundColor: EP1_COLORS.bg, fontFamily: EP1_FONTS.body }}>
      {/* Latar prosedural hidup */}
      <ProceduralBackground stylePreset={EP1_STYLE_PRESET} driftSpeed={0.85} />

      {/* Vignette halus untuk menjaga kedalaman */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(15, 22, 34, 0) 35%, rgba(4, 7, 13, 0.78) 100%)',
        }}
      />

      {/* Top Safe-Area Brand Header (Y: 48..112) */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: EP1_LAYOUT.safeX,
          right: EP1_LAYOUT.safeX,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 18px',
            borderRadius: 12,
            backgroundColor: 'rgba(15, 22, 34, 0.85)',
            border: `1px solid ${EP1_COLORS.border}`,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: EP1_COLORS.power,
              boxShadow: `0 0 12px ${EP1_COLORS.power}`,
            }}
          />
          <span
            style={{
              fontFamily: EP1_FONTS.heading,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 0.6,
              color: EP1_COLORS.ink,
            }}
          >
            MOHAMMED <span style={{ color: EP1_COLORS.muted }}>|</span>{' '}
            <span style={{ color: EP1_COLORS.power }}>MOHEF TECH</span>
          </span>
        </div>

        <div
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            backgroundColor: 'rgba(15, 22, 34, 0.85)',
            border: `1px solid ${EP1_COLORS.data}44`,
            fontFamily: EP1_FONTS.mono,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 1,
            color: EP1_COLORS.data,
          }}
        >
          {headerTag}
        </div>
      </div>

      {/* ZONA ATAS: Panggung 3D Isometric X-Ray Room (Y: 130px s/d 960px) */}
      <div
        style={{
          position: 'absolute',
          top: EP1_LAYOUT.stageTop,
          left: EP1_LAYOUT.safeX,
          width: EP1_LAYOUT.contentWidth,
          height: EP1_LAYOUT.stageHeight,
          borderRadius: 24,
          overflow: 'hidden',
          border: `1px solid ${stageBadgeColor}38`,
          backgroundColor: '#070C14',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
          zIndex: 10,
        }}
      >
        {topStage}

        {/* HUD Overlay Tipis di atas Panggung 3D */}
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 20,
            right: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 15,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 14px',
              borderRadius: 999,
              backgroundColor: 'rgba(7, 11, 18, 0.78)',
              border: `1px solid ${stageBadgeColor}66`,
              fontFamily: EP1_FONTS.mono,
              fontSize: 15,
              fontWeight: 700,
              color: stageBadgeColor,
              letterSpacing: 0.8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: stageBadgeColor,
                opacity: pulse,
              }}
            />
            {stageBadge}
          </div>

          <div
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              backgroundColor: 'rgba(7, 11, 18, 0.72)',
              border: `1px solid ${EP1_COLORS.border}`,
              fontFamily: EP1_FONTS.mono,
              fontSize: 14,
              fontWeight: 600,
              color: EP1_COLORS.muted,
              letterSpacing: 0.8,
            }}
          >
            {stageRightTag}
          </div>
        </div>

        {/* Corner Reticles */}
        {(
          [
            { top: 12, left: 12, borderTop: true, borderLeft: true },
            { top: 12, right: 12, borderTop: true, borderRight: true },
            { bottom: 12, left: 12, borderBottom: true, borderLeft: true },
            { bottom: 12, right: 12, borderBottom: true, borderRight: true },
          ] as const
        ).map((c, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              width: 18,
              height: 18,
              pointerEvents: 'none',
              zIndex: 15,
              ...('top' in c ? { top: c.top } : {}),
              ...('bottom' in c ? { bottom: c.bottom } : {}),
              ...('left' in c ? { left: c.left } : {}),
              ...('right' in c ? { right: c.right } : {}),
              borderTop: 'borderTop' in c ? `2px solid ${stageBadgeColor}88` : undefined,
              borderBottom: 'borderBottom' in c ? `2px solid ${stageBadgeColor}88` : undefined,
              borderLeft: 'borderLeft' in c ? `2px solid ${stageBadgeColor}88` : undefined,
              borderRight: 'borderRight' in c ? `2px solid ${stageBadgeColor}88` : undefined,
            }}
          />
        ))}
      </div>

      {/* ZONA BAWAH: Panggung Komponen Motion-Craft (Y: 980px s/d 1640px) */}
      <div
        style={{
          position: 'absolute',
          top: EP1_LAYOUT.bottomTop,
          left: EP1_LAYOUT.safeX,
          width: EP1_LAYOUT.contentWidth,
          height: EP1_LAYOUT.bottomHeight,
          borderRadius: 24,
          overflow: 'hidden',
          zIndex: 12,
        }}
      >
        {bottomStage}
      </div>

      {/* ZONA SUBTITLE (Y: 1650px s/d 1820px) */}
      <BottomSubtitleBar
        words={words}
        stylePreset={EP1_STYLE_PRESET}
        fontSize={32}
        bottomOffset={EP1_LAYOUT.subtitleBottomOffset}
        maxWordsPerLine={6}
      />
    </AbsoluteFill>
  );
};
