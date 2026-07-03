"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, Mail, BarChart3, Shield, ArrowRight,
  Zap, X, Clock, ChevronRight, Inbox, Calendar,
  TrendingUp, Sparkles,
} from "lucide-react";
import { api } from "../lib/api";
import { getUser } from "../lib/auth";
import { getActivity, relativeTime, ACTIVITY_META } from "../lib/activity";
import type { ActivityItem } from "../lib/activity";

interface AgentQuota { utilisé: number; limite: number | "illimité"; restant: number | "illimité"; }
interface QuotaResponse {
  plan: string; mois: string;
  quotas: { deal_draft: AgentQuota; smart_chase: AgentQuota; pitch_radar: AgentQuota; deep_due: AgentQuota };
}

const PLAN_LABELS: Record<string, string> = {
  free_trial: "Free Trial", starter: "Starter", growth: "Growth", enterprise: "Enterprise",
};

const STATS = [
  { key: "deal_draft",  label: "Devis générés",        sub: "propositions envoyées",       icon: FileText,  color: "#7c3aed", iconBg: "#ede9fe", gradFrom: "#7c3aed", gradTo: "#a855f7" },
  { key: "smart_chase", label: "Relances envoyées",     sub: "impayés relancés",             icon: Mail,      color: "#f97316", iconBg: "#fff7ed", gradFrom: "#f97316", gradTo: "#fb923c" },
  { key: "pitch_radar", label: "Pitchs analysés",       sub: "decks notés par l'IA",        icon: BarChart3, color: "#06b6d4", iconBg: "#ecfeff", gradFrom: "#06b6d4", gradTo: "#22d3ee" },
  { key: "deep_due",    label: "Analyses DD réalisées", sub: "due diligences complètes",     icon: Shield,    color: "#10b981", iconBg: "#f0fdf4", gradFrom: "#10b981", gradTo: "#34d399" },
];

const QUICK = [
  { href: "/dashboard/smart-chase", icon: Mail,      color: "#f97316", bg: "#fff7ed", border: "#fed7aa", name: "Smart Chase", desc: "Transformez vos créances en paiements"   },
  { href: "/dashboard/pitch-radar", icon: BarChart3, color: "#06b6d4", bg: "#ecfeff", border: "#a5f3fc", name: "Pitch Radar", desc: "Score VC en moins d'une minute"           },
  { href: "/dashboard/deep-due",    icon: Shield,    color: "#10b981", bg: "#f0fdf4", border: "#86efac", name: "Deep Due",    desc: "Due diligence sur n'importe quelle cible" },
];

