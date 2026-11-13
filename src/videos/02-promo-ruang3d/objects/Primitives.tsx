import React, { createContext, useContext, useMemo } from 'react';
import * as THREE from 'three';
import type { V3 } from '../lib/iso';

/**
 * Nilai 0..1. Saat > 0 semua primitive berubah jadi gaya "blueprint":
 * isi transparan biru gelap + garis tepi cyan.
 */
export const BlueprintContext = createContext(0);

const BP_FILL = new THREE.Color('#0c4a6e');
const BP_LINE = '#7dd3fc';

const useBlueprintColor = (color: string) => {
    const bp = useContext(BlueprintContext);
    const c = useMemo(() => new THREE.Color(color), [color]);
    return { bp, fill: bp > 0 ? c.clone().lerp(BP_FILL, bp) : c };
};

interface MatProps {
    color: string;
    emissive?: string;
    emissiveIntensity?: number;
    opacity?: number;
    roughness?: number;
    metalness?: number;
    flat?: boolean;
}

const Material: React.FC<MatProps & { bp: number; fill: THREE.Color }> = ({
    bp,
    fill,
    emissive = '#000000',
    emissiveIntensity = 0,
    opacity = 1,
    roughness = 0.75,
    metalness = 0,
    flat = false,
}) => {
    const finalOpacity = opacity * (1 - bp * 0.85);
    return (
        <meshStandardMaterial
            color={fill}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity * (1 - bp)}
            roughness={roughness}
            metalness={metalness}
            flatShading={flat}
            transparent
            opacity={finalOpacity}
            depthWrite={finalOpacity > 0.5}
        />
    );
};

interface ShapeBase extends MatProps {
    position?: V3;
    rotation?: V3;
    castShadow?: boolean;
    edges?: boolean;
}

export const Box: React.FC<ShapeBase & { size: V3 }> = ({
    size,
    position,
    rotation,
    castShadow = true,
    edges = true,
    ...mat
}) => {
    const { bp, fill } = useBlueprintColor(mat.color);
    const edgeGeo = useMemo(
        () => new THREE.EdgesGeometry(new THREE.BoxGeometry(size[0], size[1], size[2])),
        [size[0], size[1], size[2]] // eslint-disable-line react-hooks/exhaustive-deps
    );
    return (
        <group position={position} rotation={rotation}>
            <mesh castShadow={castShadow && bp < 0.5} receiveShadow>
                <boxGeometry args={size} />
                <Material {...mat} bp={bp} fill={fill} />
            </mesh>
            {edges && bp > 0.01 ? (
                <lineSegments geometry={edgeGeo}>
                    <lineBasicMaterial color={BP_LINE} transparent opacity={bp} />
                </lineSegments>
            ) : null}
        </group>
    );
};

export const Cyl: React.FC<
    ShapeBase & { args: [number, number, number, number?] }
> = ({ args, position, rotation, castShadow = true, edges = true, ...mat }) => {
    const { bp, fill } = useBlueprintColor(mat.color);
    const seg = args[3] ?? 20;
    const edgeGeo = useMemo(
        () =>
            new THREE.EdgesGeometry(
                new THREE.CylinderGeometry(args[0], args[1], args[2], Math.min(seg, 12)),
                20
            ),
        [args[0], args[1], args[2], seg] // eslint-disable-line react-hooks/exhaustive-deps
    );
    return (
        <group position={position} rotation={rotation}>
            <mesh castShadow={castShadow && bp < 0.5} receiveShadow>
                <cylinderGeometry args={[args[0], args[1], args[2], seg]} />
                <Material {...mat} bp={bp} fill={fill} />
            </mesh>
            {edges && bp > 0.01 ? (
                <lineSegments geometry={edgeGeo}>
                    <lineBasicMaterial color={BP_LINE} transparent opacity={bp} />
                </lineSegments>
            ) : null}
        </group>
    );
};

// Bola low-poly (daun tanaman, dll) — sengaja flat shaded biar gaya maket
export const Ico: React.FC<ShapeBase & { radius: number; scale?: V3 }> = ({
    radius,
    position,
    rotation,
    scale,
    castShadow = true,
    ...mat
}) => {
    const { bp, fill } = useBlueprintColor(mat.color);
    return (
        <mesh
            position={position}
            rotation={rotation}
            scale={scale}
            castShadow={castShadow && bp < 0.5}
            receiveShadow
        >
            <icosahedronGeometry args={[radius, 0]} />
            <Material {...mat} flat bp={bp} fill={fill} />
        </mesh>
    );
};

