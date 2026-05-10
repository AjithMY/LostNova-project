"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "", role: "student" });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim())     { setError("Name is required"); return; }
    if (!form.email)           { setError("Email is required"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (!agreed)               { setError("You must agree to the Terms of Service"); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.register(form.name.trim(), form.email, form.password, form.role);
      setAuth(data.user, data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0c0f0f] text-[#e2e2e2] min-h-screen w-full flex font-sans antialiased">
      <main className="w-full h-screen flex flex-col md:flex-row overflow-hidden">

        {/* Left: Brand panel */}
        <section className="hidden md:flex md:w-1/2 relative bg-[#0c0f0f] items-center justify-center p-16 overflow-hidden border-r border-white/5">
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[140px] bg-[#6e208c]/15 top-[-100px] left-[-200px] z-0" />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] bg-[#00d2ff]/10 bottom-[-100px] right-[-100px] z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent,rgba(12,15,15,0.9))] z-10" />
          <div className="relative z-20 text-center max-w-sm">
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-[#121414]/50 border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(110,32,140,0.3)]">
              <span className="material-symbols-outlined text-[#edb1ff] icon-fill text-4xl">hub</span>
            </div>
            <h1 className="text-5xl font-extrabold text-[#edb1ff] tracking-tighter mb-4">Join LostNova</h1>
            <p className="text-[#bbc9cf] leading-relaxed">Create your account and join the AI-powered lost and found recovery network.</p>
            <div className="mt-10 space-y-4 text-left">
              {[
                { icon: "auto_awesome", text: "AI-powered item matching in real-time" },
                { icon: "security",     text: "End-to-end encrypted claim verification" },
                { icon: "notifications_active", text: "Instant alerts on match discovery" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#a5e7ff] text-lg">{f.icon}</span>
                  <span className="text-[#bbc9cf] text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right: Form */}
        <section className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-16 overflow-y-auto relative bg-[#121414]">
          <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-[#edb1ff]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 w-full max-w-[440px]">
            <div className="md:hidden flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-[#edb1ff] text-3xl icon-fill">hub</span>
              <span className="text-2xl font-bold text-[#edb1ff] tracking-tighter">LostNova</span>
            </div>

            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-[#bbc9cf] text-sm">Fill in your details to get started.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[#bbc9cf] text-xs font-bold tracking-widest uppercase mb-2">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3c494e] text-xl">person</span>
                  <input className="form-input pl-11" placeholder="Alex Chen" type="text" value={form.name} onChange={e => set("name", e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-[#bbc9cf] text-xs font-bold tracking-widest uppercase mb-2">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3c494e] text-xl">mail</span>
                  <input className="form-input pl-11" placeholder="alex@university.edu" type="email" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-[#bbc9cf] text-xs font-bold tracking-widest uppercase mb-2">Account Type</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3c494e] text-xl">badge</span>
                  <select className="form-input pl-11 appearance-none" value={form.role} onChange={e => set("role", e.target.value)}>
                    <option value="student">Student</option>
                    <option value="staff">Staff / Faculty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#bbc9cf] text-xs font-bold tracking-widest uppercase mb-2">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3c494e] text-xl">lock</span>
                  <input className="form-input pl-11 pr-12" placeholder="Min. 8 characters" type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3c494e] hover:text-[#e2e2e2] transition-colors">
                    <span className="material-symbols-outlined text-lg">{showPass ? "visibility" : "visibility_off"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#bbc9cf] text-xs font-bold tracking-widest uppercase mb-2">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3c494e] text-xl">lock_reset</span>
                  <input className="form-input pl-11" placeholder="Repeat password" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 rounded border-[#3c494e] bg-transparent text-[#edb1ff] focus:ring-[#edb1ff]" />
                <span className="text-[#bbc9cf] text-sm">
                  I agree to the <a href="#" className="text-[#edb1ff] hover:underline">Terms of Service</a> and <a href="#" className="text-[#edb1ff] hover:underline">Privacy Policy</a>
                </span>
              </label>

              {error && (
                <div className="p-3 rounded-xl bg-red-900/20 border border-red-500/30 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400 text-base">error</span>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-[#edb1ff] to-[#a5e7ff] text-[#0c0f0f] font-bold py-3.5 rounded-2xl shadow-[0_0_24px_rgba(237,177,255,0.25)] hover:shadow-[0_0_36px_rgba(237,177,255,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Creating Account…</>
                ) : (
                  <>Create Account <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span></>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#bbc9cf]">
              Already have an account? <Link href="/login" className="text-[#a5e7ff] hover:underline font-semibold">Sign In</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
