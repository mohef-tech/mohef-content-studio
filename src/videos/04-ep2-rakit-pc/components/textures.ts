import * as THREE from 'three';
import { random } from 'remotion';

/**
 * Pabrik CanvasTexture prosedural untuk komponen PC.
 * Semua tekstur di-cache per nama agar dibuat sekali per tab render.
 * Seluruh pola acak memakai random(seed) Remotion → deterministik per frame.
 */

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

interface TexOpts {
  srgb?: boolean;
  repeat?: [number, number];
  anisotropy?: number;
}

const cache = new Map<string, THREE.CanvasTexture>();

const make = (key: string, w: number, h: number, draw: Draw, opts: TexOpts = {}) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  if (opts.srgb !== false) tex.colorSpace = THREE.SRGBColorSpace;
  if (opts.repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  tex.anisotropy = opts.anisotropy ?? 8;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
};

const SANS = "700 {S}px 'Helvetica Neue', Helvetica, Arial, sans-serif";
const font = (size: number, weight = 700, family = 'sans') =>
  family === 'mono'
    ? `${weight} ${size}px Menlo, 'Courier New', monospace`
    : SANS.replace('700', String(weight)).replace('{S}', String(size));

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// ============================================================================
// MOTHERBOARD PCB — pemetaan koordinat lokal board (u: -1.22..1.22, v: 1.525..-1.525)
// ============================================================================
export const MB_W = 2.44;
export const MB_H = 3.05;

