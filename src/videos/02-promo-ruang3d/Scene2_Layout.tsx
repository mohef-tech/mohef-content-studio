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
import { Check, LayoutGrid, Sun, X } from 'lucide-react';
import { StudioBackground } from './StudioBackground';
import { IsoStage, StudioLights } from './objects/Stage';
import { BlueprintContext } from './objects/Primitives';
import { Room } from './objects/Room';
import { Bookshelf, Desk, FloorLamp, Lounge, Plant } from './objects/Furniture';
import { FloorZone, FlowArrows } from './objects/Effects';
import { CinematicFX, Callout, HandCursor, KineticHeadline, Pill } from './ui/Overlay';
import { projectToScreen, V3 } from './lib/iso';
import { COLORS, FONT, MONO, ROOM_STATE } from './lib/constants';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const TAP = 110; // jari mengetuk tombol "Layout B"
const DESK_SWAP = [TAP + 2, TAP + 40] as const;
const LOUNGE_SWAP = [TAP + 14, TAP + 54] as const;
const RESULT = 168; // hasil layout B mulai terlihat

// Posisi tombol toggle di layar (dipakai juga oleh kursor tangan)
const TOGGLE = { top: 1300, left: 70, width: 940, height: 92 };
const BTN_B_CENTER = { x: TOGGLE.left + TOGGLE.width * 0.75, y: TOGGLE.top + TOGGLE.height / 2 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const Scene2_Layout: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    const room = {
        rotY: interpolate(frame, [0, 270], [ROOM_STATE.s1End.rotY, ROOM_STATE.s2End.rotY]),
        y: ROOM_STATE.s1End.y,
    };

    // Blueprint (akhir Scene 1) "mewujud" jadi material asli
    const bp = interpolate(frame, [0, 26], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });

    const pop = (at: number) => spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 160 } });
    const shelfS = pop(16);
    const deskS = pop(22);
    const loungeS = pop(28);
    const plantS = pop(34);
    const lampS = pop(38);

    // ===== Pertukaran layout dengan lintasan melengkung (furnitur "diangkat") =====
    const deskT = interpolate(frame, DESK_SWAP, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    const loungeT = interpolate(frame, LOUNGE_SWAP, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    const desk = {
        x: lerp(0.95, -1.3, deskT),
        z: lerp(1.35, 0.3, deskT),
        y: 0.1 + Math.sin(Math.PI * deskT) * 0.8,
        r: lerp(Math.PI, Math.PI / 2, deskT),
    };
    const lounge = {
        x: 0.95,
        z: lerp(-0.75, 0.85, loungeT),
        y: 0.1 + Math.sin(Math.PI * loungeT) * 0.6,
        r: lerp(0, -Math.PI / 2, loungeT),
    };

    const isB = frame >= TAP;
    const pulse = 0.65 + 0.35 * Math.sin(frame * 0.25);
    const redZone = interpolate(frame, [46, 58, TAP, TAP + 8], [0, 1, 1, 0], clamp) * pulse;
    const greenZone = interpolate(frame, [RESULT, RESULT + 14], [0, 1], clamp);
    const flow = interpolate(frame, [RESULT - 6, RESULT + 10], [0, 1], clamp);

    // ===== Skor ruang gerak =====
    const score = Math.round(interpolate(frame, [RESULT - 10, RESULT + 26], [48, 83], { ...clamp, easing: Easing.out(Easing.cubic) }));
    const scoreColor = score > 70 ? COLORS.green : score > 60 ? COLORS.amber : COLORS.red;
    const badge = spring({ frame: frame - (RESULT + 26), fps, config: { damping: 9, stiffness: 180 } });

    // ===== Kursor tangan =====
    const handIn = interpolate(frame, [80, 104], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    const handOut = interpolate(frame, [TAP + 16, TAP + 36], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
    const handX = lerp(1040, BTN_B_CENTER.x, handIn) + handOut * 260;
    const handY = lerp(1900, BTN_B_CENTER.y, handIn) + handOut * 400;
    const knob = interpolate(frame, [TAP, TAP + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });

    const proj = (p: V3) => projectToScreen(p, room, width, height);
    const pathPt = proj([1.1, 0.15, -1.2]);
    const deskA = proj([0.95, 1.3, 1.35]);
    const deskB = proj([-1.3, 1.35, 0.3]);

    const cardIn = spring({ frame: frame - 40, fps, config: { damping: 15 } });

    return (
        <AbsoluteFill style={{ fontFamily: FONT }}>
            {/* ===== SFX ===== */}
            {[16, 22, 28, 34].map((f) => (
                <Sequence key={f} from={f} durationInFrames={15}>
                    <Audio src={staticFile('sfx/pop.mp3')} volume={0.45} />
                </Sequence>
            ))}
            <Sequence from={TAP} durationInFrames={20}>
                <Audio src={staticFile('sfx/click.mp3')} volume={1} />
            </Sequence>
            <Sequence from={TAP + 4} durationInFrames={40}>
                <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.6} />
            </Sequence>
            <Sequence from={RESULT + 26} durationInFrames={20}>
                <Audio src={staticFile('sfx/pop.mp3')} volume={0.8} />
            </Sequence>

            <StudioBackground
                accent={isB ? '#10b981' : '#0ea5e9'}
                accent2={isB ? '#0ea5e9' : '#f59e0b'}
                hudTone={isB ? COLORS.green : COLORS.amber}
                badgeText={isB ? 'LAYOUT B • ALUR GERAK LEGA' : 'LAYOUT A • TATA LETAK AWAL'}
            />

            {/* ===== DUNIA 3D ===== */}
            <IsoStage>
                <StudioLights />
                <BlueprintContext.Provider value={bp}>
                    <group position={[0, room.y, 0]} rotation={[0, room.rotY, 0]}>
                        <Room ringGlow={0.5 + bp * 0.5} />

                        <FloorZone center={[1.1, -1.35]} size={[0.95, 0.8]} color={COLORS.red} opacity={redZone} />
                        <FloorZone center={[1.1, -1.25]} size={[0.95, 1.0]} color={COLORS.green} opacity={greenZone * 0.8} />
                        <FlowArrows
                            points={[[1.1, -1.6], [1.0, -0.6], [0.2, -0.1], [-0.55, 0.3]]}
                            offset={frame * 0.025}
                            opacity={flow}
                        />
                        <FlowArrows
                            points={[[0.2, -0.1], [-0.15, 0.8]]}
                            offset={frame * 0.025}
                            opacity={flow * 0.8}
                        />

                        <group position={[-1.45, 0.1, -1.5]} scale={shelfS}>
                            <Bookshelf />
                        </group>
                        <group position={[desk.x, desk.y, desk.z]} rotation={[0, desk.r, 0]} scale={deskS}>
                            <Desk />
                        </group>
                        <group position={[lounge.x, lounge.y, lounge.z]} rotation={[0, lounge.r, 0]} scale={loungeS}>
                            <Lounge />
                        </group>
                        <group position={[-1.55, 0.1, 1.6]} scale={plantS}>
                            <Plant tall />
                        </group>
                        <group position={[1.72, 0.1, -0.05]} scale={lampS}>
                            <FloorLamp />
                        </group>
                    </group>
                </BlueprintContext.Provider>
            </IsoStage>

            {/* ===== Callout layout A (masalah) ===== */}
            <Callout
                x={pathPt.x}
                y={pathPt.y}
                lift={150}
                tone={COLORS.red}
                icon={<X size={24} strokeWidth={3.5} />}
                progress={spring({ frame: frame - 50, fps, config: { damping: 14 } }) * interpolate(frame, [TAP - 4, TAP + 4], [1, 0], clamp)}
            >
                Jalur pintu cuma 45 cm
            </Callout>
            <Callout
                x={deskA.x}
                y={deskA.y}
                lift={40}
                tone={COLORS.amber}
                icon={<X size={24} strokeWidth={3.5} />}
                progress={spring({ frame: frame - 62, fps, config: { damping: 14 } }) * interpolate(frame, [TAP - 4, TAP + 4], [1, 0], clamp)}
            >
                Meja jauh dari cahaya
            </Callout>

            {/* ===== Callout layout B (solusi) ===== */}
            <Callout
                x={pathPt.x}
                y={pathPt.y}
                lift={150}
                tone={COLORS.green}
                icon={<Check size={24} strokeWidth={3.5} />}
                progress={spring({ frame: frame - (RESULT + 4), fps, config: { damping: 14 } })}
            >
                Jalur lega 110 cm
            </Callout>
            <Callout
                x={deskB.x}
                y={deskB.y}
                lift={60}
                tone={COLORS.green}
                icon={<Sun size={24} strokeWidth={2.8} />}
                progress={spring({ frame: frame - (RESULT + 16), fps, config: { damping: 14 } })}
            >
                Meja dekat jendela
            </Callout>

            {/* ===== TEKS ATAS ===== */}
            <div style={{ position: 'absolute', top: 150, left: 70, right: 70 }}>
                <Pill
                    tone={COLORS.cyan}
                    style={{
                        marginBottom: 26,
                        opacity: interpolate(frame, [4, 14], [0, 1], clamp),
                    }}
                >
                    <LayoutGrid size={24} strokeWidth={2.6} /> TAHAP 1 • SIMULASI TATA LETAK
                </Pill>
                <KineticHeadline
                    start={8}
                    lines={[
                        [{ t: 'Coba' }, { t: '2 layout', hl: COLORS.cyan }, { t: 'dulu,' }],
                        [{ t: 'baru' }, { t: 'beli' }, { t: 'furnitur.' }],
                    ]}
                />
                <p
                    style={{
                        color: '#cbd5e1',
                        fontSize: 31,
                        lineHeight: 1.4,
                        marginTop: 24,
                        fontWeight: 500,
                        opacity: interpolate(frame, [26, 38], [0, 1], clamp),
                    }}
                >
                    {frame >= RESULT
                        ? 'Pintu lega, meja dapat cahaya alami, area tamu tetap nyaman.'
                        : 'Geser furnitur di simulasi — gratis, tanpa angkat barang.'}
                </p>
            </div>

            {/* ===== TOGGLE LAYOUT A / B ===== */}
            <div
                style={{
                    position: 'absolute',
                    ...TOGGLE,
                    borderRadius: 26,
                    padding: 8,
                    backgroundColor: 'rgba(5, 9, 20, 0.82)',
                    border: '1.5px solid rgba(148, 163, 184, 0.25)',
                    display: 'flex',
                    opacity: cardIn,
                    translate: `0 ${(1 - cardIn) * 40}px`,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 8,
                        bottom: 8,
                        left: 8 + knob * (TOGGLE.width / 2 - 8),
                        width: TOGGLE.width / 2 - 8,
                        borderRadius: 20,
                        background: isB
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                        boxShadow: isB ? '0 0 30px #10b98166' : '0 0 30px #f59e0b55',
                    }}
                />
                {['LAYOUT A', 'LAYOUT B'].map((label, i) => {
                    const active = isB ? i === 1 : i === 0;
                    return (
                        <div
                            key={label}
                            style={{
                                position: 'relative',
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                fontSize: 28,
                                fontWeight: 800,
                                letterSpacing: 1.5,
                                color: active ? COLORS.ink : '#64748b',
                            }}
                        >
                            {label}
                            {i === 1 && isB ? <Check size={28} strokeWidth={3.5} /> : null}
                        </div>
                    );
                })}
            </div>

            {/* ===== KARTU SKOR RUANG GERAK ===== */}
            <div
                style={{
                    position: 'absolute',
                    top: TOGGLE.top + TOGGLE.height + 22,
                    left: 70,
                    right: 70,
                    padding: '22px 28px',
                    borderRadius: 22,
                    backgroundColor: 'rgba(5, 9, 20, 0.78)',
                    border: `1.5px solid ${scoreColor}55`,
                    opacity: cardIn,
                    translate: `0 ${(1 - cardIn) * 60}px`,
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: COLORS.muted, fontSize: 22, fontWeight: 700, letterSpacing: 1.5, fontFamily: MONO }}>
                        RUANG GERAK BEBAS
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span
                            style={{
                                opacity: Math.min(badge * 1.5, 1),
                                scale: `${badge}`,
                                padding: '4px 14px',
                                borderRadius: 999,
                                backgroundColor: COLORS.green,
                                color: COLORS.ink,
                                fontSize: 24,
                                fontWeight: 900,
                            }}
                        >
                            +35%
                        </span>
                        <span style={{ color: scoreColor, fontSize: 44, fontWeight: 900, fontFamily: MONO }}>{score}%</span>
                    </span>
                </div>
                <div style={{ marginTop: 14, height: 14, borderRadius: 999, backgroundColor: 'rgba(148,163,184,0.15)', overflow: 'hidden' }}>
                    <div
                        style={{
                            width: `${score}%`,
                            height: '100%',
                            borderRadius: 999,
                            background: `linear-gradient(90deg, ${scoreColor}99, ${scoreColor})`,
                            boxShadow: `0 0 16px ${scoreColor}`,
                        }}
                    />
                </div>
            </div>

            <HandCursor x={handX} y={handY} opacity={handIn * (1 - handOut)} tapFrame={TAP} />

            <CinematicFX />
        </AbsoluteFill>
    );
};
