import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", {
  weights: ["600", "800"],
  subsets: ["latin"],
});

export const FONT_FAMILY = fontFamily;

export const FONT_WEIGHTS = {
  headline: 800,
  label: 800,
  body: 600,
} as const;

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const sec = (s: number): number => Math.round(s * FPS);

export const SCENE_SECONDS = {
  s1: 6,
  s2: 9,
  s3: 10,
  s4: 9,
  s5: 8,
} as const;

export const TOTAL_SECONDS =
  SCENE_SECONDS.s1 +
  SCENE_SECONDS.s2 +
  SCENE_SECONDS.s3 +
  SCENE_SECONDS.s4 +
  SCENE_SECONDS.s5;

export const SCENE_FRAMES = {
  s1: sec(SCENE_SECONDS.s1),
  s2: sec(SCENE_SECONDS.s2),
  s3: sec(SCENE_SECONDS.s3),
  s4: sec(SCENE_SECONDS.s4),
  s5: sec(SCENE_SECONDS.s5),
} as const;

export const SCENE_STARTS = {
  s1: 0,
  s2: sec(SCENE_SECONDS.s1),
  s3: sec(SCENE_SECONDS.s1 + SCENE_SECONDS.s2),
  s4: sec(SCENE_SECONDS.s1 + SCENE_SECONDS.s2 + SCENE_SECONDS.s3),
  s5: sec(
    SCENE_SECONDS.s1 + SCENE_SECONDS.s2 + SCENE_SECONDS.s3 + SCENE_SECONDS.s4
  ),
} as const;

export const SCENE_START_LIST = [
  SCENE_STARTS.s1,
  SCENE_STARTS.s2,
  SCENE_STARTS.s3,
  SCENE_STARTS.s4,
  SCENE_STARTS.s5,
] as const;

export const TOTAL_FRAMES = sec(TOTAL_SECONDS);

export const TIMING_SECONDS = {
  minHoldAfterLast: 2,
  exitDuration: 0.4,
  enterDuration: 0.4,
  wordStagger: 0.12,
  underlineDelay: 0.25,
  underlineDuration: 0.35,
  logoBounceDuration: 0.4,
  priceCountDuration: 1.0,
  stageBreathCycle: 3.0,
  cursorRippleDuration: 0.5,
  cursorClickDipDuration: 0.2,
} as const;

export const TIMING_FRAMES = {
  minHoldAfterLast: sec(TIMING_SECONDS.minHoldAfterLast),
  exitDuration: sec(TIMING_SECONDS.exitDuration),
  enterDuration: sec(TIMING_SECONDS.enterDuration),
  wordStagger: sec(TIMING_SECONDS.wordStagger),
  underlineDelay: sec(TIMING_SECONDS.underlineDelay),
  underlineDuration: sec(TIMING_SECONDS.underlineDuration),
  logoBounceDuration: sec(TIMING_SECONDS.logoBounceDuration),
  priceCountDuration: sec(TIMING_SECONDS.priceCountDuration),
  stageBreathCycle: sec(TIMING_SECONDS.stageBreathCycle),
  cursorRippleDuration: sec(TIMING_SECONDS.cursorRippleDuration),
  cursorClickDipDuration: sec(TIMING_SECONDS.cursorClickDipDuration),
} as const;

export const COLORS = {
  bg: "#2D5BFF",
  bgDeep: "#1E3FCC",
  bgLight: "#5B84FF",
  ink: "#0F1F4D",
  accent: "#FF7A2F",
  mint: "#7CF2C7",
  white: "#FFFFFF",
  green: "#22C55E",
  red: "#EF4444",
} as const;

