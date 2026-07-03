"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Mail, BarChart3, Shield,
  Settings, CreditCard, LogOut, Menu, X, Bell, Plus, Zap,
  ChevronRight, Clock, AlertTriangle,
} from "lucide-react";
import { getUser, clearAuth } from "../lib/auth";
import type { User } from "../lib/auth";
import { getActivity, markNotifSeen, countUnread, relativeTime, ACTIVITY_META } from "../lib/activity";
import type { ActivityItem } from "../lib/activity";

/* ── nav structure ── */
const NAV_OVERVIEW = [
  { href: "/dashboard",             label: "Tableau de bord", sub: "Vue d'ensemble de votre activité",  icon: LayoutDashboard },
];
const NAV_MODULES = [
  { href: "/dashboard/deal-draft",  label: "Deal Draft",   sub: "Propositions commerciales IA",  icon: FileText,  color: "#a78bfa", iconBg: "rgba(167,139,250,0.15)" },
  { href: "/dashboard/smart-chase", label: "Smart Chase",  sub: "Relancez vos impayés",           icon: Mail,      color: "#fb923c", iconBg: "rgba(251,146,60,0.15)"  },
  { href: "/dashboard/pitch-radar", label: "Pitch Radar",  sub: "Analysez des pitch decks VC",   icon: BarChart3, color: "#22d3ee", iconBg: "rgba(34,211,238,0.15)"  },
  { href: "/dashboard/deep-due",    label: "Deep Due",     sub: "Due diligence automatisée",      icon: Shield,    color: "#34d399", iconBg: "rgba(52,211,153,0.15)"  },
];
const NAV_ACCOUNT = [
  { href: "/dashboard/settings", label: "Paramètres", sub: "Compte et préférences",   icon: Settings  },
  { href: "/dashboard/billing",  label: "Facturation", sub: "Plans et abonnements",   icon: CreditCard },
];
const ALL_NAV = [...NAV_OVERVIEW, ...NAV_MODULES, ...NAV_ACCOUNT];

const PLAN_PRICES:  Record<string, string> = { free_trial: "Gratuit", starter: "47$/mo", growth: "147$/mo", enterprise: "Personnalisé" };
const PLAN_LABELS:  Record<string, string> = { free_trial: "Free Trial", starter: "Starter", growth: "Growth", enterprise: "Enterprise" };
const PLAN_INFO:    Record<string, { daysRemaining: number; daysTotal: number }> = {
  free_trial: { daysRemaining: 11, daysTotal: 14 },
  starter:    { daysRemaining: 22, daysTotal: 30 },
  growth:     { daysRemaining: 18, daysTotal: 30 },
  enterprise: { daysRemaining: 30, daysTotal: 30 },
};

