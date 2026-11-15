import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CameraRig } from "../../engine/CameraRig";
import { DeviceFrame } from "../../engine/DeviceFrame";
import { SimulatedCursor } from "../../engine/SimulatedCursor";
import { Typewriter } from "../../engine/Typewriter";
import { SfxCue } from "../../lib/motion-craft";
import { FloatingContextPill } from "./FloatingContextPill";

const INPUT_CLICK_FRAME = 35;
const TYPE_START_LOCAL = 46;
const FILTER_ACTIVE_FRAME = 74;
const DETAIL_HOVER_FRAME = 162;
const DETAIL_CLICK_FRAME = 182;
const MODAL_OPEN_FRAME = 200;
const TIER_HOVER_FRAME = 290;
const TIER_SELECT_FRAME = 310;
const WA_HOVER_FRAME = 405;
const WA_MODAL_CLICK_FRAME = 430;

export const Scene3SearchModal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isSearchFocused =
    frame >= INPUT_CLICK_FRAME && frame < MODAL_OPEN_FRAME;
  const isFiltered = frame >= FILTER_ACTIVE_FRAME;
  const isHoveringDetailBtn =
    frame >= DETAIL_HOVER_FRAME && frame < MODAL_OPEN_FRAME;
  const isModalOpen = frame >= MODAL_OPEN_FRAME;
  const isTierSelected = frame >= TIER_SELECT_FRAME;
  const isHoveringWaBtn = frame >= WA_HOVER_FRAME;
  const isWaClicked = frame >= WA_MODAL_CLICK_FRAME;

  const filterSpring = spring({
    frame: isFiltered ? frame - FILTER_ACTIVE_FRAME : 0,
    fps,
    config: { damping: 18, stiffness: 150, mass: 0.65 },
  });

  const detailBtnPress =
    frame >= DETAIL_CLICK_FRAME && frame <= DETAIL_CLICK_FRAME + 16
      ? interpolate(
          frame - DETAIL_CLICK_FRAME,
          [0, 4, 12, 16],
          [1, 0.9, 1.05, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        )
      : isHoveringDetailBtn
        ? 1.05
        : 1;

  const modalProgress = spring({
    frame: isModalOpen ? frame - MODAL_OPEN_FRAME : 0,
    fps,
    config: { damping: 16, stiffness: 145, mass: 0.7 },
  });

  const waBtnPress =
    frame >= WA_MODAL_CLICK_FRAME && frame <= WA_MODAL_CLICK_FRAME + 18
      ? interpolate(
          frame - WA_MODAL_CLICK_FRAME,
          [0, 4, 12, 18],
          [1, 0.92, 1.04, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        )
      : isHoveringWaBtn
        ? 1.03
        : 1;

  const complexityRows = [
    {
      level: "Sederhana",
      desc: "Landing page dinamis, katalog layanan, atau sistem pencatatan dasar",
      price: "Mulai Rp3.000.000",
      badge: "STARTER",
      accent: "#34d399",
    },
    {
      level: "Menengah",
      desc: "Aplikasi web multi-role, dashboard analitik, autentikasi & laporan",
      price: "Mulai Rp6.000.000",
      badge: "POPULER",
      accent: "#38bdf8",
    },
    {
      level: "Kompleks",
      desc: "Integrasi API pihak ketiga, otomasi alur kerja khusus & skala enterprise",
      price: "Custom / Negosiasi",
      badge: "ENTERPRISE",
      accent: "#a78bfa",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#040812",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Clean Studio WAV SFX */}
      <SfxCue frame={4} sfx="pop-in" volume={0.36} />
      <SfxCue frame={INPUT_CLICK_FRAME - 6} sfx="hover-rollover" volume={0.24} />
      <SfxCue frame={INPUT_CLICK_FRAME} sfx="click" volume={0.5} />
      <SfxCue
        frame={TYPE_START_LOCAL}
        sfx="typing-soft"
        durationInFrames={28}
        volume={0.38}
      />
      <SfxCue frame={FILTER_ACTIVE_FRAME} sfx="pop-plop" volume={0.4} />
      <SfxCue frame={DETAIL_HOVER_FRAME} sfx="hover-rollover" volume={0.25} />
      <SfxCue frame={DETAIL_CLICK_FRAME} sfx="click" volume={0.52} />
      <SfxCue frame={MODAL_OPEN_FRAME} sfx="transition-maximize" volume={0.4} />
      <SfxCue frame={MODAL_OPEN_FRAME + 12} sfx="pop-in" volume={0.32} />
      <SfxCue frame={MODAL_OPEN_FRAME + 22} sfx="pop-in" volume={0.35} />
      <SfxCue frame={MODAL_OPEN_FRAME + 32} sfx="pop-in" volume={0.32} />
      <SfxCue frame={TIER_HOVER_FRAME} sfx="hover-rollover" volume={0.24} />
      <SfxCue frame={TIER_SELECT_FRAME} sfx="click-select" volume={0.5} />
      <SfxCue frame={TIER_SELECT_FRAME + 2} sfx="pop-plop" volume={0.38} />
      <SfxCue frame={WA_HOVER_FRAME} sfx="hover-rollover" volume={0.26} />
      <SfxCue frame={WA_MODAL_CLICK_FRAME} sfx="click" volume={0.55} />
      <SfxCue frame={WA_MODAL_CLICK_FRAME + 2} sfx="confirm-chime" volume={0.48} />

      {/* Ambient top glow */}
      <div
        style={{
          position: "absolute",
          top: -180,
          left: "50%",
          width: 900,
          height: 900,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(6,182,212,0.06) 45%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Floating Context Pill */}
      <FloatingContextPill
        text="🔍 Cari Layanan Cepat & Cek Opsi Kompleksitas"
        startFrame={4}
      />

      {/* CameraRig */}
      <CameraRig
        keyframes={[
          {
            frame: 0,
            scale: 1.12,
            x: -55,
            y: 110,
            rotateX: 0.8,
            rotateY: 0.8,
          },
          // Zoom in on Search Bar at top-right
          {
            frame: INPUT_CLICK_FRAME,
            scale: 1.24,
            x: -110,
            y: 230,
            rotateX: 1.5,
            rotateY: 1.5,
          },
          {
            frame: FILTER_ACTIVE_FRAME + 10,
            scale: 1.2,
            x: -40,
            y: 180,
            rotateX: 1.2,
            rotateY: 0.5,
          },
          // Frame the filtered Aplikasi Custom card & Lihat Detail button
          {
            frame: DETAIL_HOVER_FRAME,
            scale: 1.24,
            x: 85,
            y: 130,
            rotateX: 1.4,
            rotateY: -1.4,
          },
          {
            frame: DETAIL_CLICK_FRAME + 10,
            scale: 1.24,
            x: 85,
            y: 130,
            rotateX: 1.4,
            rotateY: -1.4,
          },
          // Center smoothly on the Service Detail Modal
          {
            frame: MODAL_OPEN_FRAME + 35,
            scale: 1.14,
            x: 0,
            y: 10,
            rotateX: 0,
            rotateY: 0,
          },
          {
            frame: WA_MODAL_CLICK_FRAME + 20,
            scale: 1.14,
            x: 0,
            y: -20,
            rotateX: 0,
            rotateY: 0,
          },
          {
            frame: 510,
            scale: 1.06,
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
          },
        ]}
      >
        <div
          style={{
            position: "absolute",
            left: 56,
            top: 210,
            width: 968,
            height: 1560,
          }}
        >
          <DeviceFrame
            variant="browser"
            url={
              isModalOpen
                ? "https://moheftech.com/?layanan=pengembangan-sistem-web-app"
                : "https://moheftech.com/#layanan"
            }
            style={{ width: "100%", height: "100%" }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                backgroundColor: "#060c18",
                color: "#e8edf5",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Subtle Tech Radial Mesh */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(circle at 50% 24%, rgba(59, 130, 246, 0.15), transparent 55%), radial-gradient(circle at 80% 75%, rgba(6, 182, 212, 0.12), transparent 45%)",
                  pointerEvents: "none",
                }}
              />

              {/* ============ STICKY NAVBAR ============ */}
              <header
                style={{
                  position: "relative",
                  zIndex: 20,
                  height: 84,
                  flexShrink: 0,
                  padding: "0 40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(6, 12, 24, 0.92)",
                  borderBottom: "1px solid rgba(59, 130, 246, 0.18)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 20px rgba(59, 130, 246, 0.45)",
                      fontWeight: 800,
                      fontSize: 20,
                      color: "#ffffff",
                    }}
                  >
                    M
                  </div>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 22,
                      background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Mohef Tech
                  </span>
                </div>

                <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#94a3b8",
                    }}
                  >
                    Home
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#e8edf5",
                      paddingBottom: 4,
                      borderBottom: "2px solid #3b82f6",
                    }}
                  >
                    Layanan
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#94a3b8",
                    }}
                  >
                    Tentang
                  </span>
                  <span
                    style={{
                      padding: "10px 24px",
                      borderRadius: 9999,
                      background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    Kontak
                  </span>
                </nav>
              </header>

              {/* ============ LAYANAN SECTION CONTENT ============ */}
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <section
                  style={{
                    padding: "36px 42px 48px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                  }}
                >
                  {/* Section Header + Interactive Search Bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      borderBottom: "1px solid rgba(59, 130, 246, 0.14)",
                      paddingBottom: 22,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 16px",
                          borderRadius: 9999,
                          backgroundColor: "rgba(59, 130, 246, 0.12)",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          color: "#60a5fa",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          marginBottom: 10,
                        }}
                      >
                        <span>🛠</span>
                        <span>Layanan Kami</span>
                      </div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 34,
                          fontWeight: 800,
                          color: "#e8edf5",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Solusi Digital{" "}
                        <span
                          style={{
                            background:
                              "linear-gradient(135deg, #3b82f6, #06b6d4)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          Terpercaya
                        </span>
                      </h2>
                    </div>

                    {/* Interactive Search Input (Center X = 785, Center Y = 434) */}
                    <div
                      style={{
                        width: 380,
                        height: 54,
                        borderRadius: 9999,
                        backgroundColor: isSearchFocused
                          ? "rgba(20, 50, 92, 0.95)"
                          : "rgba(15, 34, 64, 0.85)",
                        border: isSearchFocused
                          ? "2px solid #38bdf8"
                          : "1px solid rgba(59, 130, 246, 0.28)",
                        boxShadow: isSearchFocused
                          ? "0 0 0 5px rgba(56, 189, 248, 0.2), 0 12px 28px rgba(0, 0, 0, 0.45)"
                          : "none",
                        padding: "0 22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 16,
                      }}
                    >
                      {frame < TYPE_START_LOCAL ? (
                        <span
                          style={{
                            color: isSearchFocused ? "#cbd5e1" : "#64748b",
                          }}
                        >
                          {isSearchFocused ? "|" : "Cari layanan..."}
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "#f8fafc",
                            fontWeight: 600,
                          }}
                        >
                          <Typewriter
                            text="Aplikasi"
                            startFrame={TYPE_START_LOCAL}
                            speed={3}
                          />
                        </span>
                      )}
                      <span style={{ fontSize: 18, color: "#38bdf8" }}>🔍</span>
                    </div>
                  </div>

                  {/* Filter Status Pill when query "Aplikasi" is active */}
                  {isFiltered && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 18px",
                        borderRadius: 12,
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        border: "1px solid rgba(59, 130, 246, 0.25)",
                        opacity: interpolate(filterSpring, [0, 1], [0, 1]),
                        transform: `translateY(${interpolate(filterSpring, [0, 1], [-10, 0])}px)`,
                      }}
                    >
                      <span style={{ fontSize: 14, color: "#94a3b8" }}>
                        Menampilkan hasil pencarian untuk{" "}
                        <strong style={{ color: "#38bdf8" }}>
                          &ldquo;Aplikasi&rdquo;
                        </strong>
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#60a5fa",
                          padding: "4px 12px",
                          borderRadius: 9999,
                          backgroundColor: "rgba(59, 130, 246, 0.18)",
                        }}
                      >
                        1 Kategori Ditemukan
                      </span>
                    </div>
                  )}

                  {/* Unfiltered Pillar 1 (Collapses smoothly when filter is active) */}
                  {!isFiltered && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          alignSelf: "flex-start",
                          gap: 8,
                          padding: "7px 18px",
                          borderRadius: 9999,
                          background:
                            "linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(6, 182, 212, 0.12))",
                          border: "1px solid rgba(59, 130, 246, 0.35)",
                          color: "#60a5fa",
                          fontSize: 13,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        <span>🖥️</span>
                        <span>Pilar 1 — Perangkat & Jaringan</span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.25fr 1fr",
                          gap: 18,
                        }}
                      >
                        <div
                          style={{
                            padding: "20px 22px",
                            borderRadius: 18,
                            backgroundColor: "rgba(15, 34, 64, 0.72)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                          }}
                        >
                          <h3
                            style={{
                              margin: "0 0 6px",
                              fontSize: 19,
                              fontWeight: 800,
                              color: "#e8edf5",
                            }}
                          >
                            Upgrade & Ganti RAM 8GB
                          </h3>
                          <p
                            style={{
                              margin: "0 0 12px",
                              fontSize: 13,
                              color: "#94a3b8",
                            }}
                          >
                            Pemasangan modul RAM laptop/PC & uji stabilitas.
                          </p>
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: "#34d399",
                            }}
                          >
                            Rp350.000
                          </span>
                        </div>

                        <div
                          style={{
                            padding: "20px 22px",
                            borderRadius: 18,
                            backgroundColor: "rgba(15, 34, 64, 0.58)",
                            border: "1px solid rgba(59, 130, 246, 0.16)",
                          }}
                        >
                          <h4
                            style={{
                              margin: "0 0 6px",
                              fontSize: 17,
                              fontWeight: 700,
                              color: "#e8edf5",
                            }}
                          >
                            Instalasi LAN & Mikrotik
                          </h4>
                          <p
                            style={{
                              margin: "0 0 12px",
                              fontSize: 13,
                              color: "#94a3b8",
                            }}
                          >
                            Setting router & titik jaringan kantor.
                          </p>
                          <span
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: "#38bdf8",
                            }}
                          >
                            Rp250.000 / titik
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==================== PILAR 2: APLIKASI CUSTOM (FILTERED RESULT) ==================== */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      transform: `translateY(${isFiltered ? interpolate(filterSpring, [0, 1], [24, 0]) : 0}px)`,
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        alignSelf: "flex-start",
                        gap: 8,
                        padding: "8px 20px",
                        borderRadius: 9999,
                        background:
                          "linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(6, 182, 212, 0.15))",
                        border: "1px solid rgba(56, 189, 248, 0.45)",
                        color: "#60a5fa",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      <span>💻</span>
                      <span>Aplikasi Custom</span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.35fr 1fr",
                        gap: 20,
                      }}
                    >
                      {/* Primary Filtered Card: Pengembangan Sistem & Web App */}
                      <div
                        style={{
                          padding: "26px 28px",
                          borderRadius: 20,
                          backgroundColor: isHoveringDetailBtn
                            ? "rgba(20, 50, 92, 0.95)"
                            : "rgba(15, 34, 64, 0.85)",
                          border: isHoveringDetailBtn
                            ? "2px solid #38bdf8"
                            : "1.5px solid rgba(59, 130, 246, 0.38)",
                          boxShadow: isHoveringDetailBtn
                            ? "0 24px 48px rgba(0, 0, 0, 0.55), 0 0 36px rgba(59, 130, 246, 0.32)"
                            : "0 14px 32px rgba(0, 0, 0, 0.35)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: 18,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 14,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                            }}
                          >
                            <div
                              style={{
                                width: 52,
                                height: 52,
                                borderRadius: 14,
                                background:
                                  "linear-gradient(135deg, rgba(59, 130, 246, 0.28), rgba(6, 182, 212, 0.22))",
                                border: "1px solid rgba(59, 130, 246, 0.45)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 26,
                              }}
                            >
                              🚀
                            </div>
                            <div>
                              <h3
                                style={{
                                  margin: 0,
                                  fontSize: 22,
                                  fontWeight: 800,
                                  color: "#e8edf5",
                                }}
                              >
                                Pengembangan Sistem & Web App
                              </h3>
                              <p
                                style={{
                                  margin: "6px 0 0",
                                  fontSize: 15,
                                  color: "#94a3b8",
                                  lineHeight: 1.55,
                                }}
                              >
                                Pembuatan aplikasi web custom, sistem informasi
                                internal & dashboard operasional bisnis.
                              </p>
                            </div>
                          </div>

                          <span
                            style={{
                              padding: "6px 14px",
                              borderRadius: 9999,
                              backgroundColor: "rgba(59, 130, 246, 0.2)",
                              border: "1px solid rgba(59, 130, 246, 0.5)",
                              color: "#60a5fa",
                              fontSize: 11,
                              fontWeight: 800,
                              letterSpacing: "0.05em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            MULAI DARI
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: 14,
                            borderTop: "1px solid rgba(59, 130, 246, 0.18)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 24,
                              fontWeight: 800,
                              background:
                                "linear-gradient(135deg, #3b82f6, #06b6d4)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            Mulai dari Rp3.000.000
                          </span>

                          {/* Target Button: Lihat Detail (Center X = 497, Center Y = 780 when filtered) */}
                          <div
                            style={{
                              padding: "10px 22px",
                              borderRadius: 9999,
                              background: isHoveringDetailBtn
                                ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                                : "rgba(59, 130, 246, 0.16)",
                              border: isHoveringDetailBtn
                                ? "2px solid #67e8f9"
                                : "1px solid rgba(59, 130, 246, 0.45)",
                              color: "#ffffff",
                              fontSize: 14,
                              fontWeight: 700,
                              transform: `scale(${detailBtnPress})`,
                              boxShadow: isHoveringDetailBtn
                                ? "0 8px 24px rgba(59, 130, 246, 0.5)"
                                : "none",
                            }}
                          >
                            Lihat Detail →
                          </div>
                        </div>
                      </div>

                      {/* Companion Card in Aplikasi Custom */}
                      <div
                        style={{
                          padding: "26px 24px",
                          borderRadius: 20,
                          backgroundColor: "rgba(15, 34, 64, 0.65)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 10,
                            }}
                          >
                            <span style={{ fontSize: 24 }}>📱</span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#60a5fa",
                                padding: "4px 10px",
                                borderRadius: 9999,
                                backgroundColor: "rgba(59, 130, 246, 0.14)",
                              }}
                            >
                              MULAI DARI
                            </span>
                          </div>
                          <h4
                            style={{
                              margin: "0 0 8px",
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#e8edf5",
                            }}
                          >
                            Aplikasi Katalog & Company Profile
                          </h4>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 14,
                              color: "#94a3b8",
                              lineHeight: 1.5,
                            }}
                          >
                            Website profil bisnis modern terintegrasi CMS &
                            WhatsApp.
                          </p>
                        </div>
                        <div
                          style={{
                            fontSize: 19,
                            fontWeight: 800,
                            color: "#38bdf8",
                            marginTop: 14,
                          }}
                        >
                          Mulai dari Rp1.500.000
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ============ SERVICE DETAIL MODAL OVERLAY ============ */}
                {isModalOpen && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 50,
                      backgroundColor: `rgba(4, 8, 18, ${interpolate(modalProgress, [0, 1], [0, 0.84])})`,
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "32px",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 740,
                        borderRadius: 26,
                        backgroundColor: "rgba(13, 27, 46, 0.98)",
                        border: "1.5px solid rgba(56, 189, 248, 0.42)",
                        boxShadow:
                          "0 32px 80px rgba(0, 0, 0, 0.75), 0 0 60px rgba(59, 130, 246, 0.25)",
                        padding: "36px 40px",
                        opacity: interpolate(
                          modalProgress,
                          [0, 0.6, 1],
                          [0, 1, 1]
                        ),
                        transform: `translateY(${interpolate(modalProgress, [0, 1], [32, 0])}px) scale(${interpolate(modalProgress, [0, 1], [0.92, 1])})`,
                      }}
                    >
                      {/* Modal Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 16,
                          marginBottom: 20,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "6px 14px",
                              borderRadius: 9999,
                              backgroundColor: "rgba(59, 130, 246, 0.15)",
                              border: "1px solid rgba(59, 130, 246, 0.35)",
                              color: "#60a5fa",
                              fontSize: 12,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              marginBottom: 12,
                            }}
                          >
                            <span>🚀</span>
                            <span>Detail Layanan — Aplikasi Custom</span>
                          </div>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: 30,
                              fontWeight: 800,
                              color: "#e8edf5",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            Pengembangan Sistem & Web App
                          </h3>
                        </div>

                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor: "rgba(59, 130, 246, 0.12)",
                            border: "1px solid rgba(59, 130, 246, 0.28)",
                            color: "#94a3b8",
                            fontSize: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ✕
                        </div>
                      </div>

                      {/* Gradient Divider */}
                      <div
                        style={{
                          height: 1.5,
                          background:
                            "linear-gradient(90deg, rgba(59, 130, 246, 0.55), rgba(6, 182, 212, 0.3), transparent)",
                          marginBottom: 20,
                        }}
                      />

                      {/* Full Description */}
                      <p
                        style={{
                          margin: "0 0 24px",
                          fontSize: 16,
                          color: "#cbd5e1",
                          lineHeight: 1.65,
                        }}
                      >
                        Solusi pembuatan aplikasi web dan sistem informasi
                        kustom untuk bisnis, UMKM, maupun instansi. Dirancang
                        sesuai alur kerja operasional Anda dengan arsitektur
                        modern, cepat, dan mudah dikembangkan.
                      </p>

                      {/* Complexity Price Options Box */}
                      <div
                        style={{
                          borderRadius: 18,
                          backgroundColor: "rgba(6, 12, 24, 0.72)",
                          border: "1px solid rgba(59, 130, 246, 0.25)",
                          padding: "22px 26px",
                          marginBottom: 20,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "#60a5fa",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            💰 Opsi Harga Berdasarkan Kompleksitas
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: "#94a3b8",
                            }}
                          >
                            Estimasi Referensi
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          {complexityRows.map((row, idx) => {
                            const rowEnter = spring({
                              frame: frame - (MODAL_OPEN_FRAME + 10 + idx * 10),
                              fps,
                              config: { damping: 16, stiffness: 145 },
                            });

                            return (
                              <div
                                key={row.level}
                                style={{
                                  padding: "16px 20px",
                                  borderRadius: 14,
                                  backgroundColor:
                                    idx === 1
                                      ? isTierSelected
                                        ? "rgba(14, 116, 144, 0.48)"
                                        : "rgba(30, 58, 95, 0.55)"
                                      : "rgba(15, 34, 64, 0.55)",
                                  border:
                                    idx === 1
                                      ? isTierSelected
                                        ? "2px solid #38bdf8"
                                        : "1.5px solid rgba(56, 189, 248, 0.5)"
                                      : "1px solid rgba(59, 130, 246, 0.18)",
                                  boxShadow:
                                    idx === 1 && isTierSelected
                                      ? "0 0 28px rgba(56, 189, 248, 0.3)"
                                      : "none",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 16,
                                  opacity: interpolate(rowEnter, [0, 1], [0, 1]),
                                  transform: `translateX(${interpolate(rowEnter, [0, 1], [-18, 0])}px) scale(${idx === 1 && isTierSelected ? 1.015 : 1})`,
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                      marginBottom: 4,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 18,
                                        fontWeight: 800,
                                        color: "#f8fafc",
                                      }}
                                    >
                                      {row.level}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 800,
                                        padding: "3px 9px",
                                        borderRadius: 9999,
                                        backgroundColor:
                                          idx === 1 && isTierSelected
                                            ? "rgba(56, 189, 248, 0.28)"
                                            : "rgba(59, 130, 246, 0.18)",
                                        color: row.accent,
                                        letterSpacing: "0.06em",
                                      }}
                                    >
                                      {idx === 1 && isTierSelected
                                        ? "✓ DIPILIH • POPULER"
                                        : row.badge}
                                    </span>
                                  </div>
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: 13.5,
                                      color: "#94a3b8",
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {row.desc}
                                  </p>
                                </div>

                                <div
                                  style={{
                                    fontSize: 20,
                                    fontWeight: 800,
                                    color: row.accent,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {row.price}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Disclaimer Note */}
                      <p
                        style={{
                          margin: "0 0 22px",
                          fontSize: 14,
                          fontStyle: "italic",
                          color: "#94a3b8",
                        }}
                      >
                        *Harga dapat menyesuaikan kondisi dan kebutuhan.
                      </p>

                      {/* Bottom WhatsApp CTA inside Modal (Center X = 540, Center Y = 1394) */}
                      <div
                        style={{
                          height: 58,
                          borderRadius: 9999,
                          background: isWaClicked
                            ? "linear-gradient(135deg, #16a34a, #0d9488)"
                            : "linear-gradient(135deg, #25d366, #128c7e)",
                          color: "#ffffff",
                          fontSize: 17,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          transform: `scale(${waBtnPress})`,
                          border: isWaClicked
                            ? "2px solid #86efac"
                            : isHoveringWaBtn
                              ? "1.5px solid rgba(255, 255, 255, 0.45)"
                              : "none",
                          boxShadow: isWaClicked
                            ? "0 0 0 6px rgba(37, 211, 102, 0.35), 0 16px 36px rgba(37, 211, 102, 0.55)"
                            : isHoveringWaBtn
                              ? "0 14px 32px rgba(37, 211, 102, 0.48)"
                              : "0 10px 28px rgba(37, 211, 102, 0.35)",
                        }}
                      >
                        <span>💬</span>
                        <span>
                          {isWaClicked
                            ? "Membuka Konsultasi WhatsApp..."
                            : "Konsultasi Layanan Ini via WhatsApp"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DeviceFrame>
        </div>

        {/* Simulated Cursor: Exact coordinates for Search Input -> Lihat Detail -> Tier Menengah -> Modal WA Button */}
        <SimulatedCursor
          path={[
            { frame: 0, x: 785, y: 434 },
            { frame: INPUT_CLICK_FRAME, x: 785, y: 434, click: true },
            { frame: FILTER_ACTIVE_FRAME + 15, x: 785, y: 434 },
            { frame: DETAIL_HOVER_FRAME, x: 497, y: 780 },
            { frame: DETAIL_CLICK_FRAME, x: 497, y: 780, click: true },
            { frame: MODAL_OPEN_FRAME + 20, x: 497, y: 780 },
            { frame: TIER_HOVER_FRAME, x: 540, y: 1125 },
            { frame: TIER_SELECT_FRAME, x: 540, y: 1125, click: true },
            { frame: TIER_SELECT_FRAME + 20, x: 540, y: 1125 },
            { frame: WA_HOVER_FRAME, x: 540, y: 1394 },
            { frame: WA_MODAL_CLICK_FRAME, x: 540, y: 1394, click: true },
          ]}
        />
      </CameraRig>
    </AbsoluteFill>
  );
};