export const pcbTexture = () =>
  make('pcb-board', 1024, 1280, (ctx, W, H) => {
    const px = (u: number) => ((u + MB_W / 2) / MB_W) * W;
    const py = (v: number) => ((MB_H / 2 - v) / MB_H) * H;

    // Matte PCB dasar (graphite kebiruan)
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#1b2028');
    g.addColorStop(1, '#13171d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Jalur sirkuit (traces) bersudut 45°
    for (let i = 0; i < 340; i++) {
      const s = `trace-${i}`;
      let x = random(s + 'x') * W;
      let y = random(s + 'y') * H;
      const horizontal = random(s + 'd') > 0.5;
      const dir = random(s + 's') > 0.5 ? 1 : -1;
      const l1 = 30 + random(s + 'l1') * 140;
      const l2 = 10 + random(s + 'l2') * 50;
      const l3 = 20 + random(s + 'l3') * 120;
      const bus = 1 + Math.floor(random(s + 'b') * 4);
      ctx.strokeStyle = `rgba(${78 + random(s + 'c') * 30}, ${96 + random(s + 'c2') * 30}, 120, ${0.32 + random(s + 'a') * 0.3})`;
      ctx.lineWidth = 1.6 + random(s + 'w') * 1.6;
      for (let b = 0; b < bus; b++) {
        const off = b * 6;
        ctx.beginPath();
        if (horizontal) {
          ctx.moveTo(x, y + off);
          ctx.lineTo(x + l1 * dir, y + off);
          ctx.lineTo(x + (l1 + l2) * dir, y + off + l2);
          ctx.lineTo(x + (l1 + l2 + l3) * dir, y + off + l2);
        } else {
          ctx.moveTo(x + off, y);
          ctx.lineTo(x + off, y + l1 * dir);
          ctx.lineTo(x + off + l2, y + (l1 + l2) * dir);
          ctx.lineTo(x + off + l2, y + (l1 + l2 + l3) * dir);
        }
        ctx.stroke();
      }
      // Via di ujung jalur
      ctx.fillStyle = 'rgba(176, 150, 92, 0.75)';
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
      x += 1;
      y += 1;
    }

    // Komponen SMD kecil (resistor / kapasitor)
    for (let i = 0; i < 260; i++) {
      const s = `smd-${i}`;
      const x = random(s + 'x') * W;
      const y = random(s + 'y') * H;
      const vert = random(s + 'o') > 0.5;
      ctx.fillStyle = random(s + 'k') > 0.6 ? '#7a6a4a' : '#2a2d33';
      ctx.fillRect(x, y, vert ? 4 : 9, vert ? 9 : 4);
      ctx.fillStyle = '#b9a477';
      ctx.fillRect(x, y, vert ? 4 : 2, vert ? 2 : 4);
    }

    // Garis silkscreen & label
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
    ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
    ctx.lineWidth = 2;
    const outline = (u1: number, v1: number, u2: number, v2: number) => {
      ctx.strokeRect(px(u1), py(v1), px(u2) - px(u1), py(v2) - py(v1));
    };
    const label = (t: string, u: number, v: number, size = 15) => {
      ctx.font = font(size, 700, 'mono');
      ctx.fillText(t, px(u), py(v));
    };

    outline(-0.45, 0.96, 0.15, 0.32); // socket
    label('CPU1 · AM5-STYLE', -0.44, 0.27, 14);
    for (const u of [0.4, 0.52, 0.68, 0.8]) outline(u - 0.045, 1.4, u + 0.045, -0.04);
    label('DDR5_A1  A2  B1  B2', 0.3, -0.08, 13);
    outline(-1.0, -0.42, -0.06, -0.55);
    label('PCIEX16_1', -0.98, -0.58, 14);
    outline(-1.0, -0.72, -0.7, -0.83);
    label('PCIEX1_1', -0.98, -0.88, 13);
    outline(-1.0, -1.02, -0.06, -1.15);
    label('PCIEX16_2', -0.98, -1.18, 14);
    outline(-0.74, -0.06, 0.14, -0.3);
    label('M.2_1 (PCIE 4.0 x4)', -0.66, -0.34, 13);
    label('BAT1', 0.5, -0.36, 13);
    label('ATX_PWR', 0.92, 0.62, 13);
    label('EATX12V', -0.84, 1.4, 12);
    label('CPU_FAN', 0.42, 1.47, 12);
    label('SATA6G_1-4', 0.92, -0.55, 12);
    label('F_PANEL', 0.55, -1.36, 12);

    // Logo board
    ctx.save();
    ctx.translate(px(0.5), py(-1.0));
    ctx.fillStyle = 'rgba(255, 122, 47, 0.9)';
    ctx.font = font(30, 900);
    ctx.fillText('MOHEF', 0, 0);
    ctx.fillStyle = 'rgba(226, 232, 240, 0.65)';
    ctx.font = font(16, 700, 'mono');
    ctx.fillText('B760-PRO WIFI', 0, 24);
    ctx.restore();

    // Lubang mounting ATX dengan ring emas
    const holes: [number, number][] = [
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
    for (const [u, v] of holes) {
      ctx.fillStyle = '#c8a95a';
      ctx.beginPath();
      ctx.arc(px(u), py(v), 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b0d10';
      ctx.beginPath();
      ctx.arc(px(u), py(v), 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tepi board
    ctx.strokeStyle = 'rgba(10, 12, 16, 0.9)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, W - 6, H - 6);
  });

// ============================================================================
// CPU
// ============================================================================
export const ihsTextTexture = () =>
  make('cpu-ihs-text', 512, 512, (ctx, W, H) => {
    // Brushed metal
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#d9dde2');
    g.addColorStop(0.45, '#b7bdc4');
    g.addColorStop(1, '#cfd4da');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 700; i++) {
      const y = random(`ihs-${i}`) * H;
      ctx.strokeStyle = `rgba(255,255,255,${0.04 + random(`ihs-a-${i}`) * 0.06})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y + (random(`ihs-s-${i}`) - 0.5) * 8);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(52, 56, 64, 0.82)';
    ctx.font = font(54, 900);
    ctx.fillText('MOHEF', 70, 175);
    ctx.font = font(40, 800);
    ctx.fillText('MT-X7 9700', 70, 240);
    ctx.font = font(26, 600, 'mono');
    ctx.fillText('8C · 16T · 5.4GHz', 70, 296);
    ctx.fillText('DIFFUSED IN TAIWAN', 70, 340);
    ctx.fillText('9HJ2K4R1-0042', 70, 384);
    // Penanda segitiga pin-1
    ctx.beginPath();
    ctx.moveTo(30, H - 30);
    ctx.lineTo(90, H - 30);
    ctx.lineTo(30, H - 90);
    ctx.closePath();
    ctx.fill();
  });

export const cpuSubstrateTexture = () =>
  make('cpu-substrate', 256, 256, (ctx, W, H) => {
    ctx.fillStyle = '#1f5e3a';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = random(`sub-${i}`) > 0.5 ? '#c9a24a' : '#6b4f2b';
      const x = random(`subx-${i}`) * W;
      const y = random(`suby-${i}`) * H;
      ctx.fillRect(x, y, 6, 3);
    }
    ctx.strokeStyle = 'rgba(201,162,74,0.8)';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, W - 8, H - 8);
  });

// ============================================================================
// RAM
// ============================================================================
export const ramHeatsinkTexture = () =>
  make('ram-heatsink', 1024, 320, (ctx, W, H) => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#3a3f47');
    g.addColorStop(0.5, '#23272d');
    g.addColorStop(1, '#1a1d22');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Facet bersudut
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(420, 0);
    ctx.lineTo(300, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,122,47,0.85)';
    ctx.beginPath();
    ctx.moveTo(430, 0);
    ctx.lineTo(452, 0);
    ctx.lineTo(332, H);
    ctx.lineTo(310, H);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 400; i++) {
      const y = random(`ramb-${i}`) * H;
      ctx.strokeStyle = `rgba(255,255,255,${0.02 + random(`rama-${i}`) * 0.04})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#e5e7eb';
    ctx.font = font(64, 900);
    ctx.fillText('MOHEF FURY', 500, 150);
    ctx.font = font(30, 700, 'mono');
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('DDR5 · 16GB · 6000MT/s CL30', 500, 205);
  });

export const ramPcbTexture = () =>
  make('ram-pcb', 512, 128, (ctx, W, H) => {
    ctx.fillStyle = '#14301f';
    ctx.fillRect(0, 0, W, H);
    // Pin emas bawah
    for (let i = 0; i < 96; i++) {
      const x = 6 + i * 5.2;
      if (i === 44) continue; // notch kunci DDR
      ctx.fillStyle = '#e0b84a';
      ctx.fillRect(x, H - 34, 3.4, 30);
    }
    ctx.fillStyle = '#0f1115';
    for (let c = 0; c < 8; c++) ctx.fillRect(18 + c * 60, 14, 46, 40);
  });

export const ledGradientTexture = () =>
  make('led-gradient', 512, 16, (ctx, W, H) => {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#00E5FF');
    g.addColorStop(0.33, '#7C3AED');
    g.addColorStop(0.66, '#FF7A2F');
    g.addColorStop(1, '#00E5FF');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }, { repeat: [1, 1] });

// ============================================================================
// SSD NVMe M.2 2280
// ============================================================================
export const ssdPcbTexture = () =>
  make('ssd-pcb', 640, 176, (ctx, W, H) => {
    ctx.fillStyle = '#101317';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = 'rgba(90,110,130,0.35)';
      ctx.lineWidth = 1.5;
      const y = random(`ssdt-${i}`) * H;
      const x = random(`ssdx-${i}`) * W;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 40 + random(`ssdl-${i}`) * 80, y);
      ctx.stroke();
    }
    // Gold finger (kunci M)
    for (let i = 0; i < 30; i++) {
      if (i === 24) continue;
      ctx.fillStyle = '#e0b84a';
      ctx.fillRect(2, 14 + i * 5, 26, 3);
    }
    // Setengah lingkaran mounting
    ctx.fillStyle = '#c8a95a';
    ctx.beginPath();
    ctx.arc(W, H / 2, 16, Math.PI / 2, Math.PI * 1.5);
    ctx.fill();
  });

export const ssdLabelTexture = () =>
  make('ssd-label', 768, 200, (ctx, W, H) => {
    ctx.fillStyle = '#0b0d10';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#FF7A2F';
    ctx.fillRect(0, 0, 18, H);
    ctx.fillStyle = '#f8fafc';
    ctx.font = font(54, 900);
    ctx.fillText('MOHEF', 46, 70);
    ctx.fillStyle = '#FF7A2F';
    ctx.fillText('NVMe', 250, 70);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = font(26, 700, 'mono');
    ctx.fillText('M.2 2280 · PCIe 4.0 x4', 46, 116);
    ctx.fillText('1TB · 7000MB/s', 46, 152);
    // QR
    for (let y = 0; y < 9; y++)
      for (let x = 0; x < 9; x++) {
        if (random(`qr-${x}-${y}`) > 0.5) {
          ctx.fillStyle = '#e5e7eb';
          ctx.fillRect(560 + x * 12, 40 + y * 12, 11, 11);
        }
      }
    // barcode
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(46 + i * 9, 170, random(`bc-${i}`) > 0.5 ? 5 : 2, 22);
    }
  });

// ============================================================================
// GPU
// ============================================================================
export const GPU_LEN = 3.0;
export const GPU_SHROUD_H = 1.25;

export const gpuShroudTexture = () =>
  make('gpu-shroud', 1200, 500, (ctx, W, H) => {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#2a2f37');
    g.addColorStop(0.5, '#1a1e24');
    g.addColorStop(1, '#262b33');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Facet garis bersudut modern
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 400 - 60, 0);
      ctx.lineTo(i * 400 + 60, H);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,122,47,0.95)';
    ctx.fillRect(0, H - 26, W, 8);
    ctx.fillStyle = 'rgba(0,229,255,0.5)';
    ctx.fillRect(0, 18, W * 0.3, 4);
    ctx.fillStyle = 'rgba(248,250,252,0.85)';
    ctx.font = font(30, 900);
    ctx.fillText('MOHEF  GAMING OC', 24, H - 40);
  });