/* ── Sidebar section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      color: "rgba(255,255,255,0.28)", textTransform: "uppercase",
      padding: "14px 14px 5px",
    }}>
      {children}
    </div>
  );
}

type NavEntry = { href: string; label: string; icon: React.ElementType; color?: string; iconBg?: string; onClose?: () => void };

function NavItem({ href, label, icon: Icon, color, iconBg, onClose }: NavEntry) {
  const pathname = usePathname();
  const active   = pathname === href;
  const activeColor = color ?? "#a78bfa";
  const activeBg    = iconBg ?? "rgba(167,139,250,0.15)";
  return (
    <Link href={href} onClick={onClose}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
      style={{
        background:    active ? activeBg : "transparent",
        color:         active ? activeColor : "rgba(255,255,255,0.55)",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; } }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: active ? activeBg : "rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s",
      }}>
        <Icon size={13} strokeWidth={2} style={{ color: active ? activeColor : "rgba(255,255,255,0.4)" }} />
      </div>
      <span style={{ fontSize: 13, lineHeight: 1 }}>{label}</span>
      {active && <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: activeColor, flexShrink: 0 }} />}
    </Link>
  );
}

/* ── Sidebar ── */
function Sidebar({ user, onClose }: { user: User | null; onClose?: () => void }) {
  const router    = useRouter();
  const planKey   = user?.plan ?? "free_trial";
  const planInfo  = PLAN_INFO[planKey] ?? PLAN_INFO.free_trial;
  const pct       = Math.round((planInfo.daysRemaining / planInfo.daysTotal) * 100);
  const planLabel = PLAN_LABELS[planKey] ?? "Free Trial";
  const price     = PLAN_PRICES[planKey] ?? "";
  const initials  = user?.full_name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  const role      = user?.profile === "pme" ? "PME · Commercial" : user?.profile === "investisseur" ? "Investisseur · VC" : "Utilisateur";

  return (
    <aside className="flex flex-col h-full" style={{
      background: "#0b1526",
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(124,58,237,0.45)",
          }}>
            <Zap size={17} strokeWidth={2.5} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px", color: "#f8fafc" }}>
            Dealyze<span style={{ color: "#a78bfa" }}>.</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto py-2">
        <SectionLabel>Vue d&apos;ensemble</SectionLabel>
        {NAV_OVERVIEW.map((n) => <NavItem key={n.href} {...n} onClose={onClose} />)}

        <SectionLabel>Modules IA</SectionLabel>
        {NAV_MODULES.map((n) => <NavItem key={n.href} {...n} onClose={onClose} />)}

        <SectionLabel>Compte</SectionLabel>
        {NAV_ACCOUNT.map((n) => <NavItem key={n.href} {...n} onClose={onClose} />)}

        <button onClick={() => { clearAuth(); router.push("/login"); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", textAlign: "left", marginTop: 2 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#f87171"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
        >
          <div style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)" }}>
            <LogOut size={13} strokeWidth={2} />
          </div>
          <span style={{ fontSize: 13 }}>Déconnexion</span>
        </button>
      </nav>

      {/* Plan card */}
      <div style={{ margin: "6px 12px 10px", padding: "14px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>Plan {planLabel}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{price}</span>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
          {planInfo.daysRemaining} jours restants · {pct}% actif
        </div>
        <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: 10 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)", borderRadius: 4 }} />
        </div>
        <Link href="/dashboard/billing" style={{
          display: "block", textAlign: "center", padding: "7px 0",
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600,
          textDecoration: "none", boxShadow: "0 3px 10px rgba(124,58,237,0.4)",
        }}>
          Mettre à niveau
        </Link>
      </div>

      {/* User */}
      {user && (
        <div style={{ padding: "12px 16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: "0 2px 8px rgba(124,58,237,0.4)",
          }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.full_name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{role}</div>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ── Notification panel ── */
function NotifPanel({ user, onClose }: { user: User | null; onClose: () => void }) {
  const activities = getActivity().slice(0, 6);
  const planKey    = user?.plan ?? "free_trial";
  const planInfo   = PLAN_INFO[planKey] ?? PLAN_INFO.free_trial;

  useEffect(() => { markNotifSeen(); }, []);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-80 flex flex-col shadow-2xl"
        style={{ background: "#fff", borderLeft: "1px solid #e2e8f0" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Notifications</h3>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{activities.length} récentes</p>
          </div>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} style={{ color: "#64748b" }} />
          </button>
        </div>

        {/* plan expiry warning */}
        {planKey === "free_trial" && planInfo.daysRemaining <= 14 && (
          <div style={{ margin: "12px 16px 0", padding: "12px 14px", borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
              <AlertTriangle size={13} style={{ color: "#f59e0b", flexShrink: 0 }} strokeWidth={1.75} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>Essai gratuit</span>
            </div>
            <p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.5 }}>
              Il vous reste <strong>{planInfo.daysRemaining} jours</strong> d&apos;essai. Passez à un plan payant pour continuer sans interruption.
            </p>
            <Link href="/dashboard/billing" onClick={onClose}
              style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 600, color: "#7c3aed", textDecoration: "none" }}>
              Voir les plans →
            </Link>
          </div>
        )}

        {/* activity notifications */}
        <div className="flex-1 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Bell size={20} style={{ color: "#cbd5e1" }} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: 13, color: "#64748b" }}>Aucune activité récente</p>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Lancez un agent pour voir vos actions ici</p>
            </div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {activities.map((item, i) => {
                const meta = ACTIVITY_META[item.type];
                return (
                  <Link key={item.id} href={item.href} onClick={onClose} style={{ textDecoration: "none", display: "block" }}>
                    <div className="flex items-start gap-3 px-5 py-3"
                      style={{ borderBottom: i < activities.length - 1 ? "1px solid #f8fafc" : "none", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", lineHeight: 1.4, marginBottom: 2 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.subtitle}</div>
                        <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 3 }}>{relativeTime(item.timestamp)}</div>
                      </div>
                      <ChevronRight size={12} style={{ color: "#cbd5e1", flexShrink: 0, marginTop: 4 }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Agent picker modal ── */
const AGENT_PICKS = [
  { href: "/dashboard/deal-draft",  icon: FileText,  color: "#7c3aed", bg: "#ede9fe", name: "Deal Draft",   desc: "Générez une proposition commerciale professionnelle sur-mesure" },
  { href: "/dashboard/smart-chase", icon: Mail,      color: "#f97316", bg: "#fff7ed", name: "Smart Chase",  desc: "Relancez un client débiteur avec un email IA calibré"          },
  { href: "/dashboard/pitch-radar", icon: BarChart3, color: "#06b6d4", bg: "#ecfeff", name: "Pitch Radar",  desc: "Analysez et notez un pitch deck selon les critères VC"         },
  { href: "/dashboard/deep-due",    icon: Shield,    color: "#10b981", bg: "#f0fdf4", name: "Deep Due",     desc: "Due diligence complète sur une startup ou une cible"           },
];

function AgentPicker({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }} />
      <div className="relative w-full mx-4" style={{ maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.2)", overflow: "hidden" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>Nouvelle action</h3>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Choisissez l&apos;agent IA à lancer</p>
            </div>
            <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={14} style={{ color: "#64748b" }} />
            </button>
          </div>
          {/* Agent cards */}
          <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {AGENT_PICKS.map(({ href, icon: Icon, color, bg, name, desc }) => (
              <button key={href}
                onClick={() => { router.push(href); onClose(); }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12, padding: "16px",
                  borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff",
                  cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 16px ${color}22`; e.currentTarget.style.background = bg; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#fff"; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} style={{ color }} strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ padding: "0 20px 20px" }}>
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={12} style={{ color: "#94a3b8" }} strokeWidth={1.75} />
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Chaque agent génère un résultat en moins de 60 secondes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Layout ── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]               = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [actionOpen,  setActionOpen]  = useState(false);
  const [unread,      setUnread]      = useState(0);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
    setUnread(countUnread());
  }, [router]);

  const currentPage = ALL_NAV.find((n) => n.href === pathname);
  const pageTitle   = currentPage?.label ?? "Dashboard";
  const pageSub     = currentPage?.sub ?? "Bienvenue sur Dealyze";

  function openNotif() { setNotifOpen(true); setUnread(0); }

  return (
    <div className="min-h-screen flex" style={{ background: "#f1f5f9" }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="fixed left-0 top-0 w-64 h-screen">
          <Sidebar user={user} />
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 w-64 h-full shadow-2xl">
            <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Modals */}
      {notifOpen  && <NotifPanel user={user} onClose={() => setNotifOpen(false)} />}
      {actionOpen && <AgentPicker onClose={() => setActionOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
          style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}
              style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1.2 }}>{pageTitle}</h1>
              <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1 }}>{pageSub}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <button onClick={openNotif}
              style={{
                position: "relative", width: 38, height: 38, borderRadius: 10,
                border: "1.5px solid #e2e8f0", background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = "#faf5ff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fff"; }}
            >
              <Bell size={15} style={{ color: "#64748b" }} />
              {unread > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  minWidth: 16, height: 16, borderRadius: 8, paddingInline: 4,
                  background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1.5px solid #fff",
                }}>
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {/* Nouvelle action */}
            <button onClick={() => setActionOpen(true)}
              className="hidden sm:flex items-center gap-2 font-semibold"
              style={{
                padding: "9px 18px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "#fff", borderRadius: 10, fontSize: 13, border: "none", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(124,58,237,0.35)", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(124,58,237,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(124,58,237,0.35)"; e.currentTarget.style.transform = "none"; }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Nouvelle action
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>

        {/* Footer */}
        <footer className="px-6 py-3 flex items-center justify-center"
          style={{ borderTop: "1px solid #e2e8f0", background: "#fff" }}>
          <span style={{ fontSize: 10.5, color: "#94a3b8" }}>
            Dealyze · Gemini 2.5 Flash · XPRIZE AI Hackathon 2026
          </span>
        </footer>
      </div>
    </div>
  );
}
