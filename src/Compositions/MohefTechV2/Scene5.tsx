import React from "react";
import { SCENE_COPY, SCENE_FRAMES } from "./constants";
import { SceneShell } from "./SceneShell";

export const Scene5: React.FC = () => {
  return (
    <SceneShell
      label={SCENE_COPY.s5.label}
      headline={SCENE_COPY.s5.headline}
      accentWords={SCENE_COPY.s5.accentWords}
      durationInFrames={SCENE_FRAMES.s5}
    />
  );
};