export const LAYOUT = {
  safeXMin: 60,
  safeXMax: 920,
  safeWidth: 860,
  safeYMin: 140,
  safeYMax: 1520,
  safeHeight: 1380,
  logoX: 60,
  logoY: 60,
  logoSize: 64,
  logoRadius: 18,
  logoFontSize: 30,
  labelY: 140,
  labelHeight: 72,
  labelFontSize: 38,
  labelPaddingX: 32,
  labelRadius: 999,
  headlineY: 250,
  headlineFontSize: 92,
  headlineLineHeight: 1.05,
  headlineMaxLines: 3,
  headlineWordGap: 20,
  headlineRowGap: 10,
  underlineHeight: 10,
  underlineOffset: 6,
  contentTopY: 580,
  bodyMinFontSize: 44,
  subtitleFontSize: 44,
  cardTitleFontSize: 48,
  priceMinFontSize: 72,
  priceFontSize: 76,
  cardRadius: 40,
  cardPaddingX: 40,
  cardPaddingY: 34,
  borderWidth: 4,
  shadowOffset: 8,
  cursorSize: 42,
  cursorRippleSize: 96,
} as const;

export const SOLID_SHADOW = `${LAYOUT.shadowOffset}px ${LAYOUT.shadowOffset}px 0px ${COLORS.ink}`;

export const LOGO_TEXT = "MT";
export const BRAND_NAME = "MOHEF TECH";
export const HANDLE = "@moheftech";
export const GARANSI_TEXT = "UJI, TRAINING & SERAH TERIMA";

export const ALLOWED_INFO = {
  since: "Sejak 2023",
  freeConsult: "Konsultasi pertama gratis",
  writtenEstimate: "Estimasi tertulis sebelum mulai",
} as const;

export const DATA = {
  ram8gb: {
    judul: "RAM 8GB",
    harga: "Rp350.000",
    subjudul: "Upgrade & Ganti RAM Laptop / PC",
  },
  lanMikrotik: {
    judul: "LAN & Mikrotik",
    harga: "Rp250.000 / titik",
    subjudul: "Instalasi Kabel & Konfigurasi Jaringan",
  },
  katalogCompanyProfile: {
    judul: "Katalog & Company Profile",
    harga: "mulai Rp1.500.000",
    subjudul: "Website Profil Bisnis Responsif",
  },
  sistemWebApp: {
    judul: "Sistem & Web App",
    harga: "mulai Rp3.000.000",
    subjudul: "Aplikasi Operasional & Database Custom",
  },
  paket: {
    sederhana: {
      judul: "Sederhana",
      harga: "Rp3.000.000",
      subjudul: "Katalog Layanan & Pencatatan Dasar",
    },
    menengah: {
      judul: "Menengah",
      harga: "Rp6.000.000",
      subjudul: "Multi-Role, Dashboard & Laporan",
    },
    kompleks: {
      judul: "Kompleks",
      harga: "Custom / Negosiasi",
      subjudul: "Integrasi Sistem & Alur Kerja Khusus",
    },
  },
} as const;

export const SCENE_COPY = {
  s1: {
    label: "MOHEF TECH",
    headline: "BIKIN WEBSITE ITU BERAPA?",
    accentWords: ["BERAPA"],
  },
  s2: {
    label: "S2",
    headline: "HARGA JELAS DARI AWAL",
    accentWords: ["HARGA", "JELAS"],
  },
  s3: {
    label: "S3",
    headline: "SISTEM & WEB APP BISNIS",
    accentWords: ["WEB", "APP"],
  },
  s4: {
    label: "S4",
    headline: "UJI, TRAINING & SERAH TERIMA",
    accentWords: ["SERAH", "TERIMA"],
  },
  s5: {
    label: "S5",
    headline: "KONSULTASI PERTAMA GRATIS",
    accentWords: ["PERTAMA", "GRATIS"],
  },
} as const;

