"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/8 shadow-[0_1px_20px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto">

        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a5e7ff]/25 to-[#edb1ff]/25 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#a5e7ff] icon-fill text-base">auto_awesome</span>
              </div>
              <span className="text-[#a5e7ff] font-extrabold tracking-tight text-xl group-hover:text-white transition-colors">
                LostNova
              </span>
            </div>
          </Link>

          {/* Search bar — desktop */}
          <div className="hidden lg:flex items-center bg-[#1e2020]/60 border border-white/8 rounded-xl px-4 py-2.5 hover:border-[#a5e7ff]/30 focus-within:border-[#a5e7ff] focus-within:shadow-[0_0_12px_rgba(165,231,255,0.15)] transition-all w-64">
            <span className="material-symbols-outlined text-[#859399] text-lg mr-2">search</span>
            <input
              className="bg-transparent border-none text-[#e2e2e2] text-sm w-full placeholder-[#3c494e] outline-none"
              placeholder="Search items..."
              type="text"
            />
          </div>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Dashboard",  href: "/dashboard" },
            { label: "Matches",    href: "/dashboard/matches" },
            { label: "Inventory",  href: "/dashboard/inventory" },
          ].map((l) => (
            <Link key={l.label} href={l.href}>
              <span className="px-4 py-2 rounded-xl text-[14px] font-medium text-[#bbc9cf] hover:text-white hover:bg-white/6 transition-all cursor-pointer">
                {l.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard/report-lost">
            <button className="hidden sm:flex btn-primary px-5 py-2 text-sm">
              <span className="material-symbols-outlined text-base">radar</span>
              Report Item
            </button>
          </Link>

          {/* Notification bell */}
          <Link href="/dashboard/notifications">
            <button className="relative p-2.5 rounded-xl text-[#bbc9cf] hover:text-[#a5e7ff] hover:bg-white/6 transition-all">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#a5e7ff] shadow-[0_0_6px_rgba(165,231,255,0.8)]" />
            </button>
          </Link>

          {/* Settings */}
          <Link href="/settings">
            <button className="p-2.5 rounded-xl text-[#bbc9cf] hover:text-[#e2e2e2] hover:bg-white/6 transition-all hidden sm:block">
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
          </Link>

          {/* Avatar */}
          <Link href="/dashboard">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a5e7ff]/30 to-[#edb1ff]/30 border border-white/15 flex items-center justify-center cursor-pointer hover:border-[#a5e7ff]/50 transition-colors">
              <span className="text-sm font-bold text-white">A</span>
            </div>
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-[#bbc9cf] hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0c0f0f]/95 backdrop-blur-xl border-t border-white/8 px-6 py-4 flex flex-col gap-2">
          {[
            { label: "Dashboard",      href: "/dashboard" },
            { label: "Inventory",      href: "/dashboard/inventory" },
            { label: "Matches",        href: "/dashboard/matches" },
            { label: "Notifications",  href: "/dashboard/notifications" },
            { label: "Report Lost",    href: "/dashboard/report-lost" },
            { label: "Report Found",   href: "/dashboard/report-found" },
            { label: "Settings",       href: "/settings" },
          ].map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}>
              <span className="block py-2.5 px-4 rounded-xl text-[#bbc9cf] hover:text-white hover:bg-white/6 transition-all text-sm font-medium">
                {l.label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
