import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  COLORS,
  FONT_FAMILY,
  FONT_WEIGHTS,
  LAYOUT,
  LOGO_TEXT,
  SCENE_START_LIST,
  SOLID_SHADOW,
  TIMING_FRAMES,
} from "./constants";

export const LogoBadge: React.FC = () => {
  const frame = useCurrentFrame();

  const activeStart =
    [...SCENE_START_LIST].reverse().find((start) => frame >= start) ?? 0;
  const elapsed = frame - activeStart;
  const halfBounce = Math.max(1, Math.round(TIMING_FRAMES.logoBounceDuration / 2));

  const scale = interpolate(
    elapsed,
    [0, halfBounce, TIMING_FRAMES.logoBounceDuration],
    [1, 1.12, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: LAYOUT.logoX,
        top: LAYOUT.logoY,
        width: LAYOUT.logoSize,
        height: LAYOUT.logoSize,
        borderRadius: LAYOUT.logoRadius,
        backgroundColor: COLORS.bgDeep,
        border: `${LAYOUT.borderWidth}px solid ${COLORS.white}`,
        boxShadow: SOLID_SHADOW,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
        fontWeight: FONT_WEIGHTS.headline,
        fontSize: LAYOUT.logoFontSize,
        color: COLORS.white,
        letterSpacing: "0.02em",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        zIndex: 50,
      }}
    >
      {LOGO_TEXT}
    </div>
  );
};

