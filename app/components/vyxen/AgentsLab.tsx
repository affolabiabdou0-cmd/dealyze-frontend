"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { AGENTS, PIPELINE_STEPS, type AgentId } from "./agents";
import { useAgentSelection } from "./AgentSelectionContext";

type MissionState = "idle" | "running" | "done";

const RESULTS: Record<AgentId, { label: string; lines: string[] }> = {
  deal_draft: {
    label: "Devis DD-2026-0847 généré",
    lines: ["Client : TechVision SAS", "Montant : 28 000 € HT", "Livraison : 5 sept. 2026", "PDF prêt à envoyer"],
  },
  smart_chase: {
    label: "Relance FAC-2026-0312 envoyée",
    lines: ["Profil : bon payeur historique", "Ton : courtois, ferme sous 72h", "Email envoyé à k.diallo@techvision.fr"],
  },
  pitch_radar: {
    label: "Score TechVision AI : 7.4/10",
    lines: ["Marché adressable : 8.2", "Traction : 5.8", "Alerte : moat technique à définir"],
  },
  deep_due: {
    label: "Cartographie terminée",
    lines: ["340 entreprises liées analysées", "3 dirigeants communs détectés", "Risque global : modéré"],
  },
};

export default function AgentsLab() {
  const { selected, select } = useAgentSelection();
  const [state, setState] = useState<MissionState>("idle");
  const [step, setStep] = useState(0);
  const [chatterVisible, setChatterVisible] = useState<AgentId[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const agent = AGENTS.find((a) => a.id === selected)!;
  const others = AGENTS.filter((a) => a.id !== selected);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function runMission() {
    clearTimers();
    setState("running");
    setStep(0);
    setChatterVisible([]);

    PIPELINE_STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStep(i + 1), 420 * (i + 1)));
    });

    const doneAt = 420 * PIPELINE_STEPS.length + 300;
    timers.current.push(setTimeout(() => setState("done"), doneAt));

    others.forEach((o, i) => {
      timers.current.push(setTimeout(() => {
        setChatterVisible((prev) => [...prev, o.id]);
      }, doneAt + 500 + i * 550));
    });
  }

  useEffect(() => {
    setState("idle");
    setStep(0);
    setChatterVisible([]);
    clearTimers();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <section id="agents-lab" className="px-4 md:px-8" style={{ background: "rgba(11,11,19,0.72)", paddingTop: 90, paddingBottom: 90, borderTop: "0.5px solid var(--color-hairline)" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "2.5px", color: "var(--color-violet)", textTransform: "uppercase", fontWeight: 700, marginBottom: 14, background: "rgba(124,58,237,0.1)", padding: "4px 12px", borderRadius: 6 }}>
            Le laboratoire
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 600, color: "var(--color-text-1)", marginBottom: 12, letterSpacing: "-0.8px" }}>
            Essayez un agent avant de créer un compte.
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-3)", maxWidth: 480, margin: "0 auto", lineHeight: 1.75 }}>
            Choisissez un agent, lancez une mission, regardez-le travailler en temps réel.
          </p>
        </div>

        {/* Agent tabs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          {AGENTS.map((a) => {
            const Icon = a.icon;
            const active = a.id === selected;
            return (
              <button key={a.id} onClick={() => select(a.id)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10,
                background: active ? `${a.color}18` : "transparent",
                border: `1px solid ${active ? a.color : "var(--color-hairline)"}`,
                cursor: "pointer", transition: "all 0.2s",
              }}>
                <Icon size={14} style={{ color: active ? a.color : "var(--color-text-3)" }} strokeWidth={1.75} />
                <span style={{ fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? a.color : "var(--color-text-2)" }}>{a.name}</span>
              </button>
            );
          })}
        </div>

        {/* Lab panel */}
        <div className="glass-1" style={{ borderRadius: 20, padding: "32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: agent.color }} />

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 32 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: agent.color, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>{agent.lab}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-1)", marginBottom: 8 }}>{agent.name}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-3)", marginBottom: 4 }}>{agent.mission}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-3)", marginBottom: 24, fontStyle: "italic" }}>{agent.personality}</div>

              <button onClick={runMission} disabled={state === "running"} style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 10,
                background: `linear-gradient(135deg, ${agent.color}, ${agent.accent})`, color: "#fff",
                border: "none", fontSize: 13.5, fontWeight: 700, cursor: state === "running" ? "default" : "pointer",
                opacity: state === "running" ? 0.7 : 1,
              }}>
                <Sparkles size={14} /> {state === "idle" ? "Lancer une mission" : state === "running" ? "Mission en cours…" : "Relancer"}
              </button>

              {/* Collaboration chatter */}
              {chatterVisible.length > 0 && (
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                  {chatterVisible.map((id) => {
                    const o = AGENTS.find((a) => a.id === id)!;
                    return (
                      <div key={id} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "var(--color-text-2)", animation: "vx-fade-up 0.4s ease both" }}>
                        <span style={{ color: o.color, fontWeight: 700, flexShrink: 0 }}>{o.name} :</span>
                        <span>{o.chatter}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pipeline + result */}
            <div style={{ background: "var(--color-void)", borderRadius: 14, padding: 22, minHeight: 240 }}>
              {state === "idle" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 196, color: "var(--color-text-3)", fontSize: 13 }}>
                  En attente d&apos;une mission…
                </div>
              )}
              {state !== "idle" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                  {PIPELINE_STEPS.map((s, i) => {
                    const reached = step > i;
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: reached ? agent.color : "rgba(255,255,255,0.12)",
                          transition: "background 0.3s",
                        }} />
                        <span style={{ fontSize: 12, color: reached ? "var(--color-text-1)" : "var(--color-text-3)", fontWeight: reached ? 600 : 400, transition: "color 0.3s" }}>{s}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {state === "done" && (
                <div style={{ borderTop: "0.5px solid var(--color-hairline)", paddingTop: 16, animation: "vx-fade-up 0.4s ease both" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: agent.color, marginBottom: 10 }}>{RESULTS[agent.id].label}</div>
                  {RESULTS[agent.id].lines.map((l) => (
                    <div key={l} style={{ fontSize: 12, color: "var(--color-text-2)", marginBottom: 5, display: "flex", gap: 6 }}>
                      <ArrowRight size={11} style={{ color: agent.color, flexShrink: 0, marginTop: 2 }} /> {l}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
