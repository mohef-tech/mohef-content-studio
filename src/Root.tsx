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
  EP2_TOTAL_DURATION,
  EP2_WIDTH,
} from "./videos/04-ep2-rakit-pc/constants";
import { Ep2RakitPcFull } from "./videos/04-ep2-rakit-pc/Ep2RakitPcFull";
import {
  EP2_PARTS_PREVIEW_DURATION,
  PcPartsPreview,
} from "./videos/04-ep2-rakit-pc/PcPartsPreview";
import { Scene1Hook } from "./videos/04-ep2-rakit-pc/Scene1Hook";
import { Scene2Needs } from "./videos/04-ep2-rakit-pc/Scene2Needs";
import { Scene3Assembly } from "./videos/04-ep2-rakit-pc/Scene3Assembly";
import { Scene4Airflow } from "./videos/04-ep2-rakit-pc/Scene4Airflow";
import { Scene5ClosingCTA } from "./videos/04-ep2-rakit-pc/Scene5ClosingCTA";
import {
  EP3_FPS,
  EP3_HEIGHT,
  EP3_TOTAL_DURATION,
  EP3_WIDTH,
  SCENE1_DURATION_FRAMES as EP3_SCENE1_DURATION,
  SCENE2_DURATION_FRAMES as EP3_SCENE2_DURATION,
  SCENE3_DURATION_FRAMES as EP3_SCENE3_DURATION,
  SCENE4_DURATION_FRAMES as EP3_SCENE4_DURATION,
  SCENE5_DURATION_FRAMES as EP3_SCENE5_DURATION,
} from "./videos/05-ep3-instalasi-sistem/constants";
import { Ep3InstalasiSistemFull } from "./videos/05-ep3-instalasi-sistem/Ep3InstalasiSistemFull";
import { Scene1Hook as Ep3Scene1Hook } from "./videos/05-ep3-instalasi-sistem/Scene1Hook";
import { Scene2CleanInstall as Ep3Scene2CleanInstall } from "./videos/05-ep3-instalasi-sistem/Scene2CleanInstall";
import { Scene3DriversTuning as Ep3Scene3DriversTuning } from "./videos/05-ep3-instalasi-sistem/Scene3DriversTuning";
import { Scene4CustomApps as Ep3Scene4CustomApps } from "./videos/05-ep3-instalasi-sistem/Scene4CustomApps";
import { Scene5ClosingCTA as Ep3Scene5ClosingCTA } from "./videos/05-ep3-instalasi-sistem/Scene5ClosingCTA";

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
        id="Ep2RakitPc-Full"
        component={Ep2RakitPcFull}
        durationInFrames={EP2_TOTAL_DURATION}
        fps={EP2_FPS}
        width={EP2_WIDTH}
        height={EP2_HEIGHT}
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

      <Composition
        id="Ep3InstalasiSistem-Full"
        component={Ep3InstalasiSistemFull}
        durationInFrames={EP3_TOTAL_DURATION}
        fps={EP3_FPS}
        width={EP3_WIDTH}
        height={EP3_HEIGHT}
      />

      <Composition
        id="Ep3-Scene1"
        component={Ep3Scene1Hook}
        durationInFrames={EP3_SCENE1_DURATION}
        fps={EP3_FPS}
        width={EP3_WIDTH}
        height={EP3_HEIGHT}
      />

      <Composition
        id="Ep3-Scene2"
        component={Ep3Scene2CleanInstall}
        durationInFrames={EP3_SCENE2_DURATION}
        fps={EP3_FPS}
        width={EP3_WIDTH}
        height={EP3_HEIGHT}
      />

      <Composition
        id="Ep3-Scene3"
        component={Ep3Scene3DriversTuning}
        durationInFrames={EP3_SCENE3_DURATION}
        fps={EP3_FPS}
        width={EP3_WIDTH}
        height={EP3_HEIGHT}
      />

      <Composition
        id="Ep3-Scene4"
        component={Ep3Scene4CustomApps}
        durationInFrames={EP3_SCENE4_DURATION}
        fps={EP3_FPS}
        width={EP3_WIDTH}
        height={EP3_HEIGHT}
      />

      <Composition
        id="Ep3-Scene5"
        component={Ep3Scene5ClosingCTA}
        durationInFrames={EP3_SCENE5_DURATION}
        fps={EP3_FPS}
        width={EP3_WIDTH}
        height={EP3_HEIGHT}
      />
      <MyComposition />
    </>
  );
};
