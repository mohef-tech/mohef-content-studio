import { WordItem } from '../../lib/motion-craft';
import {
  EP2_BGM,
  EP2_COLORS,
  EP2_FONTS,
  EP2_SAFE,
  EP2_STYLE_PRESET,
} from '../04-ep2-rakit-pc/constants';

export const EP3_FPS = 30;
export const EP3_WIDTH = 1080;
export const EP3_HEIGHT = 1920;

/** Durasi Scene 1 dikunci dari panjang ep3-scene1.mp3 (15.408s) + 0.9s jeda napas akhir @ 30 FPS. */
export const SCENE1_DURATION_FRAMES = 490;

/** Momen kunci Scene 1 (frame), disinkronkan ke timestamp ep3-scene1-words.json. */
export const SCENE1_BEATS = {
  badgeIn: 4,
  titleIn: 10,
  bridgeIn: 14,
  risk1In: 239, // 7961ms: tepat saat "OS bajakan" diucapkan
  risk2In: 327, // 10895ms: tepat saat "sedangkan driver seadanya" diucapkan
} as const;

/** Durasi Scene 2 dikunci dari panjang ep3-scene2.mp3 (12.600s) + 0.9s jeda napas akhir @ 30 FPS. */
export const SCENE2_DURATION_FRAMES = 405;

/** Momen kunci Scene 2 (frame); USB & clean install selaras timestamp ep3-scene2-words.json. */
export const SCENE2_BEATS = {
  badgeIn: 4,
  titleIn: 10,
  usbIn: 24,
  usbAlign: 58,
  usbSeated: 74, // 2.47s: USB terpasang tepat sebelum "clean install" (2563ms)
  cardIn: 78,
  installStart: 80, // 2.67s: installer berjalan saat "clean install sistem operasi"
  point1In: 120, // 4.00s: "bersih"
  point2In: 185, // 6.17s: "sesuai spesifikasi"
  installDone: 256, // 8.53s: selesai tepat sebelum "aktivasi aman"
  licenseIn: 264, // 8.80s: mengunci saat "aktivasi aman" (8736..9538ms)
} as const;

/** Durasi Scene 3 dikunci dari panjang ep3-scene3.mp3 (13.152s) + 0.9s jeda napas akhir @ 30 FPS. */
export const SCENE3_DURATION_FRAMES = 422;

/** Momen kunci Scene 3 (frame): desktop sync 3 driver resmi -> tuning daya & clock optimal. */
export const SCENE3_BEATS = {
  badgeIn: 4,
  titleIn: 10,
  desktopIn: 48, // 1.60s: "masuk ke desktop sistem operasi"
  cardIn: 60,
  chipsetStart: 150, // 5.00s: "memasang driver resmi untuk setiap perangkat kerasnya" (154..230)
  chipsetDone: 178,
  gpuStart: 182,
  gpuDone: 210,
  nvmeStart: 214,
  nvmeDone: 242,
  tuningStart: 254, // 8.47s: "penyetelan profil daya" (8458..9550ms)
  tuningLocked: 288, // 9.60s: profil performa terkunci optimal
} as const;

/** Durasi Scene 4 dikunci dari panjang ep3-scene4.mp3 (16.416s) + 0.9s jeda napas akhir @ 30 FPS. */
export const SCENE4_DURATION_FRAMES = 520;

/** Momen kunci Scene 4 (frame): kartu perbandingan -> fase 1 Usaha & Kasir -> fase 2 Kreator, 3D & Gaming. */
export const SCENE4_BEATS = {
  badgeIn: 4,
  titleIn: 10,
  appsIn: 215, // 7.17s: masuk tampilan aplikasi saat "bebas minta instalasi..."
  cardIn: 24,
  rowOtherIn: 45, // 1509ms: tepat saat "di tempat lain request di luar paket dasar"
  rowMohefIn: 186, // SLAM_HIT_FRAME = 190 (6333ms), tepat saat "Di Mohef Tech gratis" (5829..7132ms)
  phase1Start: 222,
  p1App1Start: 226,
  p1App1Done: 256,
  p1App2Start: 260,
  p1App2Done: 290,
  p1App3Start: 294,
  p1App3Done: 324,
  phase2Start: 345, // 11486ms: "Cukup siapkan lisensinya jika berbayar..."
  p2App1Start: 352,
  p2App1Done: 384,
  p2App2Start: 388,
  p2App2Done: 420,
  p2ReadyStart: 424,
  p2ReadyDone: 462,
} as const;

