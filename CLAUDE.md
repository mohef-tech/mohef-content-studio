### PUSTAKA KOMPONEN & SFX MOTION-CRAFT (SIAP PAKAI)

Di proyek ini sudah tersedia pustaka animasi & SFX yang sudah teruji di `src/lib/motion-craft/` dan `public/audio/sfx/`.
SEBELUM membuat scene/animasi baru:

1. Baca `src/lib/motion-craft/KATALOG-AI.md` untuk melihat daftar lengkap 38 komponen animasi, props kustomisasi warna (`surfaceColor`, `textColor`, `accentColor`, `tintColor`), serta daftar 65 file SFX.
2. Impor komponen langsung dari satu pintu `src/lib/motion-craft`:
   - 3D Layouts: `Coverflow3D`, `FerrisWheelCards`, `CubeRoll3D`, `CylinderCards3D`, `HelixCards3D`, `SphereCards3D`, `ZDepthTunnel`, `Clean3DCardFace`
   - Grid: `BentoGridReveal`, `ExplodeToGrid`, `LayoutMorphGridToCarousel`, `MasonryZoomDetail`, `GridRecapZoomOut`
   - Interaksi Kartu: `CardStackSwipe`, `FanSpreadCards`, `PolaroidDropTable`, `CardFlip3D`, `PageCurlCard`, `PageTurnBook`, `AccordionFoldCard`
   - Tipografi & Teks: `TypeText`, `FlyText`, `AnimatedProgressBar`, `BottomSubtitleBar`
   - UI & Kursor: `AnimatedCursor`, `AuthenticBrowserWindow`, `AuthenticTerminalWindow`, `ChatAppShell`, `MacDesktopChrome`
   - Kamera, Transisi & SFX: `CameraRig`, `ParallaxLayer`, `SeamlessSceneShell`, `SharedElementMorph`, `SfxCue`, `ProceduralBackground`, `BrandLogo`, `CustomSVGIcon`
3. Untuk efek suara tambahan, gunakan `<SfxCue frame={...} sfx="nama-sfx" volume={0.5} />` yang mengambil file dari `public/audio/sfx/<nama-sfx>.wav`.
4. Jangan mengubah isi file di dalam `src/lib/motion-craft/`. Atur warna, ukuran, dan konten lewat props.
