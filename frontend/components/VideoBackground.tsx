"use client";

const VIDEO_URL =
  "https://res.cloudinary.com/df6oxyf0v/video/upload/v1779374421/WhatsApp_Video_2026-05-21_at_8.08.54_PM_tmwf8w.mp4";

export default function VideoBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {/* Layer 1: Fullscreen video */}
      <video
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 0,
        }}
      />

      {/* Layer 2: Base dark cinematic tint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "rgba(0, 2, 10, 0.72)",
        }}
      />

      {/* Layer 3: Bottom depth fade */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background:
            "linear-gradient(to top, rgba(0,0,10,0.92) 0%, transparent 40%)",
        }}
      />

      {/* Layer 4: Top edge vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          background:
            "linear-gradient(to bottom, rgba(0,0,8,0.6) 0%, transparent 18%)",
        }}
      />

      {/* Layer 5: Neon blue ambient tint to match theme */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          background:
            "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(0, 60, 180, 0.14) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
