import { MotionStylePreset, STYLES_CATALOG, WordItem } from '../../lib/motion-craft';

export const EP2_FPS = 30;
export const EP2_WIDTH = 1080;
export const EP2_HEIGHT = 1920;

/** Durasi tiap scene dikunci dari panjang VO edge-tts + napas transisi. */
export const EP2_DURATIONS = {
  scene1: 333, // VO 10.14s + jeda akhir ~1s
  scene2: 328, // VO 10.00s + jeda napas ~0.93s
  scene3: 744, // VO ~23.5s (24.34s file) + hold sistem menyala ~0.5s
  scene4: 678, // VO ~21.35s (22.20s file) + hold lolos QC ~0.40s
  scene5: 295, // VO 8.86s + jeda napas akhir ~0.97s
} as const;

export const EP2_SCENE_STARTS = {
  scene1: 0,
  scene2: EP2_DURATIONS.scene1,
  scene3: EP2_DURATIONS.scene1 + EP2_DURATIONS.scene2,
  scene4: EP2_DURATIONS.scene1 + EP2_DURATIONS.scene2 + EP2_DURATIONS.scene3,
  scene5:
    EP2_DURATIONS.scene1 + EP2_DURATIONS.scene2 + EP2_DURATIONS.scene3 + EP2_DURATIONS.scene4,
} as const;

export const EP2_TOTAL_DURATION =
  EP2_DURATIONS.scene1 +
  EP2_DURATIONS.scene2 +
  EP2_DURATIONS.scene3 +
  EP2_DURATIONS.scene4 +
  EP2_DURATIONS.scene5;

/**
 * Safe zone (wajib): teks/subtitle/CTA ≥300px dari bawah & ≥120px dari kanan.
 * Zona teks: X 90..960, Y 56..1620.
 */
export const EP2_SAFE = {
  left: 90,
  right: 120,
  textRightEdge: 960,
  contentWidth: 870,
  bottomLimit: 1620, // 1920 - 300
  subtitleBottomOffset: 312,
  panelBottom: 1480, // tepi bawah panel kartu (di atas subtitle)
} as const;

export const EP2_COLORS = {
  bg: '#070B12',
  surface: '#0F1622',
  surfaceElevated: '#162032',
  border: 'rgba(148, 163, 184, 0.22)',
  ink: '#F8FAFC',
  muted: '#94A3B8',
  power: '#FF7A2F', // oranye: jalur daya / udara panas
  data: '#00E5FF', // sian: data / highlight
  ground: '#10B981', // hijau: aman / lulus
  overload: '#EF4444',
  cold: '#38BDF8', // udara dingin intake
  warm: '#FF7A2F', // udara panas exhaust
  wall: '#2B4766', // kontinuitas dinding Ep1
  plankA: '#C9A47E', // kontinuitas lantai kayu Ep1
  plankB: '#BD9670',
} as const;

export const EP2_FONTS = {
  heading: "Inter, 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "Inter, 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
} as const;

export const EP2_STYLE_PRESET: MotionStylePreset = {
  ...STYLES_CATALOG[27],
  palette: {
    bg: EP2_COLORS.bg,
    surface: EP2_COLORS.surface,
    ink: EP2_COLORS.ink,
    muted: EP2_COLORS.muted,
    accent: EP2_COLORS.power,
    accentSecondary: EP2_COLORS.data,
  },
  typography: {
    heading: EP2_FONTS.heading,
    body: EP2_FONTS.body,
    mono: EP2_FONTS.mono,
    headingWeight: 800,
    uppercaseHeading: false,
  },
};

export const EP2_BGM = 'audio/songs/B26-framer-linear-saas-groove.wav';
export const EP2_BGM_LOOP_FRAMES = 300; // file BGM berdurasi tepat 10 detik

/*
 * Timing kata diambil dari WordBoundary edge-tts (public/audio/vo/ep2-sceneN-words.json).
 * Teks tampilan disesuaikan (mis. "P-S-U" → "PSU", "en-vi-em-i" → "NVMe").
 */
