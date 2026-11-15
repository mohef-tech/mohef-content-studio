import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SfxCue } from "../../lib/motion-craft";
import {
  COLORS,
  FONT_FAMILY,
  FONT_WEIGHTS,
  LAYOUT,
  sec,
  SFX,
  SOLID_SHADOW,
  SPRING_CONFIG,
  TIMING_FRAMES,
  TIMING_SECONDS,
} from "./constants";

export interface SceneShellProps {
  label: string;
  headline: string;
  accentWords?: readonly string[];
  durationInFrames?: number;
  labelStartSec?: number;
  headlineStartSec?: number;
  wordStaggerSec?: number;
  accentPunchScale?: number;
  accentPunchDurationSec?: number;
  accentWhooshSfx?: string;
  children?: React.ReactNode;
}

export const SceneShell: React.FC<SceneShellProps> = ({
  label,
  headline,
  accentWords,
  durationInFrames,
  labelStartSec = 0,
  headlineStartSec = 0,
  wordStaggerSec = TIMING_SECONDS.wordStagger,
  accentPunchScale = 1,
  accentPunchDurationSec = 0.4,
  accentWhooshSfx,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: configDuration } = useVideoConfig();
  const totalFrames = durationInFrames ?? configDuration;

  const exitStart = Math.max(1, totalFrames - TIMING_FRAMES.exitDuration);
  const exitOpacity = interpolate(frame, [exitStart, totalFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitY = interpolate(frame, [exitStart, totalFrames], [0, -36], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(frame, [exitStart, totalFrames], [1, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const labelStartFrame = sec(labelStartSec);
  const labelSpring = spring({
    frame: Math.max(0, frame - labelStartFrame),
    fps,
    config: SPRING_CONFIG.card,
  });

  const labelOpacity =
    interpolate(labelSpring, [0, 1], [0.25, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * exitOpacity;

  const labelYOffset =
    interpolate(labelSpring, [0, 1], [20, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) + exitY;

  const labelScale =
    interpolate(labelSpring, [0, 1], [0.92, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * exitScale;

  const words = headline.trim().toUpperCase().split(/\s+/);
  const normalizedAccents = (accentWords ?? []).map((w) =>
    w.replace(/[^A-Z0-9]/gi, "").toUpperCase()
  );
  const headlineStartFrame = sec(headlineStartSec);
  const wordStaggerFrames = Math.max(1, sec(wordStaggerSec));
  const punchDurFrames = Math.max(2, sec(accentPunchDurationSec));

  const firstAccentIndex = words.findIndex((word, idx) => {
    const cleanWord = word.replace(/[^A-Z0-9]/gi, "");
    return normalizedAccents.length > 0
      ? normalizedAccents.includes(cleanWord)
      : idx === words.length - 1;
  });
  const accentSfxFrame =
    firstAccentIndex >= 0
      ? Math.max(1, headlineStartFrame + firstAccentIndex * wordStaggerFrames)
      : 1;

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT_FAMILY,
        pointerEvents: "none",
      }}
    >
      <SfxCue
        frame={Math.max(1, labelStartFrame)}
        sfx={SFX.sceneEnter}
        volume={SFX.volume}
      />
      {accentWhooshSfx && firstAccentIndex >= 0 && (
        <SfxCue
          frame={accentSfxFrame}
          sfx={accentWhooshSfx}
          volume={SFX.volume}
        />
      )}

      {/* Label Pill (y=140, height=72, font=38, pill putih teks ink) */}
      <div
        style={{
          position: "absolute",
          left: LAYOUT.safeXMin,
          top: LAYOUT.labelY,
          height: LAYOUT.labelHeight,
          paddingLeft: LAYOUT.labelPaddingX,
          paddingRight: LAYOUT.labelPaddingX,
          borderRadius: LAYOUT.labelRadius,
          backgroundColor: COLORS.white,
          border: `${LAYOUT.borderWidth}px solid ${COLORS.ink}`,
          boxShadow: SOLID_SHADOW,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: FONT_WEIGHTS.label,
          fontSize: LAYOUT.labelFontSize,
          color: COLORS.ink,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          opacity: labelOpacity,
          transform: `translate3d(0, ${labelYOffset}px, 0) scale(${labelScale})`,
          transformOrigin: "left center",
        }}
      >
        {label}
      </div>

      {/* Headline (y=250, font=92, line-height=1.05, maks 3 baris, per kata spring + underline oranye) */}
      <div
        style={{
          position: "absolute",
          left: LAYOUT.safeXMin,
          top: LAYOUT.headlineY,
          width: LAYOUT.safeWidth,
          maxHeight: Math.ceil(
            LAYOUT.headlineFontSize *
              LAYOUT.headlineLineHeight *
              LAYOUT.headlineMaxLines +
              LAYOUT.underlineHeight * 3
          ),
          display: "flex",
          flexWrap: "wrap",
          columnGap: LAYOUT.headlineWordGap,
          rowGap: LAYOUT.headlineRowGap,
          alignItems: "flex-start",
          transform: `translate3d(0, ${exitY}px, 0) scale(${exitScale})`,
          transformOrigin: "left top",
        }}
      >
        {words.map((word, idx) => {
          const cleanWord = word.replace(/[^A-Z0-9]/gi, "");
          const isAccent =
            normalizedAccents.length > 0
              ? normalizedAccents.includes(cleanWord)
              : idx === words.length - 1;

          const wordStart = idx * TIMING_FRAMES.wordStagger;
          const wSpring = spring({
            frame: Math.max(0, frame - wordStart),
            fps,
            config: SPRING_CONFIG.word,
          });

          const wOpacity =
            interpolate(wSpring, [0, 1], [0.2, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }) * exitOpacity;

          const wY = interpolate(wSpring, [0, 1], [28, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const wScale = interpolate(wSpring, [0, 1], [0.88, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const underlineStart = wordStart + TIMING_FRAMES.underlineDelay;
          const underlineEnd = underlineStart + TIMING_FRAMES.underlineDuration;
          const underlineScale = interpolate(
            frame,
            [underlineStart, underlineEnd],
            [0.05, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          return (
            <div
              key={`${word}-${idx}`}
              style={{
                position: "relative",
                display: "inline-flex",
                flexDirection: "column",
                opacity: wOpacity,
                transform: `translate3d(0, ${wY}px, 0) scale(${wScale})`,
                transformOrigin: "left bottom",
              }}
            >
              <span
                style={{
                  fontWeight: FONT_WEIGHTS.headline,
                  fontSize: LAYOUT.headlineFontSize,
                  lineHeight: LAYOUT.headlineLineHeight,
                  color: isAccent ? COLORS.accent : COLORS.white,
                  textTransform: "uppercase",
                  textShadow: `6px 6px 0px ${COLORS.ink}`,
                  letterSpacing: "-0.02em",
                }}
              >
                {word}
              </span>
              {isAccent && (
                <div
                  style={{
                    marginTop: LAYOUT.underlineOffset,
                    width: "100%",
                    height: LAYOUT.underlineHeight,
                    borderRadius: LAYOUT.labelRadius,
                    backgroundColor: COLORS.accent,
                    boxShadow: `4px 4px 0px ${COLORS.ink}`,
                    transform: `scaleX(${underlineScale})`,
                    transformOrigin: "left center",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Safe Area Children Container (x: 60..920, y: contentTopY..1520) */}
      {children && (
        <div
          style={{
            position: "absolute",
            left: LAYOUT.safeXMin,
            top: LAYOUT.contentTopY,
            width: LAYOUT.safeWidth,
            height: LAYOUT.safeYMax - LAYOUT.contentTopY,
            opacity: exitOpacity,
            transform: `translate3d(0, ${exitY}px, 0) scale(${exitScale})`,
            transformOrigin: "center top",
          }}
        >
          {children}
        </div>
      )}
    </AbsoluteFill>
  );
};

