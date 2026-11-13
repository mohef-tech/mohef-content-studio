import React from 'react';
import {
    AbsoluteFill,
    Audio,
    Easing,
    interpolate,
    interpolateColors,
    Sequence,
    spring,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { ArrowRight, Boxes, Check, HardHat, MessageCircle } from 'lucide-react';
import { StudioBackground } from './StudioBackground';
import { IsoStage, StudioLights } from './objects/Stage';
import { Room } from './objects/Room';
import { Bookshelf, Desk, FloorLamp, Lounge, Plant } from './objects/Furniture';
import { LightCone } from './objects/Effects';
import { CinematicFX, HandCursor, KineticHeadline, StarField } from './ui/Overlay';
import { COLORS, FONT, MONO, ROOM_STATE } from './lib/constants';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const BRAND = 'MOHEF TECH';
const CARDS_AT = [68, 80];
const CHIPS_AT = 104;
const CTA_AT = 128;
const TAP = 205;
const CTA_BOX = { top: 1560, left: 70, width: 940, height: 136 };

const SERVICES = [
    {
        icon: <Boxes size={34} strokeWidth={2.4} />,
        tone: COLORS.cyan,
        title: 'PENATAAN & SIMULASI 3D',
        body: (
            <>
                Skala ringan–sedang: layout, furnitur & pencahayaan langsung bareng <b>Mohef Tech</b>.
            </>
        ),
    },
    {
        icon: <HardHat size={34} strokeWidth={2.4} />,
        tone: COLORS.amber,
        title: 'STRUKTUR, RAB & CEK LAPANGAN',
        body: (
            <>
                Proyek lanjut dengan hitungan teknis presisi, dikawal <b>Partner Arsitek</b>.
            </>
        ),
    },
];

const CHIPS = ['Layout teruji', 'Cahaya tepat', 'Biaya terkendali'];

/** Logo kubus isometrik sederhana */
const CubeMark: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 48 48">
        <path d="M24 4 L42 14 L24 24 L6 14 Z" fill="#7dd3fc" />
        <path d="M6 14 L24 24 L24 44 L6 34 Z" fill="#0284c7" />
        <path d="M42 14 L24 24 L24 44 L42 34 Z" fill="#0ea5e9" />
    </svg>
);

