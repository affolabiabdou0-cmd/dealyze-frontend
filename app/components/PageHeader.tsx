"use client";

import { Sparkles, Calendar, Bell } from "lucide-react";

interface PrimaryAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  greetingName?: string;
  agentStatus?: string;
  primaryAction?: PrimaryAction;
  plan?: string;
  aiModel?: string;
  notificationCount?: number;
  accentColor?: string;
  icon?: React.ReactNode;
}

const PLAN_LABELS: Record<string, string> = {
  free_trial: "Free Trial",
  starter:    "Starter",
  growth:     "Growth",
  enterprise: "Enterprise",
};

export default function PageHeader({
  title,
  subtitle,
  greetingName,
  agentStatus = "vos 4 agents sont opérationnels",
  primaryAction,
  plan = "free_trial",
  aiModel = "Gemini 2.5 Flash",
  notificationCount = 0,
  accentColor = "#7c3aed",
  icon,
}: PageHeaderProps) {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const todayCapital = today.charAt(0).toUpperCase() + today.slice(1);
  const planLabel = PLAN_LABELS[plan] ?? plan;

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e9eef5",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      marginBottom: 16,
    }}>
      {/* ── Ligne du haut : titre + action ── */}
      <div style={{ padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>

        {/* Gauche : icône + titre + sous-titre */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {icon && (
            <div style={{
              width: 46, height: 46, borderRadius: 12,
              background: `${accentColor}14`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: `0 2px 10px ${accentColor}20`,
            }}>
              {icon}
            </div>
          )}
          {!icon && (
            <div style={{ width: 3, height: 38, borderRadius: 2, background: accentColor, flexShrink: 0 }} />
          )}
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.4px", lineHeight: 1.2, marginBottom: 2 }}>
              {title}
            </h2>
            <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.4 }}>{subtitle}</p>
          </div>
        </div>

        {/* Droite : notifications + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Badge notification */}
          <div style={{ position: "relative" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "#f8fafc", border: "1px solid #e9eef5",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <Bell size={15} style={{ color: "#64748b" }} strokeWidth={1.75} />
            </div>
            {notificationCount > 0 && (
              <div style={{
                position: "absolute", top: -4, right: -4,
                width: 16, height: 16, borderRadius: "50%",
                background: accentColor, color: "#fff",
                fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid #fff",
              }}>
                {notificationCount > 9 ? "9+" : notificationCount}
              </div>
            )}
          </div>

          {/* Bouton d'action principal */}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: `linear-gradient(135deg, ${accentColor}, #6d28d9)`,
                color: "#fff", border: "none", borderRadius: 10,
                padding: "9px 18px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", boxShadow: `0 4px 14px ${accentColor}35`,
                transition: "box-shadow 0.15s",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 6px 20px ${accentColor}50`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 14px ${accentColor}35`; }}
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>

      {/* ── Séparateur ── */}
      <div style={{ height: 1, background: "#f1f5f9" }} />

      {/* ── Ligne du bas : date + salut | badges ── */}
      <div style={{
        padding: "10px 22px",
        background: "linear-gradient(135deg, #fafbff 0%, #f5f3ff 100%)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 8,
      }}>
        {/* Gauche : date + salutation */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Calendar size={11} style={{ color: "#94a3b8" }} strokeWidth={1.75} />
            <span style={{ fontSize: 11, color: "#94a3b8" }}>{todayCapital}</span>
          </div>
          {greetingName && (
            <>
              <div style={{ width: 1, height: 12, background: "#e2e8f0" }} />
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Bonjour, <span style={{ fontWeight: 700, color: accentColor }}>{greetingName}</span>
                {" "}<span style={{ color: "#94a3b8", fontWeight: 400 }}>— {agentStatus}</span>
              </span>
            </>
          )}
        </div>

        {/* Droite : badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 8,
            background: `${accentColor}0f`, border: `1px solid ${accentColor}25`,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>Plan</span>
            <span style={{ fontSize: 11, color: accentColor, fontWeight: 700 }}>{planLabel}</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 8,
            background: "#f8fafc", border: "1px solid #e9eef5",
          }}>
            <Sparkles size={9} style={{ color: "#94a3b8" }} strokeWidth={1.5} />
            <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{aiModel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
