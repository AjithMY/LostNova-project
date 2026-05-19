"use client";
import Link from "next/link";
import React from "react";
import CinematicHero from "@/components/CinematicHero";

/* ── Navbar ────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2.5">
        <div style={{ width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,rgba(165,231,255,0.25),rgba(237,177,255,0.25))",border:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <span className="material-symbols-outlined icon-fill" style={{ fontSize:16,color:"#a5e7ff" }}>auto_awesome</span>
        </div>
        <span style={{ fontSize:20,fontWeight:800,letterSpacing:"-0.04em",color:"#a5e7ff" }}>LostNova</span>
        <span style={{ fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"#3c494e",textTransform:"uppercase",marginLeft:4 }}>AI Network</span>
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

      {/* ── Cinematic Animated Background ── */}
      <div style={{ position:"fixed",inset:0,zIndex:0 }}>
        <CinematicHero />
      </div>

      <Navbar />

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ position:"relative",zIndex:20,minHeight:"100vh",display:"flex",alignItems:"center" }}>
        <div style={{ width:"100%",maxWidth:1400,margin:"0 auto",padding:"0 48px",display:"grid",gridTemplateColumns:"1fr 1fr",alignItems:"center",minHeight:"100vh" }}>

          {/* LEFT — Text content */}
          <div style={{ display:"flex",flexDirection:"column",justifyContent:"center",paddingTop:80,paddingRight:24 }}>

            {/* Status pill */}
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:999,background:"rgba(0,160,255,0.08)",border:"1px solid rgba(0,160,255,0.2)",marginBottom:32,width:"fit-content",backdropFilter:"blur(10px)" }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:"#00c8ff",boxShadow:"0 0 10px #00c8ff",display:"inline-block",animation:"pulse-dot 2s ease-in-out infinite" }} />
              <span style={{ fontSize:11,fontWeight:700,letterSpacing:"0.14em",color:"#00c8ff",textTransform:"uppercase" }}>Gemini AI-Powered · Live</span>
            </div>

            {/* Heading */}
            <h1 style={{ fontSize:"clamp(38px,5.5vw,78px)",fontWeight:900,lineHeight:1.0,letterSpacing:"-0.04em",marginBottom:24,margin:"0 0 24px" }}>
              <span style={{ display:"block",color:"#ffffff",textShadow:"0 0 40px rgba(0,100,255,0.2)" }}>Lost Something?</span>
              <span style={{ display:"block",background:"linear-gradient(120deg,#00c8ff 0%,#0070ff 50%,#a0c4ff 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:"drop-shadow(0 0 20px rgba(0,150,255,0.4))" }}>AI Will Find It.</span>
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize:16,lineHeight:1.75,color:"rgba(160,196,255,0.75)",maxWidth:480,marginBottom:40 }}>
              LostNova uses Google Gemini AI to semantically match lost items with found reports.
              Report your item and our engine does the rest — fast, accurate, reliable.
            </p>

            {/* CTAs */}
            <div style={{ display:"flex",gap:14,flexWrap:"wrap",marginBottom:56 }}>
              <Link href="/register">
                <button style={{ display:"flex",alignItems:"center",gap:8,padding:"14px 32px",borderRadius:14,fontSize:15,fontWeight:700,color:"#000",background:"linear-gradient(135deg,#00c8ff,#0060ff)",boxShadow:"0 0 32px rgba(0,160,255,0.4),0 4px 24px rgba(0,100,255,0.3)",cursor:"pointer",border:"none",transition:"all .3s" }}>
                  <span className="material-symbols-outlined icon-fill" style={{ fontSize:18 }}>person_add</span>
                  Get Started Free
                </button>
              </Link>
              <Link href="/login">
                <button style={{ display:"flex",alignItems:"center",gap:8,padding:"14px 28px",borderRadius:14,fontSize:15,fontWeight:600,color:"#a0c4ff",background:"rgba(0,80,200,0.08)",border:"1px solid rgba(0,120,255,0.2)",cursor:"pointer",backdropFilter:"blur(10px)",transition:"all .3s" }}>
                  <span className="material-symbols-outlined" style={{ fontSize:18 }}>login</span>
                  Sign In
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display:"flex",gap:40,flexWrap:"wrap" }}>
              {[
                { val:"AI-Powered", label:"Gemini Matching" },
                { val:"Real-time", label:"Instant Alerts" },
                { val:"Secure", label:"JWT Auth" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize:22,fontWeight:900,letterSpacing:"-0.03em",background:"linear-gradient(135deg,#fff,rgba(0,200,255,0.9))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>{s.val}</div>
                  <div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.12em",color:"rgba(0,160,255,0.6)",textTransform:"uppercase",marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — pure negative space; canvas fills the fixed bg */}
          <div style={{ height:"100vh" }} />
        </div>
      </section>

      {/* ── FEATURES STRIP ──────────────────────────────── */}
      <section style={{ position:"relative",zIndex:20,padding:"100px 48px",maxWidth:1280,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:64 }}>
          <p style={{ fontSize:11,fontWeight:700,letterSpacing:"0.2em",color:"#a5e7ff",textTransform:"uppercase",marginBottom:16 }}>How It Works</p>
          <h2 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,letterSpacing:"-0.04em",color:"#fff",lineHeight:1.1 }}>
            Report. Match.<br /><span style={{ background:"linear-gradient(135deg,#a5e7ff,#edb1ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Recover.</span>
          </h2>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20 }}>
          {[
            { icon:"edit_note",    title:"1. Report",             body:"Submit details about your lost or found item — title, category, color, location, and an optional photo." },
            { icon:"auto_awesome", title:"2. AI Matching",        body:"Google Gemini analyzes item descriptions semantically, comparing colors, brands, locations, and dates for accurate matches." },
            { icon:"notifications_active", title:"3. Get Notified", body:"Receive real-time alerts when a match is found. Review the AI's confidence score and explanation." },
            { icon:"verified",     title:"4. Claim & Recover",    body:"Submit an ownership claim with proof. Once verified, collect your item. Done." },
          ].map((f,i) => (
            <div key={i} className="card-hover" style={{
              background:"rgba(18,20,20,0.5)",
              backdropFilter:"blur(16px)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:20,padding:"28px 24px",
              transition:"all .3s",
            }}>
              <div style={{ width:44,height:44,borderRadius:12,background:"rgba(165,231,255,0.08)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18 }}>
                <span className="material-symbols-outlined icon-fill" style={{ fontSize:20,color:"#a5e7ff" }}>{f.icon}</span>
              </div>
              <h3 style={{ fontSize:17,fontWeight:800,letterSpacing:"-0.02em",color:"#fff",marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:13,lineHeight:1.65,color:"#859399" }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────── */}
      <section style={{ position:"relative",zIndex:20,padding:"0 48px 120px",maxWidth:1280,margin:"0 auto" }}>
        <div style={{ borderRadius:24,background:"linear-gradient(135deg,rgba(110,32,160,0.15),rgba(0,160,220,0.1))",border:"1px solid rgba(165,231,255,0.12)",padding:"56px 48px",textAlign:"center",backdropFilter:"blur(16px)" }}>
          <p style={{ fontSize:11,fontWeight:700,letterSpacing:"0.18em",color:"#a5e7ff",textTransform:"uppercase",marginBottom:16 }}>Ready to Start?</p>
          <h2 style={{ fontSize:"clamp(24px,3.5vw,44px)",fontWeight:900,letterSpacing:"-0.04em",color:"#fff",marginBottom:12,lineHeight:1.1 }}>
            Your item is out there.<br />Let AI find it.
          </h2>
          <p style={{ fontSize:14,color:"#859399",marginBottom:36,maxWidth:420,margin:"0 auto 36px" }}>
            Report in 60 seconds. Get AI-powered matches in minutes.
          </p>
          <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap" }}>
            <Link href="/register">
              <button style={{ display:"flex",alignItems:"center",gap:8,padding:"13px 28px",borderRadius:14,fontSize:14,fontWeight:700,color:"#0c0f0f",background:"linear-gradient(135deg,#a5e7ff,#edb1ff)",boxShadow:"0 0 28px rgba(165,231,255,0.25)",cursor:"pointer",border:"none" }}>
                <span className="material-symbols-outlined icon-fill" style={{ fontSize:18 }}>rocket_launch</span>
                Create Account
              </button>
            </Link>
            <Link href="/dashboard">
              <button style={{ display:"flex",alignItems:"center",gap:8,padding:"13px 28px",borderRadius:14,fontSize:14,fontWeight:600,color:"#bbc9cf",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer" }}>
                Explore Dashboard →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position:"relative",zIndex:20,borderTop:"1px solid rgba(255,255,255,0.05)",padding:"28px 48px",display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:1280,margin:"0 auto" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span className="material-symbols-outlined icon-fill" style={{ fontSize:16,color:"#a5e7ff" }}>auto_awesome</span>
          <span style={{ fontSize:14,fontWeight:700,color:"#3c494e" }}>LostNova © 2026 — Powered by Google Gemini AI</span>
        </div>
        <div style={{ display:"flex",gap:24 }}>
          {["Privacy","Terms","Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize:12,color:"#3c494e",textDecoration:"none",fontWeight:600 }}>{l}</a>
          ))}
        </div>
      </footer>
    </main>
  );
}
