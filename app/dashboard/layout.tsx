"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Mail, BarChart3, Shield,
  Settings, CreditCard, LogOut, Menu, X, Bell, Plus, Zap,
} from "lucide-react";
import { getUser, clearAuth } from "../lib/auth";
import type { User } from "../lib/auth";

const NAV_OVERVIEW = [
  { href: "/dashboard", label: "Tableau de bord", sub: "Vue d'ensemble de votre activité", icon: LayoutDashboard, color: "#7c3aed", iconBg: "#ede9fe" },
];

const NAV_MODULES = [
  { href: "/dashboard/deal-draft",  label: "Deal Draft",  sub: "Propositions commerciales IA",  icon: FileText,  color: "#7c3aed", iconBg: "#ede9fe" },
  { href: "/dashboard/smart-chase", label: "Smart Chase", sub: "Relancez vos impayés",           icon: Mail,      color: "#f97316", iconBg: "#fff7ed" },
  { href: "/dashboard/pitch-radar", label: "Pitch Radar", sub: "Analysez des pitch decks VC",   icon: BarChart3, color: "#06b6d4", iconBg: "#ecfeff" },
  { href: "/dashboard/deep-due",    label: "Deep Due",    sub: "Due diligence automatisée",      icon: Shield,    color: "#10b981", iconBg: "#f0fdf4" },
];

const NAV_ACCOUNT = [
  { href: "/dashboard/settings", label: "Paramètres", sub: "Compte et préférences",   icon: Settings,    color: "#64748b", iconBg: "#f8fafc" },
  { href: "/dashboard/billing",  label: "Facturation", sub: "Plans et abonnements",   icon: CreditCard,  color: "#64748b", iconBg: "#f8fafc" },
];

const ALL_NAV = [...NAV_OVERVIEW, ...NAV_MODULES, ...NAV_ACCOUNT];

const PLAN_PRICES: Record<string, string> = {
  free_trial: "Gratuit",
  starter:    "47$/mo",
  growth:     "147$/mo",
  enterprise: "Personnalisé",
};

const PLAN_LABELS: Record<string, string> = {
  free_trial: "Free Trial",
  starter:    "Starter",
  growth:     "Growth",
  enterprise: "Enterprise",
};

const PLAN_INFO: Record<string, { daysRemaining: number; daysTotal: number }> = {
  free_trial: { daysRemaining: 11, daysTotal: 14 },
  starter:    { daysRemaining: 22, daysTotal: 30 },
  growth:     { daysRemaining: 18, daysTotal: 30 },
  enterprise: { daysRemaining: 30, daysTotal: 30 },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.09em",
      color: "#94a3b8", textTransform: "uppercase",
      padding: "12px 14px 4px",
    }}>
      {children}
    </div>
  );
}

type NavEntry = {
  href: string; label: string; icon: React.ElementType;
  color: string; iconBg: string; onClose?: () => void;
};

function NavItem({ href, label, icon: Icon, color, iconBg, onClose }: NavEntry) {
  const pathname = usePathname();
  const active   = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
      style={{
        background: active ? "#ede9fe" : "transparent",
        color: active ? "#7c3aed" : "#64748b",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; } }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: active ? iconBg : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s",
      }}>
        <Icon size={14} strokeWidth={2} style={{ color: active ? color : "#94a3b8" }} />
      </div>
      <span style={{ fontSize: 13, lineHeight: 1 }}>{label}</span>
    </Link>
  );
}

function Sidebar({ user, onClose }: { user: User | null; onClose?: () => void }) {
  const router = useRouter();

  function handleLogout() { clearAuth(); router.push("/login"); }

  const planKey  = user?.plan ?? "free_trial";
  const planInfo = PLAN_INFO[planKey] ?? PLAN_INFO.free_trial;
  const pct      = Math.round((planInfo.daysRemaining / planInfo.daysTotal) * 100);
  const price    = PLAN_PRICES[planKey] ?? "";
  const planLabel = PLAN_LABELS[planKey] ?? "Free Trial";
  const initials  = user?.full_name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  const role      = user?.profile === "PME" ? "PME" : user?.profile === "investisseur" ? "Investisseur" : "Utilisateur";

  return (
    <aside className="flex flex-col h-full" style={{ background: "#ffffff", borderRight: "1px solid #e2e8f0" }}>

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
          }}>
            <Zap size={16} strokeWidth={2.5} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px", color: "#0f172a" }}>
            Dealyze<span style={{ color: "#7c3aed" }}>.</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto py-2">
        <SectionLabel>Vue d&apos;ensemble</SectionLabel>
        {NAV_OVERVIEW.map((n) => <NavItem key={n.href} {...n} onClose={onClose} />)}

        <SectionLabel>Modules</SectionLabel>
        {NAV_MODULES.map((n) => <NavItem key={n.href} {...n} onClose={onClose} />)}

        <SectionLabel>Compte</SectionLabel>
        {NAV_ACCOUNT.map((n) => <NavItem key={n.href} {...n} onClose={onClose} />)}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
        >
          <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogOut size={14} strokeWidth={2} />
          </div>
          <span style={{ fontSize: 13 }}>Déconnexion</span>
        </button>
      </nav>

      {/* Plan card */}
      <div style={{
        margin: "4px 12px 10px",
        padding: "14px 16px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
      }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Plan {planLabel}</span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>{price}</span>
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>
          {planInfo.daysRemaining} jours restants · {pct}% actif
        </div>
        <div style={{ height: 4, borderRadius: 4, background: "#e2e8f0", overflow: "hidden", marginBottom: 10 }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "linear-gradient(90deg, #7c3aed, #a855f7)",
            borderRadius: 4, transition: "width 1s",
          }} />
        </div>
        <Link
          href="/dashboard/billing"
          style={{
            display: "block", textAlign: "center", padding: "7px 0",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600,
            textDecoration: "none", boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
          }}
        >
          Mettre à niveau
        </Link>
      </div>

      {/* User avatar */}
      {user && (
        <div style={{
          padding: "12px 16px 16px",
          borderTop: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 700,
          }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.full_name}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{role}</div>
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

  const currentPage = ALL_NAV.find((n) => n.href === pathname);
  const pageTitle   = currentPage?.label ?? "Dashboard";
  const pageSub     = currentPage?.sub ?? "Bienvenue sur Dealyze";

  return (
    <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-56 flex-shrink-0">
        <div className="fixed left-0 top-0 w-56 h-screen">
          <Sidebar user={user} />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 w-56 h-full shadow-2xl">
            <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
          style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>

          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}
              style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1.2 }}>{pageTitle}</h1>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{pageSub}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button style={{
              width: 36, height: 36, borderRadius: 8, border: "1px solid #e2e8f0",
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, transition: "border-color 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <Bell size={15} style={{ color: "#64748b" }} />
            </button>

            <Link href="/dashboard/deal-draft"
              className="hidden sm:flex items-center gap-2 font-semibold"
              style={{
                padding: "8px 16px", background: "#7c3aed", color: "#fff",
                borderRadius: 8, fontSize: 13, textDecoration: "none",
                boxShadow: "0 2px 8px rgba(124,58,237,0.3)", transition: "box-shadow 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#6d28d9"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(124,58,237,0.4)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#7c3aed"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(124,58,237,0.3)"; }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Nouvelle action
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>

        {/* Footer */}
        <footer className="px-6 py-3 flex items-center justify-center gap-2"
          style={{ borderTop: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            Dealyze · Gemini 2.5 Flash · XPRIZE AI Hackathon 2026
          </span>
        </footer>
      </div>
    </div>
  );
}
