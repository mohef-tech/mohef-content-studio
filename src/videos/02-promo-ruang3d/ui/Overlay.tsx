import React from 'react';
import {
    AbsoluteFill,
    Easing,
    interpolate,
    random,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { COLORS, FONT } from '../lib/constants';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/* ------------------------------------------------------------------ */
/* KINETIC HEADLINE: kata muncul dari balik masker + stabilo highlight */
/* ------------------------------------------------------------------ */

export interface Word {
    t: string;
    hl?: string; // warna highlight
}

const KWord: React.FC<{
    word: Word;
    delay: number;
    exitAt?: number;
}> = ({ word, delay, exitAt }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const enter = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 140 } });
    const exit =
        exitAt === undefined
            ? 0
            : interpolate(frame, [exitAt, exitAt + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
    const marker = interpolate(frame, [delay + 8, delay + 20], [0, 1], {
        ...clamp,
        easing: Easing.out(Easing.cubic),
    });

    return (
        <span
            style={{
                display: 'inline-block',
                overflow: 'hidden',
                verticalAlign: 'bottom',
                paddingBottom: 6,
                marginBottom: -6,
                marginRight: '0.24em',
            }}
        >
            <span
                style={{
                    display: 'inline-block',
                    position: 'relative',
                    translate: `0 ${(1 - enter) * 110 - exit * 110}%`,
                    color: word.hl ?? COLORS.text,
                }}
            >
                {word.hl ? (
                    <span
                        style={{
                            position: 'absolute',
                            left: -8,
                            right: -8,
                            bottom: 4,
                            height: '38%',
                            borderRadius: 6,
                            backgroundColor: word.hl,
                            opacity: 0.22,
                            transformOrigin: 'left center',
                            scale: `${marker} 1`,
                        }}
                    />
                ) : null}
                <span style={{ position: 'relative' }}>{word.t}</span>
            </span>
        </span>
    );
};

export const KineticHeadline: React.FC<{
    lines: Word[][];
    start: number;
    stagger?: number;
    exitAt?: number;
    size?: number;
    style?: React.CSSProperties;
}> = ({ lines, start, stagger = 3, exitAt, size = 66, style }) => {
    let i = 0;
    return (
        <div
            style={{
                fontFamily: FONT,
                fontSize: size,
                fontWeight: 850,
                lineHeight: 1.08,
                letterSpacing: -1.5,
                ...style,
            }}
        >
            {lines.map((line, li) => (
                <div key={li}>
                    {line.map((w, wi) => {
                        const idx = i++;
                        return (
                            <KWord
                                key={wi}
                                word={w}
                                delay={start + idx * stagger}
                                exitAt={exitAt === undefined ? undefined : exitAt + idx}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* PILL / CHIP                                                        */
/* ------------------------------------------------------------------ */

export const Pill: React.FC<{
    children: React.ReactNode;
    tone?: string;
    solid?: boolean;
    style?: React.CSSProperties;
}> = ({ children, tone = COLORS.cyan, solid = false, style }) => (
    <div
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            borderRadius: 999,
            fontFamily: FONT,
            fontSize: 23,
            fontWeight: 750,
            letterSpacing: 1.4,
            color: solid ? COLORS.ink : tone,
            backgroundColor: solid ? tone : `${tone}22`,
            border: `1.5px solid ${tone}88`,
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
            ...style,
        }}
    >
        {children}
    </div>
);

/* ------------------------------------------------------------------ */
/* CALLOUT: label yang menempel ke titik 3D hasil proyeksi            */
/* ------------------------------------------------------------------ */

export const Callout: React.FC<{
    x: number;
    y: number;
    progress: number;
    tone?: string;
    lift?: number;
    icon?: React.ReactNode;
    children: React.ReactNode;
}> = ({ x, y, progress, tone = COLORS.cyan, lift = 90, icon, children }) => {
    const frame = useCurrentFrame();
    if (progress <= 0.001) return null;
    const pulse = (frame % 40) / 40;
    const lineH = lift * Math.min(1, progress * 1.6);
    const labelP = interpolate(progress, [0.35, 1], [0, 1], clamp);

    return (
        <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
            {/* titik + gelombang */}
            <div
                style={{
                    position: 'absolute',
                    left: -26,
                    top: -26,
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    border: `2px solid ${tone}`,
                    opacity: (1 - pulse) * progress,
                    scale: `${0.3 + pulse * 0.9}`,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: -8,
                    top: -8,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: tone,
                    boxShadow: `0 0 18px ${tone}`,
                    scale: `${progress}`,
                }}
            />
            {/* garis penunjuk */}
            <div
                style={{
                    position: 'absolute',
                    left: -1,
                    top: -lineH,
                    width: 2,
                    height: lineH,
                    background: `linear-gradient(to top, ${tone}, ${tone}00)`,
                }}
            />
            {/* label */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: -lift - 4,
                    translate: `-50% ${-100 + (1 - labelP) * 30}%`,
                    opacity: labelP,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 18px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(5, 9, 20, 0.86)',
                    border: `1.5px solid ${tone}`,
                    boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 24px ${tone}33`,
                    color: COLORS.text,
                    fontFamily: FONT,
                    fontSize: 25,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                }}
            >
                {icon ? <span style={{ color: tone, display: 'flex' }}>{icon}</span> : null}
                {children}
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* KURSOR TANGAN yang "mengetuk" tombol                               */
/* ------------------------------------------------------------------ */

export const HandCursor: React.FC<{
    x: number;
    y: number;
    opacity: number;
    tapFrame: number;
}> = ({ x, y, opacity, tapFrame }) => {
    const frame = useCurrentFrame();
    const press = interpolate(frame, [tapFrame - 4, tapFrame, tapFrame + 6], [1, 0.82, 1], clamp);
    const ripple = interpolate(frame, [tapFrame, tapFrame + 18], [0, 1], clamp);
    if (opacity <= 0.001) return null;

    return (
        <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity }}>
            {ripple > 0 && ripple < 1 ? (
                <div
                    style={{
                        position: 'absolute',
                        left: -60,
                        top: -60,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        border: '3px solid #ffffff',
                        opacity: 1 - ripple,
                        scale: `${0.2 + ripple}`,
                    }}
                />
            ) : null}
            <svg
                width={74}
                height={74}
                viewBox="0 0 24 24"
                style={{
                    position: 'absolute',
                    left: -14,
                    top: -6,
                    scale: `${press}`,
                    transformOrigin: '14px 6px',
                    filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))',
                }}
            >
                <path
                    d="M9 11.5V4.8a1.6 1.6 0 0 1 3.2 0v5.4l.1-1.2a1.6 1.6 0 0 1 3.1.3v1.2a1.6 1.6 0 0 1 3.1.4v1a1.6 1.6 0 0 1 3 .6v4.3c0 3.6-2.6 6.2-6.2 6.2h-1.6c-2 0-3.3-.7-4.5-2.2l-3.4-4.4a1.6 1.6 0 0 1 2.4-2.1L9 15.2z"
                    fill="#ffffff"
                    stroke="#0b1324"
                    strokeWidth={1.1}
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* EFEK SINEMATIK: vignette + grain                                   */
/* ------------------------------------------------------------------ */

export const CinematicFX: React.FC<{ grain?: number }> = ({ grain = 0.07 }) => {
    const frame = useCurrentFrame();
    const seed = Math.floor(frame / 2) % 8;
    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <AbsoluteFill
                style={{
                    background:
                        'radial-gradient(ellipse 80% 65% at 50% 48%, transparent 55%, rgba(0,0,0,0.6) 100%)',
                }}
            />
            <svg width="100%" height="100%" style={{ position: 'absolute', opacity: grain, mixBlendMode: 'overlay' }}>
                <filter id={`grain-${seed}`}>
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
            </svg>
        </AbsoluteFill>
    );
};

/* ------------------------------------------------------------------ */
/* BINTANG (latar malam)                                              */
/* ------------------------------------------------------------------ */

export const StarField: React.FC<{ opacity: number; count?: number }> = ({ opacity, count = 70 }) => {
    const frame = useCurrentFrame();
    if (opacity <= 0.005) return null;
    return (
        <AbsoluteFill style={{ opacity }}>
            {new Array(count).fill(0).map((_, i) => {
                const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.06 + random(`tw${i}`) * 6));
                const s = 2 + random(`ss${i}`) * 3;
                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${random(`sx${i}`) * 100}%`,
                            top: `${random(`sy${i}`) * 100}%`,
                            width: s,
                            height: s,
                            borderRadius: '50%',
                            backgroundColor: '#e0e7ff',
                            boxShadow: '0 0 6px #c7d2fe',
                            opacity: tw,
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};

