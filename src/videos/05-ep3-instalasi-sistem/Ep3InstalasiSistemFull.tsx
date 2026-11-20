import React from 'react';
import { Series } from 'remotion';
import { EP3_DURATIONS, EP3_TOTAL_DURATION } from './constants';
import { Scene1Hook } from './Scene1Hook';
import { Scene2CleanInstall } from './Scene2CleanInstall';
import { Scene3DriversTuning } from './Scene3DriversTuning';
import { Scene4CustomApps } from './Scene4CustomApps';
import { Scene5ClosingCTA } from './Scene5ClosingCTA';

export { EP3_TOTAL_DURATION };

export const Ep3InstalasiSistemFull: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={EP3_DURATIONS.scene1}>
        <Scene1Hook />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP3_DURATIONS.scene2}>
        <Scene2CleanInstall />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP3_DURATIONS.scene3}>
        <Scene3DriversTuning />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP3_DURATIONS.scene4}>
        <Scene4CustomApps />
      </Series.Sequence>
      <Series.Sequence durationInFrames={EP3_DURATIONS.scene5}>
        <Scene5ClosingCTA />
      </Series.Sequence>
    </Series>
  );
};

export default Ep3InstalasiSistemFull;
