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

const MOVE_START_FRAME = 50;
const HOVER_FRAME = 135;
const CLICK_FRAME = 165;
const PRE_SCROLL_START = 192;

export const Scene1Home: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introProgress = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 130,
      mass: 0.8,
    },
  });

  // Immediate pre-scroll after click so there is zero dead pause before Scene 2
  const postClickScrollY = interpolate(
    frame,
    [PRE_SCROLL_START, 240],
    [0, -260],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    }
  );

  const floatOffset = Math.sin(frame * 0.09) * 6;

  const isHoveringCta = frame >= HOVER_FRAME;
  const isClicked = frame >= CLICK_FRAME;

  const ctaPressScale =
    frame >= CLICK_FRAME && frame <= CLICK_FRAME + 16
      ? interpolate(
          frame - CLICK_FRAME,
          [0, 4, 11, 16],
          [1, 0.91, 1.05, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        )
      : isHoveringCta
        ? 1.04
        : 1;

  const stats = [
    { number: "50+", label: "Proyek Selesai" },
    { number: "5+", label: "Tahun Pengalaman" },
    { number: "98%", label: "Klien Puas" },
    { number: "24/7", label: "Dukungan Teknis" },
  ];

  const pillars = [
    { icon: "💻", title: "Hardware & Maintenance", tag: "Upgrade & Servis" },
    { icon: "🌐", title: "Web & Custom Software", tag: "Full-Stack Solution" },
    { icon: "🛡️", title: "Jaringan & Infrastruktur", tag: "Instalasi & Audit" },
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
      {/* Studio WAV SFX Cues */}
      <SfxCue frame={4} sfx="pop-in" volume={0.38} />
      <SfxCue frame={18} sfx="pop-plop" volume={0.34} />
      <SfxCue frame={55} sfx="transition-whoosh-soft" volume={0.32} />
      <SfxCue frame={HOVER_FRAME} sfx="hover-rollover" volume={0.28} />
      <SfxCue frame={CLICK_FRAME} sfx="click" volume={0.55} />
      <SfxCue frame={CLICK_FRAME + 2} sfx="confirm-glass" volume={0.42} />

      {/* Ambient background glow outside device frame */}
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

      {/* Floating Context Pill (Outside DeviceFrame) */}
      <FloatingContextPill
        text="🚀 Mohef Tech — Solusi IT Hardware & Software"
        startFrame={4}
      />

      {/* Camera Rig + Browser Device Frame */}
      <CameraRig
        keyframes={[
          { frame: 0, scale: 1, x: 0, y: 0, rotateX: 0, rotateY: 0 },
          {
            frame: MOVE_START_FRAME,
            scale: 1.02,
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
          },
          {
            frame: HOVER_FRAME,
            scale: 1.22,
            x: 85,
            y: 25,
            rotateX: 2,
            rotateY: -1.5,
          },
          {
            frame: CLICK_FRAME + 15,
            scale: 1.22,
            x: 85,
            y: 25,
            rotateX: 2,
            rotateY: -1.5,
          },
          {
            frame: 240,
            scale: 1.06,
            x: 0,
            y: -15,
            rotateX: 0.5,
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
            opacity: interpolate(introProgress, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(introProgress, [0, 1], [28, 0])}px)`,
          }}
        >
          <DeviceFrame
            variant="browser"
            url="https://moheftech.com"
            style={{ width: "100%", height: "100%" }}
          >
            {/* Internal Page Background */}
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
              {/* Subtle Tech Radial Mesh & Grid */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(circle at 50% 24%, rgba(59, 130, 246, 0.16), transparent 55%), radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.12), transparent 45%)",
                  pointerEvents: "none",
                }}
              />

              {/* ============ NAVBAR ============ */}
              <header
                style={{
                  position: "relative",
                  zIndex: 10,
                  height: 84,
                  flexShrink: 0,
                  padding: "0 40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(6, 12, 24, 0.88)",
                  borderBottom: "1px solid rgba(59, 130, 246, 0.16)",
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

                <nav
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 32,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#e8edf5",
                      position: "relative",
                      paddingBottom: 4,
                      borderBottom: "2px solid #3b82f6",
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
                      background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: 600,
                      boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    Kontak
                  </span>
                </nav>
              </header>

              {/* Scrollable wrapper for immediate post-click momentum */}
              <div
                style={{
                  transform: `translate3d(0, ${postClickScrollY}px, 0)`,
                  willChange: "transform",
                }}
              >
                {/* ============ HERO SECTION ============ */}
                <section
                  style={{
                    position: "relative",
                    zIndex: 5,
                    padding: "56px 48px 44px",
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
                      letterSpacing: "0.05em",
                      marginBottom: 28,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#06b6d4",
                        boxShadow: "0 0 10px #06b6d4",
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
                      boxShadow:
                        "0 0 44px rgba(59, 130, 246, 0.38), 0 0 80px rgba(6, 182, 212, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 28,
                      transform: `translateY(${floatOffset}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 18,
                        background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 38,
                        fontWeight: 900,
                        color: "#ffffff",
                        letterSpacing: "-0.04em",
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
                      letterSpacing: "-0.03em",
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
                      lineHeight: 1.3,
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

                  {/* CTA Buttons Row (Center Y in 1080x1920 canvas = 928, Left Button Center X = 396) */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 20,
                      height: 68,
                    }}
                  >
                    {/* Primary CTA: Lihat Layanan */}
                    <div
                      style={{
                        width: 268,
                        height: 64,
                        borderRadius: 9999,
                        background: isClicked
                          ? "linear-gradient(135deg, #2563eb, #0891b2)"
                          : "linear-gradient(135deg, #3b82f6, #06b6d4)",
                        color: "#ffffff",
                        fontSize: 19,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        transform: `scale(${ctaPressScale})`,
                        boxShadow: isClicked
                          ? "0 0 0 6px rgba(6, 182, 212, 0.35), 0 16px 36px rgba(59, 130, 246, 0.65)"
                          : isHoveringCta
                            ? "0 14px 34px rgba(59, 130, 246, 0.55), 0 0 24px rgba(6, 182, 212, 0.35)"
                            : "0 10px 28px rgba(59, 130, 246, 0.38)",
                        border: isClicked
                          ? "2px solid #67e8f9"
                          : "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <span>⚡</span>
                      <span>Lihat Layanan</span>
                    </div>

                    {/* Secondary CTA: Konsultasi Gratis */}
                    <div
                      style={{
                        width: 268,
                        height: 64,
                        borderRadius: 9999,
                        background: "linear-gradient(135deg, #25d366, #128c7e)",
                        color: "#ffffff",
                        fontSize: 19,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        boxShadow: "0 10px 26px rgba(37, 211, 102, 0.28)",
                      }}
                    >
                      <span>💬</span>
                      <span>Konsultasi Gratis</span>
                    </div>
                  </div>
                </section>

                {/* ============ STATS STRIP ============ */}
                <div
                  style={{
                    marginTop: 18,
                    borderTop: "1px solid rgba(59, 130, 246, 0.14)",
                    borderBottom: "1px solid rgba(59, 130, 246, 0.14)",
                    backgroundColor: "rgba(15, 34, 64, 0.45)",
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                  }}
                >
                  {stats.map((stat, idx) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: "24px 16px",
                        textAlign: "center",
                        borderRight:
                          idx < 3
                            ? "1px solid rgba(59, 130, 246, 0.12)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 34,
                          fontWeight: 800,
                          background:
                            "linear-gradient(135deg, #3b82f6, #06b6d4)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          marginBottom: 6,
                        }}
                      >
                        {stat.number}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#94a3b8",
                        }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ============ PILLAR HIGHLIGHTS PREVIEW ============ */}
                <div
                  style={{
                    padding: "36px 40px",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 20,
                  }}
                >
                  {pillars.map((pillar) => (
                    <div
                      key={pillar.title}
                      style={{
                        padding: "24px 22px",
                        borderRadius: 18,
                        backgroundColor: "rgba(15, 34, 64, 0.68)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontSize: 28 }}>{pillar.icon}</span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#60a5fa",
                            padding: "4px 10px",
                            borderRadius: 9999,
                            backgroundColor: "rgba(59, 130, 246, 0.14)",
                            border: "1px solid rgba(59, 130, 246, 0.28)",
                          }}
                        >
                          {pillar.tag}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "#e8edf5",
                          lineHeight: 1.35,
                        }}
                      >
                        {pillar.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DeviceFrame>
        </div>

        {/* Simulated Cursor: Arrives at (396, 928) on frame HOVER_FRAME, clicks at CLICK_FRAME */}
        <SimulatedCursor
          path={[
            { frame: 0, x: 820, y: 1420 },
            { frame: MOVE_START_FRAME, x: 820, y: 1420 },
            { frame: HOVER_FRAME, x: 396, y: 928 },
            { frame: CLICK_FRAME, x: 396, y: 928, click: true },
            { frame: 240, x: 396, y: 820 },
          ]}
        />
      </CameraRig>
    </AbsoluteFill>
  );
};
