// Durasi tiap scene (30 fps). Root.tsx & PromoRuang3DVideo membaca dari sini.
export const SCENE_DURATIONS = {
    hook: 255,
    layout: 270,
    lighting: 240,
    cta: 285,
} as const;

export const TOTAL_DURATION =
    SCENE_DURATIONS.hook +
    SCENE_DURATIONS.layout +
    SCENE_DURATIONS.lighting +
    SCENE_DURATIONS.cta;

// Kamera isometrik yang dipakai semua scene (harus sama dengan lib/iso.ts)
export const CAMERA_POSITION: [number, number, number] = [10, 10, 10];
export const CAMERA_ZOOM = 120;

export const FONT =
    "Inter, 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";

export const COLORS = {
    ink: '#050914',
    navy: '#0b1324',
    cyan: '#38bdf8',
    cyanDeep: '#0284c7',
    green: '#34d399',
    red: '#f43f5e',
    amber: '#fbbf24',
    indigo: '#818cf8',
    text: '#f8fafc',
    muted: '#94a3b8',
} as const;

// Keadaan kamera/ruangan di batas antar scene supaya potongannya nyambung
export const ROOM_STATE = {
    // akhir Scene 1 = awal Scene 2
    s1End: { rotY: 0.05, y: -0.75 },
    // akhir Scene 2 = awal Scene 3
    s2End: { rotY: 0.2, y: -0.75 },
    // akhir Scene 3 = awal Scene 4 (zoom-in mendekat)
    s3End: { rotY: -0.05, x: 0.15, y: -1.15, scale: 1.25 },
} as const;
