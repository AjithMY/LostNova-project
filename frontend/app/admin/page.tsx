"use client";
import Link from "next/link";
import { useAdminStats, useAdminUsers, useActivityLogs } from "@/lib/hooks";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { timeAgo } from "@/lib/utils";

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: logs,  isLoading: logsLoading  } = useActivityLogs();
  const qc = useQueryClient();
  const { success, error } = useToast();

  const handleRunMatch = async () => {
    try {
      await adminAPI.runMatch();
      success("Match engine triggered", "Scanning all open items for new matches…");
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["matches"] });
        qc.invalidateQueries({ queryKey: ["stats"] });
        qc.invalidateQueries({ queryKey: ["activity"] });
      }, 3000);
    } catch {
      error("Failed", "Could not trigger the match engine.");
    }
  };

  const statCards = [
    { label: "Total Lost",       value: stats?.total_lost       ?? 0, icon: "search",        color: "text-[#ffb4ab]",  bg: "bg-[#ffb4ab]/10" },
    { label: "Total Found",      value: stats?.total_found      ?? 0, icon: "inventory_2",   color: "text-[#a5e7ff]",  bg: "bg-[#a5e7ff]/10" },
    { label: "Recovered",        value: stats?.total_recovered  ?? 0, icon: "verified_user", color: "text-[#a5e7ff]",  bg: "bg-[#a5e7ff]/10" },
    { label: "Total Matches",    value: stats?.total_matches    ?? 0, icon: "auto_awesome",  color: "text-[#edb1ff]",  bg: "bg-[#edb1ff]/10" },
    { label: "Pending Claims",   value: stats?.pending_claims   ?? 0, icon: "pending",       color: "text-[#ffd700]",  bg: "bg-[#ffd700]/10" },
    { label: "Total Users",      value: stats?.total_users      ?? 0, icon: "group",         color: "text-[#e2e2e2]",  bg: "bg-white/5"      },
    { label: "High Conf. Matches",value: stats?.high_confidence_matches ?? 0, icon: "target", color: "text-[#a5e7ff]", bg: "bg-[#a5e7ff]/10" },
    { label: "Recovery Rate",    value: `${stats?.recovery_rate ?? 0}%`, icon: "percent",    color: "text-[#edb1ff]",  bg: "bg-[#edb1ff]/10" },
  ];

  const recentLogs = (logs ?? []).slice(0, 6);

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[38px] font-extrabold text-[#e2e2e2] tracking-tighter">System Control</h1>
            <span className="px-3 py-1 bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-full text-[#ffb4ab] text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">admin_panel_settings</span> Admin
            </span>
          </div>
          <p className="text-[#bbc9cf] text-sm">Real-time platform health and operational metrics.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRunMatch}
            className="btn-ghost px-4 py-2.5 text-sm"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Run Matcher
          </button>
          <Link href="/admin/users">
            <button className="btn-primary px-5 py-2.5 text-sm">
              <span className="material-symbols-outlined text-base">group</span>
              Manage Users
            </button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {statsLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 rounded-2xl h-24" />
            ))
          : statCards.map(s => (
              <div key={s.label} className="glass-panel rounded-2xl p-5 card-hover">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[#859399] text-[9px] font-bold tracking-widest uppercase leading-tight">{s.label}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                    <span className={`material-symbols-outlined text-sm ${s.color}`}>{s.icon}</span>
                  </div>
                </div>
                <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))
        }
      </div>

      {/* Quick nav + recent logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick nav */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#859399] uppercase tracking-widest mb-4">Quick Actions</h3>
          {[
            { label: "User Management",  icon: "group",            href: "/admin/users",          color: "text-[#a5e7ff]" },
            { label: "View All Matches", icon: "auto_awesome",     href: "/dashboard/matches",    color: "text-[#edb1ff]" },
            { label: "Review Claims",    icon: "assignment",       href: "/dashboard/claims",     color: "text-[#ffd700]" },
            { label: "Audit Log",        icon: "history_edu",      href: "/dashboard/audit",      color: "text-[#bbc9cf]" },
          ].map(nav => (
            <Link key={nav.href} href={nav.href}>
              <div className="glass-panel rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-white/20 transition-all cursor-pointer group">
                <span className={`material-symbols-outlined ${nav.color}`}>{nav.icon}</span>
                <span className="text-[#e2e2e2] font-semibold text-sm">{nav.label}</span>
                <span className="material-symbols-outlined text-[#3c494e] text-base ml-auto group-hover:text-[#e2e2e2] transition-colors">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent logs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#859399] uppercase tracking-widest">Recent Activity</h3>
            <Link href="/dashboard/audit" className="text-primary text-xs font-semibold hover:text-[#edb1ff] transition-colors">
              View all →
            </Link>
          </div>
          <div className="glass-panel rounded-2xl overflow-hidden">
            {logsLoading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white/5 rounded-lg h-10" />
                ))}
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="py-10 text-center text-[#859399] text-sm">No activity recorded yet</div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#a5e7ff] text-sm">info</span>
                      <div>
                        <p className="text-[#e2e2e2] text-xs font-semibold">{log.action?.replace(/_/g, " ")}</p>
                        <p className="text-[#859399] text-[10px]">{log.user_name || log.user_email || "system"}</p>
                      </div>
                    </div>
                    <span className="text-[#3c494e] text-[10px]">{log.created_at ? timeAgo(log.created_at) : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
