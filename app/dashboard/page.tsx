"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, Mail, BarChart3, Shield, ArrowRight,
  TrendingUp, Zap, X, Clock, ChevronRight, Inbox,
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
  { key: "deal_draft",  label: "Devis générés",        icon: FileText,  color: "#7c3aed", iconBg: "#ede9fe" },
  { key: "smart_chase", label: "Relances envoyées",     icon: Mail,      color: "#f97316", iconBg: "#fff7ed" },
  { key: "pitch_radar", label: "Pitchs analysés",       icon: BarChart3, color: "#06b6d4", iconBg: "#ecfeff" },
  { key: "deep_due",    label: "Analyses DD réalisées", icon: Shield,    color: "#10b981", iconBg: "#f0fdf4" },
];

const QUICK = [
  { href: "/dashboard/smart-chase", icon: Mail,      color: "#f97316", bg: "#fff7ed", name: "Smart Chase", desc: "Relancez automatiquement vos créances impayées" },
  { href: "/dashboard/pitch-radar", icon: BarChart3, color: "#06b6d4", bg: "#ecfeff", name: "Pitch Radar", desc: "Notez un pitch deck en moins d'une minute"       },
  { href: "/dashboard/deep-due",    icon: Shield,    color: "#10b981", bg: "#f0fdf4", name: "Deep Due",    desc: "Due diligence complète sur n'importe quelle cible" },
];

