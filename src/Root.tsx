import React from "react";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import {
  CP_SCENE_DURATIONS,
  CP_TOTAL_DURATION,
  MainVideo,
} from "./videos/01-cp-moheftech/MainVideo";
import { Scene1Home } from "./videos/01-cp-moheftech/Scene1Home";
import { Scene2Services } from "./videos/01-cp-moheftech/Scene2Services";
import { Scene3SearchModal } from "./videos/01-cp-moheftech/Scene3SearchModal";
import { Scene4TrustProcess } from "./videos/01-cp-moheftech/Scene4TrustProcess";
import { Scene5ContactCTA } from "./videos/01-cp-moheftech/Scene5ContactCTA";
import { IsoPromoScene } from "./IsoPromoScene";
import { Scene1_Hook } from "./videos/02-promo-ruang3d/Scene1_Hook";
import { Scene2_Layout } from "./videos/02-promo-ruang3d/Scene2_Layout";
import { Scene3_Lighting } from "./videos/02-promo-ruang3d/Scene3_Lighting";
import { Scene4_CTA } from "./videos/02-promo-ruang3d/Scene4_CTA";
import { PromoRuang3DVideo } from "./videos/02-promo-ruang3d/PromoRuang3DVideo";
import { SCENE_DURATIONS, TOTAL_DURATION } from "./videos/02-promo-ruang3d/lib/constants";
import {
  FPS as MT_V2_FPS,
  HEIGHT as MT_V2_HEIGHT,
  TOTAL_FRAMES as MT_V2_TOTAL_FRAMES,
  WIDTH as MT_V2_WIDTH,
} from "./Compositions/MohefTechV2/constants";
import { MohefTechV2 } from "./Compositions/MohefTechV2/MohefTechV2";
import {
  EP1_DURATIONS,
  EP1_FPS,
  EP1_HEIGHT,
  EP1_WIDTH,
} from "./videos/03-ep1-kelistrikan/constants";
import { Scene1HookXRay } from "./videos/03-ep1-kelistrikan/Scene1HookXRay";
import { Scene2FondasiDaya } from "./videos/03-ep1-kelistrikan/Scene2FondasiDaya";
import { Scene3Stopkontak } from "./videos/03-ep1-kelistrikan/Scene3Stopkontak";
import { Scene4ProteksiUPS } from "./videos/03-ep1-kelistrikan/Scene4ProteksiUPS";
import { Scene5ManajemenKabel } from "./videos/03-ep1-kelistrikan/Scene5ManajemenKabel";
import {
  EP1_TOTAL_DURATION,
  Ep1KelistrikanFull,
} from "./videos/03-ep1-kelistrikan/Ep1KelistrikanFull";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CpMohefTech"
        component={MainVideo}
        durationInFrames={CP_TOTAL_DURATION}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="CpMohefTech-Scene1"
        component={Scene1Home}
        durationInFrames={CP_SCENE_DURATIONS.home}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="CpMohefTech-Scene2"
        component={Scene2Services}
        durationInFrames={CP_SCENE_DURATIONS.services}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="CpMohefTech-Scene3"
        component={Scene3SearchModal}
        durationInFrames={CP_SCENE_DURATIONS.searchModal}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="CpMohefTech-Scene4"
        component={Scene4TrustProcess}
        durationInFrames={CP_SCENE_DURATIONS.trustProcess}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="CpMohefTech-Scene5"
        component={Scene5ContactCTA}
        durationInFrames={CP_SCENE_DURATIONS.contactCta}
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
      <Composition
        id="MohefTechV2"
        component={MohefTechV2}
        durationInFrames={MT_V2_TOTAL_FRAMES}
        fps={MT_V2_FPS}
        width={MT_V2_WIDTH}
        height={MT_V2_HEIGHT}
      />
      <Composition
        id="Ep1-Scene1"
        component={Scene1HookXRay}
        durationInFrames={EP1_DURATIONS.scene1}
        fps={EP1_FPS}
        width={EP1_WIDTH}
        height={EP1_HEIGHT}
      />
      <Composition
        id="Ep1-Scene2"
        component={Scene2FondasiDaya}
        durationInFrames={EP1_DURATIONS.scene2}
        fps={EP1_FPS}
        width={EP1_WIDTH}
        height={EP1_HEIGHT}
      />
      <Composition
        id="Ep1-Scene3"
        component={Scene3Stopkontak}
        durationInFrames={EP1_DURATIONS.scene3}
        fps={EP1_FPS}
        width={EP1_WIDTH}
        height={EP1_HEIGHT}
      />
      <Composition
        id="Ep1-Scene4"
        component={Scene4ProteksiUPS}
        durationInFrames={EP1_DURATIONS.scene4}
        fps={EP1_FPS}
        width={EP1_WIDTH}
        height={EP1_HEIGHT}
      />
      <Composition
        id="Ep1-Scene5"
        component={Scene5ManajemenKabel}
        durationInFrames={EP1_DURATIONS.scene5}
        fps={EP1_FPS}
        width={EP1_WIDTH}
        height={EP1_HEIGHT}
      />
      <Composition
        id="Ep1Kelistrikan-Full"
        component={Ep1KelistrikanFull}
        durationInFrames={EP1_TOTAL_DURATION}
        fps={EP1_FPS}
        width={EP1_WIDTH}
        height={EP1_HEIGHT}
      />
      <MyComposition />
    </>
  );
};
