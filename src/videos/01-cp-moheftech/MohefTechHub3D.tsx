import React, { useLayoutEffect, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { loadFont } from '@remotion/google-fonts/PlusJakartaSans';
import * as THREE from 'three';

const { fontFamily: JAKARTA } = loadFont('normal', {
  weights: ['600', '700', '800'],
  subsets: ['latin'],
});

// ============================================================================
// TYPES & CONFIG
// ============================================================================
export type CameraStage =
  | 'overview'
  | 'room1-infra'
  | 'room2-hardware'
  | 'room3-software'
  | 'final-cta';

export type RoomId = 'room1' | 'room2' | 'room3';

type V3 = [number, number, number];

interface CamPose {
  target: V3;
  az: number; // derajat, dari +Z menuju +X
  el: number; // derajat elevasi
  dist: number;
  fov: number;
}

export const CAMERA_POSES: Record<CameraStage, CamPose> = {
  overview: { target: [0, 0.8, 0.2], az: 36, el: 50, dist: 66, fov: 26 },
  'room1-infra': { target: [-3.0, 0.9, -2.5], az: 34, el: 48, dist: 34, fov: 26 },
  'room2-hardware': { target: [0.1, 0.8, 2.5], az: 18, el: 50, dist: 45, fov: 26 },
  'room3-software': { target: [3.0, 0.9, -2.4], az: 36, el: 48, dist: 35, fov: 26 },
  'final-cta': { target: [0, 0.7, 0.4], az: 42, el: 52, dist: 72, fov: 26 },
};

export interface RoomInfo {
  id: RoomId;
  label: string;
  sub?: string;
  accent: string;
  anchor: V3;
}

export const ROOMS: RoomInfo[] = [
  {
    id: 'room1',
    label: 'Desain Ruang 3D, Listrik, CCTV & Server',
    accent: '#10B981',
    anchor: [-3, 3.1, -2.3],
  },
  {
    id: 'room2',
    label: 'Rakit PC & Service Hardware',
    sub: '(Laptop & Komputer) • Upgrade RAM & SSD',
    accent: '#FF7A2F',
    anchor: [-0.5, 0.2, 4.1],
  },
  {
    id: 'room3',
    label: 'Web, Sistem Kasir POS & Mobile App',
    accent: '#8B5CF6',
    anchor: [3, 3.1, -2.3],
  },
];

export interface CaseStudyPillInfo {
  id: string;
  startFrame: number;
  text: string;
  sub: string;
  accent: string;
  borderColor: string;
  anchor: V3;
}

export const ROOM1_CASE_PILLS: CaseStudyPillInfo[] = [
  {
    id: 'r1-layout-pos',
    startFrame: 35,
    text: '📐 Layout 3D Toko, Rak & Meja Kasir POS',
    sub: 'Simulasi tata letak rak display & counter kasir',
    accent: '#10B981',
    borderColor: '#10B981',
    anchor: [-2.1, 0.25, -1.1],
  },
  {
    id: 'r1-listrik-air',
    startFrame: 85,
    text: '⚡ Jalur Listrik & 💧 Pipa Air Bersih',
    sub: 'Pemetaan beban daya & jalur pipa dinding',
    accent: '#F97316',
    borderColor: '#10B981',
    anchor: [-5.5, 1.7, -1.7],
  },
  {
    id: 'r1-cctv-wifi',
    startFrame: 135,
    text: '📹 Sudut CCTV & 📡 Titik Wi-Fi AP',
    sub: 'Sudut pantau bebas blind-spot & sinyal merata',
    accent: '#0056D2',
    borderColor: '#0056D2',
    anchor: [-2.8, 2.35, -4.75],
  },
];

export const ROOM2_CASE_PILLS: CaseStudyPillInfo[] = [
  {
    id: 'r2-pc-custom',
    startFrame: 35,
    text: '🖥️ Rakit PC Custom • Kerja, Editing & Gaming',
    sub: 'Kabel rapi, suhu dingin & performa maksimal',
    accent: '#F97316',
    borderColor: '#F97316',
    anchor: [-3.5, 2.15, 0.9],
  },
  {
    id: 'r2-pos-scanner',
    startFrame: 90,
    text: '🧾 Set Kasir POS, Barcode Scanner & Printer',
    sub: 'Scan cepat & cetak struk otomatis',
    accent: '#10B981',
    borderColor: '#10B981',
    anchor: [4.15, 2.5, 1.1],
  },
  {
    id: 'r2-service-upgrade',
    startFrame: 140,
    text: '🔧 Service Laptop & Komputer • Upgrade RAM/SSD',
    sub: 'Perbaikan hardware & performa bebas lemot',
    accent: '#0056D2',
    borderColor: '#0056D2',
    anchor: [-1.0, 0.05, 4.5],
  },
];

export const ROOM3_CASE_PILLS: CaseStudyPillInfo[] = [
  {
    id: 'r3-pos-inventory',
    startFrame: 35,
    text: '💻 Sistem Kasir (POS) & Inventory Terintegrasi',
    sub: 'Dashboard penjualan & stok real-time',
    accent: '#0056D2',
    borderColor: '#0056D2',
    anchor: [4.2, 2.15, -4.3],
  },
  {
    id: 'r3-mobile-qr',
    startFrame: 90,
    text: '📱 Aplikasi Mobile & QR Self-Order',
    sub: 'Scan QR meja langsung masuk kasir & dapur',
    accent: '#F97316',
    borderColor: '#F97316',
    anchor: [4.7, 0.65, -0.5],
  },
  {
    id: 'r3-web-custom',
    startFrame: 140,
    text: '🌐 Website Company Profile & Sistem Custom',
    sub: 'Portal bisnis, SPP & aplikasi cloud',
    accent: '#10B981',
    borderColor: '#10B981',
    anchor: [1.75, 0.3, -2.9],
  },
];

export const FINAL_CTA_PILLS: CaseStudyPillInfo[] = [
  {
    id: 'cta-r1',
    startFrame: 38,
    text: '🏠 Ruang 3D, Listrik, CCTV & Wi-Fi',
    sub: '✓ Terukur, Rapi & Siap Pakai',
    accent: '#10B981',
    borderColor: '#10B981',
    anchor: [-3.1, 3.2, -2.5],
  },
  {
    id: 'cta-r2',
    startFrame: 98,
    text: '💻 Rakit PC, Kasir & Service Laptop',
    sub: '✓ Bergaransi & Anti Lemot',
    accent: '#F97316',
    borderColor: '#F97316',
    anchor: [-0.4, 0.4, 4.4],
  },
  {
    id: 'cta-r3',
    startFrame: 158,
    text: '📱 Web, Sistem POS & App Custom',
    sub: '✓ Terhubung Real-Time',
    accent: '#0056D2',
    borderColor: '#0056D2',
    anchor: [3.2, 3.2, -2.5],
  },
];

// Palet
const WALL = '#F8FAFC';
const CAP = '#334155';
const SLAB = '#3B3F5C';
const SKIN = '#F2C9A0';
const HAIR = '#3F2A1E';
const WOOD = '#D6A86A';
const LEG = '#334155';
const DARK = '#1F2937';

const R1 = { floor: '#EBD7B5', carpet: '#10B981', accent: '#10B981' };
const R2 = { floor: '#EEF2F6', carpet: '#FF7A2F', mat: '#FED7AA', accent: '#FF7A2F' };
const R3 = { floor: '#F0E6D6', carpet: '#38BDF8', accent: '#0EA5E9' };

const WALL_T = 0.35;
const WALL_H = 2.3;
const LOW_H = 0.55;

// ============================================================================
// CAMERA MATH (dipakai di dalam canvas & untuk proyeksi pill HTML)
// ============================================================================
const DEG = Math.PI / 180;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPose = (a: CamPose, b: CamPose, t: number): CamPose => ({
  target: [
    lerp(a.target[0], b.target[0], t),
    lerp(a.target[1], b.target[1], t),
    lerp(a.target[2], b.target[2], t),
  ],
  az: lerp(a.az, b.az, t),
  el: lerp(a.el, b.el, t),
  dist: lerp(a.dist, b.dist, t),
  fov: lerp(a.fov, b.fov, t),
});

export const resolveCameraPose = (opts: {
  cameraStage: CameraStage;
  frame: number;
  fromStage?: CameraStage;
  transitionStart?: number;
  transitionDuration?: number;
  introFrames?: number;
}): CamPose => {
  const { cameraStage, frame, fromStage, transitionStart = 0, transitionDuration = 40, introFrames = 0 } = opts;
  let pose = CAMERA_POSES[cameraStage];

  if (fromStage && fromStage !== cameraStage) {
    const t = easeInOutCubic(clamp01((frame - transitionStart) / Math.max(1, transitionDuration)));
    // Dive-in: sedikit menarik mundur di tengah transisi agar terasa sinematik
    const arc = Math.sin(t * Math.PI) * 0.12;
    pose = lerpPose(CAMERA_POSES[fromStage], CAMERA_POSES[cameraStage], t);
    pose = { ...pose, dist: pose.dist * (1 + arc), el: pose.el + arc * 20 };
  }

  if (introFrames > 0) {
    const p = easeOutCubic(clamp01(frame / introFrames));
    pose = {
      ...pose,
      dist: pose.dist * lerp(1.22, 1, p),
      az: pose.az - 12 * (1 - p),
      el: pose.el + 6 * (1 - p),
    };
  }

  // Idle drift halus
  return { ...pose, az: pose.az + Math.sin(frame / 70) * 1.4 };
};

const applyPose = (
  cam: THREE.PerspectiveCamera,
  pose: CamPose,
  width: number,
  height: number,
  focusY: number,
) => {
  const az = pose.az * DEG;
  const el = pose.el * DEG;
  const [tx, ty, tz] = pose.target;
  cam.fov = pose.fov;
  cam.aspect = width / height;
  cam.near = 1;
  cam.far = 400;
  cam.position.set(
    tx + pose.dist * Math.cos(el) * Math.sin(az),
    ty + pose.dist * Math.sin(el),
    tz + pose.dist * Math.cos(el) * Math.cos(az),
  );
  cam.up.set(0, 1, 0);
  cam.lookAt(tx, ty, tz);
  cam.setViewOffset(width, height, 0, height / 2 - focusY, width, height);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
};

const CameraController: React.FC<{ pose: CamPose; width: number; height: number; focusY: number }> = ({
  pose,
  width,
  height,
  focusY,
}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    applyPose(camera, pose, width, height, focusY);
  }, [camera, pose, width, height, focusY]);
  return null;
};

