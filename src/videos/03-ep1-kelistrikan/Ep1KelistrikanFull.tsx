import React from 'react';
import { Series } from 'remotion';
import { EP1_DURATIONS } from './constants';
import { Scene1HookXRay } from './Scene1HookXRay';
import { Scene2FondasiDaya } from './Scene2FondasiDaya';
import { Scene3Stopkontak } from './Scene3Stopkontak';
import { Scene4ProteksiUPS } from './Scene4ProteksiUPS';
import { Scene5ManajemenKabel } from './Scene5ManajemenKabel';

export const EP1_TOTAL_DURATION =
  EP1_DURATIONS.scene1 +
  EP1_DURATIONS.scene2 +
  EP1_DURATIONS.scene3 +
  EP1_DURATIONS.scene4 +
  EP1_DURATIONS.scene5;

export const Ep1KelistrikanFull: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={EP1_DURATIONS.scene1}>
        <Scene1HookXRay />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP1_DURATIONS.scene2}>
        <Scene2FondasiDaya />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP1_DURATIONS.scene3}>
        <Scene3Stopkontak />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP1_DURATIONS.scene4}>
        <Scene4ProteksiUPS />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP1_DURATIONS.scene5}>
        <Scene5ManajemenKabel />
      </Series.Sequence>
    </Series>
  );
};