export const gpuBackplateTexture = () =>
  make('gpu-backplate', 1200, 500, (ctx, W, H) => {
    ctx.fillStyle = '#1c2026';
    ctx.fillRect(0, 0, W, H);
    // Vent slot
    ctx.fillStyle = '#0b0d10';
    for (let i = 0; i < 18; i++) roundRect(ctx, 860 + (i % 6) * 50, 80 + Math.floor(i / 6) * 120, 30, 100, 10), ctx.fill();
    // Sekrup
    ctx.fillStyle = '#6b7280';
    for (const [x, y] of [
      [300, 140],
      [300, 360],
      [520, 140],
      [520, 360],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,122,47,0.9)';
    ctx.font = font(64, 900);
    ctx.fillText('MOHEF', 40, 110);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, W - 32, H - 32);
  });

export const gpuBracketTexture = () =>
  make('gpu-bracket', 256, 600, (ctx, W, H) => {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#9aa1aa');
    g.addColorStop(0.5, '#d5d9de');
    g.addColorStop(1, '#a3aab3');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Port display (3x DP + 1x HDMI)
    ctx.fillStyle = '#0b0d10';
    for (let i = 0; i < 4; i++) roundRect(ctx, 70, 60 + i * 70, 110, 44, 6), ctx.fill();
    // Vent heksagon
    for (let r = 0; r < 6; r++)
      for (let c = 0; c < 4; c++) {
        ctx.beginPath();
        const x = 50 + c * 50 + (r % 2) * 25;
        const y = 370 + r * 36;
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k;
          ctx.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
        }
        ctx.closePath();
        ctx.fill();
      }
  });