// ============================================================================
// PRIMITIF MATERIAL & GEOMETRI
// ============================================================================
const DimContext = React.createContext<number>(1);

const dimHex = (hex: string, factor: number): string => {
  if (factor >= 0.999) return hex;
  const col = new THREE.Color(hex);
  const dark = new THREE.Color('#060D14');
  col.lerp(dark, 1 - factor);
  return `#${col.getHexString()}`;
};

interface MatProps {
  c: string;
  e?: string;
  ei?: number;
  rough?: number;
  metal?: number;
  flat?: boolean;
}

const Mat: React.FC<MatProps> = ({ c, e, ei, rough = 0.85, metal = 0, flat }) => {
  const dim = React.useContext(DimContext);
  const color = useMemo(() => dimHex(c, dim), [c, dim]);
  const emissive = useMemo(() => (e ? dimHex(e, dim) : '#000000'), [e, dim]);
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={(ei ?? 0) * dim}
      roughness={rough}
      metalness={metal}
      flatShading={flat}
    />
  );
};

type MeshBase = { p: V3; r?: V3; noShadow?: boolean } & MatProps;

const Box: React.FC<MeshBase & { s: V3 }> = ({ p, r, s, noShadow, ...m }) => (
  <mesh position={p} rotation={r} castShadow={!noShadow} receiveShadow>
    <boxGeometry args={s} />
    <Mat {...m} />
  </mesh>
);

const Cyl: React.FC<MeshBase & { rt: number; rb?: number; h: number; seg?: number; sc?: V3 }> = ({
  p,
  r,
  rt,
  rb,
  h,
  seg = 18,
  sc,
  noShadow,
  ...m
}) => (
  <mesh position={p} rotation={r} scale={sc} castShadow={!noShadow} receiveShadow>
    <cylinderGeometry args={[rt, rb ?? rt, h, seg]} />
    <Mat {...m} />
  </mesh>
);

const Ball: React.FC<MeshBase & { rad: number; ws?: number; hs?: number; sc?: V3 }> = ({
  p,
  r,
  rad,
  ws = 18,
  hs = 14,
  sc,
  noShadow,
  ...m
}) => (
  <mesh position={p} rotation={r} scale={sc} castShadow={!noShadow} receiveShadow>
    <sphereGeometry args={[rad, ws, hs]} />
    <Mat {...m} />
  </mesh>
);

const blink = (frame: number, offset: number, period = 26) =>
  (frame + offset) % period < period * 0.55 ? 1.6 : 0.25;

// ============================================================================
// ARSITEKTUR: DINDING, JENDELA
// ============================================================================
// Dinding membentang di sumbu X (normal ke Z)
const WallX: React.FC<{ z: number; x1: number; x2: number; h?: number }> = ({ z, x1, x2, h = WALL_H }) => {
  const len = x2 - x1;
  const cx = (x1 + x2) / 2;
  return (
    <group>
      <Box p={[cx, h / 2, z]} s={[len, h, WALL_T]} c={WALL} rough={0.92} />
      <Box p={[cx, h + 0.045, z]} s={[len + 0.02, 0.09, WALL_T + 0.05]} c={CAP} rough={0.7} />
    </group>
  );
};

// Dinding membentang di sumbu Z (normal ke X)
const WallZ: React.FC<{ x: number; z1: number; z2: number; h?: number }> = ({ x, z1, z2, h = WALL_H }) => {
  const len = z2 - z1;
  const cz = (z1 + z2) / 2;
  return (
    <group>
      <Box p={[x, h / 2, cz]} s={[WALL_T, h, len]} c={WALL} rough={0.92} />
      <Box p={[x, h + 0.045, cz]} s={[WALL_T + 0.05, 0.09, len + 0.02]} c={CAP} rough={0.7} />
    </group>
  );
};

const Window: React.FC<{ p: V3; w: number; h: number; axis: 'x' | 'z' }> = ({ p, w, h, axis }) => {
  const frameS: V3 = axis === 'x' ? [w + 0.14, h + 0.14, WALL_T + 0.03] : [WALL_T + 0.03, h + 0.14, w + 0.14];
  const glassS: V3 = axis === 'x' ? [w, h, WALL_T + 0.05] : [WALL_T + 0.05, h, w];
  const mullS: V3 = axis === 'x' ? [0.05, h, WALL_T + 0.07] : [WALL_T + 0.07, h, 0.05];
  return (
    <group>
      <Box p={p} s={frameS} c="#475569" noShadow />
      <Box p={p} s={glassS} c="#BAE6FD" e="#7DD3FC" ei={0.35} rough={0.25} noShadow />
      <Box p={p} s={mullS} c={WALL} noShadow />
    </group>
  );
};

// ============================================================================
// FURNITUR & KARAKTER
// ============================================================================
const Desk: React.FC<{ p: V3; w: number; d: number; h?: number; top?: string; leg?: string }> = ({
  p,
  w,
  d,
  h = 0.78,
  top = WOOD,
  leg = LEG,
}) => {
  const lx = w / 2 - 0.08;
  const lz = d / 2 - 0.08;
  const legs: V3[] = [
    [-lx, h / 2, -lz],
    [lx, h / 2, -lz],
    [-lx, h / 2, lz],
    [lx, h / 2, lz],
  ];
  return (
    <group position={p}>
      <Box p={[0, h, 0]} s={[w, 0.08, d]} c={top} />
      {legs.map((l, i) => (
        <Box key={i} p={l} s={[0.07, h, 0.07]} c={leg} />
      ))}
    </group>
  );
};

const Chair: React.FC<{ p: V3; rotY?: number; seat?: string }> = ({ p, rotY = 0, seat = '#334155' }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Cyl p={[0, 0.04, 0]} rt={0.26} h={0.06} c={DARK} />
    <Cyl p={[0, 0.27, 0]} rt={0.04} h={0.44} c="#64748B" />
    <Box p={[0, 0.5, 0]} s={[0.52, 0.09, 0.5]} c={seat} />
    <Box p={[0, 0.84, -0.23]} s={[0.5, 0.6, 0.08]} c={seat} />
  </group>
);

const Pawn: React.FC<{
  p: V3;
  rotY?: number;
  body: string;
  seated?: boolean;
  frame: number;
  phase?: number;
  hair?: string;
  celebrate?: number;
}> = ({ p, rotY = 0, body, seated = false, frame, phase = 0, hair = HAIR, celebrate = 0 }) => {
  const bob = Math.sin((frame + phase) * 0.14) * 0.025;
  const hop = celebrate > 0 ? Math.abs(Math.sin((frame + phase) * 0.28)) * 0.14 * celebrate : 0;
  const cheerRot = celebrate > 0 ? Math.sin((frame + phase) * 0.22) * 0.16 * celebrate : 0;
  const bodyR = seated ? 0.23 : 0.24;
  const bodyLen = seated ? 0.22 : 0.6;
  const bodyY = seated ? 0.55 + (bodyLen / 2 + bodyR) : bodyLen / 2 + bodyR;
  const headY = bodyY + bodyLen / 2 + bodyR + 0.2;
  return (
    <group position={[p[0], p[1] + bob + hop, p[2]]} rotation={[0, rotY + cheerRot, 0]}>
      <mesh position={[0, bodyY, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[bodyR, bodyLen, 6, 16]} />
        <Mat c={body} rough={0.7} />
      </mesh>
      <Ball p={[0, headY, 0]} rad={0.22} c={SKIN} rough={0.75} />
      <mesh position={[0, headY + 0.02, -0.01]} castShadow>
        <sphereGeometry args={[0.235, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <Mat c={hair} rough={0.8} />
      </mesh>
      <Ball p={[-0.08, headY - 0.02, 0.2]} rad={0.028} c="#111827" noShadow />
      <Ball p={[0.08, headY - 0.02, 0.2]} rad={0.028} c="#111827" noShadow />
    </group>
  );
};

const Monitor: React.FC<{
  p: V3;
  rotY?: number;
  w?: number;
  h?: number;
  screen?: string;
  frame: number;
  children?: React.ReactNode;
}> = ({ p, rotY = 0, w = 0.8, h = 0.48, screen = '#DBEAFE', frame, children }) => {
  const glow = 0.55 + Math.sin(frame * 0.08) * 0.05;
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <Box p={[0, 0.015, 0]} s={[0.28, 0.03, 0.2]} c={DARK} />
      <Box p={[0, 0.17, -0.02]} s={[0.05, 0.3, 0.05]} c={DARK} />
      <group position={[0, 0.3 + h / 2, 0]}>
        <Box p={[0, 0, 0]} s={[w, h, 0.05]} c={DARK} />
        <Box p={[0, 0, 0.028]} s={[w - 0.06, h - 0.06, 0.01]} c={screen} e={screen} ei={glow} noShadow />
        <group position={[0, 0, 0.036]}>{children}</group>
      </group>
    </group>
  );
};

const UiLines: React.FC<{ w: number; h: number; colors: string[] }> = ({ w, h, colors }) => (
  <group>
    <Box p={[0, h / 2 - 0.07, 0]} s={[w - 0.1, 0.05, 0.005]} c={colors[0]} e={colors[0]} ei={0.6} noShadow />
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        p={[-w / 2 + 0.1 + (w * (0.25 + i * 0.08)) / 2, h / 2 - 0.17 - i * 0.08, 0]}
        s={[w * (0.25 + i * 0.08), 0.035, 0.005]}
        c={colors[(i % (colors.length - 1)) + 1]}
        e={colors[(i % (colors.length - 1)) + 1]}
        ei={0.6}
        noShadow
      />
    ))}
  </group>
);

