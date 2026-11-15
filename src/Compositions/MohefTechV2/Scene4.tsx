import React from "react";
import { SCENE_COPY, SCENE_FRAMES } from "./constants";
import { SceneShell } from "./SceneShell";

export const Scene4: React.FC = () => {
  return (
    <SceneShell
      label={SCENE_COPY.s4.label}
      headline={SCENE_COPY.s4.headline}
      accentWords={SCENE_COPY.s4.accentWords}
      durationInFrames={SCENE_FRAMES.s4}
    />
  );
};

