import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  COLORS,
  FONT_FAMILY,
  FONT_WEIGHTS,
  LAYOUT,
  SOLID_SHADOW,
  SPRING_CONFIG,
  TIMING_FRAMES,
} from "./constants";

export interface StageCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  accentColor?: string;
  startFrame?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const StageCard: React.FC<StageCardProps> = ({
  title,
  subtitle,
  badge,
  accentColor = COLORS.accent,
  startFrame = 0,
  children,
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

  const enterScale = interpolate(enterSpring, [0, 1], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cycleFrames = TIMING_FRAMES.stageBreathCycle;
  const halfCycle = cycleFrames / 2;
  const loopFrame = frame % cycleFrames;

  const breathScale = interpolate(
    loopFrame,
    [0, halfCycle, cycleFrames],
    [1.0, 1.015, 1.0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const combinedScale = enterScale * breathScale;

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
        gap: 16,
        opacity,
        transform: `translate3d(0, ${translateY}px, 0) scale(${combinedScale})`,
        transformOrigin: "center center",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {badge && (
        <div
          style={{
            alignSelf: "flex-start",
            padding: "8px 24px",
            borderRadius: LAYOUT.labelRadius,
            backgroundColor: accentColor,
            border: `${LAYOUT.borderWidth}px solid ${COLORS.ink}`,
            fontWeight: FONT_WEIGHTS.label,
            fontSize: LAYOUT.labelFontSize,
            color: COLORS.white,
            textTransform: "uppercase",
          }}
        >
          {badge}
        </div>
      )}

      {title && (
        <div
          style={{
            fontWeight: FONT_WEIGHTS.headline,
            fontSize: LAYOUT.cardTitleFontSize,
            lineHeight: 1.15,
            color: COLORS.ink,
          }}
        >
          {title}
        </div>
      )}

      {subtitle && (
        <div
          style={{
            fontWeight: FONT_WEIGHTS.body,
            fontSize: LAYOUT.bodyMinFontSize,
            lineHeight: 1.25,
            color: COLORS.ink,
          }}
        >
          {subtitle}
        </div>
      )}

      {children}
    </div>
  );
};

