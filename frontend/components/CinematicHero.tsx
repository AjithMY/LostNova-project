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
}

interface Pin {
  x: number;
  y: number;
  vy: number;
  phase: number;
}

export default function CinematicHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let t = 0;

    // Mouse interactive coordinates
    const mouse = { x: 0, y: 0 };
    const mouseSmooth = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to range [-1, 1] relative to center
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

    // Minimal floating particles (slower speed, calm)
    const particles: Particle[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random(),
      va: (Math.random() - 0.5) * 0.003,
    }));

    // Holographic panels with slow breathing motion
    const panels: HoloPanel[] = [
      { x: 0.58, y: 0.22, w: 160, h: 90, vy: 0.0001, a: 0 },
      { x: 0.74, y: 0.42, w: 130, h: 70, vy: -0.00008, a: 0.3 },
      { x: 0.60, y: 0.62, w: 110, h: 60, vy: 0.00009, a: 0.6 },
    ];

    // Location pins with slow atmospheric pulse
    const pins: Pin[] = [
      { x: 0.54, y: 0.28, vy: 0, phase: 0 },
      { x: 0.77, y: 0.23, vy: 0, phase: 1.2 },
      { x: 0.67, y: 0.58, vy: 0, phase: 2.4 },
      { x: 0.49, y: 0.53, vy: 0, phase: 0.8 },
    ];

    const drawBackground = () => {
      // Dark matte black environment
      ctx.fillStyle = "#020204";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Upper Section: Active cinematic ambient lights (subtle movement)
      const topGlowX = canvas.width * (0.65 + Math.sin(t * 0.0005) * 0.08) + mouseSmooth.x * 0.15;
      const topGlowY = canvas.height * (0.25 + Math.cos(t * 0.0003) * 0.04) + mouseSmooth.y * 0.15;
      const topGlow = ctx.createRadialGradient(
        topGlowX, topGlowY, 0,
        topGlowX, topGlowY, canvas.width * 0.45
      );
      topGlow.addColorStop(0, "rgba(0, 140, 255, 0.07)");
      topGlow.addColorStop(0.6, "rgba(0, 70, 180, 0.02)");
      topGlow.addColorStop(1, "transparent");
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Lower Section: Calm, breathing slow gradients & soft ambient glow
      const bottomGlowY = canvas.height * 0.82 + Math.sin(t * 0.0004) * 15 + mouseSmooth.y * 0.1;
      const bottomGlow = ctx.createRadialGradient(
        canvas.width * 0.7, bottomGlowY, 0,
        canvas.width * 0.7, bottomGlowY, canvas.width * 0.35
      );
      bottomGlow.addColorStop(0, "rgba(0, 80, 180, 0.03)");
      bottomGlow.addColorStop(0.5, "rgba(0, 40, 100, 0.008)");
      bottomGlow.addColorStop(1, "transparent");
      ctx.fillStyle = bottomGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawGrid = () => {
      // Faint subtle grid pattern with parallax offsets
      ctx.strokeStyle = "rgba(0, 100, 255, 0.015)";
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
      // Soft volumetric fog layer at the bottom
      for (let i = 0; i < 3; i++) {
        const rg = ctx.createRadialGradient(
          canvas.width * (0.45 + i * 0.15) + Math.sin(t * 0.0003 + i) * 12,
          canvas.height * 0.9,
          0,
          canvas.width * (0.45 + i * 0.15),
          canvas.height * 0.9,
          canvas.width * 0.25
        );
        rg.addColorStop(0, `rgba(0, 30, 80, ${0.035 - i * 0.008})`);
        rg.addColorStop(1, "transparent");
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    const drawPlatform = () => {
      // Platform centered on the right
      const cx = canvas.width * 0.675 + mouseSmooth.x * 0.4;
      const cy = canvas.height * 0.72 + mouseSmooth.y * 0.4;
      const rx = 175;
      const ry = 22;

      // Slow breathing glow under the platform
      const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx * 1.35);
      pg.addColorStop(0, `rgba(0, 120, 255, ${0.12 + Math.sin(t * 0.001) * 0.02})`);
      pg.addColorStop(1, "transparent");
      ctx.fillStyle = pg;
      ctx.fillRect(cx - rx * 2, cy - ry * 4, rx * 4, ry * 8);

      // Matte dark platform tiers with soft highlights
      [[rx, ry], [rx * 0.75, ry * 0.7], [rx * 0.5, ry * 0.5]].forEach(([r, ry2], i) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy - i * 12, r, ry2, 0, 0, Math.PI * 2);
        const g = ctx.createLinearGradient(cx - r, cy - i * 12 - ry2, cx + r, cy - i * 12 + ry2);
        g.addColorStop(0, "#16181d");
        g.addColorStop(0.5, "#0b0d10");
        g.addColorStop(1, "#07080b");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = `rgba(0, 150, 255, ${0.22 - i * 0.06})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    };

    const drawBackpack = () => {
      // Very slow floating/breathing animation
      const float = Math.sin(t * 0.0008) * 6;
      const cx = canvas.width * 0.675 + mouseSmooth.x * 0.42;
      const cy = canvas.height * 0.48 + float + mouseSmooth.y * 0.42;

      ctx.save();
      ctx.translate(cx, cy);

      // Soft shadow breathing on the platform below
      const shadowScale = 1 - float / 25;
      const sg = ctx.createRadialGradient(0, 95 - float, 0, 0, 95 - float, 80 * shadowScale);
      sg.addColorStop(0, `rgba(0, 0, 0, ${0.35 * shadowScale})`);
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(-90, 65 - float, 180, 60);

      // Backpack body: Matte black & charcoal palette
      ctx.beginPath();
      ctx.roundRect(-52, -70, 104, 130, 16);
      const bg = ctx.createLinearGradient(-52, -70, 52, 60);
      bg.addColorStop(0, "#1c2028");
      bg.addColorStop(0.4, "#12151b");
      bg.addColorStop(1, "#0a0c10");
      ctx.fillStyle = bg;
      ctx.fill();

      // Soft outline highlight
      ctx.strokeStyle = "rgba(0, 140, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rim light
      ctx.beginPath();
      ctx.roundRect(-52, -70, 104, 130, 16);
      const rl = ctx.createLinearGradient(-52, 0, 52, 0);
      rl.addColorStop(0, "rgba(0, 120, 255, 0.2)");
      rl.addColorStop(0.5, "transparent");
      rl.addColorStop(1, "rgba(0, 80, 200, 0.12)");
      ctx.strokeStyle = rl;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Front pocket
      ctx.beginPath();
      ctx.roundRect(-36, -20, 72, 60, 10);
      ctx.fillStyle = "#0a0d11";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 100, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Zipper line
      ctx.beginPath();
      ctx.moveTo(-30, -22);
      ctx.lineTo(30, -22);
      ctx.strokeStyle = "rgba(0, 160, 255, 0.3)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Straps
      ctx.beginPath();
      ctx.moveTo(-28, -70);
      ctx.quadraticCurveTo(-35, -90, -28, -100);
      ctx.strokeStyle = "#171a22";
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.strokeStyle = "rgba(0, 100, 200, 0.15)";
      ctx.lineWidth = 12;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(28, -70);
      ctx.quadraticCurveTo(35, -90, 28, -100);
      ctx.strokeStyle = "#171a22";
      ctx.lineWidth = 14;
      ctx.stroke();
      ctx.strokeStyle = "rgba(0, 100, 200, 0.15)";
      ctx.lineWidth = 12;
      ctx.stroke();

      // Tag dangling slightly
      const ta = Math.sin(t * 0.0006) * 0.08;
      ctx.save();
      ctx.translate(20, -55);
      ctx.rotate(ta);
      ctx.beginPath();
      ctx.roundRect(-18, -26, 36, 44, 5);
      ctx.fillStyle = "#080a0d";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 160, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tag hole
      ctx.beginPath();
      ctx.arc(0, -24, 3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 160, 255, 0.5)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Tag text
      ctx.fillStyle = "#9ad2ff";
      ctx.font = "bold 6.5px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("LOST &", 0, -8);
      ctx.fillText("FOUND", 0, 2);
      ctx.restore();

      // Glow aura
      const aura = ctx.createRadialGradient(0, 0, 40, 0, 0, 110);
      aura.addColorStop(0, "transparent");
      aura.addColorStop(1, `rgba(0, 100, 255, ${0.05 + Math.sin(t * 0.001) * 0.02})`);
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

      // Matte dark phone chassis
      ctx.beginPath();
      ctx.roundRect(-16, -42, 32, 68, 6);
      const g = ctx.createLinearGradient(-16, -42, 16, 26);
      g.addColorStop(0, "#191d27");
      g.addColorStop(1, "#0b0c12");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 140, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Screen soft neon glow
      ctx.beginPath();
      ctx.roundRect(-13, -38, 26, 56, 4);
      const sg = ctx.createLinearGradient(-13, -38, 13, 18);
      sg.addColorStop(0, "rgba(0, 90, 180, 0.5)");
      sg.addColorStop(1, "rgba(0, 30, 90, 0.3)");
      ctx.fillStyle = sg;
      ctx.fill();
      ctx.restore();
    };

    const drawWallet = () => {
      const float = Math.sin(t * 0.00075 + 2) * 4;
      const cx = canvas.width * 0.62 + mouseSmooth.x * 0.43;
      const cy = canvas.height * 0.62 + float + mouseSmooth.y * 0.43;

      ctx.save();
      ctx.translate(cx, cy);

      // Wallet body
      ctx.beginPath();
      ctx.roundRect(-32, -14, 64, 28, 6);
      const g = ctx.createLinearGradient(-32, -14, 32, 14);
      g.addColorStop(0, "#191a20");
      g.addColorStop(1, "#0d0e12");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 120, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-32, 0);
      ctx.lineTo(32, 0);
      ctx.strokeStyle = "rgba(0, 100, 200, 0.15)";
      ctx.stroke();

      // Card/ID chip inside wallet
      ctx.beginPath();
      ctx.roundRect(10, -8, 16, 14, 2);
      ctx.fillStyle = "rgba(0, 160, 255, 0.12)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 160, 255, 0.35)";
      ctx.stroke();
      ctx.restore();
    };

    const drawKeys = () => {
      const float = Math.sin(t * 0.0009 + 3) * 4;
      const cx = canvas.width * 0.65 + mouseSmooth.x * 0.44;
      const cy = canvas.height * 0.59 + float + mouseSmooth.y * 0.44;

      ctx.save();
      ctx.translate(cx, cy);

      // Key ring
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 140, 255, 0.45)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Keys (slower angle breathing)
      [-0.4, 0.2, 0.8].forEach((a, i) => {
        ctx.save();
        ctx.rotate(a + Math.sin(t * 0.0005 + i) * 0.02);
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(36, 0);
        ctx.strokeStyle = `rgba(0, ${110 + i * 20}, 255, 0.35)`;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(32, -5, 10, 10, 2);
        ctx.strokeStyle = "rgba(0, 140, 255, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
    };

    // Replacement: custom ID Card with realistic details
    const drawIDCard = () => {
      const float = Math.sin(t * 0.00085 + 4) * 5;
      const cx = canvas.width * 0.705 + mouseSmooth.x * 0.46;
      const cy = canvas.height * 0.655 + float + mouseSmooth.y * 0.46;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.12 + Math.sin(t * 0.0005) * 0.02); // Slight tilt

      // Soft shadow
      const sg = ctx.createRadialGradient(0, 22 - float, 0, 0, 22 - float, 28);
      sg.addColorStop(0, "rgba(0,0,0,0.35)");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(-22, 12 - float, 44, 15);

      // Card body (matte charcoal & black)
      ctx.beginPath();
      ctx.roundRect(-22, -14, 44, 28, 4);
      const g = ctx.createLinearGradient(-22, -14, 22, 14);
      g.addColorStop(0, "#1e2128");
      g.addColorStop(0.5, "#121417");
      g.addColorStop(1, "#0d0f11");
      ctx.fillStyle = g;
      ctx.fill();

      // Neon blue highlight border
      ctx.strokeStyle = "rgba(0, 180, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Card header (neon blue strip)
      ctx.beginPath();
      ctx.roundRect(-22, -14, 44, 5, [4, 4, 0, 0]);
      ctx.fillStyle = "rgba(0, 120, 255, 0.35)";
      ctx.fill();

      // Photo slot
      ctx.beginPath();
      ctx.roundRect(-16, -4, 9, 11, 1);
      ctx.fillStyle = "#151820";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 140, 255, 0.2)";
      ctx.stroke();

      // Avatar inside photo
      ctx.beginPath();
      ctx.arc(-11.5, -1, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 180, 255, 0.3)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-11.5, 4.5, 3.5, Math.PI, 0);
      ctx.fill();

      // Card text lines
      ctx.fillStyle = "rgba(0, 160, 255, 0.25)";
      ctx.fillRect(-3, -4, 15, 1.2);
      ctx.fillRect(-3, 0, 12, 1.2);
      ctx.fillRect(-3, 4, 8, 1.2);

      // Holographic security badge/chip (Gentle slow pulse)
      const pulse = 0.4 + Math.sin(t * 0.0015) * 0.1;
      ctx.beginPath();
      ctx.roundRect(12, 7, 6, 5, 1);
      const badgeGlow = ctx.createLinearGradient(12, 7, 18, 12);
      badgeGlow.addColorStop(0, `rgba(0, 220, 255, ${pulse + 0.1})`);
      badgeGlow.addColorStop(1, `rgba(0, 80, 200, ${pulse - 0.1})`);
      ctx.fillStyle = badgeGlow;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
      ctx.stroke();

      ctx.restore();
    };

    const drawHoloPanels = () => {
      panels.forEach((p, i) => {
        const t2 = t * 0.0006;
        const y = canvas.height * p.y + Math.sin(t2 + p.a) * 12 + mouseSmooth.y * 0.65;
        const x = canvas.width * p.x + mouseSmooth.x * 0.65;
        const alpha = 0.42 + Math.sin(t2 * 1.5 + i) * 0.1; // calmer opacity pulse

        ctx.save();
        ctx.globalAlpha = alpha;

        // Panel background
        ctx.beginPath();
        ctx.roundRect(x, y, p.w, p.h, 8);
        const g = ctx.createLinearGradient(x, y, x + p.w, y + p.h);
        g.addColorStop(0, "rgba(0, 60, 140, 0.2)");
        g.addColorStop(1, "rgba(0, 20, 80, 0.1)");
        ctx.fillStyle = g;
        ctx.fill();

        ctx.strokeStyle = `rgba(0, 160, 255, ${0.35 + Math.sin(t2 + i) * 0.08})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Panel content lines
        const lc = ["rgba(0, 200, 255, 0.5)", "rgba(0, 150, 255, 0.35)", "rgba(0, 100, 200, 0.25)"];
        [0.25, 0.45, 0.65].forEach((fy, li) => {
          ctx.beginPath();
          ctx.roundRect(x + 10, y + p.h * fy, p.w * (li === 0 ? 0.7 : 0.5), 3.5, 1.5);
          ctx.fillStyle = lc[li];
          ctx.fill();
        });

        // Dot indicator
        ctx.beginPath();
        ctx.arc(x + p.w - 14, y + 14, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 200, 255, ${0.5 + Math.sin(t2 * 2 + i) * 0.3})`;
        ctx.fill();

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
        ctx.translate(x, y);
        ctx.scale(s, s);

        // Pulse ring
        ctx.beginPath();
        ctx.arc(0, 10, 15 + pulse * 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 160, 255, ${0.08 + pulse * 0.08})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Pin body
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(-3, -3, 0, 0, 0, 11);
        g.addColorStop(0, "rgba(0, 180, 255, 0.8)");
        g.addColorStop(1, "rgba(0, 80, 200, 0.6)");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 220, 255, 0.5)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Pin tip
        ctx.beginPath();
        ctx.moveTo(-5, 7);
        ctx.lineTo(5, 7);
        ctx.lineTo(0, 19);
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 120, 220, 0.7)";
        ctx.fill();

        // Inner dot
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();

        // Glow
        const gl = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
        gl.addColorStop(0, `rgba(0, 160, 255, ${0.25 + pulse * 0.15})`);
        gl.addColorStop(1, "transparent");
        ctx.fillStyle = gl;
        ctx.fillRect(-25, -25, 50, 50);

        ctx.restore();
      });
    };

    const drawOrbitRings = () => {
      const cx = canvas.width * 0.675 + mouseSmooth.x * 0.4;
      const cy = canvas.height * 0.55 + mouseSmooth.y * 0.4;

      [130, 180, 230].forEach((r, i) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.00012 * (i % 2 === 0 ? 1 : -1));
        ctx.scale(1, 0.28);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 120, 255, ${0.1 - i * 0.025})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 18]);
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

        // Apply smooth parallax to floating particles
        const px = p.x + mouseSmooth.x * 0.75;
        const py = p.y + mouseSmooth.y * 0.75;

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 170, 255, ${p.a * 0.35})`;
        ctx.fill();
      });
    };

    const frame = () => {
      t++;

      // Smooth interactive parallax interpolation
      mouseSmooth.x += (mouse.x * 20 - mouseSmooth.x) * 0.04;
      mouseSmooth.y += (mouse.y * 20 - mouseSmooth.y) * 0.04;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBackground();
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
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}

