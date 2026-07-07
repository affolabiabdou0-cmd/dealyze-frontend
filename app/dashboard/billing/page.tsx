"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Check, ArrowRight, Zap, Star, FileText, Mail, BarChart3, Shield, Clock, Receipt, CheckCircle, XCircle } from "lucide-react";
import { getUser } from "../../lib/auth";
import { api } from "../../lib/api";
import PageHeader from "../../components/PageHeader";

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

interface AgentQuota { utilisé: number; limite: number | "illimité"; }
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
  padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string; eventCallback?: (e: unknown) => void }) => void;
      Checkout: { open: (opts: unknown) => void };
    };
  }
}

export default function BillingPage() {
  const user        = getUser();
  const router      = useRouter();
  const currentPlan = user?.plan ?? "free_trial";
  const [quota, setQuota]             = useState<QuotaResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [toast, setToast]             = useState<{ type: "success" | "error"; msg: string } | null>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  }

  // Charge Paddle.js une seule fois
  useEffect(() => {
    if (document.getElementById("paddle-js")) return;
    const script = document.createElement("script");
    script.id  = "paddle-js";
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      const token = process.env.NEXT_PUBLIC_PADDLE_TOKEN;
      if (token && window.Paddle) {
        window.Paddle.Initialize({
          token,
          eventCallback: (e: unknown) => {
            const ev = e as { name?: string };
            if (ev?.name === "checkout.completed") {
              showToast("success", "Paiement réussi ! Votre plan est en cours d'activation.");
              setTimeout(() => router.replace("/dashboard/billing"), 3000);
            }
          },
        });
      }
    };
    document.head.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api.get<QuotaResponse>("/auth/quota").then((r) => setQuota(r.data)).catch(() => null);
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "simulated" || params.get("payment") === "success") {
      showToast("success", `Plan ${params.get("plan") ?? ""} activé avec succès !`);
      router.replace("/dashboard/billing");
    }
  }, [router]);

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
      const res = await api.post<{
        mode: string; checkout_url?: string; price_id?: string; user_id?: string; user_email?: string;
      }>("/billing/checkout", { plan: planId });

      // Simulation
      if (res.data.mode === "simulation" && res.data.checkout_url) {
        router.push(res.data.checkout_url);
        return;
      }

      // Production — ouvre Paddle overlay
      if (res.data.price_id && window.Paddle) {
        window.Paddle.Checkout.open({
          items: [{ priceId: res.data.price_id, quantity: 1 }],
          customer: { email: res.data.user_email ?? user?.email ?? "" },
          customData: { user_id: res.data.user_id ?? user?.id ?? "" },
          settings: {
            successUrl: `${window.location.origin}/dashboard?payment=success&plan=${planId}`,
            displayMode: "overlay",
            locale: "fr",
          },
        });
      } else {
        showToast("error", "Paddle non initialisé. Rechargez la page.");
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showToast("error", detail ?? "Erreur de paiement. Contactez le support.");
    } finally { setLoadingPlan(null); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 14 }}>

      <PageHeader
        title="Facturation"
        subtitle="Gérez votre abonnement et suivez l'utilisation de vos agents IA"
        accentColor="#7c3aed"
        icon={<CreditCard size={22} style={{ color: "#7c3aed" }} strokeWidth={1.75} />}
        plan={currentPlan}
      />

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 20px", borderRadius: 12,
          background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${toast.type === "success" ? "#86efac" : "#fecaca"}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          maxWidth: 380, animation: "slideIn 0.25s ease",
        }}>
          <style>{`@keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:none;opacity:1}}`}</style>
          {toast.type === "success"
            ? <CheckCircle size={18} style={{ color: "#16a34a", flexShrink: 0 }} />
            : <XCircle size={18} style={{ color: "#dc2626", flexShrink: 0 }} />}
          <span style={{ fontSize: 13.5, fontWeight: 500, color: toast.type === "success" ? "#15803d" : "#b91c1c" }}>
            {toast.msg}
          </span>
        </div>
      )}

      {/* ── Plan actuel ── */}
      <div style={CARD}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <CreditCard size={15} style={{ color: planColor }} strokeWidth={1.5} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Plan actuel</h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `${planColor}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={17} style={{ color: planColor }} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{PLAN_LABEL[currentPlan]}</span>
                {currentPlan === "free_trial" && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "#fffbeb", color: "#f59e0b", border: "1px solid #fde68a" }}>
                    <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#f59e0b" }} />
                    Essai en cours
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                {currentPlan === "free_trial" ? "5 utilisations gratuites par agent incluses" : "Abonnement mensuel actif"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, padding: "6px 12px" }}>
            <Clock size={12} style={{ color: dayColor }} strokeWidth={1.5} />
            <span style={{ fontSize: 12, fontWeight: 600, color: dayColor }}>{planDays.remaining} jours restants</span>
          </div>
        </div>

        {/* Days bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 10.5, color: "#94a3b8" }}>Durée de la période</span>
            <span style={{ fontSize: 10.5, fontFamily: "monospace", color: "#64748b" }}>{planDays.remaining}/{planDays.total} j</span>
          </div>
          <div style={{ height: 5, borderRadius: 4, background: "#f1f5f9", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${dayPct}%`, borderRadius: 4, background: `linear-gradient(90deg, ${dayColor}, ${dayColor}99)`, transition: "width 1s" }} />
          </div>
        </div>

        {/* Usage per agent */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {AGENT_META.map(({ key, label, icon: Icon, color }) => {
            const q = quota?.quotas?.[key as keyof QuotaResponse["quotas"]];
            const unlimited = q?.limite === "illimité";
            const pct = !q ? 0 : unlimited ? 10 : Math.min(100, (q.utilisé / (q.limite as number)) * 100);
            return (
              <div key={key} style={{ background: "#f8fafc", borderRadius: 9, padding: "9px 12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon size={12} style={{ color }} strokeWidth={1.5} />
                    <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 500 }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 10.5, fontFamily: "monospace", color: "#94a3b8" }}>
                    {q ? `${q.utilisé} / ${unlimited ? "∞" : q.limite}` : "—"}
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

      {/* ── Plans ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <h3 style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>
          Passer à un plan supérieur
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, flex: 1, alignItems: "stretch" }}>
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div key={plan.id}
                style={{
                  background: "#ffffff", border: `1.5px solid ${plan.border}`, borderRadius: 14,
                  display: "flex", flexDirection: "column",
                  transform: plan.highlight ? "translateY(-3px)" : "none",
                  boxShadow: plan.highlight ? `0 6px 24px ${plan.glow}` : "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => { if (!plan.highlight) (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"; }}
                onMouseLeave={(e) => { if (!plan.highlight) (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
              >
                <div style={{ padding: "16px 18px 0", flex: 1 }}>
                  {plan.highlight && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, background: "#7c3aed", color: "#fff", fontSize: 10, fontWeight: 700, marginBottom: 10 }}>
                      <Star size={9} fill="#fff" /> Recommandé
                    </div>
                  )}
                  {plan.id === "enterprise" && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, background: "#fffbeb", color: "#f59e0b", border: "1px solid #fde68a", fontSize: 10, fontWeight: 700, marginBottom: 10 }}>
                      ✦ Enterprise
                    </div>
                  )}
                  <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{plan.name}</h4>
                  <p style={{ fontSize: 11.5, color: "#94a3b8", marginBottom: 10 }}>{plan.desc}</p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 3, marginBottom: 14 }}>
                    <span style={{ fontSize: 30, fontWeight: 800, fontFamily: "monospace", color: "#0f172a", lineHeight: 1 }}>{plan.currency}{plan.price}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>/mois</span>
                  </div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#64748b" }}>
                        <Check size={11}
                          style={{ color: plan.highlight ? "#7c3aed" : plan.id === "enterprise" ? "#f59e0b" : "#94a3b8", flexShrink: 0 }}
                          strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: "14px 18px 16px" }}>
                  {isCurrent ? (
                    <div style={{ padding: "10px", borderRadius: 9, textAlign: "center", fontSize: 12, fontWeight: 600, color: "#94a3b8", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      Plan actuel
                    </div>
                  ) : (
                    <button onClick={() => handleUpgrade(plan.id)} disabled={loadingPlan === plan.id}
                      style={{
                        width: "100%", padding: "11px", borderRadius: 9,
                        border: plan.highlight ? "none" : "1px solid #e2e8f0",
                        background: plan.highlight ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "#f8fafc",
                        color: plan.highlight ? "#fff" : "#0f172a",
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        boxShadow: plan.highlight ? "0 4px 14px rgba(124,58,237,0.35)" : "none",
                        transition: "opacity 0.15s, background 0.15s",
                        opacity: loadingPlan === plan.id ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => { if (!plan.highlight) e.currentTarget.style.background = "#f1f5f9"; }}
                      onMouseLeave={(e) => { if (!plan.highlight) e.currentTarget.style.background = "#f8fafc"; }}
                    >
                      {loadingPlan === plan.id
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <>Passer au {plan.name} <ArrowRight size={13} strokeWidth={1.5} /></>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Historique paiements ── */}
      <div style={CARD}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Receipt size={14} style={{ color: "#94a3b8" }} strokeWidth={1.5} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Historique des paiements</h3>
        </div>
        <div style={{ overflowX: "auto" }}><div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 1fr 1fr 0.8fr", gap: 10, padding: "0 12px 10px", borderBottom: "1px solid #f1f5f9", minWidth: 460 }}>
          {["Date", "Description", "Montant", "Statut", "Facture"].map((h) => (
            <span key={h} style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.07em", color: "#94a3b8", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 12px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Receipt size={15} style={{ color: "#cbd5e1" }} strokeWidth={1.5} />
          </div>
          <div>
            <p style={{ fontSize: 12.5, color: "#64748b", fontWeight: 500 }}>Aucun paiement pour le moment</p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Vos factures apparaîtront ici après votre premier paiement</p>
          </div>
        </div>
      </div>

      {/* ── Sécurité paiement ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 16, padding: "10px 20px", borderRadius: 11, background: "#fff", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: "#fff" }}>LS</span>
          </div>
          <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Lemon Squeezy</span>
        </div>
        <div style={{ width: 1, height: 14, background: "#e2e8f0" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13 }}>🔒</span>
          <span style={{ fontSize: 11.5, color: "#64748b" }}>Paiements sécurisés SSL</span>
        </div>
        <div style={{ width: 1, height: 14, background: "#e2e8f0" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ padding: "2px 7px", borderRadius: 4, background: "#1a1ae0" }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#fff", fontStyle: "italic" }}>VISA</span>
          </div>
          <div style={{ padding: "2px 7px", borderRadius: 4, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 0 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f97316", display: "inline-block", marginLeft: -3 }} />
          </div>
        </div>
        <div style={{ width: 1, height: 14, background: "#e2e8f0" }} />
        <span style={{ fontSize: 11, color: "#94a3b8" }}>Annulation possible à tout moment</span>
      </div>

    </div>
  );
}
