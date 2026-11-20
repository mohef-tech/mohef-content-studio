import React from 'react';
import { Series } from 'remotion';
import { EP2_DURATIONS, EP2_TOTAL_DURATION } from './constants';
import { Scene1Hook } from './Scene1Hook';
import { Scene2Needs } from './Scene2Needs';
import { Scene3Assembly } from './Scene3Assembly';
import { Scene4Airflow } from './Scene4Airflow';
import { Scene5ClosingCTA } from './Scene5ClosingCTA';

export { EP2_TOTAL_DURATION };

export const Ep2RakitPcFull: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={EP2_DURATIONS.scene1}>
        <Scene1Hook />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP2_DURATIONS.scene2}>
        <Scene2Needs />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP2_DURATIONS.scene3}>
        <Scene3Assembly />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP2_DURATIONS.scene4}>
        <Scene4Airflow />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP2_DURATIONS.scene5}>
        <Scene5ClosingCTA />
      </Series.Sequence>
    </Series>
  );
};

export default Ep2RakitPcFull;
