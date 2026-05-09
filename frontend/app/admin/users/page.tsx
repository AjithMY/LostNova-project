"use client";
import { useState } from "react";
import { useAdminUsers } from "@/lib/hooks";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";

const roleStyle: Record<string, string> = {
  admin:   "badge-error",
  staff:   "badge-secondary",
  student: "badge-neutral",
};

export default function AdminUsersPage() {
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [changingId, setChangingId] = useState<number | null>(null);
  const { data: users, isLoading } = useAdminUsers();
  const { success, error } = useToast();
  const qc = useQueryClient();

  const filtered = (users ?? []).filter((u: any) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase())
                     || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "All" || u.role === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  const counts = {
    total:   users?.length ?? 0,
    admin:   users?.filter((u: any) => u.role === "admin").length   ?? 0,
    staff:   users?.filter((u: any) => u.role === "staff").length   ?? 0,
    student: users?.filter((u: any) => u.role === "student").length ?? 0,
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setChangingId(userId);
    try {
      await adminAPI.updateRole(userId, newRole);
      success("Role updated", `User role changed to ${newRole}`);
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (err: any) {
      error("Failed", err.response?.data?.error || "Could not update role.");
    } finally {
      setChangingId(null);
    }
  };

  const handleDeactivate = async (userId: number, name: string) => {
    if (!confirm(`Deactivate "${name}"? They will lose access.`)) return;
    try {
      await adminAPI.deleteUser(userId);
      success("User deactivated", `${name} has been deactivated.`);
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (err: any) {
      error("Failed", err.response?.data?.error || "Could not deactivate user.");
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tighter mb-1">User Management</h1>
          <p className="text-[#bbc9cf] text-sm">Manage accounts, roles, and permissions across the network.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: counts.total,   color: "text-[#e2e2e2]" },
          { label: "Admins",      value: counts.admin,   color: "text-[#ffb4ab]" },
          { label: "Staff",       value: counts.staff,   color: "text-[#edb1ff]" },
          { label: "Students",    value: counts.student, color: "text-[#a5e7ff]" },
        ].map(s => (
          <div key={s.label} className="glass-panel rounded-2xl p-5 card-hover">
            <p className="text-[#859399] text-[9px] font-bold tracking-widest uppercase mb-2">{s.label}</p>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#859399]">search</span>
          <input
            className="form-input pl-11"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["All", "Admin", "Staff", "Student"].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                roleFilter === r
                  ? "bg-[#a5e7ff]/15 text-[#a5e7ff] border border-[#a5e7ff]/30"
                  : "bg-white/5 text-[#bbc9cf] border border-white/8 hover:border-white/20"
              }`}
            >
              {r}
            </button>
          ))}
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
                <th>User</th>
                <th>Role</th>
                <th>Items</th>
                <th>Joined</th>
                <th>Status</th>
                <th className="text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a5e7ff]/30 to-[#edb1ff]/30 border border-white/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-white">{u.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-[#e2e2e2] font-semibold text-sm">{u.name}</p>
                        <p className="text-xs text-[#859399]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={u.role}
                      disabled={changingId === u.id}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className={`text-xs font-bold py-1 px-2 rounded-lg bg-white/5 border border-white/10 text-[#e2e2e2] outline-none cursor-pointer hover:border-primary/30 transition-all ${changingId === u.id ? "opacity-50" : ""}`}
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="text-[#a5e7ff] font-semibold">
                    {(u.lost_count || 0) + (u.found_count || 0)}
                    <span className="text-[#3c494e] text-[10px] ml-1">
                      ({u.lost_count ?? 0}L/{u.found_count ?? 0}F)
                    </span>
                  </td>
                  <td className="text-[#bbc9cf] text-sm">
                    {u.created_at ? formatDate(u.created_at) : "—"}
                  </td>
                  <td>
                    <span className={`badge ${u.is_verified ? "badge-primary" : "badge-neutral"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-current ${u.is_verified ? "animate-pulse" : ""}`} />
                      {u.is_verified ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      {u.is_verified && (
                        <button
                          onClick={() => handleDeactivate(u.id, u.name)}
                          className="p-1.5 rounded-lg text-[#bbc9cf] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-all"
                          title="Deactivate"
                        >
                          <span className="material-symbols-outlined text-lg">person_off</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center text-[#859399]">
            <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">person_search</span>
            <p className="font-semibold">No users found</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-[#859399]">
        Showing {filtered.length} of {counts.total} users
      </div>
    </div>
  );
}