/** Durasi Scene 5 dikunci dari panjang ep3-scene5.mp3 (15.552s) + 0.9s jeda napas akhir @ 30 FPS. */
export const SCENE5_DURATION_FRAMES = 494;

/** Momen kunci Scene 5 (frame): checklist trilogi Ep 1-3 & packing kayu -> kartu kontak CTA. */
export const SCENE5_BEATS = {
  badgeIn: 4,
  titleIn: 10,
  checklistIn: 16,
  item1In: 24, // "kelistrikan aman"
  item2In: 54, // "rakit presisi menggunakan part original resmi"
  item3In: 132, // "hingga sistem siap pakai"
  packingIn: 230, // "siap kirim dengan packing kayu"
  checklistOut: 292,
  ctaIn: 304, // 10130ms: tepat saat "Konsultasi rakitanmu sekarang bersama Mohammed di Mohef Tech."
} as const;

export const EP3_DURATIONS = {
  scene1: SCENE1_DURATION_FRAMES,
  scene2: SCENE2_DURATION_FRAMES,
  scene3: SCENE3_DURATION_FRAMES,
  scene4: SCENE4_DURATION_FRAMES,
  scene5: SCENE5_DURATION_FRAMES,
} as const;

export const EP3_TOTAL_DURATION =
  SCENE1_DURATION_FRAMES +
  SCENE2_DURATION_FRAMES +
  SCENE3_DURATION_FRAMES +
  SCENE4_DURATION_FRAMES +
  SCENE5_DURATION_FRAMES;

// Seri yang sama dengan Episode 2: safe zone, palet, tipografi & BGM diwarisi langsung.
export const EP3_SAFE = EP2_SAFE;
export const EP3_FONTS = EP2_FONTS;
export const EP3_STYLE_PRESET = EP2_STYLE_PRESET;
export const EP3_BGM = EP2_BGM;
export const EP3_COLORS = {
  ...EP2_COLORS,
  danger: '#EF4444', // risiko keamanan (kartu 1)
  dangerSoft: '#FECACA',
  caution: '#F59E0B', // risiko stabilitas (kartu 2)
  cautionSoft: '#FDE68A',
} as const;

/*
 * Timing kata diambil persis dari WordBoundary edge-tts (public/audio/vo/ep3-sceneN-words.json).
 */