export const Scene4_CTA: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // ===== Malam → siang, kamera mundur menampilkan maket utuh =====
    const back = interpolate(frame, [0, 55], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    const room = {
        scale: interpolate(back, [0, 1], [ROOM_STATE.s3End.scale, 0.92]),
        x: interpolate(back, [0, 1], [ROOM_STATE.s3End.x, 0]),
        y: interpolate(back, [0, 1], [ROOM_STATE.s3End.y, 1.08]),
        // turntable pelan sampai akhir
        rotY: interpolate(frame, [0, 285], [ROOM_STATE.s3End.rotY, 0.55], { ...clamp, easing: Easing.inOut(Easing.sin) }),
    };
    const lamp = interpolate(back, [0, 1], [1, 0.15]);
    const ring = 0.55 + 0.45 * Math.sin(frame * 0.12);

    // ===== CTA =====
    const ctaIn = spring({ frame: frame - CTA_AT, fps, config: { damping: 12 } });
    const shimmer = ((frame - CTA_AT) % 75) / 75;
    const ringPulse = ((frame - CTA_AT) % 45) / 45;
    const press = interpolate(frame, [TAP - 3, TAP, TAP + 7], [1, 0.95, 1], clamp);
    const tapped = frame >= TAP;

    const handIn = interpolate(frame, [TAP - 26, TAP - 4], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    const handOut = interpolate(frame, [TAP + 20, TAP + 40], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
    const target = { x: CTA_BOX.left + CTA_BOX.width - 130, y: CTA_BOX.top + CTA_BOX.height / 2 };

    return (
        <AbsoluteFill style={{ fontFamily: FONT }}>
            {/* ===== SFX ===== */}
            <Sequence durationInFrames={30}>
                <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.6} />
            </Sequence>
            {[...CARDS_AT, CHIPS_AT, CHIPS_AT + 6, CHIPS_AT + 12, CTA_AT].map((f, i) => (
                <Sequence key={i} from={f} durationInFrames={15}>
                    <Audio src={staticFile('sfx/pop.mp3')} volume={0.5} />
                </Sequence>
            ))}
            <Sequence from={TAP} durationInFrames={20}>
                <Audio src={staticFile('sfx/click.mp3')} volume={1} />
            </Sequence>

            <StudioBackground darken={(1 - back) * 0.85} hud={false} accent="#0ea5e9" accent2="#10b981" />
            <StarField opacity={(1 - back) * 0.9} />

            {/* ===== DUNIA 3D ===== */}
            <IsoStage>
                <StudioLights
                    ambient={interpolate(back, [0, 1], [0.1, 0.45])}
                    hemi={interpolate(back, [0, 1], [0.18, 0.55])}
                    keyIntensity={interpolate(back, [0, 1], [0.12, 1.6])}
                    keyColor={interpolateColors(back, [0, 1], ['#6366f1', '#fff7ed'])}
                />
                <group position={[room.x, room.y, 0]} rotation={[0, room.rotY, 0]} scale={room.scale}>
                    <Room
                        sky={interpolateColors(back, [0, 1], ['#0f172a', '#7dd3fc'])}
                        sunDrop={interpolate(back, [0, 1], [1.2, 0])}
                        clockHour={10}
                        ledGlow={lamp}
                        ringGlow={ring}
                    />
                    <group position={[-1.45, 0.1, -1.5]}>
                        <Bookshelf />
                    </group>
                    <group position={[-1.3, 0.1, 0.3]} rotation={[0, Math.PI / 2, 0]}>
                        <Desk lamp={lamp} />
                    </group>
                    <group position={[0.95, 0.1, 0.85]} rotation={[0, -Math.PI / 2, 0]}>
                        <Lounge />
                    </group>
                    <group position={[-1.55, 0.1, 1.6]}>
                        <Plant tall />
                    </group>
                    <group position={[1.72, 0.1, -0.05]}>
                        <FloorLamp on={lamp} />
                    </group>
                    <LightCone position={[1.72, 1.55, -0.05]} radius={0.75} height={1.5} opacity={(1 - back) * 0.12} />
                </group>
            </IsoStage>

            {/* ===== BRAND + HEADLINE ===== */}
            <div style={{ position: 'absolute', top: 140, left: 70, right: 70 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
                    <div style={{ scale: `${spring({ frame: frame - 6, fps, config: { damping: 10 } })}` }}>
                        <CubeMark size={58} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', fontSize: 40, fontWeight: 900, letterSpacing: 6, color: COLORS.text }}>
                            {BRAND.split('').map((ch, i) => {
                                const p = spring({ frame: frame - (10 + i * 2), fps, config: { damping: 14 } });
                                return (
                                    <span key={i} style={{ opacity: p, translate: `0 ${(1 - p) * 20}px`, whiteSpace: 'pre' }}>
                                        {ch}
                                    </span>
                                );
                            })}
                        </div>
                        <div
                            style={{
                                fontFamily: MONO,
                                fontSize: 19,
                                letterSpacing: 3,
                                color: COLORS.cyan,
                                opacity: interpolate(frame, [26, 38], [0, 1], clamp),
                            }}
                        >
                            3D SPACE & SYSTEM STUDIO
                        </div>
                    </div>
                </div>
                <KineticHeadline
                    start={24}
                    size={62}
                    lines={[
                        [{ t: 'Ruang' }, { t: 'kerja' }, { t: 'pas,' }],
                        [{ t: 'tanpa' }, { t: 'tebak-tebakan.', hl: COLORS.green }],
                    ]}
                />
            </div>

            {/* ===== KARTU LAYANAN ===== */}
            <div
                style={{
                    position: 'absolute',
                    top: 1100,
                    left: 70,
                    right: 70,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                }}
            >
                {SERVICES.map((s, i) => {
                    const p = spring({ frame: frame - CARDS_AT[i], fps, config: { damping: 15 } });
                    return (
                        <div
                            key={s.title}
                            style={{
                                display: 'flex',
                                gap: 22,
                                alignItems: 'center',
                                padding: '22px 26px',
                                borderRadius: 22,
                                backgroundColor: 'rgba(5, 9, 20, 0.84)',
                                border: `1.5px solid ${s.tone}55`,
                                opacity: p,
                                translate: `${(1 - p) * (i === 0 ? -120 : 120)}px 0`,
                                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                            }}
                        >
                            <div
                                style={{
                                    flexShrink: 0,
                                    width: 70,
                                    height: 70,
                                    borderRadius: 18,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: s.tone,
                                    backgroundColor: `${s.tone}1f`,
                                    border: `1.5px solid ${s.tone}66`,
                                }}
                            >
                                {s.icon}
                            </div>
                            <div>
                                <div style={{ color: s.tone, fontSize: 22, fontWeight: 800, letterSpacing: 1.2 }}>
                                    0{i + 1} · {s.title}
                                </div>
                                <div style={{ color: '#e2e8f0', fontSize: 25, lineHeight: 1.35, marginTop: 4 }}>{s.body}</div>
                            </div>
                        </div>
                    );
                })}

                {/* checklist manfaat */}
                <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                    {CHIPS.map((c, i) => {
                        const p = spring({ frame: frame - (CHIPS_AT + i * 6), fps, config: { damping: 11, stiffness: 180 } });
                        return (
                            <div
                                key={c}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    padding: '14px 8px',
                                    borderRadius: 16,
                                    backgroundColor: 'rgba(52, 211, 153, 0.12)',
                                    border: '1.5px solid rgba(52, 211, 153, 0.45)',
                                    color: '#d1fae5',
                                    fontSize: 22,
                                    fontWeight: 700,
                                    opacity: Math.min(p * 1.5, 1),
                                    scale: `${0.6 + p * 0.4}`,
                                }}
                            >
                                <Check size={22} strokeWidth={3.5} color={COLORS.green} />
                                {c}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ===== TOMBOL CTA ===== */}
            <div
                style={{
                    position: 'absolute',
                    ...CTA_BOX,
                    opacity: ctaIn,
                    scale: `${(0.85 + ctaIn * 0.15) * press}`,
                }}
            >
                {/* cincin denyut */}
                {frame >= CTA_AT ? (
                    <div
                        style={{
                            position: 'absolute',
                            inset: -ringPulse * 26,
                            borderRadius: 26 + ringPulse * 26,
                            border: `3px solid ${COLORS.green}`,
                            opacity: (1 - ringPulse) * 0.7,
                        }}
                    />
                ) : null}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 26,
                        overflow: 'hidden',
                        background: 'linear-gradient(90deg, #0284c7 0%, #10b981 100%)',
                        boxShadow: '0 18px 45px rgba(16, 185, 129, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 30px',
                    }}
                >
                    {/* kilau menyapu */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -40,
                            bottom: -40,
                            width: 140,
                            left: `${-20 + shimmer * 140}%`,
                            rotate: '20deg',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
                        }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
                        <MessageCircle size={46} strokeWidth={2.4} color="#ffffff" />
                        <div>
                            <div style={{ color: '#ffffff', fontSize: 32, fontWeight: 900 }}>Konsultasi & Simulasi Ruang</div>
                            <div style={{ color: '#e0f2fe', fontSize: 23, marginTop: 4, fontWeight: 600 }}>
                                DM atau hubungi • Mohammed | Mohef Tech
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            backgroundColor: '#ffffff',
                            color: COLORS.ink,
                            fontWeight: 900,
                            fontSize: 24,
                            padding: '14px 20px',
                            borderRadius: 14,
                        }}
                    >
                        {tapped ? <Check size={26} strokeWidth={3.5} color="#059669" /> : null}
                        {tapped ? 'YUK!' : 'MULAI'}
                        {tapped ? null : (
                            <span style={{ display: 'flex', translate: `${Math.sin(frame * 0.3) * 4}px 0` }}>
                                <ArrowRight size={26} strokeWidth={3.2} />
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <HandCursor
                x={interpolate(handIn, [0, 1], [1060, target.x]) + handOut * 200}
                y={interpolate(handIn, [0, 1], [1950, target.y]) + handOut * 300}
                opacity={handIn * (1 - handOut)}
                tapFrame={TAP}
            />

            <CinematicFX />
        </AbsoluteFill>
    );
};
