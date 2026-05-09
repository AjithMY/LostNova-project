"use client";
import { useActivityLogs } from "@/lib/hooks";
import { useAuthStore } from "@/store/authStore";
import { timeAgo } from "@/lib/utils";

const actionMeta: Record<string, { icon: string; badge: string; label: string }> = {
  CLAIM_APPROVED:      { icon: "check_circle",  badge: "badge-primary",   label: "Claim Approved" },
  CLAIM_REJECTED:      { icon: "cancel",         badge: "badge-error",     label: "Claim Rejected" },
  CLAIM_SUBMITTED:     { icon: "assignment",     badge: "badge-secondary", label: "Claim Submitted" },
  ITEM_REPORTED_LOST:  { icon: "search",         badge: "badge-error",     label: "Lost Item Reported" },
  ITEM_REPORTED_FOUND: { icon: "inventory_2",    badge: "badge-primary",   label: "Found Item Reported" },
  ITEM_DELETED_LOST:   { icon: "delete",         badge: "badge-neutral",   label: "Lost Item Deleted" },
  ITEM_DELETED_FOUND:  { icon: "delete",         badge: "badge-neutral",   label: "Found Item Deleted" },
  AI_MATCH_GENERATED:  { icon: "auto_awesome",   badge: "badge-secondary", label: "Match Generated" },
  MATCH_ENGINE_RUN:    { icon: "memory",          badge: "badge-neutral",   label: "Engine Run" },
  USER_LOGIN:          { icon: "login",           badge: "badge-neutral",   label: "Login" },
  USER_REGISTERED:     { icon: "person_add",      badge: "badge-primary",   label: "Registration" },
  USER_ROLE_CHANGED:   { icon: "manage_accounts", badge: "badge-secondary", label: "Role Changed" },
  USER_DEACTIVATED:    { icon: "person_off",      badge: "badge-error",     label: "User Deactivated" },
};

export default function AuditPage() {
  const { data: logs, isLoading, isError } = useActivityLogs();
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === "admin";

  return (
    <div className="p-8 lg:p-12 max-w-[1100px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tighter mb-1">
            {isAdmin ? "Audit Log" : "My Activity"}
          </h1>
          <p className="text-[#bbc9cf] text-sm">
            {isAdmin
              ? "Complete immutable record of all system events and user actions."
              : "A log of your personal activity on the platform."
            }
          </p>
        </div>
        {logs && (
          <div className="glass-panel rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-extrabold text-[#a5e7ff]">{logs.length}</p>
            <p className="text-[#859399] text-xs font-bold uppercase tracking-wider">Events</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-2xl h-16" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-[#859399]">
          <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">error</span>
          <p className="font-semibold">Failed to load activity logs</p>
        </div>
      ) : (logs ?? []).length === 0 ? (
        <div className="text-center py-16 text-[#859399]">
          <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">history_edu</span>
          <p className="font-semibold">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {(logs ?? []).map((log: any, idx: number) => {
            const meta = actionMeta[log.action] || { icon: "info", badge: "badge-neutral", label: log.action };
            return (
              <div
                key={log.id}
                className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 card-hover animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#a5e7ff] text-base">{meta.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className={`badge ${meta.badge} text-[9px]`}>{meta.label}</span>
                    {log.entity_id > 0 && (
                      <span className="text-[#859399] text-[10px] font-mono">→ #{log.entity_id}</span>
                    )}
                  </div>
                  <p className="text-[#bbc9cf] text-sm">
                    {isAdmin && (
                      <span className="text-[#e2e2e2] font-semibold">{log.user_name || log.user_email || "system"} </span>
                    )}
                    {log.entity_type && log.entity_type !== "system" && (
                      <span className="text-[#3c494e] text-xs">on {log.entity_type}</span>
                    )}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[#e2e2e2] text-xs font-semibold">{log.created_at ? timeAgo(log.created_at) : "—"}</p>
                  {log.ip_address && isAdmin && (
                    <p className="text-[#3c494e] text-[10px] font-mono mt-0.5">{log.ip_address}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