export const fanHubTexture = (accent = '#FF7A2F') =>
  make(`fan-hub-${accent}`, 256, 256, (ctx, W, H) => {
    ctx.fillStyle = '#121418';
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, W / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, W / 2 - 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.font = font(96, 900);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('M', W / 2, H / 2 + 4);
  });

// ============================================================================
// PSU
// ============================================================================
export const psuLabelTexture = () =>
  make('psu-label', 768, 512, (ctx, W, H) => {
    ctx.fillStyle = '#16191e';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e5e7eb';
    roundRect(ctx, 30, 30, W - 60, H - 60, 18);
    ctx.fill();
    ctx.fillStyle = '#0b0d10';
    ctx.font = font(64, 900);
    ctx.fillText('MOHEF POWER', 66, 118);
    ctx.fillStyle = '#FF7A2F';
    ctx.font = font(90, 900);
    ctx.fillText('750W', 66, 214);
    // Badge 80+ Gold
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(600, 170, 72, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b0d10';
    ctx.textAlign = 'center';
    ctx.font = font(34, 900);
    ctx.fillText('80 PLUS', 600, 162);
    ctx.font = font(30, 800);
    ctx.fillText('GOLD', 600, 198);
    ctx.textAlign = 'left';
    // Tabel spesifikasi DC output
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    for (let r = 0; r < 4; r++) ctx.strokeRect(66, 270 + r * 46, W - 132, 46);
    for (let c = 1; c < 5; c++) {
      ctx.beginPath();
      ctx.moveTo(66 + c * ((W - 132) / 5), 270);
      ctx.lineTo(66 + c * ((W - 132) / 5), 454);
      ctx.stroke();
    }
    ctx.fillStyle = '#334155';
    ctx.font = font(22, 700, 'mono');
    const cols = ['DC OUT', '+3.3V', '+5V', '+12V', '-12V'];
    cols.forEach((t, i) => ctx.fillText(t, 76 + i * ((W - 132) / 5), 302));
    const vals = ['MAX', '20A', '20A', '62.5A', '0.3A'];
    vals.forEach((t, i) => ctx.fillText(t, 76 + i * ((W - 132) / 5), 348));
    ctx.fillText('AC IN 100-240V~ 10A 50/60Hz', 76, 394);
    ctx.fillText('FULLY MODULAR · ATX 3.0', 76, 440);
  });

/** Panel modular (sisi depan PSU): posisi label menyesuaikan geometri soket di Psu(). */
export const psuModularTexture = () =>
  make('psu-modular', 600, 344, (ctx, W, H) => {
    ctx.fillStyle = '#121418';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, W - 20, H - 20);
    ctx.fillStyle = '#f8fafc';
    ctx.font = font(26, 800, 'mono');
    ctx.fillText('24-PIN', 40, 150);
    ctx.fillText('CPU', 250, 150);
    ctx.fillText('PCIe', 400, 150);
    ctx.fillText('SATA', 40, 318);
    ctx.fillText('PCIe', 250, 318);
    ctx.fillText('CPU', 400, 318);
    ctx.fillStyle = '#FF7A2F';
    ctx.fillRect(20, 20, 6, H - 40);
  });

