# KATALOG MOTION CRAFT (Panduan AI Agent)

Seluruh komponen dan aset audio di bawah ini **sudah teruji dan bebas error TypeScript (`tsc --noEmit`)**. Tidak membutuhkan library npm tambahan selain `remotion` dan `react`.

## 1. Lokasi File di Proyek
- **Komponen & Tema:** `src/lib/motion-craft/`
- **Aset Efek Suara (SFX):** `public/audio/sfx/*.wav` (65 file)
- **Aset Musik Latar:** `public/audio/songs/*.wav` (8 file)

## 2. Cara Import (Bisa Satu Pintu)
Semua komponen, tipe data, dan helper bisa diimpor langsung dari `src/lib/motion-craft`:
```tsx
import {
  // 3D Card Layouts
  Coverflow3D, FerrisWheelCards, CubeRoll3D, CylinderCards3D,
  HelixCards3D, SphereCards3D, ZDepthTunnel, Clean3DCardFace,
  // Grid Animations
  BentoGridReveal, ExplodeToGrid, LayoutMorphGridToCarousel,
  MasonryZoomDetail, GridRecapZoomOut,
  // Card Interactions
  CardStackSwipe, FanSpreadCards, PolaroidDropTable,
  CardFlip3D, PageCurlCard, PageTurnBook, AccordionFoldCard,
  // Typography & Kinetic Words
  TypeText, FlyText, AnimatedProgressBar, BottomSubtitleBar,
  // Cursor & UI Shells
  AnimatedCursor, AuthenticBrowserWindow, AuthenticTerminalWindow,
  ChatAppShell, MacDesktopChrome,
  // Camera, Transitions, Background, Audio, Icons
  CameraRig, ParallaxLayer, SeamlessSceneShell, SharedElementMorph,
  SfxCue, AudioStage, ProceduralBackground, BrandLogo, CustomSVGIcon,
  STYLES_CATALOG,
  type Card3DItem, type BentoCellItem, type PolaroidPhotoItem, type WordItem
} from '../lib/motion-craft';
```

---

## 3. Tipe Data Utama & Kustomisasi Warna via Props
Semua komponen kartu mendukung kustomisasi warna lewat objek item:
```ts
interface Card3DItem {
  id: string;
  indexLabel?: string;   // contoh: '01' atau 'TIPS'
  title: string;         // judul utama kartu
  subtitle?: string;     // subjudul
  metric?: string;       // angka/highlight besar, contoh: '98%' atau 'BAB 1'
  brand?: string;        // opsional slug logo: 'remotion' | 'react' | 'typescript' | dll.
  surfaceColor?: string; // warna background kartu (mis. '#FFFFFF')
  textColor?: string;    // warna teks kartu (mis. '#0F1F4D')
  accentColor?: string;  // warna aksen/metrik (mis. '#FF7A2F')
  content?: React.ReactNode; // konten custom JSX
}
```

---

## 4. Daftar 38 Komponen Animasi Siap Pakai

### A. Card3DLayouts.tsx (7 Layout 3D + 1 Card Face)
1. **`<Coverflow3D items={Card3DItem[]} startFrame={15} framesPerStep={28} cardWidth={280} cardHeight={380} />`**
   - Efek: Kartu aktif menghadap lurus, kartu kiri-kanan miring perspektif 3D. (SFX: `transition-swipe.wav`)
2. **`<FerrisWheelCards items={Card3DItem[]} startFrame={14} framesPerStep={28} radiusPx={240} cardWidth={220} cardHeight={300} />`**
   - Efek: Kartu berputar melingkar vertikal seperti kincir ria. (SFX: `tick-soft.wav`)
3. **`<CubeRoll3D items={Card3DItem[]} startFrame={15} framesPerFace={32} cubeSize={290} />`**
   - Efek: Kubus 3D berguling menampilkan sisi berikutnya. (SFX: `transition-swoosh.wav`)
