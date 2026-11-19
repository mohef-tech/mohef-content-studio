import React from "react";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import {
  CP_TOTAL_DURATION,
  MainVideo,
} from "./videos/01-cp-moheftech/MainVideo";
import { PromoRuang3DVideo } from "./videos/02-promo-ruang3d/PromoRuang3DVideo";
import { TOTAL_DURATION } from "./videos/02-promo-ruang3d/lib/constants";

import {
  EP1_FPS,
  EP1_HEIGHT,
  EP1_WIDTH,
} from "./videos/03-ep1-kelistrikan/constants";
import {
  EP1_TOTAL_DURATION,
  Ep1KelistrikanFull,
} from "./videos/03-ep1-kelistrikan/Ep1KelistrikanFull";
import {
  EP2_DURATIONS,
  EP2_FPS,
  EP2_HEIGHT,
  EP2_WIDTH,
} from "./videos/04-ep2-rakit-pc/constants";
import {
  EP2_PARTS_PREVIEW_DURATION,
  PcPartsPreview,
} from "./videos/04-ep2-rakit-pc/PcPartsPreview";
import { Scene1Hook } from "./videos/04-ep2-rakit-pc/Scene1Hook";
import { Scene2Needs } from "./videos/04-ep2-rakit-pc/Scene2Needs";
import { Scene3Assembly } from "./videos/04-ep2-rakit-pc/Scene3Assembly";
import { Scene4Airflow } from "./videos/04-ep2-rakit-pc/Scene4Airflow";
import { Scene5ClosingCTA } from "./videos/04-ep2-rakit-pc/Scene5ClosingCTA";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CpMohefTech"
        component={MainVideo}
        durationInFrames={CP_TOTAL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="PromoRuang3D-Full"
        component={PromoRuang3DVideo}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="Ep1Kelistrikan-Full"
        component={Ep1KelistrikanFull}
        durationInFrames={EP1_TOTAL_DURATION}
        fps={EP1_FPS}
        width={EP1_WIDTH}
        height={EP1_HEIGHT}
      />

      <Composition
        id="Ep2-PartsPreview"
        component={PcPartsPreview}
        durationInFrames={EP2_PARTS_PREVIEW_DURATION}
        fps={EP2_FPS}
        width={EP2_WIDTH}
        height={EP2_HEIGHT}
      />

      <Composition
        id="Ep2-Scene1"
        component={Scene1Hook}
        durationInFrames={EP2_DURATIONS.scene1}
        fps={EP2_FPS}
        width={EP2_WIDTH}
        height={EP2_HEIGHT}
      />

      <Composition
        id="Ep2-Scene2"
        component={Scene2Needs}
        durationInFrames={EP2_DURATIONS.scene2}
        fps={EP2_FPS}
        width={EP2_WIDTH}
        height={EP2_HEIGHT}
      />

      <Composition
        id="Ep2-Scene3"
        component={Scene3Assembly}
        durationInFrames={EP2_DURATIONS.scene3}
        fps={EP2_FPS}
        width={EP2_WIDTH}
        height={EP2_HEIGHT}
      />

      <Composition
        id="Ep2-Scene4"
        component={Scene4Airflow}
        durationInFrames={EP2_DURATIONS.scene4}
        fps={EP2_FPS}
        width={EP2_WIDTH}
        height={EP2_HEIGHT}
      />

      <Composition
        id="Ep2-Scene5"
        component={Scene5ClosingCTA}
        durationInFrames={EP2_DURATIONS.scene5}
        fps={EP2_FPS}
        width={EP2_WIDTH}
        height={EP2_HEIGHT}
      />
      <MyComposition />
    </>
  );
};
