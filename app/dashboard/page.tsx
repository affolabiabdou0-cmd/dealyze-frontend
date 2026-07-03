"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Mail, BarChart3, Shield, ArrowRight,
  CheckCircle, TrendingUp, Sparkles, Clock,
} from "lucide-react";
import { api } from "../lib/api";
import { getUser } from "../lib/auth";

interface AgentQuota { utilisé: number; limite: number | "illimité"; restant: number | "illimité"; }
interface QuotaResponse {
  plan: string; mois: string;
  quotas: { deal_draft: AgentQuota; smart_chase: AgentQuota; pitch_radar: AgentQuota; deep_due: AgentQuota };
}

const STATS = [
  { key: "deal_draft",  label: "Devis générés",    desc: "ce mois",  icon: FileText,  color: "#7c3aed", iconBg: "#ede9fe", badge: "+3",  badgeBg: "#f0fdf4", badgeColor: "#16a34a" },
  { key: "smart_chase", label: "Relances envoyées", desc: "ce mois",  icon: Mail,      color: "#f97316", iconBg: "#fff7ed", badge: "+8",  badgeBg: "#f0fdf4", badgeColor: "#16a34a" },
  { key: "pitch_radar", label: "Pitchs analysés",   desc: "ce mois",  icon: BarChart3, color: "#06b6d4", iconBg: "#ecfeff", badge: "+5",  badgeBg: "#f0fdf4", badgeColor: "#16a34a" },
  { key: "deep_due",    label: "Rapports DD générés",desc: "ce mois", icon: Shield,    color: "#10b981", iconBg: "#f0fdf4", badge: "+2",  badgeBg: "#f0fdf4", badgeColor: "#16a34a" },
];

const ACTIVITY = [
  { icon: CheckCircle, color: "#10b981", bg: "#f0fdf4", title: "Facture #2291 marquée comme payée",     sub: "Client Atlas Logistique · 4 280 €",          time: "il y a 12 min" },
  { icon: Mail,        color: "#f97316", bg: "#fff7ed", title: "Relance niveau 2 envoyée",               sub: "Facture #2287 · Maison Verlaine · 2 150 €",   time: "il y a 1h"     },
  { icon: BarChart3,   color: "#06b6d4", bg: "#ecfeff", title: "Pitch deck analysé — score 7,8/10",     sub: "Nova Health · Seed",                           time: "il y a 2h"     },
  { icon: FileText,    color: "#7c3aed", bg: "#ede9fe", title: "Devis #DV-2026-118 généré et envoyé",   sub: "Solaris Énergie · 18 400 €",                   time: "il y a 4h"     },
  { icon: Shield,      color: "#10b981", bg: "#f0fdf4", title: "Rapport de due diligence finalisé",     sub: "Helix Robotics · Risque modéré",               time: "hier"          },
  { icon: Sparkles,    color: "#7c3aed", bg: "#ede9fe", title: "Nouveau modèle de relance proposé",     sub: "Réduction du délai moyen estimée à -3 jours",  time: "hier"          },
];

const QUICK = [
  { href: "/dashboard/smart-chase", icon: Mail,      color: "#f97316", bg: "#fff7ed", name: "Smart Chase", desc: "Relancez automatiquement vos impayés" },
  { href: "/dashboard/pitch-radar", icon: BarChart3, color: "#06b6d4", bg: "#ecfeff", name: "Pitch Radar", desc: "Notez un pitch deck en 30 secondes" },
  { href: "/dashboard/deep-due",    icon: Shield,    color: "#10b981", bg: "#f0fdf4", name: "Deep Due",    desc: "Lancez une due diligence complète" },
];

const CARD: React.CSSProperties = {
  background: "#ffffff", border: "1px solid #e2e8f0",
  borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
};

