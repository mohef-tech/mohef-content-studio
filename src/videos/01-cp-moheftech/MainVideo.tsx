import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  Series,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { SCENE1_DURATION, Scene1Home } from "./Scene1Home";
import { SCENE2_DURATION, Scene2Services } from "./Scene2Services";
import { SCENE3_DURATION, Scene3SearchModal } from "./Scene3SearchModal";
import { SCENE4_DURATION, Scene4TrustProcess } from "./Scene4TrustProcess";
import { SCENE5_DURATION, Scene5ContactCTA } from "./Scene5ContactCTA";

export const CP_SCENE_DURATIONS = {
  home: SCENE1_DURATION,
  services: SCENE2_DURATION,
  searchModal: SCENE3_DURATION,
  trustProcess: SCENE4_DURATION,
  contactCta: SCENE5_DURATION,
} as const;

export const CP_TOTAL_DURATION =
  CP_SCENE_DURATIONS.home +
  CP_SCENE_DURATIONS.services +
  CP_SCENE_DURATIONS.searchModal +
  CP_SCENE_DURATIONS.trustProcess +
  CP_SCENE_DURATIONS.contactCta;

const ORDER = [
  CP_SCENE_DURATIONS.home,
  CP_SCENE_DURATIONS.services,
  CP_SCENE_DURATIONS.searchModal,
  CP_SCENE_DURATIONS.trustProcess,
  CP_SCENE_DURATIONS.contactCta,
];

const STARTS = ORDER.map((_, i) =>
  ORDER.slice(0, i).reduce((acc, val) => acc + val, 0)
);

/** Segmented Reel/Story Progress Bar at top of vertical frame */
const StoryProgressBar: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        left: 56,
        right: 56,
        zIndex: 90,
        display: "flex",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {ORDER.map((dur, idx) => {
        const p = interpolate(
          frame,
          [STARTS[idx], STARTS[idx] + dur],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

        return (
          <div
            key={idx}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 9999,
              backgroundColor: "rgba(10, 42, 53, 0.16)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${p * 100}%`,
                height: "100%",
                borderRadius: 9999,
                background: "linear-gradient(90deg, #0056D2, #10B981)",
                boxShadow: "0 0 8px rgba(0, 86, 210, 0.45)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

/** Subtle light pulse at scene transitions */
const SceneCutGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 5, 14], [0, 0.18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.85) 0%, rgba(186, 230, 253, 0.4) 45%, transparent 75%)",
        opacity,
        mixBlendMode: "screen",
        pointerEvents: "none",
        zIndex: 80,
      }}
    />
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#E8F3FB" }}>
      {/* BGM Berkesinambungan 1 kesatuan video (Scene 1-5 @ 30fps) */}
      <Audio
        src={staticFile("audio/songs/B25-apple-keynote-pluck.wav")}
        volume={0.48}
        loop
      />

      <Series>
        <Series.Sequence durationInFrames={CP_SCENE_DURATIONS.home}>
          <Scene1Home withBgm={false} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CP_SCENE_DURATIONS.services}>
          <Scene2Services withBgm={false} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CP_SCENE_DURATIONS.searchModal}>
          <Scene3SearchModal withBgm={false} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CP_SCENE_DURATIONS.trustProcess}>
          <Scene4TrustProcess withBgm={false} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CP_SCENE_DURATIONS.contactCta}>
          <Scene5ContactCTA withBgm={false} />
        </Series.Sequence>
      </Series>

      {/* Subtle visual glow at scene boundaries */}
      {STARTS.slice(1).map((s) => (
        <Sequence key={`glow-${s}`} from={s - 5} durationInFrames={14}>
          <SceneCutGlow />
        </Sequence>
      ))}

      <StoryProgressBar />
    </AbsoluteFill>
  );
};
