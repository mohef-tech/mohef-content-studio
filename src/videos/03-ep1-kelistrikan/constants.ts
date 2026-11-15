import { MotionStylePreset, STYLES_CATALOG, WordItem } from '../../lib/motion-craft';

export const EP1_FPS = 30;
export const EP1_WIDTH = 1080;
export const EP1_HEIGHT = 1920;

export const EP1_DURATIONS = {
  scene1: 336,
  scene2: 300,
  scene3: 270,
  scene4: 270,
  scene5: 330,
} as const;

export const EP1_LAYOUT = {
  safeX: 60,
  contentWidth: 960,
  stageTop: 130,
  stageHeight: 830, // Y: 130..960
  bottomTop: 980,
  bottomHeight: 660, // Y: 980..1640
  subtitleBottomOffset: 130, // sits cleanly inside Y: 1650..1820
} as const;

export const EP1_COLORS = {
  bg: '#070B12',
  surface: '#0F1622',
  surfaceElevated: '#162032',
  border: 'rgba(148, 163, 184, 0.22)',
  ink: '#F8FAFC',
  muted: '#94A3B8',
  power: '#FF7A2F', // Oranye = Jalur Power 220V
  data: '#00E5FF', // Biru Sian = Jalur Data/Monitor
  ground: '#10B981', // Hijau = Grounding & Proteksi UPS
  overload: '#EF4444', // Merah = Indikasi Overload/Interferensi
} as const;

export const EP1_FONTS = {
  heading: "Inter, 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "Inter, 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
} as const;

export const EP1_STYLE_PRESET: MotionStylePreset = {
  ...STYLES_CATALOG[27],
  palette: {
    bg: EP1_COLORS.bg,
    surface: EP1_COLORS.surface,
    ink: EP1_COLORS.ink,
    muted: EP1_COLORS.muted,
    accent: EP1_COLORS.power,
    accentSecondary: EP1_COLORS.data,
  },
  typography: {
    heading: EP1_FONTS.heading,
    body: EP1_FONTS.body,
    mono: EP1_FONTS.mono,
    headingWeight: 800,
    uppercaseHeading: false,
  },
};

export const SCENE1_WORDS: WordItem[] = [
  { text: 'Kemarin,', startMs: 60, endMs: 600 },
  { text: 'kita', startMs: 860, endMs: 1080 },
  { text: 'sudah', startMs: 1080, endMs: 1420 },
  { text: 'menata', startMs: 1420, endMs: 1760 },
  { text: 'layout', startMs: 1760, endMs: 2000, role: 'keyword' },
  { text: 'ruang', startMs: 2000, endMs: 2160 },
  { text: 'kerja', startMs: 2160, endMs: 2520 },
  { text: '4x4', startMs: 2520, endMs: 3060, role: 'keyword' },
  { text: 'meter.', startMs: 3060, endMs: 3500 },
  { text: 'Hari', startMs: 4240, endMs: 4440 },
  { text: 'ini,', startMs: 4440, endMs: 4840 },
  { text: 'kita', startMs: 5080, endMs: 5200 },
  { text: 'lanjut', startMs: 5200, endMs: 5500 },
  { text: 'ke', startMs: 5500, endMs: 5600 },
  { text: 'modal', startMs: 5600, endMs: 5820, role: 'keyword' },
  { text: 'paling', startMs: 5820, endMs: 6020 },
  { text: 'penting', startMs: 6020, endMs: 6340, role: 'keyword' },
  { text: 'sebelum', startMs: 6340, endMs: 6660 },
  { text: 'beli', startMs: 6660, endMs: 6860 },
  { text: 'meja', startMs: 6860, endMs: 7100 },
  { text: 'atau', startMs: 7100, endMs: 7340 },
  { text: 'rakit', startMs: 7340, endMs: 7620 },
  { text: 'PC,', startMs: 7620, endMs: 8000, role: 'keyword' },
  { text: 'yaitu', startMs: 8240, endMs: 8640 },
  { text: 'listrik', startMs: 8640, endMs: 9000, role: 'keyword' },
  { text: '&', startMs: 9000, endMs: 9200 },
  { text: 'manajemen', startMs: 9200, endMs: 9560, role: 'keyword' },
  { text: 'kabel.', startMs: 9560, endMs: 10050, role: 'keyword' },
];

export const SCENE2_WORDS: WordItem[] = [
  { text: 'Pertama,', startMs: 0, endMs: 768, role: 'keyword' },
  { text: 'fondasi', startMs: 880, endMs: 1332, role: 'keyword' },
  { text: 'daya.', startMs: 1332, endMs: 1914, role: 'keyword' },
  { text: 'Pisahkan', startMs: 2576, endMs: 2970 },
  { text: 'jalur', startMs: 2970, endMs: 3213 },
  { text: 'MCB', startMs: 3213, endMs: 3560, role: 'keyword' },
  { text: 'khusus', startMs: 3560, endMs: 3873 },
  { text: 'workstation', startMs: 3873, endMs: 4451, role: 'keyword' },
  { text: 'agar', startMs: 4451, endMs: 4671 },
  { text: 'tidak', startMs: 4671, endMs: 4880 },
  { text: 'jeglek', startMs: 4880, endMs: 5204, role: 'keyword' },
  { text: 'saat', startMs: 5204, endMs: 5412 },
  { text: 'PC', startMs: 5412, endMs: 5643, role: 'keyword' },
  { text: 'kerja', startMs: 5643, endMs: 5910 },
  { text: 'penuh,', startMs: 5910, endMs: 6469 },
  { text: 'dan', startMs: 6604, endMs: 6789 },
  { text: 'wajib', startMs: 6789, endMs: 7067, role: 'keyword' },
  { text: 'pasang', startMs: 7067, endMs: 7310 },
  { text: 'grounding', startMs: 7310, endMs: 7692, role: 'keyword' },
  { text: 'agar', startMs: 7692, endMs: 7935 },
  { text: 'komponen', startMs: 7935, endMs: 8294 },
  { text: 'aman.', startMs: 8294, endMs: 8865, role: 'keyword' },
];

