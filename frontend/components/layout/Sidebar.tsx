"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useUnreadCount } from "@/lib/hooks";

const NAV_ITEMS = [
  { label: "Overview",      icon: "dashboard",             href: "/dashboard" },
  { label: "Inventory",     icon: "inventory_2",           href: "/dashboard/inventory" },
  { label: "Matches",       icon: "auto_awesome",          href: "/dashboard/matches" },
  { label: "Claims",        icon: "assignment_turned_in",  href: "/dashboard/claims" },
  { label: "Notifications", icon: "notifications_active",  href: "/dashboard/notifications" },
  { label: "Activity",      icon: "history_edu",           href: "/dashboard/audit" },
  { label: "Settings",      icon: "settings",              href: "/dashboard/settings" },
];

const ADMIN_NAV_ITEMS = [
  { label: "Admin Panel",   icon: "admin_panel_settings",  href: "/admin" },
  { label: "Users",         icon: "group",                 href: "/admin/users" },
];

export default function Sidebar() {
  const path   = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { data: unread } = useUnreadCount();

  const handleSignOut = () => {
    clearAuth();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return path === "/dashboard";
    return path.startsWith(href);
  };

  const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const active  = isActive(item.href);
    const isNotif = item.href === "/dashboard/notifications";
    return (
      <Link href={item.href}>
        <div
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
            active
              ? "nav-active font-bold"
              : "text-[#bbc9cf] hover:bg-white/5 hover:text-[#e2e2e2] hover:translate-x-1"
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${active ? "icon-fill" : ""}`}>
            {item.icon}
          </span>
          <span className="text-[14px] flex-1">{item.label}</span>
          {isNotif && typeof unread === "number" && unread > 0 && (
            <span className="bg-[#a5e7ff] text-[#0c0f0f] text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none animate-pulse">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <nav className="bg-[#0c0f0f]/70 backdrop-blur-2xl h-screen w-64 fixed left-0 top-0 border-r border-white/8 shadow-[4px_0_24px_rgba(0,0,0,0.5)] flex flex-col z-50">
      {/* Brand */}
      <div className="px-5 pt-7 pb-5 border-b border-white/6">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a5e7ff]/30 to-[#edb1ff]/30 border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#a5e7ff] icon-fill text-base">auto_awesome</span>
            </div>
            <span className="text-[#a5e7ff] font-extrabold tracking-tight text-xl group-hover:text-white transition-colors">
              LostNova
            </span>
          </div>
        </Link>
        <p className="text-[10px] text-[#3c494e] font-bold tracking-widest uppercase mt-2 ml-11">
          AI-Powered Platform
        </p>
      </div>

      {/* CTA */}
      <div className="px-4 pt-4 pb-2 flex gap-2">
        <Link href="/dashboard/report-lost" className="flex-1">
          <button className="btn-primary w-full py-2 px-3 text-[12px]">
            <span className="material-symbols-outlined text-sm icon-fill">radar</span>
            Report Lost
          </button>
        </Link>
        <Link href="/dashboard/report-found">
          <button className="btn-ghost py-2 px-3 text-[12px]">
            <span className="material-symbols-outlined text-sm">add_box</span>
          </button>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 no-scrollbar">
        <p className="text-[9px] font-bold tracking-widest uppercase text-[#3c494e] px-4 pb-1 pt-2">Main</p>
        {NAV_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}

        {/* Admin section — only shown for admins */}
        {user?.role === "admin" && (
          <>
            <div className="h-px bg-white/5 my-3 mx-1" />
            <p className="text-[9px] font-bold tracking-widest uppercase text-[#3c494e] px-4 pb-1">Admin</p>
            {ADMIN_NAV_ITEMS.map((item) => <NavLink key={item.href} item={item} />)}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-5 pt-3 border-t border-white/6">
        {user && (
          <div className="flex items-center gap-3 px-4 py-2.5 mb-1 rounded-xl bg-white/[0.02]">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-base">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#e2e2e2] truncate">{user.name}</p>
              <p className="text-[10px] text-[#859399] uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#bbc9cf] hover:bg-[#ffb4ab]/8 hover:text-[#ffb4ab] transition-all cursor-pointer hover:translate-x-1"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-[14px]">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