4. **`<CylinderCards3D items={Card3DItem[]} startFrame={10} durationInFrames={100} radiusZ={280} cardWidth={180} cardHeight={250} />`**
   - Efek: Korsel kartu melingkar di dinding silinder 3D berputar. (SFX: `transition-scroll.wav`)
5. **`<HelixCards3D items={Card3DItem[]} startFrame={10} durationInFrames={100} radiusZ={260} verticalStepPx={55} cardWidth={180} cardHeight={240} />`**
   - Efek: Kartu tersusun spiral DNA/heliks 3D bergerak naik. (SFX: `transition-swipe.wav`)
6. **`<SphereCards3D items={Card3DItem[]} startFrame={8} durationInFrames={100} radiusPx={240} cardWidth={140} cardHeight={190} />`**
   - Efek: Kartu menyebar membentuk bola 3D berputar. (SFX: `transition-whoosh-soft.wav`)
7. **`<ZDepthTunnel items={Card3DItem[]} startFrame={10} framesPerCard={28} depthStepZ={380} cardWidth={280} cardHeight={380} />`**
   - Efek: Kartu meluncur maju ke kamera dari lorong sumbu Z. (SFX: `transition-whoosh-soft.wav`)
8. **`<Clean3DCardFace item={Card3DItem} index={0} width={400} height={500} isActive={true} />`**
   - Efek: Komponen wajah kartu tunggal bersih tanpa animasi perpindahan.

### B. GridAnimations.tsx (5 Animasi Grid)
9. **`<BentoGridReveal items={BentoCellItem[]} startFrame={10} waveGapFrames={18} stageWidth={840} stageHeight={840} columns={2} />`**
   - Efek: Kotak Bento beda ukuran (`colSpan`, `rowSpan`, `revealWave`) muncul bertahap. (SFX: `pop-in.wav`)
10. **`<ExplodeToGrid items={Card3DItem[]} explodeFrame={18} settleFrame={42} columns={2} cardWidth={260} cardHeight={290} />`**
    - Efek: Tumpukan kartu di tengah pecah menyebar lalu merapat rapi ke grid. (SFX: `transition-swoosh.wav` & `pop-drop.wav`)
11. **`<LayoutMorphGridToCarousel items={Card3DItem[]} morphFrame={30} carouselStepFrame={60} columns={2} />`**
    - Efek: Susunan grid bertransformasi mulus menjadi korsel horizontal. (SFX: `transition-maximize.wav` & `transition-swipe.wav`)
12. **`<MasonryZoomDetail items={Card3DItem[]} targetIndex={1} selectFrame={18} zoomFrame={36} stageWidth={780} stageHeight={680} detailDescription="..." />`**
    - Efek: Satu kartu di dalam grid di-klik lalu zoom-in memenuhi layar. (SFX: `click.wav` & `transition-whoosh-soft.wav`)
13. **`<GridRecapZoomOut items={Card3DItem[]} pullbackFrame={24} stageWidth={840} stageHeight={840} columns={2} />`**
    - Efek: Dari 1 kartu layar penuh zoom-out menjadi ringkasan seluruh kartu grid. (SFX: `transition-minimize.wav` & `confirm-chime.wav`)

### C. CardInteractions.tsx (7 Interaksi Kartu)
14. **`<CardStackSwipe items={Card3DItem[]} startFrame={18} framesPerSwipe={30} cardWidth={360} cardHeight={460} />`**
    - Efek: Kartu teratas di-swipe ke samping, kartu bawahnya naik. (SFX: `transition-swipe.wav`)
15. **`<FanSpreadCards items={Card3DItem[]} spreadFrame={14} maxFanAngleDeg={50} cardWidth={220} cardHeight={320} />`**
    - Efek: Tumpukan kartu membuka melengkung seperti kipas. (SFX: `k1.wav`)
