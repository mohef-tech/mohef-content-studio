import React from 'react';
import {
    AbsoluteFill,
    Audio,
    Easing,
    interpolate,
    Sequence,
    spring,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { AlertTriangle, Box as BoxIcon, X } from 'lucide-react';
import { StudioBackground } from './StudioBackground';
import { IsoStage, StudioLights } from './objects/Stage';
import { BlueprintContext } from './objects/Primitives';
import { Room } from './objects/Room';
import { Bookshelf, Desk, Lounge, Plant } from './objects/Furniture';
import { DimensionLine } from './objects/Effects';
import { CinematicFX, Callout, KineticHeadline, Pill } from './ui/Overlay';
import { projectToScreen, V3 } from './lib/iso';
import { COLORS, FONT, MONO, ROOM_STATE } from './lib/constants';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Furnitur "asal taruh" yang jatuh dari atas
const DROPS = [
    { id: 'lounge', at: 30, pos: [0.95, -0.85] as [number, number], rot: 0.25 },
    { id: 'desk', at: 46, pos: [-0.15, 0.85] as [number, number], rot: 0.45 },
    { id: 'shelf', at: 62, pos: [-1.5, 0.35] as [number, number], rot: Math.PI / 2 },
    { id: 'plant', at: 76, pos: [0.75, 0.6] as [number, number], rot: 0 },
] as const;

const PROBLEMS: Array<{ text: string; at: number; anchor: V3; lift: number }> = [
    { text: 'Pintu terhalang', at: 40, anchor: [0.95, 0.95, -0.9], lift: 150 },
    { text: 'Jalur sempit', at: 56, anchor: [-0.15, 1.35, 0.85], lift: 70 },
    { text: 'Cahaya tertutup', at: 72, anchor: [-1.5, 1.75, 0.35], lift: 120 },
];

const STAMP_AT = 108;
const REWIND_AT = 148;
const SUBLINE = 'Lihat layout, ukuran & pencahayaan ruang kerjamu dalam 3D — sebelum keluar biaya renovasi.';

export const Scene1_Hook: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // ===== Kerangka ruang tumbuh bertahap =====
    const build = {
        floor: spring({ frame, fps, config: { damping: 14 } }),
        back: spring({ frame: frame - 6, fps, config: { damping: 13 } }),
        left: spring({ frame: frame - 11, fps, config: { damping: 13 } }),
        details: spring({ frame: frame - 18, fps, config: { damping: 12 } }),
    };

    // ===== Getar kamera tiap furnitur menghantam lantai =====
    const shake = DROPS.reduce((acc, d) => {
        const t = frame - (d.at + 6);
        if (t < 0 || t > 14) return acc;
        return acc + Math.sin(t * 2.4) * Math.exp(-t * 0.35) * 0.05;
    }, 0);
    const stampT = frame - STAMP_AT;
    const stampShake = stampT >= 0 && stampT < 16 ? Math.sin(stampT * 3) * Math.exp(-stampT * 0.3) * 0.08 : 0;

    const room = {
        rotY: interpolate(frame, [0, 255], [-0.3, ROOM_STATE.s1End.rotY]),
        x: shake * 0.6 + stampShake,
        y: ROOM_STATE.s1End.y + shake,
    };

    // ===== Mode blueprint setelah "rewind" =====
    const bp = interpolate(frame, [REWIND_AT + 14, REWIND_AT + 46], [0, 1], {
        ...clamp,
        easing: Easing.inOut(Easing.cubic),
    });

    // ===== Freeze merah saat stempel muncul =====
    const freeze =
        interpolate(frame, [STAMP_AT - 2, STAMP_AT + 6], [0, 1], clamp) *
        interpolate(frame, [REWIND_AT - 2, REWIND_AT + 8], [1, 0], clamp);
    const stampIn = spring({ frame: stampT, fps, config: { damping: 11, stiffness: 220 } });

    const dimP = interpolate(frame, [REWIND_AT + 40, REWIND_AT + 62], [0, 1], {
        ...clamp,
        easing: Easing.out(Easing.cubic),
    });

    const isRewind = frame >= REWIND_AT;
    const typed = Math.round(interpolate(frame, [198, 238], [0, SUBLINE.length], clamp));

    const proj = (p: V3) => projectToScreen(p, room, width, height);
    const dimX = proj([0, 0.12, 2.5]);
    const dimZ = proj([2.5, 0.12, 0]);

    return (
        <AbsoluteFill style={{ fontFamily: FONT }}>
            {/* ===== SFX ===== */}
            {DROPS.map((d) => (
                <Sequence key={d.id} from={d.at + 5} durationInFrames={20}>
                    <Audio src={staticFile('sfx/pop.mp3')} volume={0.7} />
                </Sequence>
            ))}
            <Sequence from={STAMP_AT - 4} durationInFrames={30}>
                <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.8} />
            </Sequence>
            <Sequence from={STAMP_AT} durationInFrames={20}>
                <Audio src={staticFile('sfx/click.mp3')} volume={1} />
            </Sequence>
            <Sequence from={REWIND_AT} durationInFrames={30}>
                <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.7} />
            </Sequence>
            <Sequence from={198} durationInFrames={40}>
                <Audio src={staticFile('sfx/typing.mp3')} volume={0.35} />
            </Sequence>

            <StudioBackground
                accent={isRewind ? '#0ea5e9' : '#f43f5e'}
                accent2={isRewind ? '#6366f1' : '#f97316'}
                hudTone={isRewind ? COLORS.cyan : COLORS.red}
                badgeText={isRewind ? 'BLUEPRINT 3D • RUANG 4 × 4 M' : 'REALITA • TANPA SIMULASI'}
            />

            {/* ===== DUNIA 3D ===== */}
            <AbsoluteFill
                style={{
                    filter: `saturate(${1 - freeze * 0.75}) brightness(${1 - freeze * 0.25})`,
                }}
            >
                <IsoStage>
                    <StudioLights keyIntensity={1.7 - bp * 0.6} ambient={0.45 + bp * 0.3} />
                    <BlueprintContext.Provider value={bp}>
                        <group position={[room.x, room.y, 0]} rotation={[0, room.rotY, 0]}>
                            <Room build={build} ringGlow={0.5 + bp * 0.5} />

                            {DROPS.map((d, i) => {
                                if (frame < d.at - 1) return null;
                                const fall = interpolate(frame, [d.at, d.at + 18], [5, 0], {
                                    ...clamp,
                                    easing: Easing.bounce,
                                });
                                const exitStart = REWIND_AT + i * 3;
                                const rise = interpolate(frame, [exitStart, exitStart + 18], [0, 7], {
                                    ...clamp,
                                    easing: Easing.in(Easing.cubic),
                                });
                                if (rise >= 6.9) return null;
                                const spin = interpolate(frame, [exitStart, exitStart + 18], [0, 1.2], clamp);
                                return (
                                    <group
                                        key={d.id}
                                        position={[d.pos[0], 0.1 + fall + rise, d.pos[1]]}
                                        rotation={[0, d.rot + spin, 0]}
                                    >
                                        {d.id === 'lounge' ? <Lounge /> : null}
                                        {d.id === 'desk' ? <Desk /> : null}
                                        {d.id === 'shelf' ? <Bookshelf /> : null}
                                        {d.id === 'plant' ? <Plant tall /> : null}
                                    </group>
                                );
                            })}

                            <DimensionLine center={[0, 0.12, 2.5]} length={4} axis="x" progress={dimP} />
                            <DimensionLine center={[2.5, 0.12, 0]} length={4} axis="z" progress={dimP} />
                        </group>
                    </BlueprintContext.Provider>
                </IsoStage>
            </AbsoluteFill>

            {/* ===== Label masalah yang menempel ke furnitur ===== */}
            {PROBLEMS.map((p) => {
                const inP = spring({ frame: frame - p.at, fps, config: { damping: 14 } });
                const out = interpolate(frame, [REWIND_AT - 6, REWIND_AT + 4], [1, 0], clamp);
                const pt = proj(p.anchor);
                return (
                    <Callout
                        key={p.text}
                        x={pt.x}
                        y={pt.y}
                        lift={p.lift}
                        progress={inP * out}
                        tone={COLORS.red}
                        icon={<X size={26} strokeWidth={3.5} />}
                    >
                        {p.text}
                    </Callout>
                );
            })}

            {/* ===== Label ukuran ruang (mode blueprint) ===== */}
            {[dimX, dimZ].map((pt, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: pt.x,
                        top: pt.y + 34,
                        translate: '-50% 0',
                        opacity: dimP,
                        fontFamily: MONO,
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#7dd3fc',
                        padding: '6px 14px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(5,9,20,0.75)',
                        border: '1px solid #7dd3fc66',
                    }}
                >
                    4,00 m
                </div>
            ))}

            {/* ===== STEMPEL "SALAH UKUR" ===== */}
            {freeze > 0.01 ? (
                <>
                    <AbsoluteFill style={{ backgroundColor: '#7f1d1d', opacity: freeze * 0.28, mixBlendMode: 'multiply' }} />
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: 1010,
                            translate: '-50% -50%',
                            rotate: '-8deg',
                            scale: `${interpolate(stampIn, [0, 1], [2.4, 1])}`,
                            opacity: Math.min(stampIn * 2, 1) * freeze,
                            padding: '26px 40px',
                            border: `7px solid ${COLORS.red}`,
                            borderRadius: 18,
                            backgroundColor: 'rgba(20, 4, 8, 0.82)',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            boxShadow: `0 0 60px ${COLORS.red}66`,
                        }}
                    >
                        <div style={{ color: COLORS.red, fontSize: 86, fontWeight: 900, letterSpacing: 2, lineHeight: 1 }}>
                            SALAH UKUR
                        </div>
                        <div style={{ color: '#fecdd3', fontSize: 34, fontWeight: 800, marginTop: 12, letterSpacing: 1 }}>
                            = BONGKAR & BELI ULANG
                        </div>
                    </div>
                </>
            ) : null}

            {/* ===== TEKS ATAS ===== */}
            <div style={{ position: 'absolute', top: 150, left: 70, right: 70 }}>
                <div style={{ position: 'relative', height: 56, marginBottom: 26 }}>
                    <Pill
                        tone={COLORS.red}
                        style={{
                            position: 'absolute',
                            opacity: interpolate(frame, [4, 12, REWIND_AT - 4, REWIND_AT + 2], [0, 1, 1, 0], clamp),
                        }}
                    >
                        <AlertTriangle size={24} strokeWidth={2.6} /> KESALAHAN RENOVASI #1
                    </Pill>
                    <Pill
                        tone={COLORS.cyan}
                        style={{
                            position: 'absolute',
                            opacity: interpolate(frame, [REWIND_AT + 6, REWIND_AT + 14], [0, 1], clamp),
                        }}
                    >
                        <BoxIcon size={24} strokeWidth={2.6} /> KONSULTASI DESAIN RUANG KERJA
                    </Pill>
                </div>

                <div style={{ position: 'relative', minHeight: 150 }}>
                    {frame < REWIND_AT + 10 ? (
                        <KineticHeadline
                            start={6}
                            exitAt={REWIND_AT - 6}
                            lines={[
                                [{ t: 'Beli' }, { t: 'furnitur' }, { t: 'dulu,' }],
                                [{ t: 'ukur' }, { t: 'belakangan?', hl: COLORS.red }],
                            ]}
                        />
                    ) : null}
                    {frame >= REWIND_AT ? (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                            <KineticHeadline
                                start={REWIND_AT + 8}
                                lines={[
                                    [{ t: 'Rancang' }, { t: 'dulu' }, { t: 'di' }, { t: '3D,', hl: COLORS.cyan }],
                                    [{ t: 'baru' }, { t: 'eksekusi.', hl: COLORS.green }],
                                ]}
                            />
                        </div>
                    ) : null}
                </div>

                <p
                    style={{
                        color: '#cbd5e1',
                        fontSize: 31,
                        lineHeight: 1.4,
                        marginTop: 26,
                        minHeight: 90,
                        fontWeight: 500,
                    }}
                >
                    {SUBLINE.slice(0, typed)}
                    {typed > 0 && typed < SUBLINE.length ? (
                        <span style={{ color: COLORS.cyan, opacity: Math.floor(frame / 4) % 2 ? 1 : 0.2 }}>▍</span>
                    ) : null}
                </p>
            </div>

            <CinematicFX />
        </AbsoluteFill>
    );
};
