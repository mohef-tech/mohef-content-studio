import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface FloatingContextPillProps {
  text: string;
  startFrame?: number;
}

export const FloatingContextPill: React.FC<FloatingContextPillProps> = ({
  text,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: 14,
      stiffness: 160,
      mass: 0.7,
    },
  });

  const scale = interpolate(progress, [0, 1], [0.7, 1]);
  const translateY = interpolate(progress, [0, 1], [-28, 0]);
  const opacity = interpolate(progress, [0, 0.5, 1], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pulse = Math.sin(frame * 0.08) * 0.5 + 0.5;

  return (
    <div
      style={{
        position: "absolute",
        top: 76,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 32px",
          borderRadius: 9999,
          background:
            "linear-gradient(135deg, rgba(13, 27, 46, 0.94), rgba(6, 12, 24, 0.96))",
          border: "1.5px solid rgba(59, 130, 246, 0.48)",
          boxShadow: `0 18px 44px rgba(0, 0, 0, 0.55), 0 0 ${24 + pulse * 14}px rgba(59, 130, 246, 0.32)`,
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "#06b6d4",
            boxShadow: "0 0 12px #06b6d4",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily:
              "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "#e8edf5",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