16. **`<PolaroidDropTable photos={PolaroidPhotoItem[]} startFrame={12} dropIntervalFrames={22} cardWidth={260} cardHeight={320} />`**
    - Efek: Foto bergaya Polaroid (`caption`, `tintColor`, `restingPose: [x, y, rot]`) jatuh ke meja satu per satu. (SFX: `k2.wav`)
17. **`<CardFlip3D frontItem={Card3DItem} backItem={Card3DItem} flipFrame={28} cardWidth={360} cardHeight={460} />`**
    - Efek: Kartu berputar 180 derajat dari depan ke belakang dengan angkatan Z. (SFX: `transition-swipe.wav`)
18. **`<PageCurlCard frontItem={Card3DItem} backItem={Card3DItem} curlStartFrame={20} curlDurationFrames={36} cardWidth={360} cardHeight={460} />`**
    - Efek: Sudut kartu tergulung diagonal memperlihatkan kartu di bawahnya. (SFX: `k1.wav`)
19. **`<PageTurnBook leftPage={Card3DItem} rightPageFront={Card3DItem} rightPageBack={Card3DItem} turnFrame={24} pageWidth={260} pageHeight={360} />`**
    - Efek: Lembaran halaman buku terbuka membalik 3D. (SFX: `k1.wav`)
20. **`<AccordionFoldCard panels={Card3DItem[]} unfoldFrame={16} direction="vertical" panelWidth={460} panelHeight={130} />`**
    - Efek: Panel-panel kartu membuka lipatan akordeon vertikal/horizontal. (SFX: `transition-maximize.wav`)

### D. KineticWords.tsx (4 Komponen Tipografi)
21. **`<TypeText text="..." start={10} cps={18} size={36} color="#FFF" newestColor="#FF7A2F" enableTypingSfx={true} typingVariant="mechanical" />`**
    - Efek: Ketikan per karakter dengan kursor & suara ketikan otomatis (`typing-loop.wav` / `typing-soft.wav` / `typing-digital.wav`).
22. **`<FlyText text="..." start={12} stagger={3} dur={14} size={42} color="#FFF" flyingColor="#FF7A2F" />`**
    - Efek: Karakter huruf melayang masuk satu per satu.
23. **`<AnimatedProgressBar label="..." startFrame={15} endFrame={65} accentColor="#FF7A2F" enableProgressSfx={true} />`**
    - Efek: Progress bar dengan angka persentase berjalan & suara selesai (`progress-loop.wav` + `d2.wav`).
24. **`<BottomSubtitleBar words={WordItem[]} stylePreset={STYLES_CATALOG[1]} fontSize={36} />`**
    - Efek: Subtitle bar di bawah layar dengan highlight kata aktif (`{ text, startMs, endMs }`).

### E. AnimatedCursor.tsx & LivedInUIShells.tsx (5 Komponen Simulasi UI)
25. **`<AnimatedCursor waypoints={[[0,100,100], [24,380,245]]} clicks={[{ frame: 24, label: 'KLIK' }]} enableClickSfx={true} />`**
    - Efek: Kursor bergerak mengikuti kurva Fitts' Law & klik otomatis bersuara (`hover-rollover.wav` + `click.wav`).
26. **`<AuthenticBrowserWindow tabTitle="..." url="..." width={760} height={500}>{children}</AuthenticBrowserWindow>`**
27. **`<AuthenticTerminalWindow windowTitle="..." cwd="~/app" command="..." logs={[...]} width={760} height={440} />`**
28. **`<ChatAppShell contactName="..." bubbles={[{ text, isSender, startFrame }]} stylePreset={STYLES_CATALOG[1]} />`**
29. **`<MacDesktopChrome appName="..." clockText="09:00 AM" stylePreset={STYLES_CATALOG[1]}>{children}</MacDesktopChrome>`**