export const psuRearTexture = () =>
  make('psu-rear', 600, 344, (ctx, W, H) => {
    ctx.fillStyle = '#16191e';
    ctx.fillRect(0, 0, W, H);
    // Kisi honeycomb
    ctx.fillStyle = '#05070a';
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 12; c++) {
        const x = 30 + c * 28 + (r % 2) * 14;
        const y = 30 + r * 32;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k + Math.PI / 6;
          ctx.lineTo(x + Math.cos(a) * 11, y + Math.sin(a) * 11);
        }
        ctx.closePath();
        ctx.fill();
      }
    ctx.fillStyle = '#cbd5e1';
    ctx.font = font(18, 700, 'mono');
    ctx.fillText('I / O', 470, 300);
    ctx.fillText('100-240V~', 390, 40);
  });

export const psuGrilleTexture = () =>
  make('psu-grille', 512, 512, (ctx, W, H) => {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#2b3038';
    ctx.lineWidth = 7;
    for (let r = 40; r < 250; r += 34) {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let k = 0; k < 4; k++) {
      const a = (Math.PI / 2) * k + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(W / 2, H / 2);
      ctx.lineTo(W / 2 + Math.cos(a) * 250, H / 2 + Math.sin(a) * 250);
      ctx.stroke();
    }
  });

