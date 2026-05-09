"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password are required"); return; }
    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.login(email, password);
      setAuth(data.user, data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121414] text-[#e2e2e2] min-h-screen w-full flex font-sans antialiased">
      <main className="w-full h-screen flex flex-col md:flex-row overflow-hidden">

        {/* Left: Brand panel */}
        <section className="hidden md:flex md:w-1/2 relative bg-[#0c0f0f] items-center justify-center p-16 overflow-hidden border-r border-white/5">
          <div className="absolute w-[600px] h-[600px] bg-[#00d2ff] rounded-full blur-[120px] top-0 left-[-150px] opacity-20 animate-nebula-slow z-0" />
          <div className="absolute w-[500px] h-[500px] bg-[#6e208c] rounded-full blur-[100px] bottom-[-100px] right-[-100px] opacity-30 animate-nebula-slower z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent,_rgba(12,15,15,0.9))] z-10" />
          <div className="relative z-20 text-center flex flex-col items-center">
            <div className="w-24 h-24 mb-8 rounded-2xl bg-[#121414]/30 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,210,255,0.15)] relative">
              <span className="material-symbols-outlined text-primary icon-fill text-5xl">auto_awesome</span>
            </div>
            <h1 className="text-[48px] font-extrabold text-primary tracking-tighter mb-6 drop-shadow-[0_0_15px_rgba(0,210,255,0.3)]">
              LostNova
            </h1>
            <p className="text-[#bbc9cf] max-w-sm mx-auto leading-relaxed text-base">
              Initiate neural handshake. Enter your credentials to access the central intelligence hub for lost asset retrieval.
            </p>
          </div>
        </section>

        {/* Right: Login form */}
        <section className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-16 relative bg-[#0c0f0f] md:bg-[#121414]">
          <div className="md:hidden absolute inset-0 z-0">
            <div className="absolute w-full h-[400px] bg-[#00d2ff]/10 rounded-full blur-[80px] top-[-100px]" />
            <div className="absolute w-full h-[400px] bg-[#6e208c]/10 rounded-full blur-[80px] bottom-[-100px]" />
          </div>

          <div className="md:hidden relative z-10 flex flex-col items-center mb-10">
            <span className="material-symbols-outlined text-primary text-4xl icon-fill mb-4">auto_awesome</span>
            <h1 className="text-[24px] font-bold text-primary tracking-tighter">LostNova</h1>
          </div>

          {/* Login card */}
          <div className="relative z-10 w-full max-w-[440px] bg-[#1a1c1c]/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <header className="mb-8">
              <h2 className="text-[32px] font-bold text-[#e2e2e2] mb-2">Operator Login</h2>
              <p className="text-[#bbc9cf] text-sm">Authenticate to synchronize with the network.</p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[#bbc9cf] text-[11px] font-bold tracking-widest uppercase" htmlFor="email">Network Identity</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3c494e] group-focus-within:text-primary transition-colors">mail</span>
                  <input
                    id="email"
                    className="w-full bg-[#1e2020]/50 border border-[#3c494e]/30 rounded-lg pl-12 pr-4 py-3 text-[#e2e2e2] text-base focus:outline-none focus:border-primary focus:bg-[#1e2020] focus:shadow-[0_0_15px_rgba(0,210,255,0.15)] transition-all placeholder-[#3c494e]/50"
                    placeholder="operator@node.ai"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[#bbc9cf] text-[11px] font-bold tracking-widest uppercase" htmlFor="password">Passkey</label>
                  <a className="text-primary hover:text-[#b6ebff] transition-colors text-sm" href="#">Recover Access</a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3c494e] group-focus-within:text-primary transition-colors">lock</span>
                  <input
                    id="password"
                    className="w-full bg-[#1e2020]/50 border border-[#3c494e]/30 rounded-lg pl-12 pr-12 py-3 text-[#e2e2e2] text-base focus:outline-none focus:border-primary focus:bg-[#1e2020] focus:shadow-[0_0_15px_rgba(0,210,255,0.15)] transition-all placeholder-[#3c494e]/50"
                    placeholder="••••••••••••"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3c494e] hover:text-[#e2e2e2] transition-colors" type="button" onClick={() => setShowPass(!showPass)}>
                    <span className="material-symbols-outlined text-sm">{showPass ? "visibility" : "visibility_off"}</span>
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-900/20 border border-red-500/30 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400 text-base">error</span>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-gradient-to-r from-[#00d2ff] to-[#6e208c] text-[#00566a] font-semibold rounded-lg py-3.5 shadow-[0_0_20px_rgba(0,210,255,0.2)] hover:shadow-[0_0_30px_rgba(0,210,255,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Authenticating…</>
                ) : (
                  <>Initialize Session <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8 w-full opacity-60">
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-white/20 flex-1" />
              <span className="text-[#3c494e] text-[10px] font-bold tracking-widest uppercase">External Link</span>
              <div className="h-px bg-gradient-to-l from-transparent via-white/20 to-white/20 flex-1" />
            </div>

            <p className="mt-4 text-center text-sm text-[#bbc9cf]">
              Unregistered entity?{" "}
              <Link href="/register" className="text-primary hover:text-[#b6ebff] hover:underline transition-all ml-1 font-semibold">
                Establish Node
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