const Plant: React.FC<{ p: V3; s?: number; leaf?: string }> = ({ p, s = 1, leaf = '#4D7C0F' }) => (
  <group position={p} scale={[s, s, s]}>
    <Cyl p={[0, 0.2, 0]} rt={0.22} rb={0.16} h={0.4} c="#F8FAFC" />
    <Ball p={[0, 0.62, 0]} rad={0.3} ws={7} hs={5} c={leaf} flat />
    <Ball p={[0.12, 0.85, 0.05]} rad={0.2} ws={7} hs={5} c="#65A30D" flat />
  </group>
);

const Tree: React.FC<{ p: V3; s?: number; frame: number; phase?: number; leaf?: string }> = ({
  p,
  s = 1,
  frame,
  phase = 0,
  leaf = '#4D7C0F',
}) => {
  const sway = Math.sin((frame + phase) * 0.05) * 0.025;
  return (
    <group position={p} scale={[s, s, s]} rotation={[0, 0, sway]}>
      <Cyl p={[0, 0.5, 0]} rt={0.12} rb={0.17} h={1} seg={7} c="#78350F" flat />
      <Ball p={[0, 1.55, 0]} rad={0.85} ws={8} hs={6} c={leaf} flat rough={0.9} />
      <Ball p={[0.35, 1.95, 0.2]} rad={0.5} ws={7} hs={5} c="#65A30D" flat rough={0.9} />
      <Ball p={[-0.3, 1.25, 0.35]} rad={0.45} ws={7} hs={5} c="#3F6212" flat rough={0.9} />
    </group>
  );
};

const Bush: React.FC<{ p: V3; s?: number; c?: string }> = ({ p, s = 1, c = '#65A30D' }) => (
  <Ball p={[p[0], p[1] + 0.22 * s, p[2]]} rad={0.32 * s} ws={7} hs={5} c={c} flat sc={[1, 0.8, 1]} />
);

// ============================================================================
// EXTERIOR
// ============================================================================
const Exterior: React.FC<{ frame: number }> = ({ frame }) => (
  <group>
    {/* Lawn + slab tanah */}
    <Box p={[0, -0.12, 0.8]} s={[17, 0.24, 14.8]} c="#74A12E" rough={0.95} />
    <Box p={[0, -0.72, 0.8]} s={[16.96, 0.96, 14.76]} c="#5C4033" rough={1} />
    <Box p={[0, -0.235, 0.8]} s={[17.06, 0.03, 14.86]} c="#84CC16" rough={1} noShadow />

    {/* Jalan setapak */}
    <Box p={[4.45, 0.015, 6.6]} s={[1.3, 0.03, 3.3]} c="#E7E5E4" rough={0.95} />
    <Box p={[-0.6, 0.012, 7.2]} s={[9, 0.025, 0.95]} c="#E7E5E4" rough={0.95} />
    <Box p={[-6.9, 0.01, 1.4]} s={[0.9, 0.022, 10.6]} c="#E7E5E4" rough={0.95} />

    {/* Kolam */}
    <Cyl p={[-3.3, 0.03, 5.95]} rt={0.95} h={0.06} c="#D6D3D1" sc={[1.5, 1, 0.55]} seg={28} />
    <Cyl p={[-3.3, 0.05, 5.95]} rt={0.82} h={0.06} c="#38BDF8" e="#0EA5E9" ei={0.15} rough={0.3} sc={[1.5, 1, 0.55]} seg={28} />

    {/* Lampu taman */}
    {([
      [3.4, 7.6],
      [5.5, 7.6],
      [-7.4, -1.2],
    ] as [number, number][]).map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <Cyl p={[0, 0.55, 0]} rt={0.04} h={1.1} c={CAP} />
        <Ball p={[0, 1.15, 0]} rad={0.11} c="#FEF3C7" e="#FDE68A" ei={0.8} noShadow />
      </group>
    ))}

    {/* Pohon low-poly clay */}
    <Tree p={[-7.3, 0, -5.6]} s={1.15} frame={frame} phase={0} />
    <Tree p={[-4.6, 0, -6.1]} s={0.95} frame={frame} phase={20} />
    <Tree p={[2.6, 0, -6.1]} s={1.05} frame={frame} phase={40} />
    <Tree p={[7.4, 0, -5.4]} s={1.1} frame={frame} phase={60} />
    <Tree p={[-7.5, 0, 4.6]} s={1.0} frame={frame} phase={10} />
    <Tree p={[7.5, 0, 7.4]} s={0.8} frame={frame} phase={30} />

    <Bush p={[-1.5, 0, 7.95]} s={1} />
    <Bush p={[0.6, 0, 7.9]} s={0.8} c="#4D7C0F" />
    <Bush p={[7.6, 0, 1.2]} s={0.9} />
    <Bush p={[7.4, 0, 4.1]} s={0.7} c="#4D7C0F" />
    <Bush p={[-7.8, 0, 7.6]} s={0.9} c="#F9A8D4" />
    <Bush p={[2.2, 0, 6.2]} s={0.7} c="#FDBA74" />
  </group>
);

// ============================================================================
// SHELL BANGUNAN
// ============================================================================
const BuildingShell: React.FC<{
  roomDim: Record<RoomId, number>;
  otherDim: number;
  roomElev?: Record<RoomId, number>;
}> = ({ roomDim, otherDim, roomElev = { room1: 0, room2: 0, room3: 0 } }) => {
  const hT = WALL_T / 2;
  const dimFor = (rooms: RoomId[]) =>
    Math.max(otherDim, ...rooms.map((r) => roomDim[r]));

  return (
    <group>
      {/* Lantai per kamar (ikut terangkat halus saat kamar disorot) */}
      <DimContext.Provider value={roomDim.room1}>
        <group position={[0, roomElev.room1, 0]}>
          <Box p={[-3, 0.02, -2.25]} s={[6, 0.04, 5.5]} c={R1.floor} rough={0.9} />
          {/* Garis papan lantai kayu kamar 1 */}
          {[-4.6, -3.2, -1.8].map((z) => (
            <Box key={z} p={[-3, 0.042, z]} s={[5.8, 0.004, 0.02]} c="#D9C09A" noShadow />
          ))}
        </group>
      </DimContext.Provider>

      <DimContext.Provider value={roomDim.room3}>
        <group position={[0, roomElev.room3, 0]}>
          <Box p={[3, 0.02, -2.25]} s={[6, 0.04, 5.5]} c={R3.floor} rough={0.9} />
        </group>
      </DimContext.Provider>

      <DimContext.Provider value={roomDim.room2}>
        <group position={[0, roomElev.room2, 0]}>
          <Box p={[0, 0.02, 2.75]} s={[12, 0.04, 4.5]} c={R2.floor} rough={0.9} />
          {/* Garis keramik kamar 2 */}
          {[-4, -2, 2, 4].map((x) => (
            <Box key={x} p={[x, 0.042, 2.75]} s={[0.02, 0.004, 4.3]} c="#D8DEE6" noShadow />
          ))}
        </group>
      </DimContext.Provider>

      {/* Dinding luar tinggi (belakang & kiri) — modular per kamar */}
      <DimContext.Provider value={dimFor(['room1'])}>
        <WallX z={-5} x1={-6 - hT} x2={0} />
        <WallZ x={-6} z1={-5 + hT} z2={0.5} />
        <Window p={[-3.3, 1.45, -5]} w={1.5} h={0.85} axis="x" />
        <Window p={[-6, 1.4, -2.3]} w={1.4} h={0.85} axis="z" />
      </DimContext.Provider>

      <DimContext.Provider value={dimFor(['room3'])}>
        <WallX z={-5} x1={0} x2={6 + hT} />
        <Window p={[4.0, 1.85, -5]} w={1.4} h={0.6} axis="x" />
      </DimContext.Provider>

      <DimContext.Provider value={dimFor(['room2'])}>
        <WallZ x={-6} z1={0.5} z2={5 + hT} />
        {/* Dinding luar rendah cutaway (depan & kanan) */}
        <WallX z={5} x1={-6 + hT} x2={3.9} h={LOW_H} />
        <WallX z={5} x1={5.0} x2={6 + hT} h={LOW_H} />
        <WallZ x={6} z1={0.5} z2={5 - hT} h={LOW_H} />
        <Window p={[-6, 1.4, 3.9]} w={1.3} h={0.85} axis="z" />
      </DimContext.Provider>

      <DimContext.Provider value={dimFor(['room3'])}>
        <WallZ x={6} z1={-5 + hT} z2={0.5} h={LOW_H} />
      </DimContext.Provider>

      {/* Sekat A: kamar 1 | kamar 3 (pintu di dekat depan) */}
      <DimContext.Provider value={dimFor(['room1', 'room3'])}>
        <WallZ x={0} z1={-5 + hT} z2={-0.8} />
        <WallZ x={0} z1={0.2} z2={0.5 - hT} />
      </DimContext.Provider>

      {/* Sekat B: kamar belakang | kamar 2 (2 pintu) */}
      <DimContext.Provider value={dimFor(['room1', 'room2'])}>
        <WallX z={0.5} x1={-6 + hT} x2={-1.8} />
        <WallX z={0.5} x1={-0.8} x2={0} />
        <Window p={[-4.6, 1.65, 0.5]} w={1.2} h={0.55} axis="x" />
      </DimContext.Provider>
      <DimContext.Provider value={dimFor(['room2', 'room3'])}>
        <WallX z={0.5} x1={0} x2={0.7} />
        <WallX z={0.5} x1={1.6} x2={6 - hT} />
      </DimContext.Provider>
    </group>
  );
};