// ============================================================================
// CASING
// ============================================================================
export const meshPanelTexture = () =>
  make(
    'case-mesh',
    256,
    256,
    (ctx, W, H) => {
      ctx.fillStyle = '#1a1e24';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#05070a';
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
          const x = 16 + c * 32 + (r % 2) * 16;
          const y = 16 + r * 32;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI / 3) * k + Math.PI / 6;
            ctx.lineTo(x + Math.cos(a) * 12.5, y + Math.sin(a) * 12.5);
          }
          ctx.closePath();
          ctx.fill();
        }
    },
    { repeat: [6, 6] }
  );

export const glassStreakTexture = () =>
  make('glass-streak', 512, 512, (ctx, W, H) => {
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.28, 'rgba(255,255,255,0)');
    g.addColorStop(0.32, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.36, 'rgba(255,255,255,0.05)');
    g.addColorStop(0.42, 'rgba(255,255,255,0.28)');
    g.addColorStop(0.46, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // tint tepi gelap (frit border)
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 26;
    ctx.strokeRect(0, 0, W, H);
  });

export const shroudTexture = () =>
  make('psu-shroud', 1024, 256, (ctx, W, H) => {
    ctx.fillStyle = '#15191f';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#05070a';
    for (let i = 0; i < 14; i++) roundRect(ctx, 520 + i * 32, 70, 16, 120, 8), ctx.fill();
    ctx.fillStyle = 'rgba(248,250,252,0.85)';
    ctx.font = font(64, 900);
    ctx.fillText('MOHEF', 60, 150);
    ctx.fillStyle = '#FF7A2F';
    ctx.font = font(28, 800, 'mono');
    ctx.fillText('TECH · BUILD 02', 64, 196);
  });

export const chipsetTexture = () =>
  make('chipset', 512, 512, (ctx, W, H) => {
    ctx.fillStyle = '#2a2f37';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    for (let i = 0; i < 10; i++) ctx.fillRect(0, 40 + i * 46, W, 18);
    ctx.fillStyle = '#FF7A2F';
    ctx.fillRect(0, H - 40, W, 10);
    ctx.fillStyle = '#e5e7eb';
    ctx.font = font(70, 900);
    ctx.fillText('MOHEF', 40, 260);
  });

export const ioShroudTexture = () =>
  make('io-shroud', 256, 1024, (ctx, W, H) => {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#20242b');
    g.addColorStop(1, '#30353d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 100 + i * 100);
      ctx.lineTo(W, 60 + i * 100);
      ctx.stroke();
    }
    ctx.fillStyle = '#FF7A2F';
    ctx.fillRect(W - 26, 0, 10, H);
    ctx.save();
    ctx.translate(120, 760);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#e5e7eb';
    ctx.font = font(64, 900);
    ctx.fillText('MOHEF', 0, 0);
    ctx.restore();
  });

export const coolerTopTexture = () =>
  make('cooler-top', 512, 1024, (ctx, W, H) => {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#1e2228');
    g.addColorStop(1, '#2c3139');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#FF7A2F';
    ctx.fillRect(0, 0, 14, H);
    ctx.save();
    ctx.translate(300, 820);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#e5e7eb';
    ctx.font = font(110, 900);
    ctx.fillText('MOHEF', 0, 0);
    ctx.font = font(44, 700, 'mono');
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('FROST TOWER 6', 0, 70);
    ctx.restore();
  });