const CARD: React.CSSProperties = {
  background: "#ffffff", border: "1px solid #e2e8f0",
  borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

/* ── Activity preview drawer ── */
function ActivityDrawer({ item, onClose }: { item: ActivityItem; onClose: () => void }) {
  const meta = ACTIVITY_META[item.type];
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(15,23,42,0.35)", backdropFilter: "blur(4px)" }} />
      <div className="absolute right-0 top-0 h-full flex flex-col"
        style={{ width: 400, background: "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="flex items-start gap-3">
            <div style={{ width: 40, height: 40, borderRadius: 11, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: meta.color }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: meta.color, marginBottom: 4 }}>{meta.label}</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>{item.title}</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{item.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <X size={13} style={{ color: "#64748b" }} />
          </button>
        </div>

        {/* details */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12 }}>Détails de l&apos;action</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
            {item.details.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 16px", background: i % 2 === 0 ? "#fff" : "#f8fafc", gap: 16 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, flexShrink: 0, minWidth: 110 }}>{d.label}</span>
                <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 600, textAlign: "right", lineHeight: 1.4 }}>{d.value || "—"}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={12} style={{ color: "#94a3b8", flexShrink: 0, marginTop: 1 }} strokeWidth={1.75} />
            <span style={{ fontSize: 12, color: "#64748b" }}>{relativeTime(item.timestamp)} — {new Date(item.timestamp).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Fermer
          </button>
          <button
            onClick={() => { router.push(item.href); onClose(); }}
            style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 12px ${meta.color}40` }}
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
  const [quota,        setQuota]       = useState<QuotaResponse | null>(null);
  const [loadingQuota, setLoading]     = useState(true);
  const [activities,   setActivities]  = useState<ActivityItem[]>([]);
  const [selected,     setSelected]    = useState<ActivityItem | null>(null);

  const loadActivities = useCallback(() => { setActivities(getActivity()); }, []);

  useEffect(() => {
    api.get<QuotaResponse>("/auth/quota")
      .then((r) => setQuota(r.data))
      .catch(() => null)
      .finally(() => setLoading(false));
    loadActivities();
    // refresh on focus so new activities appear after returning from agent pages
    window.addEventListener("focus", loadActivities);
    return () => window.removeEventListener("focus", loadActivities);
  }, [loadActivities]);

  const firstName = user?.full_name?.split(" ")[0] ?? "—";
  const planKey   = quota?.plan ?? user?.plan ?? "free_trial";
  const planLabel = PLAN_LABELS[planKey] ?? planKey;

  return (
    <>
      {selected && <ActivityDrawer item={selected} onClose={() => setSelected(null)} />}

      <div className="space-y-6 h-full">

        {/* ── Welcome ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.4px" }}>
              Bonjour, {firstName}
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 3 }}>
              Voici un aperçu de votre activité sur Dealyze.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#64748b" }}>Plan</span>
            <span style={{ fontSize: 12, color: "#7c3aed", fontWeight: 700 }}>{planLabel}</span>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map(({ key, label, icon: Icon, color, iconBg }) => {
            const q   = quota?.quotas?.[key as keyof QuotaResponse["quotas"]];
            const val = q?.utilisé ?? 0;
            const lim = q?.limite;
            const pct = lim && lim !== "illimité" && (lim as number) > 0 ? Math.min(100, (val / (lim as number)) * 100) : null;
            return (
              <div key={key} style={{ ...CARD, padding: "20px" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} style={{ color }} strokeWidth={1.75} />
                  </div>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>ce mois</span>
                </div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#0f172a", lineHeight: 1, letterSpacing: "-1.5px" }}>
                  {loadingQuota ? <span style={{ fontSize: 24, color: "#e2e8f0" }}>—</span> : val}
                </div>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>{label}</div>
                <div style={{ marginTop: 14 }}>
                  {pct !== null ? (
                    <>
                      <div style={{ height: 3, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 3, transition: "width 1s" }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{val} / {lim}</div>
                    </>
                  ) : (
                    !loadingQuota && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color, background: iconBg, padding: "3px 8px", borderRadius: 6 }}>Illimité</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom: Activity + Quick access ── */}
        <div className="grid xl:grid-cols-3 gap-6 items-stretch">

          {/* Activity feed — 2/3 */}
          <div className="xl:col-span-2" style={{ ...CARD, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: "#94a3b8" }} strokeWidth={1.75} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Activité récente</span>
              </div>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{activities.length} action{activities.length !== 1 ? "s" : ""}</span>
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1" style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Inbox size={24} style={{ color: "#cbd5e1" }} strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Aucune activité pour le moment</p>
                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, maxWidth: 280 }}>
                  Chaque devis, relance ou analyse que vous lancez apparaîtra ici avec son résultat consultable.
                </p>
                <Link href="/dashboard/deal-draft"
                  style={{ marginTop: 18, padding: "9px 18px", background: "#7c3aed", color: "#fff", borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(124,58,237,0.35)" }}>
                  <Zap size={13} strokeWidth={2.5} /> Lancer votre premier agent
                </Link>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                {activities.slice(0, 8).map((item, i, arr) => {
                  const meta = ACTIVITY_META[item.type];
                  return (
                    <button key={item.id}
                      onClick={() => setSelected(item)}
                      className="w-full text-left flex items-start gap-4 px-6 py-4 transition-all"
                      style={{
                        borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none",
                        background: "transparent", border: "none", cursor: "pointer", display: "flex",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{item.subtitle}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0" style={{ marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: "#cbd5e1" }}>{relativeTime(item.timestamp)}</span>
                        <ChevronRight size={12} style={{ color: "#e2e8f0" }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column — 1/3 */}
          <div className="flex flex-col gap-4">

            {/* Quick access */}
            <div style={{ ...CARD, padding: 0, overflow: "hidden", flex: 1 }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} style={{ color: "#94a3b8" }} strokeWidth={1.75} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Accès rapide</span>
                </div>
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Lancez un agent en un clic</p>
              </div>
              {QUICK.map((q, i) => {
                const Icon = q.icon;
                return (
                  <Link key={q.href} href={q.href} style={{ textDecoration: "none", display: "block" }}>
                    <div className="flex items-center gap-3 px-5 py-4 transition-all"
                      style={{ borderBottom: i < QUICK.length - 1 ? "1px solid #f8fafc" : "none", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: q.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={17} style={{ color: q.color }} strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{q.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1, lineHeight: 1.4 }}>{q.desc}</div>
                      </div>
                      <ArrowRight size={13} style={{ color: "#cbd5e1", flexShrink: 0 }} strokeWidth={1.75} />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Deal Draft CTA */}
            <Link href="/dashboard/deal-draft" style={{ textDecoration: "none" }}>
              <div style={{
                borderRadius: 14, padding: "22px",
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                cursor: "pointer", position: "relative", overflow: "hidden",
                boxShadow: "0 8px 24px rgba(124,58,237,0.28)",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(124,58,237,0.42)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(124,58,237,0.28)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
              >
                <div style={{ position: "absolute", top: -24, right: -24, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <FileText size={20} style={{ color: "#fff" }} strokeWidth={1.75} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 5 }}>Deal Draft</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginBottom: 16, lineHeight: 1.55 }}>
                  Générez une proposition commerciale premium en moins de 30 secondes.
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", background: "rgba(255,255,255,0.18)",
                  borderRadius: 9, color: "#fff", fontSize: 12, fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.25)",
                }}>
                  <Zap size={12} strokeWidth={2.5} /> Lancer maintenant
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
