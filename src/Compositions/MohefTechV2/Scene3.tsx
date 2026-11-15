import React from "react";
import { SCENE_COPY, SCENE_FRAMES } from "./constants";
import { SceneShell } from "./SceneShell";

export const Scene3: React.FC = () => {
  return (
    <SceneShell
      label={SCENE_COPY.s3.label}
      headline={SCENE_COPY.s3.headline}
      accentWords={SCENE_COPY.s3.accentWords}
      durationInFrames={SCENE_FRAMES.s3}
    />
  );
};

