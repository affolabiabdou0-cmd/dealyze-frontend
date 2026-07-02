"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Mail, BarChart2, Shield,
  Settings, CreditCard, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { getUser, clearAuth } from "../lib/auth";
import type { User } from "../lib/auth";

const NAV = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/deal-draft", label: "Deal Draft", icon: <FileText size={18} /> },
  { href: "/dashboard/smart-chase", label: "Smart Chase", icon: <Mail size={18} /> },
  { href: "/dashboard/pitch-radar", label: "Pitch Radar", icon: <BarChart2 size={18} /> },
  { href: "/dashboard/deep-due", label: "Deep Due", icon: <Shield size={18} /> },
];

const NAV_BOTTOM = [
  { href: "/dashboard/settings", label: "Paramètres", icon: <Settings size={18} /> },
  { href: "/dashboard/billing", label: "Facturation", icon: <CreditCard size={18} /> },
];

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  free_trial: { label: "Essai", color: "#6B7280" },
  starter:    { label: "Starter", color: "#2563EB" },
  growth:     { label: "Growth", color: "#7C3AED" },
  enterprise: { label: "Enterprise", color: "#059669" },
};

function Sidebar({ user, onClose }: { user: User | null; onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  const badge = PLAN_BADGE[user?.plan ?? "free_trial"] ?? PLAN_BADGE.free_trial;

  return (
    <aside className="flex flex-col h-full" style={{ background: "#0F2552" }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <span className="font-display text-xl font-bold text-white">Dealyze</span>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* User card */}
      {user && (
        <div className="px-4 py-4 mx-4 mt-4 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: "#2563EB" }}>
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{user.full_name}</div>
              <div className="text-xs text-white/40 truncate">{user.email}</div>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: badge.color }}>
              {badge.label}
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? "rgba(37,99,235,0.25)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.55)",
                borderLeft: active ? "2px solid #2563EB" : "2px solid transparent",
              }}
            >
              <span style={{ color: active ? "#60A5FA" : "rgba(255,255,255,0.4)" }}>{item.icon}</span>
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" style={{ color: "#60A5FA" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t border-white/10 space-y-1">
        {NAV_BOTTOM.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)", background: active ? "rgba(255,255,255,0.08)" : "transparent" }}
            >
              <span style={{ color: active ? "#60A5FA" : "rgba(255,255,255,0.3)" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <LogOut size={18} style={{ color: "rgba(255,255,255,0.3)" }} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
  }, [router]);

  const pageTitle = [...NAV, ...NAV_BOTTOM].find((n) => n.href === pathname)?.label ?? "Dashboard";

  return (
    <div className="min-h-screen flex" style={{ background: "#F4F6F9" }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="fixed left-0 top-0 w-64 h-screen">
          <Sidebar user={user} />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 w-64 h-full shadow-2xl">
            <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="text-base font-semibold" style={{ color: "#0F2552" }}>{pageTitle}</h1>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                {PLAN_BADGE[user.plan]?.label ?? "Essai"}
              </span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#0F2552" }}>
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
