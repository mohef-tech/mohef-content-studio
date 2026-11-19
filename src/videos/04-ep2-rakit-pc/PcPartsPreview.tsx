import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EP2_COLORS, EP2_FONTS, EP2_HEIGHT, EP2_WIDTH } from './constants';
import { StudioEnvironment, StudioLights } from './components/partsCommon';
import { Motherboard } from './components/Motherboard';
import { CpuChip, RamStick } from './components/CpuRam';
import { NvmeSsd } from './components/NvmeSsd';
import { GpuCard } from './components/GpuCard';
import { PcCase, Psu } from './components/PsuAndCase';

export const EP2_PARTS_PREVIEW_DURATION = 240;

const PART_CARDS = [
  { code: '01', title: 'MOTHERBOARD ATX', sub: 'PCB Traces • VRM Heatsink • Socket • 4×DIMM • PCIe Armor • CMOS', col: 0, row: 0 },
  { code: '02', title: 'CPU & DDR5 RAM', sub: 'Metal IHS Notched • Gold Pins • Angled Heatsink • RGB Light Bar', col: 1, row: 0 },
  { code: '03', title: 'SSD NVMe M.2 2280', sub: 'Black NAND Flash • Silver Controller • Label Sticker • M-Key Pins', col: 0, row: 1 },
  { code: '04', title: 'GPU TRIPLE-FAN', sub: 'Spinning Fans • Aluminium Fins • Copper Heatpipes • Backplate', col: 1, row: 1 },
  { code: '05', title: 'PSU 750W MODULAR', sub: 'Fan Grille • 24-PIN / CPU / PCIe Sockets • Rear Switch', col: 0, row: 2 },
  { code: '06', title: 'CASING & AIRFLOW', sub: 'Hinged Tempered Glass • 3× Intake Fans • Rear Exhaust Fan', col: 1, row: 2 },
] as const;

