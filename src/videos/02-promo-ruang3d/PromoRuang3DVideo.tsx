import React from 'react';
import {
    AbsoluteFill,
    Audio,
    interpolate,
    Sequence,
    Series,
    staticFile,
    useCurrentFrame,
} from 'remotion';
import { Scene1_Hook } from './Scene1_Hook';
import { Scene2_Layout } from './Scene2_Layout';
import { Scene3_Lighting } from './Scene3_Lighting';
import { Scene4_CTA } from './Scene4_CTA';
import { SfxCue } from '../../lib/motion-craft';
import { SCENE_DURATIONS } from './lib/constants';

const ORDER = [
    SCENE_DURATIONS.hook,
    SCENE_DURATIONS.layout,
    SCENE_DURATIONS.lighting,
    SCENE_DURATIONS.cta,
];
// frame awal tiap scene
const STARTS = ORDER.map((_, i) => ORDER.slice(0, i).reduce((a, b) => a + b, 0));

/** Bar progres ala Stories di atas layar */
const StoryProgress: React.FC = () => {
    const frame = useCurrentFrame();
    return (
        <div style={{ position: 'absolute', top: 56, left: 70, right: 70, display: 'flex', gap: 10 }}>
            {ORDER.map((dur, i) => {
                const p = interpolate(frame, [STARTS[i], STARTS[i] + dur], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                });
                return (
                    <div key={i} style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
                        <div style={{ width: `${p * 100}%`, height: '100%', backgroundColor: '#ffffff' }} />
                    </div>
                );
            })}
        </div>
    );
};

/** Kilatan cahaya lembut tepat di titik potong antar scene */
const CutGlow: React.FC = () => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 5, 14], [0, 0.4, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return (
        <AbsoluteFill
            style={{
                background: 'radial-gradient(circle at 50% 50%, #e0f2fe 0%, rgba(56,189,248,0.5) 40%, transparent 75%)',
                opacity,
                mixBlendMode: 'screen',
            }}
        />
    );
};

export const PromoRuang3DVideo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#03060e' }}>
            {/* Musik Latar (BGM) */}
            <Audio src={staticFile('audio/songs/B25-apple-keynote-pluck.wav')} volume={0.14} loop />

            <Series>
                <Series.Sequence durationInFrames={SCENE_DURATIONS.hook}>
                    <Scene1_Hook />
                </Series.Sequence>
                <Series.Sequence
                    durationInFrames={SCENE_DURATIONS.layout}
                    style={{
                        translate: '2px 0px'
                    }}
                >
                    <Scene2_Layout />
                </Series.Sequence>
                <Series.Sequence durationInFrames={SCENE_DURATIONS.lighting}>
                    <Scene3_Lighting />
                </Series.Sequence>
                <Series.Sequence durationInFrames={SCENE_DURATIONS.cta}>
                    <Scene4_CTA />
                </Series.Sequence>
            </Series>

            {/* transisi di tiap batas scene */}
            {STARTS.slice(1).map((s) => (
                <Sequence key={s} from={s - 5} durationInFrames={16}>
                    <CutGlow />
                </Sequence>
            ))}
            {STARTS.slice(1).map((s) => (
                <React.Fragment key={`sfx-${s}`}>
                    <SfxCue frame={s - 6} sfx="transition-whoosh-soft" volume={0.42} />
                    <SfxCue frame={s - 2} sfx="transition-swoosh" volume={0.35} />
                </React.Fragment>
            ))}

            <StoryProgress />
        </AbsoluteFill>
    );
};
