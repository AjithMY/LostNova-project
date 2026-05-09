"use client";
import { useState } from "react";
import { useMatches, useConfirmMatch, useRejectMatch, useSubmitClaim } from "@/lib/hooks";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import { timeAgo } from "@/lib/utils";

/* ── Confidence tier ── */
function confidenceTier(score: number) {
  if (score >= 85) return { label: "Very High",  color: "text-[#a5e7ff]", bar: "bg-[#a5e7ff]",  border: "border-[#a5e7ff]/40", bg: "bg-[#a5e7ff]/10"  };
  if (score >= 70) return { label: "High",       color: "text-[#edb1ff]", bar: "bg-[#edb1ff]",  border: "border-[#edb1ff]/40", bg: "bg-[#edb1ff]/10"  };
  if (score >= 55) return { label: "Medium",     color: "text-[#ffd700]", bar: "bg-[#ffd700]",  border: "border-[#ffd700]/40", bg: "bg-[#ffd700]/10"  };
  return              { label: "Low",        color: "text-[#bbc9cf]", bar: "bg-[#bbc9cf]",  border: "border-white/20",     bg: "bg-white/5"       };
}

/* ── Claim Modal ── */
function ClaimModal({ match, onClose }: { match: any; onClose: () => void }) {
  const [msg, setMsg]   = useState("");
  const submitClaim     = useSubmitClaim();
  const { success, error } = useToast();

  const handleSubmit = async () => {
    try {
      await submitClaim.mutateAsync({ match_id: match.id, message: msg });
      success("Claim submitted!", "Your ownership claim has been submitted for review.");
      onClose();
    } catch (err: any) {
      error("Claim failed", err.response?.data?.error || "Could not submit claim.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-panel rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">assignment</span>
          </div>
          <div>
            <h3 className="font-bold text-[#e2e2e2] text-lg">Submit Ownership Claim</h3>
            <p className="text-[#859399] text-xs">Match #{match.id} — {Number(match.score).toFixed(0)}% confidence</p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-sm space-y-1">
          <p className="text-[#bbc9cf]"><span className="text-red-400">Lost:</span> {match.lost_title}</p>
          <p className="text-[#bbc9cf]"><span className="text-[#a5e7ff]">Found:</span> {match.found_title}</p>
        </div>

        <div className="mb-6">
          <label className="text-[#bbc9cf] text-xs font-bold uppercase tracking-wider block mb-2">
            Proof of ownership / message
          </label>
          <textarea
            className="form-input w-full px-4 py-3 text-sm resize-none h-28"
            placeholder="Describe identifying features, serial numbers, or anything that proves ownership…"
            value={msg}
            onChange={e => setMsg(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost px-5 py-2.5 text-sm flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={submitClaim.isPending}
            className="btn-primary px-5 py-2.5 text-sm flex-1 justify-center disabled:opacity-50"
          >
            {submitClaim.isPending
              ? <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Submitting…</>
              : <><span className="material-symbols-outlined text-base">send</span> Submit Claim</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Match Card ── */
function MatchCard({ m, userId }: { m: any; userId?: number }) {
  const [showClaim, setShowClaim] = useState(false);
  const confirmMut = useConfirmMatch();
  const rejectMut  = useRejectMatch();
  const { success, error } = useToast();
  const tier   = confidenceTier(Number(m.score));
  const score  = Number(m.score);

  const isLostOwner  = m.lost_reporter_id  === userId;
  const canAct       = m.status === "pending";
  const alreadyClaimed = m.user_has_claimed > 0;

  const handleConfirm = async () => {
    try {
      await confirmMut.mutateAsync(m.id);
      success("Match confirmed", "You can now submit a claim.");
    } catch { error("Failed", "Could not confirm match."); }
  };

  const handleReject = async () => {
    try {
      await rejectMut.mutateAsync(m.id);
      success("Match rejected", "This match has been dismissed.");
    } catch { error("Failed", "Could not reject match."); }
  };

  return (
    <>
      <article className={`glass-panel rounded-3xl overflow-hidden group transition-all duration-300 hover:border-${tier.color.replace("text-","")}/40 border border-white/8 relative`}>
        {/* Score badge */}
        <div className={`absolute top-4 right-4 z-10 px-3 py-1.5 ${tier.bg} backdrop-blur-md ${tier.color} border ${tier.border} rounded-full text-[11px] font-bold flex items-center gap-1.5`}>
          <span className="material-symbols-outlined text-xs">target</span>
          {score.toFixed(0)}%
          <span className="text-[9px] opacity-70 font-normal">{tier.label}</span>
        </div>

        {/* Confidence bar */}
        <div className="h-1 bg-white/5 w-full">
          <div
            className={`h-full ${tier.bar} transition-all duration-700`}
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="p-5">
          {/* Lost item */}
          <div className="mb-3 p-4 rounded-xl bg-red-900/10 border border-red-500/15">
            <p className="text-[9px] font-bold tracking-widest text-red-400 uppercase mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">search</span> Lost Item
            </p>
            <h4 className="font-bold text-[#e2e2e2] text-sm">{m.lost_title}</h4>
            <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-[#bbc9cf]">
              {m.lost_category && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">category</span>{m.lost_category}
                </span>
              )}
              {m.location_lost && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>{m.location_lost}
                </span>
              )}
              {m.date_lost && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">calendar_today</span>
                  {new Date(m.date_lost).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          </div>

          {/* Similarity bridge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-white/5" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${tier.bg} border ${tier.border} text-[10px] font-bold ${tier.color}`}>
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              AI Match {score.toFixed(0)}%
            </div>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Found item */}
          <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/15">
            <p className="text-[9px] font-bold tracking-widest text-primary uppercase mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">inventory_2</span> Found Item
            </p>
            <h4 className="font-bold text-[#e2e2e2] text-sm">{m.found_title}</h4>
            <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-[#bbc9cf]">
              {m.found_category && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">category</span>{m.found_category}
                </span>
              )}
              {m.location_found && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>{m.location_found}
                </span>
              )}
              {m.date_found && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">calendar_today</span>
                  {new Date(m.date_found).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className={`badge ${m.status === "confirmed" ? "badge-primary" : m.status === "rejected" ? "badge-error" : "badge-secondary"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {m.status}
              </span>
              {m.created_at && (
                <span className="text-[#3c494e] text-[10px]">{timeAgo(m.created_at)}</span>
              )}
            </div>

            {canAct && (
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={rejectMut.isPending}
                  className="px-3 py-1.5 rounded-lg bg-[#ffb4ab]/10 border border-[#ffb4ab]/25 text-[#ffb4ab] text-xs font-semibold hover:bg-[#ffb4ab]/20 transition-all disabled:opacity-50"
                >
                  Not Mine
                </button>
                {isLostOwner && !alreadyClaimed && (
                  <button
                    onClick={() => setShowClaim(true)}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
                  >
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">assignment</span> Claim
                    </span>
                  </button>
                )}
                {isLostOwner && alreadyClaimed && (
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 text-[#859399] text-xs">
                    Claimed ✓
                  </span>
                )}
              </div>
            )}

            {m.status === "confirmed" && isLostOwner && !alreadyClaimed && (
              <button
                onClick={() => setShowClaim(true)}
                className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">assignment</span> Submit Claim
                </span>
              </button>
            )}
          </div>
        </div>
      </article>

      {showClaim && <ClaimModal match={m} onClose={() => setShowClaim(false)} />}
    </>
  );
}

/* ── Matches Page ── */
export default function MatchesPage() {
  const { data: matches, isLoading } = useMatches();
  const user = useAuthStore(s => s.user);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all");

  const filtered = (matches ?? []).filter((m: any) => filter === "all" || m.status === filter);

  const counts = {
    all:       matches?.length ?? 0,
    pending:   matches?.filter((m: any) => m.status === "pending").length   ?? 0,
    confirmed: matches?.filter((m: any) => m.status === "confirmed").length ?? 0,
    rejected:  matches?.filter((m: any) => m.status === "rejected").length  ?? 0,
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-extrabold text-[#e2e2e2] tracking-tighter">AI Match Engine</h1>
            <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-primary text-[11px] font-bold tracking-widest uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(71,214,255,0.2)]">
              <span className="material-symbols-outlined text-sm">bolt</span> Live
            </span>
          </div>
          <p className="text-[#bbc9cf] text-sm">
            Intelligent matches between lost and found items. {counts.pending > 0 && (
              <span className="text-[#a5e7ff] font-semibold">{counts.pending} pending review.</span>
            )}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {([
          { key: "all",       label: "Total Matches",  icon: "auto_awesome", color: "text-[#e2e2e2]" },
          { key: "pending",   label: "Pending",        icon: "pending",      color: "text-[#ffd700]" },
          { key: "confirmed", label: "Confirmed",      icon: "check_circle", color: "text-[#a5e7ff]" },
          { key: "rejected",  label: "Not Mine",       icon: "cancel",       color: "text-[#ffb4ab]" },
        ] as const).map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`glass-panel rounded-2xl p-4 text-left transition-all hover:border-white/20 ${filter === s.key ? "border-white/20 bg-white/5" : ""}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`material-symbols-outlined text-lg ${s.color}`}>{s.icon}</span>
              <span className={`text-2xl font-extrabold ${s.color}`}>{counts[s.key]}</span>
            </div>
            <p className="text-[#859399] text-xs font-semibold uppercase tracking-wider">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-3xl h-64" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#859399]">
          <span className="material-symbols-outlined text-7xl block mb-4 opacity-20">auto_awesome</span>
          <p className="text-lg font-semibold mb-2">
            {filter === "all" ? "No Matches Found" : `No ${filter} matches`}
          </p>
          <p className="text-sm">The AI engine generates matches automatically as items are reported.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filtered.map((m: any) => (
            <MatchCard key={m.id} m={m} userId={user?.id} />
          ))}
        </div>
      )}
    </div>
  );
}
