"use client";
import Link from "next/link";
import React from "react";

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

      {/* ── Ambient background (lightweight) ── */}
      <div style={{ position:"fixed",inset:0,zIndex:0 }}>
        <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 65% 50%,rgba(30,10,60,0.6) 0%,#000 70%)" }} />
        <div style={{ position:"absolute",top:"-10%",left:"-5%",width:"50vw",height:"50vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(110,32,160,0.12) 0%,transparent 65%)",filter:"blur(40px)" }} />
        <div style={{ position:"absolute",bottom:"-15%",right:"-5%",width:"55vw",height:"55vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,160,220,0.1) 0%,transparent 65%)",filter:"blur(50px)" }} />
        <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(165,231,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(165,231,255,0.02) 1px,transparent 1px)",backgroundSize:"60px 60px" }} />
      </div>

      <Navbar />

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ position:"relative",zIndex:20,minHeight:"100vh",display:"flex",alignItems:"center" }}>
        <div style={{ width:"100%",maxWidth:1280,margin:"0 auto",padding:"0 48px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>

          {/* Status pill */}
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:999,background:"rgba(165,231,255,0.06)",border:"1px solid rgba(165,231,255,0.15)",marginBottom:32,marginTop:80 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#a5e7ff",boxShadow:"0 0 8px #a5e7ff",display:"inline-block" }} />
            <span style={{ fontSize:11,fontWeight:700,letterSpacing:"0.14em",color:"#a5e7ff",textTransform:"uppercase" }}>Gemini AI-Powered Matching · Live</span>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize:"clamp(48px,7vw,88px)",fontWeight:900,lineHeight:1,letterSpacing:"-0.04em",marginBottom:28 }}>
            <span style={{ display:"block",color:"#fff" }}>Lost Something?</span>
            <span style={{ display:"block",background:"linear-gradient(135deg,#a5e7ff 0%,#edb1ff 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>AI Will Find It.</span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize:17,lineHeight:1.65,color:"rgba(187,201,207,0.8)",maxWidth:560,marginBottom:44 }}>
            LostNova uses Google Gemini AI to semantically match lost items with found reports. 
            Report your item, and our AI matching engine does the rest — fast, accurate, and reliable.
          </p>

          {/* CTAs */}
          <div style={{ display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center",marginBottom:64 }}>
            <Link href="/register">
              <button style={{ display:"flex",alignItems:"center",gap:8,padding:"14px 32px",borderRadius:16,fontSize:15,fontWeight:700,color:"#0c0f0f",background:"linear-gradient(135deg,#a5e7ff,#edb1ff)",boxShadow:"0 0 32px rgba(165,231,255,0.3)",cursor:"pointer",border:"none",transition:"all .3s" }}>
                <span className="material-symbols-outlined icon-fill" style={{ fontSize:18 }}>person_add</span>
                Get Started Free
              </button>
            </Link>
            <Link href="/login">
              <button style={{ display:"flex",alignItems:"center",gap:8,padding:"14px 28px",borderRadius:16,fontSize:15,fontWeight:600,color:"#bbc9cf",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",backdropFilter:"blur(10px)",transition:"all .3s" }}>
                <span className="material-symbols-outlined" style={{ fontSize:18 }}>login</span>
                Sign In
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display:"flex",gap:48,flexWrap:"wrap",justifyContent:"center" }}>
            {[
              { val:"AI-Powered", label:"Gemini Matching" },
              { val:"Real-time", label:"Instant Alerts" },
              { val:"Secure", label:"JWT + Role-Based" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:24,fontWeight:900,letterSpacing:"-0.03em",background:"linear-gradient(135deg,#fff,rgba(165,231,255,0.9))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>{s.val}</div>
                <div style={{ fontSize:11,fontWeight:600,letterSpacing:"0.1em",color:"#859399",textTransform:"uppercase",marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
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
