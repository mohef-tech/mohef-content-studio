import React from "react";

export interface DeviceFrameProps {
  variant: "browser" | "mobile";
  url?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  variant,
  url = "https://mohef.studio",
  children,
  className = "",
  style,
}) => {
  if (variant === "mobile") {
    return (
      <div
        className={`relative mx-auto flex flex-col overflow-hidden rounded-[44px] border-[8px] border-neutral-800 bg-neutral-950 shadow-2xl ${className}`}
        style={{
          position: "relative",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 44,
          border: "8px solid #1e293b",
          backgroundColor: "#060c18",
          boxShadow:
            "0 30px 80px rgba(0, 0, 0, 0.65), 0 0 40px rgba(59, 130, 246, 0.15)",
          width: 380,
          height: 780,
          ...style,
        }}
      >
        <div
          className="relative z-20 flex h-9 shrink-0 items-center justify-center bg-neutral-950 px-6 pt-2"
          style={{
            position: "relative",
            zIndex: 20,
            display: "flex",
            height: 36,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#060c18",
            padding: "8px 24px 0",
          }}
        >
          <div
            className="h-5 w-28 rounded-full bg-black ring-1 ring-neutral-800"
            style={{
              height: 20,
              width: 112,
              borderRadius: 9999,
              backgroundColor: "#000000",
              border: "1px solid #1e293b",
            }}
          />
        </div>

        <div
          className="relative flex-1 overflow-hidden bg-neutral-900"
          style={{
            position: "relative",
            flex: 1,
            overflow: "hidden",
            backgroundColor: "#060c18",
          }}
        >
          {children}
        </div>

        <div
          className="flex h-6 shrink-0 items-center justify-center bg-neutral-950"
          style={{
            display: "flex",
            height: 24,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#060c18",
          }}
        >
          <div
            className="h-1 w-32 rounded-full bg-neutral-600"
            style={{
              height: 4,
              width: 128,
              borderRadius: 9999,
              backgroundColor: "#475569",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 24,
        border: "1px solid rgba(59, 130, 246, 0.28)",
        backgroundColor: "#060c18",
        boxShadow:
          "0 32px 80px rgba(0, 0, 0, 0.7), 0 0 60px rgba(59, 130, 246, 0.14)",
        ...style,
      }}
    >
      <div
        className="flex h-12 shrink-0 items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-4"
        style={{
          display: "flex",
          height: 52,
          flexShrink: 0,
          alignItems: "center",
          gap: 16,
          borderBottom: "1px solid rgba(59, 130, 246, 0.18)",
          backgroundColor: "#0b1528",
          padding: "0 20px",
        }}
      >
        <div
          className="flex items-center gap-2"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <span
            className="h-3 w-3 rounded-full bg-[#FF5F56]"
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              backgroundColor: "#FF5F56",
              display: "inline-block",
            }}
          />
          <span
            className="h-3 w-3 rounded-full bg-[#FFBD2E]"
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              backgroundColor: "#FFBD2E",
              display: "inline-block",
            }}
          />
          <span
            className="h-3 w-3 rounded-full bg-[#27C93F]"
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              backgroundColor: "#27C93F",
              display: "inline-block",
            }}
          />
        </div>

        <div
          className="mx-auto flex h-7 w-full max-w-md items-center justify-center gap-2 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-xs text-neutral-400"
          style={{
            margin: "0 auto",
            display: "flex",
            height: 32,
            width: "100%",
            maxWidth: 420,
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 10,
            border: "1px solid rgba(59, 130, 246, 0.2)",
            backgroundColor: "#060c18",
            padding: "0 14px",
            fontSize: 13,
            color: "#94a3b8",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-500"
            style={{ color: "#3b82f6", flexShrink: 0 }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span
            className="truncate font-mono"
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {url}
          </span>
        </div>

        <div className="w-14" style={{ width: 56 }} />
      </div>

      <div
        className="relative flex-1 overflow-hidden bg-neutral-950"
        style={{
          position: "relative",
          flex: 1,
          overflow: "hidden",
          backgroundColor: "#060c18",
        }}
      >
        {children}
      </div>
    </div>
  );
};
