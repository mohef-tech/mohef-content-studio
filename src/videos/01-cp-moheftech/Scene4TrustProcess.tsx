import React from "react";
import {
  AbsoluteFill,
  Easing,
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

const STEP_1_FRAME = 40;
const STEP_2_FRAME = 100;
const STEP_3_FRAME = 160;
const STEP_4_FRAME = 220;
const CTA_HOVER_FRAME = 320;
const CTA_CLICK_FRAME = 350;

export const Scene4TrustProcess: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterScrollY = interpolate(frame, [0, 45], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const activeStep =
    frame >= STEP_4_FRAME
      ? 3
      : frame >= STEP_3_FRAME
        ? 2
        : frame >= STEP_2_FRAME
          ? 1
          : frame >= STEP_1_FRAME
            ? 0
            : -1;

  const progressLineRatio = interpolate(
    frame,
    [STEP_1_FRAME, STEP_4_FRAME + 20],
    [0.15, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  const isHoveringCta = frame >= CTA_HOVER_FRAME;
  const isClickedCta = frame >= CTA_CLICK_FRAME;

  const ctaScale =
    frame >= CTA_CLICK_FRAME && frame <= CTA_CLICK_FRAME + 18
      ? interpolate(
          frame - CTA_CLICK_FRAME,
          [0, 4, 12, 18],
          [1, 0.92, 1.05, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        )
      : isHoveringCta
        ? 1.03
        : 1;

  const workflowSteps = [
    {
      num: "01",
      icon: "💬",
      title: "Konsultasi & Audit Gratis",
      desc: "Diskusi kendala perangkat atau kebutuhan sistem bisnis Anda tanpa biaya awal.",
      tag: "GRATIS 100%",
      accent: "#38bdf8",
    },
    {
      num: "02",
      icon: "📋",
      title: "Estimasi & Spek Transparan",
      desc: "Rincian ruang lingkup kerja, opsi harga & timeline disepakati jelas di depan.",
      tag: "TANPA BIAYA TERSEMBUNYI",
      accent: "#34d399",
    },
    {
      num: "03",
      icon: "⚙️",
      title: "Eksekusi Cepat & Terukur",
      desc: "Pengerjaan oleh teknisi & developer ahli dengan laporan progres berkala.",
      tag: "STANDAR INDUSTRI",
      accent: "#60a5fa",
    },
    {
      num: "04",
      icon: "🛡️",
      title: "QC, Serah Terima & Garansi",
      desc: "Pengujian menyeluruh, training penggunaan, serta jaminan support purna jual.",
      tag: "BERGARANSI RESMI",
      accent: "#a78bfa",
    },
  ];

  const guarantees = [
    {
      icon: "⚡",
      metric: "< 5 Menit",
      title: "Respon Cepat & Tanggap",
      desc: "Tim teknis siap merespon konsultasi & kendala darurat dengan sigap.",
      color: "#38bdf8",
    },
    {
      icon: "🔒",
      metric: "100% Aman",
      title: "Garansi Layanan & Data",
      desc: "Kerahasiaan data bisnis terjaga disertai garansi penuh pasca-pengerjaan.",
      color: "#34d399",
    },
    {
      icon: "🏆",
      metric: "98% Puas",
      title: "Partner IT Jangka Panjang",
      desc: "Dipercaya puluhan UMKM, perusahaan & instansi untuk solusi IT berkelanjutan.",
      color: "#a78bfa",
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
      <SfxCue frame={STEP_1_FRAME} sfx="pop-plop" volume={0.36} />
      <SfxCue frame={STEP_2_FRAME} sfx="pop-plop" volume={0.36} />
      <SfxCue frame={STEP_3_FRAME} sfx="pop-plop" volume={0.36} />
      <SfxCue frame={STEP_4_FRAME} sfx="confirm-chime" volume={0.42} />
      <SfxCue frame={CTA_HOVER_FRAME} sfx="hover-rollover" volume={0.25} />
      <SfxCue frame={CTA_CLICK_FRAME} sfx="click" volume={0.55} />
      <SfxCue frame={CTA_CLICK_FRAME + 2} sfx="confirm-glass" volume={0.45} />

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
        text="🛡️ Alur Kerja Terukur, Bergaransi & Terpercaya"
        startFrame={4}
      />

      {/* Camera Rig */}
      <CameraRig
        keyframes={[
          { frame: 0, scale: 1.06, x: 0, y: 0, rotateX: 0, rotateY: 0 },
          {
            frame: STEP_1_FRAME,
            scale: 1.15,
            x: 50,
            y: 110,
            rotateX: 1.2,
            rotateY: -1.2,
          },
          {
            frame: STEP_2_FRAME,
            scale: 1.15,
            x: -50,
            y: 110,
            rotateX: 1.2,
            rotateY: 1.2,
          },
          {
            frame: STEP_3_FRAME,
            scale: 1.15,
            x: 50,
            y: 25,
            rotateX: 1.2,
            rotateY: -1,
          },
          {
            frame: STEP_4_FRAME,
            scale: 1.15,
            x: -50,
            y: 25,
            rotateX: 1.2,
            rotateY: 1,
          },
          {
            frame: CTA_HOVER_FRAME,
            scale: 1.12,
            x: -35,
            y: -90,
            rotateX: 0.8,
            rotateY: 0.5,
          },
          {
            frame: 420,
            scale: 1.04,
            x: 0,
            y: -30,
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
            url="https://moheftech.com/#tentang"
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
                    "radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.16), transparent 55%), radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.12), transparent 45%)",
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
                      fontWeight: 600,
                      color: "#e8edf5",
                      paddingBottom: 4,
                      borderBottom: "2px solid #3b82f6",
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

              {/* ============ TENTANG & WORKFLOW CONTENT ============ */}
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <section
                  style={{
                    padding: "36px 42px 44px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 26,
                    transform: `translate3d(0, ${enterScrollY}px, 0)`,
                  }}
                >
                  {/* Section Title Header */}
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
                        <span>✨</span>
                        <span>Standar Layanan Mohef Tech</span>
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
                        Alur Kerja{" "}
                        <span
                          style={{
                            background:
                              "linear-gradient(135deg, #3b82f6, #06b6d4)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          Jelas & Bergaransi
                        </span>
                      </h2>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 18px",
                        borderRadius: 9999,
                        backgroundColor: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(52, 211, 153, 0.35)",
                      }}
                    >
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          backgroundColor: "#34d399",
                          boxShadow: "0 0 10px #34d399",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#34d399",
                        }}
                      >
                        SLA & Garansi Resmi
                      </span>
                    </div>
                  </div>

                  {/* Animated Progress Track Bar */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#94a3b8",
                      }}
                    >
                      <span>TAHAPAN PENGERJAAN TERSTANDARISASI</span>
                      <span style={{ color: "#38bdf8" }}>
                        {Math.round(progressLineRatio * 100)}% Terverifikasi
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        borderRadius: 9999,
                        backgroundColor: "rgba(15, 34, 64, 0.9)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${progressLineRatio * 100}%`,
                          height: "100%",
                          borderRadius: 9999,
                          background:
                            "linear-gradient(90deg, #3b82f6, #06b6d4, #34d399)",
                          boxShadow: "0 0 16px rgba(6, 182, 212, 0.6)",
                        }}
                      />
                    </div>
                  </div>

                  {/* 4-Step Workflow Grid (2x2) */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 18,
                    }}
                  >
                    {workflowSteps.map((step, idx) => {
                      const isStepActive = activeStep === idx;
                      const isStepPassed = activeStep >= idx;
                      const stepSpring = spring({
                        frame: isStepPassed
                          ? frame - (STEP_1_FRAME + idx * 60)
                          : 0,
                        fps,
                        config: { damping: 16, stiffness: 150, mass: 0.7 },
                      });

                      return (
                        <div
                          key={step.num}
                          style={{
                            padding: "24px 24px",
                            borderRadius: 20,
                            backgroundColor: isStepActive
                              ? "rgba(20, 50, 92, 0.95)"
                              : isStepPassed
                                ? "rgba(15, 36, 68, 0.85)"
                                : "rgba(15, 34, 64, 0.62)",
                            border: isStepActive
                              ? `2px solid ${step.accent}`
                              : isStepPassed
                                ? "1.5px solid rgba(56, 189, 248, 0.38)"
                                : "1px solid rgba(59, 130, 246, 0.18)",
                            boxShadow: isStepActive
                              ? "0 20px 44px rgba(0, 0, 0, 0.55), 0 0 32px rgba(56, 189, 248, 0.25)"
                              : "0 10px 24px rgba(0, 0, 0, 0.25)",
                            transform: `translateY(${interpolate(stepSpring, [0, 1], [0, -6])}px) scale(${isStepActive ? 1.02 : 1})`,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 14,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 12,
                                  background: isStepPassed
                                    ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                                    : "rgba(59, 130, 246, 0.16)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 22,
                                  boxShadow: isStepPassed
                                    ? "0 0 18px rgba(59, 130, 246, 0.4)"
                                    : "none",
                                }}
                              >
                                {step.icon}
                              </div>
                              <span
                                style={{
                                  fontSize: 26,
                                  fontWeight: 900,
                                  color: isStepPassed
                                    ? step.accent
                                    : "rgba(148, 163, 184, 0.45)",
                                  letterSpacing: "-0.03em",
                                }}
                              >
                                {step.num}
                              </span>
                            </div>

                            <span
                              style={{
                                padding: "5px 12px",
                                borderRadius: 9999,
                                backgroundColor: "rgba(59, 130, 246, 0.16)",
                                border: `1px solid ${step.accent}55`,
                                color: step.accent,
                                fontSize: 10.5,
                                fontWeight: 800,
                                letterSpacing: "0.05em",
                              }}
                            >
                              {step.tag}
                            </span>
                          </div>

                          <div>
                            <h3
                              style={{
                                margin: "0 0 6px",
                                fontSize: 20,
                                fontWeight: 800,
                                color: "#f8fafc",
                              }}
                            >
                              {step.title}
                            </h3>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 14,
                                color: "#94a3b8",
                                lineHeight: 1.5,
                              }}
                            >
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 3 Pillars of Trust & Guarantee */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 16,
                    }}
                  >
                    {guarantees.map((g) => (
                      <div
                        key={g.title}
                        style={{
                          padding: "20px 20px",
                          borderRadius: 18,
                          backgroundColor: "rgba(15, 34, 64, 0.65)",
                          border: "1px solid rgba(59, 130, 246, 0.22)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: 24 }}>{g.icon}</span>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: g.color,
                            }}
                          >
                            {g.metric}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "#e8edf5",
                          }}
                        >
                          {g.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12.5,
                            color: "#94a3b8",
                            lineHeight: 1.45,
                          }}
                        >
                          {g.desc}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Social Proof + Conversion Banner (Button Center X = 830, Center Y = 1197) */}
                  <div
                    style={{
                      padding: "24px 28px",
                      borderRadius: 22,
                      background:
                        "linear-gradient(135deg, rgba(30, 58, 138, 0.55), rgba(6, 78, 99, 0.55))",
                      border: "1.5px solid rgba(56, 189, 248, 0.42)",
                      boxShadow: "0 18px 40px rgba(0, 0, 0, 0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 20,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ color: "#fbbf24", fontSize: 16 }}>
                          ★★★★★
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#cbd5e1",
                          }}
                        >
                          4.9/5 Rating Kepuasan Klien Bisnis & Personal
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 21,
                          fontWeight: 800,
                          color: "#ffffff",
                        }}
                      >
                        Butuh Solusi Cepat atau Diskusi Proyek Baru?
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "14px 26px",
                        borderRadius: 9999,
                        background: isClickedCta
                          ? "linear-gradient(135deg, #2563eb, #0891b2)"
                          : "linear-gradient(135deg, #3b82f6, #06b6d4)",
                        color: "#ffffff",
                        fontSize: 15,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        transform: `scale(${ctaScale})`,
                        border: isClickedCta
                          ? "2px solid #67e8f9"
                          : "1px solid rgba(255, 255, 255, 0.25)",
                        boxShadow: isClickedCta
                          ? "0 0 0 6px rgba(6, 182, 212, 0.35), 0 14px 32px rgba(59, 130, 246, 0.65)"
                          : "0 10px 24px rgba(59, 130, 246, 0.4)",
                      }}
                    >
                      Hubungi Tim Kami →
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </DeviceFrame>
        </div>

        {/* Simulated Cursor: Sweeps 4 workflow cards then clicks Hubungi Tim Kami at (830, 1197) */}
        <SimulatedCursor
          path={[
            { frame: 0, x: 540, y: 1200 },
            { frame: STEP_1_FRAME, x: 310, y: 660 },
            { frame: STEP_2_FRAME, x: 750, y: 660 },
            { frame: STEP_3_FRAME, x: 310, y: 865 },
            { frame: STEP_4_FRAME, x: 750, y: 865 },
            { frame: STEP_4_FRAME + 25, x: 750, y: 865 },
            { frame: CTA_HOVER_FRAME, x: 830, y: 1197 },
            { frame: CTA_CLICK_FRAME, x: 830, y: 1197, click: true },
          ]}
        />
      </CameraRig>
    </AbsoluteFill>
  );
};
