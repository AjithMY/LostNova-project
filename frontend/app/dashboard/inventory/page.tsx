"use client";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useAllItems, useDeleteItem } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/lib/debounce";

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

const CATEGORIES = ["Electronics", "Accessories", "Documents", "Clothing", "Bags", "Keys", "Other"];
const STATUSES   = ["open", "recovered", "claimed"];

export default function InventoryPage() {
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "lost" | "found">("all");
  const [statusFilter, setStatus] = useState("");
  const [catFilter, setCat]       = useState("");
  const [deleteTarget, setTarget] = useState<{ id: number; type: "lost" | "found"; title: string } | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { success, error } = useToast();

  // Build server-side params
  const searchParams: Record<string, string> = {};
  if (debouncedSearch) searchParams.search = debouncedSearch;
  if (statusFilter)    searchParams.status  = statusFilter;
  if (catFilter)       searchParams.category = catFilter;

  const { data: items, isLoading } = useAllItems(
    Object.keys(searchParams).length ? searchParams : undefined
  );
  const deleteMut = useDeleteItem();

  const filtered = (items ?? []).filter((i: any) => {
    if (typeFilter !== "all" && i._type !== typeFilter) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync({ type: deleteTarget.type, id: deleteTarget.id });
      success("Item deleted", `"${deleteTarget.title}" has been removed.`);
    } catch {
      error("Delete failed", "Could not delete this item.");
    } finally {
      setTarget(null);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tighter mb-1">Item Inventory</h1>
          <p className="text-[#bbc9cf] text-sm">
            {isLoading ? "Loading…" : `${filtered.length} items in the network`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/report-found">
            <button className="btn-ghost px-5 py-2.5 text-sm">
              <span className="material-symbols-outlined text-base">add_box</span> Report Found
            </button>
          </Link>
          <Link href="/dashboard/report-lost">
            <button className="btn-primary px-5 py-2.5 text-sm">
              <span className="material-symbols-outlined text-base">radar</span> Report Lost
            </button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#859399] text-xl">search</span>
          <input
            className="form-input pl-11 py-3 w-full"
            placeholder="Search by title, description, category, or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#859399] hover:text-[#e2e2e2] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {/* Type filter */}
          <div className="flex gap-1.5 bg-white/[0.03] border border-white/8 rounded-xl p-1">
            {(["all", "lost", "found"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  typeFilter === t ? "bg-primary/15 text-primary border border-primary/30" : "text-[#bbc9cf] hover:text-white"
                }`}
              >
                {t === "all" ? "All Types" : t === "lost" ? "🔴 Lost" : "🔵 Found"}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            className="form-input text-sm py-2 px-3 w-auto"
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>

          {/* Category filter */}
          <select
            className="form-input text-sm py-2 px-3 w-auto"
            value={catFilter}
            onChange={e => setCat(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Clear filters */}
          {(search || statusFilter || catFilter || typeFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setStatus(""); setCat(""); setTypeFilter("all"); }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-[#ffb4ab] border border-[#ffb4ab]/20 bg-[#ffb4ab]/10 hover:bg-[#ffb4ab]/20 transition-all"
            >
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">filter_alt_off</span> Clear Filters
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 rounded-lg h-14" />
            ))}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Category</th>
                <th>Location</th>
                <th>Date Reported</th>
                <th>Status</th>
                <th className="text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any) => (
                <tr key={`${item._type}-${item.id}`} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={`http://localhost:5000${item.image_url}`}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-white/8"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#1e2020] border border-white/5 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
                          <span className="material-symbols-outlined text-[#bbc9cf] text-base">
                            {catIcon[item.category] || "category"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-[#e2e2e2] font-semibold text-sm">{item.title}</p>
                        <p className="text-[10px] text-[#859399] font-mono">LN-{String(item.id).padStart(4, "0")}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item._type === "lost" ? "badge-error" : "badge-primary"}`}>
                      {item._type === "lost" ? "Lost" : "Found"}
                    </span>
                  </td>
                  <td className="text-[#bbc9cf] text-sm">{item.category || "—"}</td>
                  <td className="text-[#bbc9cf] text-sm max-w-[140px] truncate">
                    {(item._type === "lost" ? item.location_lost : item.location_found) || "—"}
                  </td>
                  <td className="text-[#bbc9cf] text-sm">{item.created_at ? formatDate(item.created_at) : "—"}</td>
                  <td>
                    <span className={`badge ${statusBadge[item.status]?.badge || "badge-neutral"}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {statusBadge[item.status]?.label || item.status}
                    </span>
                  </td>
                  <td className="text-right pr-6">
                    <button
                      onClick={() => setTarget({ id: item.id, type: item._type, title: item.title })}
                      className="text-[#859399] hover:text-[#ffb4ab] transition-colors"
                      title="Delete item"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center text-[#859399]">
            <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">search_off</span>
            <p className="font-semibold mb-1">No items match your filters</p>
            <p className="text-sm">Try adjusting your search or clearing the filters.</p>
          </div>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between mt-4 text-sm text-[#859399]">
        <span>Showing {filtered.length} items</span>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel rounded-3xl p-8 w-full max-w-sm border border-[#ffb4ab]/20 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[#ffb4ab] text-3xl">delete</span>
            </div>
            <h3 className="text-lg font-bold text-[#e2e2e2] mb-2">Delete Item?</h3>
            <p className="text-[#bbc9cf] text-sm mb-6">
              "<span className="text-[#e2e2e2] font-semibold">{deleteTarget.title}</span>" will be permanently removed from the network.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setTarget(null)} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleteMut.isPending}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/30 hover:bg-[#ffb4ab]/25 transition-all disabled:opacity-50"
              >
                {deleteMut.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