export const SCENE3_WORDS: WordItem[] = [
  { text: 'Kedua,', startMs: 0, endMs: 710, role: 'keyword' },
  { text: 'titik', startMs: 823, endMs: 1100 },
  { text: 'stopkontak.', startMs: 1100, endMs: 1960, role: 'keyword' },
  { text: 'Tentukan', startMs: 2623, endMs: 2947 },
  { text: 'posisinya', startMs: 2947, endMs: 3421 },
  { text: 'sesuai', startMs: 3421, endMs: 3722 },
  { text: 'zona', startMs: 3722, endMs: 3930, role: 'keyword' },
  { text: 'meja', startMs: 3930, endMs: 4174 },
  { text: 'kerja', startMs: 4174, endMs: 4463 },
  { text: 'sejak', startMs: 4463, endMs: 4752 },
  { text: 'awal,', startMs: 4752, endMs: 5358 },
  { text: 'supaya', startMs: 5481, endMs: 5852 },
  { text: 'tidak', startMs: 5852, endMs: 6049 },
  { text: 'ada', startMs: 6049, endMs: 6176 },
  { text: 'kabel', startMs: 6176, endMs: 6373, role: 'keyword' },
  { text: 'utama', startMs: 6373, endMs: 6697 },
  { text: 'yang', startMs: 6697, endMs: 6824 },
  { text: 'melintang', startMs: 6824, endMs: 7136, role: 'keyword' },
  { text: 'jauh', startMs: 7136, endMs: 7426 },
  { text: 'di', startMs: 7426, endMs: 7518 },
  { text: 'lantai.', startMs: 7518, endMs: 8193, role: 'keyword' },
];

export const SCENE4_WORDS: WordItem[] = [
  { text: 'Ketiga,', startMs: 0, endMs: 756, role: 'keyword' },
  { text: 'proteksi', startMs: 869, endMs: 1297, role: 'keyword' },
  { text: 'daya.', startMs: 1297, endMs: 1903, role: 'keyword' },
  { text: 'Gunakan', startMs: 2555, endMs: 2949 },
  { text: 'Surge', startMs: 2949, endMs: 3226, role: 'keyword' },
  { text: 'Protector', startMs: 3226, endMs: 3701, role: 'keyword' },
  { text: 'dan', startMs: 3701, endMs: 3874 },
  { text: 'UPS', startMs: 3874, endMs: 4233, role: 'keyword' },
  { text: 'sebagai', startMs: 4233, endMs: 4499 },
  { text: 'tameng', startMs: 4499, endMs: 4835, role: 'keyword' },
  { text: 'saat', startMs: 4835, endMs: 5043 },
  { text: 'tegangan', startMs: 5043, endMs: 5321, role: 'keyword' },
  { text: 'naik-turun', startMs: 5321, endMs: 5796 },
  { text: 'atau', startMs: 5796, endMs: 5992 },
  { text: 'mati', startMs: 5992, endMs: 6201, role: 'keyword' },
  { text: 'lampu', startMs: 6201, endMs: 6444, role: 'keyword' },
  { text: 'mendadak.', startMs: 6444, endMs: 7108 },
];

export const SCENE5_WORDS: WordItem[] = [
  { text: 'Terakhir,', startMs: 0, endMs: 687, role: 'keyword' },
  { text: 'pisahkan', startMs: 799, endMs: 1216 },
  { text: 'jalur', startMs: 1216, endMs: 1436 },
  { text: 'kabel', startMs: 1436, endMs: 1656 },
  { text: 'power', startMs: 1656, endMs: 1934, role: 'keyword' },
  { text: 'dan', startMs: 1934, endMs: 2119 },
  { text: 'data', startMs: 2119, endMs: 2397, role: 'keyword' },
  { text: 'di', startMs: 2397, endMs: 2501 },
  { text: 'cable', startMs: 2501, endMs: 2744, role: 'keyword' },
  { text: 'tray', startMs: 2744, endMs: 3010, role: 'keyword' },
  { text: 'bawah', startMs: 3010, endMs: 3276 },
  { text: 'meja.', startMs: 3276, endMs: 3893 },
  { text: 'Listrik', startMs: 4548, endMs: 4964, role: 'keyword' },
  { text: 'beres!', startMs: 4964, endMs: 5651, role: 'keyword' },
  { text: 'Lanjut', startMs: 6315, endMs: 6616 },
  { text: 'Episode', startMs: 6616, endMs: 7067, role: 'keyword' },
  { text: '2', startMs: 7067, endMs: 7241, role: 'keyword' },
  { text: 'kita', startMs: 7241, endMs: 7414 },
  { text: 'bedah', startMs: 7414, endMs: 7611 },
  { text: 'meja', startMs: 7611, endMs: 7842, role: 'keyword' },
  { text: 'kerja—yuk', startMs: 7842, endMs: 8768 },
  { text: 'diskusi', startMs: 8768, endMs: 9127, role: 'keyword' },
  { text: 'bareng', startMs: 9127, endMs: 9312 },
  { text: 'Mohef', startMs: 9312, endMs: 9579, role: 'keyword' },
  { text: 'Tech!', startMs: 9579, endMs: 10104, role: 'keyword' },
];
