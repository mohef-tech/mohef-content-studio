import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
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
  SCENE3_WORDS,
} from './constants';
import { CpuChip, RAM_ON_BOARD_ROTATION, RamStick } from './components/CpuRam';
import { GpuCard, GPU_ON_BOARD_ROTATION } from './components/GpuCard';
import { MB_LAYOUT, Motherboard } from './components/Motherboard';
import { NvmeSsd } from './components/NvmeSsd';
import {
  Box,
  Cyl,
  PART_COLORS,
  StudioEnvironment,
  StudioLights,
  tubeFromPoints,
  type V3,
} from './components/partsCommon';
import { CASE_DIM, CASE_LAYOUT, PcCase, Psu } from './components/PsuAndCase';
import { glassStreakTexture } from './components/textures';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const DEG = Math.PI / 180;
const FLOOR_PLANK_INDICES = Array.from({ length: 18 }, (_, i) => i);

/** Titik lubang mounting ATX untuk merender dudukan standoff kuningan di tray casing. */
const STANDOFF_COORDS: ReadonlyArray<readonly [number, number]> = [
  [-1.12, 1.42],
  [0.15, 1.42],
  [1.12, 1.42],
  [-1.12, -0.1],
  [0.15, -0.1],
  [1.12, -0.1],
  [-1.12, -1.42],
  [0.15, -1.42],
  [1.12, -1.42],
];

const PC_PIVOT_WORLD: V3 = [1.8, 7.54, 0.25];
const PC_ROT_Y = -0.18;

/** Konversi koordinat lokal PcCase -> koordinat dunia dengan memperhitungkan rotasi rebah-tegak tiltX. */
const caseLocalToWorld = (local: V3, tiltX: number): V3 => {
  const dx = local[0];
  const dy = local[1] + 0.1;
  const dz = local[2] + CASE_DIM.halfZ;
  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);
  const rx = dx;
  const ry = dy * cosX - dz * sinX;
  const rz = dy * sinX + dz * cosX;

  const cosY = Math.cos(PC_ROT_Y);
  const sinY = Math.sin(PC_ROT_Y);
  return [
    PC_PIVOT_WORLD[0] + rx * cosY + rz * sinY,
    PC_PIVOT_WORLD[1] + ry,
    PC_PIVOT_WORLD[2] - rx * sinY + rz * cosY,
  ];
};

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
        emissiveIntensity={0.48}
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

interface CamKeyframe extends CamPose {
  frame: number;
}

const CAM_KEYFRAMES: CamKeyframe[] = [
  // 0. Pembuka jembatan dari Scene 2: casing berdiri tegak di atas meja kerja
  { frame: 0, dist: 17.6, az: 24, el: 18, fov: 38, target: [1.5, 9.8, 0.9] },
  { frame: 54, dist: 17.2, az: 24, el: 19, fov: 38, target: [1.55, 9.75, 0.75] },
  // 1. Casing rebah terlentang + kamera naik ke sudut high-angle 3/4
  { frame: 112, dist: 13.8, az: 20, el: 49, fov: 38, target: [2.15, 8.45, -2.1] },
  // 2. Panel kaca terangkat lepas ke samping & overview rongga casing
  { frame: 186, dist: 13.0, az: 18, el: 51, fov: 38, target: [2.15, 8.35, -2.2] },
  { frame: 254, dist: 12.0, az: 16, el: 51, fov: 38, target: [1.9, 8.15, -2.4] },
  // 3. Step 1 — Motherboard ATX turun ke standoff
  { frame: 270, dist: 11.2, az: 15, el: 50, fov: 38, target: [1.65, 8.0, -2.6] },
  { frame: 304, dist: 10.8, az: 14, el: 50, fov: 38, target: [1.65, 8.0, -2.65] },
  // 4. Step 2 — CPU AM5 & SSD NVMe M.2 mengunci
  { frame: 318, dist: 9.2, az: 12, el: 52, fov: 38, target: [1.95, 7.9, -2.95] },
  { frame: 364, dist: 9.2, az: 13, el: 52, fov: 38, target: [1.9, 7.9, -2.7] },
  // 5. Step 3 — DDR5 RAM klik masuk slot DIMM
  { frame: 376, dist: 9.4, az: 15, el: 48, fov: 38, target: [2.65, 8.05, -3.15] },
  { frame: 394, dist: 9.6, az: 16, el: 48, fov: 38, target: [2.65, 8.05, -3.05] },
  // 6. Step 4 — GPU Triple-Fan turun masuk slot PCIe
  { frame: 406, dist: 10.8, az: 20, el: 44, fov: 38, target: [2.3, 8.15, -2.3] },
  { frame: 430, dist: 11.0, az: 21, el: 44, fov: 38, target: [2.2, 8.15, -2.2] },
  // 7. Step 5 — PSU 750W turun mengunci di kompartemen bawah
  { frame: 446, dist: 12.2, az: 25, el: 43, fov: 38, target: [1.15, 8.35, -1.55] },
  { frame: 488, dist: 12.6, az: 25, el: 43, fov: 38, target: [1.2, 8.35, -1.55] },
  // 8. Kaca menutup kembali & casing berdiri tegak (dalam kondisi mati / unpowered)
  { frame: 522, dist: 14.5, az: 25, el: 34, fov: 38, target: [1.45, 8.8, -0.5] },
  { frame: 558, dist: 16.6, az: 24, el: 19, fov: 38, target: [1.4, 9.5, 0.7] },
  // 9. Langkah A — Sorot kabel daya menancap ke stopkontak dinding aman Episode 1
  { frame: 582, dist: 12.2, az: 14, el: 15, fov: 38, target: [-1.45, 4.8, -3.9] },
  { frame: 618, dist: 11.8, az: 13, el: 14, fov: 38, target: [-1.65, 4.5, -4.4] },
  // 10. Langkah B — Sorot tombol power di atas casing ditekan
  { frame: 642, dist: 3.7, az: 26, el: 38, fov: 36, target: [3.35, 12.28, 2.15] },
  { frame: 664, dist: 3.6, az: 25, el: 37, fov: 36, target: [3.35, 12.28, 2.15] },
  // 11. Langkah C — Mundur ke sudut 3/4 hero shot saat kipas & LED menyala
  { frame: 708, dist: 17.8, az: 24.5, el: 18.5, fov: 38, target: [1.35, 9.45, 0.45] },
  { frame: EP2_DURATIONS.scene3, dist: 18.2, az: 25.5, el: 18.5, fov: 38, target: [1.35, 9.45, 0.45] },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const resolveAssemblyCameraPose = (frame: number): CamPose => {
  if (frame <= CAM_KEYFRAMES[0].frame) return CAM_KEYFRAMES[0];
  const last = CAM_KEYFRAMES[CAM_KEYFRAMES.length - 1];
  if (frame >= last.frame) return last;

  let idx = 0;
  for (let i = 0; i < CAM_KEYFRAMES.length - 1; i++) {
    if (frame >= CAM_KEYFRAMES[i].frame && frame <= CAM_KEYFRAMES[i + 1].frame) {
      idx = i;
      break;
    }
  }
  const a = CAM_KEYFRAMES[idx];
  const b = CAM_KEYFRAMES[idx + 1];
  const rawT = (frame - a.frame) / Math.max(1, b.frame - a.frame);
  const t = Easing.inOut(Easing.cubic)(rawT);

  return {
    dist: lerp(a.dist, b.dist, t),
    az: lerp(a.az, b.az, t) + Math.sin(frame * 0.02) * 0.16,
    el: lerp(a.el, b.el, t),
    fov: lerp(a.fov, b.fov, t),
    target: [
      lerp(a.target[0], b.target[0], t),
      lerp(a.target[1], b.target[1], t),
      lerp(a.target[2], b.target[2], t),
    ],
  };
};

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
  cam.near = 0.35;
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

/**
 * Kurva dua fase untuk pemasangan vertikal santai lalu kunci tegas ("klek"):
 * 1) Meluncur turun perlahan dari ketinggian `approachHeight` ke `hoverGap`.
 * 2) Mengunci tegas dari `hoverGap` ke `0` lewat spring ber-damping tinggi.
 */
const computeVerticalInstallOffset = (
  frame: number,
  fps: number,
  startFrame: number,
  snapFrame: number,
  approachHeight = 2.8,
  hoverGap = 0.36
) => {
  const approachT = interpolate(frame, [startFrame, snapFrame], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const snapSpring = spring({
    frame: frame - snapFrame,
    fps,
    config: { damping: 24, stiffness: 320, mass: 0.65 },
  });
  const approachZ = (1 - approachT) * (approachHeight - hoverGap);
  const snapZ = (1 - snapSpring) * hoverGap;
  return approachZ + snapZ;
};

/** Kilatan halo penguncian komponen ("klek") yang meredup cepat. */
const lockPulse = (frame: number, lockFrame: number) =>
  frame < lockFrame ? 0 : Math.exp(-Math.pow((frame - lockFrame) / 6, 2));

/** Panel kaca tempered yang bisa terangkat lepas ke samping lalu menutup kembali. */
const RemovableGlassPanel: React.FC<{
  liftOffset: number;
  slideX: number;
  slideZ: number;
  opacity: number;
}> = ({ liftOffset, slideX, slideZ, opacity }) => {
  const streak = glassStreakTexture();
  const { halfX: HX, height: H, halfZ: HZ } = CASE_DIM;
  if (opacity <= 0.01) return null;

  return (
    <group position={[slideX, H / 2 + slideZ, HZ + 0.0125 + liftOffset]}>
      <mesh renderOrder={10}>
        <boxGeometry args={[HX * 2, H, 0.025]} />
        <meshStandardMaterial
          color="#a5b8cc"
          metalness={0.3}
          roughness={0.05}
          transparent
          opacity={0.14 * opacity}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.014]} renderOrder={11}>
        <planeGeometry args={[HX * 2, H]} />
        <meshBasicMaterial map={streak} transparent opacity={0.55 * opacity} depthWrite={false} />
      </mesh>
      {[
        [-HX + 0.12, -H / 2 + 0.12],
        [HX - 0.12, -H / 2 + 0.12],
        [-HX + 0.12, H / 2 - 0.12],
        [HX - 0.12, H / 2 - 0.12],
      ].map(([x, y], i) => (
        <Cyl
          key={i}
          radius={0.05}
          height={0.05}
          axis="z"
          position={[x, y, 0.036]}
          color="#cbd5e1"
          metalness={0.95}
          roughness={0.25}
          transparent={opacity < 1}
          opacity={opacity}
        />
      ))}
    </group>
  );
};

