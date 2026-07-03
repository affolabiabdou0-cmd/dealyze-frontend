"use client";

import { useEffect, useState } from "react";
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

const NAV_OVERVIEW = [
  { href: "/dashboard", label: "Tableau de bord", sub: "Vue d'ensemble de votre activité", icon: LayoutDashboard },
];
const NAV_MODULES = [
  { href: "/dashboard/deal-draft",  label: "Deal Draft",  sub: "Propositions commerciales IA", icon: FileText,  color: "#a78bfa", iconBg: "rgba(167,139,250,0.16)" },
  { href: "/dashboard/smart-chase", label: "Smart Chase", sub: "Relancez vos impayés",          icon: Mail,      color: "#fb923c", iconBg: "rgba(251,146,60,0.16)"  },
  { href: "/dashboard/pitch-radar", label: "Pitch Radar", sub: "Analysez des pitch decks VC",  icon: BarChart3, color: "#22d3ee", iconBg: "rgba(34,211,238,0.16)"  },
  { href: "/dashboard/deep-due",    label: "Deep Due",    sub: "Due diligence automatisée",     icon: Shield,    color: "#34d399", iconBg: "rgba(52,211,153,0.16)"  },
];
const NAV_ACCOUNT = [
  { href: "/dashboard/settings", label: "Paramètres", sub: "Compte et préférences", icon: Settings  },
  { href: "/dashboard/billing",  label: "Facturation", sub: "Plans et abonnements", icon: CreditCard },
];
const ALL_NAV = [...NAV_OVERVIEW, ...NAV_MODULES, ...NAV_ACCOUNT];

const PLAN_PRICES: Record<string, string> = { free_trial: "Gratuit", starter: "47$/mo", growth: "147$/mo", enterprise: "Personnalisé" };
const PLAN_LABELS: Record<string, string> = { free_trial: "Free Trial", starter: "Starter", growth: "Growth", enterprise: "Enterprise" };
const PLAN_INFO: Record<string, { daysRemaining: number; daysTotal: number }> = {
  free_trial: { daysRemaining: 11, daysTotal: 14 },
  starter:    { daysRemaining: 22, daysTotal: 30 },
  growth:     { daysRemaining: 18, daysTotal: 30 },
  enterprise: { daysRemaining: 30, daysTotal: 30 },
};

