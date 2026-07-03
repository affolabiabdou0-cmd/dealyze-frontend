"use client";

import { useState, useEffect } from "react";
import { CreditCard, Check, ArrowRight, Zap, Star, FileText, Mail, BarChart3, Shield, Clock, Receipt } from "lucide-react";
import { getUser } from "../../lib/auth";
import { api } from "../../lib/api";

const PLANS = [
  {
    id: "starter", name: "Starter", price: 47, currency: "$",
    desc: "Pour démarrer sur vos premiers deals",
    features: ["17 Deal Draft / mois", "17 Smart Chase / mois", "5 Pitch Radar / mois", "Due Diligence non inclus", "Support email"],
    highlight: false, border: "#e2e8f0", glow: "transparent",
  },
  {
    id: "growth", name: "Growth", price: 147, currency: "$",
    desc: "Pour les équipes actives",
    features: ["Deal Draft illimité", "Smart Chase illimité", "Pitch Radar illimité", "5 Deep Due / mois", "Support prioritaire"],
    highlight: true, border: "#7c3aed", glow: "rgba(124,58,237,0.12)",
  },
  {
    id: "enterprise", name: "Enterprise", price: 477, currency: "$",
    desc: "Pour les fonds et équipes en volume",
    features: ["Tout illimité", "Deep Due illimité", "Accès API", "Onboarding dédié", "SLA 99.9%"],
    highlight: false, border: "#fde68a", glow: "transparent",
  },
] as const;

interface AgentQuota {
  utilisé: number;
  limite: number | "illimité";
}
interface QuotaResponse {
  plan: string; mois: string;
  quotas: { deal_draft: AgentQuota; smart_chase: AgentQuota; pitch_radar: AgentQuota; deep_due: AgentQuota };
}

const AGENT_META = [
  { key: "deal_draft",  label: "Deal Draft",  icon: FileText,  color: "#7c3aed" },
  { key: "smart_chase", label: "Smart Chase", icon: Mail,      color: "#f97316" },
  { key: "pitch_radar", label: "Pitch Radar", icon: BarChart3, color: "#06b6d4" },
  { key: "deep_due",    label: "Deep Due",    icon: Shield,    color: "#10b981" },
] as const;

const PLAN_DAYS: Record<string, { remaining: number; total: number }> = {
  free_trial: { remaining: 11, total: 14 },
  starter:    { remaining: 22, total: 30 },
  growth:     { remaining: 18, total: 30 },
  enterprise: { remaining: 30, total: 30 },
};

function dayBarColor(pct: number) {
  if (pct > 50) return "#10b981";
  if (pct > 25) return "#f59e0b";
  return "#ef4444";
}