export const SCENE1_WORDS: WordItem[] = [
  { text: 'Listrik', startMs: 100, endMs: 512, role: 'keyword' },
  { text: 'sudah', startMs: 512, endMs: 712 },
  { text: 'aman', startMs: 712, endMs: 962, role: 'keyword' },
  { text: 'dari', startMs: 962, endMs: 1112 },
  { text: 'Episode', startMs: 1112, endMs: 1500 },
  { text: '1,', startMs: 1500, endMs: 2050 },
  { text: 'sekarang', startMs: 2312, endMs: 2712 },
  { text: 'pilih', startMs: 2712, endMs: 2938 },
  { text: 'PC-nya.', startMs: 2938, endMs: 3575, role: 'keyword' },
  { text: 'Paket', startMs: 4425, endMs: 4688 },
  { text: 'rakitan', startMs: 4688, endMs: 5100 },
  { text: 'jadi', startMs: 5100, endMs: 5288 },
  { text: 'sering', startMs: 5288, endMs: 5525 },
  { text: 'nanggung,', startMs: 5525, endMs: 6088, role: 'keyword' },
  { text: 'PSU', startMs: 6338, endMs: 6700, role: 'keyword' },
  { text: 'pas-pasan', startMs: 6700, endMs: 7238 },
  { text: 'dan', startMs: 7238, endMs: 7388 },
  { text: 'pengap.', startMs: 7388, endMs: 7850, role: 'keyword' },
  { text: 'Lebih', startMs: 8688, endMs: 9012 },
  { text: 'baik', startMs: 9012, endMs: 9275 },
  { text: 'rakit', startMs: 9275, endMs: 9562, role: 'keyword' },
  { text: 'terukur.', startMs: 9562, endMs: 10138, role: 'keyword' },
];

export const SCENE2_WORDS: WordItem[] = [
  { text: 'Petakan', startMs: 98, endMs: 533 },
  { text: 'kebutuhan.', startMs: 533, endMs: 1185, role: 'keyword' },
  { text: 'Usaha', startMs: 1913, endMs: 2228, role: 'keyword' },
  { text: 'dan', startMs: 2228, endMs: 2380 },
  { text: 'kasir', startMs: 2380, endMs: 2609, role: 'keyword' },
  { text: 'butuh', startMs: 2609, endMs: 2837 },
  { text: 'hemat', startMs: 2837, endMs: 3033 },
  { text: 'daya,', startMs: 3033, endMs: 3500 },
  { text: 'stabil', startMs: 3728, endMs: 4054 },
  { text: 'seharian,', startMs: 4054, endMs: 4641 },
  { text: 'dan', startMs: 4826, endMs: 5065 },
  { text: 'awet.', startMs: 5065, endMs: 5489 },
  { text: 'Kreator', startMs: 6221, endMs: 6612, role: 'keyword' },
  { text: 'dan', startMs: 6612, endMs: 6775 },
  { text: 'gaming', startMs: 6775, endMs: 7025, role: 'keyword' },
  { text: 'butuh', startMs: 7025, endMs: 7242 },
  { text: 'render', startMs: 7242, endMs: 7449 },
  { text: 'cepat,', startMs: 7449, endMs: 7862 },
  { text: 'multitasking,', startMs: 8101, endMs: 8818 },
  { text: 'dan', startMs: 9025, endMs: 9242 },
  { text: 'grafis', startMs: 9242, endMs: 9547 },
  { text: 'tinggi.', startMs: 9547, endMs: 10003 },
];

