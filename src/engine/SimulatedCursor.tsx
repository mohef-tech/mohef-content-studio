import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

export interface CursorPathPoint {
  frame: number;
  x: number;
  y: number;
  click?: boolean;
}

export interface SimulatedCursorProps {
  path: CursorPathPoint[];
}

const RIPPLE_DURATION = 24;
const CLICK_PRESS_DURATION = 14;

export const SimulatedCursor: React.FC<SimulatedCursorProps> = ({ path }) => {
  const frame = useCurrentFrame();

  if (path.length === 0) {
    return null;
  }

  const sorted = [...path].sort((a, b) => a.frame - b.frame);

  let x = sorted[0].x;
  let y = sorted[0].y;

  if (frame <= sorted[0].frame) {
    x = sorted[0].x;
    y = sorted[0].y;
  } else if (frame >= sorted[sorted.length - 1].frame) {
    x = sorted[sorted.length - 1].x;
    y = sorted[sorted.length - 1].y;
  } else {
    for (let i = 0; i < sorted.length - 1; i++) {
      const p0 = sorted[i];
      const p1 = sorted[i + 1];
      if (frame >= p0.frame && frame <= p1.frame) {
        if (p1.frame === p0.frame) {
          x = p1.x;
          y = p1.y;
        } else {
          const t = interpolate(frame, [p0.frame, p1.frame], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          });
          x = p0.x + (p1.x - p0.x) * t;
          y = p0.y + (p1.y - p0.y) * t;
        }
        break;
      }
    }
  }

  let cursorScale = 1;
  for (const pt of sorted) {
    if (
      pt.click &&
      frame >= pt.frame &&
      frame <= pt.frame + CLICK_PRESS_DURATION
    ) {
      const elapsed = frame - pt.frame;
      cursorScale = interpolate(
        elapsed,
        [0, 3, CLICK_PRESS_DURATION],
        [1, 0.78, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      );
    }
  }

  const activeRipples = sorted.filter(
    (pt) => pt.click && frame >= pt.frame && frame <= pt.frame + RIPPLE_DURATION
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 9999 }}>
      {activeRipples.map((pt) => {
        const elapsed = frame - pt.frame;
        const rippleScale = interpolate(
          elapsed,
          [0, RIPPLE_DURATION],
          [0.25, 2.5],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }
        );
        const rippleOpacity = interpolate(
          elapsed,
          [0, RIPPLE_DURATION],
          [0.85, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        return (
          <div
            key={`${pt.frame}-${pt.x}-${pt.y}`}
            style={{
              position: "absolute",
              left: pt.x,
              top: pt.y,
              width: 38,
              height: 38,
              marginLeft: -19,
              marginTop: -19,
              borderRadius: "9999px",
              border: "2.5px solid rgba(56, 189, 248, 0.95)",
              backgroundColor: "rgba(56, 189, 248, 0.22)",
              transform: `scale(${rippleScale})`,
              opacity: rippleOpacity,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: -4,
          top: -4,
          transform: `translate3d(${x}px, ${y}px, 0px) scale(${cursorScale})`,
          transformOrigin: "4px 4px",
          willChange: "transform",
          filter: "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.45))",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 3.5L22.5 11.2C23.6 11.67 23.53 13.25 22.4 13.62L14.8 16.1L11.55 23.45C11.07 24.53 9.5 24.47 9.1 23.35L3.1 6.35C2.73 5.31 3.5 4.07 4.5 3.5Z"
            fill="#0f172a"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