function SectionLabel({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <div style={{
      fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em",
      color: "rgba(255,255,255,0.22)", textTransform: "uppercase",
      padding: first ? "6px 14px 10px" : "24px 14px 10px",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
      {children}
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

type NavEntry = { href: string; label: string; icon: React.ElementType; color?: string; iconBg?: string; onClose?: () => void };

function NavItem({ href, label, icon: Icon, color, iconBg, onClose }: NavEntry) {
  const pathname = usePathname();
  const active   = pathname === href;
  const ac = color  ?? "#a78bfa";
  const ab = iconBg ?? "rgba(167,139,250,0.16)";
  return (
    <Link href={href} onClick={onClose}
      className="flex items-center gap-3 rounded-xl font-medium transition-all"
      style={{
        padding: "10px 12px",
        background: active ? ab : "transparent",
        color: active ? ac : "rgba(255,255,255,0.52)",
        textDecoration: "none", position: "relative",
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.82)"; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.52)"; } }}
    >
      {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, borderRadius: 2, background: ac }} />}
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: active ? ab : "rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s",
        boxShadow: active ? `0 2px 8px ${ac}33` : "none",
      }}>
        <Icon size={14} strokeWidth={1.8} style={{ color: active ? ac : "rgba(255,255,255,0.38)" }} />
      </div>
      <span style={{ fontSize: 13.5, lineHeight: 1, letterSpacing: "-0.01em" }}>{label}</span>
      {active && <ChevronRight size={12} style={{ marginLeft: "auto", color: ac, opacity: 0.7 }} />}
    </Link>
  );
}

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
    <aside className="flex flex-col h-full" style={{ background: "#0b1526" }}>

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-6">
        <Link href="/dashboard" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(124,58,237,0.5)",
          }}>
            <Zap size={18} strokeWidth={2.5} style={{ color: "#fff" }} />
          </div>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.5px", color: "#f8fafc", display: "block", lineHeight: 1 }}>
              Dealyze<span style={{ color: "#a78bfa" }}>.</span>
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em", fontWeight: 600 }}>AI PLATFORM</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginInline: 20 }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 1 }}>
        <SectionLabel first>Vue d&apos;ensemble</SectionLabel>
        {NAV_OVERVIEW.map((n) => <NavItem key={n.href} {...n} onClose={onClose} />)}

        <SectionLabel>Modules IA</SectionLabel>
        {NAV_MODULES.map((n) => <NavItem key={n.href} {...n} onClose={onClose} />)}

        <SectionLabel>Compte</SectionLabel>
        {NAV_ACCOUNT.map((n) => <NavItem key={n.href} {...n} onClose={onClose} />)}

        <button
          onClick={() => { clearAuth(); router.push("/login"); }}
          className="w-full flex items-center gap-3 rounded-xl font-medium transition-all"
          style={{ padding: "10px 12px", color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", textAlign: "left", marginTop: 4 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)" }}>
            <LogOut size={14} strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: 13.5 }}>Déconnexion</span>
        </button>
      </nav>

      {/* Separator */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginInline: 20 }} />

      {/* Plan card */}
      <div style={{ padding: "20px 16px 12px" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Plan {planLabel}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 6 }}>{price}</span>
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
            {planInfo.daysRemaining} jours restants · {pct}% actif
          </div>
          <div style={{ height: 5, borderRadius: 5, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 14 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)", borderRadius: 5 }} />
          </div>
          <Link href="/dashboard/billing" style={{
            display: "block", textAlign: "center", padding: "9px 0",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            color: "#fff", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
            textDecoration: "none", letterSpacing: "-0.01em",
            boxShadow: "0 4px 14px rgba(124,58,237,0.45)",
          }}>
            Mettre à niveau →
          </Link>
        </div>
      </div>

      {/* User */}
      {user && (
        <div style={{ padding: "12px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 13, fontWeight: 800,
            boxShadow: "0 4px 12px rgba(124,58,237,0.45)",
          }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.full_name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>{role}</div>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ── Notification panel ── */
function NotifPanel({ user, onClose }: { user: User | null; onClose: () => void }) {
  const activities = getActivity().slice(0, 8);
  const planKey    = user?.plan ?? "free_trial";
  const planInfo   = PLAN_INFO[planKey] ?? PLAN_INFO.free_trial;
  useEffect(() => { markNotifSeen(); }, []);
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full flex flex-col shadow-2xl"
        style={{ width: 360, background: "#fff", borderLeft: "1px solid #e2e8f0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Notifications</h3>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{activities.length} action{activities.length !== 1 ? "s" : ""} récente{activities.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={14} style={{ color: "#64748b" }} />
          </button>
        </div>
        {planKey === "free_trial" && planInfo.daysRemaining <= 14 && (
          <div style={{ margin: "14px 16px 0", padding: "14px 16px", borderRadius: 12, background: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "1px solid #fde68a" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <AlertTriangle size={14} style={{ color: "#f59e0b", flexShrink: 0 }} strokeWidth={1.75} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Essai gratuit — {planInfo.daysRemaining} jours restants</span>
            </div>
            <p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.6 }}>Passez à un plan payant pour ne pas perdre l'accès à vos agents IA.</p>
            <Link href="/dashboard/billing" onClick={onClose} style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 700, color: "#7c3aed", textDecoration: "none", background: "white", padding: "5px 12px", borderRadius: 7, border: "1px solid #ede9fe" }}>
              Voir les plans →
            </Link>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ padding: "48px 20px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Bell size={22} style={{ color: "#cbd5e1" }} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Aucune notification</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Lancez un agent pour voir vos actions ici</p>
            </div>
          ) : (
            <div style={{ padding: "10px 0" }}>
              {activities.map((item, i) => {
                const meta = ACTIVITY_META[item.type];
                return (
                  <Link key={item.id} href={item.href} onClick={onClose} style={{ textDecoration: "none", display: "block" }}>
                    <div className="flex items-start gap-3 px-5 py-3.5"
                      style={{ borderBottom: i < activities.length - 1 ? "1px solid #f8fafc" : "none" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a", lineHeight: 1.45, marginBottom: 2 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.subtitle}</div>
                        <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 4 }}>{relativeTime(item.timestamp)}</div>
                      </div>
                      <ChevronRight size={12} style={{ color: "#cbd5e1", flexShrink: 0, marginTop: 6 }} />
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
  { href: "/dashboard/deal-draft",  icon: FileText,  color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd", name: "Deal Draft",  desc: "Proposition commerciale professionnelle sur-mesure" },
  { href: "/dashboard/smart-chase", icon: Mail,      color: "#f97316", bg: "#fff7ed", border: "#fed7aa", name: "Smart Chase", desc: "Relancez un client débiteur avec un email IA" },
  { href: "/dashboard/pitch-radar", icon: BarChart3, color: "#06b6d4", bg: "#ecfeff", border: "#a5f3fc", name: "Pitch Radar", desc: "Notez un pitch deck selon les critères VC" },
  { href: "/dashboard/deep-due",    icon: Shield,    color: "#10b981", bg: "#f0fdf4", border: "#86efac", name: "Deep Due",    desc: "Due diligence complète sur une cible" },
];

function AgentPicker({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(11,21,38,0.6)", backdropFilter: "blur(8px)" }} />
      <div className="relative w-full mx-4" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 32px 80px rgba(0,0,0,0.24)", overflow: "hidden" }}>
          <div className="flex items-center justify-between px-7 py-6" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px", marginBottom: 3 }}>Nouvelle action</h3>
              <p style={{ fontSize: 12.5, color: "#94a3b8" }}>Sélectionnez l&apos;agent IA à lancer</p>
            </div>
            <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={14} style={{ color: "#64748b" }} />
            </button>
          </div>
          <div style={{ padding: "20px 24px 8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {AGENT_PICKS.map(({ href, icon: Icon, color, bg, border, name, desc }) => (
              <button key={href} onClick={() => { router.push(href); onClose(); }}
                style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "18px", borderRadius: 14, border: `1.5px solid ${border}`, background: bg, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${color}28`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,0.8)", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={19} style={{ color }} strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 5 }}>{name}</div>
                  <div style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ padding: "16px 24px 22px" }}>
            <div style={{ padding: "12px 16px", borderRadius: 11, background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={12} style={{ color: "#94a3b8" }} strokeWidth={1.75} />
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Chaque agent produit un résultat en moins de 60 secondes grâce à Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Layout ── */
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
  const pageSub     = currentPage?.sub   ?? "Bienvenue sur Dealyze";

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

      {notifOpen  && <NotifPanel user={user} onClose={() => setNotifOpen(false)} />}
      {actionOpen && <AgentPicker onClose={() => setActionOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-7 py-4"
          style={{ background: "rgba(255,255,255,0.92)", borderBottom: "1px solid #e9eef5", backdropFilter: "blur(12px)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)} style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1.2 }}>{pageTitle}</h1>
              <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1 }}>{pageSub}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setNotifOpen(true); setUnread(0); }}
              style={{ position: "relative", width: 40, height: 40, borderRadius: 11, border: "1.5px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = "#faf5ff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fff"; }}
            >
              <Bell size={16} style={{ color: "#64748b" }} />
              {unread > 0 && (
                <span style={{ position: "absolute", top: -5, right: -5, minWidth: 17, height: 17, borderRadius: 9, paddingInline: 4, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #f1f5f9" }}>
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            <button onClick={() => setActionOpen(true)}
              className="hidden sm:flex items-center gap-2"
              style={{ padding: "9px 20px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", borderRadius: 11, fontSize: 13.5, fontWeight: 700, border: "none", cursor: "pointer", letterSpacing: "-0.01em", boxShadow: "0 4px 16px rgba(124,58,237,0.38)", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 22px rgba(124,58,237,0.52)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.38)"; e.currentTarget.style.transform = "none"; }}
            >
              <Plus size={15} strokeWidth={2.5} /> Nouvelle action
            </button>
          </div>
        </header>

        <main className="flex-1 p-5">{children}</main>

        <footer className="px-7 py-3 flex items-center justify-center" style={{ borderTop: "1px solid #e9eef5", background: "rgba(255,255,255,0.8)" }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>Dealyze · Gemini 2.5 Flash · XPRIZE AI Hackathon 2026</span>
        </footer>
      </div>
    </div>
  );
}
