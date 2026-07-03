"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Mail, BarChart2, Shield, ArrowRight, Zap, TrendingUp, Activity, Target } from "lucide-react";
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
    deal_draft:  AgentQuota;
    smart_chase: AgentQuota;
    pitch_radar: AgentQuota;
    deep_due:    AgentQuota;
  };
}

const AGENTS = [
  {
    href: "/dashboard/deal-draft",  key: "deal_draft",
    icon: FileText, emoji: "⚡",
    name: "Deal Draft",   desc: "Générez des propositions commerciales percutantes en 10 secondes.",
    color: "#7c3aed", glow: "rgba(124,58,237,0.25)", border: "#7c3aed33",
  },
  {
    href: "/dashboard/smart-chase", key: "smart_chase",
    icon: Mail, emoji: "💬",
    name: "Smart Chase",  desc: "Rédigez des relances intelligentes pour vos factures impayées.",
    color: "#f97316", glow: "rgba(249,115,22,0.25)", border: "#f9731633",
  },
  {
    href: "/dashboard/pitch-radar", key: "pitch_radar",
    icon: BarChart2, emoji: "🎯",
    name: "Pitch Radar",  desc: "Analysez et scorez n'importe quel pitch deck investisseur.",
    color: "#06b6d4", glow: "rgba(6,182,212,0.25)", border: "#06b6d433",
  },
  {
    href: "/dashboard/deep-due",    key: "deep_due",
    icon: Shield, emoji: "🔍",
    name: "Deep Due",     desc: "Due diligence automatisée sur toute entreprise en 1 clic.",
    color: "#10b981", glow: "rgba(16,185,129,0.25)", border: "#10b98133",
  },
];

const STATS = [
  { icon: FileText,   label: "Devis générés",      key: "deal_draft",  color: "#7c3aed" },
  { icon: Mail,       label: "Relances envoyées",   key: "smart_chase", color: "#f97316" },
  { icon: Target,     label: "Pitchs analysés",     key: "pitch_radar", color: "#06b6d4" },
  { icon: Activity,   label: "Rapports due dil.",   key: "deep_due",    color: "#10b981" },
];

function UsageBar({ quota, color }: { quota: AgentQuota | undefined; color: string }) {
  if (!quota) return <div style={{ height: 3, borderRadius: 4, background: "#2a2a3a" }} />;
  const unlimited = quota.limite === "illimité";
  const pct = unlimited ? 15 : Math.min(100, (quota.utilisé / (quota.limite as number)) * 100);
  const danger = !unlimited && pct > 80;
  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#4a4a6a" }}>Utilisations ce mois</span>
        <span style={{ fontSize: 11, fontFamily: "monospace", color: danger ? "#ef4444" : "#7a7a9a" }}>
          {quota.utilisé} / {unlimited ? "∞" : quota.limite}
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 4, background: "#2a2a3a", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: danger ? "#ef4444" : color, transition: "width 1s" }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = getUser();
  const [quota, setQuota]           = useState<QuotaResponse | null>(null);
  const [loadingQuota, setLoading]  = useState(true);

  useEffect(() => {
    api.get<QuotaResponse>("/auth/quota")
      .then((r) => setQuota(r.data))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const today    = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const firstName = user?.full_name?.split(" ")[0] ?? "—";

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 4 }}>
            {greeting}, {firstName} 👋
          </h2>
          <p style={{ fontSize: 14, color: "#4a4a6a", textTransform: "capitalize" }}>{today}</p>
        </div>
        <div style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 10, background: "#1a1a24", border: "1px solid #2a2a3a", fontSize: 13, color: "#7a7a9a" }}>
          Plan · <span style={{ color: "#a78bfa", fontWeight: 600 }}>{quota?.plan ?? user?.plan ?? "—"}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ icon: Icon, label, key, color }) => {
          const val = quota?.quotas?.[key as keyof QuotaResponse["quotas"]]?.utilisé ?? 0;
          return (
            <div key={key} style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 14, padding: "18px 20px" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <span style={{ fontSize: 12, color: "#4a4a6a" }}>{label}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>
                {loadingQuota ? <span style={{ fontSize: 20, color: "#2a2a3a" }}>—</span> : val}
              </div>
              <div style={{ fontSize: 11, color: "#3a3a5a", marginTop: 4 }}>ce mois</div>
            </div>
          );
        })}
      </div>

      {/* Agent cards */}
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#3a3a5a", textTransform: "uppercase", marginBottom: 16 }}>
          Vos agents IA
        </h3>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {AGENTS.map((a) => {
            const q = quota?.quotas?.[a.key as keyof QuotaResponse["quotas"]];
            const blocked = q ? q.limite === 0 : false;
            return (
              <Link key={a.key} href={blocked ? "/dashboard/billing" : a.href}
                className="block group"
                style={{ textDecoration: "none" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = `1px solid ${a.color}66`;
                  el.style.boxShadow = `0 0 24px ${a.glow}`;
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.border = `1px solid ${a.border}`;
                  el.style.boxShadow = "none";
                  el.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  background: "#1a1a24",
                  border: `1px solid ${a.border}`,
                  borderRadius: 16, padding: "22px 20px",
                  transition: "border 0.2s, box-shadow 0.2s, transform 0.2s",
                  height: "100%", display: "flex", flexDirection: "column",
                }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `${a.color}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22,
                    }}>
                      {a.emoji}
                    </div>
                    <ArrowRight size={16} style={{ color: "#3a3a5a", transition: "color 0.2s" }} className="group-hover:text-white" />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "#4a4a6a", lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{a.desc}</div>
                  {loadingQuota ? (
                    <div style={{ height: 3, borderRadius: 4, background: "#2a2a3a" }} className="animate-pulse" />
                  ) : blocked ? (
                    <span style={{ fontSize: 11, color: "#ef4444", padding: "4px 10px", borderRadius: 6, background: "#ef444415", display: "inline-block" }}>
                      Quota épuisé · Upgrader
                    </span>
                  ) : (
                    <UsageBar quota={q} color={a.color} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#3a3a5a", textTransform: "uppercase", marginBottom: 16 }}>
          Démarrage rapide
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {AGENTS.map((a) => (
            <Link key={a.href} href={a.href}
              className="flex items-center gap-4 group"
              style={{
                background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 12,
                padding: "16px 18px", textDecoration: "none", transition: "border 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.border = `1px solid ${a.color}44`; el.style.background = "#1e1e2a"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.border = "1px solid #2a2a3a"; el.style.background = "#1a1a24"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                {a.emoji}
              </div>
              <div className="min-w-0">
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{a.name}</div>
                <div style={{ fontSize: 12, color: "#4a4a6a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.desc}</div>
              </div>
              <ArrowRight size={15} style={{ color: "#3a3a5a", marginLeft: "auto", flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Gemini badge */}
      <div className="flex items-center justify-center gap-2" style={{ paddingTop: 8 }}>
        <Zap size={13} style={{ color: "#3a3a5a" }} />
        <span style={{ fontSize: 12, color: "#2a2a4a" }}>Propulsé par Gemini 2.5 Flash · XPRIZE AI Hackathon 2026</span>
        <TrendingUp size={13} style={{ color: "#3a3a5a" }} />
      </div>
    </div>
  );
}