export const SCENE1_WORDS: WordItem[] = [
  { text: 'Setelah', startMs: 116, endMs: 471 },
  { text: 'kemarin', startMs: 471, endMs: 787 },
  { text: 'PC', startMs: 787, endMs: 1063, role: 'keyword' },
  { text: 'berhasil', startMs: 1063, endMs: 1471 },
  { text: 'dirakit', startMs: 1471, endMs: 1866 },
  { text: 'sesuai', startMs: 1866, endMs: 2195 },
  { text: 'kebutuhanmu', startMs: 2195, endMs: 3024 },
  { text: 'percuma', startMs: 3326, endMs: 3721 },
  { text: 'kalau', startMs: 3721, endMs: 3905 },
  { text: 'spesifikasinya', startMs: 3905, endMs: 4773 },
  { text: 'tinggi', startMs: 4774, endMs: 5090 },
  { text: 'tapi', startMs: 5089, endMs: 5326 },
  { text: 'sistemnya', startMs: 5326, endMs: 5826, role: 'keyword' },
  { text: 'dipasang', startMs: 5826, endMs: 6221 },
  { text: 'asal-asalan', startMs: 6221, endMs: 7063, role: 'keyword' },
  { text: 'OS', startMs: 7961, endMs: 8316, role: 'keyword' },
  { text: 'bajakan', startMs: 8316, endMs: 8803, role: 'keyword' },
  { text: 'rawan', startMs: 8803, endMs: 9066 },
  { text: 'malware', startMs: 9066, endMs: 9434, role: 'keyword' },
  { text: 'dan', startMs: 9434, endMs: 9618 },
  { text: 'kebocoran', startMs: 9618, endMs: 10092, role: 'keyword' },
  { text: 'data', startMs: 10092, endMs: 10605, role: 'keyword' },
  { text: 'sedangkan', startMs: 10895, endMs: 11342 },
  { text: 'driver', startMs: 11342, endMs: 11710, role: 'keyword' },
  { text: 'seadanya', startMs: 11711, endMs: 12132, role: 'keyword' },
  { text: 'bikin', startMs: 12132, endMs: 12395 },
  { text: 'performa', startMs: 12395, endMs: 12750 },
  { text: 'tertahan', startMs: 12750, endMs: 13276, role: 'keyword' },
  { text: 'dan', startMs: 13276, endMs: 13460 },
  { text: 'gampang', startMs: 13461, endMs: 13843 },
  { text: 'blue', startMs: 13842, endMs: 13974, role: 'keyword' },
  { text: 'screen', startMs: 13974, endMs: 14513, role: 'keyword' },
];

export const SCENE2_WORDS: WordItem[] = [
  { text: 'Di', startMs: 116, endMs: 274 },
  { text: 'Mohef', startMs: 274, endMs: 577, role: 'keyword' },
  { text: 'Tech', startMs: 576, endMs: 984, role: 'keyword' },
  { text: 'setiap', startMs: 1274, endMs: 1616 },
  { text: 'unit', startMs: 1616, endMs: 1853 },
  { text: 'wajib', startMs: 1853, endMs: 2169 },
  { text: 'melewati', startMs: 2168, endMs: 2563 },
  { text: 'clean', startMs: 2563, endMs: 2800, role: 'keyword' },
  { text: 'install', startMs: 2800, endMs: 3182, role: 'keyword' },
  { text: 'sistem', startMs: 3182, endMs: 3498, role: 'keyword' },
  { text: 'operasi', startMs: 3497, endMs: 3879, role: 'keyword' },
  { text: 'yang', startMs: 3879, endMs: 3997 },
  { text: 'bersih', startMs: 3997, endMs: 4536, role: 'keyword' },
  { text: 'resmi', startMs: 4787, endMs: 5405, role: 'keyword' },
  { text: 'dan', startMs: 5682, endMs: 5919 },
  { text: 'sesuai', startMs: 5918, endMs: 6286 },
  { text: 'spesifikasi', startMs: 6287, endMs: 7261, role: 'keyword' },
  { text: 'Lengkap', startMs: 8143, endMs: 8511 },
  { text: 'dengan', startMs: 8512, endMs: 8736 },
  { text: 'aktivasi', startMs: 8736, endMs: 9196, role: 'keyword' },
  { text: 'aman', startMs: 9196, endMs: 9538, role: 'keyword' },
  { text: 'agar', startMs: 9538, endMs: 9814 },
  { text: 'ringan', startMs: 9814, endMs: 10169, role: 'keyword' },
  { text: 'dan', startMs: 10170, endMs: 10328 },
  { text: 'stabil', startMs: 10328, endMs: 10749, role: 'keyword' },
  { text: 'jangka', startMs: 10749, endMs: 11052 },
  { text: 'panjang', startMs: 11051, endMs: 11709 },
];

