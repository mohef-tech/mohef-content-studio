import { CAMERA_ZOOM } from './constants';

export type V3 = [number, number, number];

export interface RoomTransform {
    rotY: number;
    scale?: number;
    x?: number;
    y?: number;
    z?: number;
}

const SQRT2 = Math.SQRT2;
const SQRT6 = Math.sqrt(6);

/**
 * Ubah titik lokal ruangan (di dalam <group> ruangan) menjadi koordinat piksel layar.
 * Dihitung manual untuk kamera ortografis di [10,10,10] yang menatap titik nol,
 * sehingga label HTML bisa "menempel" ke objek 3D.
 */
export const projectToScreen = (
    p: V3,
    t: RoomTransform,
    width: number,
    height: number,
    zoom: number = CAMERA_ZOOM
): { x: number; y: number } => {
    const s = t.scale ?? 1;
    const cos = Math.cos(t.rotY);
    const sin = Math.sin(t.rotY);
    const wx = (p[0] * cos + p[2] * sin) * s + (t.x ?? 0);
    const wy = p[1] * s + (t.y ?? 0);
    const wz = (-p[0] * sin + p[2] * cos) * s + (t.z ?? 0);

    return {
        x: width / 2 + (zoom * (wx - wz)) / SQRT2,
        y: height / 2 - (zoom * (-wx + 2 * wy - wz)) / SQRT6,
    };
};

