import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import {
  AbsoluteFill,
  Audio,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  AudioStage,
  BottomSubtitleBar,
  CameraRig,
  CustomSVGIcon,
  FlyText,
  ProceduralBackground,
  SeamlessSceneShell,
  SfxCue,
} from '../../lib/motion-craft';
import {
  EP2_BGM,
  EP2_COLORS,
  EP2_DURATIONS,
  EP2_FONTS,
  EP2_HEIGHT,
  EP2_SAFE,
  EP2_STYLE_PRESET,
  EP2_WIDTH,
  SCENE1_WORDS,
} from './constants';
import { CpuChip, RAM_ON_BOARD_ROTATION, RamStick } from './components/CpuRam';
import { GpuCard, GPU_ON_BOARD_ROTATION } from './components/GpuCard';
import { MB_LAYOUT, Motherboard } from './components/Motherboard';
import { NvmeSsd } from './components/NvmeSsd';
import {
  Box,
  Cyl,
  StudioEnvironment,
  StudioLights,
  tubeFromPoints,
  type V3,
} from './components/partsCommon';
import { CASE_LAYOUT, PcCase, Psu } from './components/PsuAndCase';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const DEG = Math.PI / 180;
const FLOOR_PLANK_INDICES = Array.from({ length: 18 }, (_, i) => i);

let cachedMonitorWallpaper: THREE.Texture | null = null;

const MonitorScreen: React.FC = () => {
  const [tex, setTex] = useState<THREE.Texture | null>(() => cachedMonitorWallpaper);

  useEffect(() => {
    if (cachedMonitorWallpaper) {
      setTex(cachedMonitorWallpaper);
      return;
    }
    const handle = delayRender('Loading monitor-wallpaper.png');
    const loader = new THREE.TextureLoader();
    loader.load(
      staticFile('images/monitor-wallpaper.png'),
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = 4;
        loaded.needsUpdate = true;
        cachedMonitorWallpaper = loaded;
        setTex(loaded);
        continueRender(handle);
      },
      undefined,
      () => {
        continueRender(handle);
      }
    );
  }, []);

  return (
    <mesh position={[0, 2.7, -0.05]}>
      <planeGeometry args={[5.68, 3.05]} />
      <meshStandardMaterial
        color="#ffffff"
        map={tex}
        emissive="#ffffff"
        emissiveMap={tex}
        emissiveIntensity={0.62}
        roughness={0.28}
        metalness={0.05}
      />
    </mesh>
  );
};

interface CamPose {
  dist: number;
  az: number;
  el: number;
  fov: number;
  target: V3;
}

const applyPerspectivePose = (
  cam: THREE.PerspectiveCamera,
  pose: CamPose,
  width: number,
  height: number,
  focusY: number
) => {
  const az = pose.az * DEG;
  const el = pose.el * DEG;
  const [tx, ty, tz] = pose.target;
  cam.fov = pose.fov;
  cam.aspect = width / height;
  cam.near = 0.5;
  cam.far = 220;
  cam.position.set(
    tx + pose.dist * Math.cos(el) * Math.sin(az),
    ty + pose.dist * Math.sin(el),
    tz + pose.dist * Math.cos(el) * Math.cos(az)
  );
  cam.up.set(0, 1, 0);
  cam.lookAt(tx, ty, tz);
  cam.setViewOffset(width, height, 0, height / 2 - focusY, width, height);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
};

const SceneCameraController: React.FC<{
  pose: CamPose;
  width: number;
  height: number;
  focusY: number;
}> = ({ pose, width, height, focusY }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    applyPerspectivePose(camera, pose, width, height, focusY);
  }, [camera, pose, width, height, focusY]);
  return null;
};

