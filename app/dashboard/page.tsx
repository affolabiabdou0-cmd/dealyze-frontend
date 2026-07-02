"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Mail, BarChart2, Shield, ArrowRight, TrendingUp } from "lucide-react";
import { api } from "../lib/api";
import { getUser } from "../lib/auth";

interface AgentQuota {
  utilisé: number;
  limite: number | "illimité";
  restant: number | "illimité";
}

interface QuotaResponse {
  plan: string;
  mois: string;
  quotas: {
    deal_draft: AgentQuota;
    smart_chase: AgentQuota;
    pitch_radar: AgentQuota;
    deep_due: AgentQuota;
  };
}

const AGENTS = [
  { href: "/dashboard/deal-draft",   icon: <FileText size={22} />,  name: "Deal Draft",   desc: "Générez un devis professionnel", key: "deal_draft",   color: "#2563EB", light: "#EFF6FF" },
  { href: "/dashboard/smart-chase",  icon: <Mail size={22} />,       name: "Smart Chase",  desc: "Relancez une facture impayée",   key: "smart_chase",  color: "#7C3AED", light: "#F5F3FF" },
  { href: "/dashboard/pitch-radar",  icon: <BarChart2 size={22} />,  name: "Pitch Radar",  desc: "Analysez un pitch startup",      key: "pitch_radar",  color: "#0891B2", light: "#E0F2FE" },
  { href: "/dashboard/deep-due",     icon: <Shield size={22} />,     name: "Deep Due",     desc: "Lancez une due diligence",       key: "deep_due",     color: "#059669", light: "#ECFDF5" },
];

function UsageBar({ quota, color }: { quota: AgentQuota | undefined; color: string }) {
  if (!quota) return <div className="h-1.5 rounded-full bg-gray-100" />;
  const isUnlimited = quota.limite === "illimité";
  const pct = isUnlimited ? 100 : Math.min(100, (quota.utilisé / (quota.limite as number)) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-400">Utilisations</span>
        <span className="text-xs font-mono font-medium" style={{ color: "#0F2552" }}>
          {quota.utilisé} / {isUnlimited ? "∞" : quota.limite}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${isUnlimited ? 20 : pct}%`, background: !isUnlimited && pct > 80 ? "#EF4444" : color }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = getUser();
  const [quota, setQuota] = useState<QuotaResponse | null>(null);
  const [loadingQuota, setLoadingQuota] = useState(true);

  useEffect(() => {
    api.get<QuotaResponse>("/auth/quota")
      .then((r) => setQuota(r.data))
      .catch(() => null)
      .finally(() => setLoadingQuota(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#0F2552" }}>
            {greeting}, {user?.full_name?.split(" ")[0] ?? "—"} 👋
          </h2>
          <p className="text-sm text-gray-400 mt-1">Voici votre tableau de bord Dealyze</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 bg-white text-xs text-gray-500">
          <TrendingUp size={14} style={{ color: "#2563EB" }} />
          Plan : <span className="font-semibold ml-1 capitalize" style={{ color: "#0F2552" }}>{quota?.plan ?? user?.plan ?? "—"}</span>
          {quota?.mois && <span className="text-gray-300 mx-1">·</span>}
          {quota?.mois && <span className="text-gray-400">{quota.mois}</span>}
        </div>
      </div>

      {/* Agent cards */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Vos agents</h3>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {AGENTS.map((agent) => {
            const q = quota?.quotas?.[agent.key as keyof QuotaResponse["quotas"]];
            const blocked = q ? q.limite === 0 : false;
            return (
              <Link
                key={agent.key}
                href={blocked ? "/dashboard/billing" : agent.href}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 group block"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: agent.light, color: agent.color }}>
                    {agent.icon}
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <h4 className="font-semibold text-sm mb-1" style={{ color: "#0F2552" }}>{agent.name}</h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">{agent.desc}</p>
                {loadingQuota ? (
                  <div className="h-4 rounded bg-gray-100 animate-pulse" />
                ) : blocked ? (
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                    Non disponible · Passer au plan supérieur
                  </span>
                ) : (
                  <UsageBar quota={q} color={agent.color} />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Démarrage rapide</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {AGENTS.map((agent) => (
            <Link
              key={agent.href}
              href={agent.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${agent.color}15`, color: agent.color }}>
                {agent.icon}
              </div>
              <span className="text-sm font-medium" style={{ color: "#0F2552" }}>{agent.desc}</span>
              <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