/* ── Activity drawer ── */
function ActivityDrawer({ item, onClose }: { item: ActivityItem; onClose: () => void }) {
  const meta   = ACTIVITY_META[item.type];
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(11,21,38,0.4)", backdropFilter: "blur(5px)" }} />
      <div className="absolute right-0 top-0 h-full flex flex-col"
        style={{ width: 420, background: "#fff", boxShadow: "-12px 0 50px rgba(0,0,0,0.14)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: meta.bg, borderBottom: `1px solid ${meta.color}22`, padding: "24px 24px 20px" }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.7)", border: `1px solid ${meta.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: meta.color }} />
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: meta.color, display: "block", marginBottom: 5 }}>{meta.label}</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.4, marginBottom: 3 }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: "#64748b" }}>{item.subtitle}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 9, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <X size={13} style={{ color: "#64748b" }} />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "22px 24px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 14 }}>Résumé de l&apos;action</div>
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #f1f5f9" }}>
            {item.details.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "13px 18px", background: i % 2 === 0 ? "#fff" : "#fafbfc", borderBottom: i < item.details.length - 1 ? "1px solid #f1f5f9" : "none", gap: 20 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, flexShrink: 0, minWidth: 120 }}>{d.label}</span>
                <span style={{ fontSize: 12.5, color: "#0f172a", fontWeight: 600, textAlign: "right", lineHeight: 1.5 }}>{d.value || "—"}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, padding: "12px 16px", borderRadius: 11, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
            <Clock size={13} style={{ color: "#94a3b8", flexShrink: 0 }} strokeWidth={1.75} />
            <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
              {new Date(item.timestamp).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} à {new Date(item.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "18px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 11, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
            Fermer
          </button>
          <button onClick={() => { router.push(item.href); onClose(); }}
            style={{ flex: 2, padding: "11px", borderRadius: 11, border: "none", background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${meta.color}40`, letterSpacing: "-0.01em" }}
          >
            Relancer cet agent →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function DashboardPage() {
  const user = getUser();
  const [quota,       setQuota]      = useState<QuotaResponse | null>(null);
  const [loading,     setLoading]    = useState(true);
  const [activities,  setActivities] = useState<ActivityItem[]>([]);
  const [selected,    setSelected]   = useState<ActivityItem | null>(null);

  const loadAct = useCallback(() => { setActivities(getActivity()); }, []);

  useEffect(() => {
    api.get<QuotaResponse>("/auth/quota").then((r) => setQuota(r.data)).catch(() => null).finally(() => setLoading(false));
    loadAct();
    window.addEventListener("focus", loadAct);
    return () => window.removeEventListener("focus", loadAct);
  }, [loadAct]);

  const firstName = user?.full_name?.split(" ")[0] ?? "—";
  const planKey   = quota?.plan ?? user?.plan ?? "free_trial";
  const planLabel = PLAN_LABELS[planKey] ?? planKey;

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const todayCapital = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <>
      {selected && <ActivityDrawer item={selected} onClose={() => setSelected(null)} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        {/* ══════════════════════════════════════
            WELCOME BANNER
        ══════════════════════════════════════ */}
        <div style={{
          background: "linear-gradient(135deg, #0b1526 0%, #0f2040 50%, #0b1a35 100%)",
          borderRadius: 20, padding: "32px 36px",
          position: "relative", overflow: "hidden",
          boxShadow: "0 8px 32px rgba(11,21,38,0.18), 0 1px 0 rgba(255,255,255,0.06) inset",
        }}>
          {/* Decorative orbs */}
          <div style={{ position: "absolute", top: -40, right: 60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: -30, right: 200, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", top: 20, right: 30, width: 80, height: 80, borderRadius: "50%", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.12)" }} />

          <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Calendar size={12} style={{ color: "rgba(255,255,255,0.38)" }} strokeWidth={1.75} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", letterSpacing: "0.02em" }}>{todayCapital}</span>
              </div>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1.1, marginBottom: 10 }}>
                Bonjour,{" "}
                <span style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {firstName}
                </span>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 380 }}>
                Vos 4 agents IA sont opérationnels. Chaque action génère un résultat en moins de 60 secondes.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              <div style={{ padding: "8px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Plan</span>
                <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700 }}>{planLabel}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                <Sparkles size={10} strokeWidth={1.5} />
                Gemini 2.5 Flash · XPRIZE 2026
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            STAT CARDS
        ══════════════════════════════════════ */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <TrendingUp size={14} style={{ color: "#94a3b8" }} strokeWidth={1.75} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Métriques du mois</span>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
            {STATS.map(({ key, label, sub, icon: Icon, color, iconBg, gradFrom, gradTo }) => {
              const q   = quota?.quotas?.[key as keyof QuotaResponse["quotas"]];
              const val = q?.utilisé ?? 0;
              const lim = q?.limite;
              const pct = lim && lim !== "illimité" && (lim as number) > 0 ? Math.min(100, (val / (lim as number)) * 100) : null;
              return (
                <div key={key} style={{
                  background: "#fff", borderRadius: 18, overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f4f8",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px ${color}20, 0 4px 12px rgba(0,0,0,0.08)`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06)"; }}
                >
                  {/* Colored top gradient bar */}
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})` }} />
                  <div style={{ padding: "20px 22px 22px" }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={20} style={{ color }} strokeWidth={1.75} />
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>ce mois</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", lineHeight: 1, letterSpacing: "-2px", marginBottom: 6 }}>
                      {loading ? <span style={{ fontSize: 28, color: "#e2e8f0" }}>—</span> : val}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#334155", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>
                    {pct !== null && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ height: 4, borderRadius: 4, background: "#f1f5f9", overflow: "hidden", marginBottom: 6 }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`, borderRadius: 4, transition: "width 1.2s ease" }} />
                        </div>
                        <div style={{ fontSize: 10.5, color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                          <span>{val} utilisé{val > 1 ? "s" : ""}</span>
                          <span style={{ color }}>{lim} max</span>
                        </div>
                      </div>
                    )}
                    {pct === null && !loading && (
                      <div style={{ marginTop: 16 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color, background: iconBg, padding: "4px 10px", borderRadius: 7 }}>
                          ∞ Illimité
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════
            ACTIVITY + QUICK ACCESS
        ══════════════════════════════════════ */}
        <div className="grid xl:grid-cols-3 gap-6 items-start">

          {/* Activity feed — 2/3 */}
          <div className="xl:col-span-2" style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f0f4f8" }}>
            {/* Card header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #ede9fe, #f5f3ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Clock size={13} style={{ color: "#7c3aed" }} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.2px" }}>Activité récente</span>
                </div>
                <p style={{ fontSize: 11.5, color: "#94a3b8", paddingLeft: 36 }}>Toutes vos actions enregistrées</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#f8fafc", borderRadius: 9, border: "1px solid #e2e8f0" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{activities.length} action{activities.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <Inbox size={28} style={{ color: "#cbd5e1" }} strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#334155", marginBottom: 8 }}>Aucune activité pour le moment</p>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, maxWidth: 300, marginBottom: 22 }}>
                  Chaque devis, relance ou analyse que vous lancez apparaîtra ici avec son résultat consultable.
                </p>
                <Link href="/dashboard/deal-draft" style={{ padding: "10px 22px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", borderRadius: 11, fontSize: 13.5, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(124,58,237,0.38)", letterSpacing: "-0.01em" }}>
                  <Zap size={14} strokeWidth={2.5} /> Lancer votre premier agent
                </Link>
              </div>
            ) : (
              <div>
                {activities.slice(0, 8).map((item, i, arr) => {
                  const meta = ACTIVITY_META[item.type];
                  return (
                    <button key={item.id} onClick={() => setSelected(item)}
                      className="w-full text-left transition-all"
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 24px",
                        borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none",
                        background: "transparent", border: "none", cursor: "pointer",
                        borderLeft: `3px solid ${meta.color}`,
                        marginLeft: 0,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fafbfd"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      {/* Agent dot + icon */}
                      <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${meta.color}22` }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: meta.color }} />
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.title}</span>
                          <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: meta.color, background: meta.bg, padding: "2px 7px", borderRadius: 5, flexShrink: 0 }}>{meta.label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{item.subtitle}</div>
                      </div>
                      {/* Time + arrow */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "#cbd5e1" }}>{relativeTime(item.timestamp)}</span>
                        <div style={{ width: 22, height: 22, borderRadius: 7, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ChevronRight size={11} style={{ color: "#94a3b8" }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column — 1/3 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Quick access */}
            <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f0f4f8" }}>
              <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #ecfeff, #f0fdff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap size={13} style={{ color: "#06b6d4" }} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.2px" }}>Accès rapide</span>
                </div>
                <p style={{ fontSize: 11.5, color: "#94a3b8", paddingLeft: 36 }}>Lancez un agent directement</p>
              </div>
              {QUICK.map((q, i) => {
                const Icon = q.icon;
                return (
                  <Link key={q.href} href={q.href} style={{ textDecoration: "none", display: "block" }}>
                    <div
                      className="flex items-center gap-3 transition-all"
                      style={{ padding: "14px 22px", borderBottom: i < QUICK.length - 1 ? "1px solid #f8fafc" : "none", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#fafbfd"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: q.bg, border: `1px solid ${q.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={18} style={{ color: q.color }} strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{q.name}</div>
                        <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.4 }}>{q.desc}</div>
                      </div>
                      <div style={{ width: 26, height: 26, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <ArrowRight size={12} style={{ color: "#94a3b8" }} strokeWidth={1.75} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Deal Draft CTA */}
            <Link href="/dashboard/deal-draft" style={{ textDecoration: "none" }}>
              <div style={{
                borderRadius: 18, padding: "26px 24px",
                background: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #9333ea 100%)",
                cursor: "pointer", position: "relative", overflow: "hidden",
                boxShadow: "0 12px 36px rgba(91,33,182,0.38)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 18px 48px rgba(91,33,182,0.52)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(91,33,182,0.38)"; }}
              >
                {/* Orbs */}
                <div style={{ position: "absolute", top: -30, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <div style={{ position: "absolute", bottom: -20, left: 30, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                    <FileText size={22} style={{ color: "#fff" }} strokeWidth={1.75} />
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 7, letterSpacing: "-0.3px" }}>Deal Draft</div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", marginBottom: 20, lineHeight: 1.65 }}>
                    Générez une proposition commerciale premium sur-mesure en moins de 30 secondes.
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "rgba(255,255,255,0.2)", borderRadius: 11, color: "#fff", fontSize: 13, fontWeight: 700, border: "1px solid rgba(255,255,255,0.28)", letterSpacing: "-0.01em" }}>
                    <Zap size={13} strokeWidth={2.5} /> Lancer maintenant
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
