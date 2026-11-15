import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

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

  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

  // Fill in resolved values for each keyframe so every keyframe has all 5 properties
  const resolved: Required<CameraKeyframe>[] = [];
  let curScale = 1;
  let curX = 0;
  let curY = 0;
  let curRx = 0;
  let curRy = 0;

  for (const kf of sorted) {
    if (kf.scale !== undefined) curScale = kf.scale;
    if (kf.x !== undefined) curX = kf.x;
    if (kf.y !== undefined) curY = kf.y;
    if (kf.rotateX !== undefined) curRx = kf.rotateX;
    if (kf.rotateY !== undefined) curRy = kf.rotateY;
    resolved.push({
      frame: kf.frame,
      scale: curScale,
      x: curX,
      y: curY,
      rotateX: curRx,
      rotateY: curRy,
    });
  }

  let scale = 1;
  let x = 0;
  let y = 0;
  let rotateX = 0;
  let rotateY = 0;

  if (resolved.length > 0) {
    if (frame <= resolved[0].frame) {
      ({ scale, x, y, rotateX, rotateY } = resolved[0]);
    } else if (frame >= resolved[resolved.length - 1].frame) {
      ({ scale, x, y, rotateX, rotateY } = resolved[resolved.length - 1]);
    } else {
      for (let i = 0; i < resolved.length - 1; i++) {
        const k0 = resolved[i];
        const k1 = resolved[i + 1];
        if (frame >= k0.frame && frame <= k1.frame) {
          if (k1.frame === k0.frame) {
            ({ scale, x, y, rotateX, rotateY } = k1);
          } else {
            const t = interpolate(frame, [k0.frame, k1.frame], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.25, 0.9, 0.3, 1),
            });
            scale = k0.scale + (k1.scale - k0.scale) * t;
            x = k0.x + (k1.x - k0.x) * t;
            y = k0.y + (k1.y - k0.y) * t;
            rotateX = k0.rotateX + (k1.rotateX - k0.rotateX) * t;
            rotateY = k0.rotateY + (k1.rotateY - k0.rotateY) * t;
          }
          break;
        }
      }
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