const CARD: React.CSSProperties = {
  background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14,
  padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

export default function BillingPage() {
  const user       = getUser();
  const currentPlan = user?.plan ?? "free_trial";
  const [quota, setQuota]             = useState<QuotaResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    api.get<QuotaResponse>("/auth/quota").then((r) => setQuota(r.data)).catch(() => null);
  }, []);

  const planDays = PLAN_DAYS[currentPlan] ?? PLAN_DAYS.free_trial;
  const dayPct   = Math.round((planDays.remaining / planDays.total) * 100);
  const dayColor = dayBarColor(dayPct);

  const PLAN_LABEL: Record<string, string> = {
    free_trial: "Free Trial", starter: "Starter", growth: "Growth", enterprise: "Enterprise",
  };
  const PLAN_COLOR: Record<string, string> = {
    free_trial: "#a78bfa", starter: "#3b82f6", growth: "#7c3aed", enterprise: "#10b981",
  };
  const planColor = PLAN_COLOR[currentPlan] ?? "#a78bfa";

  async function handleUpgrade(planId: string) {
    setLoadingPlan(planId);
    try {
      const res = await api.post<{ checkout_url: string }>("/billing/checkout", { plan: planId });
      window.location.href = res.data.checkout_url;
    } catch {
      alert("Erreur lors de la création du paiement. Contactez le support.");
    } finally { setLoadingPlan(null); }
  }

  return (
    <div className="w-full space-y-3">

      {/* ── Plan actuel + agents côte à côte ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

        {/* Plan info */}
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <CreditCard size={14} style={{ color: planColor }} strokeWidth={1.5} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Plan actuel</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${planColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Zap size={16} style={{ color: planColor }} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{PLAN_LABEL[currentPlan]}</span>
                {currentPlan === "free_trial" && (
                  <span style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: "#fffbeb", color: "#f59e0b", border: "1px solid #fde68a", whiteSpace: "nowrap" }}>Essai</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                {currentPlan === "free_trial" ? "5 usages gratuits / agent" : "Abonnement mensuel actif"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 10px", flexShrink: 0 }}>
              <Clock size={11} style={{ color: dayColor }} strokeWidth={1.5} />
              <span style={{ fontSize: 11, fontWeight: 600, color: dayColor, whiteSpace: "nowrap" }}>{planDays.remaining}j</span>
            </div>
          </div>
          <div style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>Période</span>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "#64748b" }}>{planDays.remaining}/{planDays.total} j</span>
            </div>
            <div style={{ height: 4, borderRadius: 4, background: "#f1f5f9", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${dayPct}%`, borderRadius: 4, background: `linear-gradient(90deg, ${dayColor}, ${dayColor}99)`, transition: "width 1s" }} />
            </div>
          </div>
        </div>

        {/* Quotas agents */}
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Zap size={14} style={{ color: "#94a3b8" }} strokeWidth={1.5} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Utilisation agents</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {AGENT_META.map(({ key, label, icon: Icon, color }) => {
              const q = quota?.quotas?.[key as keyof QuotaResponse["quotas"]];
              const unlimited = q?.limite === "illimité";
              const pct = !q ? 0 : unlimited ? 10 : Math.min(100, (q.utilisé / (q.limite as number)) * 100);
              return (
                <div key={key}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon size={11} style={{ color }} strokeWidth={1.5} />
                      <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 500 }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#94a3b8" }}>
                      {q ? `${q.utilisé}/${unlimited ? "∞" : q.limite}` : "—"}
                    </span>
                  </div>
                  <div style={{ height: 3, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: color, transition: "width 1s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Plans ── */}
      <div>
        <h3 style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>
          Passer à un plan supérieur
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div key={plan.id}
                style={{
                  background: "#ffffff", border: `1.5px solid ${plan.border}`, borderRadius: 12,
                  display: "flex", flexDirection: "column",
                  transform: plan.highlight ? "translateY(-2px)" : "none",
                  boxShadow: plan.highlight ? `0 6px 20px ${plan.glow}` : "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => { if (!plan.highlight) { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.09)"; } }}
                onMouseLeave={(e) => { if (!plan.highlight) { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; } }}
              >
                <div style={{ padding: "14px 16px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{plan.name}</h4>
                    {plan.highlight && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 5, background: "#7c3aed", color: "#fff", fontSize: 9.5, fontWeight: 700 }}>
                        <Star size={8} fill="#fff" /> Recommandé
                      </div>
                    )}
                    {plan.id === "enterprise" && (
                      <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: "#fffbeb", color: "#f59e0b", border: "1px solid #fde68a" }}>✦ Pro</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 3, marginBottom: 10 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, fontFamily: "monospace", color: "#0f172a", lineHeight: 1 }}>{plan.currency}{plan.price}</span>
                    <span style={{ fontSize: 10.5, color: "#94a3b8", marginBottom: 3 }}>/mois</span>
                  </div>
                  <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px", marginBottom: 10 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                        <Check size={10}
                          style={{ color: plan.highlight ? "#7c3aed" : plan.id === "enterprise" ? "#f59e0b" : "#94a3b8", flexShrink: 0 }}
                          strokeWidth={2.5} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: "0 16px 14px", marginTop: "auto" }}>
                  {isCurrent ? (
                    <div style={{ padding: "8px", borderRadius: 8, textAlign: "center", fontSize: 11.5, fontWeight: 600, color: "#94a3b8", background: "#f8fafc", border: "1px solid #e2e8f0" }}>Plan actuel</div>
                  ) : (
                    <button onClick={() => handleUpgrade(plan.id)} disabled={loadingPlan === plan.id}
                      style={{
                        width: "100%", padding: "9px", borderRadius: 8,
                        border: plan.highlight ? "none" : "1px solid #e2e8f0",
                        background: plan.highlight ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "#f8fafc",
                        color: plan.highlight ? "#fff" : "#0f172a",
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        boxShadow: plan.highlight ? "0 3px 12px rgba(124,58,237,0.35)" : "none",
                        transition: "opacity 0.15s", opacity: loadingPlan === plan.id ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => { if (!plan.highlight) e.currentTarget.style.background = "#f1f5f9"; }}
                      onMouseLeave={(e) => { if (!plan.highlight) e.currentTarget.style.background = "#f8fafc"; }}
                    >
                      {loadingPlan === plan.id
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <>Choisir {plan.name} <ArrowRight size={12} strokeWidth={1.5} /></>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Historique + Sécurité sur une ligne ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
        <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Receipt size={14} style={{ color: "#cbd5e1" }} strokeWidth={1.5} />
          </div>
          <div>
            <p style={{ fontSize: 12.5, color: "#334155", fontWeight: 600 }}>Historique des paiements</p>
            <p style={{ fontSize: 11, color: "#94a3b8" }}>Aucun paiement — vos factures apparaîtront ici</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 12, background: "#fff", border: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>🔒 SSL</span>
          <div style={{ width: 1, height: 14, background: "#e2e8f0" }} />
          <div style={{ padding: "2px 7px", borderRadius: 4, background: "#1a1ae0" }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#fff", fontStyle: "italic" }}>VISA</span>
          </div>
          <div style={{ display: "flex" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316", display: "inline-block", marginLeft: -4 }} />
          </div>
          <div style={{ width: 1, height: 14, background: "#e2e8f0" }} />
          <span style={{ fontSize: 10.5, color: "#94a3b8" }}>Annulation libre</span>
        </div>
      </div>

    </div>
  );
}