export const SCENE3_WORDS: WordItem[] = [
  { text: 'Setelah', startMs: 112, endMs: 437 },
  { text: 'kebutuhan', startMs: 438, endMs: 888, role: 'keyword' },
  { text: 'PC', startMs: 888, endMs: 1126, role: 'keyword' },
  { text: 'ditentukan,', startMs: 1125, endMs: 1825 },
  { text: 'sekarang', startMs: 2112, endMs: 2474 },
  { text: 'lanjut', startMs: 2475, endMs: 2787 },
  { text: 'ke', startMs: 2788, endMs: 2850 },
  { text: 'perakitan', startMs: 2850, endMs: 3238, role: 'keyword' },
  { text: 'presisi', startMs: 3238, endMs: 3700, role: 'keyword' },
  { text: 'di', startMs: 3700, endMs: 3800 },
  { text: 'atas', startMs: 3800, endMs: 4075 },
  { text: 'meja.', startMs: 4075, endMs: 4600 },
  { text: 'Panel', startMs: 5450, endMs: 5700, role: 'keyword' },
  { text: 'kaca', startMs: 5700, endMs: 5912, role: 'keyword' },
  { text: 'dibuka,', startMs: 5912, endMs: 6524 },
  { text: 'lalu', startMs: 6800, endMs: 7050 },
  { text: 'komponen', startMs: 7050, endMs: 7400 },
  { text: 'inti', startMs: 7400, endMs: 7625 },
  { text: 'dipasang', startMs: 7625, endMs: 7987 },
  { text: 'satu', startMs: 7988, endMs: 8213 },
  { text: 'per', startMs: 8212, endMs: 8312 },
  { text: 'satu:', startMs: 8312, endMs: 8824 },
  { text: 'mulai', startMs: 9100, endMs: 9388 },
  { text: 'dari', startMs: 9388, endMs: 9563 },
  { text: 'motherboard,', startMs: 9562, endMs: 10262, role: 'keyword' },
  { text: 'prosesor', startMs: 10488, endMs: 11013, role: 'keyword' },
  { text: 'dan', startMs: 11012, endMs: 11200 },
  { text: 'SSD', startMs: 11200, endMs: 11638, role: 'keyword' },
  { text: 'NVMe,', startMs: 11638, endMs: 12276, role: 'keyword' },
  { text: 'keping', startMs: 12525, endMs: 12813 },
  { text: 'RAM,', startMs: 12812, endMs: 13174, role: 'keyword' },
  { text: 'kartu', startMs: 13425, endMs: 13700, role: 'keyword' },
  { text: 'grafis,', startMs: 13700, endMs: 14288, role: 'keyword' },
  { text: 'hingga', startMs: 14488, endMs: 14750 },
  { text: 'power', startMs: 14750, endMs: 14962, role: 'keyword' },
  { text: 'supply', startMs: 14962, endMs: 15300, role: 'keyword' },
  { text: 'bersertifikasi.', startMs: 15300, endMs: 16375 },
  { text: 'Setelah', startMs: 17225, endMs: 17537 },
  { text: 'terpasang', startMs: 17538, endMs: 17913 },
  { text: 'rapi,', startMs: 17912, endMs: 18424 },
  { text: 'kabel', startMs: 18700, endMs: 18988, role: 'keyword' },
  { text: 'daya', startMs: 18988, endMs: 19200, role: 'keyword' },
  { text: 'ditancapkan', startMs: 19200, endMs: 19775 },
  { text: 'ke', startMs: 19775, endMs: 19850 },
  { text: 'stopkontak', startMs: 19850, endMs: 20338, role: 'keyword' },
  { text: 'aman,', startMs: 20338, endMs: 20813, role: 'keyword' },
  { text: 'lalu', startMs: 21100, endMs: 21350 },
  { text: 'tombol', startMs: 21350, endMs: 21650, role: 'keyword' },
  { text: 'power', startMs: 21650, endMs: 21875, role: 'keyword' },
  { text: 'ditekan', startMs: 21875, endMs: 22313 },
  { text: 'dan', startMs: 22312, endMs: 22462 },
  { text: 'sistem', startMs: 22462, endMs: 22787 },
  { text: 'pun', startMs: 22788, endMs: 22938 },
  { text: 'menyala.', startMs: 22938, endMs: 23488, role: 'keyword' },
];

