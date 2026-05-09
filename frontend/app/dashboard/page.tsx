"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStats, useAllItems } from "@/lib/hooks";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/lib/debounce";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />;
}

const catIcon: Record<string, string> = {
  Electronics: "devices", Accessories: "watch", Documents: "badge",
  Clothing: "checkroom", Bags: "backpack", Keys: "vpn_key", Other: "category",
};

const statusBadge: Record<string, { badge: string; label: string }> = {
  open:      { badge: "badge-neutral",   label: "Open" },
  matched:   { badge: "badge-secondary", label: "Matched" },
  recovered: { badge: "badge-primary",   label: "Recovered" },
  claimed:   { badge: "badge-secondary", label: "Claimed" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: items, isLoading: itemsLoading  } = useAllItems(
    debouncedSearch ? { search: debouncedSearch } : undefined
  );

  const recentItems = items?.slice(0, 8) ?? [];

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchInput.trim()) {
      router.push(`/dashboard/inventory?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto p-8 lg:p-12 space-y-10">
      {/* Hero search bar */}
      <header>
        <div className="glass-panel rounded-2xl p-3.5 gradient-border-primary shadow-[0_0_30px_rgba(165,231,255,0.08)] flex items-center gap-3">
          <span className="material-symbols-outlined text-primary ml-1">search</span>
          <input
            className="flex-1 bg-transparent border-none text-[#e2e2e2] focus:ring-0 font-sans text-base placeholder-[#bbc9cf]/40 outline-none"
            placeholder="Search items by name, category, or location…"
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKey}
          />
          {searchInput && (
            <button onClick={() => setSearchInput("")} className="text-[#859399] hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <Link href={`/dashboard/inventory${searchInput ? `?search=${encodeURIComponent(searchInput)}` : ""}`}>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 text-sm font-semibold">
                <span className="material-symbols-outlined text-base">tune</span> Search
              </button>
            </Link>
          </div>
        </div>
        {searchInput && (
          <p className="text-[#859399] text-xs mt-2 ml-2">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[#e2e2e2] font-mono text-xs">Enter</kbd> or click Search to view all results
          </p>
        )}
      </header>

      {/* Stats cards */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[160px] rounded-3xl" />)
          ) : (
            [
              {
                label: "Total Lost Items",
                value: stats?.total_lost ?? 0,
                icon: "cases",
                sub: `${stats?.total_found ?? 0} found items registered`,
                color: "text-[#ffb4ab]",
                glow: "bg-[#ffb4ab]/10",
              },
              {
                label: "Total Recovered",
                value: stats?.total_recovered ?? 0,
                icon: "verified_user",
                sub: `${stats?.total_lost ? ((stats.total_recovered / stats.total_lost) * 100).toFixed(1) : 0}% recovery rate`,
                color: "text-[#a5e7ff]",
                glow: "bg-[#a5e7ff]/10",
              },
              {
                label: "AI Matches Pending",
                value: stats?.pending_matches ?? 0,
                icon: "hub",
                sub: "Awaiting owner verification",
                color: "text-[#edb1ff]",
                glow: "bg-[#edb1ff]/10",
              },
            ].map((s) => (
              <Link href="/dashboard/matches" key={s.label}>
                <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-300 cursor-pointer">
                  <div className={`absolute -right-8 -top-8 w-28 h-28 ${s.glow} rounded-full blur-2xl group-hover:scale-125 transition-all duration-500`} />
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <p className="text-[#bbc9cf] text-[11px] font-bold tracking-widest uppercase mb-2">{s.label}</p>
                      <h2 className="text-[48px] font-extrabold text-[#e2e2e2] tracking-tight leading-none">{s.value.toLocaleString()}</h2>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${s.glow} flex items-center justify-center border border-white/10`}>
                      <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${s.color} relative z-10 text-sm`}>
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    <span>{s.sub}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/report-lost">
            <div className="glass-panel rounded-2xl p-5 flex items-center gap-4 group hover:border-[#ffb4ab]/30 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 flex items-center justify-center shrink-0 group-hover:bg-[#ffb4ab]/20 transition-all">
                <span className="material-symbols-outlined text-[#ffb4ab]">radar</span>
              </div>
              <div>
                <p className="font-bold text-[#e2e2e2]">Report Lost Item</p>
                <p className="text-[#859399] text-xs">Activate AI search across the network</p>
              </div>
              <span className="material-symbols-outlined text-[#859399] ml-auto group-hover:text-[#e2e2e2] transition-colors">arrow_forward</span>
            </div>
          </Link>
          <Link href="/dashboard/report-found">
            <div className="glass-panel rounded-2xl p-5 flex items-center gap-4 group hover:border-primary/30 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                <span className="material-symbols-outlined text-primary">inventory_2</span>
              </div>
              <div>
                <p className="font-bold text-[#e2e2e2]">Report Found Item</p>
                <p className="text-[#859399] text-xs">Help connect items with their owners</p>
              </div>
              <span className="material-symbols-outlined text-[#859399] ml-auto group-hover:text-[#e2e2e2] transition-colors">arrow_forward</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Activity table */}
      <section>
        <div className="flex justify-between items-end mb-5">
          <div>
            <h3 className="text-2xl font-bold text-[#e2e2e2] mb-1">
              {debouncedSearch ? `Results for "${debouncedSearch}"` : "Recent Activity"}
            </h3>
            <p className="text-[#bbc9cf] text-sm">
              {debouncedSearch ? `${recentItems.length} items found` : "Live items from the retrieval network."}
            </p>
          </div>
          <Link href="/dashboard/inventory">
            <button className="text-xs font-bold tracking-widest uppercase text-primary hover:text-[#edb1ff] transition-colors flex items-center gap-1">
              View All <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </Link>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          {itemsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="py-16 text-center text-[#859399]">
              <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">
                {debouncedSearch ? "search_off" : "inbox"}
              </span>
              <p className="font-semibold mb-1">
                {debouncedSearch ? "No matching items" : "No items reported yet"}
              </p>
              <p className="text-sm">
                {debouncedSearch ? "Try a different search term." : "Be the first to report a lost or found item."}
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Reported</th>
                  <th className="text-right pr-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((row: any) => (
                  <tr key={`${row._type}-${row.id}`} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        {row.image_url ? (
                          <img
                            src={`http://localhost:5000${row.image_url}`}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-white/8"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#1e2020] flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-[#bbc9cf] text-sm">{catIcon[row.category] || "category"}</span>
                          </div>
                        )}
                        <span className="font-semibold text-sm text-[#e2e2e2]">{row.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${row._type === "lost" ? "badge-error" : "badge-primary"}`}>
                        {row._type === "lost" ? "Lost" : "Found"}
                      </span>
                    </td>
                    <td className="text-[#bbc9cf]">{row.category || "—"}</td>
                    <td className="text-[#bbc9cf]">{row.created_at ? formatDate(row.created_at) : "—"}</td>
                    <td className="text-right pr-6">
                      <span className={`badge ${statusBadge[row.status]?.badge || "badge-neutral"}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {statusBadge[row.status]?.label || row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
