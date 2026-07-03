"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Mail, BarChart2, Shield,
  Settings, CreditCard, LogOut, Menu, X,
} from "lucide-react";
import { getUser, clearAuth } from "../lib/auth";
import type { User } from "../lib/auth";

const NAV = [
  { href: "/dashboard",               label: "Vue d'ensemble", icon: LayoutDashboard, color: "#a78bfa" },
  { href: "/dashboard/deal-draft",    label: "Deal Draft",     icon: FileText,         color: "#7c3aed" },
  { href: "/dashboard/smart-chase",   label: "Smart Chase",    icon: Mail,             color: "#f97316" },
  { href: "/dashboard/pitch-radar",   label: "Pitch Radar",    icon: BarChart2,        color: "#06b6d4" },
  { href: "/dashboard/deep-due",      label: "Deep Due",       icon: Shield,           color: "#10b981" },
];

const NAV_BOTTOM = [
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
  { href: "/dashboard/billing",  label: "Facturation", icon: CreditCard },
];

const PLAN_INFO: Record<string, { label: string; days: number; max: number; color: string }> = {
  free_trial: { label: "Free Trial", days: 14, max: 14, color: "#a78bfa" },
  starter:    { label: "Starter",    days: 30, max: 30, color: "#3b82f6" },
  growth:     { label: "Growth",     days: 30, max: 30, color: "#7c3aed" },
  enterprise: { label: "Enterprise", days: 30, max: 30, color: "#10b981" },
};

function Sidebar({ user, onClose }: { user: User | null; onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();

  function handleLogout() { clearAuth(); router.push("/login"); }

  const plan = PLAN_INFO[user?.plan ?? "free_trial"] ?? PLAN_INFO.free_trial;
  const initials = user?.full_name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <aside className="flex flex-col h-full" style={{ background: "#13131a", borderRight: "1px solid #2a2a3a" }}>

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, boxShadow:"0 0 16px rgba(124,58,237,0.35)" }}>⚡</div>
          <span className="font-display font-bold" style={{ fontSize:20, letterSpacing:"-0.3px", background:"linear-gradient(135deg,#c4b5fd,#93c5fd)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Dealyze</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden" style={{ color: "#4a4a5a", background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Plan badge */}
      <div className="mx-4 mb-4 px-4 py-3 rounded-xl" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: plan.color }}>{plan.label}</span>
          <span style={{ fontSize: 11, color: "#4a4a6a" }}>{plan.days}/{plan.max} j</span>
        </div>
        <div style={{ height: 4, borderRadius: 4, background: "#2a2a3a", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(plan.days / plan.max) * 100}%`, borderRadius: 4, background: `linear-gradient(90deg, ${plan.color}, ${plan.color}aa)`, transition: "width 1s" }} />
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? `${color}18` : "transparent",
                color: active ? "#fff" : "#5a5a7a",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#1a1a24"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: active ? `${color}22` : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: active ? color : "#3a3a5a",
                transition: "all 0.15s",
              }}>
                <Icon size={16} />
              </div>
              {label}
              {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pt-3 space-y-0.5" style={{ borderTop: "1px solid #1e1e2e" }}>
        {NAV_BOTTOM.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ color: active ? "#fff" : "#4a4a6a", background: active ? "#1a1a24" : "transparent", textDecoration: "none" }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#1a1a24"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: "#4a4a6a", background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#1a1a24"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4a4a6a"; }}
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>

      {/* User avatar */}
      {user && (
        <div className="m-4 mt-3 p-3 rounded-xl flex items-center gap-3" style={{ background: "#1a1a24", border: "1px solid #2a2a3a" }}>
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", color: "#fff" }}>
            {initials}
          </div>
          <div className="overflow-hidden min-w-0">
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.full_name}</div>
            <div style={{ fontSize: 11, color: "#4a4a6a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const [user, setUser]               = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
  }, [router]);

  const pageTitle = [...NAV, ...NAV_BOTTOM].find((n) => n.href === pathname)?.label ?? "Dashboard";

  return (
    <div className="min-h-screen flex" style={{ background: "#0f0f13" }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-60 flex-shrink-0">
        <div className="fixed left-0 top-0 w-60 h-screen">
          <Sidebar user={user} />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 w-60 h-full shadow-2xl">
            <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4" style={{ background: "#0f0f13", borderBottom: "1px solid #1e1e2e" }}>
          <div className="flex items-center gap-4">
            <button className="lg:hidden" style={{ color: "#5a5a7a", background: "none", border: "none", cursor: "pointer" }} onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{pageTitle}</h1>
          </div>
          <Link href="/dashboard/billing"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", boxShadow: "0 4px 12px rgba(124,58,237,0.3)", textDecoration: "none", transition: "box-shadow 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 20px rgba(124,58,237,0.5)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 12px rgba(124,58,237,0.3)"; }}
          >
            ✦ Upgrade
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center" style={{ borderTop: "1px solid #1a1a24" }}>
          <span style={{ fontSize: 11, color: "#2a2a4a" }}>Powered by Gemini 2.5 Flash · XPRIZE AI Hackathon 2026</span>
        </footer>
      </div>
    </div>
  );
}
