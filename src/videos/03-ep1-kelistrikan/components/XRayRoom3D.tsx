import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { interpolate, useCurrentFrame } from 'remotion';
import { EP1_COLORS, EP1_LAYOUT } from '../constants';

type V3 = [number, number, number];

export interface XRayRoom3DProps {
  /** 0 = ruang terang daylight, 1 = Dark Blueprint X-Ray mode */
  xrayProgress: number;
  /** 0..1 progres posisi garis scanline sapuan (undefined / <0 / >1 = nonaktif) */
  scanlineProgress?: number;
  /** Intensitas nyala kabel default (0..1) */
  conduitGlow?: number;
  /** Override intensitas jalur Power 220V (0..1) */
  powerGlow?: number;
  /** Override warna jalur Power 220V (mis. '#EF4444' saat overload) */
  powerColor?: string;
  /** Override intensitas jalur Grounding (0..1) */
  groundGlow?: number;
  /** Override intensitas jalur Data (0..1) */
  dataGlow?: number;
  /** Override intensitas jalur Power ke AC Split dinding kiri */
  acPowerGlow?: number;
  /** Override warna jalur Power ke AC Split dinding kiri */
  acPowerColor?: string;
  /** Override intensitas jalur LAN dari Router ke meja kerja */
  lanGlow?: number;
  /** Override intensitas jalur tersembunyi di balik TV ke PS5 */
  tvConduitGlow?: number;
  /** Sorot detail Box MCB & Earth Rod (0..1) */
  mcbHighlight?: number;
  /** Intensitas kedip alert merah overload (0..1) */
  overloadAlert?: number;
  /** Override nyala Titik Stopkontak 1 (30cm Oranye) */
  outlet1Glow?: number;
  /** Override nyala Titik Stopkontak 2 (85cm Sian) */
  outlet2Glow?: number;
  /** Nyala Titik Stopkontak 3 (Kluster Belakang Kaki Meja Hijau) */
  outlet3Glow?: number;
  /** Nyala garis ukur ketinggian 30cm & 85cm */
  heightGuidesGlow?: number;
  /** Nyala perisai pelindung hijau pada Unit UPS & Surge Protector (0..1) */
  upsShieldGlow?: number;
  /** Nyala arus masuk dari stopkontak dinding ke Surge Protector / UPS (0..1) */
  surgeInflowGlow?: number;
  /** Warna arus masuk ke UPS (mis. '#EF4444' saat lonjakan tegangan) */
  surgeInflowColor?: string;
  /** Nyala jalur daya tersaring dari UPS ke PC & Monitor (0..1) */
  upsOutputGlow?: number;
  /** Warna jalur daya tersaring dari UPS ke PC & Monitor */
  upsOutputColor?: string;
  /** Nyala Under-Desk Cable Tray & jalur terpisah Power vs Data (0..1) */
  cableTrayGlow?: number;
  /** Nyala kerangka konstruksi Meja Kerja Episode 2 teaser (0..1) */
  deskTeaserGlow?: number;
  /** Overlay HTML terproyeksi di atas panggung 3D */
  overlays?: React.ReactNode;
  /** Rotasi Y ruangan dalam radian */
  roomRotationY?: number;
  /** Zoom kamera ortografik */
  cameraZoom?: number;
  /** Posisi target/offset ruangan */
  roomOffset?: V3;
}

const XRayBox: React.FC<{
  size: V3;
  position?: V3;
  rotation?: V3;
  color: string;
  xray: number;
  xrayColor?: string;
  edgeColor?: string;
  xrayOpacity?: number;
  roughness?: number;
}> = ({
  size,
  position,
  rotation,
  color,
  xray,
  xrayColor = '#071426',
  edgeColor = '#38BDF8',
  xrayOpacity = 0.16,
  roughness = 0.78,
}) => {
  const fill = useMemo(() => {
    const c = new THREE.Color(color);
    const bp = new THREE.Color(xrayColor);
    return xray > 0 ? c.lerp(bp, xray) : c;
  }, [color, xrayColor, xray]);

  const edgeGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(size[0], size[1], size[2])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size[0], size[1], size[2]]
  );

  const opacity = 1 - xray * (1 - xrayOpacity);

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow={xray < 0.4} receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={fill}
          roughness={roughness}
          transparent
          opacity={opacity}
          depthWrite={opacity > 0.55}
        />
      </mesh>
      {xray > 0.02 && (
        <lineSegments geometry={edgeGeo}>
          <lineBasicMaterial color={edgeColor} transparent opacity={xray * 0.78} />
        </lineSegments>
      )}
    </group>
  );
};