export default function DashboardPage() {
  const user = getUser();
  const [quota, setQuota]          = useState<QuotaResponse | null>(null);
  const [loadingQuota, setLoading] = useState(true);

  useEffect(() => {
    api.get<QuotaResponse>("/auth/quota")
      .then((r) => setQuota(r.data))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.full_name?.split(" ")[0] ?? "—";

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Welcome */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" }}>
            Bonjour, {firstName} 👋
          </h2>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
            Voici un aperçu de votre activité aujourd&apos;hui.
          </p>
        </div>
        <div style={{
          flexShrink: 0, padding: "6px 12px", borderRadius: 8,
          background: "#f8fafc", border: "1px solid #e2e8f0",
          fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
          Plan · <span style={{ color: "#7c3aed", fontWeight: 600 }}>{quota?.plan ?? user?.plan ?? "—"}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ key, label, desc, icon: Icon, color, iconBg, badge, badgeBg, badgeColor }) => {
          const val = quota?.quotas?.[key as keyof QuotaResponse["quotas"]]?.utilisé ?? 0;
          return (
            <div key={key} style={{ ...CARD, padding: "20px" }}>
              {/* Top row */}
              <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={17} style={{ color }} strokeWidth={1.75} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: badgeBg, color: badgeColor, letterSpacing: "0.02em" }}>
                  {badge}
                </span>
              </div>
              {/* Number */}
              <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", lineHeight: 1, letterSpacing: "-1px" }}>
                {loadingQuota ? <span style={{ fontSize: 24, color: "#e2e8f0" }}>—</span> : val}
              </div>
              {/* Label */}
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{label}</div>
              {/* Tag */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color, background: iconBg, padding: "3px 8px", borderRadius: 6 }}>
                  {key.replace("_", " ").toUpperCase().replace("DEAL DRAFT", "DEAL DRAFT").replace("SMART CHASE", "SMART CHASE")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div className="grid xl:grid-cols-3 gap-6">

        {/* Activity feed (2/3) */}
        <div className="xl:col-span-2" style={{ ...CARD, padding: 0, overflow: "hidden" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <div className="flex items-center gap-2">
              <Clock size={15} style={{ color: "#94a3b8" }} strokeWidth={1.75} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Activité récente</span>
            </div>
            <Link href="/dashboard" style={{ fontSize: 12, color: "#7c3aed", fontWeight: 600, textDecoration: "none" }}>
              Tout voir →
            </Link>
          </div>
          <div>
            {ACTIVITY.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-4 px-6 py-4"
                  style={{ borderBottom: i < ACTIVITY.length - 1 ? "1px solid #f8fafc" : "none" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: item.bg, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={15} style={{ color: item.color }} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{item.sub}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#cbd5e1", flexShrink: 0, whiteSpace: "nowrap" }}>{item.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick access (1/3) */}
        <div className="flex flex-col gap-4">
          <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} style={{ color: "#94a3b8" }} strokeWidth={1.75} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Accès rapide</span>
              </div>
            </div>
            {QUICK.map((q, i) => {
              const Icon = q.icon;
              return (
                <Link key={q.href} href={q.href} style={{ textDecoration: "none" }}>
                  <div
                    className="flex items-center gap-3 px-5 py-4 transition-all"
                    style={{ borderBottom: i < QUICK.length - 1 ? "1px solid #f8fafc" : "none", cursor: "pointer" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: q.bg, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={16} style={{ color: q.color }} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{q.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{q.desc}</div>
                    </div>
                    <ArrowRight size={14} style={{ color: "#cbd5e1", flexShrink: 0 }} strokeWidth={1.75} />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Deal Draft CTA */}
          <Link href="/dashboard/deal-draft" style={{ textDecoration: "none" }}>
            <div style={{
              ...CARD, padding: "20px",
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              border: "none", cursor: "pointer",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0.9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <FileText size={18} style={{ color: "#fff" }} strokeWidth={1.75} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Deal Draft</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 14, lineHeight: 1.5 }}>
                Générez une proposition commerciale professionnelle en 10 secondes.
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", background: "rgba(255,255,255,0.15)",
                borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.2)",
              }}>
                Lancer maintenant <ArrowRight size={12} strokeWidth={2.5} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