const resolveCameraPose = (frame: number): CamPose => {
  const pBridge = interpolate(frame, [0, 124], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const pDilemma = interpolate(frame, [124, 252], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const pSolution = interpolate(frame, [252, EP2_DURATIONS.scene1], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const dist =
    32.5 - pBridge * 10.5 - pDilemma * 3.4 - pSolution * 2.1;
  const az =
    26 - pBridge * 8 - pDilemma * 5 - pSolution * 3 + Math.sin(frame * 0.025) * 0.6;
  const el = 20 - pBridge * 3.2 - pDilemma * 1.8 - pSolution * 1.0;

  const tx = 0.3 + pBridge * 2.5 + pDilemma * 1.0 + pSolution * 0.45;
  const ty = 7.4 + pBridge * 1.4 + pDilemma * 0.7 + pSolution * 0.25;
  const tz = -1.3 + pBridge * 0.35 + pDilemma * 0.2;

  return {
    dist,
    az,
    el,
    fov: 38,
    target: [tx, ty, tz],
  };
};

interface WorkstationCorner3DProps {
  frame: number;
}

const WorkstationCorner3D: React.FC<WorkstationCorner3DProps> = ({ frame }) => {
  const pose = useMemo(() => resolveCameraPose(frame), [frame]);

  // Sinkronisasi fase visual terhadap timestamp ep2-scene1-words.json
  const dilemma1Mix =
    interpolate(frame, [126, 140], [0, 1], clamp) *
    (1 - interpolate(frame, [182, 196], [0, 1], clamp));

  const dilemma2Mix =
    interpolate(frame, [184, 198], [0, 1], clamp) *
    (1 - interpolate(frame, [246, 260], [0, 1], clamp));

  const solutionMix = interpolate(frame, [252, 272], [0, 1], clamp);
  const warningAny = Math.max(dilemma1Mix, dilemma2Mix);

  // Kecepatan putar kipas: tertahan saat pengap, normal-halus saat terukur
  const fanSpeed = 0.24 - dilemma1Mix * 0.16 - dilemma2Mix * 0.08 + solutionMix * 0.06;
  const fanAngle = frame * fanSpeed;
  const ledPhase = frame * 0.012;

  // Kaca casing membuka halus saat Solusi dikunci agar interior seimbang terlihat jelas
  const glassOpen = interpolate(frame, [254, 298], [0.06, 0.54], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const pulseSlow = 0.55 + 0.45 * Math.sin(frame * 0.28);
  const pulseFast = 0.5 + 0.5 * Math.sin(frame * 0.45);

  const intakeColor =
    dilemma1Mix > 0.35
      ? EP2_COLORS.overload
      : dilemma2Mix > 0.35
      ? EP2_COLORS.power
      : EP2_COLORS.cold;
  const exhaustColor =
    warningAny > 0.35 ? EP2_COLORS.overload : EP2_COLORS.warm;

  // Dimensi skala nyata (1 unit = 10 cm): meja 165 × 76 × 75 cm, PC 46 × 47 × 22 cm
  const deskTopY = 7.5;
  const pcPos: V3 = [4.4, deskTopY, -0.7];
  const pcRotY = -0.28;

  // Titik stopkontak dinding Episode 1 (di belakang sisi kiri-tengah meja)
  const outletPos: V3 = [-2.2, 4.2, -5.54];
  // Titik masuk AC socket PSU di sisi belakang-kiri casing
  const psuAcTarget: V3 = [2.15, deskTopY + 0.51, -1.19];

  const cablePoints: V3[] = useMemo(
    () => [
      [outletPos[0] + 0.3, outletPos[1] - 0.05, outletPos[2] + 0.16],
      [-1.7, 3.6, -4.85],
      [-0.4, 5.4, -4.45],
      [1.1, 6.45, -3.95],
      [1.75, 7.65, -2.55],
      [psuAcTarget[0] - 0.08, psuAcTarget[1], psuAcTarget[2]],
    ],
    []
  );

  const cableCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        cablePoints.map((p) => new THREE.Vector3(...p)),
        false,
        'catmullrom',
        0.35
      ),
    [cablePoints]
  );

  const powerCordGeo = useMemo(
    () => tubeFromPoints(cablePoints, 0.085, 64, 12),
    [cablePoints]
  );

  const pulseT = (frame % 46) / 46;
  const pulsePos = cableCurve.getPointAt(pulseT);
  const powerPulseColor =
    dilemma1Mix > 0.35
      ? EP2_COLORS.overload
      : dilemma2Mix > 0.35
      ? EP2_COLORS.power
      : EP2_COLORS.ground;

  return (
    <ThreeCanvas
      width={EP2_WIDTH}
      height={EP2_HEIGHT}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      camera={{ fov: 38, near: 0.5, far: 220, position: [14, 18, 28] }}
    >
      <SceneCameraController pose={pose} width={EP2_WIDTH} height={EP2_HEIGHT} focusY={1110} />
      <StudioEnvironment intensity={0.82} />
      <StudioLights keyIntensity={2.0} />
      <pointLight
        position={[-2.2, 7.5, -2.5]}
        intensity={1.3}
        distance={16}
        color="#bae6fd"
      />
      <pointLight
        position={[4.6, 10.6, 2.8]}
        intensity={1.5 + warningAny * 0.8}
        distance={14}
        color={warningAny > 0.35 ? EP2_COLORS.overload : '#e0f2fe'}
      />

      {/* ===== LANTAI KAYU PAPAN KONTINUITAS EPISODE 1 ===== */}
      <group>
        {FLOOR_PLANK_INDICES.map((i) => (
          <Box
            key={i}
            size={[36, 0.25, 1.5]}
            position={[2, -0.125, -5.0 + i * 1.5]}
            color={i % 2 === 0 ? EP2_COLORS.plankA : EP2_COLORS.plankB}
            roughness={0.78}
          />
        ))}
      </group>

      {/* ===== SUDUT DINDING BERGAYA EPISODE 1 (#2B4766) ===== */}
      <Box
        size={[36, 24, 0.4]}
        position={[2, 12, -5.8]}
        color={EP2_COLORS.wall}
        roughness={0.84}
      />
      <Box
        size={[0.4, 24, 28]}
        position={[-12.6, 12, 6]}
        color="#233B57"
        roughness={0.84}
      />
      {/* Skirting board dinding */}
      <Box size={[36, 0.65, 0.08]} position={[2, 0.325, -5.56]} color="#1B2E46" roughness={0.65} />
      <Box size={[0.08, 0.65, 28]} position={[-12.36, 0.325, 6]} color="#1B2E46" roughness={0.65} />

      {/* Aksen jendela kiri lembut (kontinuitas Ep.1) */}
      <group position={[-12.35, 12.2, 0.6]}>
        <Box size={[0.12, 7.2, 8.2]} color="#16283D" roughness={0.5} />
        <mesh position={[0.08, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[7.6, 6.6]} />
          <meshBasicMaterial color="#7DD3FC" transparent opacity={0.18} />
        </mesh>
      </group>

      {/* ===== TITIK STOPKONTAK DINDING EPISODE 1 (DUAL SOCKET + GROUNDING AMAN) ===== */}
      <group position={outletPos}>
        {/* Pelat stopkontak putih-slate */}
        <Box size={[1.55, 1.05, 0.14]} color="#E2E8F0" roughness={0.4} />
        {/* Soket kiri (indikator Power Ep.1) */}
        <Box size={[0.5, 0.56, 0.06]} position={[-0.36, -0.04, 0.08]} color="#0F172A" roughness={0.55} />
        {/* Soket kanan (tercolok kabel daya PC) */}
        <Box size={[0.5, 0.56, 0.06]} position={[0.32, -0.04, 0.08]} color="#0F172A" roughness={0.55} />
        {/* Kepala steker terpasang rapi */}
        <Box size={[0.38, 0.42, 0.24]} position={[0.32, -0.05, 0.18]} color="#16191E" roughness={0.45} />
        {/* LED Status Grounding & Proteksi Ep.1 */}
        <Box
          size={[0.32, 0.08, 0.04]}
          position={[0, 0.35, 0.08]}
          color={EP2_COLORS.ground}
          emissive={EP2_COLORS.ground}
          emissiveIntensity={1.9}
        />
        {/* Cincin halo aman Ep.1 */}
        <mesh position={[0.32, -0.05, 0.09]}>
          <ringGeometry args={[0.42, 0.5, 32]} />
          <meshBasicMaterial color={EP2_COLORS.ground} transparent opacity={0.72} />
        </mesh>
      </group>

      {/* ===== MEJA KERJA WORKSTATION UKURAN PENUH (165 × 76 × 75 CM) ===== */}
      <group position={[0.0, 0, -1.2]}>
        {/* Daun meja oak solid */}
        <Box size={[16.5, 0.38, 7.6]} position={[0, deskTopY - 0.19, 0]} color="#B7865A" roughness={0.65} />
        {/* Rangka baja bawah daun meja */}
        <Box size={[15.4, 0.26, 6.4]} position={[0, deskTopY - 0.5, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        {/* Kaki baja kiri & kanan */}
        <Box size={[0.48, 7.12, 5.8]} position={[-7.55, 3.56, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        <Box size={[0.48, 7.12, 5.8]} position={[7.55, 3.56, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        {/* Sepatu kaki meja */}
        <Box size={[0.62, 0.16, 6.2]} position={[-7.55, 0.08, 0]} color="#0F172A" roughness={0.7} />
        <Box size={[0.62, 0.16, 6.2]} position={[7.55, 0.08, 0]} color="#0F172A" roughness={0.7} />

        {/* Under-Desk Cable Tray (kontinuitas Ep.1 Scene 5) */}
        <Box size={[11.2, 0.42, 1.1]} position={[0, 6.45, -2.75]} color="#0F172A" metalness={0.5} roughness={0.5} />
        <Box
          size={[10.4, 0.07, 0.08]}
          position={[0, 6.45, -2.18]}
          color={EP2_COLORS.ground}
          emissive={EP2_COLORS.ground}
          emissiveIntensity={1.1}
        />

        {/* Desk Mat lebar + Monitor + Keyboard di sisi kiri (memberi ruang lega di kanan untuk PC) */}
        <Box size={[7.4, 0.05, 3.6]} position={[-3.3, deskTopY + 0.025, 0.7]} color="#111827" roughness={0.9} />
        {/* Keyboard & Mouse */}
        <Box size={[3.2, 0.12, 1.15]} position={[-3.8, deskTopY + 0.1, 0.85]} color="#1F2937" roughness={0.55} />
        <Box size={[0.62, 0.14, 1.05]} position={[-1.2, deskTopY + 0.1, 0.85]} color="#1F2937" roughness={0.45} />
        {/* Monitor 27" di sisi kiri-belakang */}
        <group position={[-3.6, deskTopY, -2.1]}>
          <Box size={[1.8, 0.1, 1.4]} position={[0, 0.05, 0]} color="#1E293B" metalness={0.6} roughness={0.4} />
          <Box size={[0.26, 1.8, 0.24]} position={[0, 0.95, -0.35]} color="#1E293B" metalness={0.6} roughness={0.4} />
          <Box size={[6.0, 3.35, 0.18]} position={[0, 2.7, -0.15]} color="#0F172A" roughness={0.4} />
          <MonitorScreen />
        </group>
      </group>

      {/* ===== KABEL DAYA AC DARI STOPKONTAK DINDING -> PSU PC ===== */}
      <mesh geometry={powerCordGeo}>
        <meshStandardMaterial color="#14181F" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[pulsePos.x, pulsePos.y, pulsePos.z]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial
          color={powerPulseColor}
          emissive={powerPulseColor}
          emissiveIntensity={2.3}
          toneMapped={false}
        />
      </mesh>

      {/* ===== UNIT PC SKALA 1:1 (PsuAndCase + Motherboard + CPU + RAM + NVMe + GPU) ===== */}
      <group position={pcPos} rotation={[0, pcRotY, 0]} scale={1}>
        <PcCase
          glassOpen={glassOpen}
          fanAngle={fanAngle}
          intakeColor={intakeColor}
          exhaustColor={exhaustColor}
          ringIntensity={warningAny > 0.35 ? 1.5 * pulseFast : 1.75}
        >
          <Psu position={CASE_LAYOUT.psuCenter} fanAngle={fanAngle} />

          <group position={CASE_LAYOUT.mbOrigin}>
            <Motherboard />
            <CpuChip
              position={[MB_LAYOUT.socket[0], MB_LAYOUT.socket[1], MB_LAYOUT.frontZ + 0.018]}
            />
            <RamStick
              position={[MB_LAYOUT.dimmU[1], MB_LAYOUT.dimmV, MB_LAYOUT.frontZ + 0.05]}
              rotation={RAM_ON_BOARD_ROTATION}
              ledPhase={ledPhase}
              ledIntensity={dilemma2Mix > 0.35 ? 0.5 : 1.6}
            />
            <RamStick
              position={[MB_LAYOUT.dimmU[3], MB_LAYOUT.dimmV, MB_LAYOUT.frontZ + 0.05]}
              rotation={RAM_ON_BOARD_ROTATION}
              ledPhase={ledPhase + 0.3}
              ledIntensity={dilemma2Mix > 0.35 ? 0.5 : 1.6}
            />
            <NvmeSsd
              position={[MB_LAYOUT.m2.centerU, MB_LAYOUT.m2.v, MB_LAYOUT.frontZ + 0.018]}
            />
            <GpuCard
              position={[-1.23, MB_LAYOUT.pcie1V, 0.14]}
              rotation={GPU_ON_BOARD_ROTATION}
              fanAngle={fanAngle}
              ledColor={
                dilemma2Mix > 0.35
                  ? EP2_COLORS.overload
                  : dilemma1Mix > 0.35
                  ? EP2_COLORS.power
                  : EP2_COLORS.data
              }
            />
          </group>

          {/* --- INDIKATOR DILEMA 1: Peringatan PSU Pas-pasan & Ruang Airflow Pengap --- */}
          {dilemma1Mix > 0.05 && (
            <group>
              {/* Halo peringatan berdenyut di sekitar PSU */}
              <mesh position={[CASE_LAYOUT.psuCenter[0], CASE_LAYOUT.psuCenter[1], 1.06]}>
                <ringGeometry args={[0.68, 0.84, 32]} />
                <meshBasicMaterial
                  color={EP2_COLORS.overload}
                  transparent
                  opacity={dilemma1Mix * (0.45 + 0.5 * pulseSlow)}
                />
              </mesh>
              <Box
                size={[1.8, 0.96, 1.65]}
                position={CASE_LAYOUT.psuCenter}
                color={EP2_COLORS.overload}
                emissive={EP2_COLORS.overload}
                emissiveIntensity={1.1 * pulseSlow}
                transparent
                opacity={0.2 * dilemma1Mix}
              />
              {/* Zona udara pengap di ruang dalam casing */}
              <Box
                size={[3.5, 2.7, 1.4]}
                position={[0.1, 2.7, 0.15]}
                color={EP2_COLORS.power}
                emissive={EP2_COLORS.overload}
                emissiveIntensity={0.9 * pulseSlow}
                transparent
                opacity={0.14 * dilemma1Mix}
              />
            </group>
          )}

          {/* --- INDIKATOR DILEMA 2: Ketidakseimbangan Beban / Bottleneck Antar-Komponen --- */}
          {dilemma2Mix > 0.05 && (
            <group>
              {/* GPU Over-spec (merah berdenyut berat) */}
              <Box
                size={[3.15, 0.68, 1.4]}
                position={[-0.55, 2.45, 0.15]}
                color={EP2_COLORS.overload}
                emissive={EP2_COLORS.overload}
                emissiveIntensity={1.4 * pulseFast}
                transparent
                opacity={0.22 * dilemma2Mix}
              />
              {/* CPU & RAM tertahan (kuning/oranye berlawanan fase) */}
              <Box
                size={[1.4, 1.45, 0.45]}
                position={[-0.55, 3.65, -0.72]}
                color={EP2_COLORS.power}
                emissive={EP2_COLORS.power}
                emissiveIntensity={1.2 * (1 - pulseFast)}
                transparent
                opacity={0.22 * dilemma2Mix}
              />
              {/* Link bottleneck berdenyut antara CPU dan GPU */}
              <Cyl
                radius={0.055}
                height={1.15}
                position={[-0.75, 3.02, -0.35]}
                color={EP2_COLORS.overload}
                emissive={EP2_COLORS.overload}
                emissiveIntensity={2.0 * pulseFast}
              />
            </group>
          )}

          {/* --- INDIKATOR SOLUSI: Stabil, Seimbang & Airflow Adem (Biru/Hijau) --- */}
          {solutionMix > 0.05 && (
            <group>
              {/* Aliran udara dingin depan -> belakang */}
              {[1.65, 2.75, 3.85].map((y, idx) => (
                <Cyl
                  key={y}
                  radius={0.042}
                  height={2.8}
                  axis="x"
                  position={[0.15 + ((frame * 0.06 + idx * 0.5) % 0.8) - 0.4, y, 0.15]}
                  color={EP2_COLORS.cold}
                  emissive={EP2_COLORS.cold}
                  emissiveIntensity={1.4}
                  transparent
                  opacity={0.52 * solutionMix}
                />
              ))}
              {/* Indikator PSU & Komponen seimbang hijau */}
              <mesh position={[CASE_LAYOUT.psuCenter[0], CASE_LAYOUT.psuCenter[1], 1.06]}>
                <ringGeometry args={[0.66, 0.78, 32]} />
                <meshBasicMaterial
                  color={EP2_COLORS.ground}
                  transparent
                  opacity={0.72 * solutionMix}
                />
              </mesh>
            </group>
          )}
        </PcCase>
      </group>
    </ThreeCanvas>
  );
};

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sinkronisasi ketat terhadap public/audio/vo/ep2-scene1-words.json
  const dilemma1Enter = spring({
    frame: frame - 126,
    fps,
    config: { damping: 16, stiffness: 170 },
  });
  const dilemma2Enter = spring({
    frame: frame - 184,
    fps,
    config: { damping: 16, stiffness: 170 },
  });
  const dilemmasExit = interpolate(frame, [248, 260], [0, 1], clamp);
  const solutionEnter = spring({
    frame: frame - 256,
    fps,
    config: { damping: 15, stiffness: 160 },
  });

  // Pergeseran posisi Dilema 1 dari tengah ke kiri saat Dilema 2 muncul
  const splitShift = spring({
    frame: frame - 184,
    fps,
    config: { damping: 16, stiffness: 150 },
  });

  const showDilemmas = frame >= 124 && frame <= 262;
  const showSolution = frame >= 254;

  const statusText =
    frame < 126
      ? 'EP.1 STOPKONTAK AMAN → SUPLAI DAYA PSU TERHUBUNG'
      : frame < 184
      ? 'DILEMA 1: PSU PAS-PASAN & SIRKULASI UDARA PENGAP'
      : frame < 252
      ? 'DILEMA 2: BEBAN CPU / GPU TIDAK SEIMBANG'
      : 'SOLUSI: RAKITAN TERUKUR, STABIL & ADEM';

  const statusColor =
    frame < 126
      ? EP2_COLORS.ground
      : frame < 184
      ? EP2_COLORS.overload
      : frame < 252
      ? EP2_COLORS.power
      : EP2_COLORS.data;

  const d1CenterX = (EP2_SAFE.contentWidth - 422) / 2;
  const d1LeftX = 0;
  const d1X = d1CenterX * (1 - splitShift) + d1LeftX * splitShift;

  return (
    <AbsoluteFill style={{ backgroundColor: EP2_COLORS.bg, fontFamily: EP2_FONTS.body }}>
      {/* VO & BGM Auto-Ducking (jangan ubah file audio) */}
      <Audio src={staticFile('audio/vo/ep2-scene1.mp3')} volume={1.0} />
      <AudioStage
        musicSrc={EP2_BGM}
        words={SCENE1_WORDS}
        bedSrc=""
        sfxTrackSrc=""
        baseMusicVolume={0.14}
      />

      {/* Efek Suara Sinkron */}
      <SfxCue frame={126} sfx="transition-whoosh-soft" volume={0.42} />
      <SfxCue frame={184} sfx="pop-drop" volume={0.42} />
      <SfxCue frame={254} sfx="transition-whoosh-soft" volume={0.38} />
      <SfxCue frame={258} sfx="confirm-chime" volume={0.48} />

      {/* Latar Prosedural Studio */}
      <ProceduralBackground stylePreset={EP2_STYLE_PRESET} driftSpeed={0.8} />

      {/* Panggung 3D Sudut Meja Kerja Proporsional + Stopkontak Ep.1 + PC */}
      <AbsoluteFill>
        <WorkstationCorner3D frame={frame} />
      </AbsoluteFill>

      {/* Gradien tipis atas & bawah agar teks HUD terbaca tajam tanpa menutupi PC */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(7, 11, 18, 0.88) 0%, rgba(7, 11, 18, 0.42) 30%, rgba(7, 11, 18, 0) 50%, rgba(7, 11, 18, 0.72) 100%)',
        }}
      />

      {/* Lapisan 2D Motion-Craft dalam Safe Zone (X: 90..960, Y: 56..1620) */}
      <SeamlessSceneShell
        startFrame={0}
        endFrame={EP2_DURATIONS.scene1}
        enterMode="portal-zoom-in"
        exitMode="none"
        background="transparent"
        enableTransitionSfx={false}
      >
        <CameraRig
          durationInFrames={EP2_DURATIONS.scene1}
          mode="calm-steady"
          stylePreset={EP2_STYLE_PRESET}
          enableVelocityBlur={false}
          enableRackFocusSpotlight={false}
        >
          {/* Header Brand Bar (Y: 56..114) */}
          <div
            style={{
              position: 'absolute',
              top: 56,
              left: EP2_SAFE.left,
              width: EP2_SAFE.contentWidth,
              height: 58,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 16px',
                borderRadius: 12,
                backgroundColor: 'rgba(15, 22, 34, 0.88)',
                border: `1px solid ${EP2_COLORS.border}`,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  backgroundColor: EP2_COLORS.power,
                  boxShadow: `0 0 10px ${EP2_COLORS.power}`,
                }}
              />
              <span
                style={{
                  fontFamily: EP2_FONTS.heading,
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  color: EP2_COLORS.ink,
                }}
              >
                MOHAMMED <span style={{ color: EP2_COLORS.muted }}>|</span>{' '}
                <span style={{ color: EP2_COLORS.power }}>MOHEF TECH</span>
              </span>
            </div>

            <div
              style={{
                padding: '9px 15px',
                borderRadius: 12,
                backgroundColor: 'rgba(15, 22, 34, 0.88)',
                border: `1px solid ${EP2_COLORS.data}44`,
                fontFamily: EP2_FONTS.mono,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: EP2_COLORS.data,
              }}
            >
              EP 02 • SCENE 01
            </div>
          </div>

          {/* Judul Hook Utama (Y: 132..248) */}
          <div
            style={{
              position: 'absolute',
              top: 132,
              left: EP2_SAFE.left,
              width: EP2_SAFE.contentWidth,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CustomSVGIcon
                name="cpu-node"
                size={24}
                color={EP2_COLORS.ink}
                accentColor={EP2_COLORS.power}
                startFrame={4}
              />
              <span
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1.0,
                  color: EP2_COLORS.ground,
                }}
              >
                LISTRIK EPISODE 1 AMAN • MASUK RAKIT PC
              </span>
            </div>

            <FlyText
              text="JANGAN SALAH PILIH PC!"
              start={8}
              stagger={1.3}
              dur={12}
              size={52}
              weight={900}
              family={EP2_FONTS.heading}
              color={EP2_COLORS.ink}
              flyingColor={EP2_COLORS.power}
              letterSpacing={-0.8}
            />
          </div>

          {/* Area Kartu Dilema 1 & Dilema 2 di Zona Atas/Tengah (Y: 256..490) */}
          {showDilemmas && (
            <div
              style={{
                position: 'absolute',
                top: 258,
                left: EP2_SAFE.left,
                width: EP2_SAFE.contentWidth,
                opacity: 1 - dilemmasExit,
                transform: `translate3d(0, ${(-dilemmasExit * 34).toFixed(1)}px, 0)`,
              }}
            >
              {/* Kartu Dilema 1 */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: d1X,
                  width: 422,
                  minHeight: 192,
                  padding: '16px 20px 18px',
                  borderRadius: 20,
                  backgroundColor: '#221218',
                  border: `2px solid ${
                    frame < 184 ? EP2_COLORS.overload : 'rgba(239, 68, 68, 0.45)'
                  }`,
                  boxShadow: '0 22px 48px rgba(0, 0, 0, 0.45)',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                  opacity: dilemma1Enter,
                  transform: `translate3d(0, ${((1 - dilemma1Enter) * 26).toFixed(1)}px, 0) scale(${(0.92 + 0.08 * dilemma1Enter).toFixed(3)})`,
                }}
              >
                <span
                  style={{
                    fontFamily: EP2_FONTS.mono,
                    fontSize: 13.5,
                    fontWeight: 800,
                    letterSpacing: 0.9,
                    color: EP2_COLORS.overload,
                  }}
                >
                  DILEMA 01
                </span>
                <div
                  style={{
                    fontFamily: EP2_FONTS.heading,
                    fontSize: 23,
                    fontWeight: 800,
                    lineHeight: 1.18,
                    color: EP2_COLORS.ink,
                  }}
                >
                  PC Paket Jadi: Spek Nanggung
                </div>
                <div
                  style={{
                    padding: '9px 12px',
                    borderRadius: 10,
                    backgroundColor: 'rgba(239, 68, 68, 0.16)',
                    border: '1px solid rgba(239, 68, 68, 0.45)',
                    fontFamily: EP2_FONTS.body,
                    fontSize: 16.5,
                    fontWeight: 700,
                    color: '#FCA5A5',
                  }}
                >
                  × PSU Pas-pasan &amp; Pengap
                </div>
              </div>

              {/* Kartu Dilema 2 */}
              {frame >= 182 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 448,
                    width: 422,
                    minHeight: 192,
                    padding: '16px 20px 18px',
                    borderRadius: 20,
                    backgroundColor: '#241812',
                    border: `2px solid ${EP2_COLORS.power}`,
                    boxShadow: '0 22px 48px rgba(0, 0, 0, 0.45)',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 10,
                    opacity: dilemma2Enter,
                    transform: `translate3d(0, ${((1 - dilemma2Enter) * 26).toFixed(1)}px, 0) scale(${(0.92 + 0.08 * dilemma2Enter).toFixed(3)})`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: EP2_FONTS.mono,
                      fontSize: 13.5,
                      fontWeight: 800,
                      letterSpacing: 0.9,
                      color: EP2_COLORS.power,
                    }}
                  >
                    DILEMA 02
                  </span>
                  <div
                    style={{
                      fontFamily: EP2_FONTS.heading,
                      fontSize: 23,
                      fontWeight: 800,
                      lineHeight: 1.18,
                      color: EP2_COLORS.ink,
                    }}
                  >
                    Asal Mahal: Tidak Seimbang
                  </div>
                  <div
                    style={{
                      padding: '9px 12px',
                      borderRadius: 10,
                      backgroundColor: 'rgba(255, 122, 47, 0.16)',
                      border: '1px solid rgba(255, 122, 47, 0.48)',
                      fontFamily: EP2_FONTS.body,
                      fontSize: 16.5,
                      fontWeight: 700,
                      color: '#FDBA74',
                    }}
                  >
                    × Komponen Bottleneck
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Kartu Solusi Utama Mengunci di Zona Atas/Tengah (Y: 258..460) */}
          {showSolution && (
            <div
              style={{
                position: 'absolute',
                top: 258,
                left: EP2_SAFE.left,
                width: EP2_SAFE.contentWidth,
                padding: '18px 24px 20px',
                borderRadius: 22,
                backgroundColor: '#0C2520',
                border: `2px solid ${EP2_COLORS.ground}`,
                boxShadow:
                  '0 24px 52px rgba(0, 0, 0, 0.5), 0 0 28px rgba(16, 185, 129, 0.18)',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                opacity: solutionEnter,
                transform: `translate3d(0, ${((1 - solutionEnter) * 28).toFixed(1)}px, 0) scale(${(0.94 + 0.06 * solutionEnter).toFixed(3)})`,
              }}
            >
              <span
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: 1.0,
                  color: EP2_COLORS.ground,
                }}
              >
                SOLUSI
              </span>
              <div
                style={{
                  fontFamily: EP2_FONTS.heading,
                  fontSize: 28,
                  fontWeight: 800,
                  lineHeight: 1.18,
                  color: EP2_COLORS.ink,
                }}
              >
                SOLUSI: Rakit PC Terukur Sesuai Kebutuhan Kerja
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 10,
                    backgroundColor: 'rgba(16, 185, 129, 0.18)',
                    border: '1px solid rgba(16, 185, 129, 0.55)',
                    fontFamily: EP2_FONTS.body,
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#6EE7B7',
                  }}
                >
                  ✓ Daya PSU Stabil
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 10,
                    backgroundColor: 'rgba(56, 189, 248, 0.18)',
                    border: '1px solid rgba(56, 189, 248, 0.55)',
                    fontFamily: EP2_FONTS.body,
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#7DD3FC',
                  }}
                >
                  ✓ Seimbang &amp; Adem
                </div>
              </div>
            </div>
          )}

          {/* Status Pill di Bawah Area 3D & di Atas Subtitle (Y: 1384) */}
          <div
            style={{
              position: 'absolute',
              top: 1384,
              left: EP2_SAFE.left,
              width: EP2_SAFE.contentWidth,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                borderRadius: 999,
                backgroundColor: 'rgba(11, 17, 29, 0.88)',
                border: `1px solid ${statusColor}66`,
                boxShadow: '0 10px 28px rgba(0, 0, 0, 0.45)',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: statusColor,
                  boxShadow: `0 0 10px ${statusColor}`,
                }}
              />
              <span
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 0.7,
                  color: EP2_COLORS.ink,
                }}
              >
                {statusText}
              </span>
            </div>
          </div>
        </CameraRig>
      </SeamlessSceneShell>

      {/* Bottom Subtitle Bar di Area Aman Bawah (>= 300px dari tepi bawah) */}
      <BottomSubtitleBar
        words={SCENE1_WORDS}
        stylePreset={EP2_STYLE_PRESET}
        fontSize={32}
        bottomOffset={EP2_SAFE.subtitleBottomOffset}
        maxWordsPerLine={6}
      />
    </AbsoluteFill>
  );
};
