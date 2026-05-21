"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  va: number;
}

interface HoloPanel {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  a: number;
  title: string;
  metric: string;
}

interface Pin {
  x: number;
  y: number;
  vy: number;
  phase: number;
  label: string;
}

const VIDEO_URL =
  "https://res.cloudinary.com/df6oxyf0v/video/upload/v1779374421/WhatsApp_Video_2026-05-21_at_8.08.54_PM_tmwf8w.mp4";

export default function CinematicHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let t = 0;

    // Mouse interactive coordinates
    const mouse = { x: 0, y: 0 };
    const mouseSmooth = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Floating particles
    const particles: Particle[] = Array.from({ length: 65 }, (_, idx) => {
      const isDust = idx % 2 === 0;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (isDust ? 0.04 : 0.12),
        vy: (Math.random() - 0.5) * (isDust ? 0.04 : 0.12),
        r: Math.random() * (isDust ? 0.6 : 1.5) + 0.3,
        a: Math.random(),
        va: (Math.random() - 0.5) * (isDust ? 0.002 : 0.004),
      };
    });

    // Holographic panels
    const panels: HoloPanel[] = [
      { x: 0.58, y: 0.22, w: 170, h: 95, vy: 0.0001, a: 0, title: "GEMINI MATCHING", metric: "99.4% CONFIDENCE" },
      { x: 0.76, y: 0.40, w: 140, h: 75, vy: -0.00008, a: 0.3, title: "SYS.SCAN", metric: "RESOLVED: 78ms" },
      { x: 0.59, y: 0.60, w: 130, h: 65, vy: 0.00009, a: 0.6, title: "NETWORK SECURE", metric: "NODE-A2 ACTIVE" },
    ];

    // Location pins
    const pins: Pin[] = [
      { x: 0.53, y: 0.29, vy: 0, phase: 0, label: "LHR-AIRPORT" },
      { x: 0.78, y: 0.22, vy: 0, phase: 1.2, label: "NYC-SUBWAY" },
      { x: 0.68, y: 0.56, vy: 0, phase: 2.4, label: "CA-MALL" },
      { x: 0.49, y: 0.51, vy: 0, phase: 0.8, label: "BERLIN-METRO" },
    ];

    // NOTE: drawBackground is now canvas-only ambient glows (no solid fill)
    // The video is the actual background behind the canvas.
    const drawAmbientGlows = () => {
      const breathe = 0.85 + Math.sin(t * 0.0008) * 0.15;

      // Top glowing ambient highlight
      const topGlowX = canvas.width * (0.65 + Math.sin(t * 0.0005) * 0.08) + mouseSmooth.x * 0.15;
      const topGlowY = canvas.height * (0.25 + Math.cos(t * 0.0003) * 0.04) + mouseSmooth.y * 0.15;
      const topGlow = ctx.createRadialGradient(topGlowX, topGlowY, 0, topGlowX, topGlowY, canvas.width * 0.45);
      topGlow.addColorStop(0, `rgba(0, 140, 255, ${0.12 * breathe})`);
      topGlow.addColorStop(0.6, `rgba(0, 70, 180, ${0.04 * breathe})`);
      topGlow.addColorStop(1, "transparent");
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bottom breathing glow
      const bottomGlowY = canvas.height * 0.82 + Math.sin(t * 0.0004) * 15 + mouseSmooth.y * 0.1;
      const bottomGlow = ctx.createRadialGradient(
        canvas.width * 0.7, bottomGlowY, 0,
        canvas.width * 0.7, bottomGlowY, canvas.width * 0.35
      );
      bottomGlow.addColorStop(0, `rgba(0, 80, 180, ${0.07 * breathe})`);
      bottomGlow.addColorStop(0.5, `rgba(0, 40, 100, ${0.02 * breathe})`);
      bottomGlow.addColorStop(1, "transparent");
      ctx.fillStyle = bottomGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Left side purple accent glow
      const leftGlow = ctx.createRadialGradient(
        canvas.width * 0.08 + mouseSmooth.x * 0.1, canvas.height * 0.5, 0,
        canvas.width * 0.08, canvas.height * 0.5, canvas.width * 0.3
      );
      leftGlow.addColorStop(0, `rgba(80, 0, 200, ${0.06 * breathe})`);
      leftGlow.addColorStop(1, "transparent");
      ctx.fillStyle = leftGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawVolumetricSpotlight = () => {
      ctx.save();
      const breathe = 0.85 + Math.sin(t * 0.0007) * 0.15;
      const targetX = canvas.width * 0.675 + mouseSmooth.x * 0.4;
      const targetY = canvas.height * 0.68 + mouseSmooth.y * 0.4;

      const beamGlow = ctx.createLinearGradient(canvas.width * 0.85, -100, targetX, targetY);
      beamGlow.addColorStop(0, `rgba(0, 160, 255, ${0.2 * breathe})`);
      beamGlow.addColorStop(0.5, `rgba(0, 100, 220, ${0.08 * breathe})`);
      beamGlow.addColorStop(1, "rgba(0, 40, 150, 0)");

      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.72, -100);
      ctx.lineTo(canvas.width * 0.98, -100);
      ctx.lineTo(targetX + 220, targetY + 50);
      ctx.lineTo(targetX - 220, targetY + 50);
      ctx.closePath();
      ctx.fillStyle = beamGlow;
      ctx.fill();
      ctx.restore();
    };

    const drawAbstractCurves = () => {
      ctx.save();
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      const offset1 = Math.sin(t * 0.0002) * 35;
      ctx.moveTo(canvas.width * 0.35 + mouseSmooth.x * 0.1, -100);
      ctx.quadraticCurveTo(
        canvas.width * 0.55 + offset1 + mouseSmooth.x * 0.15,
        canvas.height * 0.5,
        canvas.width * 0.3 + mouseSmooth.x * 0.1,
        canvas.height + 100
      );
      const g1 = ctx.createLinearGradient(0, 0, 0, canvas.height);
      g1.addColorStop(0, "rgba(0, 120, 255, 0.0)");
      g1.addColorStop(0.5, "rgba(0, 160, 255, 0.055)");
      g1.addColorStop(1, "rgba(0, 80, 200, 0.0)");
      ctx.strokeStyle = g1;
      ctx.stroke();

      ctx.beginPath();
      const offset2 = Math.cos(t * 0.00025) * 45;
      ctx.moveTo(canvas.width * 0.9 + mouseSmooth.x * 0.08, -100);
      ctx.quadraticCurveTo(
        canvas.width * 0.68 + offset2 + mouseSmooth.x * 0.12,
        canvas.height * 0.45,
        canvas.width * 0.85 + mouseSmooth.x * 0.08,
        canvas.height + 100
      );
      const g2 = ctx.createLinearGradient(0, 0, 0, canvas.height);
      g2.addColorStop(0, "rgba(0, 80, 200, 0.0)");
      g2.addColorStop(0.4, "rgba(0, 180, 255, 0.04)");
      g2.addColorStop(1, "rgba(0, 120, 255, 0.0)");
      ctx.strokeStyle = g2;
      ctx.stroke();

      ctx.restore();
    };

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(0, 100, 255, 0.018)";
      ctx.lineWidth = 1;
      const gs = 60;
      const ox = mouseSmooth.x * 0.05;
      const oy = mouseSmooth.y * 0.05;

      for (let x = ox % gs; x < canvas.width; x += gs) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = oy % gs; y < canvas.height; y += gs) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const drawFog = () => {
      for (let i = 0; i < 3; i++) {
        const rg = ctx.createRadialGradient(
          canvas.width * (0.45 + i * 0.15) + Math.sin(t * 0.0003 + i) * 12,
          canvas.height * 0.9, 0,
          canvas.width * (0.45 + i * 0.15), canvas.height * 0.9, canvas.width * 0.25
        );
        rg.addColorStop(0, `rgba(0, 30, 80, ${0.055 - i * 0.009})`);
        rg.addColorStop(1, "transparent");
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    const drawPlatform = () => {
      const cx = canvas.width * 0.675 + mouseSmooth.x * 0.4;
      const cy = canvas.height * 0.72 + mouseSmooth.y * 0.4;
      const rx = 180;
      const ry = 22;

      const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx * 1.4);
      pg.addColorStop(0, `rgba(0, 120, 255, ${0.14 + Math.sin(t * 0.001) * 0.02})`);
      pg.addColorStop(1, "transparent");
      ctx.fillStyle = pg;
      ctx.fillRect(cx - rx * 2, cy - ry * 4, rx * 4, ry * 8);

      [[rx, ry], [rx * 0.78, ry * 0.75], [rx * 0.52, ry * 0.55]].forEach(([r, ry2], i) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy - i * 11, r, ry2, 0, 0, Math.PI * 2);
        const g = ctx.createLinearGradient(cx - r, cy - i * 11 - ry2, cx + r, cy - i * 11 + ry2);
        g.addColorStop(0, "#191c22");
        g.addColorStop(0.5, "#0b0d10");
        g.addColorStop(1, "#06070a");
        ctx.fillStyle = g;
        ctx.fill();

        ctx.strokeStyle = `rgba(0, 150, 255, ${0.28 - i * 0.07})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (i === 2) {
          ctx.beginPath();
          ctx.ellipse(cx - 30, cy - i * 11 - 2, r * 0.45, ry2 * 0.45, -0.2, 0, Math.PI * 2);
          const glare = ctx.createRadialGradient(cx - 30, cy - i * 11 - 2, 0, cx - 30, cy - i * 11 - 2, r * 0.45);
          glare.addColorStop(0, "rgba(255, 255, 255, 0.04)");
          glare.addColorStop(1, "transparent");
          ctx.fillStyle = glare;
          ctx.fill();
        }
      });
    };

    const drawBackpack = () => {
      const float = Math.sin(t * 0.0008) * 6;
      const cx = canvas.width * 0.675 + mouseSmooth.x * 0.42;
      const cy = canvas.height * 0.475 + float + mouseSmooth.y * 0.42;

      ctx.save();
      ctx.translate(cx, cy);

      const shadowScale = 1 - float / 25;
      const sg = ctx.createRadialGradient(0, 95 - float, 0, 0, 95 - float, 80 * shadowScale);
      sg.addColorStop(0, `rgba(0, 0, 0, ${0.4 * shadowScale})`);
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(-90, 65 - float, 180, 60);

      ctx.beginPath();
      ctx.ellipse(0, -74, 18, 12, 0, Math.PI, 0);
      ctx.strokeStyle = "#171b22";
      ctx.lineWidth = 9;
      ctx.stroke();
      ctx.strokeStyle = "rgba(0, 150, 255, 0.2)";
      ctx.lineWidth = 7;
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(-52, -70, 104, 130, 18);
      const bg = ctx.createLinearGradient(-52, -70, 52, 60);
      bg.addColorStop(0, "#1f242e");
      bg.addColorStop(0.35, "#12151b");
      bg.addColorStop(1, "#07090b");
      ctx.fillStyle = bg;
      ctx.fill();

      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.roundRect(-49, -67, 98, 124, 15);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.roundRect(-52, -70, 104, 130, 18);
      const rl = ctx.createLinearGradient(-52, 0, 52, 0);
      rl.addColorStop(0, "rgba(0, 160, 255, 0.22)");
      rl.addColorStop(0.5, "transparent");
      rl.addColorStop(1, "rgba(0, 100, 255, 0.15)");
      ctx.strokeStyle = rl;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      [-56, 44].forEach((sx) => {
        ctx.beginPath();
        ctx.roundRect(sx, -10, 12, 45, 3);
        ctx.fillStyle = "#0c0e12";
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 140, 255, 0.15)";
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.roundRect(-36, -18, 72, 58, 12);
      ctx.fillStyle = "#090c0f";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 120, 255, 0.2)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.save();
      ctx.strokeStyle = "rgba(0, 160, 255, 0.1)";
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.roundRect(-33, -15, 66, 52, 9);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.roundRect(-6, -23, 12, 5, 1.5);
      ctx.fillStyle = "#2a313d";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 180, 255, 0.4)";
      ctx.stroke();

      [-28, 28].forEach((sx) => {
        ctx.beginPath();
        ctx.moveTo(sx, -70);
        ctx.quadraticCurveTo(sx > 0 ? 38 : -38, -92, sx, -102);
        ctx.strokeStyle = "#161920";
        ctx.lineWidth = 13;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.strokeStyle = "rgba(0, 120, 255, 0.15)";
        ctx.lineWidth = 11;
        ctx.stroke();
      });

      const ta = Math.sin(t * 0.0006) * 0.08;
      ctx.save();
      ctx.translate(22, -50);
      ctx.rotate(ta);

      ctx.beginPath();
      ctx.moveTo(-2, -30);
      ctx.lineTo(-2, -24);
      ctx.strokeStyle = "rgba(0, 160, 255, 0.4)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(-18, -24, 36, 44, 6);
      ctx.fillStyle = "#07090c";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 180, 255, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = "rgba(0, 160, 255, 0.25)";
      ctx.fillRect(-12, -18, 8, 1.5);
      ctx.fillRect(-12, -14, 24, 0.85);

      ctx.fillStyle = "#a2dbff";
      ctx.font = "bold 6.5px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("LOST &", 0, -3);
      ctx.fillText("FOUND", 0, 7);

      ctx.fillStyle = "rgba(0, 180, 255, 0.4)";
      for (let bi = 0; bi < 5; bi++) {
        ctx.fillRect(-10 + bi * 4, 14, bi % 2 === 0 ? 2 : 1, 4);
      }
      ctx.restore();

      const aura = ctx.createRadialGradient(0, 0, 45, 0, 0, 115);
      aura.addColorStop(0, "transparent");
      aura.addColorStop(1, `rgba(0, 100, 255, ${0.06 + Math.sin(t * 0.001) * 0.025})`);
      ctx.fillStyle = aura;
      ctx.fillRect(-120, -120, 240, 240);

      ctx.restore();
    };

    const drawPhone = () => {
      const float = Math.sin(t * 0.001 + 1) * 5;
      const cx = canvas.width * 0.745 + mouseSmooth.x * 0.45;
      const cy = canvas.height * 0.57 + float + mouseSmooth.y * 0.45;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.04);

      ctx.beginPath();
      ctx.roundRect(-16, -42, 32, 68, 8);
      const g = ctx.createLinearGradient(-16, -42, 16, 26);
      g.addColorStop(0, "#222733");
      g.addColorStop(1, "#0c0d13");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 150, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#2c3342";
      ctx.fillRect(-18, -25, 2, 8);
      ctx.fillRect(-18, -14, 2, 8);

      ctx.beginPath();
      ctx.roundRect(-13.5, -39.5, 27, 63, 6);
      const sg = ctx.createLinearGradient(-13.5, -39.5, 13.5, 23.5);
      sg.addColorStop(0, "rgba(0, 95, 200, 0.55)");
      sg.addColorStop(0.5, "rgba(0, 45, 110, 0.35)");
      sg.addColorStop(1, "rgba(0, 15, 50, 0.2)");
      ctx.fillStyle = sg;
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(-5, -36, 10, 2.8, 1.4);
      ctx.fillStyle = "#06070a";
      ctx.fill();

      ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8, 10);
      ctx.quadraticCurveTo(-2, -5, 5, 2);
      ctx.lineTo(8, -12);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(8, -12, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      const sweep = Math.sin(t * 0.008) * 45;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(-13.5, -39.5, 27, 63, 6);
      ctx.clip();
      ctx.beginPath();
      ctx.moveTo(-30 + sweep, -50);
      ctx.lineTo(-10 + sweep, -50);
      ctx.lineTo(30 + sweep, 40);
      ctx.lineTo(10 + sweep, 40);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
      ctx.fill();
      ctx.restore();

      ctx.restore();
    };

    const drawWallet = () => {
      const float = Math.sin(t * 0.00075 + 2) * 4;
      const cx = canvas.width * 0.61 + mouseSmooth.x * 0.43;
      const cy = canvas.height * 0.625 + float + mouseSmooth.y * 0.43;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.06);

      ctx.beginPath();
      ctx.roundRect(-32, -15, 64, 30, 6);
      const g = ctx.createLinearGradient(-32, -15, 32, 15);
      g.addColorStop(0, "#1f2128");
      g.addColorStop(1, "#0d0e12");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 130, 255, 0.28)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 0.85;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.roundRect(-29, -12, 58, 24, 4);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(-32, -1);
      ctx.lineTo(32, -1);
      ctx.strokeStyle = "rgba(0, 110, 210, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-18, -8);
      ctx.lineTo(-14, -8);
      ctx.lineTo(-16, -11);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 180, 255, 0.55)";
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(10, -9, 17, 15, 1.5);
      ctx.fillStyle = "rgba(0, 160, 255, 0.14)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 160, 255, 0.35)";
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(15, -6, 4, 3);

      ctx.restore();
    };

    const drawKeys = () => {
      const float = Math.sin(t * 0.0009 + 3) * 4;
      const cx = canvas.width * 0.645 + mouseSmooth.x * 0.44;
      const cy = canvas.height * 0.59 + float + mouseSmooth.y * 0.44;

      ctx.save();
      ctx.translate(cx, cy);

      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 150, 255, 0.5)";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      [-0.4, 0.2, 0.8].forEach((a, i) => {
        ctx.save();
        ctx.rotate(a + Math.sin(t * 0.0005 + i) * 0.02);

        if (i === 1) {
          ctx.beginPath();
          ctx.roundRect(8, -8, 22, 16, 4);
          ctx.fillStyle = "#11141a";
          ctx.fill();
          ctx.strokeStyle = "rgba(0, 160, 255, 0.35)";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "rgba(0, 200, 255, 0.35)";
          ctx.fillRect(13, -4, 4, 3);
          ctx.fillRect(20, -4, 4, 3);

          ctx.beginPath();
          ctx.arc(26, 4, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 255, ${0.4 + Math.sin(t * 0.003) * 0.3})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(36, 0);
          ctx.strokeStyle = `rgba(0, ${110 + i * 20}, 255, 0.45)`;
          ctx.lineWidth = 2.8;
          ctx.lineCap = "round";
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(24, 1.4);
          ctx.lineTo(24, 4.5);
          ctx.moveTo(28, 1.4);
          ctx.lineTo(28, 5.5);
          ctx.moveTo(32, 1.4);
          ctx.lineTo(32, 4);
          ctx.strokeStyle = `rgba(0, ${110 + i * 20}, 255, 0.45)`;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          ctx.beginPath();
          ctx.roundRect(31, -5, 10, 10, 2);
          ctx.strokeStyle = "rgba(0, 140, 255, 0.35)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.restore();
      });
      ctx.restore();
    };

    const drawIDCard = () => {
      const float = Math.sin(t * 0.00085 + 4) * 5;
      const cx = canvas.width * 0.685 + mouseSmooth.x * 0.46;
      const cy = canvas.height * 0.665 + float + mouseSmooth.y * 0.46;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.12 + Math.sin(t * 0.0005) * 0.02);

      const sg = ctx.createRadialGradient(0, 22 - float, 0, 0, 22 - float, 28);
      sg.addColorStop(0, "rgba(0,0,0,0.4)");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(-22, 12 - float, 44, 15);

      ctx.beginPath();
      ctx.roundRect(-22, -14, 44, 28, 4);
      const g = ctx.createLinearGradient(-22, -14, 22, 14);
      g.addColorStop(0, "#1f2229");
      g.addColorStop(0.5, "#121417");
      g.addColorStop(1, "#0d0f11");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 180, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(-6, -12, 12, 1.8, 0.8);
      ctx.fillStyle = "#0c0d10";
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(-22, -14, 44, 5, [4, 4, 0, 0]);
      ctx.fillStyle = "rgba(0, 120, 255, 0.38)";
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(-16, -4, 9, 11, 1);
      ctx.fillStyle = "#151820";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 140, 255, 0.25)";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-11.5, -1, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 190, 255, 0.35)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-11.5, 4.5, 3.5, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = "rgba(0, 160, 255, 0.28)";
      ctx.fillRect(-3, -4, 16, 1.2);
      ctx.fillRect(-3, 0, 12, 1.2);
      ctx.fillRect(-3, 4, 9, 1.2);

      ctx.beginPath();
      ctx.roundRect(11.5, 6.5, 7, 6, 1.5);
      const badgeGlow = ctx.createLinearGradient(11.5, 6.5, 18.5, 12.5);
      badgeGlow.addColorStop(0, `hsla(${(t * 0.08) % 360}, 90%, 65%, 0.6)`);
      badgeGlow.addColorStop(1, `hsla(${((t * 0.08) + 120) % 360}, 90%, 45%, 0.4)`);
      ctx.fillStyle = badgeGlow;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      for (let bi = 0; bi < 6; bi++) {
        ctx.fillRect(-18 + bi * 2.5, 9, bi % 2 === 0 ? 1 : 0.5, 2.5);
      }

      ctx.restore();
    };

    const drawWatch = () => {
      const float = Math.sin(t * 0.0011 + 4.5) * 6;
      const cx = canvas.width * 0.725 + mouseSmooth.x * 0.44;
      const cy = canvas.height * 0.63 + float + mouseSmooth.y * 0.44;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.08 + Math.sin(t * 0.0006) * 0.02);

      const sg = ctx.createRadialGradient(0, 20 - float, 0, 0, 20 - float, 24);
      sg.addColorStop(0, "rgba(0,0,0,0.35)");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(-15, 12 - float, 30, 12);

      ctx.beginPath();
      ctx.roundRect(-8, -24, 16, 48, 4);
      ctx.fillStyle = "#14171d";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 140, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 0.5;
      for (let sy = -20; sy < 24; sy += 4) {
        ctx.beginPath();
        ctx.moveTo(-7, sy);
        ctx.lineTo(7, sy);
        ctx.stroke();
      }
      ctx.restore();

      ctx.beginPath();
      ctx.roundRect(-13, -16, 26, 32, 6);
      const g = ctx.createLinearGradient(-13, -16, 13, 16);
      g.addColorStop(0, "#232630");
      g.addColorStop(0.5, "#15171e");
      g.addColorStop(1, "#0a0c10");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 170, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#2c313d";
      ctx.fillRect(13, -4, 2, 7);

      ctx.beginPath();
      ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
      const screenGlow = ctx.createRadialGradient(-2, -2, 0, 0, 0, 9.5);
      screenGlow.addColorStop(0, "rgba(0, 190, 255, 0.65)");
      screenGlow.addColorStop(1, "rgba(0, 60, 160, 0.4)");
      ctx.fillStyle = screenGlow;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 255, 255, 0.45)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-6, 2);
      ctx.lineTo(-3, 2);
      ctx.lineTo(-1, -3);
      ctx.lineTo(1, 4);
      ctx.lineTo(3, 2);
      ctx.lineTo(6, 2);
      ctx.stroke();

      ctx.restore();
    };

    const drawHoloPanels = () => {
      panels.forEach((p, i) => {
        const t2 = t * 0.0006;
        const y = canvas.height * p.y + Math.sin(t2 + p.a) * 12 + mouseSmooth.y * 0.65;
        const x = canvas.width * p.x + mouseSmooth.x * 0.65;
        const alpha = 0.46 + Math.sin(t2 * 1.5 + i) * 0.08;

        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.roundRect(x, y, p.w, p.h, 10);
        const g = ctx.createLinearGradient(x, y, x + p.w, y + p.h);
        g.addColorStop(0, "rgba(0, 70, 160, 0.18)");
        g.addColorStop(1, "rgba(0, 25, 90, 0.08)");
        ctx.fillStyle = g;
        ctx.fill();

        ctx.strokeStyle = `rgba(0, 170, 255, ${0.38 + Math.sin(t2 + i) * 0.08})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.strokeStyle = "rgba(0, 230, 255, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.lineTo(x, y); ctx.lineTo(x, y + 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + p.w - 8, y + p.h); ctx.lineTo(x + p.w, y + p.h); ctx.lineTo(x + p.w, y + p.h - 8); ctx.stroke();

        ctx.fillStyle = "rgba(165, 231, 255, 0.9)";
        ctx.font = "900 8.5px 'Inter', sans-serif";
        ctx.fillText(p.title, x + 12, y + 18);

        ctx.fillStyle = "rgba(0, 220, 255, 0.6)";
        ctx.font = "600 7px 'Inter', sans-serif";
        ctx.fillText(p.metric, x + 12, y + 30);

        ctx.strokeStyle = "rgba(0, 160, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 42);
        ctx.lineTo(x + p.w - 12, y + 42);
        ctx.stroke();

        const graphW = p.w - 24;
        const graphH = 20;
        const graphY = y + 52;
        ctx.strokeStyle = "rgba(0, 220, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = 0; gx < graphW; gx += 4) {
          const gy = Math.sin(t * 0.04 + gx * 0.2 + i * 4) * (graphH * 0.35);
          if (gx === 0) ctx.moveTo(x + 12 + gx, graphY + gy);
          else ctx.lineTo(x + 12 + gx, graphY + gy);
        }
        ctx.stroke();

        ctx.fillStyle = "rgba(0, 240, 255, 0.4)";
        ctx.font = "bold 6.5px 'Inter', sans-serif";
        ctx.fillText("SYS.LOC: ENG-A3", x + 12, y + p.h - 8);

        ctx.restore();
      });
    };

    const drawLocationPins = () => {
      pins.forEach((p, i) => {
        const float = Math.sin(t * 0.0008 + p.phase) * 8;
        const x = canvas.width * p.x + mouseSmooth.x * 0.5;
        const y = canvas.height * p.y + float + mouseSmooth.y * 0.5;
        const pulse = Math.sin(t * 0.0015 + p.phase);
        const s = 0.65 + i * 0.12;

        ctx.save();

        const beamGlow = ctx.createLinearGradient(x, y, x, y - 110);
        beamGlow.addColorStop(0, "rgba(0, 160, 255, 0.28)");
        beamGlow.addColorStop(0.5, "rgba(0, 110, 230, 0.08)");
        beamGlow.addColorStop(1, "rgba(0, 80, 200, 0)");
        ctx.strokeStyle = beamGlow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x, y - 100);
        ctx.stroke();

        ctx.translate(x, y);
        ctx.scale(s, s);

        ctx.beginPath();
        ctx.arc(0, 10, 15 + pulse * 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 170, 255, ${0.08 + pulse * 0.08})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(-3, -3, 0, 0, 0, 11);
        g.addColorStop(0, "rgba(0, 190, 255, 0.85)");
        g.addColorStop(1, "rgba(0, 90, 210, 0.65)");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 230, 255, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-5, 7);
        ctx.lineTo(5, 7);
        ctx.lineTo(0, 19);
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 130, 230, 0.75)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();

        ctx.fillStyle = "rgba(160, 210, 255, 0.75)";
        ctx.font = "bold 8.5px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(p.label, 0, -18);

        const gl = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
        gl.addColorStop(0, `rgba(0, 170, 255, ${0.28 + pulse * 0.15})`);
        gl.addColorStop(1, "transparent");
        ctx.fillStyle = gl;
        ctx.fillRect(-25, -25, 50, 50);

        ctx.restore();
      });
    };

    const drawOrbitRings = () => {
      const cx = canvas.width * 0.675 + mouseSmooth.x * 0.4;
      const cy = canvas.height * 0.55 + mouseSmooth.y * 0.4;

      [130, 185, 235].forEach((r, i) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.00014 * (i % 2 === 0 ? 1 : -1));
        ctx.scale(1, 0.28);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 130, 255, ${0.11 - i * 0.025})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 20]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });
    };

    const drawParticles = () => {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.va;

        if (p.a < 0) p.a = 0;
        if (p.a > 1) p.a = 1;
        if (p.va > 0 && p.a >= 1) p.va = -p.va;
        if (p.va < 0 && p.a <= 0) p.va = -p.va;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const px = p.x + mouseSmooth.x * 0.8;
        const py = p.y + mouseSmooth.y * 0.8;

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 180, 255, ${p.a * 0.42})`;
        ctx.fill();
      });
    };

    const frame = () => {
      t++;
      mouseSmooth.x += (mouse.x * 20 - mouseSmooth.x) * 0.035;
      mouseSmooth.y += (mouse.y * 20 - mouseSmooth.y) * 0.035;

      // Clear canvas fully transparent — video shows through
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawAmbientGlows();
      drawVolumetricSpotlight();
      drawAbstractCurves();
      drawGrid();
      drawFog();
      drawOrbitRings();
      drawParticles();
      drawPlatform();
      drawBackpack();
      drawWallet();
      drawKeys();
      drawPhone();
      drawIDCard();
      drawWatch();
      drawHoloPanels();
      drawLocationPins();

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── Layer 1: Fullscreen video background ── */}
      <video
        ref={videoRef}
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

      {/* ── Layer 2: Cinematic dark overlay (multi-stop for depth) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: [
            /* base dark tint */ "rgba(0, 2, 8, 0.62)",
          ].join(", "),
        }}
      />

      {/* ── Layer 3: Left-side content readability vignette ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background:
            "radial-gradient(ellipse 70% 100% at 25% 50%, rgba(0,2,14,0.72) 0%, transparent 75%)",
        }}
      />

      {/* ── Layer 4: Bottom depth vignette ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          background:
            "linear-gradient(to top, rgba(0,0,10,0.85) 0%, transparent 35%)",
        }}
      />

      {/* ── Layer 5: Top edge vignette ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          background:
            "linear-gradient(to bottom, rgba(0,0,8,0.55) 0%, transparent 20%)",
        }}
      />

      {/* ── Layer 6: Neon blue ambient tint (blends video into theme) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          background:
            "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(0, 60, 180, 0.18) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />

      {/* ── Layer 7: Canvas holographic effects overlay ── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          zIndex: 6,
        }}
      />
    </div>
  );
}
