"use client";
import { useEffect, useRef } from "react";

interface Particle { x:number;y:number;vx:number;vy:number;r:number;a:number;va:number; }
interface HoloPanel { x:number;y:number;w:number;h:number;vy:number;a:number; }
interface Pin { x:number;y:number;vy:number;phase:number; }
interface Spark { x:number;y:number;vx:number;vy:number;life:number;maxLife:number; }
interface Wave { points:number[];speed:number;amp:number;phase:number;color:string; }

export default function CinematicHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0, t = 0;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    // Particles
    const particles: Particle[] = Array.from({length:120},()=>({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      r:Math.random()*1.5+.3, a:Math.random(), va:(Math.random()-.5)*.008
    }));

    // Holographic panels
    const panels: HoloPanel[] = [
      {x:.58,y:.22,w:160,h:90,vy:.00015,a:0},
      {x:.72,y:.45,w:130,h:70,vy:-.0001,a:.3},
      {x:.62,y:.65,w:110,h:60,vy:.00012,a:.6},
    ];

    // Location pins
    const pins: Pin[] = [
      {x:.55,y:.30,vy:0,phase:0},
      {x:.78,y:.25,vy:0,phase:1.2},
      {x:.68,y:.60,vy:0,phase:2.4},
      {x:.50,y:.55,vy:0,phase:.8},
    ];

    // Sparks
    const sparks: Spark[] = [];
    const addSparks = () => {
      if(sparks.length<200 && Math.random()<.3){
        const cx = canvas.width*(.55+Math.random()*.3);
        const cy = canvas.height*(.3+Math.random()*.4);
        sparks.push({x:cx,y:cy,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,life:0,maxLife:60+Math.random()*60});
      }
    };

    // Waves
    const waves: Wave[] = [
      {points:[],speed:.008,amp:40,phase:0,color:"rgba(0,100,220,0.15)"},
      {points:[],speed:.006,amp:55,phase:1.2,color:"rgba(0,60,180,0.10)"},
      {points:[],speed:.01,amp:30,phase:2.4,color:"rgba(30,140,255,0.08)"},
    ];

    const drawBackground = () => {
      const grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
      grad.addColorStop(0,"#000000");
      grad.addColorStop(.5,"#050810");
      grad.addColorStop(1,"#000508");
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,canvas.width,canvas.height);

      // Radial ambient
      const rg = ctx.createRadialGradient(canvas.width*.7,canvas.height*.5,0,canvas.width*.7,canvas.height*.5,canvas.width*.5);
      rg.addColorStop(0,"rgba(0,80,200,0.12)");
      rg.addColorStop(1,"transparent");
      ctx.fillStyle = rg;
      ctx.fillRect(0,0,canvas.width,canvas.height);

      const rg2 = ctx.createRadialGradient(canvas.width*.1,canvas.height*.8,0,canvas.width*.1,canvas.height*.8,canvas.width*.4);
      rg2.addColorStop(0,"rgba(0,40,100,0.08)");
      rg2.addColorStop(1,"transparent");
      ctx.fillStyle = rg2;
      ctx.fillRect(0,0,canvas.width,canvas.height);
    };

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(0,100,255,0.04)";
      ctx.lineWidth = 1;
      const gs = 50;
      for(let x=0;x<canvas.width;x+=gs){
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
      }
      for(let y=0;y<canvas.height;y+=gs){
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
      }
    };

    const drawWaves = () => {
      waves.forEach(w=>{
        ctx.beginPath();
        const seg = 20;
        for(let i=0;i<=seg;i++){
          const x = (canvas.width*.4)+(canvas.width*.6)*(i/seg);
          const y = canvas.height*.85 + Math.sin(i*.4+t*w.speed*100+w.phase)*w.amp + Math.sin(i*.2+t*w.speed*50)*w.amp*.5;
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.lineTo(canvas.width,canvas.height+50);
        ctx.lineTo(canvas.width*.4,canvas.height+50);
        ctx.closePath();
        ctx.fillStyle = w.color;
        ctx.fill();
        w.phase += w.speed;
      });
    };

    const drawFog = () => {
      for(let i=0;i<3;i++){
        const rg = ctx.createRadialGradient(
          canvas.width*(.45+i*.15)+Math.sin(t*.001+i)*30,canvas.height*.9,0,
          canvas.width*(.45+i*.15),canvas.height*.9,canvas.width*.25
        );
        rg.addColorStop(0,`rgba(0,30,80,${.06-i*.01})`);
        rg.addColorStop(1,"transparent");
        ctx.fillStyle = rg;
        ctx.fillRect(0,0,canvas.width,canvas.height);
      }
    };

    const drawPlatform = () => {
      const cx = canvas.width*.665, cy = canvas.height*.72;
      const rx = 170, ry = 24;
      // Glow under platform
      const pg = ctx.createRadialGradient(cx,cy,0,cx,cy,rx*1.3);
      pg.addColorStop(0,"rgba(0,120,255,0.18)");
      pg.addColorStop(1,"transparent");
      ctx.fillStyle = pg;
      ctx.fillRect(cx-rx*2,cy-ry*4,rx*4,ry*8);

      // Platform tiers
      [[rx,ry],[rx*.75,ry*.7],[rx*.5,ry*.5]].forEach(([r,ry2],i)=>{
        ctx.beginPath();
        ctx.ellipse(cx,cy-i*14,r,ry2,0,0,Math.PI*2);
        const g = ctx.createLinearGradient(cx-r,cy-i*14-ry2,cx+r,cy-i*14+ry2);
        g.addColorStop(0,"#1a1e24");
        g.addColorStop(.5,"#0d1117");
        g.addColorStop(1,"#0a0d12");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = `rgba(0,150,255,${.3-i*.08})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    };

    const drawBackpack = () => {
      const float = Math.sin(t*.001)*8;
      const cx = canvas.width*.665, cy = canvas.height*.48+float;
      ctx.save();
      ctx.translate(cx, cy);

      // Body shadow
      const sg = ctx.createRadialGradient(0,80,0,0,80,90);
      sg.addColorStop(0,"rgba(0,0,0,0.4)");
      sg.addColorStop(1,"transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(-90,40,180,80);

      // Main body
      ctx.beginPath();
      ctx.roundRect(-52,-70,104,130,16);
      const bg = ctx.createLinearGradient(-52,-70,52,60);
      bg.addColorStop(0,"#1c2028");
      bg.addColorStop(.4,"#141820");
      bg.addColorStop(1,"#0c0f14");
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,140,255,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rim light
      ctx.beginPath();
      ctx.roundRect(-52,-70,104,130,16);
      const rl = ctx.createLinearGradient(-52,0,52,0);
      rl.addColorStop(0,"rgba(0,120,255,0.25)");
      rl.addColorStop(.5,"transparent");
      rl.addColorStop(1,"rgba(0,80,200,0.15)");
      ctx.strokeStyle = rl;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Front pocket
      ctx.beginPath();
      ctx.roundRect(-36,-20,72,60,10);
      ctx.fillStyle = "#0f1318";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,100,255,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Zipper line
      ctx.beginPath();
      ctx.moveTo(-30,-22); ctx.lineTo(30,-22);
      ctx.strokeStyle = "rgba(0,160,255,0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Straps
      ctx.beginPath();
      ctx.moveTo(-28,-70); ctx.quadraticCurveTo(-35,-90,-28,-100);
      ctx.strokeStyle = "#1a1e28";
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,100,200,0.2)";
      ctx.lineWidth = 12;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(28,-70); ctx.quadraticCurveTo(35,-90,28,-100);
      ctx.strokeStyle = "#1a1e28";
      ctx.lineWidth = 14;
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,100,200,0.2)";
      ctx.lineWidth = 12;
      ctx.stroke();

      // Tag
      const ta = Math.sin(t*.0008)*.1;
      ctx.save();
      ctx.translate(20,-55);
      ctx.rotate(ta);
      ctx.beginPath();
      ctx.roundRect(-18,-26,36,44,5);
      ctx.fillStyle = "#0a0d12";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,160,255,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Tag hole
      ctx.beginPath();
      ctx.arc(0,-24,3,0,Math.PI*2);
      ctx.strokeStyle = "rgba(0,160,255,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Tag text
      ctx.fillStyle = "#a0d4ff";
      ctx.font = "bold 6px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("LOST &", 0, -8);
      ctx.fillText("FOUND", 0, 2);
      ctx.restore();

      // Glow aura
      const aura = ctx.createRadialGradient(0,0,40,0,0,110);
      aura.addColorStop(0,"transparent");
      aura.addColorStop(1,`rgba(0,100,255,${.06+Math.sin(t*.0015)*.03})`);
      ctx.fillStyle = aura;
      ctx.fillRect(-120,-120,240,240);

      ctx.restore();
    };

    const drawPhone = () => {
      const float = Math.sin(t*.0012+1)*6;
      const cx = canvas.width*.735, cy = canvas.height*.57+float;
      ctx.save(); ctx.translate(cx,cy);
      ctx.beginPath();
      ctx.roundRect(-16,-42,32,68,6);
      const g = ctx.createLinearGradient(-16,-42,16,26);
      g.addColorStop(0,"#1a2030"); g.addColorStop(1,"#0c0f18");
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = "rgba(0,140,255,0.4)"; ctx.lineWidth = 1; ctx.stroke();
      // Screen glow
      ctx.beginPath(); ctx.roundRect(-13,-38,26,56,4);
      const sg = ctx.createLinearGradient(-13,-38,13,18);
      sg.addColorStop(0,"rgba(0,100,200,0.6)");
      sg.addColorStop(1,"rgba(0,40,120,0.4)");
      ctx.fillStyle = sg; ctx.fill();
      ctx.restore();
    };

    const drawWallet = () => {
      const float = Math.sin(t*.0009+2)*5;
      const cx = canvas.width*.615, cy = canvas.height*.625+float;
      ctx.save(); ctx.translate(cx,cy);
      ctx.beginPath(); ctx.roundRect(-32,-14,64,28,6);
      const g = ctx.createLinearGradient(-32,-14,32,14);
      g.addColorStop(0,"#1c1e24"); g.addColorStop(1,"#0f1115");
      ctx.fillStyle=g; ctx.fill();
      ctx.strokeStyle="rgba(0,120,255,0.3)"; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-32,0); ctx.lineTo(32,0);
      ctx.strokeStyle="rgba(0,100,200,0.2)"; ctx.stroke();
      // Card chip
      ctx.beginPath(); ctx.roundRect(10,-8,16,14,2);
      ctx.fillStyle="rgba(0,160,255,0.15)"; ctx.fill();
      ctx.strokeStyle="rgba(0,160,255,0.4)"; ctx.stroke();
      ctx.restore();
    };

    const drawKeys = () => {
      const float = Math.sin(t*.001+3)*4;
      const cx = canvas.width*.645, cy = canvas.height*.60+float;
      ctx.save(); ctx.translate(cx,cy);
      // Key ring
      ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2);
      ctx.strokeStyle="rgba(0,140,255,0.5)"; ctx.lineWidth=2; ctx.stroke();
      // Keys
      [-.4,.2,.8].forEach((a,i)=>{
        ctx.save(); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(36,0);
        ctx.strokeStyle=`rgba(0,${120+i*20},255,0.4)`; ctx.lineWidth=3; ctx.lineCap="round"; ctx.stroke();
        ctx.beginPath(); ctx.roundRect(32,-5,10,10,2);
        ctx.strokeStyle=`rgba(0,140,255,0.4)`; ctx.lineWidth=1.5; ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
    };

    const drawWatch = () => {
      const float = Math.sin(t*.0011+4)*6;
      const cx = canvas.width*.70, cy = canvas.height*.635+float;
      ctx.save(); ctx.translate(cx,cy);
      ctx.beginPath(); ctx.roundRect(-14,-18,28,36,5);
      const g = ctx.createLinearGradient(-14,-18,14,18);
      g.addColorStop(0,"#1a2028"); g.addColorStop(1,"#0c0f15");
      ctx.fillStyle=g; ctx.fill();
      ctx.strokeStyle="rgba(0,140,255,0.4)"; ctx.lineWidth=1.5; ctx.stroke();
      // Screen
      ctx.beginPath(); ctx.roundRect(-10,-14,20,28,3);
      ctx.fillStyle="rgba(0,80,180,0.5)"; ctx.fill();
      // Bands
      ctx.beginPath(); ctx.roundRect(-10,-26,20,12,3);
      ctx.fillStyle="#141820"; ctx.fill();
      ctx.beginPath(); ctx.roundRect(-10,18,20,12,3);
      ctx.fillStyle="#141820"; ctx.fill();
      ctx.restore();
    };

    const drawHoloPanels = () => {
      panels.forEach((p,i)=>{
        const t2 = t*.001;
        const y = canvas.height*(p.y+Math.sin(t2+p.a)*.02);
        const x = canvas.width*p.x;
        const alpha = .55+Math.sin(t2*1.5+i)*.15;

        ctx.save();
        ctx.globalAlpha = alpha;
        // Panel bg
        ctx.beginPath(); ctx.roundRect(x,y,p.w,p.h,8);
        const g = ctx.createLinearGradient(x,y,x+p.w,y+p.h);
        g.addColorStop(0,"rgba(0,60,140,0.25)");
        g.addColorStop(1,"rgba(0,20,80,0.15)");
        ctx.fillStyle=g; ctx.fill();
        ctx.strokeStyle=`rgba(0,160,255,${.4+Math.sin(t2+i)*.1})`;
        ctx.lineWidth=1; ctx.stroke();

        // Panel content lines
        const lc = ["rgba(0,200,255,0.6)","rgba(0,150,255,0.4)","rgba(0,100,200,0.3)"];
        [.25,.45,.65].forEach((fy,li)=>{
          ctx.beginPath();
          ctx.roundRect(x+10,y+p.h*fy,p.w*(li===0?.7:.5),4,2);
          ctx.fillStyle=lc[li]; ctx.fill();
        });

        // Dot indicator
        ctx.beginPath(); ctx.arc(x+p.w-14,y+14,4,0,Math.PI*2);
        ctx.fillStyle=`rgba(0,200,255,${.6+Math.sin(t2*2+i)*.4})`;
        ctx.fill();

        ctx.restore();
      });
    };

    const drawLocationPins = () => {
      pins.forEach((p,i)=>{
        const float = Math.sin(t*.001+p.phase)*12;
        const x = canvas.width*p.x;
        const y = canvas.height*p.y+float;
        const pulse = Math.sin(t*.002+p.phase);
        const s = .7+i*.15;

        ctx.save();
        ctx.translate(x,y);
        ctx.scale(s,s);

        // Pulse ring
        ctx.beginPath();
        ctx.arc(0,10,(18+pulse*8),0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,160,255,${.1+pulse*.1})`;
        ctx.lineWidth=1.5; ctx.stroke();

        // Pin body
        ctx.beginPath();
        ctx.arc(0,0,12,0,Math.PI*2);
        const g = ctx.createRadialGradient(-3,-3,0,0,0,12);
        g.addColorStop(0,"rgba(0,180,255,0.9)");
        g.addColorStop(1,"rgba(0,80,200,0.7)");
        ctx.fillStyle=g; ctx.fill();
        ctx.strokeStyle="rgba(0,220,255,0.6)"; ctx.lineWidth=1.5; ctx.stroke();

        // Pin tip
        ctx.beginPath();
        ctx.moveTo(-6,8); ctx.lineTo(6,8); ctx.lineTo(0,22);
        ctx.closePath(); ctx.fillStyle="rgba(0,120,220,0.8)"; ctx.fill();

        // Inner dot
        ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.fill();

        // Glow
        const gl = ctx.createRadialGradient(0,0,0,0,0,24);
        gl.addColorStop(0,`rgba(0,160,255,${.3+pulse*.2})`);
        gl.addColorStop(1,"transparent");
        ctx.fillStyle=gl; ctx.fillRect(-30,-30,60,60);

        ctx.restore();
      });
    };

    const drawOrbitRings = () => {
      const cx = canvas.width*.665, cy = canvas.height*.55;
      [130,180,230].forEach((r,i)=>{
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(t*.0003*(i%2===0?1:-1));
        ctx.scale(1,.3);
        ctx.beginPath();
        ctx.arc(0,0,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,120,255,${.12-i*.03})`;
        ctx.lineWidth=1;
        ctx.setLineDash([8,16]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });
    };

    const drawParticles = () => {
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.a+=p.va;
        if(p.a<0)p.a=0;
        if(p.a>1)p.a=1;
        if(p.va>0&&p.a>=1)p.va=-p.va;
        if(p.va<0&&p.a<=0)p.va=-p.va;
        if(p.x<0)p.x=canvas.width;
        if(p.x>canvas.width)p.x=0;
        if(p.y<0)p.y=canvas.height;
        if(p.y>canvas.height)p.y=0;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(0,160,255,${p.a*.5})`;
        ctx.fill();
      });
    };

    const drawSparks = () => {
      addSparks();
      for(let i=sparks.length-1;i>=0;i--){
        const s=sparks[i];
        s.x+=s.vx; s.y+=s.vy; s.vy+=.02; s.life++;
        const a=(1-s.life/s.maxLife);
        ctx.beginPath();
        ctx.arc(s.x,s.y,.8,0,Math.PI*2);
        ctx.fillStyle=`rgba(100,200,255,${a})`;
        ctx.fill();
        if(s.life>=s.maxLife)sparks.splice(i,1);
      }
    };

    const drawLightTrails = () => {
      for(let i=0;i<4;i++){
        const px=t*.15+i*300;
        const x=((px)%(canvas.width*1.5))-canvas.width*.25;
        const y=canvas.height*(.3+i*.12);
        const len=60+i*20;
        const g=ctx.createLinearGradient(x,y,x+len,y);
        g.addColorStop(0,"transparent");
        g.addColorStop(.5,`rgba(0,160,255,${.08-i*.015})`);
        g.addColorStop(1,"transparent");
        ctx.beginPath();
        ctx.moveTo(x,y); ctx.lineTo(x+len,y);
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
      }
    };

    const frame = () => {
      t++;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      drawBackground();
      drawGrid();
      drawWaves();
      drawFog();
      drawLightTrails();
      drawOrbitRings();
      drawParticles();
      drawPlatform();
      drawBackpack();
      drawWallet();
      drawKeys();
      drawPhone();
      drawWatch();
      drawHoloPanels();
      drawLocationPins();
      drawSparks();
      raf=requestAnimationFrame(frame);
    };

    raf=requestAnimationFrame(frame);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position:"absolute",inset:0,width:"100%",height:"100%",display:"block" }}
    />
  );
}
