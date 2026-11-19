import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { fanHubTexture } from './textures';

export type V3 = [number, number, number];

// ============================================================================
// Palet material komponen PC
// ============================================================================
export const PART_COLORS = {
  pcbDark: '#14181e',
  plasticBlack: '#16191e',
  plasticGrey: '#3a3f47',
  plasticLight: '#9aa1aa',
  metalSilver: '#c9ced4',
  metalDark: '#2a2f37',
  aluminium: '#b9c0c8',
  copper: '#c4733d',
  gold: '#d9b04a',
  rubber: '#0b0d10',
  chassis: '#1a1e24',
} as const;

// ============================================================================
// Primitif kecil (dipakai sebagai sub-part, bukan sebagai komponen utuh)
// ============================================================================
interface MatProps {
  color?: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  map?: THREE.Texture | null;
  transparent?: boolean;
  opacity?: number;
}

const Mat: React.FC<MatProps> = ({
  color = '#ffffff',
  metalness = 0.1,
  roughness = 0.6,
  emissive,
  emissiveIntensity = 1,
  map = null,
  transparent = false,
  opacity = 1,
}) => (
  <meshStandardMaterial
    color={color}
    metalness={metalness}
    roughness={roughness}
    emissive={emissive ?? '#000000'}
    emissiveIntensity={emissive ? emissiveIntensity : 0}
    map={map}
    transparent={transparent}
    opacity={opacity}
    depthWrite={!transparent}
  />
);

export const Box: React.FC<
  MatProps & { size: V3; position?: V3; rotation?: V3 }
> = ({ size, position = [0, 0, 0], rotation = [0, 0, 0], ...mat }) => (
  <mesh position={position} rotation={rotation}>
    <boxGeometry args={size} />
    <Mat {...mat} />
  </mesh>
);

export const Cyl: React.FC<
  MatProps & {
    radius: number;
    height: number;
    axis?: 'x' | 'y' | 'z';
    position?: V3;
    segments?: number;
    radiusBottom?: number;
  }
> = ({ radius, height, axis = 'y', position = [0, 0, 0], segments = 24, radiusBottom, ...mat }) => {
  const rotation: V3 = axis === 'z' ? [Math.PI / 2, 0, 0] : axis === 'x' ? [0, 0, Math.PI / 2] : [0, 0, 0];
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[radius, radiusBottom ?? radius, height, segments]} />
      <Mat {...mat} />
    </mesh>
  );
};

/** Bidang tipis untuk stiker / label / panel bertekstur. Default menghadap +Z. */
export const Decal: React.FC<
  MatProps & { size: [number, number]; position?: V3; rotation?: V3; alphaTest?: number }
> = ({ size, position = [0, 0, 0], rotation = [0, 0, 0], alphaTest, ...mat }) => (
  <mesh position={position} rotation={rotation}>
    <planeGeometry args={size} />
    <meshStandardMaterial
      color={mat.color ?? '#ffffff'}
      metalness={mat.metalness ?? 0.05}
      roughness={mat.roughness ?? 0.55}
      map={mat.map ?? null}
      emissive={mat.emissive ?? '#000000'}
      emissiveIntensity={mat.emissive ? mat.emissiveIntensity ?? 1 : 0}
      emissiveMap={mat.emissive ? mat.map ?? null : null}
      transparent={mat.transparent ?? false}
      opacity={mat.opacity ?? 1}
      alphaTest={alphaTest ?? 0}
      polygonOffset
      polygonOffsetFactor={-2}
    />
  </mesh>
);

/** Rotasi bidang Decal agar menghadap sumbu tertentu. */
export const FACE: Record<'px' | 'nx' | 'py' | 'ny' | 'pz' | 'nz', V3> = {
  pz: [0, 0, 0],
  nz: [0, Math.PI, 0],
  px: [0, Math.PI / 2, 0],
  nx: [0, -Math.PI / 2, 0],
  py: [-Math.PI / 2, 0, 0],
  ny: [Math.PI / 2, 0, 0],
};

// ============================================================================
// Utilitas geometri
// ============================================================================

