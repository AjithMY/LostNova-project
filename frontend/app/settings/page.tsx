"use client";
import { useAuthStore } from "@/store/authStore";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="p-8 md:p-16 max-w-[1280px] mx-auto w-full relative">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <header className="mb-16 flex items-center justify-between">
        <div>
          <h2 className="text-[48px] font-extrabold text-[#e2e2e2] tracking-tighter">Profile Settings</h2>
          <p className="text-[#bbc9cf] text-base mt-2">Manage your operator node configurations and security protocols.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Profile card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full border-2 border-primary shadow-[0_0_30px_rgba(165,231,255,0.4)] z-10 relative bg-[#1e2020] flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-primary/50">person</span>
              </div>
              <div className="absolute inset-0 rounded-full border border-primary/50 scale-110 animate-pulse" />
            </div>
            <h3 className="text-[32px] font-bold text-[#e2e2e2] relative z-10">{user?.name || "Unknown"}</h3>
            <p className="text-[#bbc9cf] text-sm mt-1">{user?.email || ""}</p>
            <div className="flex items-center gap-2 mt-3 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full relative z-10">
              <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
              <span className="text-primary text-[11px] font-bold tracking-widest uppercase">{user?.role || "Student"}</span>
            </div>
          </div>
        </div>

        {/* Right: Settings sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* Security */}
          <section className="glass-panel rounded-3xl p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">security</span>
              <h3 className="text-[24px] font-bold text-[#e2e2e2]">Account Security</h3>
            </div>
            <div className="space-y-6">
              {[
                { label: "Two-Factor Authentication (2FA)", desc: "Requires an authentication code when logging in from unrecognized devices.", btnLabel: "Configure", btnStyle: "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20" },
                { label: "Change Password", desc: "Update your passkey to maintain security.", btnLabel: "Update", btnStyle: "bg-[#37393a] border border-white/10 text-[#e2e2e2] hover:border-white/30" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#1a1c1c] border border-[#1a1a1a]">
                  <div>
                    <p className="font-semibold text-[#e2e2e2]">{item.label}</p>
                    <p className="text-[#bbc9cf] text-sm mt-1">{item.desc}</p>
                  </div>
                  <button className={`shrink-0 px-4 py-2 rounded-lg transition-colors ${item.btnStyle}`}>{item.btnLabel}</button>
                </div>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section className="glass-panel rounded-3xl p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">notifications_active</span>
              <h3 className="text-[24px] font-bold text-[#e2e2e2]">Notification Protocols</h3>
            </div>
            <div className="space-y-6">
              {[
                { label: "High-Priority Matches", desc: "Immediate alerts when AI confirms a >95% probability match.", on: true },
                { label: "Daily Audit Summaries",  desc: "Receive a compiled report of all node activity every 24 hours.", on: false },
                { label: "System Anomalies",       desc: "Alerts concerning potential security breaches or data sync failures.", on: true },
              ].map((t, i) => (
                <div key={t.label}>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="pr-4">
                      <p className="font-semibold text-[#e2e2e2] group-hover:text-secondary transition-colors">{t.label}</p>
                      <p className="text-[#bbc9cf] text-sm mt-1">{t.desc}</p>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${t.on ? "bg-secondary" : "bg-[#37393a] border border-white/10"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-[#121414] transition-transform ${t.on ? "translate-x-6" : "translate-x-1"}`} />
                    </div>
                  </label>
                  {i < 2 && <div className="h-px w-full bg-[#1a1a1a] mt-6" />}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
