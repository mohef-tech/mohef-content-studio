import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
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

const RIPPLE_DURATION = 22;
const CLICK_PRESS_DURATION = 12;

export const SimulatedCursor: React.FC<SimulatedCursorProps> = ({ path }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (path.length === 0) {
    return null;
  }

  const sorted = [...path].sort((a, b) => a.frame - b.frame);

  let x = sorted[0].x;
  let y = sorted[0].y;

  for (let i = 1; i < sorted.length; i++) {
    const pt = sorted[i];
    const progress =
      pt.frame <= 0
        ? 1
        : spring({
            frame: frame - pt.frame,
            fps,
            config: {
              damping: 22,
              stiffness: 140,
              mass: 0.7,
            },
          });

    x += (pt.x - x) * progress;
    y += (pt.y - y) * progress;
  }

  let cursorScale = 1;
  for (const pt of sorted) {
    if (pt.click && frame >= pt.frame && frame <= pt.frame + CLICK_PRESS_DURATION) {
      const elapsed = frame - pt.frame;
      cursorScale = interpolate(
        elapsed,
        [0, 3, CLICK_PRESS_DURATION],
        [1, 0.8, 1],
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
          [0.3, 2.4],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );
        const rippleOpacity = interpolate(
          elapsed,
          [0, RIPPLE_DURATION],
          [0.7, 0],
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
              width: 36,
              height: 36,
              marginLeft: -18,
              marginTop: -18,
              borderRadius: "9999px",
              border: "2.5px solid rgba(56, 189, 248, 0.9)",
              backgroundColor: "rgba(56, 189, 248, 0.18)",
              transform: `scale(${rippleScale})`,
              opacity: rippleOpacity,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate3d(${x}px, ${y}px, 0px) scale(${cursorScale})`,
          transformOrigin: "4px 4px",
          willChange: "transform",
          filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35))",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 3.5L22.5 11.2C23.6 11.67 23.53 13.25 22.4 13.62L14.8 16.1L11.55 23.45C11.07 24.53 9.5 24.47 9.1 23.35L3.1 6.35C2.73 5.31 3.5 4.07 4.5 3.5Z"
            fill="#111827"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

