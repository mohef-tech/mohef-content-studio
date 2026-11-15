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
import { SfxCue } from "../../lib/motion-craft";
import { FloatingContextPill } from "./FloatingContextPill";

const USER_MSG_FRAME = 32;
const REPLY_MSG_FRAME = 105;
const CTA_HOVER_FRAME = 235;
const CTA_CLICK_FRAME = 270;

export const Scene5ContactCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const userMsgSpring = spring({
    frame: frame - USER_MSG_FRAME,
    fps,
    config: { damping: 16, stiffness: 145, mass: 0.7 },
  });

  const replyMsgSpring = spring({
    frame: frame - REPLY_MSG_FRAME,
    fps,
    config: { damping: 16, stiffness: 145, mass: 0.7 },
  });

  const isHoveringCta = frame >= CTA_HOVER_FRAME;
  const isClickedCta = frame >= CTA_CLICK_FRAME;

  const ctaPressScale =
    frame >= CTA_CLICK_FRAME && frame <= CTA_CLICK_FRAME + 20
      ? interpolate(
          frame - CTA_CLICK_FRAME,
          [0, 5, 13, 20],
          [1, 0.92, 1.05, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        )
      : isHoveringCta
        ? 1.03
        : 1;

  const confirmBadgeSpring = spring({
    frame: isClickedCta ? frame - CTA_CLICK_FRAME : 0,
    fps,
    config: { damping: 14, stiffness: 150, mass: 0.7 },
  });

  const pulseGlow = Math.sin(frame * 0.1) * 0.5 + 0.5;

  const valueChips = [
    "✓ Konsultasi & Survei Awal Gratis",
    "✓ Estimasi Harga Jelas di Depan",
    "✓ Garansi Resmi & Support 24/7",
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
      <SfxCue frame={USER_MSG_FRAME} sfx="pop-plop" volume={0.44} />
      <SfxCue frame={REPLY_MSG_FRAME} sfx="ding-bell" volume={0.42} />
      <SfxCue frame={CTA_HOVER_FRAME} sfx="hover-rollover" volume={0.26} />
      <SfxCue frame={CTA_CLICK_FRAME} sfx="click" volume={0.55} />
      <SfxCue frame={CTA_CLICK_FRAME + 2} sfx="confirm-chime" volume={0.5} />

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
            "radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(16,185,129,0.08) 45%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Floating Context Pill */}
      <FloatingContextPill
        text="💬 Konsultasi Gratis Sekarang — Respon Cepat via WhatsApp"
        startFrame={4}
      />

      {/* Camera Rig */}
      <CameraRig
        keyframes={[
          { frame: 0, scale: 1.04, x: 0, y: -30, rotateX: 0, rotateY: 0 },
          {
            frame: 50,
            scale: 1.15,
            x: 0,
            y: 120,
            rotateX: 1.2,
            rotateY: 0,
          },
          {
            frame: 145,
            scale: 1.15,
            x: 0,
            y: 110,
            rotateX: 1.2,
            rotateY: 0,
          },
          {
            frame: CTA_HOVER_FRAME,
            scale: 1.14,
            x: 0,
            y: -95,
            rotateX: 1,
            rotateY: 0,
          },
          {
            frame: CTA_CLICK_FRAME + 30,
            scale: 1.14,
            x: 0,
            y: -95,
            rotateX: 1,
            rotateY: 0,
          },
          {
            frame: 390,
            scale: 1,
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
            url="https://moheftech.com/#kontak"
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
                    "radial-gradient(circle at 50% 22%, rgba(37, 211, 102, 0.12), transparent 50%), radial-gradient(circle at 50% 78%, rgba(59, 130, 246, 0.18), transparent 55%)",
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
                      fontWeight: 500,
                      color: "#94a3b8",
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
                      background: "linear-gradient(135deg, #25d366, #128c7e)",
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: 700,
                      boxShadow: "0 0 20px rgba(37, 211, 102, 0.4)",
                    }}
                  >
                    Kontak
                  </span>
                </nav>
              </header>

              {/* ============ KONTAK & LIVE WHATSAPP CONSULTATION CONTENT ============ */}
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  padding: "34px 42px 40px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 22,
                }}
              >
                {/* Live WhatsApp Quick-Chat Simulation Box */}
                <div
                  style={{
                    borderRadius: 24,
                    backgroundColor: "rgba(11, 24, 43, 0.92)",
                    border: "1.5px solid rgba(37, 211, 102, 0.38)",
                    boxShadow:
                      "0 22px 50px rgba(0, 0, 0, 0.55), 0 0 40px rgba(37, 211, 102, 0.14)",
                    overflow: "hidden",
                  }}
                >
                  {/* WhatsApp Header Bar */}
                  <div
                    style={{
                      padding: "18px 26px",
                      background:
                        "linear-gradient(90deg, rgba(18, 140, 126, 0.35), rgba(15, 34, 64, 0.9))",
                      borderBottom: "1px solid rgba(37, 211, 102, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
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
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #25d366, #128c7e)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          fontWeight: 900,
                          color: "#ffffff",
                          boxShadow: "0 0 16px rgba(37, 211, 102, 0.45)",
                        }}
                      >
                        MT
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span>Mohef Tech Official Support</span>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "2px 8px",
                              borderRadius: 9999,
                              backgroundColor: "rgba(37, 211, 102, 0.2)",
                              color: "#4ade80",
                              fontWeight: 700,
                            }}
                          >
                            VERIFIED
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#4ade80",
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          ● Online — Rata-rata respon &lt; 5 menit
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#94a3b8",
                        padding: "6px 14px",
                        borderRadius: 9999,
                        backgroundColor: "rgba(6, 12, 24, 0.65)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                      }}
                    >
                      Pesan Otomatis Terisi ✨
                    </div>
                  </div>

                  {/* Chat Messages Area */}
                  <div
                    style={{
                      padding: "22px 26px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    {/* Outgoing User Bubble */}
                    <div
                      style={{
                        alignSelf: "flex-end",
                        maxWidth: "82%",
                        padding: "16px 20px",
                        borderRadius: "18px 18px 4px 18px",
                        background:
                          "linear-gradient(135deg, rgba(18, 140, 126, 0.55), rgba(13, 148, 136, 0.45))",
                        border: "1px solid rgba(52, 211, 153, 0.45)",
                        color: "#f8fafc",
                        fontSize: 15,
                        lineHeight: 1.5,
                        opacity: interpolate(userMsgSpring, [0, 1], [0, 1]),
                        transform: `translateY(${interpolate(userMsgSpring, [0, 1], [18, 0])}px) scale(${interpolate(userMsgSpring, [0, 1], [0.95, 1])})`,
                      }}
                    >
                      Halo Mohef Tech 👋, saya ingin konsultasi layanan{" "}
                      <strong style={{ color: "#6ee7b7" }}>
                        Pengembangan Sistem & Web App (Menengah)
                      </strong>{" "}
                      untuk kebutuhan operasional bisnis kami.
                      <div
                        style={{
                          fontSize: 11,
                          color: "#a7f3d0",
                          textAlign: "right",
                          marginTop: 6,
                        }}
                      >
                        Baru saja ✓✓
                      </div>
                    </div>

                    {/* Incoming Mohef Tech Support Bubble */}
                    <div
                      style={{
                        alignSelf: "flex-start",
                        maxWidth: "85%",
                        padding: "16px 20px",
                        borderRadius: "18px 18px 18px 4px",
                        backgroundColor: "rgba(15, 34, 64, 0.92)",
                        border: "1px solid rgba(56, 189, 248, 0.4)",
                        color: "#e8edf5",
                        fontSize: 15,
                        lineHeight: 1.5,
                        opacity: interpolate(replyMsgSpring, [0, 1], [0, 1]),
                        transform: `translateY(${interpolate(replyMsgSpring, [0, 1], [18, 0])}px) scale(${interpolate(replyMsgSpring, [0, 1], [0.95, 1])})`,
                      }}
                    >
                      Halo! Terima kasih telah menghubungi{" "}
                      <strong style={{ color: "#38bdf8" }}>Mohef Tech</strong>{" "}
                      🚀. Tim engineer kami siap bantu analisa kebutuhan Anda &
                      jadwalkan sesi konsultasi gratis hari ini!
                      <div
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          marginTop: 6,
                        }}
                      >
                        Tim Teknis Mohef Tech • Siap Membantu
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grand Closing Conversion Hero Card */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: 26,
                    padding: "34px 38px",
                    background:
                      "linear-gradient(145deg, rgba(13, 27, 46, 0.96), rgba(8, 18, 36, 0.98))",
                    border: "1.5px solid rgba(59, 130, 246, 0.45)",
                    boxShadow: `0 28px 64px rgba(0, 0, 0, 0.65), 0 0 ${36 + pulseGlow * 18}px rgba(59, 130, 246, 0.28)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Top Badge */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 20px",
                      borderRadius: 9999,
                      backgroundColor: "rgba(59, 130, 246, 0.15)",
                      border: "1px solid rgba(56, 189, 248, 0.4)",
                      color: "#60a5fa",
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: 18,
                    }}
                  >
                    <span>🚀</span>
                    <span>Partner IT Hardware & Software Terpadu</span>
                  </div>

                  <h2
                    style={{
                      margin: "0 0 12px",
                      fontSize: 38,
                      fontWeight: 900,
                      lineHeight: 1.18,
                      letterSpacing: "-0.025em",
                      color: "#ffffff",
                    }}
                  >
                    Siap Wujudkan Solusi IT{" "}
                    <span
                      style={{
                        background:
                          "linear-gradient(135deg, #38bdf8, #34d399)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Terbaik untuk Anda?
                    </span>
                  </h2>

                  <p
                    style={{
                      margin: "0 0 22px",
                      fontSize: 17,
                      color: "#94a3b8",
                      maxWidth: 680,
                      lineHeight: 1.55,
                    }}
                  >
                    Mulai dari servis & upgrade perangkat, instalasi jaringan,
                    hingga pembuatan aplikasi web custom dengan harga jujur dan
                    bergaransi.
                  </p>

                  {/* 3 Value Chips */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 12,
                      marginBottom: 28,
                    }}
                  >
                    {valueChips.map((chip) => (
                      <span
                        key={chip}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 9999,
                          backgroundColor: "rgba(15, 34, 64, 0.85)",
                          border: "1px solid rgba(59, 130, 246, 0.28)",
                          color: "#cbd5e1",
                          fontSize: 13.5,
                          fontWeight: 700,
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* Primary Conversion CTA Button (Center X = 540, Center Y = 1352) */}
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 560,
                      height: 68,
                      borderRadius: 9999,
                      background: isClickedCta
                        ? "linear-gradient(135deg, #16a34a, #0d9488)"
                        : "linear-gradient(135deg, #25d366, #128c7e)",
                      color: "#ffffff",
                      fontSize: 21,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      transform: `scale(${ctaPressScale})`,
                      border: isClickedCta
                        ? "2.5px solid #86efac"
                        : "1.5px solid rgba(255, 255, 255, 0.3)",
                      boxShadow: isClickedCta
                        ? "0 0 0 8px rgba(37, 211, 102, 0.32), 0 20px 44px rgba(37, 211, 102, 0.65)"
                        : "0 14px 36px rgba(37, 211, 102, 0.42)",
                      marginBottom: 20,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>💬</span>
                    <span>
                      {isClickedCta
                        ? "Terhubung ke WhatsApp Mohef Tech ✓"
                        : "Konsultasi Gratis via WhatsApp Sekarang"}
                    </span>
                  </div>

                  {/* Bottom Website & Availability Bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 24,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#94a3b8",
                      opacity: interpolate(
                        confirmBadgeSpring,
                        [0, 1],
                        [0.85, 1]
                      ),
                    }}
                  >
                    <span style={{ color: "#38bdf8" }}>🌐 moheftech.com</span>
                    <span>•</span>
                    <span>📍 Layanan On-Site & Remote</span>
                    <span>•</span>
                    <span style={{ color: "#34d399" }}>⚡ Support 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </DeviceFrame>
        </div>

        {/* Simulated Cursor: Exact coordinates for Chat Bubbles -> Primary WA Button at (540, 1352) */}
        <SimulatedCursor
          path={[
            { frame: 0, x: 830, y: 1197 },
            { frame: 55, x: 620, y: 560 },
            { frame: 135, x: 460, y: 690 },
            { frame: CTA_HOVER_FRAME, x: 540, y: 1352 },
            { frame: CTA_CLICK_FRAME, x: 540, y: 1352, click: true },
          ]}
        />
      </CameraRig>
    </AbsoluteFill>
  );
};