// ============================================================================
// KAMAR 1 — Ruang 3D & Infrastruktur (emerald, kayu hangat)
// ============================================================================
const Room1: React.FC<{ frame: number; celebrate?: number }> = ({ frame, celebrate = 0 }) => (
  <group>
    <Box p={[-3.1, 0.05, -3.2]} s={[3, 0.02, 2.2]} c={R1.carpet} rough={1} />
    <Box p={[-3.1, 0.055, -3.2]} s={[2.7, 0.02, 1.9]} c="#34D399" rough={1} noShadow />

    {/* Meja arsitek + blueprint + maket */}
    <Desk p={[-3.1, 0, -3.6]} w={2.2} d={1.05} top="#F5F5F4" />
    <group position={[-3.5, 0.86, -3.6]} rotation={[-0.32, 0, 0]}>
      <Box p={[0, 0.05, 0]} s={[1.1, 0.04, 0.78]} c="#FFFFFF" />
      <Box p={[0, 0.075, 0]} s={[1.0, 0.01, 0.68]} c="#2563EB" e="#1D4ED8" ei={0.15 + celebrate * 0.45} noShadow />
      {[-0.2, 0, 0.2].map((z) => (
        <Box key={z} p={[0, 0.082, z]} s={[0.8, 0.004, 0.015]} c="#E0F2FE" noShadow />
      ))}
      <Box p={[-0.2, 0.082, 0]} s={[0.015, 0.004, 0.5]} c="#E0F2FE" noShadow />
      <Box p={[0.25, 0.082, 0]} s={[0.015, 0.004, 0.5]} c="#E0F2FE" noShadow />
    </group>
    <group position={[-2.45, 0.82, -3.55]}>
      <Box p={[0, 0.02, 0]} s={[0.62, 0.04, 0.52]} c="#FFFFFF" />
      <Box p={[-0.14, 0.17, -0.08]} s={[0.22, 0.26, 0.22]} c="#F8FAFC" e="#10B981" ei={celebrate * 0.25} />
      <Box p={[0.12, 0.11, -0.1]} s={[0.2, 0.14, 0.18]} c="#FF7A2F" e="#FF7A2F" ei={celebrate * 0.2} />
      <Box p={[0.08, 0.09, 0.13]} s={[0.3, 0.1, 0.14]} c="#10B981" e="#10B981" ei={celebrate * 0.35} />
    </group>
    {/* Trust beacon melayang di atas maket saat disorot */}
    {celebrate > 0.15 && (
      <group position={[-2.45, 1.45 + Math.sin(frame * 0.2) * 0.06, -3.55]} scale={[celebrate, celebrate, celebrate]}>
        <Cyl p={[0, 0, 0]} rt={0.18} h={0.04} c="#10B981" e="#10B981" ei={0.9} noShadow />
        <Ball p={[0, 0.06, 0]} rad={0.07} c="#FFFFFF" e="#6EE7B7" ei={1.1} noShadow />
      </group>
    )}
    <Chair p={[-3.5, 0, -2.75]} rotY={Math.PI} seat="#047857" />
    <Pawn p={[-2.2, 0.04, -2.55]} rotY={Math.PI + 0.5} body="#14B8A6" frame={frame} phase={5} celebrate={celebrate} />

    {/* Rak server + NAS */}
    <group position={[-5.3, 0, -4.35]}>
      <Box p={[0, 1.0, 0]} s={[0.85, 2.0, 0.75]} c="#1E293B" rough={0.6} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} position={[0, 0.3 + i * 0.28, 0.38]}>
          <Box p={[0, 0, 0]} s={[0.72, 0.2, 0.02]} c="#475569" noShadow />
          <Box p={[-0.24, 0, 0.015]} s={[0.05, 0.05, 0.02]} c="#22C55E" e="#22C55E" ei={blink(frame, i * 5)} noShadow />
          <Box p={[-0.15, 0, 0.015]} s={[0.05, 0.05, 0.02]} c="#22D3EE" e="#22D3EE" ei={blink(frame, i * 9 + 3, 18)} noShadow />
          <Box p={[0.15, 0, 0.015]} s={[0.3, 0.03, 0.01]} c="#94A3B8" noShadow />
        </group>
      ))}
    </group>
    <group position={[-4.35, 0, -4.45]}>
      <Box p={[0, 0.3, 0]} s={[0.7, 0.6, 0.55]} c="#F1F5F9" />
      <Box p={[0, 0.82, 0]} s={[0.45, 0.44, 0.45]} c="#111827" rough={0.5} />
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          p={[-0.15 + i * 0.1, 0.82, 0.23]}
          s={[0.07, 0.34, 0.01]}
          c="#334155"
          e="#10B981"
          ei={blink(frame, i * 7, 20) * 0.3}
          noShadow
        />
      ))}
    </group>

    {/* Router Wi-Fi di dinding */}
    <group position={[-1.4, 1.75, -4.78]}>
      <Box p={[0, 0, 0]} s={[0.55, 0.32, 0.1]} c="#FFFFFF" rough={0.5} />
      <Box p={[0, -0.08, 0.055]} s={[0.3, 0.03, 0.01]} c="#38BDF8" e="#38BDF8" ei={blink(frame, 2, 34)} noShadow />
      {[-0.2, 0, 0.2].map((x) => (
        <Cyl key={x} p={[x, 0.32, 0]} rt={0.018} h={0.34} c="#E2E8F0" />
      ))}
    </group>

    {/* Jalur pipa listrik */}
    <Cyl p={[-3, 2.05, -4.78]} r={[0, 0, Math.PI / 2]} rt={0.035} h={5.5} c="#94A3B8" />
    <Cyl p={[-1.4, 1.98, -4.78]} rt={0.035} h={0.14} c="#94A3B8" />
    <Cyl p={[-5.3, 2.03, -4.6]} rt={0.035} h={0.08} c="#94A3B8" />
    <Cyl p={[-5.78, 2.05, -3.15]} r={[Math.PI / 2, 0, 0]} rt={0.035} h={3.2} c="#94A3B8" />
    <Cyl p={[-5.78, 1.83, -1.55]} rt={0.035} h={0.44} c="#94A3B8" />
    <group position={[-5.78, 1.3, -1.55]}>
      <Box p={[0, 0, 0]} s={[0.12, 0.66, 0.5]} c="#E2E8F0" rough={0.5} />
      <Box p={[0.065, 0.12, 0]} s={[0.01, 0.12, 0.12]} c="#F59E0B" e="#F59E0B" ei={0.4} noShadow />
      <Box p={[0.065, -0.12, 0]} s={[0.01, 0.2, 0.36]} c="#CBD5E1" noShadow />
    </group>

    {/* Dome CCTV sudut */}
    <group position={[-5.7, 2.18, -4.72]}>
      <Cyl p={[0, 0.03, 0]} rt={0.12} h={0.05} c="#F8FAFC" />
      <mesh position={[0, 0.0, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <sphereGeometry args={[0.13, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat c="#1F2937" rough={0.3} />
      </mesh>
      <Ball p={[0.06, -0.06, 0.06]} rad={0.02} c="#EF4444" e="#EF4444" ei={blink(frame, 0, 40)} noShadow />
    </group>

    <Plant p={[-0.65, 0, -4.4]} s={1.1} />
  </group>
);

// ============================================================================
// KAMAR 2 — Rakit PC & Service Hardware (oranye, keramik terang)
// ============================================================================
const Room2: React.FC<{ frame: number; liveMode?: boolean; celebrate?: number }> = ({
  frame,
  liveMode = false,
  celebrate = 0,
}) => {
  const rgb = (offset: number) => {
    const t = (frame * 0.05 + offset) % 3;
    return t < 1 ? '#FF7A2F' : t < 2 ? '#E879F9' : '#22D3EE';
  };

  // Aktivitas 1: Rakit PC Custom (Frame 35 - 140)
  const gpuSnap = liveMode ? easeOutCubic(clamp01((frame - 48) / 26)) : 1;
  const glassSnap = liveMode ? easeOutCubic(clamp01((frame - 62) / 18)) : 1;
  const pcOn = !liveMode || frame >= 80;
  const bootFlash = liveMode ? clamp01(1 - Math.abs(frame - 84) / 8) : 0;
  const fanSpin =
    celebrate > 0 ? frame * 0.45 : liveMode && frame >= 80 ? (frame - 80) * 0.45 : 0;
  const pcPawnTurn = liveMode
    ? lerp(0.55, 0, easeOutCubic(clamp01((frame - 76) / 18))) +
      (frame >= 80 ? Math.sin(frame * 0.2) * 0.06 : 0)
    : 0;

  // Aktivitas 2: Barcode Scanner Laser & Thermal Printer Struk (Frame 85 - 220)
  const laserActive = liveMode && frame >= 95 && frame <= 134;
  const laserPulse = laserActive ? 0.65 + 0.35 * Math.sin((frame - 95) * 0.65) : 0;
  const laserSweep = laserActive ? Math.sin((frame - 95) * 0.4) * 0.24 : 0;
  const posConfirm = liveMode && frame >= 120 && frame <= 165;
  const receiptProgress = liveMode ? easeOutCubic(clamp01((frame - 125) / 40)) : 0.15;

  // Aktivitas 3: Teknisi Service Laptop & Upgrade RAM/SSD (Frame 130 - 300)
  const ssdDrop = liveMode ? easeOutCubic(clamp01((frame - 140) / 28)) : 1;
  const laptopDone = !liveMode || frame >= 172;
  const techShiftX = liveMode && frame >= 130 ? Math.sin(frame * 0.15) * 0.12 : 0;
  const techTurn = liveMode && frame >= 130 ? 0.35 + Math.sin(frame * 0.15) * 0.12 : -0.2;

  return (
    <group>
      {/* Karpet workstation */}
      <Box p={[-3.3, 0.05, 1.9]} s={[3.4, 0.02, 2.4]} c={R2.carpet} rough={1} />
      <Box p={[-3.3, 0.055, 1.9]} s={[3.1, 0.02, 2.1]} c="#FB923C" rough={1} noShadow />
      {/* Matras anti-statis meja service */}
      <Box p={[3.4, 0.05, 1.75]} s={[3.6, 0.02, 2.1]} c={R2.mat} rough={1} />

      {/* Meja workstation rakit PC */}
      <Desk p={[-3.3, 0, 1.2]} w={2.6} d={0.95} top="#F8FAFC" leg={DARK} />
      <Monitor
        p={[-3.85, 0.82, 1.05]}
        rotY={0.18}
        frame={frame}
        screen={!pcOn ? '#1E293B' : bootFlash > 0.2 ? '#BAE6FD' : '#DBEAFE'}
      >
        {pcOn && <UiLines w={0.74} h={0.42} colors={['#FF7A2F', '#60A5FA', '#93C5FD', '#FDBA74']} />}
      </Monitor>
      <Monitor
        p={[-3.0, 0.82, 1.05]}
        rotY={-0.18}
        frame={frame}
        screen={!pcOn ? '#1E293B' : bootFlash > 0.2 ? '#C7D2FE' : '#E0E7FF'}
      >
        {pcOn && <UiLines w={0.74} h={0.42} colors={['#1E293B', '#FB923C', '#A5B4FC', '#34D399']} />}
      </Monitor>
      <Box p={[-3.4, 0.84, 1.45]} s={[0.6, 0.03, 0.2]} c="#334155" />

      {/* Casing PC tower dengan animasi rakit GPU, panel kaca & kipas RGB berputar */}
      <group position={[-2.3, 0.82, 1.2]}>
        <Box p={[0, 0.5, 0]} s={[0.46, 1.0, 0.85]} c="#F1F5F9" rough={0.5} />
        {/* Panel kaca samping meluncur menutup */}
        <Box
          p={[0.235 + (1 - glassSnap) * 0.42, 0.5 + (1 - glassSnap) * 0.12, 0]}
          s={[0.02, 0.88, 0.75]}
          c="#1E1B4B"
          e="#312E81"
          ei={pcOn ? 0.35 : 0.08}
          rough={0.2}
          noShadow
        />
        {/* Kipas RGB samping berputar cepat saat menyala */}
        {[
          [-0.18, 0],
          [0.18, 1],
        ].map(([z, idx]) => (
          <group key={z} position={[0.25, 0.75, z]} rotation={[fanSpin, 0, 0]}>
            <Cyl p={[0, 0, 0]} r={[0, 0, Math.PI / 2]} rt={0.13} h={0.02} c={pcOn ? rgb(idx) : '#475569'} e={pcOn ? rgb(idx) : '#000000'} ei={pcOn ? 1.2 : 0} noShadow />
            <Box p={[0.012, 0, 0]} s={[0.008, 0.21, 0.03]} c="#F8FAFC" noShadow />
            <Box p={[0.012, 0, 0]} s={[0.008, 0.03, 0.21]} c="#F8FAFC" noShadow />
          </group>
        ))}
        {/* Modul GPU meluncur masuk casing */}
        <group position={[(1 - gpuSnap) * 0.52, 0.38 + (1 - gpuSnap) * 0.2, 0]}>
          <Box p={[0.24, 0, 0]} s={[0.04, 0.11, 0.58]} c="#1E293B" noShadow />
          <Box p={[0.265, 0, 0]} s={[0.012, 0.035, 0.52]} c="#FF7A2F" e="#FF7A2F" ei={pcOn ? 1.2 : 0.25} noShadow />
        </group>
        <Box p={[0.25, 0.22, 0]} s={[0.02, 0.04, 0.6]} c={pcOn ? rgb(2) : '#334155'} e={pcOn ? rgb(2) : '#000000'} ei={pcOn ? 1.2 : 0} noShadow />
        {[0.25, 0.5, 0.75].map((y, i) => (
          <group key={y} position={[0, y, 0.43]} rotation={[0, 0, fanSpin]}>
            <Cyl p={[0, 0, 0]} r={[Math.PI / 2, 0, 0]} rt={0.1} h={0.02} c={pcOn ? rgb(i) : '#475569'} e={pcOn ? rgb(i) : '#000000'} ei={pcOn ? 1.1 : 0} noShadow />
            <Box p={[0, 0, 0.012]} s={[0.16, 0.025, 0.008]} c="#F8FAFC" noShadow />
          </group>
        ))}
      </group>
      <Chair p={[-3.4, 0, 2.05]} rotY={Math.PI} seat="#EA580C" />
      <Pawn
        p={[-3.4, 0, 2.05]}
        rotY={Math.PI + pcPawnTurn}
        body="#0EA5E9"
        seated
        frame={frame}
        phase={12}
        celebrate={celebrate}
      />

      {/* Rak dinding / pegboard tools */}
      <group position={[-5.79, 1.35, 3.95]}>
        <Box p={[0, 0, 0]} s={[0.06, 0.8, 1.3]} c="#FDBA74" noShadow />
        {[-0.4, -0.1, 0.2, 0.45].map((z, i) => (
          <Box key={z} p={[0.06, 0.05 - (i % 2) * 0.15, z]} s={[0.05, 0.32, 0.06]} c={i % 2 ? '#334155' : '#EF4444'} noShadow />
        ))}
      </group>
      <group position={[-5.45, 0, 3.0]}>
        <Box p={[0, 0.45, 0]} s={[0.6, 0.9, 1.2]} c="#F8FAFC" />
        <Box p={[0.05, 0.98, -0.3]} s={[0.35, 0.18, 0.3]} c="#FCD34D" />
        <Box p={[0.05, 0.98, 0.2]} s={[0.35, 0.22, 0.35]} c="#93C5FD" />
      </group>

      {/* Meja teknis service hardware */}
      <Desk p={[3.4, 0, 1.2]} w={3.0} d={0.95} top="#E2E8F0" leg={DARK} />
      {/* Laptop terbuka yang sedang diservis + animasi RAM/SSD masuk */}
      <group position={[2.35, 0.84, 1.2]} rotation={[0, 0.15, 0]}>
        <Box p={[0, 0.02, 0.05]} s={[0.72, 0.04, 0.48]} c="#CBD5E1" rough={0.4} metal={0.2} />
        <Box p={[0, 0.045, 0.05]} s={[0.6, 0.01, 0.36]} c="#065F46" noShadow />
        <Box p={[-0.12, 0.055, 0.02]} s={[0.24, 0.012, 0.07]} c="#16A34A" noShadow />
        {/* Keping RAM/SSD turun masuk ke slot laptop */}
        <group position={[-0.12, 0.055 + (1 - ssdDrop) * 0.46, 0.12]}>
          <Box p={[0, 0, 0]} s={[0.26, 0.015, 0.08]} c="#16A34A" e="#22C55E" ei={liveMode ? 0.35 : 0} noShadow />
          <Box p={[0, -0.004, 0.036]} s={[0.24, 0.008, 0.015]} c="#FACC15" noShadow />
        </group>
        <group position={[0, 0.04, -0.19]} rotation={[-0.32, 0, 0]}>
          <Box p={[0, 0.24, 0]} s={[0.72, 0.48, 0.03]} c="#CBD5E1" rough={0.4} metal={0.2} />
          <Box
            p={[0, 0.24, 0.017]}
            s={[0.64, 0.4, 0.005]}
            c={laptopDone ? '#BFDBFE' : '#334155'}
            e={laptopDone ? '#93C5FD' : '#1E293B'}
            ei={laptopDone ? 0.95 : 0.12}
            noShadow
          />
          {laptopDone && (
            <Box p={[0, 0.3, 0.021]} s={[0.4, 0.04, 0.004]} c="#10B981" e="#10B981" ei={0.85} noShadow />
          )}
        </group>
      </group>
      {/* RAM & SSD lepas + obeng */}
      <Box p={[2.0, 0.85, 1.55]} s={[0.36, 0.015, 0.09]} c="#16A34A" />
      <Box p={[2.0, 0.858, 1.55]} s={[0.36, 0.004, 0.02]} c="#FACC15" noShadow />
      <Box p={[2.55, 0.855, 1.58]} s={[0.22, 0.025, 0.14]} c="#1E293B" />
      <Box p={[2.55, 0.87, 1.58]} s={[0.12, 0.004, 0.08]} c="#FF7A2F" noShadow />
      <Cyl p={[2.9, 0.86, 1.55]} r={[0, 0.6, Math.PI / 2]} rt={0.025} h={0.32} c="#FF7A2F" />
      {/* Unit komputer desktop (panel samping terbuka) */}
      <group position={[3.25, 0.84, 1.05]}>
        <Box p={[0, 0.38, 0]} s={[0.38, 0.76, 0.68]} c="#64748B" rough={0.5} />
        <Box p={[0.2, 0.38, 0]} s={[0.01, 0.62, 0.56]} c="#065F46" noShadow />
        <Box p={[0.21, 0.5, 0.05]} s={[0.02, 0.12, 0.12]} c="#94A3B8" noShadow />
        <Box p={[0.21, 0.28, 0]} s={[0.02, 0.06, 0.4]} c="#FF7A2F" e="#FF7A2F" ei={0.5} noShadow />
      </group>

      {/* Handheld Barcode Scanner + Stand miring + Laser Merah */}
      <group position={[3.74, 0.84, 1.38]} rotation={[0, -0.25, 0]}>
        <Cyl p={[0, 0.015, 0]} rt={0.09} h={0.03} c={DARK} />
        <Box p={[0, 0.12, -0.02]} s={[0.04, 0.2, 0.04]} r={[0.25, 0, 0]} c="#334155" />
        <group position={[0, 0.22, 0.02]} rotation={[0.45, 0, 0]}>
          <Box p={[0, 0, 0.04]} s={[0.07, 0.07, 0.16]} c={DARK} />
          <Box p={[0, -0.05, -0.02]} s={[0.05, 0.1, 0.05]} r={[-0.3, 0, 0]} c="#FF7A2F" />
          <Box p={[0, 0, 0.122]} s={[0.05, 0.04, 0.01]} c="#EF4444" e="#EF4444" ei={laserActive ? 1.5 : 0.2} noShadow />
          {/* Sinar laser merah menyapu meja saat memindai */}
          {laserActive && (
            <group position={[0, 0, 0.13]} rotation={[laserSweep, 0, 0]}>
              <Box
                p={[0, -0.1, 0.16]}
                s={[0.14, 0.008, 0.34]}
                r={[0.45, 0, 0]}
                c="#FF2E4C"
                e="#EF4444"
                ei={1.6 * laserPulse}
                noShadow
              />
            </group>
          )}
        </group>
      </group>

      {/* Mesin kasir POS touch + thermal printer + kertas struk memanjang */}
      <group position={[4.15, 0.84, 1.15]}>
        <Box p={[0, 0.03, 0]} s={[0.32, 0.06, 0.3]} c="#F8FAFC" />
        <Box p={[0, 0.18, -0.04]} s={[0.06, 0.26, 0.06]} c="#E2E8F0" />
        <group position={[0, 0.42, 0]} rotation={[-0.35, 0, 0]}>
          <Box p={[0, 0, 0]} s={[0.56, 0.38, 0.04]} c={DARK} />
          <Box
            p={[0, 0, 0.022]}
            s={[0.5, 0.32, 0.005]}
            c={posConfirm ? '#D1FAE5' : '#F8FAFC'}
            e={posConfirm ? '#34D399' : '#E0F2FE'}
            ei={posConfirm ? 1.0 : 0.6}
            noShadow
          />
          <Box p={[-0.12, 0.05, 0.026]} s={[0.2, 0.16, 0.004]} c="#FDBA74" e="#FDBA74" ei={0.4} noShadow />
          <Box p={[0.13, 0.05, 0.026]} s={[0.18, 0.04, 0.004]} c="#34D399" e="#34D399" ei={posConfirm ? 1.1 : 0.4} noShadow />
          <Box p={[0.13, -0.07, 0.026]} s={[0.18, 0.06, 0.004]} c={posConfirm ? '#10B981' : '#FF7A2F'} e={posConfirm ? '#10B981' : '#FF7A2F'} ei={0.6} noShadow />
        </group>
      </group>
      <group position={[4.65, 0.84, 1.25]}>
        <Box p={[0, 0.1, 0]} s={[0.3, 0.2, 0.34]} c="#F8FAFC" rough={0.6} />
        <Box p={[0, 0.205, -0.03]} s={[0.26, 0.01, 0.2]} c={DARK} noShadow />
        {/* Kertas struk putih tumbuh memanjang ke atas dari mulut thermal printer */}
        {receiptProgress > 0.02 && (
          <group position={[0, 0.21 + receiptProgress * 0.2, 0.03]} rotation={[-0.18, 0, 0]}>
            <Box p={[0, 0, 0]} s={[0.18, 0.04 + receiptProgress * 0.4, 0.008]} c="#FFFFFF" e="#F8FAFC" ei={0.25} noShadow />
            <Box p={[0, 0.04, 0.006]} s={[0.12, 0.015, 0.002]} c="#94A3B8" noShadow />
            <Box p={[0, -0.02, 0.006]} s={[0.13, 0.012, 0.002]} c="#CBD5E1" noShadow />
          </group>
        )}
      </group>
      <Pawn
        p={[3.1 + techShiftX, 0, 2.08]}
        rotY={Math.PI + techTurn}
        body="#FF7A2F"
        frame={frame}
        phase={24}
        celebrate={celebrate}
      />
      {celebrate > 0.15 && (
        <group position={[0.0, 1.85 + Math.sin(frame * 0.2) * 0.06, 2.2]} scale={[celebrate, celebrate, celebrate]}>
          <Cyl p={[0, 0, 0]} rt={0.18} h={0.04} c="#F97316" e="#F97316" ei={0.9} noShadow />
          <Ball p={[0, 0.06, 0]} rad={0.07} c="#FFFFFF" e="#FDBA74" ei={1.1} noShadow />
        </group>
      )}

      {/* Jejeran Mac mini */}
      <Desk p={[3.3, 0, 4.05]} w={3.6} d={0.7} h={0.55} top="#F8FAFC" leg={DARK} />
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} position={[1.9 + i * 0.7, 0.59, 4.05]}>
          <Box p={[0, 0.07, 0]} s={[0.5, 0.14, 0.5]} c="#D4D4D8" rough={0.35} metal={0.35} />
          <Box p={[0, 0.142, 0]} s={[0.2, 0.004, 0.2]} c="#E4E4E7" noShadow />
          <Box p={[0.18, 0.06, 0.252]} s={[0.03, 0.015, 0.005]} c="#FFFFFF" e="#FFFFFF" ei={blink(frame, i * 6, 40)} noShadow />
        </group>
      ))}

      {/* CCTV kedua */}
      <group position={[-5.7, 2.18, 0.85]}>
        <Cyl p={[0, 0.03, 0]} rt={0.12} h={0.05} c="#F8FAFC" />
        <mesh rotation={[Math.PI, 0, 0]} castShadow>
          <sphereGeometry args={[0.13, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Mat c="#1F2937" rough={0.3} />
        </mesh>
      </group>
      <Plant p={[-5.45, 0, 4.5]} s={1.1} />
      <Plant p={[0.2, 0, 4.5]} s={0.9} leaf="#3F6212" />
    </group>
  );
};

// ============================================================================
// KAMAR 3 — Web & Mobile App Hub (violet, lantai lavender)
// ============================================================================
const Room3: React.FC<{ frame: number; liveMode?: boolean; celebrate?: number }> = ({
  frame,
  liveMode = false,
  celebrate = 0,
}) => {
  const tableC: V3 = [3.6, 0, -1.75];
  const seats = [70, 190, 310];
  const devColors = ['#8B5CF6', '#EC4899', '#F59E0B'];

  // Aktivitas 1: Developer mengetik & Grafik Dashboard POS bergerak (Frame 35 - 150)
  const activeAnim = liveMode || celebrate > 0.1;
  const devTypeBob = activeAnim ? Math.sin(frame * 0.28) * 0.08 : 0;
  const barVal = (i: number) =>
    activeAnim ? 0.08 + 0.14 * (0.5 + 0.5 * Math.sin(frame * 0.16 + i * 1.15)) : 0.14;

  // Aktivitas 2: Tablet QR Self-Order & Diskusi Meja Bundar (Frame 80 - 220)
  const qrTabletPop = liveMode ? easeOutBack(clamp01((frame - 80) / 16)) : 1;
  const qrVisible = !liveMode || frame >= 80;

  // Aktivitas 3: Kanban Card Slide ke "Deployed" + Sinyal Cloud Sync (Frame 120 - 300)
  const deploySlide = liveMode ? easeOutCubic(clamp01((frame - 120) / 36)) : celebrate > 0 ? 1 : 0;
  const cloudSyncOn = !liveMode || frame >= 155;
  const cloudPulse = cloudSyncOn ? 0.7 + 0.7 * Math.sin((frame - 155) * 0.35) : 0.15;
  const signalTravel = activeAnim && cloudSyncOn ? ((frame - 155 + 300) % 40) / 40 : 0;

  return (
    <group>
      <Cyl p={[tableC[0], 0.05, tableC[2]]} rt={1.45} h={0.02} c={R3.carpet} seg={36} rough={1} />
      <Cyl p={[tableC[0], 0.056, tableC[2]]} rt={1.25} h={0.02} c="#7DD3FC" seg={36} rough={1} noShadow />

      {/* Meja developer + monitor ultrawide + Dashboard POS & Grafik */}
      <Desk p={[4.0, 0, -4.25]} w={2.6} d={0.9} top="#FFFFFF" leg="#0056D2" />
      <group position={[4.0, 0.82, -4.45]}>
        <Box p={[0, 0.015, 0.05]} s={[0.4, 0.03, 0.22]} c={DARK} />
        <Box p={[0, 0.16, 0.02]} s={[0.06, 0.28, 0.05]} c={DARK} />
        <group position={[0, 0.58, 0.08]}>
          <Box p={[0, 0, 0]} s={[1.0, 0.5, 0.05]} c={DARK} />
          <Box p={[0, 0, 0.028]} s={[0.94, 0.44, 0.01]} c="#EFF6FF" e="#DBEAFE" ei={0.75} noShadow />
          {/* Grafik Penjualan POS naik-turun di layar utama */}
          <group position={[0, 0, 0.036]}>
            <Box p={[0, 0.15, 0]} s={[0.84, 0.05, 0.005]} c="#0056D2" e="#0056D2" ei={0.7} noShadow />
            {[
              [-0.3, '#38BDF8'],
              [-0.14, '#10B981'],
              [0.02, '#0056D2'],
              [0.18, '#F97316'],
              [0.34, '#10B981'],
            ].map(([bx, col], idx) => {
              const bh = barVal(idx);
              return (
                <Box
                  key={idx}
                  p={[bx as number, -0.14 + bh / 2, 0]}
                  s={[0.1, bh, 0.006]}
                  c={col as string}
                  e={col as string}
                  ei={0.75}
                  noShadow
                />
              );
            })}
          </group>
          {[-1, 1].map((sgn) => (
            <group key={sgn} position={[sgn * 0.69, 0, 0.11]} rotation={[0, -sgn * 0.42, 0]}>
              <Box p={[0, 0, 0]} s={[0.42, 0.5, 0.05]} c={DARK} />
              <Box p={[0, 0, 0.028]} s={[0.36, 0.44, 0.01]} c="#F0FDF4" e="#DCFCE7" ei={0.7} noShadow />
              <Box p={[0, 0.1, 0.035]} s={[0.26, 0.04, 0.004]} c="#0056D2" e="#0056D2" ei={0.8} noShadow />
              <Box p={[0, 0, 0.035]} s={[0.22, 0.04, 0.004]} c="#10B981" e="#10B981" ei={0.8} noShadow />
              <Box p={[0, -0.1, 0.035]} s={[0.18, 0.04, 0.004]} c="#38BDF8" e="#38BDF8" ei={0.8} noShadow />
            </group>
          ))}
        </group>
      </group>
      <Chair p={[4.0, 0, -3.45]} rotY={Math.PI} seat="#0056D2" />
      <Pawn
        p={[4.0, 0, -3.45]}
        rotY={Math.PI + devTypeBob}
        body="#0056D2"
        seated
        frame={frame}
        phase={7}
        celebrate={celebrate}
      />

      {/* Papan kanban di dinding belakang + kartu bergeser ke Deployed + LED Cloud Sync */}
      <group position={[1.55, 1.4, -4.79]}>
        <Box p={[0, 0, 0]} s={[1.7, 1.05, 0.05]} c={CAP} noShadow />
        <Box p={[0, 0, 0.03]} s={[1.6, 0.95, 0.02]} c="#FFFFFF" noShadow />
        {/* Header kolom Deployed di kanan */}
        <Box p={[0.5, 0.4, 0.045]} s={[0.42, 0.06, 0.006]} c="#10B981" e="#10B981" ei={0.6} noShadow />
        {/* Lampu indikator sinkronisasi cloud hijau */}
        <Ball
          p={[0.7, 0.4, 0.06]}
          rad={0.045}
          c="#10B981"
          e="#10B981"
          ei={cloudPulse}
          noShadow
        />
        {/* Sinyal paket data meluncur dari papan cloud ke arah kasir/server */}
        {liveMode && cloudSyncOn && (
          <Ball
            p={[0.7 - signalTravel * 1.9, 0.4 - signalTravel * 0.15, 0.12]}
            rad={0.038}
            c="#38BDF8"
            e="#10B981"
            ei={1.4}
            noShadow
          />
        )}
        {[0, 1, 2].map((col) =>
          [0, 1, 2].map((row) => {
            if (col + row >= 4) return null;
            const isMovingCard = col === 1 && row === 0;
            const cardX = isMovingCard ? -0.5 + (1 + deploySlide) * 0.5 : -0.5 + col * 0.5;
            const cardCol =
              isMovingCard && deploySlide > 0.7
                ? '#10B981'
                : ['#FDE047', '#F9A8D4', '#86EFAC', '#93C5FD'][(col + row * 2) % 4];
            return (
              <Box
                key={`${col}-${row}`}
                p={[cardX, 0.26 - row * 0.26, 0.05]}
                s={[0.36, 0.18, 0.012]}
                c={cardCol}
                e={isMovingCard && deploySlide > 0.7 ? '#10B981' : undefined}
                ei={isMovingCard && deploySlide > 0.7 ? 0.5 : 0}
                noShadow
              />
            );
          }),
        )}
      </group>

      {/* Layar UI Web & App di sekat (menghadap +X) */}
      <group position={[0.2, 1.38, -2.15]}>
        <Box p={[0, 0, 0]} s={[0.05, 0.92, 1.5]} c={DARK} noShadow />
        <Box p={[0.028, 0, 0]} s={[0.01, 0.84, 1.42]} c="#F8FAFC" e="#E0F2FE" ei={0.6} noShadow />
        <Box p={[0.036, 0.34, 0]} s={[0.005, 0.1, 1.36]} c="#0056D2" e="#0056D2" ei={0.6} noShadow />
        {[-0.42, -0.08].map((z, i) => (
          <Box key={z} p={[0.036, 0.0, z]} s={[0.005, 0.42, 0.3]} c={i ? '#38BDF8' : '#34D399'} e={i ? '#38BDF8' : '#34D399'} ei={0.5} noShadow />
        ))}
        <Box p={[0.036, -0.32, -0.25]} s={[0.005, 0.08, 0.64]} c="#F97316" e="#F97316" ei={0.5} noShadow />
        {/* Mockup ponsel */}
        <Box p={[0.04, -0.02, 0.45]} s={[0.012, 0.62, 0.32]} c={DARK} noShadow />
        <Box p={[0.048, -0.02, 0.45]} s={[0.004, 0.54, 0.26]} c="#EFF6FF" e="#BAE6FD" ei={0.6} noShadow />
        <Box p={[0.052, 0.12, 0.45]} s={[0.004, 0.1, 0.2]} c="#0056D2" e="#0056D2" ei={0.6} noShadow />
      </group>

      {/* Meja meeting bundar + 3 developer + Tablet QR Self-Order menyala */}
      <Cyl p={[tableC[0], 0.38, tableC[2]]} rt={0.07} h={0.74} c="#0056D2" />
      <Cyl p={[tableC[0], 0.04, tableC[2]]} rt={0.3} h={0.04} c="#0056D2" />
      <Cyl p={[tableC[0], 0.76, tableC[2]]} rt={0.72} h={0.06} c="#FFFFFF" seg={32} />
      <group position={[tableC[0] - 0.18, 0.8, tableC[2] + 0.05]} rotation={[0, 0.4, 0]}>
        <Box p={[0, 0.01, 0]} s={[0.4, 0.02, 0.28]} c="#CBD5E1" />
        <group position={[0, 0.02, -0.14]} rotation={[-0.35, 0, 0]}>
          <Box p={[0, 0.14, 0]} s={[0.4, 0.28, 0.02]} c="#CBD5E1" />
          <Box p={[0, 0.14, 0.012]} s={[0.34, 0.22, 0.004]} c="#BAE6FD" e="#38BDF8" ei={0.55} noShadow />
        </group>
      </group>
      {/* Tablet 3D QR Code & Menu Pesanan di atas meja bundar */}
      {qrVisible && (
        <group
          position={[tableC[0] + 0.28, 0.8, tableC[2] - 0.18]}
          rotation={[0, -0.4, 0]}
          scale={[qrTabletPop, qrTabletPop, qrTabletPop]}
        >
          <Box p={[0, 0.012, 0]} s={[0.26, 0.024, 0.36]} c={DARK} />
          <Box p={[0, 0.026, 0]} s={[0.22, 0.006, 0.31]} c="#E0F2FE" e="#BAE6FD" ei={0.9} noShadow />
          {/* Ikon QR Code + Menu Bar */}
          <Box p={[-0.05, 0.031, -0.07]} s={[0.06, 0.004, 0.06]} c="#0A2A35" noShadow />
          <Box p={[0.05, 0.031, -0.07]} s={[0.06, 0.004, 0.06]} c="#0056D2" noShadow />
          <Box p={[-0.05, 0.031, 0.03]} s={[0.06, 0.004, 0.06]} c="#0A2A35" noShadow />
          <Box p={[0.04, 0.031, 0.03]} s={[0.07, 0.004, 0.05]} c="#10B981" e="#10B981" ei={0.8} noShadow />
          <Box p={[0, 0.031, 0.11]} s={[0.16, 0.004, 0.035]} c="#F97316" e="#F97316" ei={0.85} noShadow />
        </group>
      )}
      {seats.map((deg, i) => {
        const a = deg * DEG;
        const sx = tableC[0] + Math.sin(a) * 1.05;
        const sz = tableC[2] + Math.cos(a) * 1.05;
        const nod = activeAnim && frame >= 80 ? Math.sin((frame + i * 20) * 0.18) * 0.14 : 0;
        return (
          <group key={deg}>
            <Chair p={[sx, 0, sz]} rotY={a + Math.PI} seat="#E0F2FE" />
            <Pawn
              p={[sx, 0, sz]}
              rotY={a + Math.PI + nod}
              body={devColors[i]}
              seated
              frame={frame}
              phase={i * 17}
              celebrate={celebrate}
            />
          </group>
        );
      })}

      {celebrate > 0.15 && (
        <group position={[tableC[0], 1.7 + Math.sin(frame * 0.2) * 0.06, tableC[2]]} scale={[celebrate, celebrate, celebrate]}>
          <Cyl p={[0, 0, 0]} rt={0.18} h={0.04} c="#0056D2" e="#0056D2" ei={0.9} noShadow />
          <Ball p={[0, 0.06, 0]} rad={0.07} c="#FFFFFF" e="#7DD3FC" ei={1.1} noShadow />
        </group>
      )}

      <Plant p={[5.5, 0, -0.1]} s={1.2} />
      <Plant p={[0.6, 0, -4.45]} s={0.9} leaf="#3F6212" />
    </group>
  );
};

// ============================================================================
// SCENE GRAPH
// ============================================================================
const ROOM_SPOTLIGHT_POS: Record<RoomId, V3> = {
  room1: [-3.0, 4.2, -2.5],
  room2: [0, 4.2, 2.7],
  room3: [3.0, 4.2, -2.5],
};

const pulseWindow = (frame: number, start: number, end: number, ramp = 10) => {
  const up = easeOutCubic(clamp01((frame - start) / ramp));
  const down = 1 - easeOutCubic(clamp01((frame - (end - ramp)) / ramp));
  return Math.min(up, down);
};

const Diorama: React.FC<{
  frame: number;
  cameraStage: CameraStage;
  transitionStart?: number;
}> = ({ frame, cameraStage, transitionStart = 0 }) => {
  const isFinalCta = cameraStage === 'final-cta';
  const activeRoom: RoomId | null =
    cameraStage === 'room1-infra'
      ? 'room1'
      : cameraStage === 'room2-hardware'
        ? 'room2'
        : cameraStage === 'room3-software'
          ? 'room3'
          : null;

  // Koreografi Final CTA: sorot berurutan Kamar 1 -> Kamar 2 -> Kamar 3 -> Semua Menyala Bersama
  const r1Focus = isFinalCta ? pulseWindow(frame, 35, 95, 10) : 0;
  const r2Focus = isFinalCta ? pulseWindow(frame, 95, 155, 10) : 0;
  const r3Focus = isFinalCta ? pulseWindow(frame, 155, 215, 10) : 0;
  const allLit = isFinalCta ? easeOutCubic(clamp01((frame - 215) / 18)) : 0;
  const singleSeq = Math.max(r1Focus, r2Focus, r3Focus) * (1 - allLit);

  const dimBlend = activeRoom
    ? easeOutCubic(clamp01((frame - transitionStart) / 40))
    : isFinalCta
      ? singleSeq * 0.85
      : 0;

  const otherDim = 1 - dimBlend * 0.62;
  const roomDim: Record<RoomId, number> = isFinalCta
    ? {
        room1: Math.max(otherDim, r1Focus, allLit),
        room2: Math.max(otherDim, r2Focus, allLit),
        room3: Math.max(otherDim, r3Focus, allLit),
      }
    : {
        room1: !activeRoom || activeRoom === 'room1' ? 1 : otherDim,
        room2: !activeRoom || activeRoom === 'room2' ? 1 : otherDim,
        room3: !activeRoom || activeRoom === 'room3' ? 1 : otherDim,
      };

  const roomElev: Record<RoomId, number> = isFinalCta
    ? {
        room1: r1Focus * 0.42 + allLit * 0.05,
        room2: r2Focus * 0.42 + allLit * 0.05,
        room3: r3Focus * 0.42 + allLit * 0.05,
      }
    : { room1: 0, room2: 0, room3: 0 };

  const spotPos = activeRoom ? ROOM_SPOTLIGHT_POS[activeRoom] : null;

  return (
    <group>
      <ambientLight intensity={0.85 - dimBlend * 0.25 + allLit * 0.1} />
      <hemisphereLight args={['#FFFFFF', '#B5CC8E', 0.9 - dimBlend * 0.25 + allLit * 0.1]} />
      <directionalLight
        position={[9, 16, 7]}
        intensity={2.4 - dimBlend * 0.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={13}
        shadow-camera-bottom={-13}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-8, 6, 10]} intensity={0.45 - dimBlend * 0.15} />

      {/* Spotlight hangat terfokus di atas ruangan yang sedang aktif */}
      {spotPos && (
        <pointLight
          position={spotPos}
          intensity={dimBlend * 8.5}
          distance={9}
          decay={1.4}
          color="#FFF7E6"
        />
      )}

      {/* Spotlight berurutan & menyala bersama pada Final CTA */}
      {isFinalCta && (r1Focus > 0.02 || allLit > 0.02) && (
        <pointLight
          position={ROOM_SPOTLIGHT_POS.room1}
          intensity={r1Focus * 9.5 + allLit * 5.0}
          distance={10}
          decay={1.35}
          color="#ECFDF5"
        />
      )}
      {isFinalCta && (r2Focus > 0.02 || allLit > 0.02) && (
        <pointLight
          position={ROOM_SPOTLIGHT_POS.room2}
          intensity={r2Focus * 9.5 + allLit * 5.0}
          distance={11}
          decay={1.35}
          color="#FFF7ED"
        />
      )}
      {isFinalCta && (r3Focus > 0.02 || allLit > 0.02) && (
        <pointLight
          position={ROOM_SPOTLIGHT_POS.room3}
          intensity={r3Focus * 9.5 + allLit * 5.0}
          distance={10}
          decay={1.35}
          color="#EFF6FF"
        />
      )}

      <DimContext.Provider value={otherDim}>
        <Exterior frame={frame} />
        <Box p={[0, 0.15, 0]} s={[12.7, 0.3, 10.7]} c={SLAB} rough={0.8} />
      </DimContext.Provider>

      <group position={[0, 0.3, 0]}>
        <BuildingShell roomDim={roomDim} otherDim={otherDim} roomElev={roomElev} />

        <DimContext.Provider value={roomDim.room1}>
          <group position={[0, roomElev.room1, 0]}>
            <Room1
              frame={frame}
              celebrate={isFinalCta ? Math.max(r1Focus, allLit * 0.7) : 0}
            />
          </group>
        </DimContext.Provider>

        <DimContext.Provider value={roomDim.room2}>
          <group position={[0, roomElev.room2, 0]}>
            <Room2
              frame={frame}
              liveMode={activeRoom === 'room2'}
              celebrate={isFinalCta ? Math.max(r2Focus, allLit * 0.7) : 0}
            />
          </group>
        </DimContext.Provider>

        <DimContext.Provider value={roomDim.room3}>
          <group position={[0, roomElev.room3, 0]}>
            <Room3
              frame={frame}
              liveMode={activeRoom === 'room3'}
              celebrate={isFinalCta ? Math.max(r3Focus, allLit * 0.7) : 0}
            />
          </group>
        </DimContext.Provider>
      </group>
    </group>
  );
};

