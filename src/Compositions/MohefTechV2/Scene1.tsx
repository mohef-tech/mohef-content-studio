import React from "react";
import { SCENE_COPY, SCENE_FRAMES } from "./constants";
import { SceneShell } from "./SceneShell";

export const Scene1: React.FC = () => {
  return (
    <SceneShell
      label={SCENE_COPY.s1.label}
      headline={SCENE_COPY.s1.headline}
      accentWords={SCENE_COPY.s1.accentWords}
      durationInFrames={SCENE_FRAMES.s1}
    />
  );
};

