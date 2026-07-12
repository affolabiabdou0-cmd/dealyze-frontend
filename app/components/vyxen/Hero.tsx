"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import AICore from "./AICore";
import { AGENTS } from "./agents";
import { AnimatedCounter } from "./AnimatedCounter";
import { useAgentSelection } from "./AgentSelectionContext";

const VIGNETTES = [
  "Deal Draft génère un devis 28 000 € · TechVision SAS",
  "Smart Chase récupère un impayé de 12 400 €",
  "Pitch Radar note une startup 7.4/10",
  "Deep Due cartographie 340 entreprises liées",
];

const STATS = [
  { value: 2, suffix: " min", label: "Devis généré" },
  { value: 30, suffix: " sec", label: "Pitch scoré" },
  { value: 10, suffix: " min", label: "Due diligence" },
  { value: 4, suffix: "", label: "Agents IA actifs" },
];

export default function Hero({ onOpenDemo }: { onOpenDemo: () => void }) {
  const [vignetteIdx, setVignetteIdx] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const { select } = useAgentSelection();

  useEffect(() => {
    const t = setInterval(() => setVignetteIdx((i) => (i + 1) % VIGNETTES.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "rgba(5,5,7,0.72)", position: "relative", overflow: "hidden",
    }}>
      {/* AI Core — centered background layer */}
      <div style={{
        position: "absolute", top: "48%", left: "50%", transform: "translate(-50%,-50%)",
        width: "min(760px, 90vw)", height: "min(760px, 90vw)", pointerEvents: "none", opacity: 0.9,
      }}>
        <AICore />
      </div>

      {/* Ambient glows */}
      <div style={{ position: "absolute", bottom: 0, right: "8%", width: 600, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(34,211,238,0.06) 0%, transparent 68%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

      <div className="px-4 md:px-8" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", paddingTop: 110, paddingBottom: 40, position: "relative", zIndex: 1 }}>

        <div className="glass-1" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 20, padding: "5px 16px", marginBottom: 28 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-violet-2)", display: "inline-block", flexShrink: 0, animation: "vx-pulse 2s ease-in-out infinite" }} />
          <span style={{ fontSize: 11, color: "var(--color-text-3)", letterSpacing: "1.1px", fontWeight: 500, textTransform: "uppercase" }}>XPRIZE AI Hackathon 2026 · Gemini 2.5 Flash</span>
        </div>

        <h1 style={{ fontSize: "clamp(34px, 5.8vw, 64px)", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-1.8px", color: "var(--color-text-1)", marginBottom: 16, maxWidth: 820 }}>
          Votre équipe IA<br />
          <span style={{ background: "linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            ne dort jamais.
          </span>
        </h1>

        <p style={{ fontSize: 16, color: "var(--color-text-3)", maxWidth: 520, margin: "0 auto 30px", lineHeight: 1.9 }}>
          4 agents IA spécialisés travaillent déjà — devis, relances, pitch decks, due diligence.
        </p>

        {/* Vignette ticker */}
        <div className="glass-1 font-mono" style={{ borderRadius: 10, padding: "8px 18px", marginBottom: 30, minWidth: 300, maxWidth: "90vw" }}>
          <span key={vignetteIdx} style={{ fontSize: 12, color: "var(--color-cyan)", animation: "vx-fade-up 0.5s ease both" }}>
            ● {VIGNETTES[vignetteIdx]}
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          <Link href="/register" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #5b21b6, #6d28d9)",
            color: "#ede9fe", padding: "13px 30px", borderRadius: 12,
            fontSize: 14.5, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 32px rgba(91,33,182,0.48)",
          }}>
            Essai gratuit 14 jours <ArrowRight size={16} />
          </Link>
          <button onClick={onOpenDemo} className="glass-1" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: "var(--color-text-2)", padding: "13px 30px", borderRadius: 12,
            fontSize: 14.5, fontWeight: 500, cursor: "pointer",
          }}>
            <Play size={15} strokeWidth={2} /> Voir une démo
          </button>
        </div>

        {/* 4 agent capsules — interactive lab entry points */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 8 }}>
          {AGENTS.map((agent) => {
            const Icon = agent.icon;
            const isHovered = hovered === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => select(agent.id, true)}
                onMouseEnter={() => setHovered(agent.id)}
                onMouseLeave={() => setHovered(null)}
                className="glass-1"
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 30,
                  cursor: "pointer", transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                  transform: isHovered ? "translateY(-3px)" : "none",
                  borderColor: isHovered ? agent.color : undefined,
                  boxShadow: isHovered ? `0 8px 24px ${agent.color}33` : undefined,
                }}
              >
                <Icon size={14} style={{ color: agent.color }} strokeWidth={1.75} />
                <span style={{ fontSize: 12.5, color: "var(--color-text-2)", fontWeight: 500 }}>{agent.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ position: "relative", zIndex: 1, borderTop: "0.5px solid var(--color-hairline)", background: "rgba(255,255,255,0.02)" }}>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ maxWidth: 900, margin: "0 auto" }}>
          {STATS.map(({ value, suffix, label }, i) => (
            <div key={label} className="stat-item" style={{ padding: "24px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: "var(--color-violet-2)", letterSpacing: "-0.5px" }}>
                <AnimatedCounter value={value} suffix={suffix} />
              </div>
              <div style={{ fontSize: 10, color: "var(--color-text-3)", marginTop: 5, letterSpacing: "0.9px", textTransform: "uppercase", fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
