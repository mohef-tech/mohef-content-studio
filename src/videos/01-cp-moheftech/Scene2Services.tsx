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
import { FloatingContextPill } from "./FloatingContextPill";

export const Scene2Services: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth page scroll from Home down to Layanan section during 0s - 2s (frames 0 - 110)
  const pageScrollY = interpolate(frame, [6, 105], [0, -1180], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Hover states:
  // 1) Pilar 1 (Kiri): frame 140..300
  // 2) Pilar 2 (Kanan): frame 325..540
  // 3) Pilar 3 (Kiri -> Overview): frame 565..780
  const hoverPilar1Left = frame >= 140 && frame < 300;
  const hoverPilar2Right = frame >= 325 && frame < 540;
  const hoverPilar3 = frame >= 565;

  const card1Lift = spring({
    frame: hoverPilar1Left ? frame - 140 : 0,
    fps,
    config: { damping: 16, stiffness: 150, mass: 0.6 },
  });

  const card2RightLift = spring({
    frame: hoverPilar2Right ? frame - 325 : 0,
    fps,
    config: { damping: 16, stiffness: 150, mass: 0.6 },
  });

  const card3Lift = spring({
    frame: hoverPilar3 ? frame - 565 : 0,
    fps,
    config: { damping: 16, stiffness: 150, mass: 0.6 },
  });

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
        <Audio src={staticFile("sfx/whoosh.mp3")} volume={0.8} />
      </Sequence>
      <Sequence from={140}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.65} />
      </Sequence>
      <Sequence from={325}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.65} />
      </Sequence>
      <Sequence from={565}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.6} />
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
        text="💡 3 Pilar Layanan & Transparansi Harga Referensi"
        startFrame={6}
      />

      {/* Camera Rig: Kiri (Pilar 1) -> Kanan (Pilar 2) -> Zoom Out Utuh (Pilar 3) */}
      <CameraRig
        keyframes={[
          // Lanjut mulus dari state akhir Scene 1 lalu kembali netral saat scroll
          { frame: 0, scale: 1.22, x: 85, y: 25, rotateX: 2, rotateY: -1.5 },
          { frame: 12, scale: 1, x: 0, y: 0, rotateX: 0, rotateY: 0 },
          // Detik 2 - 5: Zoom-in ke KIRI menyorot Pilar 1 (Harga Pasti)
          {
            frame: 120,
            scale: 1.25,
            x: 135,
            y: 155,
            rotateX: 1.5,
            rotateY: -2,
          },
          // Detik 5 - 9: Zoom & Pan mengikuti ke KANAN menyorot Pilar 2 (Mulai Dari)
          {
            frame: 300,
            scale: 1.26,
            x: -135,
            y: -135,
            rotateX: 1.5,
            rotateY: 2,
          },
          // Detik 9 - 13: Pan ke Pilar 3 lalu Zoom-out menampilkan ke-3 Pilar utuh
          {
            frame: 540,
            scale: 1.04,
            x: 0,
            y: -75,
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
            url="https://moheftech.com/#layanan"
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
                      color: frame < 55 ? "#e8edf5" : "#94a3b8",
                    }}
                  >
                    Home
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: frame >= 55 ? "#e8edf5" : "#94a3b8",
                      paddingBottom: 4,
                      borderBottom:
                        frame >= 55
                          ? "2px solid #3b82f6"
                          : "2px solid transparent",
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

              {/* ============ SCROLLING PAGE CONTAINER ============ */}
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    transform: `translate3d(0, ${pageScrollY}px, 0)`,
                    willChange: "transform",
                  }}
                >
                  {/* --- TOP SECTION: HOME (visible at frame 0 before scroll completes) --- */}
                  <div
                    style={{
                      height: 1180,
                      padding: "56px 48px 36px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        height: 42,
                        padding: "0 22px",
                        borderRadius: 9999,
                        backgroundColor: "rgba(59, 130, 246, 0.12)",
                        border: "1px solid rgba(59, 130, 246, 0.35)",
                        color: "#60a5fa",
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 28,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#06b6d4",
                        }}
                      />
                      IT Solutions Partner
                    </div>

                    <div
                      style={{
                        width: 104,
                        height: 104,
                        borderRadius: 26,
                        background:
                          "linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(6, 182, 212, 0.18))",
                        border: "1.5px solid rgba(59, 130, 246, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 28,
                      }}
                    >
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 18,
                          background:
                            "linear-gradient(135deg, #3b82f6, #06b6d4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 38,
                          fontWeight: 900,
                          color: "#ffffff",
                        }}
                      >
                        MT
                      </div>
                    </div>

                    <h1
                      style={{
                        margin: 0,
                        fontSize: 72,
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: 16,
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #06b6d4 55%, #60a5fa 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Mohef Tech
                    </h1>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 30,
                        fontWeight: 700,
                        color: "#e8edf5",
                        marginBottom: 20,
                      }}
                    >
                      Solusi IT terbaik untuk Anda
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 20,
                        color: "#94a3b8",
                        maxWidth: 760,
                        lineHeight: 1.65,
                        marginBottom: 40,
                      }}
                    >
                      Mohef Tech menyediakan berbagai solusi IT terpadu yang
                      mencakup kebutuhan hardware dan software: mulai dari
                      maintenance, troubleshooting, upgrade perangkat, hingga
                      pengembangan solusi software bisnis.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 20,
                      }}
                    >
                      <div
                        style={{
                          width: 268,
                          height: 64,
                          borderRadius: 9999,
                          background:
                            "linear-gradient(135deg, #2563eb, #0891b2)",
                          color: "#ffffff",
                          fontSize: 19,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          border: "2px solid #67e8f9",
                        }}
                      >
                        <span>⚡</span>
                        <span>Lihat Layanan</span>
                      </div>
                      <div
                        style={{
                          width: 268,
                          height: 64,
                          borderRadius: 9999,
                          background:
                            "linear-gradient(135deg, #25d366, #128c7e)",
                          color: "#ffffff",
                          fontSize: 19,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                        }}
                      >
                        <span>💬</span>
                        <span>Konsultasi Gratis</span>
                      </div>
                    </div>
                  </div>

                  {/* --- TARGET SECTION: LAYANAN (3 PILAR & TRANSPARANSI HARGA) --- */}
                  <section
                    style={{
                      padding: "32px 42px 48px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 24,
                    }}
                  >
                    {/* Section Header + Search Bar Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(59, 130, 246, 0.14)",
                        paddingBottom: 20,
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

                      {/* Search Box Preview */}
                      <div
                        style={{
                          width: 340,
                          height: 46,
                          borderRadius: 9999,
                          backgroundColor: "rgba(15, 34, 64, 0.85)",
                          border: "1px solid rgba(59, 130, 246, 0.25)",
                          padding: "0 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          color: "#64748b",
                          fontSize: 14,
                        }}
                      >
                        <span>Cari layanan yang Anda butuhkan...</span>
                        <span style={{ color: "#60a5fa" }}>🔍</span>
                      </div>
                    </div>

                    {/* ==================== PILAR 1: PERANGKAT & JARINGAN ==================== */}
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
                          letterSpacing: "0.06em",
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
                        {/* Featured Left Card: Upgrade & Ganti RAM 8GB */}
                        <div
                          style={{
                            padding: "22px 24px",
                            borderRadius: 18,
                            backgroundColor: hoverPilar1Left
                              ? "rgba(20, 50, 92, 0.92)"
                              : "rgba(15, 34, 64, 0.75)",
                            border: hoverPilar1Left
                              ? "2px solid rgba(56, 189, 248, 0.85)"
                              : "1px solid rgba(59, 130, 246, 0.22)",
                            boxShadow: hoverPilar1Left
                              ? "0 20px 44px rgba(0, 0, 0, 0.55), 0 0 32px rgba(59, 130, 246, 0.32)"
                              : "0 8px 24px rgba(0, 0, 0, 0.25)",
                            transform: `translateY(${interpolate(card1Lift, [0, 1], [0, -8])}px) scale(${interpolate(card1Lift, [0, 1], [1, 1.02])})`,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                              }}
                            >
                              <div
                                style={{
                                  width: 46,
                                  height: 46,
                                  borderRadius: 12,
                                  background:
                                    "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(6, 182, 212, 0.2))",
                                  border: "1px solid rgba(59, 130, 246, 0.4)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 22,
                                }}
                              >
                                ⚡
                              </div>
                              <div>
                                <h3
                                  style={{
                                    margin: 0,
                                    fontSize: 20,
                                    fontWeight: 800,
                                    color: "#e8edf5",
                                  }}
                                >
                                  Upgrade & Ganti RAM 8GB
                                </h3>
                                <p
                                  style={{
                                    margin: "4px 0 0",
                                    fontSize: 14,
                                    color: "#94a3b8",
                                  }}
                                >
                                  Pemasangan modul RAM laptop/PC, uji stabilitas
                                  sistem & garansi pengerjaan.
                                </p>
                              </div>
                            </div>

                            <span
                              style={{
                                padding: "5px 12px",
                                borderRadius: 9999,
                                backgroundColor: "rgba(16, 185, 129, 0.16)",
                                border: "1px solid rgba(16, 185, 129, 0.45)",
                                color: "#34d399",
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: "0.05em",
                                whiteSpace: "nowrap",
                              }}
                            >
                              HARGA PASTI
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingTop: 10,
                              borderTop: "1px solid rgba(59, 130, 246, 0.15)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: 10,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 24,
                                  fontWeight: 800,
                                  background:
                                    "linear-gradient(135deg, #34d399, #06b6d4)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                }}
                              >
                                Rp350.000
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "#94a3b8",
                                  fontWeight: 500,
                                }}
                              >
                                (di luar sparepart)
                              </span>
                            </div>

                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#60a5fa",
                                padding: "6px 14px",
                                borderRadius: 9999,
                                border: "1px solid rgba(59, 130, 246, 0.35)",
                              }}
                            >
                              Lihat Detail →
                            </span>
                          </div>
                        </div>

                        {/* Secondary Right Card in Pillar 1 */}
                        <div
                          style={{
                            padding: "22px 22px",
                            borderRadius: 18,
                            backgroundColor: "rgba(15, 34, 64, 0.6)",
                            border: "1px solid rgba(59, 130, 246, 0.16)",
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
                                marginBottom: 8,
                              }}
                            >
                              <span style={{ fontSize: 20 }}>🌐</span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#34d399",
                                  padding: "3px 10px",
                                  borderRadius: 9999,
                                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                                }}
                              >
                                HARGA PASTI
                              </span>
                            </div>
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
                                margin: 0,
                                fontSize: 13,
                                color: "#94a3b8",
                                lineHeight: 1.5,
                              }}
                            >
                              Setting router, manajemen bandwidth & titik akses
                              kantor.
                            </p>
                          </div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: "#38bdf8",
                              marginTop: 12,
                            }}
                          >
                            Rp250.000 / titik
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ==================== PILAR 2: APLIKASI CUSTOM (SOROT KANAN) ==================== */}
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
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        <span>💻</span>
                        <span>Pilar 2 — Aplikasi Custom</span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1.25fr",
                          gap: 18,
                        }}
                      >
                        {/* Left Companion Card in Pillar 2 */}
                        <div
                          style={{
                            padding: "22px 22px",
                            borderRadius: 18,
                            backgroundColor: "rgba(15, 34, 64, 0.6)",
                            border: "1px solid rgba(59, 130, 246, 0.16)",
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
                                marginBottom: 8,
                              }}
                            >
                              <span style={{ fontSize: 20 }}>🏢</span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#60a5fa",
                                  padding: "3px 10px",
                                  borderRadius: 9999,
                                  backgroundColor: "rgba(59, 130, 246, 0.14)",
                                }}
                              >
                                MULAI DARI
                              </span>
                            </div>
                            <h4
                              style={{
                                margin: "0 0 6px",
                                fontSize: 17,
                                fontWeight: 700,
                                color: "#e8edf5",
                              }}
                            >
                              Company Profile & Landing Page
                            </h4>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                color: "#94a3b8",
                                lineHeight: 1.5,
                              }}
                            >
                              Website responsif cepat dengan panel admin & SEO.
                            </p>
                          </div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: "#38bdf8",
                              marginTop: 12,
                            }}
                          >
                            Mulai dari Rp1.500.000
                          </div>
                        </div>

                        {/* Featured RIGHT Card: Pengembangan Sistem & Web App */}
                        <div
                          style={{
                            padding: "22px 24px",
                            borderRadius: 18,
                            backgroundColor: hoverPilar2Right
                              ? "rgba(20, 50, 92, 0.94)"
                              : "rgba(15, 34, 64, 0.75)",
                            border: hoverPilar2Right
                              ? "2px solid rgba(56, 189, 248, 0.85)"
                              : "1px solid rgba(59, 130, 246, 0.22)",
                            boxShadow: hoverPilar2Right
                              ? "0 20px 44px rgba(0, 0, 0, 0.55), 0 0 32px rgba(59, 130, 246, 0.34)"
                              : "0 8px 24px rgba(0, 0, 0, 0.25)",
                            transform: `translateY(${interpolate(card2RightLift, [0, 1], [0, -8])}px) scale(${interpolate(card2RightLift, [0, 1], [1, 1.02])})`,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                              }}
                            >
                              <div
                                style={{
                                  width: 46,
                                  height: 46,
                                  borderRadius: 12,
                                  background:
                                    "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(6, 182, 212, 0.2))",
                                  border: "1px solid rgba(59, 130, 246, 0.4)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 22,
                                }}
                              >
                                🚀
                              </div>
                              <div>
                                <h3
                                  style={{
                                    margin: 0,
                                    fontSize: 20,
                                    fontWeight: 800,
                                    color: "#e8edf5",
                                  }}
                                >
                                  Pengembangan Sistem & Web App
                                </h3>
                                <p
                                  style={{
                                    margin: "4px 0 0",
                                    fontSize: 14,
                                    color: "#94a3b8",
                                  }}
                                >
                                  Pembuatan aplikasi web, dashboard operasional
                                  & sistem informasi sesuai proses bisnis.
                                </p>
                              </div>
                            </div>

                            <span
                              style={{
                                padding: "5px 12px",
                                borderRadius: 9999,
                                backgroundColor: "rgba(59, 130, 246, 0.18)",
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
                              paddingTop: 10,
                              borderTop: "1px solid rgba(59, 130, 246, 0.15)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 23,
                                fontWeight: 800,
                                background:
                                  "linear-gradient(135deg, #3b82f6, #06b6d4)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                              }}
                            >
                              Mulai dari Rp3.000.000
                            </span>

                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: hoverPilar2Right ? "#ffffff" : "#60a5fa",
                                padding: "7px 16px",
                                borderRadius: 9999,
                                background: hoverPilar2Right
                                  ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                                  : "rgba(59, 130, 246, 0.12)",
                                border: "1px solid rgba(59, 130, 246, 0.45)",
                              }}
                            >
                              Lihat Detail →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ==================== PILAR 3: KONSULTASI & MAINTENANCE ==================== */}
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
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        <span>🛡️</span>
                        <span>Pilar 3 — Konsultasi & Maintenance</span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.25fr 1fr",
                          gap: 18,
                        }}
                      >
                        {/* Featured Card: Audit Sistem & Troubleshooting IT */}
                        <div
                          style={{
                            padding: "22px 24px",
                            borderRadius: 18,
                            backgroundColor: hoverPilar3
                              ? "rgba(20, 50, 92, 0.92)"
                              : "rgba(15, 34, 64, 0.75)",
                            border: hoverPilar3
                              ? "2px solid rgba(167, 139, 250, 0.85)"
                              : "1px solid rgba(59, 130, 246, 0.22)",
                            boxShadow: hoverPilar3
                              ? "0 20px 44px rgba(0, 0, 0, 0.55), 0 0 32px rgba(139, 92, 246, 0.28)"
                              : "0 8px 24px rgba(0, 0, 0, 0.25)",
                            transform: `translateY(${interpolate(card3Lift, [0, 1], [0, -8])}px) scale(${interpolate(card3Lift, [0, 1], [1, 1.02])})`,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                              }}
                            >
                              <div
                                style={{
                                  width: 46,
                                  height: 46,
                                  borderRadius: 12,
                                  background:
                                    "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.2))",
                                  border: "1px solid rgba(139, 92, 246, 0.45)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 22,
                                }}
                              >
                                🔧
                              </div>
                              <div>
                                <h3
                                  style={{
                                    margin: 0,
                                    fontSize: 20,
                                    fontWeight: 800,
                                    color: "#e8edf5",
                                  }}
                                >
                                  Audit Sistem & Troubleshooting IT
                                </h3>
                                <p
                                  style={{
                                    margin: "4px 0 0",
                                    fontSize: 14,
                                    color: "#94a3b8",
                                  }}
                                >
                                  Evaluasi menyeluruh infrastruktur IT,
                                  penanganan kendala teknis & kontrak
                                  maintenance rutin.
                                </p>
                              </div>
                            </div>

                            <span
                              style={{
                                padding: "5px 12px",
                                borderRadius: 9999,
                                backgroundColor: "rgba(139, 92, 246, 0.18)",
                                border: "1px solid rgba(167, 139, 250, 0.5)",
                                color: "#c4b5fd",
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: "0.05em",
                                whiteSpace: "nowrap",
                              }}
                            >
                              KONSULTASI
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingTop: 10,
                              borderTop: "1px solid rgba(59, 130, 246, 0.15)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 22,
                                fontWeight: 800,
                                background:
                                  "linear-gradient(135deg, #a78bfa, #38bdf8)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                              }}
                            >
                              Konsultasi / Custom
                            </span>

                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#c4b5fd",
                                padding: "6px 14px",
                                borderRadius: 9999,
                                border: "1px solid rgba(167, 139, 250, 0.4)",
                              }}
                            >
                              Diskusi Kebutuhan →
                            </span>
                          </div>
                        </div>

                        {/* Secondary Card in Pillar 3 */}
                        <div
                          style={{
                            padding: "22px 22px",
                            borderRadius: 18,
                            backgroundColor: "rgba(15, 34, 64, 0.6)",
                            border: "1px solid rgba(59, 130, 246, 0.16)",
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
                                marginBottom: 8,
                              }}
                            >
                              <span style={{ fontSize: 20 }}>🤝</span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#c4b5fd",
                                  padding: "3px 10px",
                                  borderRadius: 9999,
                                  backgroundColor: "rgba(139, 92, 246, 0.15)",
                                }}
                              >
                                KONSULTASI
                              </span>
                            </div>
                            <h4
                              style={{
                                margin: "0 0 6px",
                                fontSize: 17,
                                fontWeight: 700,
                                color: "#e8edf5",
                              }}
                            >
                              IT Support & Retainer Bulanan
                            </h4>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                color: "#94a3b8",
                                lineHeight: 1.5,
                              }}
                            >
                              Pendampingan teknis berkala untuk operasional
                              kantor bebas hambatan.
                            </p>
                          </div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: "#a78bfa",
                              marginTop: 12,
                            }}
                          >
                            Konsultasi / Custom
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footnote Disclaimer */}
                    <div
                      style={{
                        marginTop: 6,
                        padding: "14px 20px",
                        borderRadius: 12,
                        backgroundColor: "rgba(15, 34, 64, 0.45)",
                        border: "1px solid rgba(59, 130, 246, 0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontStyle: "italic",
                          color: "#94a3b8",
                        }}
                      >
                        *Harga dapat menyesuaikan kondisi dan kebutuhan.
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#60a5fa",
                        }}
                      >
                        ✓ Transparan & Terukur
                      </span>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </DeviceFrame>
        </div>

        {/* Simulated Cursor: Kiri (Pilar 1) -> Kanan (Pilar 2) -> Kiri-Bawah (Pilar 3) */}
        <SimulatedCursor
          path={[
            { frame: 0, x: 396, y: 954 },
            { frame: 120, x: 350, y: 690 },
            { frame: 300, x: 735, y: 1050 },
            { frame: 540, x: 380, y: 1390 },
          ]}
        />
      </CameraRig>
    </AbsoluteFill>
  );
};
