import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { SfxCue } from "../../lib/motion-craft";
import {
  COLORS,
  DEFAULT_CURSOR_WAYPOINTS,
  LAYOUT,
  sec,
  SFX,
  TIMING_FRAMES,
} from "./constants";

export interface CursorWaypoint {
  sec: number;
  x: number;
  y: number;
  click?: boolean;
}

export interface CursorProps {
  waypoints?: readonly CursorWaypoint[];
}

export const Cursor: React.FC<CursorProps> = ({
  waypoints = DEFAULT_CURSOR_WAYPOINTS,
}) => {
  const frame = useCurrentFrame();

  const points = waypoints.map((wp, idx) => {
    const rawFrame = sec(wp.sec);
    return {
      ...wp,
      frame: idx === 0 ? rawFrame : Math.max(rawFrame, idx),
    };
  });

  let posX = points[0]?.x ?? LAYOUT.safeXMin;
  let posY = points[0]?.y ?? LAYOUT.safeYMin;

  if (points.length >= 2) {
    let segIndex = 0;
    for (let i = 0; i < points.length - 1; i++) {
      if (frame >= points[i].frame) {
        segIndex = i;
      }
    }

    const startPt = points[segIndex];
    const endPt = points[Math.min(segIndex + 1, points.length - 1)];
    const startF = startPt.frame;
    const endF = Math.max(startF + 1, endPt.frame);

    const t = interpolate(frame, [startF, endF], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });

    const linearX = interpolate(t, [0, 1], [startPt.x, endPt.x], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const linearY = interpolate(t, [0, 1], [startPt.y, endPt.y], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const dx = endPt.x - startPt.x;
    const dy = endPt.y - startPt.y;
    const dist = Math.hypot(dx, dy);
    const arcMag = Math.min(72, dist * 0.22);
    const nx = dist > 0 ? -dy / dist : 0;
    const ny = dist > 0 ? dx / dist : 0;
    const curveOffset = Math.sin(t * Math.PI) * arcMag;

    posX = linearX + nx * curveOffset;
    posY = linearY + ny * curveOffset;
  }

  const clickPoints = points.filter((p) => p.click);
  const dipDur = TIMING_FRAMES.cursorClickDipDuration;
  const halfDip = Math.max(1, Math.round(dipDur / 2));

  let cursorScale = 1;
  for (const cp of clickPoints) {
    if (frame >= cp.frame && frame <= cp.frame + dipDur) {
      cursorScale = interpolate(
        frame,
        [cp.frame, cp.frame + halfDip, cp.frame + dipDur],
        [1, 0.82, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      );
    }
  }

  return (
    <>
      {clickPoints.map((cp, idx) => (
        <SfxCue
          key={`cursor-sfx-${idx}`}
          frame={Math.max(1, cp.frame)}
          sfx={SFX.click}
          volume={SFX.volume}
        />
      ))}

      {/* Click Ripples */}
      {clickPoints.map((cp, idx) => {
        const rippleEnd = cp.frame + TIMING_FRAMES.cursorRippleDuration;
        if (frame < cp.frame || frame > rippleEnd) {
          return null;
        }
        const rippleScale = interpolate(
          frame,
          [cp.frame, rippleEnd],
          [0.3, 2.1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );
        const rippleOpacity = interpolate(
          frame,
          [cp.frame, rippleEnd],
          [0.9, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        return (
          <div
            key={`ripple-${idx}`}
            style={{
              position: "absolute",
              left: cp.x - LAYOUT.cursorRippleSize / 2,
              top: cp.y - LAYOUT.cursorRippleSize / 2,
              width: LAYOUT.cursorRippleSize,
              height: LAYOUT.cursorRippleSize,
              borderRadius: "50%",
              border: `6px solid ${COLORS.accent}`,
              opacity: rippleOpacity,
              transform: `scale(${rippleScale})`,
              transformOrigin: "center center",
              pointerEvents: "none",
              zIndex: 60,
            }}
          />
        );
      })}

      {/* Pointer Cursor SVG */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: LAYOUT.cursorSize,
          height: LAYOUT.cursorSize,
          transform: `translate3d(${posX}px, ${posY}px, 0) scale(${cursorScale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
          zIndex: 65,
        }}
      >
        <svg
          width={LAYOUT.cursorSize}
          height={LAYOUT.cursorSize}
          viewBox="0 0 48 48"
          fill="none"
        >
          <path
            d="M10 8 L40 22 L26 27 L33 41 L25 44 L18 30 L10 38 Z"
            fill={COLORS.ink}
          />
          <path
            d="M6 4 L36 18 L22 23 L29 37 L21 40 L14 26 L6 34 Z"
            fill={COLORS.white}
            stroke={COLORS.ink}
            strokeWidth={4}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
};