/** Petakan ulang UV berdasarkan posisi X/Y (untuk ExtrudeGeometry bertekstur). */
export const normalizeUVs = (
  geo: THREE.BufferGeometry,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) => {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - minX) / (maxX - minX);
    uv[i * 2 + 1] = (pos.getY(i) - minY) / (maxY - minY);
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
};

/** Gabungkan banyak balok kecil (sirip, pin, kisi) jadi satu geometri efisien. */
export const mergeBoxes = (boxes: Array<{ size: V3; pos: V3; rot?: V3 }>) => {
  const parts = boxes.map(({ size, pos, rot }) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    if (rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot)));
    g.translate(pos[0], pos[1], pos[2]);
    return g;
  });
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return merged;
};

/** Gabungkan geometri sejenis (mis. silinder kapasitor) jadi satu draw-call. */
export const mergeGeos = (parts: THREE.BufferGeometry[]) => {
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return merged;
};

/** Geometri pipa (heatpipe / kabel) dari titik-titik kontrol. */
export const tubeFromPoints = (pts: V3[], radius: number, segments = 64, radial = 10) => {
  const curve = new THREE.CatmullRomCurve3(
    pts.map((p) => new THREE.Vector3(...p)),
    false,
    'catmullrom',
    0.35
  );
  return new THREE.TubeGeometry(curve, segments, radius, radial, false);
};

// ============================================================================
// KIPAS 3D (dipakai GPU, PSU, kipas casing)
// Menghadap +Z, berputar terhadap sumbu Z.
// ============================================================================
export interface Fan3DProps {
  radius: number;
  /** Sudut rotasi bilah (radian) — kendalikan dari frame agar berputar halus. */
  angle: number;
  blades?: number;
  frameStyle?: 'square' | 'none';
  thickness?: number;
  bladeColor?: string;
  frameColor?: string;
  ringColor?: string;
  ringIntensity?: number;
  hubAccent?: string;
  position?: V3;
  rotation?: V3;
}

const buildBladesGeometry = (radius: number, blades: number, hubR: number) => {
  const r0 = hubR * 0.92;
  const r1 = radius * 0.95;
  const spacing = (Math.PI * 2) / blades;
  const sweep = spacing * 0.55;
  const width = spacing * 0.62;
  const shape = new THREE.Shape();
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const r = r0 + (r1 - r0) * t;
    const a = sweep * Math.pow(t, 1.3);
    if (i === 0) shape.moveTo(r * Math.cos(a), r * Math.sin(a));
    else shape.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  for (let i = N; i >= 0; i--) {
    const t = i / N;
    const r = r0 + (r1 - r0) * t;
    const a = sweep * Math.pow(t, 1.3) + width * (0.55 + 0.45 * t);
    shape.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  shape.closePath();
  const base = new THREE.ExtrudeGeometry(shape, { depth: radius * 0.025, bevelEnabled: false });
  base.translate(0, 0, -radius * 0.0125);
  const mid = (sweep + width) / 2;
  base.applyMatrix4(
    new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(Math.cos(mid), Math.sin(mid), 0), 0.42)
  );
  const copies: THREE.BufferGeometry[] = [];
  for (let k = 0; k < blades; k++) {
    const g = base.clone();
    g.applyMatrix4(new THREE.Matrix4().makeRotationZ(k * spacing));
    copies.push(g);
  }
  const merged = mergeGeometries(copies, false);
  copies.forEach((c) => c.dispose());
  base.dispose();
  return merged;
};

const buildSquareFrameGeometry = (radius: number, thickness: number) => {
  const half = radius * 1.1;
  const cr = radius * 0.16;
  const s = new THREE.Shape();
  s.moveTo(-half + cr, -half);
  s.lineTo(half - cr, -half);
  s.absarc(half - cr, -half + cr, cr, -Math.PI / 2, 0, false);
  s.lineTo(half, half - cr);
  s.absarc(half - cr, half - cr, cr, 0, Math.PI / 2, false);
  s.lineTo(-half + cr, half);
  s.absarc(-half + cr, half - cr, cr, Math.PI / 2, Math.PI, false);
  s.lineTo(-half, -half + cr);
  s.absarc(-half + cr, -half + cr, cr, Math.PI, Math.PI * 1.5, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, radius * 1.01, 0, Math.PI * 2, true);
  s.holes.push(hole);
  for (const [sx, sy] of [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ]) {
    const h = new THREE.Path();
    h.absarc(sx * (half - cr * 0.9), sy * (half - cr * 0.9), radius * 0.045, 0, Math.PI * 2, true);
    s.holes.push(h);
  }
  const g = new THREE.ExtrudeGeometry(s, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.06,
    bevelSize: thickness * 0.06,
    bevelSegments: 1,
    curveSegments: 32,
  });
  g.translate(0, 0, -thickness / 2);
  return g;
};

