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
import { SfxCue } from "../../lib/motion-craft";
import { Scene1Home } from "./Scene1Home";
import { Scene2Services } from "./Scene2Services";
import { Scene3SearchModal } from "./Scene3SearchModal";
import { Scene4TrustProcess } from "./Scene4TrustProcess";
import { Scene5ContactCTA } from "./Scene5ContactCTA";

export const CP_SCENE_DURATIONS = {
  home: 240,
  services: 450,
  searchModal: 510,
  trustProcess: 420,
  contactCta: 420,
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
              backgroundColor: "rgba(148, 163, 184, 0.22)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${p * 100}%`,
                height: "100%",
                borderRadius: 9999,
                background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
                boxShadow: "0 0 10px rgba(56, 189, 248, 0.7)",
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
  const opacity = interpolate(frame, [0, 5, 16], [0, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 50%, rgba(186, 230, 253, 0.75) 0%, rgba(56, 189, 248, 0.35) 42%, transparent 75%)",
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
    <AbsoluteFill style={{ backgroundColor: "#040812" }}>
      {/* Background Music (BGM) */}
      <Audio
        src={staticFile("audio/songs/B26-framer-linear-saas-groove.wav")}
        volume={0.14}
        loop
      />

      <Series>
        <Series.Sequence durationInFrames={CP_SCENE_DURATIONS.home}>
          <Scene1Home />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CP_SCENE_DURATIONS.services}>
          <Scene2Services />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CP_SCENE_DURATIONS.searchModal}>
          <Scene3SearchModal />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CP_SCENE_DURATIONS.trustProcess}>
          <Scene4TrustProcess />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CP_SCENE_DURATIONS.contactCta}>
          <Scene5ContactCTA />
        </Series.Sequence>
      </Series>

      {/* Smooth Transition Glow & SFX at Scene Boundaries */}
      {STARTS.slice(1).map((s) => (
        <Sequence key={`glow-${s}`} from={s - 5} durationInFrames={16}>
          <SceneCutGlow />
        </Sequence>
      ))}
      {STARTS.slice(1).map((s) => (
        <React.Fragment key={`sfx-${s}`}>
          <SfxCue frame={s - 5} sfx="transition-whoosh-soft" volume={0.36} />
          <SfxCue frame={s - 1} sfx="transition-swoosh" volume={0.3} />
        </React.Fragment>
      ))}

      <StoryProgressBar />
    </AbsoluteFill>
  );
};
