import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SfxCue } from "../../lib/motion-craft";
import { Background } from "./Background";
import {
  COLORS,
  FONT_FAMILY,
  SCENE_FRAMES,
  SCENE_START_LIST,
  SCENE_STARTS,
  SFX,
} from "./constants";
import { LogoBadge } from "./LogoBadge";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4 } from "./Scene4";
import { Scene5 } from "./Scene5";

export const MohefTechV2: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily: FONT_FAMILY,
        overflow: "hidden",
      }}
    >
      {/* Background di bawah semua scene */}
      <Background />

      {/* Scene 1..5 berurutan lewat <Sequence> tanpa tumpang tindih */}
      <Sequence from={SCENE_STARTS.s1} durationInFrames={SCENE_FRAMES.s1}>
        <Scene1 />
      </Sequence>

      <Sequence from={SCENE_STARTS.s2} durationInFrames={SCENE_FRAMES.s2}>
        <Scene2 />
      </Sequence>

      <Sequence from={SCENE_STARTS.s3} durationInFrames={SCENE_FRAMES.s3}>
        <Scene3 />
      </Sequence>

      <Sequence from={SCENE_STARTS.s4} durationInFrames={SCENE_FRAMES.s4}>
        <Scene4 />
      </Sequence>

      <Sequence from={SCENE_STARTS.s5} durationInFrames={SCENE_FRAMES.s5}>
        <Scene5 />
      </Sequence>

      {/* LogoBadge di pojok kiri atas (y=60), memantul saat scene berganti */}
      <LogoBadge />

      {/* SFX transisi saat pergantian scene */}
      {SCENE_START_LIST.slice(1).map((startFrame) => (
        <SfxCue
          key={`scene-cut-sfx-${startFrame}`}
          frame={startFrame}
          sfx={SFX.sceneTransition}
          volume={SFX.volume}
        />
      ))}
    </AbsoluteFill>
  );
};