// ============================================================================
// FLOATING PILL (HTML)
// ============================================================================
export const HubPill: React.FC<{
  text: string;
  accent: string;
  sub?: string;
  borderColor?: string;
  variant?: 'clean' | 'problem';
  fontSize?: number;
}> = ({ text, accent, sub, borderColor, variant = 'clean', fontSize = 22 }) => {
  const problem = variant === 'problem';
  const bg = problem ? '#EF4444' : '#FFFFFF';
  const twoLine = Boolean(sub && !problem);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: JAKARTA }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: twoLine ? '10px 18px 10px 14px' : '11px 20px 11px 14px',
          borderRadius: twoLine ? 22 : 999,
          background: bg,
          border: borderColor && !problem ? `2px solid ${borderColor}` : undefined,
          color: problem ? '#FFFFFF' : '#1F1F1F',
          fontSize,
          fontWeight: 800,
          letterSpacing: '-0.01em',
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
          boxShadow: problem
            ? '0 12px 26px rgba(185, 28, 28, 0.35), 0 2px 4px rgba(15,23,42,0.12)'
            : '0 12px 26px rgba(15, 23, 42, 0.18), 0 2px 4px rgba(15, 23, 42, 0.08)',
        }}
      >
        {problem ? (
          <span
            style={{
              width: fontSize + 4,
              height: fontSize + 4,
              borderRadius: 999,
              background: '#FFFFFF',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: fontSize * 0.85,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            ?
          </span>
        ) : (
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: accent,
              boxShadow: `0 0 0 4px ${accent}33`,
              flexShrink: 0,
            }}
          />
        )}
        {twoLine ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ color: '#1F1F1F', fontWeight: 800, fontSize, lineHeight: 1.15 }}>{text}</span>
            <span style={{ color: '#555555', fontWeight: 700, fontSize: Math.round(fontSize * 0.72), lineHeight: 1.2 }}>
              {sub}
            </span>
          </div>
        ) : (
          text
        )}
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderTop: `10px solid ${bg}`,
        }}
      />
    </div>
  );
};

