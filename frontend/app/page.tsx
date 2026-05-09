"use client";
import Link from "next/link";
import React, { useEffect, useRef } from "react";

/* ── Floating Particles Canvas ─────────────────────────── */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let raf: number;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 120 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.6 + 0.2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165,231,255,${p.o})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > c.width) p.dx *= -1;
        if (p.y < 0 || p.y > c.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none z-10" />;
}

/* ── Navbar ────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
      style={{ background: "rgba(0,0,0,0.15)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2.5">
        <div style={{ width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,rgba(165,231,255,0.25),rgba(237,177,255,0.25))",border:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <span className="material-symbols-outlined icon-fill" style={{ fontSize:16,color:"#a5e7ff" }}>auto_awesome</span>
        </div>
        <span style={{ fontSize:20,fontWeight:800,letterSpacing:"-0.04em",color:"#a5e7ff" }}>LostNova</span>
        <span style={{ fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"#3c494e",textTransform:"uppercase",marginLeft:4 }}>AI Network</span>
      </div>
      <div className="hidden md:flex items-center gap-1">
        {["How it Works","Features","Network","Pricing"].map(l => (
          <a key={l} href="#" style={{ padding:"8px 16px",borderRadius:12,fontSize:13,fontWeight:500,color:"rgba(187,201,207,0.8)",transition:"all .2s" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color="#fff"; (e.target as HTMLElement).style.background="rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color="rgba(187,201,207,0.8)"; (e.target as HTMLElement).style.background="transparent"; }}>
            {l}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/login">
          <button style={{ padding:"8px 18px",borderRadius:12,fontSize:13,fontWeight:600,color:"#bbc9cf",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",cursor:"pointer",transition:"all .2s" }}>Sign In</button>
        </Link>
        <Link href="/register">
          <button style={{ padding:"8px 20px",borderRadius:12,fontSize:13,fontWeight:700,color:"#0c0f0f",background:"linear-gradient(135deg,#a5e7ff,#edb1ff)",boxShadow:"0 0 20px rgba(165,231,255,0.3)",cursor:"pointer",transition:"all .2s" }}>Get Access</button>
        </Link>
      </div>
    </nav>
  );
}

/* ── Main Landing ───────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main style={{ background:"#000",minHeight:"100vh",fontFamily:"'Inter',sans-serif",color:"#e2e2e2",overflow:"hidden" }}>

      {/* ── Deep space background ── */}
      <div style={{ position:"fixed",inset:0,zIndex:0 }}>
        {/* Base radial gradient */}
        <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 65% 50%,rgba(30,10,60,0.8) 0%,#000 70%)" }} />
        {/* Primary glow — left */}
        <div className="animate-nebula-slow" style={{ position:"absolute",top:"-10%",left:"-5%",width:"55vw",height:"55vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(110,32,160,0.18) 0%,transparent 65%)",filter:"blur(40px)" }} />
        {/* Secondary glow — right */}
        <div className="animate-nebula-slower" style={{ position:"absolute",bottom:"-15%",right:"-5%",width:"60vw",height:"60vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,160,220,0.14) 0%,transparent 65%)",filter:"blur(50px)" }} />
        {/* Accent — top right */}
        <div style={{ position:"absolute",top:"5%",right:"8%",width:"35vw",height:"35vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(237,177,255,0.08) 0%,transparent 60%)",filter:"blur(30px)" }} />
        {/* Grid overlay */}
        <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(165,231,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(165,231,255,0.025) 1px,transparent 1px)",backgroundSize:"60px 60px" }} />
        {/* Noise vignette */}
        <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse at center,transparent 30%,rgba(0,0,0,0.7) 100%)" }} />
      </div>

      {/* ── Particles ── */}
      <div style={{ position:"fixed",inset:0,zIndex:10,pointerEvents:"none" }}><ParticleCanvas /></div>

      <Navbar />

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ position:"relative",zIndex:20,minHeight:"100vh",display:"flex",alignItems:"center" }}>
        <div style={{ width:"100%",maxWidth:1440,margin:"0 auto",padding:"0 48px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,alignItems:"center" }}>

          {/* LEFT — Content */}
          <div style={{ paddingTop:80 }}>
            {/* Status pill */}
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:999,background:"rgba(165,231,255,0.06)",border:"1px solid rgba(165,231,255,0.15)",marginBottom:32 }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"#a5e7ff",boxShadow:"0 0 8px #a5e7ff",display:"inline-block",animation:"pulse-nebula 2s infinite" }} />
              <span style={{ fontSize:11,fontWeight:700,letterSpacing:"0.14em",color:"#a5e7ff",textTransform:"uppercase" }}>Neural Retrieval Network · Live</span>
            </div>

            {/* Heading */}
            <h1 style={{ fontSize:"clamp(48px,6.5vw,96px)",fontWeight:900,lineHeight:0.92,letterSpacing:"-0.04em",marginBottom:28 }}>
              <span style={{ display:"block",color:"#fff" }}>RECLAIM</span>
              <span style={{ display:"block",background:"linear-gradient(135deg,#a5e7ff 0%,#edb1ff 60%,#a5e7ff 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundSize:"200% 100%",animation:"gradientShift 4s ease infinite" }}>WHAT'S</span>
              <span style={{ display:"block",color:"rgba(255,255,255,0.85)" }}>YOURS.</span>
            </h1>

            {/* Divider line */}
            <div style={{ width:64,height:2,background:"linear-gradient(90deg,#a5e7ff,transparent)",marginBottom:24,boxShadow:"0 0 12px rgba(165,231,255,0.5)" }} />

            {/* Subtitle */}
            <p style={{ fontSize:17,lineHeight:1.65,color:"rgba(187,201,207,0.8)",maxWidth:440,marginBottom:44 }}>
              The world's first AI-powered lost & found network. Our neural matching engine scans thousands of items in real-time — reuniting owners with their assets at unprecedented speed.
            </p>

            {/* CTAs */}
            <div style={{ display:"flex",gap:14,flexWrap:"wrap",marginBottom:56 }}>
              <Link href="/dashboard">
                <button style={{ display:"flex",alignItems:"center",gap:8,padding:"14px 28px",borderRadius:16,fontSize:15,fontWeight:700,color:"#0c0f0f",background:"linear-gradient(135deg,#a5e7ff,#edb1ff)",boxShadow:"0 0 32px rgba(165,231,255,0.35)",cursor:"pointer",border:"none",transition:"all .3s" }}>
                  <span className="material-symbols-outlined icon-fill" style={{ fontSize:18 }}>radar</span>
                  Launch Neural Scan
                </button>
              </Link>
              <Link href="/login">
                <button style={{ display:"flex",alignItems:"center",gap:8,padding:"14px 28px",borderRadius:16,fontSize:15,fontWeight:600,color:"#bbc9cf",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",backdropFilter:"blur(10px)",transition:"all .3s" }}>
                  <span className="material-symbols-outlined" style={{ fontSize:18 }}>play_circle</span>
                  Watch Demo
                </button>
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ display:"flex",gap:32,flexWrap:"wrap" }}>
              {[
                { val:"98.2%", label:"Match Accuracy" },
                { val:"47k+", label:"Items Recovered" },
                { val:"<90s", label:"Avg. Match Time" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize:28,fontWeight:900,letterSpacing:"-0.03em",background:"linear-gradient(135deg,#fff,rgba(165,231,255,0.9))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>{s.val}</div>
                  <div style={{ fontSize:11,fontWeight:600,letterSpacing:"0.1em",color:"#859399",textTransform:"uppercase",marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Globe Placeholder */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"70vh",position:"relative" }}>
            {/* Outer ring */}
            <div className="animate-spin-slow" style={{ position:"absolute",width:"480px",height:"480px",borderRadius:"50%",border:"1px solid rgba(165,231,255,0.08)" }} />
            <div className="animate-spin-medium" style={{ position:"absolute",width:"380px",height:"380px",borderRadius:"50%",border:"1px solid rgba(237,177,255,0.06)",borderTopColor:"rgba(237,177,255,0.2)" }} />
            <div className="animate-spin-fast" style={{ position:"absolute",width:"280px",height:"280px",borderRadius:"50%",border:"1px solid rgba(165,231,255,0.06)",borderRightColor:"rgba(165,231,255,0.25)" }} />

            {/* Globe glow backdrop */}
            <div style={{ position:"absolute",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(110,32,160,0.3) 0%,rgba(0,160,220,0.15) 50%,transparent 75%)",filter:"blur(20px)" }} />

            {/* Globe placeholder container — drop your Three.js canvas here */}
            <div id="globe-container" style={{
              width:360,height:360,borderRadius:"50%",
              border:"1px solid rgba(165,231,255,0.12)",
              backdropFilter:"blur(4px)",
              background:"rgba(10,10,20,0.4)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              boxShadow:"0 0 60px rgba(110,32,160,0.25),inset 0 0 40px rgba(0,160,220,0.08)",
              position:"relative",overflow:"hidden",
            }}>
              {/* Inner shimmer */}
              <div style={{ position:"absolute",inset:0,background:"radial-gradient(circle at 35% 35%,rgba(165,231,255,0.08),transparent 60%)" }} />
              <span className="material-symbols-outlined icon-fill animate-float" style={{ fontSize:56,color:"rgba(165,231,255,0.25)",marginBottom:12 }}>public</span>
              <p style={{ fontSize:11,fontWeight:700,letterSpacing:"0.18em",color:"rgba(165,231,255,0.25)",textTransform:"uppercase" }}>3D Globe Here</p>
              <p style={{ fontSize:10,color:"rgba(133,147,153,0.5)",marginTop:4 }}>Three.js · WebGL</p>
            </div>

            {/* Floating data nodes */}
            {([
              { pos:{ top:"12%",  left:"5%"  }, icon:"location_on",    label:"Zone Alpha",  delay:"0s"   },
              { pos:{ top:"20%",  right:"2%" }, icon:"wifi_tethering", label:"Signal Lock", delay:"1s"   },
              { pos:{ bottom:"18%",left:"2%" }, icon:"verified",       label:"Confirmed",   delay:"0.5s" },
              { pos:{ bottom:"10%",right:"8%"}, icon:"auto_awesome",   label:"AI Active",   delay:"1.5s" },
            ] as { pos: React.CSSProperties; icon: string; label: string; delay: string }[]).map((n,i) => (
              <div key={i} className="animate-float" style={{
                position:"absolute", ...n.pos,
                animationDelay:n.delay,
                background:"rgba(18,20,20,0.7)",
                backdropFilter:"blur(12px)",
                border:"1px solid rgba(165,231,255,0.12)",
                borderRadius:12, padding:"8px 14px",
                display:"flex", alignItems:"center", gap:8,
                zIndex:30,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize:14,color:"#a5e7ff" }}>{n.icon}</span>
                <span style={{ fontSize:11,fontWeight:700,color:"#bbc9cf",whiteSpace:"nowrap" }}>{n.label}</span>
                <span style={{ width:5,height:5,borderRadius:"50%",background:"#a5e7ff",boxShadow:"0 0 6px #a5e7ff",animation:"pulse-nebula 1.5s infinite" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:"absolute",bottom:36,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:9,fontWeight:700,letterSpacing:"0.2em",color:"#3c494e",textTransform:"uppercase" }}>Explore</span>
          <div style={{ width:1,height:48,background:"linear-gradient(to bottom,#a5e7ff,transparent)",boxShadow:"0 0 6px rgba(165,231,255,0.5)" }} />
        </div>
      </section>

      {/* ── FEATURES STRIP ──────────────────────────────── */}
      <section style={{ position:"relative",zIndex:20,padding:"120px 48px",maxWidth:1440,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:72 }}>
          <p style={{ fontSize:11,fontWeight:700,letterSpacing:"0.2em",color:"#a5e7ff",textTransform:"uppercase",marginBottom:16 }}>Core Systems</p>
          <h2 style={{ fontSize:"clamp(32px,4vw,56px)",fontWeight:900,letterSpacing:"-0.04em",color:"#fff",lineHeight:1.05 }}>
            Intelligence<br /><span style={{ background:"linear-gradient(135deg,#a5e7ff,#edb1ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>at every layer.</span>
          </h2>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20 }}>
          {[
            { icon:"auto_awesome",  title:"Neural Matching",       body:"Keyword + category + temporal proximity scoring. ≥80% confidence triggers instant push alerts.",    gradient:"rgba(165,231,255,0.08)" },
            { icon:"shield_lock",    title:"Verified Claims",       body:"Multi-factor ownership proof with immutable audit trail. No fraudulent recoveries.",                  gradient:"rgba(237,177,255,0.06)" },
            { icon:"location_on",    title:"Geo-Spatial Tracking",  body:"Pinpoint item locations across campus zones with smart location clustering.",                         gradient:"rgba(165,231,255,0.06)" },
            { icon:"notifications_active", title:"Real-Time Alerts", body:"Match notifications delivered in <90 seconds via email, push and in-app streams.",                  gradient:"rgba(237,177,255,0.08)" },
          ].map((f,i) => (
            <div key={i} className="card-hover" style={{
              background:"rgba(18,20,20,0.5)",
              backdropFilter:"blur(24px)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:24,padding:"32px 28px",
              transition:"all .3s",
            }}>
              <div style={{ width:48,height:48,borderRadius:14,background:f.gradient,border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
                <span className="material-symbols-outlined icon-fill" style={{ fontSize:22,color:"#a5e7ff" }}>{f.icon}</span>
              </div>
              <h3 style={{ fontSize:18,fontWeight:800,letterSpacing:"-0.02em",color:"#fff",marginBottom:10 }}>{f.title}</h3>
              <p style={{ fontSize:14,lineHeight:1.65,color:"#859399" }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────── */}
      <section style={{ position:"relative",zIndex:20,padding:"0 48px 140px",maxWidth:1440,margin:"0 auto" }}>
        <div style={{ borderRadius:32,background:"linear-gradient(135deg,rgba(110,32,160,0.2),rgba(0,160,220,0.15))",border:"1px solid rgba(165,231,255,0.12)",padding:"72px 64px",textAlign:"center",backdropFilter:"blur(20px)",position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:"-50%",left:"50%",transform:"translateX(-50%)",width:"60%",height:"200%",background:"radial-gradient(ellipse,rgba(165,231,255,0.06),transparent 70%)",pointerEvents:"none" }} />
          <p style={{ fontSize:11,fontWeight:700,letterSpacing:"0.18em",color:"#a5e7ff",textTransform:"uppercase",marginBottom:20 }}>Begin Recovery</p>
          <h2 style={{ fontSize:"clamp(28px,4vw,52px)",fontWeight:900,letterSpacing:"-0.04em",color:"#fff",marginBottom:16,lineHeight:1.1 }}>
            Your item is out there.<br />Let the AI find it.
          </h2>
          <p style={{ fontSize:15,color:"#859399",marginBottom:40,maxWidth:480,margin:"0 auto 40px" }}>
            Join 12,000+ users already on the network. Report in 60 seconds, match in 90.
          </p>
          <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" }}>
            <Link href="/register">
              <button style={{ display:"flex",alignItems:"center",gap:8,padding:"15px 32px",borderRadius:16,fontSize:15,fontWeight:700,color:"#0c0f0f",background:"linear-gradient(135deg,#a5e7ff,#edb1ff)",boxShadow:"0 0 36px rgba(165,231,255,0.3)",cursor:"pointer",border:"none" }}>
                <span className="material-symbols-outlined icon-fill" style={{ fontSize:18 }}>hub</span>
                Establish Node
              </button>
            </Link>
            <Link href="/dashboard">
              <button style={{ display:"flex",alignItems:"center",gap:8,padding:"15px 32px",borderRadius:16,fontSize:15,fontWeight:600,color:"#bbc9cf",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",backdropFilter:"blur(10px)" }}>
                Explore Dashboard →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position:"relative",zIndex:20,borderTop:"1px solid rgba(255,255,255,0.05)",padding:"32px 48px",display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:1440,margin:"0 auto" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span className="material-symbols-outlined icon-fill" style={{ fontSize:16,color:"#a5e7ff" }}>auto_awesome</span>
          <span style={{ fontSize:14,fontWeight:700,color:"#3c494e" }}>LostNova © 2026</span>
        </div>
        <div style={{ display:"flex",gap:24 }}>
          {["Privacy","Terms","Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize:12,color:"#3c494e",textDecoration:"none",fontWeight:600 }}>{l}</a>
          ))}
        </div>
      </footer>

      {/* gradient shift keyframe */}
      <style>{`
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
      `}</style>
    </main>
  );
}
