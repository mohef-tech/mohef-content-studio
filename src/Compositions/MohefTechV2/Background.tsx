import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { BG_CONFIG, COLORS, HEIGHT, WIDTH } from "./constants";

type IconType = (typeof BG_CONFIG.iconTypes)[number];

const TechIconSvg: React.FC<{ type: IconType; size: number }> = ({
  type,
  size,
}) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: COLORS.white,
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "chip":
      return (
        <svg {...commonProps}>
          <rect x="16" y="16" width="32" height="32" rx="6" />
          <rect x="24" y="24" width="16" height="16" rx="2" />
          <line x1="24" y1="8" x2="24" y2="16" />
          <line x1="32" y1="8" x2="32" y2="16" />
          <line x1="40" y1="8" x2="40" y2="16" />
          <line x1="24" y1="48" x2="24" y2="56" />
          <line x1="32" y1="48" x2="32" y2="56" />
          <line x1="40" y1="48" x2="40" y2="56" />
          <line x1="8" y1="24" x2="16" y2="24" />
          <line x1="8" y1="32" x2="16" y2="32" />
          <line x1="8" y1="40" x2="16" y2="40" />
          <line x1="48" y1="24" x2="56" y2="24" />
          <line x1="48" y1="32" x2="56" y2="32" />
          <line x1="48" y1="40" x2="56" y2="40" />
        </svg>
      );
    case "code":
      return (
        <svg {...commonProps}>
          <polyline points="20 20 8 32 20 44" />
          <polyline points="44 20 56 32 44 44" />
          <line x1="36" y1="14" x2="28" y2="50" />
        </svg>
      );
    case "wifi":
      return (
        <svg {...commonProps}>
          <path d="M8 24 A34 34 0 0 1 56 24" />
          <path d="M16 34 A22 22 0 0 1 48 34" />
          <path d="M24 44 A11 11 0 0 1 40 44" />
          <circle cx="32" cy="52" r="3" fill={COLORS.white} />
        </svg>
      );
    case "gear":
      return (
        <svg {...commonProps}>
          <circle cx="32" cy="32" r="10" />
          <circle cx="32" cy="32" r="20" strokeDasharray="10 8" />
          <line x1="32" y1="6" x2="32" y2="12" />
          <line x1="32" y1="52" x2="32" y2="58" />
          <line x1="6" y1="32" x2="12" y2="32" />
          <line x1="52" y1="32" x2="58" y2="32" />
        </svg>
      );
    case "screen":
      return (
        <svg {...commonProps}>
          <rect x="8" y="12" width="48" height="32" rx="4" />
          <line x1="22" y1="52" x2="42" y2="52" />
          <line x1="32" y1="44" x2="32" y2="52" />
        </svg>
      );
    case "cable":
      return (
        <svg {...commonProps}>
          <rect x="10" y="12" width="14" height="16" rx="3" />
          <line x1="14" y1="6" x2="14" y2="12" />
          <line x1="20" y1="6" x2="20" y2="12" />
          <rect x="40" y="36" width="14" height="16" rx="3" />
          <line x1="44" y1="52" x2="44" y2="58" />
          <line x1="50" y1="52" x2="50" y2="58" />
          <path d="M17 28 C17 44, 47 20, 47 36" />
        </svg>
      );
    case "database":
      return (
        <svg {...commonProps}>
          <ellipse cx="32" cy="16" rx="18" ry="7" />
          <path d="M14 16 V48 C14 52, 50 52, 50 48 V16" />
          <path d="M14 32 C14 36, 50 36, 50 32" />
        </svg>
      );
    case "lock":
      return (
        <svg {...commonProps}>
          <rect x="14" y="28" width="36" height="26" rx="5" />
          <path d="M22 28 V20 A10 10 0 0 1 42 20 V28" />
          <circle cx="32" cy="41" r="3" fill={COLORS.white} />
        </svg>
      );
  }
};

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  const { blobs, icons } = useMemo(() => {
    const baseSeed = random("seed-mt");
    const blobColors = [
      COLORS.bgLight,
      COLORS.bgDeep,
      COLORS.accent,
      COLORS.bgLight,
    ];

    const generatedBlobs = Array.from({ length: BG_CONFIG.blobCount }).map(
      (_, i) => {
        const r1 = random(`${BG_CONFIG.seed}-bx-${i}-${baseSeed}`);
        const r2 = random(`${BG_CONFIG.seed}-by-${i}`);
        const r3 = random(`${BG_CONFIG.seed}-bs-${i}`);
        const r4 = random(`${BG_CONFIG.seed}-bo-${i}`);
        const r5 = random(`${BG_CONFIG.seed}-bp-${i}`);

        const size =
          BG_CONFIG.blobSizeMin +
          r3 * (BG_CONFIG.blobSizeMax - BG_CONFIG.blobSizeMin);
        const x = r1 * (WIDTH - size * 0.4) - size * 0.2;
        const y = r2 * (HEIGHT - size * 0.4) - size * 0.2;
        const opacity =
          BG_CONFIG.blobOpacityMin +
          r4 * (BG_CONFIG.blobOpacityMax - BG_CONFIG.blobOpacityMin);

        return {
          id: `blob-${i}`,
          x,
          y,
          size,
          opacity,
          color: blobColors[i % blobColors.length],
          freqX: 0.018 + i * 0.005,
          freqY: 0.015 + i * 0.006,
          phase: r5 * Math.PI * 2,
        };
      }
    );

    const generatedIcons = Array.from({ length: BG_CONFIG.iconCount }).map(
      (_, i) => {
        const rx = random(`${BG_CONFIG.seed}-ix-${i}`);
        const ry = random(`${BG_CONFIG.seed}-iy-${i}`);
        const rs = random(`${BG_CONFIG.seed}-is-${i}`);
        const ro = random(`${BG_CONFIG.seed}-io-${i}`);
        const rp = random(`${BG_CONFIG.seed}-ip-${i}`);
        const rr = random(`${BG_CONFIG.seed}-ir-${i}`);

        const layer = (i % BG_CONFIG.parallaxLayers) as 0 | 1 | 2;
        const layerScale = layer === 0 ? 0.65 : layer === 1 ? 1.0 : 1.35;
        const size = Math.round(
          BG_CONFIG.iconSizeMin +
            rs * (BG_CONFIG.iconSizeMax - BG_CONFIG.iconSizeMin)
        );
        const opacity =
          BG_CONFIG.iconOpacityMin +
          ro * (BG_CONFIG.iconOpacityMax - BG_CONFIG.iconOpacityMin);
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cellW = WIDTH / 3;
        const cellH = HEIGHT / 4;
        const x = col * cellW + rx * Math.max(40, cellW - size);
        const y = row * cellH + ry * Math.max(40, cellH - size);

        return {
          id: `icon-${i}`,
          type: BG_CONFIG.iconTypes[i % BG_CONFIG.iconTypes.length],
          x,
          y,
          size,
          opacity,
          layer,
          layerScale,
          phase: rp * Math.PI * 2,
          baseRot: (rr - 0.5) * 28,
          rotDir: i % 2 === 0 ? 1 : -1,
        };
      }
    );

    return { blobs: generatedBlobs, icons: generatedIcons };
  }, []);

  const gridOffset = (frame * BG_CONFIG.gridSpeed) % BG_CONFIG.gridSize;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* 1. 4 Gumpalan Lingkaran Besar (Flat, Tanpa Blur) */}
      {blobs.map((b) => {
        const dx =
          Math.sin(frame * b.freqX + b.phase) * BG_CONFIG.blobDriftRadius;
        const dy =
          Math.cos(frame * b.freqY + b.phase) * BG_CONFIG.blobDriftRadius;
        return (
          <div
            key={b.id}
            style={{
              position: "absolute",
              left: b.x,
              top: b.y,
              width: b.size,
              height: b.size,
              borderRadius: "50%",
              backgroundColor: b.color,
              opacity: b.opacity,
              transform: `translate3d(${dx}px, ${dy}px, 0)`,
            }}
          />
        );
      })}

      {/* 2. Kisi Tipis Putih Opacity 0.08 Jarak 80px Bergeser Diagonal */}
      <div
        style={{
          position: "absolute",
          left: -BG_CONFIG.gridSize,
          top: -BG_CONFIG.gridSize,
          width: WIDTH + BG_CONFIG.gridSize * 2,
          height: HEIGHT + BG_CONFIG.gridSize * 2,
          backgroundImage: `linear-gradient(to right, ${COLORS.white} 2px, transparent 2px), linear-gradient(to bottom, ${COLORS.white} 2px, transparent 2px)`,
          backgroundSize: `${BG_CONFIG.gridSize}px ${BG_CONFIG.gridSize}px`,
          opacity: BG_CONFIG.gridOpacity,
          transform: `translate3d(${gridOffset}px, ${gridOffset}px, 0)`,
        }}
      />

      {/* 3. 12 Ikon Teknologi SVG Flat Putih Parallax 3 Lapis */}
      {icons.map((ic) => {
        const driftX =
          Math.sin(frame * 0.022 * ic.layerScale + ic.phase) *
          (18 * ic.layerScale);
        const driftY =
          Math.cos(frame * 0.019 * ic.layerScale + ic.phase) *
          (24 * ic.layerScale) -
          ((frame * 0.25 * ic.layerScale) % 60);
        const rot = ic.baseRot + frame * 0.18 * ic.rotDir * ic.layerScale;

        return (
          <div
            key={ic.id}
            style={{
              position: "absolute",
              left: ic.x,
              top: ic.y,
              width: ic.size,
              height: ic.size,
              opacity: ic.opacity,
              transform: `translate3d(${driftX}px, ${driftY}px, 0) rotate(${rot}deg)`,
            }}
          >
            <TechIconSvg type={ic.type} size={ic.size} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

