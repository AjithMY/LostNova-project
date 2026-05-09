"use client";
import { useState } from "react";
import { useClaims, useUpdateClaim } from "@/lib/hooks";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import { formatDate, timeAgo } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  pending:  "badge-secondary",
  approved: "badge-primary",
  rejected: "badge-error",
};

export default function ClaimsPage() {
  const [tab, setTab] = useState<"All" | "pending" | "approved" | "rejected">("All");
  const { data: claims, isLoading } = useClaims();
  const updateMut = useUpdateClaim();
  const user = useAuthStore(s => s.user);
  const { success, error } = useToast();
  const isAdmin = user?.role === "admin";

  const filtered = (claims ?? []).filter((c: any) => tab === "All" || c.status === tab);

  const counts = {
    total:    claims?.length ?? 0,
    pending:  claims?.filter((c: any) => c.status === "pending").length  ?? 0,
    approved: claims?.filter((c: any) => c.status === "approved").length ?? 0,
    rejected: claims?.filter((c: any) => c.status === "rejected").length ?? 0,
  };

  const handleUpdate = async (id: number, status: "approved" | "rejected") => {
    try {
      await updateMut.mutateAsync({ id, status });
      success(`Claim ${status}`, status === "approved" ? "Item will be marked as recovered." : "Claim has been dismissed.");
    } catch {
      error("Action failed", "Could not update claim status.");
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tighter mb-1">
          {isAdmin ? "Claims Management" : "My Claims"}
        </h1>
        <p className="text-[#bbc9cf] text-sm">
          {isAdmin ? "Review and verify ownership claims submitted by users." : "Track the status of your ownership claims."}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total",    value: counts.total,    icon: "assignment",      color: "text-[#e2e2e2]" },
          { label: "Pending",  value: counts.pending,  icon: "pending_actions", color: "text-[#ffd700]" },
          { label: "Approved", value: counts.approved, icon: "check_circle",    color: "text-[#a5e7ff]" },
          { label: "Rejected", value: counts.rejected, icon: "cancel",          color: "text-[#ffb4ab]" },
        ].map(s => (
          <div key={s.label} className="glass-panel rounded-2xl p-5 card-hover">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[#bbc9cf] text-[10px] font-bold tracking-widest uppercase">{s.label}</span>
              <span className={`material-symbols-outlined ${s.color} text-lg`}>{s.icon}</span>
            </div>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["All", "pending", "approved", "rejected"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
              tab === t
                ? "bg-[#a5e7ff]/15 text-[#a5e7ff] border border-[#a5e7ff]/30"
                : "text-[#bbc9cf] hover:text-white bg-white/[0.03] border border-white/8"
            }`}
          >
            {t} {t === "pending" && counts.pending > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#ffd700]/20 text-[#ffd700] text-[10px]">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 rounded-lg h-14" />
            ))}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Lost Item</th>
                <th>Found Item</th>
                {isAdmin && <th>Claimant</th>}
                <th>Message</th>
                <th>Submitted</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id}>
                  <td className="font-mono text-[#a5e7ff] font-semibold text-xs">
                    CLM-{String(c.id).padStart(3, "0")}
                  </td>
                  <td className="text-[#e2e2e2] font-semibold max-w-[160px] truncate">{c.lost_title || "—"}</td>
                  <td className="text-[#bbc9cf] max-w-[160px] truncate">{c.found_title || "—"}</td>
                  {isAdmin && (
                    <td className="text-[#bbc9cf] text-sm">
                      <div>
                        <p className="text-[#e2e2e2] font-semibold text-xs">{c.claimant_name || "—"}</p>
                        <p className="text-[#859399] text-[10px]">{c.claimant_email || ""}</p>
                      </div>
                    </td>
                  )}
                  <td className="text-[#bbc9cf] text-sm max-w-[200px]">
                    {c.message ? (
                      <span className="truncate block max-w-[200px]" title={c.message}>{c.message}</span>
                    ) : (
                      <span className="text-[#3c494e] italic text-xs">No message</span>
                    )}
                  </td>
                  <td className="text-[#859399] text-xs">{c.created_at ? timeAgo(c.created_at) : "—"}</td>
                  <td>
                    <span className={`badge ${statusStyle[c.status] || "badge-neutral"}`}>
                      {c.status}
                    </span>
                  </td>
                  {/* Only admin sees action buttons */}
                  {isAdmin && (
                    <td>
                      {c.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(c.id, "approved")}
                            disabled={updateMut.isPending}
                            className="px-3 py-1.5 rounded-lg bg-[#a5e7ff]/10 text-[#a5e7ff] text-xs font-semibold hover:bg-[#a5e7ff]/20 transition-colors border border-[#a5e7ff]/20 disabled:opacity-50 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">check</span> Approve
                          </button>
                          <button
                            onClick={() => handleUpdate(c.id, "rejected")}
                            disabled={updateMut.isPending}
                            className="px-3 py-1.5 rounded-lg bg-[#ffb4ab]/10 text-[#ffb4ab] text-xs font-semibold hover:bg-[#ffb4ab]/20 transition-colors border border-[#ffb4ab]/20 disabled:opacity-50 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">close</span> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#3c494e] text-xs italic">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center text-[#859399]">
            <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">assignment</span>
            <p className="font-semibold mb-1">No claims in this category</p>
            <p className="text-sm">
              {tab === "All"
                ? isAdmin ? "No claims have been submitted yet." : "You haven't submitted any claims yet."
                : `No ${tab} claims to display.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
