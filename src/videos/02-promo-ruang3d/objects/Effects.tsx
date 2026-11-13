import React, { useMemo } from 'react';
import * as THREE from 'three';
import { random } from 'remotion';
import type { V3 } from '../lib/iso';

const FLOOR_Y = 0.115;

/** Kerucut cahaya volumetrik palsu (aditif) dari lampu ke bawah. */
export const LightCone: React.FC<{
    position: V3;
    radius: number;
    height: number;
    color?: string;
    opacity: number;
}> = ({ position, radius, height, color = '#fbbf24', opacity }) =>
    opacity > 0.005 ? (
        <mesh position={[position[0], position[1] - height / 2, position[2]]}>
            <coneGeometry args={[radius, height, 32, 1, true]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity}
                depthWrite={false}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    ) : null;

/** Zona berwarna di lantai (merah = sempit, hijau = lega). */
export const FloorZone: React.FC<{
    center: [number, number];
    size: [number, number];
    color: string;
    opacity: number;
}> = ({ center, size, color, opacity }) => {
    const edges = useMemo(
        () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(size[0], size[1])),
        [size[0], size[1]] // eslint-disable-line react-hooks/exhaustive-deps
    );
    if (opacity <= 0.005) return null;
    return (
        <group position={[center[0], FLOOR_Y + 0.005, center[1]]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh>
                <planeGeometry args={size} />
                <meshBasicMaterial color={color} transparent opacity={opacity * 0.45} depthWrite={false} />
            </mesh>
            <lineSegments geometry={edges}>
                <lineBasicMaterial color={color} transparent opacity={opacity} />
            </lineSegments>
        </group>
    );
};

const chevronShape = (() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.08);
    s.lineTo(0.11, -0.03);
    s.lineTo(0.11, -0.09);
    s.lineTo(0, 0.02);
    s.lineTo(-0.11, -0.09);
    s.lineTo(-0.11, -0.03);
    s.closePath();
    return s;
})();

/** Panah chevron yang "berjalan" di lantai sepanjang polyline. */
export const FlowArrows: React.FC<{
    points: Array<[number, number]>;
    offset: number;
    opacity: number;
    color?: string;
    spacing?: number;
}> = ({ points, offset, opacity, color = '#34d399', spacing = 0.3 }) => {
    const geo = useMemo(() => new THREE.ShapeGeometry(chevronShape), []);
    if (opacity <= 0.005) return null;

    const segs = points.slice(1).map((p, i) => {
        const a = points[i];
        const dx = p[0] - a[0];
        const dz = p[1] - a[1];
        return { a, dx, dz, len: Math.hypot(dx, dz) };
    });
    const total = segs.reduce((s, g) => s + g.len, 0);
    const arrows: Array<{ x: number; z: number; heading: number; fade: number }> = [];

    for (let d = offset % spacing; d < total; d += spacing) {
        let rem = d;
        for (const g of segs) {
            if (rem <= g.len) {
                const t = rem / g.len;
                arrows.push({
                    x: g.a[0] + g.dx * t,
                    z: g.a[1] + g.dz * t,
                    heading: Math.atan2(-g.dx, -g.dz),
                    // pudar di ujung awal & akhir jalur
                    fade: Math.min(1, d / 0.25, (total - d) / 0.25),
                });
                break;
            }
            rem -= g.len;
        }
    }

    return (
        <group position={[0, FLOOR_Y + 0.01, 0]}>
            {arrows.map((a, i) => (
                <group key={i} position={[a.x, 0, a.z]} rotation={[0, a.heading, 0]}>
                    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
                        <meshBasicMaterial color={color} transparent opacity={opacity * a.fade} depthWrite={false} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

/** Garis ukur dengan tick di kedua ujung. Digambar dari tengah ke luar (progress). */
export const DimensionLine: React.FC<{
    center: V3;
    length: number;
    axis: 'x' | 'z';
    progress: number;
    color?: string;
}> = ({ center, length, axis, progress, color = '#7dd3fc' }) => {
    if (progress <= 0.005) return null;
    const L = length * progress;
    const half = L / 2;
    const rotY = axis === 'x' ? 0 : Math.PI / 2;
    return (
        <group position={center} rotation={[0, rotY, 0]}>
            <mesh>
                <boxGeometry args={[L, 0.015, 0.015]} />
                <meshBasicMaterial color={color} />
            </mesh>
            {[-half, half].map((x) => (
                <mesh key={x} position={[x, 0, 0]}>
                    <boxGeometry args={[0.015, 0.015, 0.16]} />
                    <meshBasicMaterial color={color} />
                </mesh>
            ))}
        </group>
    );
};

/** Partikel debu melayang di berkas cahaya jendela. */
export const DustMotes: React.FC<{ frame: number; opacity: number; count?: number }> = ({
    frame,
    opacity,
    count = 26,
}) => {
    if (opacity <= 0.005) return null;
    return (
        <group>
            {new Array(count).fill(0).map((_, i) => {
                const bx = -1.6 + random(`dx${i}`) * 1.6;
                const by = 0.4 + random(`dy${i}`) * 1.5;
                const bz = -0.5 + random(`dz${i}`) * 1.7;
                const ph = random(`dp${i}`) * Math.PI * 2;
                return (
                    <mesh
                        key={i}
                        position={[
                            bx + Math.sin(frame * 0.02 + ph) * 0.08,
                            by + Math.sin(frame * 0.015 + ph * 2) * 0.12,
                            bz + Math.cos(frame * 0.018 + ph) * 0.08,
                        ]}
                    >
                        <sphereGeometry args={[0.012 + random(`ds${i}`) * 0.01, 6, 6]} />
                        <meshBasicMaterial
                            color="#fff7d6"
                            transparent
                            opacity={opacity * (0.4 + 0.6 * Math.abs(Math.sin(frame * 0.05 + ph)))}
                            depthWrite={false}
                        />
                    </mesh>
                );
            })}
        </group>
    );
};