const GlowingPipeSegment: React.FC<{
  start: V3;
  end: V3;
  radius?: number;
  color: string;
  glow: number;
}> = ({ start, end, radius = 0.024, color, glow }) => {
  const { mid, length, quaternion } = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const midVec = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    return {
      mid: [midVec.x, midVec.y, midVec.z] as V3,
      length: Math.max(0.001, len),
      quaternion: q,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start[0], start[1], start[2], end[0], end[1], end[2]]);

  if (glow <= 0.01) return null;

  return (
    <group position={mid} quaternion={quaternion}>
      <mesh>
        <cylinderGeometry args={[radius, radius, length, 10]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.6 * glow}
          transparent
          opacity={Math.min(1, glow * 1.15)}
          roughness={0.25}
        />
      </mesh>
      {/* Halo lembut di sekeliling pipa */}
      <mesh>
        <cylinderGeometry args={[radius * 2.1, radius * 2.1, length, 10]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.18 * glow}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

const PipePath: React.FC<{
  points: V3[];
  color: string;
  glow: number;
  radius?: number;
  pulseOffset?: number;
}> = ({ points, color, glow, radius = 0.024, pulseOffset = 0 }) => {
  const frame = useCurrentFrame();

  const segments = useMemo(() => {
    const segs: Array<{ start: V3; end: V3; len: number }> = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const dz = b[2] - a[2];
      segs.push({ start: a, end: b, len: Math.sqrt(dx * dx + dy * dy + dz * dz) });
    }
    return segs;
  }, [points]);

  const totalLen = useMemo(() => segments.reduce((s, x) => s + x.len, 0), [segments]);
  const t = ((frame * 0.024 + pulseOffset) % 1 + 1) % 1;

  const pulsePos = useMemo<V3 | null>(() => {
    if (totalLen <= 0.001) return null;
    let target = t * totalLen;
    for (const seg of segments) {
      if (target <= seg.len) {
        const u = seg.len > 0 ? target / seg.len : 0;
        return [
          seg.start[0] + (seg.end[0] - seg.start[0]) * u,
          seg.start[1] + (seg.end[1] - seg.start[1]) * u,
          seg.start[2] + (seg.end[2] - seg.start[2]) * u,
        ];
      }
      target -= seg.len;
    }
    return points[points.length - 1];
  }, [segments, totalLen, t, points]);

  if (glow <= 0.01) return null;

  return (
    <group>
      {segments.map((seg, idx) => (
        <GlowingPipeSegment
          key={idx}
          start={seg.start}
          end={seg.end}
          radius={radius}
          color={color}
          glow={glow}
        />
      ))}
      {points.map((p, idx) => (
        <mesh key={`joint-${idx}`} position={p}>
          <sphereGeometry args={[radius * 1.25, 10, 10]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.6 * glow}
            transparent
            opacity={glow}
          />
        </mesh>
      ))}
      {pulsePos && glow > 0.25 && (
        <mesh position={pulsePos}>
          <sphereGeometry args={[radius * 2.2, 12, 12]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={glow * 0.9} />
        </mesh>
      )}
    </group>
  );
};

export const XRayRoom3D: React.FC<XRayRoom3DProps> = ({
  xrayProgress,
  scanlineProgress,
  conduitGlow = xrayProgress,
  powerGlow = conduitGlow,
  powerColor = EP1_COLORS.power,
  groundGlow = conduitGlow,
  dataGlow = conduitGlow,
  acPowerGlow,
  acPowerColor,
  lanGlow,
  tvConduitGlow,
  mcbHighlight = 0,
  overloadAlert = 0,
  outlet1Glow,
  outlet2Glow,
  outlet3Glow = 0,
  heightGuidesGlow = 0,
  upsShieldGlow = 0,
  surgeInflowGlow = 0,
  surgeInflowColor = EP1_COLORS.overload,
  upsOutputGlow = 0,
  upsOutputColor = EP1_COLORS.ground,
  cableTrayGlow = 0,
  deskTeaserGlow = 0,
  overlays,
  roomRotationY = -0.18,
  cameraZoom = 112,
  roomOffset = [0, -0.82, 0],
}) => {
  const planks = [0, 1, 2, 3, 4, 5, 6, 7];
  const resolvedAcGlow = acPowerGlow ?? powerGlow * 0.8;
  const resolvedAcColor = acPowerColor ?? powerColor;
  const resolvedLanGlow = lanGlow ?? dataGlow * 0.85;
  const resolvedTvGlow = tvConduitGlow ?? dataGlow * 0.65;

  // Jalur Power 220V (Oranye): Dari MCB panel kiri-belakang -> menyusuri dinding -> stopkontak belakang meja -> bawah meja & PC
  const powerMainWallPath: V3[] = [
    [-1.35, 1.48, -1.88],
    [-1.35, 0.92, -1.88],
    [-0.25, 0.92, -1.88],
    [-0.25, 0.42, -1.88],
    [0.35, 0.42, -1.88],
    [0.35, 0.42, -1.35],
  ];

  // Jalur Power cabang atas meja (85cm)
  const powerUpperOutletPath: V3[] = [
    [-0.25, 0.92, -1.88],
    [0.25, 0.92, -1.88],
    [0.25, 0.96, -1.88],
  ];

  // Jalur Grounding (Hijau): Dari MCB panel turun menembus lantai ke Earth Rod
  const groundingPath: V3[] = [
    [-1.46, 1.42, -1.88],
    [-1.46, 0.16, -1.88],
    [-1.46, 0.04, -1.65],
    [-1.46, -0.14, -1.65],
  ];

  // Jalur Data/Monitor (Biru Sian): Terpisah sejajar dari PC bawah meja -> naik ke dual monitor & port data dinding
  const dataPath: V3[] = [
    [0.52, 0.44, -1.18],
    [0.52, 0.72, -1.36],
    [-0.08, 0.72, -1.46],
    [-0.08, 1.15, -1.46],
  ];

  const dataWallPath: V3[] = [
    [0.52, 0.44, -1.18],
    [0.72, 0.44, -1.84],
    [0.72, 1.25, -1.84],
  ];

  // Jalur Power AC Split di dinding kiri (dari Box MCB ke AC Split di atas TV)
  const acPowerPath: V3[] = [
    [-1.4, 1.56, -1.84],
    [-1.84, 1.56, -1.84],
    [-1.84, 2.02, -1.84],
    [-1.84, 2.02, 1.02],
    [-1.74, 2.02, 1.02],
  ];

  // Jalur LAN / Data dari Wall-Mounted Router menyusuri sudut dinding ke meja kerja
  const routerLanPath: V3[] = [
    [-1.78, 1.62, 0.08],
    [-1.84, 1.88, 0.08],
    [-1.84, 1.88, -1.84],
    [0.72, 1.88, -1.84],
    [0.72, 1.25, -1.84],
  ];

  // Jalur tersembunyi di balik Wall-Mounted TV turun ke Rak Konsol & PS5
  const tvHiddenPath: V3[] = [
    [-1.82, 1.24, 1.02],
    [-1.82, 0.46, 1.02],
    [-1.64, 0.46, 1.02],
  ];

  const lightKeyIntensity = interpolate(xrayProgress, [0, 1], [1.75, 0.55]);
  const lightAmbient = interpolate(xrayProgress, [0, 1], [0.65, 0.32]);
  const bgColor = xrayProgress > 0.5 ? '#060B14' : '#0E1A2E';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: bgColor }}>
      <ThreeCanvas
        width={EP1_LAYOUT.contentWidth}
        height={EP1_LAYOUT.stageHeight}
        orthographic
        shadows
        camera={{ position: [10, 10, 10], zoom: cameraZoom, near: 0.1, far: 100 }}
      >
        <ambientLight intensity={lightAmbient} />
        <hemisphereLight args={['#bae6fd', '#0f172a', 0.55 - xrayProgress * 0.25]} />
        <directionalLight
          position={[6, 12, 8]}
          intensity={lightKeyIntensity}
          color={xrayProgress > 0.5 ? '#7dd3fc' : '#fff7ed'}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />

        <group position={roomOffset} rotation={[0, roomRotationY, 0]}>
          {/* ===== ALAS PANGGUNG & LANTAI KAYU 4x4M ===== */}
          <XRayBox
            size={[4.5, 0.14, 4.5]}
            position={[0, -0.17, 0]}
            color="#0B1324"
            xray={xrayProgress}
            edgeColor="#1E3A5F"
            xrayOpacity={0.35}
          />
          {planks.map((i) => (
            <XRayBox
              key={i}
              size={[4, 0.2, 0.5]}
              position={[0, 0, -1.75 + i * 0.5]}
              color={i % 2 === 0 ? '#C9A47E' : '#BD9670'}
              xray={xrayProgress}
              xrayColor="#071324"
              edgeColor="#1E4068"
              xrayOpacity={0.2}
            />
          ))}

          {/* Grid X-Ray menyala di atas lantai saat mode Blueprint aktif */}
          {xrayProgress > 0.05 && (
            <gridHelper
              args={[4, 8, '#00E5FF', '#1E3A5F']}
              position={[0, 0.105, 0]}
            />
          )}

          {/* ===== DINDING BELAKANG (z = -1.9) ===== */}
          <group position={[0, 0.1, 0]}>
            <XRayBox
              size={[3.8, 2.2, 0.2]}
              position={[0.1, 1.1, -1.9]}
              color="#2B4766"
              xray={xrayProgress}
              xrayColor="#07162B"
              edgeColor="#38BDF8"
              xrayOpacity={0.14}
            />
            {/* Pintu kayu kanan */}
            <XRayBox
              size={[0.92, 1.88, 0.05]}
              position={[1.35, 1.05, -1.76]}
              color="#8B5A3C"
              xray={xrayProgress}
              edgeColor="#38BDF8"
              xrayOpacity={0.12}
            />
          </group>

          {/* ===== DINDING KIRI: JENDELA, AC SPLIT, ROUTER, TV & PS5 (x = -1.9) ===== */}
          <group position={[0, 0.1, 0]}>
            {/* Struktur dinding kiri dengan lubang jendela di z = -1.35..-0.15 */}
            <XRayBox size={[0.2, 0.85, 4]} position={[-1.9, 0.425, 0]} color="#E2E8F0" xray={xrayProgress} xrayOpacity={0.14} />
            <XRayBox size={[0.2, 0.45, 4]} position={[-1.9, 2.075, 0]} color="#E2E8F0" xray={xrayProgress} xrayOpacity={0.14} />
            <XRayBox size={[0.2, 1.0, 0.65]} position={[-1.9, 1.35, -1.675]} color="#E2E8F0" xray={xrayProgress} xrayOpacity={0.14} />
            <XRayBox size={[0.2, 1.0, 2.15]} position={[-1.9, 1.35, 0.925]} color="#E2E8F0" xray={xrayProgress} xrayOpacity={0.14} />

            {/* Langit terang di luar jendela pada fase daylight */}
            {xrayProgress < 0.9 && (
              <mesh position={[-2.04, 1.35, -0.75]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[1.35, 1.15]} />
                <meshBasicMaterial
                  color="#7DD3FC"
                  transparent
                  opacity={1 - xrayProgress}
                />
              </mesh>
            )}

            {/* Unit AC Split di bagian atas dinding kiri (depan sofa) */}
            <group position={[-1.70, 1.98, 1.02]}>
              <XRayBox
                size={[0.20, 0.25, 0.92]}
                color="#F1F5F9"
                xray={xrayProgress}
                xrayColor="#0A192F"
                edgeColor={overloadAlert > 0.2 ? EP1_COLORS.overload : EP1_COLORS.data}
                xrayOpacity={0.28}
              />
              {/* Louver & LED status AC */}
              <mesh position={[-0.08, -0.1, 0]}>
                <boxGeometry args={[0.04, 0.025, 0.82]} />
                <meshBasicMaterial
                  color={overloadAlert > 0.2 ? EP1_COLORS.overload : EP1_COLORS.data}
                  transparent
                  opacity={0.45 + resolvedAcGlow * 0.5}
                />
              </mesh>
            </group>

            {/* Wall-Mounted Router / Access Point (aksen Sian #00E5FF) */}
            <group position={[-1.76, 1.56, 0.08]}>
              <XRayBox
                size={[0.06, 0.18, 0.26]}
                color="#1E293B"
                xray={xrayProgress}
                xrayColor="#091B30"
                edgeColor={EP1_COLORS.data}
                xrayOpacity={0.35}
              />
              {/* Antena Router */}
              <XRayBox size={[0.015, 0.14, 0.015]} position={[0, 0.15, -0.09]} color="#0F172A" xray={xrayProgress} edgeColor={EP1_COLORS.data} xrayOpacity={0.4} />
              <XRayBox size={[0.015, 0.14, 0.015]} position={[0, 0.15, 0.09]} color="#0F172A" xray={xrayProgress} edgeColor={EP1_COLORS.data} xrayOpacity={0.4} />
              {/* Strip LED Sian */}
              <mesh position={[0.034, 0, 0]}>
                <boxGeometry args={[0.008, 0.025, 0.18]} />
                <meshBasicMaterial color={EP1_COLORS.data} transparent opacity={0.45 + resolvedLanGlow * 0.55} />
              </mesh>
            </group>

            {/* Wall-Mounted TV (depan sofa) */}
            <group position={[-1.76, 1.24, 1.02]}>
              <XRayBox
                size={[0.05, 0.62, 1.1]}
                color="#0F172A"
                xray={xrayProgress}
                xrayColor="#071426"
                edgeColor={EP1_COLORS.data}
                xrayOpacity={0.26}
              />
              <mesh position={[0.028, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[1.02, 0.54]} />
                <meshBasicMaterial
                  color={EP1_COLORS.data}
                  transparent
                  opacity={0.14 + resolvedTvGlow * 0.24}
                />
              </mesh>
            </group>

            {/* Rak Konsol Pendek + Siluet PS5 */}
            <group position={[-1.60, 0.22, 1.02]}>
              <XRayBox
                size={[0.36, 0.24, 1.22]}
                position={[0, 0.1, 0]}
                color="#334155"
                xray={xrayProgress}
                xrayColor="#091628"
                edgeColor="#38BDF8"
                xrayOpacity={0.2}
              />
              {/* Kaki konsol */}
              <XRayBox size={[0.04, 0.1, 0.04]} position={[0, -0.07, -0.52]} color="#1E293B" xray={xrayProgress} xrayOpacity={0.2} />
              <XRayBox size={[0.04, 0.1, 0.04]} position={[0, -0.07, 0.52]} color="#1E293B" xray={xrayProgress} xrayOpacity={0.2} />

              {/* Siluet PS5 berdiri di atas rak konsol */}
              <group position={[0.02, 0.36, 0.32]}>
                <XRayBox
                  size={[0.09, 0.28, 0.22]}
                  color="#F8FAFC"
                  xray={xrayProgress}
                  xrayColor="#0F233D"
                  edgeColor={EP1_COLORS.data}
                  xrayOpacity={0.34}
                />
                {/* Strip cahaya biru PS5 */}
                <mesh position={[0.048, 0.01, 0]}>
                  <boxGeometry args={[0.008, 0.22, 0.02]} />
                  <meshBasicMaterial color={EP1_COLORS.data} transparent opacity={0.5 + resolvedTvGlow * 0.5} />
                </mesh>
              </group>
            </group>
          </group>

          {/* ===== WORKSTATION DESK, PC TOWER, MONITOR & KURSI (ZONA KERJA) ===== */}
          <group position={[0.05, 0.1, -1.25]}>
            {/* Daun meja */}
            <XRayBox
              size={[1.55, 0.06, 0.74]}
              position={[0, 0.74, 0]}
              color="#B7865A"
              xray={xrayProgress}
              edgeColor={deskTeaserGlow > 0.1 ? '#FFFFFF' : '#38BDF8'}
              xrayOpacity={0.18 + deskTeaserGlow * 0.25}
            />
            {/* Kaki meja */}
            <XRayBox
              size={[0.05, 0.71, 0.62]}
              position={[-0.7, 0.355, 0]}
              color="#1E293B"
              xray={xrayProgress}
              edgeColor={deskTeaserGlow > 0.1 ? EP1_COLORS.data : '#38BDF8'}
              xrayOpacity={0.2 + deskTeaserGlow * 0.25}
            />
            <XRayBox
              size={[0.05, 0.71, 0.62]}
              position={[0.7, 0.355, 0]}
              color="#1E293B"
              xray={xrayProgress}
              edgeColor={deskTeaserGlow > 0.1 ? EP1_COLORS.data : '#38BDF8'}
              xrayOpacity={0.2 + deskTeaserGlow * 0.25}
            />

            {/* Under-Desk Cable Tray + Velcro Loop Straps */}
            {cableTrayGlow > 0.02 && (
              <group position={[0, 0.61, -0.22]}>
                <XRayBox
                  size={[1.16, 0.07, 0.22]}
                  color="#0F172A"
                  xray={xrayProgress}
                  edgeColor={EP1_COLORS.ground}
                  xrayOpacity={0.35 * cableTrayGlow}
                />
                {[-0.36, 0, 0.36].map((vx) => (
                  <mesh key={vx} position={[vx, 0, 0]}>
                    <boxGeometry args={[0.035, 0.085, 0.235]} />
                    <meshBasicMaterial
                      color={EP1_COLORS.ground}
                      transparent
                      opacity={0.75 * cableTrayGlow}
                    />
                  </mesh>
                ))}
              </group>
            )}

            {/* Teaser Kerangka Konstruksi Meja Ep. 2 berpendar terang */}
            {deskTeaserGlow > 0.02 && (
              <group>
                {/* Rangka palang ergonomis bawah meja */}
                <XRayBox
                  size={[1.42, 0.045, 0.055]}
                  position={[0, 0.68, 0.05]}
                  color={EP1_COLORS.data}
                  xray={1}
                  edgeColor="#FFFFFF"
                  xrayOpacity={0.42 * deskTeaserGlow}
                />
                {/* Halo garis bingkai daun meja */}
                <mesh position={[0, 0.785, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[1.57, 0.76]} />
                  <meshBasicMaterial
                    color={EP1_COLORS.data}
                    transparent
                    opacity={0.18 * deskTeaserGlow}
                  />
                </mesh>
                <pointLight
                  position={[0, 1.15, 0.15]}
                  intensity={deskTeaserGlow * 2.4}
                  distance={3.2}
                  color={EP1_COLORS.data}
                />
              </group>
            )}

            {/* Dual Monitor */}
            <XRayBox size={[0.76, 0.42, 0.04]} position={[-0.12, 1.15, -0.2]} color="#0F172A" xray={xrayProgress} xrayOpacity={0.24} />
            <mesh position={[-0.12, 1.15, -0.175]}>
              <planeGeometry args={[0.7, 0.36]} />
              <meshBasicMaterial
                color={xrayProgress > 0.5 ? EP1_COLORS.data : '#38BDF8'}
                transparent
                opacity={0.35 + xrayProgress * 0.4}
              />
            </mesh>
            <XRayBox size={[0.06, 0.24, 0.05]} position={[-0.12, 0.88, -0.22]} color="#334155" xray={xrayProgress} xrayOpacity={0.2} />

            {/* PC Tower di sisi kanan bawah/atas */}
            <XRayBox size={[0.24, 0.48, 0.46]} position={[0.48, 0.26, 0.02]} color="#1E293B" xray={xrayProgress} xrayOpacity={0.26} />
            {/* Strip LED PC */}
            <mesh position={[0.48, 0.28, 0.255]}>
              <planeGeometry args={[0.03, 0.34]} />
              <meshBasicMaterial color={EP1_COLORS.power} />
            </mesh>

            {/* Unit UPS di kolong meja sisi kiri */}
            <group position={[-0.48, 0.16, -0.08]}>
              <XRayBox
                size={[0.16, 0.28, 0.36]}
                color="#0F172A"
                xray={xrayProgress}
                edgeColor={upsShieldGlow > 0.2 ? EP1_COLORS.ground : EP1_COLORS.ground}
                xrayOpacity={0.35 + upsShieldGlow * 0.3}
              />
              {upsShieldGlow > 0.05 && (
                <>
                  {/* Panel LED Status Hijau UPS */}
                  <mesh position={[0, 0.06, 0.184]}>
                    <planeGeometry args={[0.09, 0.04]} />
                    <meshBasicMaterial color={EP1_COLORS.ground} transparent opacity={upsShieldGlow} />
                  </mesh>
                  {/* Cincin Perisai Pelindung Emerald (#10B981) */}
                  <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.24, 0.3, 32]} />
                    <meshBasicMaterial color={EP1_COLORS.ground} transparent opacity={upsShieldGlow * 0.85} />
                  </mesh>
                  <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.36, 0.39, 32]} />
                    <meshBasicMaterial color={EP1_COLORS.data} transparent opacity={upsShieldGlow * 0.45} />
                  </mesh>
                  {/* Dome Perisai Transparan di sekeliling UPS */}
                  <mesh position={[0, 0.02, 0]}>
                    <sphereGeometry args={[0.32, 20, 14]} />
                    <meshBasicMaterial
                      color={EP1_COLORS.ground}
                      transparent
                      opacity={upsShieldGlow * 0.16}
                      wireframe
                    />
                  </mesh>
                  <pointLight
                    position={[0, 0.2, 0.2]}
                    intensity={upsShieldGlow * 2.2}
                    distance={2.2}
                    color={EP1_COLORS.ground}
                  />
                </>
              )}
            </group>

            {/* Surge Protector Strip di kolong belakang meja */}
            {upsShieldGlow > 0.05 && (
              <group position={[-0.22, 0.06, -0.26]}>
                <XRayBox
                  size={[0.26, 0.05, 0.09]}
                  color="#1E293B"
                  xray={xrayProgress}
                  edgeColor={EP1_COLORS.power}
                  xrayOpacity={0.65}
                />
                <mesh position={[0, 0.028, 0]}>
                  <boxGeometry args={[0.18, 0.01, 0.03]} />
                  <meshBasicMaterial color={EP1_COLORS.ground} transparent opacity={upsShieldGlow} />
                </mesh>
              </group>
            )}

            {/* Kursi kerja */}
            <group position={[-0.1, 0, 0.65]}>
              <XRayBox size={[0.46, 0.08, 0.44]} position={[0, 0.44, 0]} color="#334155" xray={xrayProgress} xrayOpacity={0.16} />
              <XRayBox size={[0.44, 0.5, 0.07]} position={[0, 0.73, 0.2]} color="#334155" xray={xrayProgress} xrayOpacity={0.16} />
            </group>
          </group>

          {/* ===== LOUNGE / SOFA RINGKAS DI KANAN DEPAN (CONTINUITY 4x4M) ===== */}
          <group position={[1.05, 0.1, 0.85]} rotation={[0, -0.4, 0]}>
            <XRayBox size={[1.2, 0.24, 0.6]} position={[0, 0.16, 0]} color="#0369A1" xray={xrayProgress} xrayOpacity={0.12} />
            <XRayBox size={[1.2, 0.38, 0.14]} position={[0, 0.42, 0.23]} color="#0369A1" xray={xrayProgress} xrayOpacity={0.12} />
          </group>

          {/* ===== PANEL MCB & INFRASTRUKTUR X-RAY DI BALIK DINDING ===== */}
          {/* Box Panel MCB */}
          <group position={[-1.4, 1.5, -1.82]}>
            <XRayBox
              size={[0.38, 0.5, 0.11]}
              color="#334155"
              xray={xrayProgress}
              xrayColor="#0A192F"
              edgeColor={overloadAlert > 0.2 ? EP1_COLORS.overload : powerColor}
              xrayOpacity={0.65 + mcbHighlight * 0.2}
            />
            {powerGlow > 0.05 && (
              <>
                {/* Bar Indikator MCB Utama */}
                <mesh position={[-0.06, 0.08, 0.06]}>
                  <planeGeometry args={[0.1, 0.14]} />
                  <meshBasicMaterial color={powerColor} transparent opacity={powerGlow} />
                </mesh>
                {/* Bar Indikator MCB Khusus Workstation */}
                <mesh position={[0.07, 0.08, 0.06]}>
                  <planeGeometry args={[0.1, 0.14]} />
                  <meshBasicMaterial
                    color={overloadAlert > 0.2 ? EP1_COLORS.overload : EP1_COLORS.power}
                    transparent
                    opacity={powerGlow}
                  />
                </mesh>
                {/* Busbar Grounding di bagian bawah MCB */}
                {groundGlow > 0.05 && (
                  <mesh position={[0, -0.13, 0.06]}>
                    <planeGeometry args={[0.24, 0.05]} />
                    <meshBasicMaterial color={EP1_COLORS.ground} transparent opacity={groundGlow} />
                  </mesh>
                )}
              </>
            )}
            {overloadAlert > 0.05 && (
              <pointLight
                position={[0, 0, 0.45]}
                intensity={overloadAlert * 3.2}
                distance={2.6}
                color={EP1_COLORS.overload}
              />
            )}
            {mcbHighlight > 0.1 && overloadAlert <= 0.05 && (
              <pointLight
                position={[0, 0, 0.45]}
                intensity={mcbHighlight * 1.8}
                distance={2.4}
                color={groundGlow > 0.4 ? EP1_COLORS.ground : powerColor}
              />
            )}
          </group>

          {/* Titik Grounding / Earth Rod di lantai pojok MCB */}
          {groundGlow > 0.05 && (
            <group position={[-1.46, 0.12, -1.65]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.08, 0.15, 24]} />
                <meshBasicMaterial color={EP1_COLORS.ground} transparent opacity={groundGlow * 0.85} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.05, 16]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={groundGlow * 0.9} />
              </mesh>
            </group>
          )}

          {/* Titik Stopkontak Dinding (30cm, 85cm, & Kluster Kaki Meja) */}
          {(outlet1Glow ?? powerGlow) > 0.05 && (
            <group position={[-0.25, 0.42, -1.78]}>
              <mesh>
                <boxGeometry args={[0.16, 0.13, 0.045]} />
                <meshBasicMaterial color={powerColor} transparent opacity={outlet1Glow ?? powerGlow} />
              </mesh>
              {outlet1Glow !== undefined && (
                <mesh position={[0, 0, 0.03]}>
                  <ringGeometry args={[0.1, 0.135, 24]} />
                  <meshBasicMaterial color={EP1_COLORS.power} transparent opacity={outlet1Glow * 0.9} />
                </mesh>
              )}
            </group>
          )}
          {(outlet2Glow ?? powerGlow) > 0.05 && (
            <group position={[0.25, 0.96, -1.78]}>
              <mesh>
                <boxGeometry args={[0.16, 0.13, 0.045]} />
                <meshBasicMaterial
                  color={outlet2Glow !== undefined ? EP1_COLORS.data : powerColor}
                  transparent
                  opacity={outlet2Glow ?? powerGlow}
                />
              </mesh>
              {outlet2Glow !== undefined && (
                <mesh position={[0, 0, 0.03]}>
                  <ringGeometry args={[0.1, 0.135, 24]} />
                  <meshBasicMaterial color={EP1_COLORS.data} transparent opacity={outlet2Glow * 0.9} />
                </mesh>
              )}
            </group>
          )}
          {outlet3Glow > 0.05 && (
            <>
              <group position={[0.68, 0.36, -1.78]}>
                <mesh>
                  <boxGeometry args={[0.16, 0.13, 0.045]} />
                  <meshBasicMaterial color={EP1_COLORS.ground} transparent opacity={outlet3Glow} />
                </mesh>
                <mesh position={[0, 0, 0.03]}>
                  <ringGeometry args={[0.1, 0.135, 24]} />
                  <meshBasicMaterial color={EP1_COLORS.ground} transparent opacity={outlet3Glow * 0.9} />
                </mesh>
              </group>
              {/* Jalur kabel tersembunyi di belakang kaki meja kanan */}
              <PipePath
                points={[
                  [0.68, 0.36, -1.76],
                  [0.68, 0.36, -1.25],
                  [0.68, 0.78, -1.25],
                ]}
                color={EP1_COLORS.ground}
                glow={outlet3Glow}
                radius={0.02}
                pulseOffset={0.35}
              />
            </>
          )}
          {dataGlow > 0.05 && (
            <mesh position={[0.72, 1.25, -1.78]}>
              <boxGeometry args={[0.12, 0.12, 0.04]} />
              <meshBasicMaterial color={EP1_COLORS.data} transparent opacity={dataGlow} />
            </mesh>
          )}

          {/* Garis Ukur Ketinggian 3D: 30 CM & 85 CM */}
          {heightGuidesGlow > 0.05 && (
            <group>
              {/* Garis ukur 30 CM di kiri Titik 1 */}
              <GlowingPipeSegment
                start={[-0.5, 0.1, -1.74]}
                end={[-0.5, 0.42, -1.74]}
                radius={0.008}
                color={EP1_COLORS.power}
                glow={heightGuidesGlow}
              />
              <GlowingPipeSegment
                start={[-0.56, 0.1, -1.74]}
                end={[-0.44, 0.1, -1.74]}
                radius={0.008}
                color={EP1_COLORS.power}
                glow={heightGuidesGlow}
              />
              <GlowingPipeSegment
                start={[-0.56, 0.42, -1.74]}
                end={[-0.44, 0.42, -1.74]}
                radius={0.008}
                color={EP1_COLORS.power}
                glow={heightGuidesGlow}
              />

              {/* Garis ukur 85 CM di kanan Titik 2 */}
              <GlowingPipeSegment
                start={[0.48, 0.1, -1.74]}
                end={[0.48, 0.96, -1.74]}
                radius={0.008}
                color={EP1_COLORS.data}
                glow={heightGuidesGlow}
              />
              <GlowingPipeSegment
                start={[0.42, 0.1, -1.74]}
                end={[0.54, 0.1, -1.74]}
                radius={0.008}
                color={EP1_COLORS.data}
                glow={heightGuidesGlow}
              />
              <GlowingPipeSegment
                start={[0.42, 0.96, -1.74]}
                end={[0.54, 0.96, -1.74]}
                radius={0.008}
                color={EP1_COLORS.data}
                glow={heightGuidesGlow}
              />
            </group>
          )}

          {/* Pipa-Pipa Kabel Menyala */}
          <PipePath points={powerMainWallPath} color={powerColor} glow={powerGlow} radius={0.025} pulseOffset={0.1} />
          <PipePath points={powerUpperOutletPath} color={powerColor} glow={powerGlow} radius={0.02} pulseOffset={0.45} />
          <PipePath points={groundingPath} color={EP1_COLORS.ground} glow={groundGlow} radius={0.024} pulseOffset={0.7} />
          <PipePath points={dataPath} color={EP1_COLORS.data} glow={dataGlow} radius={0.018} pulseOffset={0.25} />
          <PipePath points={dataWallPath} color={EP1_COLORS.data} glow={dataGlow} radius={0.018} pulseOffset={0.6} />
          <PipePath points={acPowerPath} color={resolvedAcColor} glow={resolvedAcGlow} radius={0.021} pulseOffset={0.35} />
          <PipePath points={routerLanPath} color={EP1_COLORS.data} glow={resolvedLanGlow} radius={0.017} pulseOffset={0.8} />
          <PipePath points={tvHiddenPath} color={EP1_COLORS.data} glow={resolvedTvGlow} radius={0.016} pulseOffset={0.5} />

          {/* Arus masuk dari stopkontak dinding 30cm -> Surge Protector -> UPS */}
          {surgeInflowGlow > 0.02 && (
            <PipePath
              points={[
                [-0.25, 0.42, -1.78],
                [-0.25, 0.16, -1.78],
                [-0.17, 0.16, -1.51],
                [-0.43, 0.24, -1.33],
              ]}
              color={surgeInflowColor}
              glow={surgeInflowGlow}
              radius={0.024}
              pulseOffset={0.15}
            />
          )}

          {/* Jalur daya bersih tersaring dari UPS -> PC Tower & Monitor */}
          {upsOutputGlow > 0.02 && (
            <>
              <PipePath
                points={[
                  [-0.43, 0.24, -1.33],
                  [0.05, 0.24, -1.33],
                  [0.53, 0.24, -1.23],
                  [0.53, 0.36, -1.23],
                ]}
                color={upsOutputColor}
                glow={upsOutputGlow}
                radius={0.022}
                pulseOffset={0.4}
              />
              <PipePath
                points={[
                  [-0.43, 0.24, -1.33],
                  [-0.07, 0.24, -1.45],
                  [-0.07, 0.85, -1.45],
                  [-0.07, 1.15, -1.45],
                ]}
                color={EP1_COLORS.data}
                glow={upsOutputGlow}
                radius={0.018}
                pulseOffset={0.65}
              />
            </>
          )}

          {/* Jalur Kabel Power & Data Terpisah di Cable Tray Bawah Meja (Scene 5) */}
          {cableTrayGlow > 0.02 && (
            <>
              <PipePath
                points={[
                  [-0.43, 0.28, -1.33],
                  [-0.43, 0.70, -1.52],
                  [0.53, 0.70, -1.52],
                  [0.53, 0.50, -1.23],
                ]}
                color={EP1_COLORS.power}
                glow={cableTrayGlow}
                radius={0.018}
                pulseOffset={0.1}
              />
              <PipePath
                points={[
                  [0.53, 0.44, -1.23],
                  [0.53, 0.74, -1.40],
                  [-0.07, 0.74, -1.40],
                  [-0.07, 1.15, -1.45],
                ]}
                color={EP1_COLORS.data}
                glow={cableTrayGlow}
                radius={0.016}
                pulseOffset={0.55}
              />
            </>
          )}
        </group>
      </ThreeCanvas>

      {/* Overlay label 2D terproyeksi */}
      {overlays}

      {/* Efek Sapuan Garis Scanline 2D saat transisi ke Mode X-Ray */}
      {scanlineProgress !== undefined && scanlineProgress > 0 && scanlineProgress < 1 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${(scanlineProgress * 100).toFixed(1)}%`,
            height: 6,
            background: `linear-gradient(90deg, transparent, ${EP1_COLORS.data}, #FFFFFF, ${EP1_COLORS.power}, transparent)`,
            boxShadow: `0 0 28px 8px ${EP1_COLORS.data}88`,
            pointerEvents: 'none',
            zIndex: 14,
          }}
        />
      )}
    </div>
  );
};