export const Fan3D: React.FC<Fan3DProps> = ({
  radius,
  angle,
  blades = 9,
  frameStyle = 'square',
  thickness = 0.25,
  bladeColor = '#22262d',
  frameColor = PART_COLORS.chassis,
  ringColor,
  ringIntensity = 1.6,
  hubAccent = '#FF7A2F',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const hubR = radius * 0.33;
  const bladesGeo = useMemo(() => buildBladesGeometry(radius, blades, hubR), [radius, blades, hubR]);
  const frameGeo = useMemo(
    () => (frameStyle === 'square' ? buildSquareFrameGeometry(radius, thickness) : null),
    [frameStyle, radius, thickness]
  );
  const strutsGeo = useMemo(
    () =>
      mergeBoxes(
        [0, 1, 2, 3].map((k) => {
          const a = (Math.PI / 2) * k + Math.PI / 4;
          const len = radius * 1.05;
          return {
            size: [len, radius * 0.05, thickness * 0.12] as V3,
            pos: [Math.cos(a) * (len / 2 + hubR * 0.3), Math.sin(a) * (len / 2 + hubR * 0.3), -thickness * 0.4] as V3,
            rot: [0, 0, a] as V3,
          };
        })
      ),
    [radius, thickness, hubR]
  );
  const hubTex = fanHubTexture(hubAccent);

  return (
    <group position={position} rotation={rotation}>
      {frameGeo && (
        <mesh geometry={frameGeo}>
          <meshStandardMaterial color={frameColor} metalness={0.2} roughness={0.55} />
        </mesh>
      )}
      {frameStyle === 'square' && (
        <mesh geometry={strutsGeo}>
          <meshStandardMaterial color={frameColor} metalness={0.2} roughness={0.6} />
        </mesh>
      )}
      {ringColor && (
        <mesh>
          <torusGeometry args={[radius * 1.0, radius * 0.025, 10, 64]} />
          <meshStandardMaterial
            color={ringColor}
            emissive={ringColor}
            emissiveIntensity={ringIntensity}
            toneMapped={false}
          />
        </mesh>
      )}
      <group rotation={[0, 0, angle]}>
        <mesh geometry={bladesGeo}>
          <meshStandardMaterial color={bladeColor} metalness={0.15} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
        {/* Hub dengan stiker logo di tutup depan */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[hubR, hubR, thickness * 0.55, 32]} />
          <meshStandardMaterial attach="material-0" color="#121418" roughness={0.5} />
          <meshStandardMaterial attach="material-1" color="#ffffff" map={hubTex} roughness={0.4} />
          <meshStandardMaterial attach="material-2" color="#121418" roughness={0.5} />
        </mesh>
      </group>
      {/* Cakram motion-blur tipis agar putaran terasa halus */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[hubR, radius * 0.95, 48]} />
        <meshBasicMaterial color="#9aa4b2" transparent opacity={0.06} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ============================================================================
// Pencahayaan studio + environment reflection (RoomEnvironment PMREM)
// ============================================================================
export const StudioEnvironment: React.FC<{ intensity?: number }> = ({ intensity = 0.7 }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
};

export const StudioLights: React.FC<{ keyIntensity?: number }> = ({ keyIntensity = 2.2 }) => (
  <>
    <ambientLight intensity={0.25} />
    <hemisphereLight args={['#dbeafe', '#0b1220', 0.6]} />
    <directionalLight position={[6, 10, 12]} intensity={keyIntensity} color="#fff7ed" />
    <directionalLight position={[-8, 4, 6]} intensity={0.9} color="#93c5fd" />
    <directionalLight position={[0, -6, -10]} intensity={0.8} color="#FF7A2F" />
  </>
);
