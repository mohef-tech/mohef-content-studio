import React from "react";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { MainVideo } from "./videos/01-cp-moheftech/MainVideo";
import { IsoPromoScene } from "./IsoPromoScene";
import { Scene1_Hook } from "./videos/02-promo-ruang3d/Scene1_Hook";
import { Scene2_Layout } from "./videos/02-promo-ruang3d/Scene2_Layout";
import { Scene3_Lighting } from "./videos/02-promo-ruang3d/Scene3_Lighting";
import { Scene4_CTA } from "./videos/02-promo-ruang3d/Scene4_CTA";
import { PromoRuang3DVideo } from "./videos/02-promo-ruang3d/PromoRuang3DVideo";
import { SCENE_DURATIONS, TOTAL_DURATION } from "./videos/02-promo-ruang3d/lib/constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CpMohefTech"
        component={MainVideo}
        durationInFrames={3360}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="IsoPromo"
        component={IsoPromoScene}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PromoRuang3D-Scene1"
        component={Scene1_Hook}
        durationInFrames={SCENE_DURATIONS.hook}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="PromoRuang3D-Scene2"
        component={Scene2_Layout}
        durationInFrames={SCENE_DURATIONS.layout}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="PromoRuang3D-Scene3"
        component={Scene3_Lighting}
        durationInFrames={SCENE_DURATIONS.lighting}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="PromoRuang3D-Scene4"
        component={Scene4_CTA}
        durationInFrames={SCENE_DURATIONS.cta}
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
      <MyComposition />
    </>
  );
};