import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  COLORS,
  FONT_FAMILY,
  FONT_WEIGHTS,
  formatDots,
  LAYOUT,
  parseRupiahString,
  SOLID_SHADOW,
  SPRING_CONFIG,
  TIMING_FRAMES,
} from "./constants";

export interface PriceTagProps {
  judul: string;
  harga: string;
  subjudul?: string;
  aksen?: string;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  judul,
  harga,
  subjudul,
  aksen = COLORS.accent,
  startFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: SPRING_CONFIG.card,
  });

  const opacity = interpolate(enterSpring, [0, 1], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(enterSpring, [0, 1], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(enterSpring, [0, 1], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const parsed = parseRupiahString(harga);
  const countStart = startFrame;
  const countEnd = startFrame + TIMING_FRAMES.priceCountDuration;

  const countedValue = interpolate(
    frame,
    [countStart, countEnd],
    [0, parsed.targetNumber],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const displayHarga = parsed.hasNumber
    ? `${parsed.prefix}${formatDots(countedValue)}${parsed.suffix}`
    : harga;

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: COLORS.white,
        borderRadius: LAYOUT.cardRadius,
        border: `${LAYOUT.borderWidth}px solid ${COLORS.ink}`,
        boxShadow: SOLID_SHADOW,
        padding: `${LAYOUT.cardPaddingY}px ${LAYOUT.cardPaddingX}px`,
        fontFamily: FONT_FAMILY,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity,
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        transformOrigin: "center center",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 16,
            height: 44,
            borderRadius: 999,
            backgroundColor: aksen,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontWeight: FONT_WEIGHTS.headline,
            fontSize: LAYOUT.cardTitleFontSize,
            lineHeight: 1.15,
            color: COLORS.ink,
          }}
        >
          {judul}
        </div>
      </div>

      <div
        style={{
          fontWeight: FONT_WEIGHTS.headline,
          fontSize: LAYOUT.priceFontSize,
          lineHeight: 1.1,
          color: aksen,
          letterSpacing: "-0.02em",
        }}
      >
        {displayHarga}
      </div>

      {subjudul && (
        <div
          style={{
            fontWeight: FONT_WEIGHTS.body,
            fontSize: LAYOUT.subtitleFontSize,
            lineHeight: 1.25,
            color: COLORS.ink,
          }}
        >
          {subjudul}
        </div>
      )}
    </div>
  );
};

