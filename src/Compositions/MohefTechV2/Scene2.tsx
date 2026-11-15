import React from "react";
import { SCENE_COPY, SCENE_FRAMES } from "./constants";
import { SceneShell } from "./SceneShell";

export const Scene2: React.FC = () => {
  return (
    <SceneShell
      label={SCENE_COPY.s2.label}
      headline={SCENE_COPY.s2.headline}
      accentWords={SCENE_COPY.s2.accentWords}
      durationInFrames={SCENE_FRAMES.s2}
    />
  );
};

