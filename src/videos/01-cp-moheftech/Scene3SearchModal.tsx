import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CameraRig } from "../../engine/CameraRig";
import { DeviceFrame } from "../../engine/DeviceFrame";
import { SimulatedCursor } from "../../engine/SimulatedCursor";
import { Typewriter } from "../../engine/Typewriter";
import { FloatingContextPill } from "./FloatingContextPill";

const INPUT_CLICK_FRAME = 138;
const TYPE_START_LOCAL = 150;
const FILTER_ACTIVE_FRAME = 172;
const DETAIL_CLICK_FRAME = 435;
const MODAL_OPEN_FRAME = 480;

export const Scene3SearchModal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0s - 2s: Smooth scroll to the top of Layanan section where Search input sits
  const sectionOffsetY = interpolate(frame, [0, 95], [-160, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const isSearchFocused = frame >= INPUT_CLICK_FRAME && frame < MODAL_OPEN_FRAME;
  const isFiltered = frame >= FILTER_ACTIVE_FRAME;
  const isHoveringDetailBtn =
    frame >= 380 && frame < MODAL_OPEN_FRAME;
  const isModalOpen = frame >= MODAL_OPEN_FRAME;

  const filterSpring = spring({
    frame: isFiltered ? frame - FILTER_ACTIVE_FRAME : 0,
    fps,
    config: { damping: 18, stiffness: 140, mass: 0.7 },
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
    config: { damping: 16, stiffness: 135, mass: 0.75 },
  });

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
      {/* Audio SFX */}
      <Sequence from={6}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.75} />
      </Sequence>
      <Sequence from={10}>
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.75} />
      </Sequence>
      <Sequence from={INPUT_CLICK_FRAME}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.85} />
      </Sequence>
      <Sequence from={TYPE_START_LOCAL} durationInFrames={45}>
        <Audio src={staticFile("sfx/typing.mp3")} volume={0.8} />
      </Sequence>
      <Sequence from={DETAIL_CLICK_FRAME}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.9} />
      </Sequence>
      <Sequence from={MODAL_OPEN_FRAME}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.85} />
      </Sequence>

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
        startFrame={6}
      />

      {/* CameraRig */}
      <CameraRig
        keyframes={[
          // Continues from Scene 2 end state
          { frame: 0, scale: 1.04, x: 0, y: -75, rotateX: 0, rotateY: 0 },
          // 0s - 2s: Smooth focus toward the Search Bar at top-right of Layanan header
          {
            frame: 85,
            scale: 1.24,
            x: -110,
            y: 230,
            rotateX: 1.5,
            rotateY: 1.5,
          },
          // 3.2s: Slight pan to show real-time filtered results under Search Bar
          {
            frame: 185,
            scale: 1.18,
            x: -30,
            y: 150,
            rotateX: 1,
            rotateY: 0.5,
          },
          // 5s - 8s: Focus on "Lihat Detail" button of Aplikasi Custom card
          {
            frame: 310,
            scale: 1.26,
            x: 90,
            y: 120,
            rotateX: 1.5,
            rotateY: -1.5,
          },
          // 8s - 14s: Center & zoom smoothly on Service Detail Modal for comfortable reading
          {
            frame: MODAL_OPEN_FRAME,
            scale: 1.14,
            x: 0,
            y: 15,
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
                    transform: `translate3d(0, ${sectionOffsetY}px, 0)`,
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

                    {/* Interactive Search Input */}
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
                            startFrame={1380 + 150}
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

                          {/* Target Button: Lihat Detail */}
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

                {/* ============ SERVICE DETAIL MODAL OVERLAY (8s - 14s) ============ */}
                {isModalOpen && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 50,
                      backgroundColor: `rgba(4, 8, 18, ${interpolate(modalProgress, [0, 1], [0, 0.82])})`,
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
                        opacity: interpolate(modalProgress, [0, 0.6, 1], [0, 1, 1]),
                        transform: `translateY(${interpolate(modalProgress, [0, 1], [36, 0])}px) scale(${interpolate(modalProgress, [0, 1], [0.9, 1])})`,
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
                              frame: frame - (MODAL_OPEN_FRAME + 12 + idx * 10),
                              fps,
                              config: { damping: 16, stiffness: 140 },
                            });

                            return (
                              <div
                                key={row.level}
                                style={{
                                  padding: "16px 20px",
                                  borderRadius: 14,
                                  backgroundColor:
                                    idx === 1
                                      ? "rgba(30, 58, 95, 0.55)"
                                      : "rgba(15, 34, 64, 0.55)",
                                  border:
                                    idx === 1
                                      ? "1.5px solid rgba(56, 189, 248, 0.5)"
                                      : "1px solid rgba(59, 130, 246, 0.18)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 16,
                                  opacity: interpolate(rowEnter, [0, 1], [0, 1]),
                                  transform: `translateX(${interpolate(rowEnter, [0, 1], [-18, 0])}px)`,
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
                                        backgroundColor: "rgba(59, 130, 246, 0.18)",
                                        color: row.accent,
                                        letterSpacing: "0.06em",
                                      }}
                                    >
                                      {row.badge}
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

                      {/* Bottom WhatsApp CTA inside Modal */}
                      <div
                        style={{
                          height: 56,
                          borderRadius: 9999,
                          background:
                            "linear-gradient(135deg, #25d366, #128c7e)",
                          color: "#ffffff",
                          fontSize: 17,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          boxShadow: "0 10px 28px rgba(37, 211, 102, 0.35)",
                        }}
                      >
                        <span>💬</span>
                        <span>Konsultasi Layanan Ini via WhatsApp</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DeviceFrame>
        </div>

        {/* Simulated Cursor: Search Input -> "Lihat Detail" -> Modal Price Reading */}
        <SimulatedCursor
          path={[
            { frame: 0, x: 380, y: 1390 },
            { frame: 90, x: 760, y: 432 },
            { frame: INPUT_CLICK_FRAME, x: 760, y: 432, click: true },
            { frame: 310, x: 486, y: 808 },
            { frame: DETAIL_CLICK_FRAME, x: 486, y: 808, click: true },
            { frame: MODAL_OPEN_FRAME + 30, x: 640, y: 980 },
          ]}
        />
      </CameraRig>
    </AbsoluteFill>
  );
};