export const SCENE3_WORDS: WordItem[] = [
  { text: 'Begitu', startMs: 116, endMs: 471 },
  { text: 'instalasi', startMs: 471, endMs: 958 },
  { text: 'selesai', startMs: 958, endMs: 1458 },
  { text: 'dan', startMs: 1458, endMs: 1629 },
  { text: 'masuk', startMs: 1629, endMs: 1892 },
  { text: 'ke', startMs: 1892, endMs: 1958 },
  { text: 'desktop', startMs: 1958, endMs: 2287, role: 'keyword' },
  { text: 'sistem', startMs: 2287, endMs: 2576 },
  { text: 'operasi', startMs: 2576, endMs: 2984 },
  { text: 'untuk', startMs: 2984, endMs: 3155 },
  { text: 'pertama', startMs: 3155, endMs: 3458 },
  { text: 'kali', startMs: 3458, endMs: 3958 },
  { text: 'kami', startMs: 4287, endMs: 4498 },
  { text: 'lanjutkan', startMs: 4497, endMs: 4971 },
  { text: 'dengan', startMs: 4971, endMs: 5142 },
  { text: 'memasang', startMs: 5142, endMs: 5510 },
  { text: 'driver', startMs: 5511, endMs: 5840, role: 'keyword' },
  { text: 'resmi', startMs: 5839, endMs: 6181, role: 'keyword' },
  { text: 'untuk', startMs: 6182, endMs: 6419 },
  { text: 'setiap', startMs: 6418, endMs: 6721 },
  { text: 'perangkat', startMs: 6721, endMs: 7037, role: 'keyword' },
  { text: 'kerasnya', startMs: 7037, endMs: 7655, role: 'keyword' },
  { text: 'sekaligus', startMs: 7918, endMs: 8457 },
  { text: 'penyetelan', startMs: 8458, endMs: 8892, role: 'keyword' },
  { text: 'profil', startMs: 8892, endMs: 9208, role: 'keyword' },
  { text: 'daya', startMs: 9208, endMs: 9550, role: 'keyword' },
  { text: 'agar', startMs: 9550, endMs: 9826 },
  { text: 'seluruh', startMs: 9826, endMs: 10168 },
  { text: 'komponen', startMs: 10168, endMs: 10523 },
  { text: 'bekerja', startMs: 10524, endMs: 10971 },
  { text: 'di', startMs: 10971, endMs: 11050 },
  { text: 'kecepatan', startMs: 11050, endMs: 11471, role: 'keyword' },
  { text: 'maksimalnya', startMs: 11471, endMs: 12260, role: 'keyword' },
];

export const SCENE4_WORDS: WordItem[] = [
  { text: 'Soal', startMs: 101, endMs: 417 },
  { text: 'aplikasi', startMs: 417, endMs: 1193, role: 'keyword' },
  { text: 'di', startMs: 1509, endMs: 1654 },
  { text: 'tempat', startMs: 1654, endMs: 1943 },
  { text: 'lain', startMs: 1943, endMs: 2154 },
  { text: 'request', startMs: 2154, endMs: 2549, role: 'keyword' },
  { text: 'di', startMs: 2549, endMs: 2628 },
  { text: 'luar', startMs: 2628, endMs: 2812 },
  { text: 'paket', startMs: 2812, endMs: 3075 },
  { text: 'dasar', startMs: 3075, endMs: 3443 },
  { text: 'sering', startMs: 3443, endMs: 3706 },
  { text: 'kena', startMs: 3707, endMs: 3931 },
  { text: 'biaya', startMs: 3930, endMs: 4233, role: 'keyword' },
  { text: 'tambahan', startMs: 4233, endMs: 4930, role: 'keyword' },
  { text: 'Di', startMs: 5829, endMs: 5987 },
  { text: 'Mohef', startMs: 5987, endMs: 6329, role: 'keyword' },
  { text: 'Tech', startMs: 6329, endMs: 6487, role: 'keyword' },
  { text: 'gratis', startMs: 6487, endMs: 7132, role: 'keyword' },
  { text: 'bebas', startMs: 7408, endMs: 7829, role: 'keyword' },
  { text: 'minta', startMs: 7829, endMs: 8039 },
  { text: 'instalasi', startMs: 8039, endMs: 8552 },
  { text: 'aplikasi', startMs: 8553, endMs: 8974, role: 'keyword' },
  { text: 'apa', startMs: 8974, endMs: 9171 },
  { text: 'pun', startMs: 9171, endMs: 9395 },
  { text: 'sesuai', startMs: 9395, endMs: 9750 },
  { text: 'kebutuhanmu', startMs: 9750, endMs: 10605 },
  { text: 'Cukup', startMs: 11486, endMs: 11775 },
  { text: 'siapkan', startMs: 11775, endMs: 12143 },
  { text: 'lisensinya', startMs: 12143, endMs: 12722, role: 'keyword' },
  { text: 'jika', startMs: 12722, endMs: 12959 },
  { text: 'berbayar', startMs: 12959, endMs: 13656, role: 'keyword' },
  { text: 'lalu', startMs: 13959, endMs: 14222 },
  { text: 'langsung', startMs: 14222, endMs: 14590 },
  { text: 'kami', startMs: 14591, endMs: 14788 },
  { text: 'kerjakan', startMs: 14788, endMs: 15525 },
];