export const sleeveTexture = (accent: string) =>
  make(
    `sleeve-${accent}`,
    64,
    64,
    (ctx, W, H) => {
      ctx.fillStyle = '#0e1013';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#2d323a';
      ctx.lineWidth = 6;
      for (let i = -2; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 22, 0);
        ctx.lineTo(i * 22 + 44, H);
        ctx.stroke();
      }
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 3;
      for (let i = -2; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 22 + 44, 0);
        ctx.lineTo(i * 22, H);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
    { repeat: [40, 1] }
  );

export const radialShadowTexture = () =>
  make(
    'radial-shadow',
    256,
    256,
    (ctx, W, H) => {
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
      g.addColorStop(0, 'rgba(0,0,0,0.75)');
      g.addColorStop(0.6, 'rgba(0,0,0,0.3)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    },
    { srgb: false }
  );

export const glowSpriteTexture = () =>
  make(
    'glow-sprite',
    128,
    128,
    (ctx, W, H) => {
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    },
    { srgb: false }
  );

// ============================================================================
// MEJA KERJA (kontinuitas Episode 1)
// ============================================================================
export const deskWoodTexture = () =>
  make('desk-wood', 1024, 512, (ctx, W, H) => {
    ctx.fillStyle = '#b98b5e';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) {
      const y = random(`wood-${i}`) * H;
      ctx.strokeStyle = `rgba(${90 + random(`wc-${i}`) * 40}, ${60 + random(`wc2-${i}`) * 25}, 35, ${0.12 + random(`wa-${i}`) * 0.2})`;
      ctx.lineWidth = 1 + random(`ww-${i}`) * 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= W; x += 64) {
        ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 4 * random(`wamp-${i}`));
      }
      ctx.stroke();
    }
  });

export const floorPlankTexture = () =>
  make(
    'floor-planks',
    512,
    512,
    (ctx, W, H) => {
      const rows = 4;
      for (let r = 0; r < rows; r++) {
        ctx.fillStyle = r % 2 === 0 ? '#C9A47E' : '#BD9670';
        ctx.fillRect(0, (r * H) / rows, W, H / rows);
        ctx.strokeStyle = 'rgba(80,55,30,0.35)';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, (r * H) / rows, W, H / rows);
        const cut = (r * 173) % W;
        ctx.beginPath();
        ctx.moveTo(cut, (r * H) / rows);
        ctx.lineTo(cut, ((r + 1) * H) / rows);
        ctx.stroke();
        for (let i = 0; i < 14; i++) {
          const y = (r * H) / rows + random(`fl-${r}-${i}`) * (H / rows);
          ctx.strokeStyle = 'rgba(110,75,40,0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y + 2);
          ctx.stroke();
        }
      }
    },
    { repeat: [4, 4] }
  );

