"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import api from "@/lib/api";

interface NotifPref { label: string; desc: string; enabled: boolean; key: string; }

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { success, error } = useToast();

  /* ── Password change ── */
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  /* ── Notification prefs ── */
  const [prefs, setPrefs] = useState<NotifPref[]>([
    { key: "high_match",   label: "High-Confidence Matches", desc: "Alert when AI confidence is ≥85%.",          enabled: true  },
    { key: "any_match",    label: "Any New Match",           desc: "Notify on every match regardless of score.", enabled: false },
    { key: "claim_update", label: "Claim Status Updates",    desc: "When your claim is approved or rejected.",   enabled: true  },
    { key: "system",       label: "System Announcements",    desc: "Maintenance and feature updates.",           enabled: false },
  ]);

  const togglePref = (key: string) =>
    setPrefs(p => p.map(pr => pr.key === key ? { ...pr, enabled: !pr.enabled } : pr));

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      error("Passwords don't match", "New password and confirm password must be identical.");
      return;
    }
    if (pwForm.next.length < 8) {
      error("Password too short", "Minimum 8 characters required.");
      return;
    }
    setPwLoading(true);
    try {
      await api.put("/auth/password", { current_password: pwForm.current, new_password: pwForm.next });
      success("Password updated", "Your password has been changed successfully.");
      setPwForm({ current: "", next: "", confirm: "" });
      setShowPw(false);
    } catch (err: any) {
      error("Update failed", err.response?.data?.error || "Could not update password.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-14 max-w-[1100px] mx-auto w-full relative">

      <header className="mb-12">
        <h1 className="text-[42px] font-extrabold text-[#e2e2e2] tracking-tighter mb-1">Settings</h1>
        <p className="text-[#bbc9cf] text-sm">Manage your account and notification preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Profile card ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative mb-5">
              <div className="w-24 h-24 rounded-full border-2 border-primary shadow-[0_0_30px_rgba(165,231,255,0.4)] z-10 relative bg-[#1e2020] flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-primary/50">person</span>
              </div>
              <div className="absolute inset-0 rounded-full border border-primary/40 scale-110 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-[#e2e2e2]">{user?.name || "—"}</h3>
            <p className="text-[#bbc9cf] text-sm mt-1">{user?.email || ""}</p>
            <div className="flex items-center gap-2 mt-3 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
              <span className="text-primary text-[11px] font-bold tracking-widest uppercase">{user?.role || "Student"}</span>
            </div>
          </div>

          {/* Account info */}
          <div className="glass-panel rounded-3xl p-5 space-y-3">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#859399] mb-2">Account Info</p>
            {[
              { label: "Name",  value: user?.name  || "—" },
              { label: "Email", value: user?.email || "—" },
              { label: "Role",  value: user?.role  || "—" },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <span className="text-[#bbc9cf] text-sm">{row.label}</span>
                <span className="text-[#e2e2e2] text-sm font-semibold capitalize">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Settings sections ── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Password change */}
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">lock</span>
                <h3 className="text-xl font-bold text-[#e2e2e2]">Change Password</h3>
              </div>
              <button
                onClick={() => setShowPw(!showPw)}
                className="btn-ghost px-4 py-2 text-sm"
              >
                {showPw ? "Cancel" : "Update"}
              </button>
            </div>

            {showPw && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {[
                  { label: "Current Password",  key: "current" as const, placeholder: "Enter current password" },
                  { label: "New Password",       key: "next"    as const, placeholder: "Min 8 characters" },
                  { label: "Confirm New Password", key: "confirm" as const, placeholder: "Repeat new password" },
                ].map(f => (
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <label className="text-[#bbc9cf] text-xs font-semibold uppercase tracking-wider">{f.label}</label>
                    <input
                      type="password"
                      className="form-input px-4 py-3"
                      placeholder={f.placeholder}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                      required
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
                >
                  {pwLoading ? (
                    <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Updating…</>
                  ) : (
                    <><span className="material-symbols-outlined text-base">check</span> Save Password</>
                  )}
                </button>
              </form>
            )}

            {!showPw && (
              <p className="text-[#859399] text-sm">Click "Update" to change your account password.</p>
            )}
          </section>

          {/* Notification prefs */}
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[#edb1ff]">notifications_active</span>
              <h3 className="text-xl font-bold text-[#e2e2e2]">Notification Preferences</h3>
            </div>
            <div className="space-y-5">
              {prefs.map((pref, i) => (
                <div key={pref.key}>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="pr-6">
                      <p className="font-semibold text-[#e2e2e2] text-sm group-hover:text-[#edb1ff] transition-colors">{pref.label}</p>
                      <p className="text-[#859399] text-xs mt-0.5">{pref.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePref(pref.key)}
                      className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                        pref.enabled ? "bg-[#edb1ff]" : "bg-[#333535] border border-white/10"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-[#121414] transition-all duration-300 ${
                        pref.enabled ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </label>
                  {i < prefs.length - 1 && <div className="h-px bg-white/5 mt-5" />}
                </div>
              ))}
            </div>
          </section>

          {/* Security info */}
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-primary">security</span>
              <h3 className="text-xl font-bold text-[#e2e2e2]">Security</h3>
            </div>
            <div className="p-4 rounded-xl bg-[#1a1c1c] border border-white/5 flex items-start gap-4">
              <span className="material-symbols-outlined text-[#859399] text-2xl mt-0.5">shield</span>
              <div>
                <p className="text-[#e2e2e2] font-semibold text-sm">Two-Factor Authentication</p>
                <p className="text-[#859399] text-xs mt-1">2FA via authenticator app will be available in an upcoming update.</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold tracking-widest uppercase text-[#edb1ff] bg-[#edb1ff]/10 border border-[#edb1ff]/20 px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-xs">schedule</span> Coming Soon
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