export const PcPartsPreview: React.FC = () => {
  const frame = useCurrentFrame();
  const rotY = Math.sin(frame * 0.035) * 0.55;
  const fullSpin = frame * 0.025;
  const fanAngle = frame * 0.22;
  const ledPhase = frame * 0.012;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: EP2_COLORS.bg,
        fontFamily: EP2_FONTS.body,
        color: EP2_COLORS.ink,
      }}
    >
      {/* Latar gradien studio terang agar siluet komponen gelap tetap kontras */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 35%, #1A2740 0%, #0D1524 55%, #070B12 100%)',
        }}
      />

      {/* Bingkai kartu 2×3 di belakang kanvas 3D */}
      {PART_CARDS.map((card) => {
        const left = card.col === 0 ? 48 : 552;
        const top = 132 + card.row * 572;
        return (
          <div
            key={card.code}
            style={{
              position: 'absolute',
              left,
              top,
              width: 480,
              height: 544,
              borderRadius: 22,
              background:
                'linear-gradient(180deg, rgba(22, 32, 50, 0.72) 0%, rgba(12, 18, 30, 0.86) 100%)',
              border: `1px solid ${EP2_COLORS.border}`,
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
              boxSizing: 'border-box',
            }}
          />
        );
      })}

      {/* Kanvas 3D utama */}
      <ThreeCanvas
        width={EP2_WIDTH}
        height={EP2_HEIGHT}
        orthographic
        camera={{ position: [0, 0, 18], zoom: 96, near: 0.1, far: 100 }}
      >
        <StudioEnvironment intensity={0.95} />
        <StudioLights keyIntensity={2.6} />
        <pointLight position={[0, 2, 8]} intensity={1.1} color="#ffffff" />

        {/* 01. MOTHERBOARD (Kiri Atas) */}
        <group position={[-2.55, 5.45, 0]} rotation={[0.2, rotY * 0.85, 0]} scale={0.92}>
          <Motherboard />
        </group>

        {/* 02. CPU & RAM (Kanan Atas) */}
        <group position={[2.55, 5.45, 0]}>
          <group position={[0, 0.88, 0]} rotation={[-0.35 + Math.sin(frame * 0.03) * 0.15, rotY, 0.1]}>
            <CpuChip scale={2.5} />
          </group>
          <group position={[0, -0.55, 0]} rotation={[0.18, rotY * 0.9, 0]} scale={1.45}>
            <RamStick position={[0, 0.18, 0.12]} ledPhase={ledPhase} />
            <RamStick position={[0, -0.34, -0.12]} rotation={[0, Math.PI, 0]} ledPhase={ledPhase + 0.35} />
          </group>
        </group>

        {/* 03. SSD NVMe M.2 2280 (Kiri Tengah) */}
        <group
          position={[-2.55, -0.45, 0]}
          rotation={[-0.32 + Math.sin(frame * 0.03) * 0.15, rotY * 0.85, -0.18]}
        >
          <NvmeSsd scale={2.65} />
        </group>

        {/* 04. GPU TRIPLE-FAN (Kanan Tengah) */}
        <group
          position={[2.55, -0.45, 0]}
          rotation={[0.28 + Math.sin(frame * 0.025) * 0.18, fullSpin, 0]}
          scale={0.92}
        >
          <GpuCard position={[-1.45, -0.62, -0.2]} fanAngle={fanAngle} />
        </group>

        {/* 05. PSU 750W MODULAR (Kiri Bawah) */}
        <group
          position={[-2.55, -6.35, 0]}
          rotation={[0.42, fullSpin * 1.1, 0]}
          scale={1.32}
        >
          <Psu fanAngle={fanAngle} />
        </group>

        {/* 06. CASING & AIRFLOW FANS (Kanan Bawah) */}
        <group
          position={[2.55, -6.35, 0]}
          rotation={[0.22, -0.5 + rotY * 0.75, 0]}
          scale={0.56}
        >
          <PcCase position={[0, -2.35, 0]} glassOpen={0.62} fanAngle={fanAngle} />
        </group>
      </ThreeCanvas>

      {/* Header bar */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 48,
          right: 48,
          height: 68,
          padding: '0 24px',
          borderRadius: 16,
          backgroundColor: 'rgba(15, 22, 34, 0.9)',
          border: `1px solid ${EP2_COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: '50%',
              backgroundColor: EP2_COLORS.power,
              boxShadow: `0 0 12px ${EP2_COLORS.power}`,
            }}
          />
          <span style={{ fontFamily: EP2_FONTS.heading, fontSize: 22, fontWeight: 800 }}>
            EP 02 • 3D PC PARTS INSPECTION STAGE
          </span>
        </div>
        <span
          style={{
            fontFamily: EP2_FONTS.mono,
            fontSize: 16,
            fontWeight: 700,
            color: EP2_COLORS.data,
          }}
        >
          MULTI-PART + CANVASTEXTURE
        </span>
      </div>

      {/* Label overlay setiap kartu */}
      {PART_CARDS.map((card) => {
        const left = card.col === 0 ? 48 : 552;
        const top = 132 + card.row * 572;
        return (
          <div
            key={card.code}
            style={{
              position: 'absolute',
              left,
              top,
              width: 480,
              height: 544,
              padding: '16px 20px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontFamily: EP2_FONTS.mono,
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#070B12',
                  backgroundColor: EP2_COLORS.power,
                  padding: '3px 9px',
                  borderRadius: 6,
                }}
              >
                {card.code}
              </span>
              <span
                style={{
                  fontFamily: EP2_FONTS.heading,
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: 0.4,
                  color: EP2_COLORS.ink,
                }}
              >
                {card.title}
              </span>
            </div>
            <div
              style={{
                fontFamily: EP2_FONTS.mono,
                fontSize: 13,
                fontWeight: 600,
                color: EP2_COLORS.muted,
                backgroundColor: 'rgba(7, 11, 18, 0.78)',
                padding: '8px 12px',
                borderRadius: 10,
                border: `1px solid ${EP2_COLORS.border}`,
              }}
            >
              {card.sub}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
