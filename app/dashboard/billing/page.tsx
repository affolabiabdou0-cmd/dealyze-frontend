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
    highlight: false, border: "#2a2a3a", glow: "transparent",
  },
  {
    id: "growth", name: "Growth", price: 147, currency: "$",
    desc: "Pour les équipes actives",
    features: ["Deal Draft illimité", "Smart Chase illimité", "Pitch Radar illimité", "5 Deep Due / mois", "Support prioritaire"],
    highlight: true, border: "#7c3aed", glow: "rgba(124,58,237,0.2)",
  },
  {
    id: "enterprise", name: "Enterprise", price: 477, currency: "$",
    desc: "Pour les fonds et équipes en volume",
    features: ["Tout illimité", "Deep Due illimité", "Accès API", "Onboarding dédié", "SLA 99.9%"],
    highlight: false, border: "#f59e0b44", glow: "transparent",
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

export default function BillingPage() {
  const user       = getUser();
  const currentPlan = user?.plan ?? "free_trial";
  const [quota, setQuota]           = useState<QuotaResponse | null>(null);
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
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Plan actuel ── */}
      <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 16, padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <CreditCard size={18} style={{ color: planColor }} strokeWidth={1.5} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Plan actuel</h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${planColor}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={24} style={{ color: planColor }} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{PLAN_LABEL[currentPlan]}</span>
                {currentPlan === "free_trial" && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "#f59e0b18", color: "#f59e0b" }}>
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", animation: "pulse 1.5s infinite" }} />
                    Essai en cours
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "#4a4a6a" }}>
                {currentPlan === "free_trial" ? "5 utilisations gratuites par agent incluses" : "Abonnement mensuel actif"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={14} style={{ color: dayColor }} strokeWidth={1.5} />
            <span style={{ fontSize: 13, fontWeight: 600, color: dayColor }}>{planDays.remaining} jours restants</span>
          </div>
        </div>

        {/* Days bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#4a4a6a" }}>Durée de la période</span>
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#4a4a6a" }}>{planDays.remaining}/{planDays.total} j</span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: "#2a2a3a", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${dayPct}%`, borderRadius: 4, background: dayColor, transition: "width 1s" }} />
          </div>
        </div>

        {/* Usage per agent */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {AGENT_META.map(({ key, label, icon: Icon, color }) => {
            const q = quota?.quotas?.[key as keyof QuotaResponse["quotas"]];
            const unlimited = q?.limite === "illimité";
            const pct = !q ? 0 : unlimited ? 10 : Math.min(100, (q.utilisé / (q.limite as number)) * 100);
            return (
              <div key={key} style={{ background: "#0f0f13", borderRadius: 10, padding: "14px 16px", border: "1px solid #2a2a3a" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon size={13} style={{ color }} strokeWidth={1.5} />
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "#4a4a6a" }}>
                    {q ? `${q.utilisé} / ${unlimited ? "∞" : q.limite}` : "—"}
                  </span>
                </div>
                <div style={{ height: 3, borderRadius: 3, background: "#2a2a3a", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: color, transition: "width 1s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Plans ── */}
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#3a3a5a", textTransform: "uppercase", marginBottom: 16 }}>
          Passer à un plan supérieur
        </h3>
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div key={plan.id}
                style={{
                  background: "#1a1a24", border: `1px solid ${plan.border}`, borderRadius: 16,
                  display: "flex", flexDirection: "column",
                  transform: plan.highlight ? "translateY(-4px)" : "none",
                  boxShadow: plan.highlight ? `0 0 32px ${plan.glow}` : "none",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!plan.highlight) {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${plan.glow || "rgba(124,58,237,0.1)"}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.highlight) { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }
                }}
              >
                <div style={{ padding: "24px 24px 0" }}>
                  {plan.highlight && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: "#7c3aed", color: "#fff", fontSize: 11, fontWeight: 700, marginBottom: 14 }}>
                      <Star size={10} fill="#fff" /> Recommandé
                    </div>
                  )}
                  {plan.id === "enterprise" && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: "#f59e0b18", color: "#f59e0b", fontSize: 11, fontWeight: 700, marginBottom: 14 }}>
                      ✦ Enterprise
                    </div>
                  )}
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{plan.name}</h4>
                  <p style={{ fontSize: 12, color: "#4a4a6a", marginBottom: 16 }}>{plan.desc}</p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 20 }}>
                    <span style={{ fontSize: 38, fontWeight: 800, fontFamily: "monospace", color: "#f1f5f9", lineHeight: 1 }}>{plan.currency}{plan.price}</span>
                    <span style={{ fontSize: 12, color: "#4a4a6a", marginBottom: 6 }}>/mois</span>
                  </div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                        <Check size={13} style={{ color: plan.highlight ? "#7c3aed" : plan.id === "enterprise" ? "#f59e0b" : "#4a4a6a", flexShrink: 0 }} strokeWidth={2} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: "0 24px 24px", marginTop: "auto" }}>
                  {isCurrent ? (
                    <div style={{ padding: "11px", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: "#4a4a6a", background: "#0f0f13", border: "1px solid #2a2a3a" }}>
                      Plan actuel
                    </div>
                  ) : (
                    <button onClick={() => handleUpgrade(plan.id)} disabled={loadingPlan === plan.id}
                      style={{
                        width: "100%", padding: "12px", borderRadius: 10,
                        border: plan.highlight ? "none" : "1px solid #2a2a3a",
                        background: plan.highlight ? "linear-gradient(135deg, #7c3aed, #3b82f6)" : "#0f0f13",
                        color: plan.highlight ? "#fff" : "#94a3b8",
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        boxShadow: plan.highlight ? "0 4px 14px rgba(124,58,237,0.4)" : "none",
                        transition: "opacity 0.15s",
                        opacity: loadingPlan === plan.id ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => { if (!plan.highlight) e.currentTarget.style.borderColor = "#4a4a6a"; }}
                      onMouseLeave={(e) => { if (!plan.highlight) e.currentTarget.style.borderColor = "#2a2a3a"; }}
                    >
                      {loadingPlan === plan.id
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <>Passer au {plan.name} <ArrowRight size={14} strokeWidth={1.5} /></>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Historique paiements ── */}
      <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 16, padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Receipt size={16} style={{ color: "#4a4a6a" }} strokeWidth={1.5} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Historique des paiements</h3>
        </div>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 1fr 1fr 0.8fr", gap: 12, padding: "0 16px 12px", borderBottom: "1px solid #2a2a3a" }}>
          {["Date", "Description", "Montant", "Statut", "Facture"].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "#3a3a5a", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>
        {/* Empty state */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#0f0f13", border: "1px solid #2a2a3a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Receipt size={22} style={{ color: "#3a3a5a" }} strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 14, color: "#4a4a6a" }}>Aucun paiement pour le moment</p>
          <p style={{ fontSize: 12, color: "#3a3a5a", marginTop: 4 }}>Vos factures apparaîtront ici après votre premier paiement</p>
        </div>
      </div>

      {/* ── Sécurité paiement ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 20, padding: "12px 20px", borderRadius: 12, background: "#1a1a24", border: "1px solid #2a2a3a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: "#fff" }}>LS</span>
          </div>
          <span style={{ fontSize: 12, color: "#4a4a6a", fontWeight: 600 }}>Lemon Squeezy</span>
        </div>
        <div style={{ width: 1, height: 16, background: "#2a2a3a" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 12, color: "#4a4a6a" }}>Paiements sécurisés SSL</span>
        </div>
        <div style={{ width: 1, height: 16, background: "#2a2a3a" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ padding: "3px 8px", borderRadius: 4, background: "#1a1ae0", display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", fontStyle: "italic" }}>VISA</span>
          </div>
          <div style={{ padding: "3px 8px", borderRadius: 4, background: "#0f0f13", border: "1px solid #2a2a3a", display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316", display: "inline-block", marginLeft: -4 }} />
          </div>
        </div>
        <div style={{ width: 1, height: 16, background: "#2a2a3a" }} />
        <span style={{ fontSize: 11, color: "#3a3a5a" }}>Annulation possible à tout moment</span>
      </div>

    </div>
  );
}