### F. Transitions.tsx, CameraRig.tsx, Background, Audio, Icons (9 Komponen)
30. **`<SeamlessSceneShell startFrame={0} endFrame={90} enterMode="portal-zoom-in" exitMode="whip-glide-left">{children}</SeamlessSceneShell>`**
31. **`<SharedElementMorph keyframes={[[10, cx, cy, w, h, br, rot], ...]} startFrame={10} endFrame={85}>{children}</SharedElementMorph>`**
32. **`<SfxCue frame={20} sfx="confirm-chime" volume={0.5} />`** — Memutar SFX dari `public/audio/sfx/<sfx>.wav` tepat pada frame tertentu.
33. **`<CameraRig durationInFrames={90} waypoints={[[0, 1, 0, 0, 0], [45, 1.3, -30, -20, 2]]}>{children}</CameraRig>`**
34. **`<ParallaxLayer depth="foreground">{children}</ParallaxLayer>`** (`'background' | 'midground' | 'foreground' | number`)
35. **`<AudioStage musicSrc="audio/songs/B01-lofi-dusty-rhodes.wav" words={WordItem[]} />`** — Auto-ducking musik saat ada narasi.
36. **`<ProceduralBackground stylePreset={STYLES_CATALOG[1]} driftSpeed={1.2} />`**
37. **`<BrandLogo brand="remotion" size={72} />`** (`'claude' | 'remotion' | 'react' | 'typescript' | 'javascript' | 'github' | 'vscode' | 'nextjs' | 'nodejs' | 'tailwind' | 'figma' | 'openai' | 'vercel' | 'supabase' | 'docker' | 'youtube' | 'tiktok' | 'instagram'`)
38. **`<CustomSVGIcon name="check-badge" size={64} color="#0F1F4D" accentColor="#FF7A2F" />`** (`'terminal-prompt' | 'chart-rising' | 'layers-stack' | 'cpu-node' | 'arrow-Editorial' | 'globe-meridian' | 'target-crosshair' | 'check-badge'`)

---

## 5. Daftar Lengkap 65 File SFX (`public/audio/sfx/`)
Gunakan dengan `<SfxCue frame={15} sfx="nama-tanpa-wav" volume={0.5} />` atau `<Audio src={staticFile('audio/sfx/nama.wav')} />`:

- **Transisi & Whoosh:**
  `transition-swoosh`, `transition-whoosh-soft`, `transition-swipe`, `transition-chop`, `transition-cinematic`, `transition-glitch`, `transition-maximize`, `transition-minimize`, `transition-scroll`, `riser-short`
- **Pop & Munculnya Elemen:**
  `pop`, `pop-in`, `pop-drop`, `pop-plop`, `pop-pluck`
- **Klik, Toggle & Kursor:**
  `click`, `click-soft`, `click-select`, `hover-rollover`, `toggle-on`, `toggle-off`, `tick`, `tick-soft`
- **Konfirmasi, Notifikasi & Data:**
  `confirm-chime`, `confirm-glass`, `ding-bell`, `data-reveal`, `progress-loop`
- **Ketikan (Typing):**
  `typing-loop`, `typing-soft`, `typing-digital`
- **Impact / Hentakan:**
  `impact-soft`, `impact-punch`, `impact-cinematic`
- **Foley Kertas & Kartu (k1-k5):** `k1`, `k2`, `k3`, `k4`, `k5`
- **Digital & UI Blips (d1-d9, u1-u10, m1-m4, o1-o5, r1-r3):**
  `d1`, `d2`, `d3`, `d4`, `d9`, `m1`, `m2`, `m3`, `m4`, `o1`, `o2`, `o3`, `o5`, `r1`, `r2`, `r3`, `u1` s/d `u10`

## 6. Daftar 8 Musik Latar (`public/audio/songs/`)
- `B01-lofi-dusty-rhodes.wav`
- `B02-synthwave-night-drive.wav`
- `B09-minimal-tech-pulse.wav`
- `B21-clean-corporate-editorial.wav`
- `B25-apple-keynote-pluck.wav`
- `B26-framer-linear-saas-groove.wav`
- `B27-vox-documentary-piano.wav`
- `B29-uk-garage-2step-tech.wav`
