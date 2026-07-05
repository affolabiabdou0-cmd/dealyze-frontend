"use client";

import { useEffect, useState } from "react";
import { Sparkles, Calendar, Bell, Plus } from "lucide-react";
import { countUnread } from "../lib/activity";

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
  accentColor?: string;
  icon?: React.ReactNode;
  showNewAction?: boolean;
}

const PLAN_LABELS: Record<string, string> = {
  free_trial: "Free Trial",
  starter: "Starter",
  growth: "Growth",
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
  accentColor = "#7c3aed",
  icon,
  showNewAction = false,
}: PageHeaderProps) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setUnread(countUnread());
  }, []);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const todayCapital = today.charAt(0).toUpperCase() + today.slice(1);
  const planLabel = PLAN_LABELS[plan] ?? plan;

  function handleBell() {
    window.dispatchEvent(new CustomEvent("vyxen:open-notif"));
    setUnread(0);
  }

  function handleNewAction() {
    window.dispatchEvent(new CustomEvent("vyxen:new-action"));
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #1e0547 0%, #3b0d8c 35%, #5b1fc8 68%, #7c3aed 100%)",
      borderRadius: 20,
      boxShadow: "0 20px 56px rgba(91,31,200,0.32), 0 6px 18px rgba(91,31,200,0.18), 0 1px 4px rgba(0,0,0,0.12)",
      marginBottom: 24,
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Decorative blur orbs */}
      <div style={{
        position: "absolute", top: -50, right: -30,
        width: 220, height: 220, borderRadius: "50%",
        background: "rgba(139,92,246,0.35)",
        filter: "blur(70px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, left: 80,
        width: 180, height: 180, borderRadius: "50%",
        background: "rgba(196,165,253,0.18)",
        filter: "blur(55px)", pointerEvents: "none",
      }} />

      {/* ── Ligne 1 : titre + actions ── */}
      <div style={{
        padding: "24px 28px 18px",
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", gap: 16,
        position: "relative", zIndex: 1,
        flexWrap: "wrap",
      }}>

        {/* Gauche : icône + titre + sous-titre */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flex: 1, minWidth: 0 }}>
          {icon && (
            <div style={{
              width: 50, height: 50, borderRadius: 15,
              background: `${accentColor}30`,
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: 2,
              boxShadow: `0 4px 16px ${accentColor}40`,
            }}>
              {icon}
            </div>
          )}
          <div>
            <h1 style={{
              fontSize: 27,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.7px",
              lineHeight: 1.12,
              marginBottom: 6,
              textShadow: "0 2px 12px rgba(0,0,0,0.2)",
            }}>
              {title}
            </h1>
            <p style={{
              fontSize: 13.5,
              color: "rgba(255,255,255,0.68)",
              lineHeight: 1.55,
              fontWeight: 400,
              maxWidth: 520,
            }}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* Droite : cloche + bouton */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, paddingTop: 2 }}>

          {/* Cloche */}
          <button
            onClick={handleBell}
            style={{
              position: "relative",
              width: 42, height: 42, borderRadius: 12,
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.20)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.20)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }}
          >
            <Bell size={17} style={{ color: "#fff" }} strokeWidth={1.75} />
            {unread > 0 && (
              <span style={{
                position: "absolute", top: -5, right: -5,
                minWidth: 18, height: 18, borderRadius: 9, paddingInline: 4,
                background: "#ef4444", color: "#fff",
                fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2.5px solid #3b0d8c",
              }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* Bouton d'action principal */}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "#ffffff",
                color: "#5b1fc8",
                border: "none", borderRadius: 12,
                padding: "10px 20px", fontSize: 13.5, fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.12)",
                transition: "all 0.15s",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 26px rgba(0,0,0,0.26), 0 2px 6px rgba(0,0,0,0.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.12)";
              }}
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}

          {/* Nouvelle action (dashboard global) */}
          {showNewAction && !primaryAction && (
            <button
              onClick={handleNewAction}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "#ffffff",
                color: "#5b1fc8",
                border: "none", borderRadius: 12,
                padding: "10px 20px", fontSize: 13.5, fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.12)",
                transition: "all 0.15s",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 26px rgba(0,0,0,0.26), 0 2px 6px rgba(0,0,0,0.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.12)";
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Nouvelle action
            </button>
          )}
        </div>
      </div>

      {/* ── Séparateur ── */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginInline: 28, position: "relative", zIndex: 1 }} />

      {/* ── Ligne 2 : date/salut + badges ── */}
      <div style={{
        padding: "11px 28px 16px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        position: "relative", zIndex: 1,
      }}>

        {/* Gauche : date + salutation */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={12} style={{ color: "rgba(255,255,255,0.5)" }} strokeWidth={1.75} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>{todayCapital}</span>
          </div>
          {greetingName && (
            <>
              <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.18)" }} />
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.4 }}>
                Bonjour,{" "}
                <span style={{ fontWeight: 700, color: "#ffffff" }}>{greetingName}</span>
                {" "}
                <span style={{ color: "rgba(255,255,255,0.48)", fontWeight: 400 }}>— {agentStatus}</span>
              </span>
            </>
          )}
        </div>

        {/* Droite : badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 13px", borderRadius: 10,
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399" }} />
            <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>Plan</span>
            <span style={{ fontSize: 11.5, color: "#ffffff", fontWeight: 700 }}>{planLabel}</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 11px", borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}>
            <Sparkles size={10} style={{ color: "rgba(255,255,255,0.6)" }} strokeWidth={1.5} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.62)", fontWeight: 400 }}>{aiModel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