interface AssemblyStage3DProps {
  frame: number;
  fps: number;
}

const AssemblyStage3D: React.FC<AssemblyStage3DProps> = ({ frame, fps }) => {
  const pose = useMemo(() => resolveAssemblyCameraPose(frame), [frame]);

  // 1. Transisi casing: berdiri (0) -> rebah terlentang (-90°) -> berdiri tegak (0)
  const layDownMix = interpolate(frame, [56, 112], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const standBackMix = interpolate(frame, [520, 556], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const tiltX = (-Math.PI / 2) * layDownMix * (1 - standBackMix);

  // 2. Panel kaca terangkat lepas ke samping (f 128..188), lalu menutup kembali (f 492..520)
  const glassOpenLift = interpolate(frame, [128, 152], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const glassOpenSlide = interpolate(frame, [146, 184], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const glassCloseSlide = interpolate(frame, [492, 508], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const glassCloseDrop = interpolate(frame, [504, 520], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

  const glassRemoveAmount = glassOpenSlide * (1 - glassCloseSlide);
  const glassLiftAmount = glassOpenLift * (1 - glassCloseDrop);
  const glassLiftOffset = glassLiftAmount * 1.15;
  const glassSlideX = glassRemoveAmount * 4.8;
  const glassSlideZ = glassRemoveAmount * 0.4;
  const glassOpacity =
    frame < 492
      ? interpolate(frame, [168, 186], [1, 0], clamp)
      : interpolate(frame, [492, 506], [0, 1], clamp);

  // 3. Pemasangan vertikal santai -> kunci tegas (sinkron ep2-scene3-words.json)
  // Step 1: Motherboard ATX
  const moboZ = computeVerticalInstallOffset(frame, fps, 258, 292, 2.9, 0.35);
  // Step 2: CPU AM5 & SSD NVMe M.2
  const cpuZ = computeVerticalInstallOffset(frame, fps, 308, 330, 2.4, 0.3);
  const nvmeZ = computeVerticalInstallOffset(frame, fps, 334, 356, 2.2, 0.25);
  const nvmeLatchSpring = spring({
    frame: frame - 356,
    fps,
    config: { damping: 24, stiffness: 320, mass: 0.6 },
  });
  // Step 3: DDR5 RAM Dual-Channel
  const ram1Z = computeVerticalInstallOffset(frame, fps, 368, 382, 2.3, 0.3);
  const ram2Z = computeVerticalInstallOffset(frame, fps, 374, 388, 2.3, 0.3);
  // Step 4: GPU Triple-Fan
  const gpuZ = computeVerticalInstallOffset(frame, fps, 398, 418, 2.7, 0.35);
  // Step 5: PSU 750W Modular
  const psuZ = computeVerticalInstallOffset(frame, fps, 434, 464, 2.7, 0.35);

  // 4. Urutan realistis menyalakan PC:
  // A: Kabel daya ditancapkan ke stopkontak aman Ep.1 (f 568..598)
  const wallPlugMix = interpolate(frame, [568, 598], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const wallOutletPowered = frame >= 598;
  const wallPlugFlash = lockPulse(frame, 598);

  // B: Tombol power di atas casing ditekan turun lalu kembali (f 648..664)
  const pressDown = interpolate(frame, [648, 654], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const pressReleaseSpring = spring({
    frame: frame - 655,
    fps,
    config: { damping: 14, stiffness: 280, mass: 0.5 },
  });
  const powerButtonDepth = pressDown * (1 - pressReleaseSpring) * 0.026;
  const buttonPressRipple = lockPulse(frame, 654);

  // C: Sistem baru menyala TEPAT setelah tombol power ditekan (frame >= 660)!
  // Sebelum frame 660, seluruh kipas = 0 RPM & semua LED komponen = MATI TOTAL.
  const powerOnMix = interpolate(frame, [660, 686], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const spinElapsed = Math.max(0, frame - 660);
  const fanAngle =
    spinElapsed <= 24
      ? 0.5 * ((spinElapsed * spinElapsed) / 24) * 0.24
      : 0.5 * 24 * 0.24 + (spinElapsed - 24) * 0.24;
  const psuFanAngle = fanAngle * 0.72;
  const ledPhase = frame * 0.015;

  // Flash penguncian tiap part
  const moboFlash = lockPulse(frame, 294);
  const cpuFlash = lockPulse(frame, 332);
  const nvmeFlash = lockPulse(frame, 358);
  const ramFlash = lockPulse(frame, 388);
  const gpuFlash = lockPulse(frame, 420);
  const psuFlash = lockPulse(frame, 466);

  // Dimensi & posisi meja kerja kontinu Episode 1
  const deskTopY = 7.5;
  const outletPos: V3 = [-2.4, 4.2, -5.54];
  const outletSocketPos: V3 = [outletPos[0] + 0.32, outletPos[1] - 0.05, outletPos[2] + 0.2];
  const standbyWallPlugPos: V3 = [outletPos[0] + 0.32, 3.25, -4.35];
  const wallPlugHeadPos: V3 = [
    lerp(standbyWallPlugPos[0], outletSocketPos[0], wallPlugMix),
    lerp(standbyWallPlugPos[1], outletSocketPos[1], wallPlugMix),
    lerp(standbyWallPlugPos[2], outletSocketPos[2], wallPlugMix),
  ];

  // Ujung kabel daya sisi PSU: terpasang di PSU setelah PSU masuk (f 466+)
  const psuPlugConnect = interpolate(frame, [466, 486], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const psuSocketWorld = caseLocalToWorld([-2.24, 0.51, 0.15], tiltX);
  const standbyPsuCordPos: V3 = [-0.15, 7.62, -2.5];
  const psuCordEndPos: V3 = [
    lerp(standbyPsuCordPos[0], psuSocketWorld[0], psuPlugConnect),
    lerp(standbyPsuCordPos[1], psuSocketWorld[1], psuPlugConnect),
    lerp(standbyPsuCordPos[2], psuSocketWorld[2], psuPlugConnect),
  ];

  const cablePoints: V3[] = useMemo(
    () => [
      [wallPlugHeadPos[0], wallPlugHeadPos[1], wallPlugHeadPos[2] + 0.1],
      [-1.75, 3.3, -4.2],
      [-1.1, 5.4, -4.3],
      [-0.45, 6.45, -3.65],
      [-0.2, 7.55, -2.65],
      psuCordEndPos,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      wallPlugHeadPos[0],
      wallPlugHeadPos[1],
      wallPlugHeadPos[2],
      psuCordEndPos[0],
      psuCordEndPos[1],
      psuCordEndPos[2],
    ]
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
    () => tubeFromPoints(cablePoints, 0.085, 64, 10),
    [cablePoints]
  );

  useEffect(() => {
    return () => {
      powerCordGeo.dispose();
    };
  }, [powerCordGeo]);

  const pulseT = (frame % 40) / 40;
  const pulsePos = cableCurve.getPointAt(pulseT);

  return (
    <ThreeCanvas
      width={EP2_WIDTH}
      height={EP2_HEIGHT}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      camera={{ fov: 38, near: 0.35, far: 220, position: [10, 14, 20] }}
    >
      <SceneCameraController pose={pose} width={EP2_WIDTH} height={EP2_HEIGHT} focusY={1040} />
      <StudioEnvironment intensity={0.86} />
      <StudioLights keyIntensity={2.1} />
      {/* Lampu overhead meja kerja */}
      <pointLight position={[2.2, 13.5, -1.5]} intensity={1.95} distance={18} color="#e0f2fe" />
      {/* Lampu interior casing: redup netral saat unpowered, menyala sian saat PC dihidupkan */}
      <pointLight
        position={[1.8, 9.6, 0.8]}
        intensity={0.45 + powerOnMix * 1.45}
        distance={12}
        color={powerOnMix > 0.15 ? '#38BDF8' : '#e2e8f0'}
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
      <Box size={[36, 24, 0.4]} position={[2, 12, -5.8]} color={EP2_COLORS.wall} roughness={0.84} />
      <Box size={[0.4, 24, 28]} position={[-12.6, 12, 6]} color="#233B57" roughness={0.84} />
      <Box size={[36, 0.65, 0.08]} position={[2, 0.325, -5.56]} color="#1B2E46" roughness={0.65} />
      <Box size={[0.08, 0.65, 28]} position={[-12.36, 0.325, 6]} color="#1B2E46" roughness={0.65} />

      {/* Aksen jendela kiri lembut */}
      <group position={[-12.35, 12.2, 0.6]}>
        <Box size={[0.12, 7.2, 8.2]} color="#16283D" roughness={0.5} />
        <mesh position={[0.08, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[7.6, 6.6]} />
          <meshBasicMaterial color="#7DD3FC" transparent opacity={0.18} />
        </mesh>
      </group>

      {/* ===== TITIK STOPKONTAK DINDING EPISODE 1 (SOKET KANAN SIAP COLOK) ===== */}
      <group position={outletPos}>
        <Box size={[1.55, 1.05, 0.14]} color="#E2E8F0" roughness={0.4} />
        {/* Soket kiri */}
        <Box size={[0.5, 0.56, 0.06]} position={[-0.36, -0.04, 0.08]} color="#0F172A" roughness={0.55} />
        {/* Soket kanan + lubang pin tempat steker PC menancap */}
        <Box size={[0.5, 0.56, 0.06]} position={[0.32, -0.04, 0.08]} color="#0F172A" roughness={0.55} />
        <Cyl radius={0.04} height={0.04} axis="z" position={[0.21, -0.04, 0.1]} color="#020617" />
        <Cyl radius={0.04} height={0.04} axis="z" position={[0.43, -0.04, 0.1]} color="#020617" />
        {/* LED Status Grounding Ep.1 */}
        <Box
          size={[0.32, 0.08, 0.04]}
          position={[0, 0.35, 0.08]}
          color={EP2_COLORS.ground}
          emissive={EP2_COLORS.ground}
          emissiveIntensity={1.6}
        />
        {/* Cincin halo aman menyala terang saat steker tercolok */}
        <mesh position={[0.32, -0.05, 0.115]}>
          <ringGeometry args={[0.38, 0.48, 32]} />
          <meshBasicMaterial
            color={EP2_COLORS.ground}
            transparent
            opacity={wallOutletPowered ? 0.85 : 0.25}
          />
        </mesh>
        {wallPlugFlash > 0.03 && (
          <mesh position={[0.32, -0.05, 0.12]}>
            <ringGeometry args={[0.48, 0.65, 32]} />
            <meshBasicMaterial
              color={EP2_COLORS.ground}
              transparent
              opacity={wallPlugFlash * 0.9}
            />
          </mesh>
        )}
      </group>

      {/* Kepala steker AC yang bergerak menancap ke stopkontak dinding aman */}
      <group position={wallPlugHeadPos}>
        <Box size={[0.38, 0.42, 0.26]} color="#16191E" roughness={0.42} />
        {/* Dua pin kuningan/nikel steker terlihat sebelum menancap penuh */}
        <Cyl radius={0.025} height={0.18} axis="z" position={[-0.11, 0, -0.18]} color="#cbd5e1" metalness={0.95} roughness={0.2} />
        <Cyl radius={0.025} height={0.18} axis="z" position={[0.11, 0, -0.18]} color="#cbd5e1" metalness={0.95} roughness={0.2} />
      </group>

      {/* ===== MEJA KERJA WORKSTATION (165 × 76 × 75 CM) ===== */}
      <group position={[0.0, 0, -1.2]}>
        <Box size={[16.5, 0.38, 7.6]} position={[0, deskTopY - 0.19, 0]} color="#B7865A" roughness={0.65} />
        <Box size={[15.4, 0.26, 6.4]} position={[0, deskTopY - 0.5, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        <Box size={[0.48, 7.12, 5.8]} position={[-7.55, 3.56, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        <Box size={[0.48, 7.12, 5.8]} position={[7.55, 3.56, 0]} color="#1E293B" metalness={0.55} roughness={0.45} />
        <Box size={[0.62, 0.16, 6.2]} position={[-7.55, 0.08, 0]} color="#0F172A" roughness={0.7} />
        <Box size={[0.62, 0.16, 6.2]} position={[7.55, 0.08, 0]} color="#0F172A" roughness={0.7} />

        {/* Under-Desk Cable Tray (kontinuitas Ep.1) */}
        <Box size={[11.2, 0.42, 1.1]} position={[0, 6.45, -2.75]} color="#0F172A" metalness={0.5} roughness={0.5} />
        <Box
          size={[10.4, 0.07, 0.08]}
          position={[0, 6.45, -2.18]}
          color={EP2_COLORS.ground}
          emissive={EP2_COLORS.ground}
          emissiveIntensity={1.1}
        />

        {/* Periferal & monitor di sisi kiri meja */}
        <Box size={[5.2, 0.04, 3.2]} position={[-5.2, deskTopY + 0.02, 0.9]} color="#111827" roughness={0.9} />
        <Box size={[2.6, 0.1, 1.0]} position={[-5.5, deskTopY + 0.09, 1.05]} color="#1F2937" roughness={0.55} />
        <Box size={[0.55, 0.12, 0.92]} position={[-3.5, deskTopY + 0.09, 1.05]} color="#1F2937" roughness={0.45} />
        <group position={[-5.2, deskTopY, -2.0]} rotation={[0, 0.22, 0]}>
          <Box size={[1.7, 0.1, 1.3]} position={[0, 0.05, 0]} color="#1E293B" metalness={0.6} roughness={0.4} />
          <Box size={[0.24, 1.8, 0.22]} position={[0, 0.95, -0.32]} color="#1E293B" metalness={0.6} roughness={0.4} />
          <Box size={[5.8, 3.25, 0.18]} position={[0, 2.7, -0.15]} color="#0F172A" roughness={0.4} />
          <MonitorScreen />
        </group>

        {/* Deskmat perakitan luas di sisi kanan meja (menampung casing berdiri & terlentang) */}
        <Box size={[7.6, 0.04, 6.2]} position={[2.1, deskTopY + 0.02, -0.35]} color="#0F172A" roughness={0.86} />
        <Box
          size={[7.4, 0.01, 0.04]}
          position={[2.1, deskTopY + 0.042, 2.7]}
          color={EP2_COLORS.data}
          emissive={EP2_COLORS.data}
          emissiveIntensity={0.65}
        />
      </group>

      {/* ===== KABEL DAYA AC: STOPKONTAK EP.1 -> PSU PC ===== */}
      <mesh geometry={powerCordGeo}>
        <meshStandardMaterial color="#14181F" roughness={0.6} metalness={0.2} />
      </mesh>
      <Box size={[0.3, 0.22, 0.3]} position={psuCordEndPos} color="#111419" roughness={0.48} />
      {/* Aliran energi listrik hanya mengalir setelah colokan masuk (dan bersinar penuh saat PC menyala) */}
      {wallOutletPowered && (
        <mesh position={[pulsePos.x, pulsePos.y, pulsePos.z]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial
            color={EP2_COLORS.ground}
            emissive={EP2_COLORS.ground}
            emissiveIntensity={1.1 + powerOnMix * 1.4}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* ===== CASING PC DENGAN PIVOT REBAH-TEGAK DI TEPI BELAKANG-BAWAH ===== */}
      <group position={PC_PIVOT_WORLD} rotation={[0, PC_ROT_Y, 0]}>
        <group rotation={[tiltX, 0, 0]}>
          <group position={[0, 0.1, CASE_DIM.halfZ]}>
            <PcCase
              glassOpacity={0}
              fanAngle={fanAngle}
              intakeColor={EP2_COLORS.cold}
              exhaustColor={EP2_COLORS.warm}
              ringIntensity={powerOnMix * 1.9}
            >
              {/* Override tombol power di atas casing agar mati sebelum ditekan, lalu tertekan & menyala */}
              <group position={[1.95, CASE_DIM.height, 0.55]}>
                {/* Bezel penutup ring bawaan */}
                <Cyl
                  radius={0.105}
                  height={0.036}
                  position={[0, 0.018, 0]}
                  color="#16191e"
                  metalness={0.55}
                  roughness={0.4}
                />
                {/* Plunger tombol power yang tertekan ke bawah saat ditekan */}
                <Cyl
                  radius={0.072}
                  height={0.034}
                  position={[0, 0.025 - powerButtonDepth, 0]}
                  color="#262b34"
                  metalness={0.75}
                  roughness={0.28}
                />
                {/* Cincin LED tombol power: MATI sebelum ditekan, MENYALA setelah ditekan */}
                <mesh position={[0, 0.042 - powerButtonDepth * 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.076, 0.013, 12, 36]} />
                  <meshStandardMaterial
                    color={powerOnMix > 0.05 ? EP2_COLORS.cold : '#1e293b'}
                    emissive={EP2_COLORS.cold}
                    emissiveIntensity={powerOnMix * 2.5}
                    toneMapped={false}
                  />
                </mesh>
                {/* Indikator sentuhan/tekan mekanis saat tombol ditekan */}
                {frame >= 644 && frame <= 666 && (
                  <Cyl
                    radius={0.042}
                    height={0.14}
                    position={[0, 0.14 - pressDown * (1 - pressReleaseSpring) * 0.05, 0]}
                    color={EP2_COLORS.power}
                    emissive={EP2_COLORS.power}
                    emissiveIntensity={1.6}
                    transparent
                    opacity={0.72 * (1 - pressReleaseSpring * 0.6)}
                  />
                )}
                {buttonPressRipple > 0.03 && (
                  <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.09, 0.15, 32]} />
                    <meshBasicMaterial
                      color={EP2_COLORS.cold}
                      transparent
                      opacity={buttonPressRipple * 0.9}
                    />
                  </mesh>
                )}
              </group>

              {/* Panel kaca tempered terangkat lepas ke samping & menutup kembali */}
              <RemovableGlassPanel
                liftOffset={glassLiftOffset}
                slideX={glassSlideX}
                slideZ={glassSlideZ}
                opacity={glassOpacity}
              />

              {/* 9 Dudukan Standoff Kuningan di Tray Motherboard */}
              <group position={CASE_LAYOUT.mbOrigin}>
                {STANDOFF_COORDS.map(([u, v], i) => (
                  <Cyl
                    key={i}
                    radius={0.032}
                    height={0.04}
                    axis="z"
                    position={[u, v, -0.025]}
                    color={PART_COLORS.gold}
                    metalness={0.92}
                    roughness={0.28}
                  />
                ))}
              </group>

              {/* STEP 1: MOTHERBOARD ATX */}
              {frame >= 256 && (
                <group
                  position={[
                    CASE_LAYOUT.mbOrigin[0],
                    CASE_LAYOUT.mbOrigin[1],
                    CASE_LAYOUT.mbOrigin[2] + moboZ,
                  ]}
                >
                  <Motherboard />
                  {moboFlash > 0.03 && (
                    <Box
                      size={[2.52, 3.12, 0.02]}
                      position={[0, 0, 0.03]}
                      color={EP2_COLORS.data}
                      emissive={EP2_COLORS.data}
                      emissiveIntensity={1.6}
                      transparent
                      opacity={moboFlash * 0.22}
                    />
                  )}

                  {/* STEP 2a: PROSESOR CPU AM5 */}
                  {frame >= 306 && (
                    <group
                      position={[
                        MB_LAYOUT.socket[0],
                        MB_LAYOUT.socket[1],
                        MB_LAYOUT.frontZ + 0.018 + cpuZ,
                      ]}
                    >
                      <CpuChip />
                      {cpuFlash > 0.03 && (
                        <mesh position={[0, 0, 0.05]}>
                          <ringGeometry args={[0.26, 0.35, 32]} />
                          <meshBasicMaterial
                            color={EP2_COLORS.power}
                            transparent
                            opacity={cpuFlash * 0.9}
                          />
                        </mesh>
                      )}
                    </group>
                  )}

                  {/* STEP 2b: SSD NVMe M.2 2280 */}
                  {frame >= 332 && (
                    <group
                      position={[
                        MB_LAYOUT.m2.centerU,
                        MB_LAYOUT.m2.v,
                        MB_LAYOUT.frontZ + 0.018 + nvmeZ,
                      ]}
                    >
                      <group position={[-0.4, 0, 0]} rotation={[0, -0.28 * (1 - nvmeLatchSpring), 0]}>
                        <NvmeSsd position={[0.4, 0, 0]} />
                      </group>
                      {nvmeFlash > 0.03 && (
                        <mesh position={[0.4, 0, 0.04]}>
                          <ringGeometry args={[0.07, 0.14, 24]} />
                          <meshBasicMaterial
                            color={EP2_COLORS.data}
                            transparent
                            opacity={nvmeFlash * 0.9}
                          />
                        </mesh>
                      )}
                    </group>
                  )}

                  {/* STEP 3: DDR5 RAM DUAL-CHANNEL (LED = 0 saat belum ditekan power) */}
                  {frame >= 366 && (
                    <group
                      position={[
                        MB_LAYOUT.dimmU[1],
                        MB_LAYOUT.dimmV,
                        MB_LAYOUT.frontZ + 0.05 + ram1Z,
                      ]}
                    >
                      <RamStick
                        rotation={RAM_ON_BOARD_ROTATION}
                        ledPhase={ledPhase}
                        ledIntensity={powerOnMix * 1.9}
                      />
                    </group>
                  )}
                  {frame >= 372 && (
                    <group
                      position={[
                        MB_LAYOUT.dimmU[3],
                        MB_LAYOUT.dimmV,
                        MB_LAYOUT.frontZ + 0.05 + ram2Z,
                      ]}
                    >
                      <RamStick
                        rotation={RAM_ON_BOARD_ROTATION}
                        ledPhase={ledPhase + 0.32}
                        ledIntensity={powerOnMix * 1.9}
                      />
                      {ramFlash > 0.03 && (
                        <Box
                          size={[0.38, 1.44, 0.08]}
                          position={[-0.14, 0, 0.42]}
                          color={EP2_COLORS.data}
                          emissive={EP2_COLORS.data}
                          emissiveIntensity={1.6}
                          transparent
                          opacity={ramFlash * 0.25}
                        />
                      )}
                    </group>
                  )}

                  {/* STEP 4: KARTU GRAFIS TRIPLE-FAN (kipas 0 RPM & LED = 0 saat belum power on) */}
                  {frame >= 396 && (
                    <group position={[-1.23, MB_LAYOUT.pcie1V, 0.14 + gpuZ]}>
                      <GpuCard
                        rotation={GPU_ON_BOARD_ROTATION}
                        fanAngle={fanAngle}
                        ledColor={EP2_COLORS.data}
                        ledIntensity={powerOnMix * 1.95}
                      />
                      {gpuFlash > 0.03 && (
                        <Box
                          size={[3.05, 0.16, 1.35]}
                          position={[1.45, 0, 0.62]}
                          color={EP2_COLORS.data}
                          emissive={EP2_COLORS.data}
                          emissiveIntensity={1.7}
                          transparent
                          opacity={gpuFlash * 0.28}
                        />
                      )}
                    </group>
                  )}
                </group>
              )}

              {/* STEP 5: PSU 750W MODULAR (kipas 0 RPM sampai tombol power ditekan) */}
              {frame >= 432 && (
                <group
                  position={[
                    CASE_LAYOUT.psuCenter[0],
                    CASE_LAYOUT.psuCenter[1],
                    CASE_LAYOUT.psuCenter[2] + psuZ,
                  ]}
                >
                  <Psu fanAngle={psuFanAngle} />
                  {(psuFlash > 0.03 || powerOnMix > 0.1) && (
                    <mesh position={[0, 0, 0.88]}>
                      <ringGeometry args={[0.42, 0.54, 32]} />
                      <meshBasicMaterial
                        color={EP2_COLORS.ground}
                        transparent
                        opacity={Math.max(psuFlash * 0.85, powerOnMix * 0.62)}
                      />
                    </mesh>
                  )}
                </group>
              )}
            </PcCase>
          </group>
        </group>
      </group>
    </ThreeCanvas>
  );
};

interface AssemblyStepSpec {
  id: string;
  startFrame: number;
  lockFrame: number;
  badgeIndex: string;
  title: string;
  subtitle: string;
  accent: string;
  surface: string;
  shortLabel: string;
}

const ASSEMBLY_STEPS: AssemblyStepSpec[] = [
  {
    id: 'mobo',
    startFrame: 258,
    lockFrame: 294,
    badgeIndex: 'PART 01 • FONDASI',
    title: 'ATX MOTHERBOARD',
    subtitle: 'Menempel Presisi pada 9 Dudukan Standoff',
    accent: EP2_COLORS.data,
    surface: '#0D2134',
    shortLabel: '1. MOBO ATX',
  },
  {
    id: 'cpu-nvme',
    startFrame: 308,
    lockFrame: 358,
    badgeIndex: 'PART 02 • OTAK & DATA',
    title: 'CPU + NVMe M.2',
    subtitle: 'Prosesor LGA & SSD NVMe M.2 Terkunci',
    accent: EP2_COLORS.power,
    surface: '#241812',
    shortLabel: '2. CPU+NVMe',
  },
  {
    id: 'ram',
    startFrame: 368,
    lockFrame: 388,
    badgeIndex: 'PART 03 • MEMORI',
    title: 'DDR5 DUAL-CHANNEL',
    subtitle: 'Keping Memori Klik Masuk Slot DIMM',
    accent: EP2_COLORS.data,
    surface: '#0D2134',
    shortLabel: '3. DDR5 RAM',
  },
  {
    id: 'gpu',
    startFrame: 398,
    lockFrame: 420,
    badgeIndex: 'PART 04 • GRAFIS',
    title: 'TRIPLE-FAN GPU',
    subtitle: 'Mengunci di Slot PCIe x16 Armor',
    accent: EP2_COLORS.power,
    surface: '#241812',
    shortLabel: '4. GPU 3-FAN',
  },
  {
    id: 'psu',
    startFrame: 434,
    lockFrame: 466,
    badgeIndex: 'PART 05 • DAYA',
    title: 'PSU 750W CERTIFIED',
    subtitle: 'Siap Dihubungkan ke Jalur Listrik Ep.1',
    accent: EP2_COLORS.ground,
    surface: '#0C241E',
    shortLabel: '5. PSU 750W',
  },
];

export const Scene3Assembly: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeStep = useMemo(() => {
    if (frame >= 492) return null;
    for (let i = ASSEMBLY_STEPS.length - 1; i >= 0; i--) {
      if (frame >= ASSEMBLY_STEPS[i].startFrame) return ASSEMBLY_STEPS[i];
    }
    return null;
  }, [frame]);

  const phaseTriggerFrame =
    frame >= 660
      ? 660
      : frame >= 624
      ? 624
      : frame >= 560
      ? 560
      : frame >= 492
      ? 492
      : activeStep
      ? activeStep.startFrame
      : frame >= 128
      ? 128
      : frame >= 56
      ? 56
      : 4;

  const badgePop = spring({
    frame: frame - phaseTriggerFrame,
    fps,
    config: { damping: 18, stiffness: 220, mass: 0.7 },
  });

  const lockedCount = ASSEMBLY_STEPS.filter((s) => frame >= s.lockFrame).length;
  const checklistProgress = Math.round((lockedCount / ASSEMBLY_STEPS.length) * 100);

  const calloutCard = useMemo(() => {
    // Pembuka jembatan dari Scene 2 (0..55)
    if (frame < 56) {
      return {
        indexLabel: 'TRANSISI • SCENE 02 → 03',
        headline: 'KEBUTUHAN TERPETAKAN → LANJUT RAKIT PRESISI',
        headlineSize: 20,
        detail: '→ Siapkan Meja Kerja & Rebah Casing PC',
        detailColor: '#FDBA74',
        accentColor: EP2_COLORS.power,
        surfaceColor: '#1B1822',
      };
    }

    // Rebah terlentang & buka kaca (56..257)
    if (frame < 258) {
      const glassPhase = frame >= 128;
      return {
        indexLabel: 'PERSIAPAN • 0/5',
        headline: glassPhase ? 'Panel Kaca Terangkat ke Samping' : 'Casing Direbahkan di Atas Meja',
        headlineSize: 22,
        detail: glassPhase
          ? '→ Rongga Dalam & Standoff Siap Dipasang'
          : '→ Posisi Terlentang Stabil untuk Perakitan',
        detailColor: '#7DD3FC',
        accentColor: EP2_COLORS.data,
        surfaceColor: '#0F1826',
      };
    }

    // Tahap perakitan part 1..5 (258..491)
    if (activeStep) {
      const locked = frame >= activeStep.lockFrame;
      return {
        indexLabel: activeStep.badgeIndex,
        headline: activeStep.title,
        headlineSize: 24,
        detail: locked ? `✓ ${activeStep.subtitle}` : `↓ Memasang: ${activeStep.subtitle}`,
        detailColor: locked ? '#6EE7B7' : '#E2E8F0',
        accentColor: activeStep.accent,
        surfaceColor: activeStep.surface,
      };
    }

    // Tutup kaca & tegak unpowered (492..559)
    if (frame < 560) {
      return {
        indexLabel: 'RAKITAN RAPI • 5/5',
        headline: 'Panel Ditutup • Berdiri Tegak',
        headlineSize: 23,
        detail: '○ Sistem Masih Mati — Belum Dialiri Daya',
        detailColor: '#94A3B8',
        accentColor: EP2_COLORS.data,
        surfaceColor: '#0D2134',
      };
    }

    // Langkah A: Colok kabel ke stopkontak aman (560..623)
    if (frame < 624) {
      const plugged = frame >= 598;
      return {
        indexLabel: 'LANGKAH A • LISTRIK EP.1',
        headline: 'Kabel Daya → Stopkontak Aman',
        headlineSize: 23,
        detail: plugged
          ? '✓ Steker Terkunci di Stopkontak Ep.1'
          : '→ Menancapkan Steker Daya ke Dinding',
        detailColor: plugged ? '#6EE7B7' : '#E2E8F0',
        accentColor: EP2_COLORS.ground,
        surfaceColor: '#0C241E',
      };
    }

    // Langkah B: Tekan tombol power (624..659)
    if (frame < 660) {
      const pressed = frame >= 654;
      return {
        indexLabel: 'LANGKAH B • AKTIVASI',
        headline: 'Menekan Tombol Power Casing',
        headlineSize: 23,
        detail: pressed
          ? '✓ Klik! Mengalirkan Daya ke Sistem...'
          : '→ Fokus Panel Atas Tombol Power',
        detailColor: pressed ? '#FDBA74' : '#E2E8F0',
        accentColor: EP2_COLORS.power,
        surfaceColor: '#241812',
      };
    }

    // Langkah C: Sistem menyala (660..744)
    return {
      indexLabel: 'LANGKAH C • SISTEM HIDUP',
      headline: 'Sistem Pun Menyala Normal',
      headlineSize: 24,
      detail: '✓ Kipas GPU & Casing Berputar • LED Aktif',
      detailColor: '#6EE7B7',
      accentColor: EP2_COLORS.ground,
      surfaceColor: '#0C2520',
    };
  }, [activeStep, frame]);

  const statusText =
    frame < 56
      ? 'KEBUTUHAN TERPETAKAN → MASUK TAHAP PERAKITAN PRESISI'
      : frame < 128
      ? 'CASING DIREBAHKAN TERLENTANG DI ATAS DESKMAT'
      : frame < 258
      ? 'PANEL KACA DIANGKAT • RONGGA PERAKITAN TERBUKA'
      : frame < 306
      ? 'TAHAP 1/5 • MOTHERBOARD ATX MENGUNCI DI STANDOFF'
      : frame < 366
      ? 'TAHAP 2/5 • PROSESOR & SSD NVMe M.2 TERKUNCI'
      : frame < 396
      ? 'TAHAP 3/5 • DDR5 RAM DUAL-CHANNEL KLIK TERPASANG'
      : frame < 432
      ? 'TAHAP 4/5 • KARTU GRAFIS TRIPLE-FAN MASUK SLOT PCIe'
      : frame < 492
      ? 'TAHAP 5/5 • PSU 750W TERPASANG DI RUANG DAYA'
      : frame < 560
      ? 'PANEL DITUTUP • CASING TEGAK (KONDISI MATI / UNPOWERED)'
      : frame < 624
      ? 'LANGKAH A • KABEL DAYA DITANCAPKAN KE STOPKONTAK AMAN EP.1'
      : frame < 660
      ? 'LANGKAH B • MENYalakan: TOMBOL POWER ATAS DITEKAN'.toUpperCase()
      : 'LANGKAH C • SISTEM MENYALA • KIPAS & LED AKTIF STABIL';

  const statusColor =
    frame < 56
      ? EP2_COLORS.power
      : frame < 258
      ? EP2_COLORS.data
      : frame < 366
      ? EP2_COLORS.power
      : frame < 432
      ? EP2_COLORS.data
      : frame < 560
      ? EP2_COLORS.muted
      : frame < 624
      ? EP2_COLORS.ground
      : frame < 660
      ? EP2_COLORS.power
      : EP2_COLORS.ground;

  return (
    <AbsoluteFill style={{ backgroundColor: EP2_COLORS.bg, fontFamily: EP2_FONTS.body }}>
      {/* Audio VO Scene 3 (regenerated) & BGM Auto-Ducking */}
      <Audio src={staticFile('audio/vo/ep2-scene3.mp3')} volume={1.0} />
      <AudioStage
        musicSrc={EP2_BGM}
        words={SCENE3_WORDS}
        bedSrc=""
        sfxTrackSrc=""
        baseMusicVolume={0.12}
      />

      {/* Efek Suara Mekanis Perakitan PC + Colok Kabel + Tombol Power */}
      <Sequence from={154} layout="none">
        <Audio src={staticFile('audio/sfx/pc-panel-open.mp3')} volume={0.76} />
      </Sequence>
      <Sequence from={294} layout="none">
        <Audio src={staticFile('audio/sfx/pc-mobo-seat.mp3')} volume={0.78} />
      </Sequence>
      <Sequence from={330} layout="none">
        <Audio src={staticFile('audio/sfx/pc-chip-snap.mp3')} volume={0.78} />
      </Sequence>
      <Sequence from={356} layout="none">
        <Audio src={staticFile('audio/sfx/pc-chip-snap.mp3')} volume={0.78} />
      </Sequence>
      <Sequence from={382} layout="none">
        <Audio src={staticFile('audio/sfx/pc-ram-click.mp3')} volume={0.76} />
      </Sequence>
      <Sequence from={388} layout="none">
        <Audio src={staticFile('audio/sfx/pc-ram-click.mp3')} volume={0.68} />
      </Sequence>
      <Sequence from={418} layout="none">
        <Audio src={staticFile('audio/sfx/pc-gpu-lock.mp3')} volume={0.82} />
      </Sequence>
      <Sequence from={464} layout="none">
        <Audio src={staticFile('audio/sfx/pc-psu-lock.mp3')} volume={0.7} />
      </Sequence>
      {/* Tutup panel kaca */}
      <SfxCue frame={518} sfx="click-soft" volume={0.48} />
      {/* Langkah A: Colok kabel ke stopkontak aman Ep.1 */}
      <SfxCue frame={598} sfx="click-soft" volume={0.78} />
      {/* Langkah B: Tekan tombol power casing */}
      <SfxCue frame={654} sfx="click-soft" volume={0.88} />
      {/* Langkah C: Konfirmasi sistem menyala */}
      <SfxCue frame={672} sfx="confirm-chime" volume={0.44} />

      {/* Latar Prosedural Studio */}
      <ProceduralBackground stylePreset={EP2_STYLE_PRESET} driftSpeed={0.8} />

      {/* Panggung 3D Perakitan PC Terlentang -> Colok Daya -> Tekan Power */}
      <AbsoluteFill>
        <AssemblyStage3D frame={frame} fps={fps} />
      </AbsoluteFill>

      {/* Gradien tipis atas & bawah agar HUD & Subtitle terbaca tajam */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(7, 11, 18, 0.88) 0%, rgba(7, 11, 18, 0.34) 27%, rgba(7, 11, 18, 0) 47%, rgba(7, 11, 18, 0.72) 100%)',
        }}
      />

      {/* Lapisan 2D Motion-Craft dalam Safe Zone (X: 90..960, Y: 56..1620) */}
      <SeamlessSceneShell
        startFrame={0}
        endFrame={EP2_DURATIONS.scene3}
        enterMode="portal-zoom-in"
        exitMode="none"
        background="transparent"
        enableTransitionSfx={false}
      >
        <CameraRig
          durationInFrames={EP2_DURATIONS.scene3}
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
              EP 02 • SCENE 03
            </div>
          </div>

          {/* Judul Perakitan (Y: 130..236) */}
          <div
            style={{
              position: 'absolute',
              top: 130,
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
                  color: EP2_COLORS.power,
                }}
              >
                LANGKAH 02 • PERAKITAN PRESISI DI ATAS MEJA
              </span>
            </div>

            <FlyText
              text="RAKIT KOMPONEN PC"
              start={6}
              stagger={1.2}
              dur={12}
              size={50}
              weight={900}
              family={EP2_FONTS.heading}
              color={EP2_COLORS.ink}
              flyingColor={EP2_COLORS.power}
              letterSpacing={-0.8}
            />
          </div>

          {/* Zona Call-Out Transisi / Part Aktif + Checklist 5 Tahap di Area Atas (Y: 254..416) */}
          <div
            style={{
              position: 'absolute',
              top: 254,
              left: EP2_SAFE.left,
              width: EP2_SAFE.contentWidth,
              height: 162,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'stretch',
              gap: 18,
            }}
          >
            <div
              style={{
                width: 524,
                height: 162,
                padding: '13px 18px 14px',
                borderRadius: 18,
                backgroundColor: calloutCard.surfaceColor,
                border: `1.5px solid ${calloutCard.accentColor}99`,
                boxShadow: '0 18px 40px rgba(0, 0, 0, 0.42)',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 6,
                opacity: 0.35 + 0.65 * badgePop,
                transform: `translate3d(0, ${((1 - badgePop) * 14).toFixed(1)}px, 0) scale(${(0.96 + 0.04 * badgePop).toFixed(3)})`,
              }}
            >
              <div
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 0.7,
                  color: calloutCard.accentColor,
                }}
              >
                {calloutCard.indexLabel}
              </div>

              <div
                style={{
                  fontFamily: EP2_FONTS.heading,
                  fontSize: calloutCard.headlineSize,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  color: EP2_COLORS.ink,
                }}
              >
                {calloutCard.headline}
              </div>

              <div
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 13.5,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: calloutCard.detailColor,
                }}
              >
                {calloutCard.detail}
              </div>
            </div>

            {/* Checklist 5 Tahap Sesuai Urutan Narasi */}
            <div
              style={{
                width: 328,
                height: 162,
                padding: '12px 14px',
                borderRadius: 18,
                backgroundColor: 'rgba(13, 20, 32, 0.88)',
                border: `1px solid ${EP2_COLORS.border}`,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 13,
                  fontWeight: 700,
                  color: EP2_COLORS.muted,
                }}
              >
                <span>CHECKLIST RAKIT</span>
                <span style={{ color: lockedCount === 5 ? EP2_COLORS.ground : EP2_COLORS.data }}>
                  {lockedCount}/5 LOCKED
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 5,
                }}
              >
                {ASSEMBLY_STEPS.map((step, idx) => {
                  const locked = frame >= step.lockFrame;
                  const active = !locked && frame >= step.startFrame;
                  return (
                    <div
                      key={step.id}
                      style={{
                        gridColumn: idx === 4 ? '1 / span 2' : undefined,
                        padding: '4px 8px',
                        borderRadius: 7,
                        backgroundColor: locked
                          ? 'rgba(16, 185, 129, 0.16)'
                          : active
                          ? 'rgba(255, 122, 47, 0.18)'
                          : 'rgba(30, 41, 59, 0.55)',
                        border: `1px solid ${
                          locked
                            ? 'rgba(16, 185, 129, 0.55)'
                            : active
                            ? 'rgba(255, 122, 47, 0.65)'
                            : 'rgba(148, 163, 184, 0.18)'
                        }`,
                        fontFamily: EP2_FONTS.mono,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: locked
                          ? '#6EE7B7'
                          : active
                          ? '#FDBA74'
                          : EP2_COLORS.muted,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {locked ? '✓' : active ? '●' : '○'} {step.shortLabel}
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  width: '100%',
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: 'rgba(148, 163, 184, 0.18)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${checklistProgress}%`,
                    height: '100%',
                    borderRadius: 999,
                    background:
                      lockedCount === 5
                        ? EP2_COLORS.ground
                        : `linear-gradient(90deg, ${EP2_COLORS.power}, ${EP2_COLORS.data})`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Status Pill di Bawah Area 3D & di Atas Subtitle (Y: 1388) */}
          <div
            style={{
              position: 'absolute',
              top: 1388,
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
        words={SCENE3_WORDS}
        stylePreset={EP2_STYLE_PRESET}
        fontSize={32}
        bottomOffset={EP2_SAFE.subtitleBottomOffset}
        maxWordsPerLine={6}
      />
    </AbsoluteFill>
  );
};
