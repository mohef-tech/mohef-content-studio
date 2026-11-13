import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, MONO } from './lib/constants';

interface StudioBackgroundProps {
    badgeText?: string;
    /** warna aura utama di belakang ruangan */
    accent?: string;
    /** warna aura kedua */
    accent2?: string;
    /** 0..1 lapisan gelap (mode malam) */
    darken?: number;
    /** tampilkan bar info bawah */
    hud?: boolean;
    hudTone?: string;
}

export const StudioBackground: React.FC<StudioBackgroundProps> = ({
    badgeText = 'AREA: 4.0m × 4.0m • MODE ISOMETRIK',
    accent = '#0ea5e9',
    accent2 = '#6366f1',
    darken = 0,
    hud = true,
    hudTone = COLORS.cyan,
}) => {
    const frame = useCurrentFrame();
    const gridOffset = frame * 0.5;
    const t = frame / 30;
    const recOn = Math.floor(frame / 15) % 2 === 0;

    return (
        <AbsoluteFill
            style={{
                background: 'radial-gradient(circle at 50% 55%, #10203f 0%, #070d1c 55%, #03060e 100%)',
                overflow: 'hidden',
            }}
        >
            {/* Aura warna yang melayang pelan */}
            <div
                style={{
                    position: 'absolute',
                    left: 540 + Math.sin(t * 0.6) * 140 - 450,
                    top: 980 + Math.cos(t * 0.5) * 90 - 450,
                    width: 900,
                    height: 900,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${accent}55 0%, transparent 65%)`,
                    filter: 'blur(30px)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: 540 + Math.cos(t * 0.45) * 260 - 380,
                    top: 560 + Math.sin(t * 0.7) * 120 - 380,
                    width: 760,
                    height: 760,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${accent2}44 0%, transparent 65%)`,
                    filter: 'blur(40px)',
                }}
            />

            {/* Grid teknis bergerak pelan, memudar ke tepi */}
            <div
                style={{
                    position: 'absolute',
                    inset: -100,
                    backgroundImage: `
            linear-gradient(to right, rgba(125, 211, 252, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(125, 211, 252, 0.07) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                    backgroundPosition: `${gridOffset}px ${gridOffset}px`,
                    maskImage: 'radial-gradient(ellipse 70% 60% at 50% 52%, black 30%, transparent 85%)',
                }}
            />

            {darken > 0 ? (
                <AbsoluteFill
                    style={{
                        background: 'radial-gradient(circle at 50% 55%, #1e1b4b 0%, #020414 70%)',
                        opacity: darken,
                    }}
                />
            ) : null}

            {/* Bar HUD bawah */}
            {hud ? (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 96,
                        left: 70,
                        right: 70,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '18px 26px',
                        borderRadius: 18,
                        backgroundColor: 'rgba(5, 9, 20, 0.7)',
                        border: `1px solid ${hudTone}44`,
                        color: '#cbd5e1',
                        fontSize: 21,
                        fontFamily: MONO,
                        letterSpacing: 0.5,
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: hudTone,
                                boxShadow: `0 0 12px ${hudTone}`,
                                opacity: recOn ? 1 : 0.25,
                            }}
                        />
                        {badgeText}
                    </span>
                    <span style={{ color: hudTone, fontWeight: 700 }}>3D PREVIEW</span>
                </div>
            ) : null}
        </AbsoluteFill>
    );
};