export const SCENE5_WORDS: WordItem[] = [
  { text: 'Dari', startMs: 116, endMs: 366 },
  { text: 'kelistrikan', startMs: 366, endMs: 840, role: 'keyword' },
  { text: 'aman', startMs: 839, endMs: 1339, role: 'keyword' },
  { text: 'rakit', startMs: 1655, endMs: 1971, role: 'keyword' },
  { text: 'presisi', startMs: 1971, endMs: 2379, role: 'keyword' },
  { text: 'menggunakan', startMs: 2379, endMs: 2905 },
  { text: 'part', startMs: 2905, endMs: 3142 },
  { text: 'original', startMs: 3142, endMs: 3589, role: 'keyword' },
  { text: 'resmi', startMs: 3589, endMs: 4115, role: 'keyword' },
  { text: 'hingga', startMs: 4392, endMs: 4681 },
  { text: 'sistem', startMs: 4682, endMs: 5037, role: 'keyword' },
  { text: 'siap', startMs: 5037, endMs: 5248, role: 'keyword' },
  { text: 'pakai', startMs: 5247, endMs: 5800, role: 'keyword' },
  { text: 'semuanya', startMs: 6076, endMs: 6536 },
  { text: 'sudah', startMs: 6537, endMs: 6761 },
  { text: 'terverifikasi', startMs: 6761, endMs: 7550, role: 'keyword' },
  { text: 'dan', startMs: 7550, endMs: 7721 },
  { text: 'siap', startMs: 7721, endMs: 7945 },
  { text: 'kirim', startMs: 7945, endMs: 8221 },
  { text: 'dengan', startMs: 8221, endMs: 8458 },
  { text: 'packing', startMs: 8458, endMs: 8747, role: 'keyword' },
  { text: 'kayu', startMs: 8747, endMs: 9247, role: 'keyword' },
  { text: 'Konsultasi', startMs: 10130, endMs: 10775, role: 'keyword' },
  { text: 'kebutuhan', startMs: 10775, endMs: 11236 },
  { text: 'Komputer', startMs: 11236, endMs: 11723, role: 'keyword' },
  { text: 'untuk', startMs: 11722, endMs: 11932 },
  { text: 'keperluanmu', startMs: 11933, endMs: 12407 },
  { text: 'sekarang', startMs: 12407, endMs: 12868 },
  { text: 'bersama', startMs: 12867, endMs: 13222 },
  { text: 'Mohammed', startMs: 13222, endMs: 13735, role: 'keyword' },
  { text: 'di', startMs: 13736, endMs: 13881 },
  { text: 'Mohef', startMs: 13880, endMs: 14262, role: 'keyword' },
  { text: 'Tech', startMs: 14262, endMs: 14670, role: 'keyword' },
];