export const S1 = {
  label: "MOHEF TECH",
  headline: "BIKIN WEBSITE ITU BERAPA?",
  accentWords: ["BERAPA"] as const,
  overCardText: "WEBSITE COMPANY PROFILE · MULAI DARI",
  pricePrefix: "Rp",
  priceTokens: ["1", ".", "5", "0", "0", ".", "0", "0", "0"] as const,
  subtitle: "KUBUKA SEMUA HARGANYA DI VIDEO INI",
  chips: ["WEB", "APLIKASI", "SISTEM"] as const,
  timing: {
    logoPop: 0.0,
    labelEnter: 0.2,
    headlineStart: 0.3,
    headlineEnd: 1.6,
    headlineWordStagger: 0.25,
    accentPunchDuration: 0.45,
    cardEnter: 1.6,
    cardEnterDuration: 0.45,
    slotStopStart: 2.0,
    slotStopEnd: 3.4,
    cardShakeStart: 3.4,
    cardShakeDuration: 0.4,
    confettiStart: 3.4,
    confettiDuration: 20 / FPS,
    subtitleStart: 3.8,
    subtitleEnd: 4.5,
    chipsStart: 4.4,
    chipsEnd: 5.0,
    holdStart: 5.0,
    holdEnd: 5.6,
    exitStart: 5.6,
    exitEnd: 6.0,
  },
  layout: {
    overCardY: 632,
    overCardFontSize: 34,
    cardY: 700,
    cardWidth: 860,
    cardHeight: 420,
    slotFontSize: 120,
    slotRowHeight: 138,
    slotDigitWidth: 72,
    slotDotWidth: 30,
    subtitleY: 1158,
    subtitleFontSize: 56,
    chipsY: 1348,
    chipFontSize: 44,
    confettiCount: 16,
    confettiFrames: 20,
  },
  accentPunchScale: 1.25,
  sfx: {
    logoPop: "pop",
    labelPop: "pop-in",
    headlineWhoosh: "transition-whoosh-soft",
    cardEnter: "transition-swoosh",
    slotTick: "tick",
    slotDing: "ding-bell",
    chipPop: "pop-plop",
  },
} as const;

export const BG_CONFIG = {
  seed: "seed-mt",
  gridSize: 80,
  gridOpacity: 0.08,
  gridSpeed: 0.4,
  blobCount: 4,
  blobOpacityMin: 0.25,
  blobOpacityMax: 0.35,
  blobSizeMin: 420,
  blobSizeMax: 680,
  blobDriftRadius: 55,
  iconCount: 12,
  iconOpacityMin: 0.12,
  iconOpacityMax: 0.2,
  iconSizeMin: 70,
  iconSizeMax: 120,
  parallaxLayers: 3,
  maxTotalElements: 30,
  iconTypes: [
    "chip",
    "code",
    "wifi",
    "gear",
    "screen",
    "cable",
    "database",
    "lock",
  ] as const,
} as const;

export const SFX = {
  volume: 0.8,
  sceneEnter: "pop-in",
  sceneTransition: "transition-swoosh",
  cardPop: "pop-plop",
  click: "click",
  confirm: "confirm-chime",
} as const;

export const SPRING_CONFIG = {
  word: {
    damping: 14,
    stiffness: 160,
    mass: 0.7,
  },
  card: {
    damping: 16,
    stiffness: 150,
    mass: 0.8,
  },
} as const;

export const DEFAULT_CURSOR_WAYPOINTS = [
  { sec: 0.2, x: 760, y: 1180, click: false },
  { sec: 1.2, x: 490, y: 880, click: true },
  { sec: 2.6, x: 540, y: 1120, click: true },
] as const;

export const parseRupiahString = (
  raw: string
): {
  hasNumber: boolean;
  prefix: string;
  targetNumber: number;
  suffix: string;
} => {
  const match = raw.match(/^(.*?Rp)\s*([\d.]+)(.*)$/i);
  if (!match) {
    return {
      hasNumber: false,
      prefix: "",
      targetNumber: 0,
      suffix: raw,
    };
  }
  const prefix = match[1];
  const digitsOnly = match[2].replace(/\./g, "");
  const targetNumber = Number.parseInt(digitsOnly, 10) || 0;
  const suffix = match[3] || "";
  return {
    hasNumber: true,
    prefix,
    targetNumber,
    suffix,
  };
};

export const formatDots = (num: number): string => {
  const rounded = Math.max(0, Math.round(num));
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

