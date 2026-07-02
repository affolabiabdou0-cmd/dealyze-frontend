"use client";

import { useState } from "react";
import { CreditCard, Check, ArrowRight, Zap, Star } from "lucide-react";
import { getUser } from "../../lib/auth";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 47,
    desc: "Pour démarrer sur vos premiers deals",
    features: [
      "17 Deal Draft / mois",
      "17 Smart Chase / mois",
      "5 Pitch Radar / mois",
      "Due Diligence non inclus",
      "Support email",
    ],
    highlight: false,
    color: "#2563EB",
  },
  {
    id: "growth",
    name: "Growth",
    price: 147,
    desc: "Pour les équipes actives",
    features: [
      "Deal Draft illimité",
      "Smart Chase illimité",
      "Pitch Radar illimité",
      "5 Deep Due / mois",
      "Support prioritaire",
    ],
    highlight: true,
    color: "#7C3AED",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 477,
    desc: "Pour les fonds et équipes en volume",
    features: [
      "Tout illimité",
      "Deep Due illimité",
      "API access",
      "Onboarding dédié",
      "SLA 99.9%",
    ],
    highlight: false,
    color: "#059669",
  },
];

export default function BillingPage() {
  const user = getUser();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const currentPlan = user?.plan ?? "free_trial";

  const planLabel: Record<string, string> = {
    free_trial: "Essai gratuit",
    starter: "Starter",
    growth: "Growth",
    enterprise: "Enterprise",
  };

  async function handleUpgrade(planId: string) {
    setLoadingPlan(planId);
    try {
      const { api } = await import("../../lib/api");
      const res = await api.post<{ checkout_url: string }>("/billing/checkout", { plan: planId });
      window.location.href = res.data.checkout_url;
    } catch {
      alert("Erreur lors de la création du paiement. Contactez le support.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Current plan */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF", color: "#2563EB" }}>
            <CreditCard size={18} />
          </div>
          <h3 className="font-semibold" style={{ color: "#0F2552" }}>Plan actuel</h3>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#F4F6F9" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#0F2552" }}>
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold" style={{ color: "#0F2552" }}>{planLabel[currentPlan] ?? currentPlan}</div>
              <div className="text-xs text-gray-400">
                {currentPlan === "free_trial" ? "5 utilisations gratuites incluses" : "Plan mensuel actif"}
              </div>
            </div>
          </div>
          {currentPlan === "free_trial" && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#FEF9C3", color: "#A16207" }}>
              Essai en cours
            </span>
          )}
        </div>
      </div>

      {/* Upgrade plans */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Passer à un plan supérieur</h3>
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className="rounded-2xl border flex flex-col transition-all duration-200"
                style={{
                  background: plan.highlight ? "#0F2552" : "#FAFAFA",
                  borderColor: plan.highlight ? "#2563EB" : "#E2E8F0",
                  boxShadow: plan.highlight ? "0 0 30px rgba(37,99,235,0.15)" : undefined,
                }}
              >
                <div className="p-6 flex-1">
                  {plan.highlight && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-3" style={{ background: "#2563EB", color: "#fff" }}>
                      <Star size={9} /> Recommandé
                    </div>
                  )}
                  <h4 className="font-bold mb-0.5" style={{ color: plan.highlight ? "#fff" : "#0F2552" }}>{plan.name}</h4>
                  <p className="text-xs mb-4" style={{ color: plan.highlight ? "rgba(255,255,255,0.5)" : "#94A3B8" }}>{plan.desc}</p>
                  <div className="flex items-end gap-1 mb-5">
                    <span className="text-4xl font-bold font-mono" style={{ color: plan.highlight ? "#fff" : "#0F2552" }}>${plan.price}</span>
                    <span className="text-xs mb-1.5" style={{ color: plan.highlight ? "rgba(255,255,255,0.4)" : "#94A3B8" }}>/mois</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <Check size={12} className="flex-shrink-0 mt-0.5" style={{ color: plan.highlight ? "#60A5FA" : plan.color }} />
                        <span style={{ color: plan.highlight ? "rgba(255,255,255,0.75)" : "#374151" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 pb-6">
                  {isCurrent ? (
                    <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold" style={{ background: "rgba(255,255,255,0.1)", color: plan.highlight ? "rgba(255,255,255,0.4)" : "#94A3B8" }}>
                      Plan actuel
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loadingPlan === plan.id}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                      style={{ background: plan.highlight ? "#2563EB" : "#0F2552" }}
                    >
                      {loadingPlan === plan.id ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Passer au {plan.name} <ArrowRight size={14} /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl p-4 border text-sm text-gray-500" style={{ background: "#FFFBEB", borderColor: "#FEF3C7" }}>
        <strong style={{ color: "#92400E" }}>Paiement sécurisé via Lemon Squeezy.</strong> Vous serez redirigé vers la page de paiement. Annulation possible à tout moment depuis votre espace client Lemon Squeezy.
      </div>
    </div>
  );
}