export const SCENE4_WORDS: WordItem[] = [
  { text: 'Setelah', startMs: 100, endMs: 462 },
  { text: 'menyala,', startMs: 462, endMs: 1050, role: 'keyword' },
  { text: 'unit', startMs: 1350, endMs: 1600 },
  { text: 'wajib', startMs: 1600, endMs: 1925 },
  { text: 'melewati', startMs: 1925, endMs: 2312 },
  { text: 'tiga', startMs: 2312, endMs: 2562, role: 'keyword' },
  { text: 'tahap', startMs: 2562, endMs: 2838, role: 'keyword' },
  { text: 'uji', startMs: 2838, endMs: 3112 },
  { text: 'keamanan.', startMs: 3112, endMs: 3775, role: 'keyword' },
  { text: 'Pertama,', startMs: 4625, endMs: 5262, role: 'keyword' },
  { text: 'audit', startMs: 5562, endMs: 5900, role: 'keyword' },
  { text: 'manajemen', startMs: 5900, endMs: 6312 },
  { text: 'kabel', startMs: 6312, endMs: 6662, role: 'keyword' },
  { text: 'dan', startMs: 6662, endMs: 6838 },
  { text: 'penguncian', startMs: 6838, endMs: 7250 },
  { text: 'soket', startMs: 7250, endMs: 7538, role: 'keyword' },
  { text: 'daya', startMs: 7538, endMs: 7875 },
  { text: 'agar', startMs: 7875, endMs: 8188 },
  { text: 'bebas', startMs: 8188, endMs: 8512 },
  { text: 'korslet.', startMs: 8512, endMs: 9050, role: 'keyword' },
  { text: 'Kedua,', startMs: 9900, endMs: 10450, role: 'keyword' },
  { text: 'cek', startMs: 10750, endMs: 10938 },
  { text: 'POST', startMs: 10938, endMs: 11125, role: 'keyword' },
  { text: 'BIOS', startMs: 11125, endMs: 11388, role: 'keyword' },
  { text: 'di', startMs: 11388, endMs: 11450 },
  { text: 'monitor', startMs: 11450, endMs: 11850, role: 'keyword' },
  { text: 'untuk', startMs: 11850, endMs: 12050 },
  { text: 'memastikan', startMs: 12050, endMs: 12525 },
  { text: 'CPU,', startMs: 12525, endMs: 13112, role: 'keyword' },
  { text: 'RAM,', startMs: 13375, endMs: 13850, role: 'keyword' },
  { text: 'dan', startMs: 14088, endMs: 14325 },
  { text: 'NVMe', startMs: 14325, endMs: 14712, role: 'keyword' },
  { text: 'terbaca', startMs: 14712, endMs: 15100 },
  { text: 'penuh.', startMs: 15100, endMs: 15538, role: 'keyword' },
  { text: 'Ketiga,', startMs: 16388, endMs: 17012, role: 'keyword' },
  { text: 'simulasi', startMs: 17312, endMs: 17788 },
  { text: 'airflow', startMs: 17788, endMs: 18200, role: 'keyword' },
  { text: 'dan', startMs: 18200, endMs: 18362 },
  { text: 'uji', startMs: 18362, endMs: 18588 },
  { text: 'beban', startMs: 18588, endMs: 18825 },
  { text: 'suhu', startMs: 18825, endMs: 19138, role: 'keyword' },
  { text: 'agar', startMs: 19138, endMs: 19362 },
  { text: 'sistem', startMs: 19362, endMs: 19700 },
  { text: 'terbukti', startMs: 19700, endMs: 20038 },
  { text: 'stabil', startMs: 20038, endMs: 20475, role: 'keyword' },
  { text: 'sebelum', startMs: 20475, endMs: 20788 },
  { text: 'dikirim.', startMs: 20788, endMs: 21350, role: 'keyword' },
];

export const SCENE5_WORDS: WordItem[] = [
  { text: 'PC', startMs: 97, endMs: 401, role: 'keyword' },
  { text: 'siap', startMs: 401, endMs: 586 },
  { text: 'kerja', startMs: 586, endMs: 847 },
  { text: 'di', startMs: 847, endMs: 923 },
  { text: 'meja', startMs: 923, endMs: 1195 },
  { text: 'yang', startMs: 1195, endMs: 1314 },
  { text: 'listriknya', startMs: 1314, endMs: 1684 },
  { text: 'aman.', startMs: 1684, endMs: 2108, role: 'keyword' },
  { text: 'Episode', startMs: 2837, endMs: 3207, role: 'keyword' },
  { text: '3,', startMs: 3207, endMs: 3674, role: 'keyword' },
  { text: 'instal', startMs: 3913, endMs: 4228 },
  { text: 'sistem', startMs: 4228, endMs: 4576, role: 'keyword' },
  { text: 'dan', startMs: 4576, endMs: 4696 },
  { text: 'aplikasi', startMs: 4696, endMs: 5065, role: 'keyword' },
  { text: 'kerja.', startMs: 5065, endMs: 5543 },
  { text: 'Konsultasi', startMs: 6275, endMs: 6808 },
  { text: 'spek', startMs: 6808, endMs: 7003 },
  { text: 'gratis', startMs: 7003, endMs: 7373, role: 'keyword' },
  { text: 'di', startMs: 7373, endMs: 7449 },
  { text: 'Mohef', startMs: 7449, endMs: 7721, role: 'keyword' },
  { text: 'Tech!', startMs: 7721, endMs: 8112, role: 'keyword' },
];