// ============================================================================
// KOMPONEN UTAMA
// ============================================================================
export interface MohefTechHub3DProps {
  cameraStage: CameraStage;
  frame: number;
  width?: number;
  height?: number;
  /** Posisi Y (px, di dalam kanvas) tempat titik fokus kamera diletakkan */
  focusY?: number;
  fromStage?: CameraStage;
  transitionStart?: number;
  transitionDuration?: number;
  /** Dolly-in pembuka (frame). 0 = tanpa intro */
  introFrames?: number;
  showPills?: boolean;
  /** Tampilkan floating pill studi kasus saat cameraStage === 'room1-infra' */
  showCaseStudyPills?: boolean;
  /** Override render pill per kamar (posisi sudah diproyeksikan otomatis) */
  renderPill?: (room: RoomInfo, index: number) => React.ReactNode;
  style?: React.CSSProperties;
}

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const MohefTechHub3D: React.FC<MohefTechHub3DProps> = ({
  cameraStage,
  frame,
  width = 1080,
  height = 1920,
  focusY = 740,
  fromStage,
  transitionStart,
  transitionDuration,
  introFrames = 0,
  showPills = true,
  showCaseStudyPills = true,
  renderPill,
  style,
}) => {
  const pose = useMemo(
    () => resolveCameraPose({ cameraStage, frame, fromStage, transitionStart, transitionDuration, introFrames }),
    [cameraStage, frame, fromStage, transitionStart, transitionDuration, introFrames],
  );

  const activeCasePills = useMemo(() => {
    if (!showCaseStudyPills || renderPill) return null;
    if (cameraStage === 'room1-infra') return ROOM1_CASE_PILLS;
    if (cameraStage === 'room2-hardware') return ROOM2_CASE_PILLS;
    if (cameraStage === 'room3-software') return ROOM3_CASE_PILLS;
    if (cameraStage === 'final-cta') return FINAL_CTA_PILLS;
    return null;
  }, [cameraStage, showCaseStudyPills, renderPill]);

  const { projected, projectedCasePills } = useMemo(() => {
    const cam = new THREE.PerspectiveCamera();
    applyPose(cam, pose, width, height, focusY);
    const projectPt = (p: V3) => {
      const v = new THREE.Vector3(p[0], p[1] + 0.3, p[2]).project(cam);
      return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height };
    };
    return {
      projected: ROOMS.map((room) => projectPt(room.anchor)),
      projectedCasePills: (activeCasePills ?? []).map((pill) => projectPt(pill.anchor)),
    };
  }, [pose, width, height, focusY, activeCasePills]);

  return (
    <div style={{ position: 'relative', width, height, ...style }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        flat
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        camera={{ fov: pose.fov, near: 1, far: 400, position: [40, 50, 50] }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <CameraController pose={pose} width={width} height={height} focusY={focusY} />
        <Diorama frame={frame} cameraStage={cameraStage} transitionStart={transitionStart} />
      </ThreeCanvas>

      {showPills && !activeCasePills && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {ROOMS.map((room, i) => {
            if (
              (cameraStage === 'room1-infra' && room.id !== 'room1') ||
              (cameraStage === 'room2-hardware' && room.id !== 'room2') ||
              (cameraStage === 'room3-software' && room.id !== 'room3')
            ) {
              return null;
            }
            const pt = projected[i];
            const x = Math.min(width * 0.67, Math.max(width * 0.33, pt.x));
            return (
              <div
                key={room.id}
                style={{
                  position: 'absolute',
                  left: x,
                  top: pt.y,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                {renderPill ? (
                  renderPill(room, i)
                ) : (
                  <HubPill text={room.label} accent={room.accent} sub={room.sub} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {showPills && activeCasePills && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {activeCasePills.map((pill, i) => {
            const p = clamp01((frame - pill.startFrame) / 14);
            if (p <= 0) return null;
            const pop = easeOutBack(p);
            const pt = projectedCasePills[i];
            const x = Math.min(width - 265, Math.max(265, pt.x));
            return (
              <div
                key={pill.id}
                style={{
                  position: 'absolute',
                  left: x,
                  top: pt.y,
                  opacity: clamp01(p * 1.5),
                  transform: `translate(-50%, calc(-100% + ${(1 - pop) * 16}px)) scale(${lerp(0.78, 1, pop)})`,
                  transformOrigin: '50% 100%',
                }}
              >
                <HubPill
                  text={pill.text}
                  sub={pill.sub}
                  accent={pill.accent}
                  borderColor={pill.borderColor}
                  fontSize={19}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MohefTechHub3D;
