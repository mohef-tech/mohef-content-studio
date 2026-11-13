import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface CameraKeyframe {
  frame: number;
  scale?: number;
  x?: number;
  y?: number;
  rotateX?: number;
  rotateY?: number;
}

export interface CameraRigProps {
  keyframes: CameraKeyframe[];
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  keyframes,
  children,
  className,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

  let scale = 1;
  let x = 0;
  let y = 0;
  let rotateX = 0;
  let rotateY = 0;

  for (const kf of sorted) {
    const progress =
      kf.frame <= 0
        ? 1
        : spring({
            frame: frame - kf.frame,
            fps,
            config: {
              damping: 24,
              stiffness: 120,
              mass: 0.8,
            },
          });

    if (kf.scale !== undefined) {
      scale += (kf.scale - scale) * progress;
    }
    if (kf.x !== undefined) {
      x += (kf.x - x) * progress;
    }
    if (kf.y !== undefined) {
      y += (kf.y - y) * progress;
    }
    if (kf.rotateX !== undefined) {
      rotateX += (kf.rotateX - rotateX) * progress;
    }
    if (kf.rotateY !== undefined) {
      rotateY += (kf.rotateY - rotateY) * progress;
    }
  }

  return (
    <AbsoluteFill
      className={className}
      style={{
        perspective: "1200px",
        overflow: "hidden",
        ...style,
      }}
    >
      <AbsoluteFill
        style={{
          transform: `translate3d(${x}px, ${y}px, 0px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformOrigin: "center center",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

