import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Scene1Home } from "./Scene1Home";
import { Scene2Services } from "./Scene2Services";
import { Scene3SearchModal } from "./Scene3SearchModal";

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#040812" }}>
      <Sequence from={0} durationInFrames={600}>
        <Scene1Home />
      </Sequence>
      <Sequence from={600} durationInFrames={780}>
        <Scene2Services />
      </Sequence>
      <Sequence from={1380} durationInFrames={840}>
        <Scene3SearchModal />
      </Sequence>
    </AbsoluteFill>
  );
};