export const wallOutletTexture = () =>
  make('wall-outlet', 256, 384, (ctx, W, H) => {
    ctx.fillStyle = '#f1f5f9';
    roundRect(ctx, 0, 0, W, H, 26);
    ctx.fill();
    const socket = (cy: number) => {
      ctx.fillStyle = '#d7dde5';
      ctx.beginPath();
      ctx.arc(W / 2, cy, 78, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(W / 2 - 30, cy, 13, 0, Math.PI * 2);
      ctx.arc(W / 2 + 30, cy, 13, 0, Math.PI * 2);
      ctx.fill();
      // klip grounding
      ctx.fillStyle = '#9ca3af';
      ctx.fillRect(W / 2 - 8, cy - 74, 16, 16);
      ctx.fillRect(W / 2 - 8, cy + 58, 16, 16);
    };
    socket(110);
    socket(274);
  });

export const upsFrontTexture = () =>
  make('ups-front', 256, 512, (ctx, W, H) => {
    ctx.fillStyle = '#14171c';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0b1f17';
    roundRect(ctx, 40, 60, W - 80, 120, 10);
    ctx.fill();
    ctx.fillStyle = '#10B981';
    ctx.font = font(34, 800, 'mono');
    ctx.fillText('220V OK', 56, 112);
    ctx.font = font(24, 700, 'mono');
    ctx.fillText('BATT 100%', 56, 152);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(70 + i * 56, 230, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#e5e7eb';
    ctx.font = font(30, 900);
    ctx.fillText('UPS 1200VA', 44, 320);
    ctx.fillStyle = '#2a2f37';
    for (let i = 0; i < 8; i++) ctx.fillRect(40, 360 + i * 16, W - 80, 6);
  });

export const surgeStripTexture = () =>
  make('surge-strip', 1024, 192, (ctx, W, H) => {
    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, 0, 0, W, H, 40);
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      const cx = 180 + i * 190;
      ctx.fillStyle = '#d7dde5';
      ctx.beginPath();
      ctx.arc(cx, H / 2, 62, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(cx - 22, H / 2, 10, 0, Math.PI * 2);
      ctx.arc(cx + 22, H / 2, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#FF7A2F';
    roundRect(ctx, 900, 60, 80, 72, 12);
    ctx.fill();
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(60, H / 2, 12, 0, Math.PI * 2);
    ctx.fill();
  });

export const keyboardTexture = () =>
  make('keyboard', 1024, 320, (ctx, W, H) => {
    ctx.fillStyle = '#1a1d22';
    ctx.fillRect(0, 0, W, H);
    const rows = 5;
    for (let r = 0; r < rows; r++) {
      let x = 16;
      const count = r === 4 ? 9 : 14;
      for (let c = 0; c < count; c++) {
        const wide = r === 4 && c === 4 ? 300 : r === 4 ? 70 : 62;
        ctx.fillStyle = '#2b3038';
        roundRect(ctx, x, 16 + r * 60, wide - 8, 50, 8);
        ctx.fill();
        x += wide;
      }
    }
  });

export type ScreenVariant = 'standby' | 'desktop';

export const monitorScreenTexture = (variant: ScreenVariant) =>
  make(`monitor-${variant}`, 1024, 576, (ctx, W, H) => {
    if (variant === 'standby') {
      ctx.fillStyle = '#05070b';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(148,163,184,0.18)';
      ctx.font = font(40, 800);
      ctx.textAlign = 'center';
      ctx.fillText('NO SIGNAL', W / 2, H / 2);
      return;
    }
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#0b1a33');
    g.addColorStop(0.55, '#10294d');
    g.addColorStop(1, '#3b1d12');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // glow oranye brand
    const rg = ctx.createRadialGradient(W * 0.78, H * 0.75, 10, W * 0.78, H * 0.75, 380);
    rg.addColorStop(0, 'rgba(255,122,47,0.55)');
    rg.addColorStop(1, 'rgba(255,122,47,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
    // Jendela setup
    ctx.fillStyle = 'rgba(15,22,34,0.92)';
    roundRect(ctx, 250, 130, 524, 300, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,255,0.45)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.font = font(36, 900);
    ctx.fillText('MOHEF TECH', 290, 200);
    ctx.fillStyle = '#94a3b8';
    ctx.font = font(24, 700, 'mono');
    ctx.fillText('BUILD 02 · QC PASSED', 290, 240);
    ctx.fillStyle = '#00E5FF';
    ctx.fillText('NEXT: EP.03 INSTALASI SISTEM', 290, 300);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    roundRect(ctx, 290, 340, 444, 18, 9);
    ctx.fill();
    ctx.fillStyle = '#10B981';
    roundRect(ctx, 290, 340, 300, 18, 9);
    ctx.fill();
    // Taskbar
    ctx.fillStyle = 'rgba(7,11,18,0.85)';
    ctx.fillRect(0, H - 46, W, 46);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i === 0 ? '#FF7A2F' : 'rgba(148,163,184,0.5)';
      roundRect(ctx, 400 + i * 40, H - 36, 26, 26, 6);
      ctx.fill();
    }
  });
