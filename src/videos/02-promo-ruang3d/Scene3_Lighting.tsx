import React from 'react';
import {
    AbsoluteFill,
    Easing,
    interpolate,
    interpolateColors,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { Lightbulb, Moon, Sun } from 'lucide-react';
import { SfxCue } from '../../lib/motion-craft';
import { StudioBackground } from './StudioBackground';
import { IsoStage, StudioLights } from './objects/Stage';
import { Room } from './objects/Room';
import { Bookshelf, Desk, FloorLamp, Lounge, Plant } from './objects/Furniture';
import { DustMotes, LightCone } from './objects/Effects';
import { CinematicFX, Callout, KineticHeadline, Pill, StarField } from './ui/Overlay';
import { projectToScreen, V3 } from './lib/iso';
import { COLORS, FONT, MONO, ROOM_STATE } from './lib/constants';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const DESK_LAMP_ON = 132;
const FLOOR_LAMP_ON = 146;
const FLICKER = [1, 0.15, 0.9, 0.3, 1];

const lampLevel = (frame: number, onAt: number) =>
    frame < onAt ? 0 : FLICKER[Math.min(frame - onAt, FLICKER.length - 1)];

export const Scene3_Lighting: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // ===== Waktu: 10:00 → 21:00 =====
    const d = interpolate(frame, [38, 225], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
    const hour = 10 + 11 * d;
    const hh = Math.floor(hour);
    const mm = Math.floor(((hour % 1) * 60) / 5) * 5;
    const time = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    const isNight = d > 0.55;

    // ===== Kamera mendekat pelan =====
    const camT = interpolate(frame, [24, 265], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    const room = {
        rotY: interpolate(camT, [0, 1], [ROOM_STATE.s2End.rotY, ROOM_STATE.s3End.rotY]),
        scale: interpolate(camT, [0, 1], [1, ROOM_STATE.s3End.scale]),
        x: interpolate(camT, [0, 1], [0, ROOM_STATE.s3End.x]),
        y: interpolate(camT, [0, 1], [ROOM_STATE.s2End.y, ROOM_STATE.s3End.y]),
    };

    // ===== Cahaya luar: matahari masuk lewat jendela =====
    const sunIntensity = interpolate(d, [0, 0.5, 0.68], [2.4, 1.8, 0], clamp);
    const sunColor = interpolateColors(d, [0, 0.45, 0.65], ['#fff4d6', '#fdba74', '#f97316']);
    const sunElev = interpolate(d, [0, 0.6], [7, 2.6], clamp);
    const sky = interpolateColors(d, [0, 0.42, 0.62, 0.85], ['#7dd3fc', '#fdba74', '#7c3aed', '#0f172a']);

    const deskLamp = lampLevel(frame, DESK_LAMP_ON);
    const floorLamp = lampLevel(frame, FLOOR_LAMP_ON);

    const proj = (p: V3) => projectToScreen(p, room, width, height);
    const windowPt = proj([-0.9, 0.12, 0.35]);
    const deskLampPt = proj([-1.36, 1.3, -0.19]);
    const floorLampPt = proj([1.72, 1.72, -0.05]);

    const accentTone = isNight ? COLORS.amber : COLORS.cyan;
    const cardIn = spring({ frame: frame - 18, fps, config: { damping: 15 } });

    return (
        <AbsoluteFill style={{ fontFamily: FONT }}>
            <SfxCue frame={40} sfx="pop-in" volume={0.38} />
            <SfxCue frame={DESK_LAMP_ON} sfx="toggle-on" volume={0.5} />
            <SfxCue frame={FLOOR_LAMP_ON} sfx="click-soft" volume={0.45} />
            <SfxCue frame={DESK_LAMP_ON + 20} sfx="pop-in" volume={0.38} />
            <SfxCue frame={FLOOR_LAMP_ON + 24} sfx="pop-in" volume={0.38} />

            <StudioBackground
                accent={interpolateColors(d, [0, 0.5, 1], ['#0ea5e9', '#f97316', '#6366f1'])}
                accent2={interpolateColors(d, [0, 1], ['#38bdf8', '#f59e0b'])}
                darken={d * 0.85}
                hud={false}
            />
            <StarField opacity={interpolate(d, [0.6, 0.95], [0, 0.9], clamp)} />

            {/* ===== DUNIA 3D ===== */}
            <IsoStage>
                <StudioLights
                    ambient={interpolate(d, [0, 1], [0.35, 0.1])}
                    hemi={interpolate(d, [0, 1], [0.45, 0.18])}
                    keyIntensity={interpolate(d, [0, 1], [0.75, 0.12])}
                    keyColor={interpolateColors(d, [0, 1], ['#fff7ed', '#6366f1'])}
                />
                {/* Matahari dari sisi jendela → petak cahaya di lantai */}
                <directionalLight
                    position={[-8, sunElev, 2.5]}
                    intensity={sunIntensity}
                    color={sunColor}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-left={-6}
                    shadow-camera-right={6}
                    shadow-camera-top={6}
                    shadow-camera-bottom={-6}
                    shadow-camera-near={0.5}
                    shadow-camera-far={40}
                    shadow-bias={-0.0004}
                    shadow-normalBias={0.02}
                />

                <group position={[room.x, room.y, 0]} rotation={[0, room.rotY, 0]} scale={room.scale}>
                    <Room
                        sky={sky}
                        sunDrop={Math.min(d * 1.7, 1.2)}
                        sunColor={sunColor}
                        clockHour={hour}
                        ledGlow={floorLamp}
                        ringGlow={0.6}
                    />
                    <group position={[-1.45, 0.1, -1.5]}>
                        <Bookshelf />
                    </group>
                    <group position={[-1.3, 0.1, 0.3]} rotation={[0, Math.PI / 2, 0]}>
                        <Desk lamp={deskLamp} />
                    </group>
                    <group position={[0.95, 0.1, 0.85]} rotation={[0, -Math.PI / 2, 0]}>
                        <Lounge />
                    </group>
                    <group position={[-1.55, 0.1, 1.6]}>
                        <Plant tall />
                    </group>
                    <group position={[1.72, 0.1, -0.05]}>
                        <FloorLamp on={floorLamp} />
                    </group>

                    <LightCone position={[1.72, 1.55, -0.05]} radius={0.75} height={1.5} opacity={floorLamp * 0.12} />
                    <LightCone position={[-1.36, 1.22, -0.19]} radius={0.38} height={0.4} opacity={deskLamp * 0.16} />
                    <DustMotes frame={frame} opacity={interpolate(d, [0, 0.45], [0.9, 0], clamp)} />
                </group>
            </IsoStage>

            {/* ===== Callout ===== */}
            <Callout
                x={windowPt.x}
                y={windowPt.y}
                lift={70}
                tone={COLORS.cyan}
                icon={<Sun size={24} strokeWidth={2.8} />}
                progress={spring({ frame: frame - 40, fps, config: { damping: 14 } }) * interpolate(frame, [112, 126], [1, 0], clamp)}
            >
                Cahaya alami dari jendela
            </Callout>
            <Callout
                x={deskLampPt.x}
                y={deskLampPt.y}
                lift={110}
                tone={COLORS.amber}
                icon={<Lightbulb size={24} strokeWidth={2.8} />}
                progress={spring({ frame: frame - (DESK_LAMP_ON + 20), fps, config: { damping: 14 } })}
            >
                Lampu kerja 3000K
            </Callout>
            <Callout
                x={floorLampPt.x}
                y={floorLampPt.y}
                lift={60}
                tone={COLORS.amber}
                icon={<Lightbulb size={24} strokeWidth={2.8} />}
                progress={spring({ frame: frame - (FLOOR_LAMP_ON + 24), fps, config: { damping: 14 } })}
            >
                Sudut tamu hangat
            </Callout>

            {/* ===== TEKS ATAS ===== */}
            <div style={{ position: 'absolute', top: 150, left: 70, right: 70 }}>
                <Pill
                    tone={accentTone}
                    style={{ marginBottom: 26, opacity: interpolate(frame, [4, 14], [0, 1], clamp) }}
                >
                    {isNight ? <Moon size={24} strokeWidth={2.6} /> : <Sun size={24} strokeWidth={2.6} />}
                    TAHAP 2 • SIMULASI PENCAHAYAAN
                </Pill>
                <KineticHeadline
                    start={8}
                    lines={[
                        [{ t: 'Siang' }, { t: 'terang,', hl: COLORS.cyan }],
                        [{ t: 'malam' }, { t: 'tetap' }, { t: 'hangat.', hl: COLORS.amber }],
                    ]}
                />
            </div>

            {/* ===== PANEL SLIDER WAKTU ===== */}
            <div
                style={{
                    position: 'absolute',
                    left: 70,
                    right: 70,
                    bottom: 150,
                    padding: '26px 30px 30px',
                    borderRadius: 26,
                    backgroundColor: 'rgba(5, 9, 20, 0.8)',
                    border: `1.5px solid ${accentTone}55`,
                    boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 40px ${accentTone}22`,
                    opacity: cardIn,
                    translate: `0 ${(1 - cardIn) * 60}px`,
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ color: COLORS.muted, fontSize: 21, fontWeight: 700, letterSpacing: 1.5, fontFamily: MONO }}>
                            SIMULASI WAKTU
                        </div>
                        <div style={{ color: COLORS.text, fontSize: 76, fontWeight: 900, fontFamily: MONO, lineHeight: 1.05 }}>
                            {time}
                            <span style={{ fontSize: 30, color: COLORS.muted, marginLeft: 12 }}>WIB</span>
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '10px 18px',
                            borderRadius: 14,
                            backgroundColor: `${accentTone}22`,
                            border: `1.5px solid ${accentTone}88`,
                            color: accentTone,
                            fontSize: 24,
                            fontWeight: 800,
                            letterSpacing: 1,
                            marginBottom: 10,
                        }}
                    >
                        {isNight ? 'LAMPU INTERIOR ON' : 'CAHAYA ALAMI'}
                    </div>
                </div>

                {/* track + knob */}
                <div style={{ position: 'relative', marginTop: 26, height: 16 }}>
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: 999,
                            background: 'linear-gradient(90deg, #7dd3fc 0%, #fde68a 35%, #fb923c 55%, #7c3aed 75%, #1e1b4b 100%)',
                            opacity: 0.9,
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: `${d * 100}%`,
                            width: 56,
                            height: 56,
                            translate: '-50% -50%',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isNight ? '#4338ca' : '#f59e0b',
                            boxShadow: `0 0 0 6px ${accentTone}44, 0 8px 20px rgba(0,0,0,0.5)`,
                        }}
                    >
                        {isNight ? <Moon size={30} strokeWidth={2.6} /> : <Sun size={30} strokeWidth={2.6} />}
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 22,
                        color: COLORS.muted,
                        fontSize: 21,
                        fontFamily: MONO,
                    }}
                >
                    <span>10:00</span>
                    <span>15:30</span>
                    <span>21:00</span>
                </div>
            </div>

            <CinematicFX />
        </AbsoluteFill>
    );
};
