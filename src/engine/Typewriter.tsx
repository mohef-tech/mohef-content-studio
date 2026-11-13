import React from "react";
import { Internals, useCurrentFrame } from "remotion";

export interface TypewriterProps {
  text: string;
  startFrame: number;
  speed?: number;
  className?: string;
  cursorClassName?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  startFrame,
  speed = 2,
  className,
  cursorClassName,
}) => {
  const localFrame = useCurrentFrame();
  const absoluteFrame = Internals.useAbsoluteTimelinePosition();
  const sequenceOffset = Math.max(0, absoluteFrame - localFrame);

  // Support both local sequence frame (e.g. 150) and global frame (e.g. 1380 + 150)
  const effectiveStartFrame =
    sequenceOffset > 0 && startFrame >= sequenceOffset
      ? startFrame - sequenceOffset
      : startFrame;

  const safeSpeed = Math.max(1, speed);
  const elapsed = Math.max(0, localFrame - effectiveStartFrame);

  const visibleCount =
    localFrame < effectiveStartFrame
      ? 0
      : Math.min(text.length, Math.floor(elapsed / safeSpeed) + 1);

  const visibleText = text.slice(0, visibleCount);
  const isTyping =
    localFrame >= effectiveStartFrame && visibleCount < text.length;
  const showCursor = isTyping || Math.floor(localFrame / 15) % 2 === 0;

  return (
    <span className={className}>
      {visibleText}
      <span
        className={cursorClassName}
        style={{
          opacity: showCursor ? 1 : 0,
          display: "inline-block",
          marginLeft: "1px",
        }}
      >
        |
      </span>
    </span>
  );
};
