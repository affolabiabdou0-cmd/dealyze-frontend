"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, Radio } from "lucide-react";
import AICore from "./AICore";
import { AGENTS, PIPELINE_STEPS, type AgentId } from "./agents";

const EXAMPLES = [
  "Create a proposal for a construction company.",
  "Recover unpaid invoices.",
  "Analyze this startup's pitch deck.",
  "Prepare a Due Diligence report.",
  "Automate client follow-up.",
];

const KEYWORDS: Record<AgentId, string[]> = {
  deal_draft: ["proposal", "devis", "contract", "offer", "quote"],
  smart_chase: ["invoice", "impay", "payment", "follow-up", "relance", "recover"],
  pitch_radar: ["pitch", "startup", "deck", "investor"],
  deep_due: ["due diligence", "risk", "company", "analyze", "market"],
};

function pickAgents(text: string): AgentId[] {
  const t = text.toLowerCase();
  const matched = AGENTS.filter((a) => KEYWORDS[a.id].some((k) => t.includes(k))).map((a) => a.id);
  return matched.length > 0 ? matched : AGENTS.map((a) => a.id);
}

type Phase = "idle" | "analysis" | "pipeline" | "done";

export default function MissionCenter({ onOpenDemo }: { onOpenDemo: () => void }) {
  const [input, setInput] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [requiredAgents, setRequiredAgents] = useState<AgentId[]>([]);
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx((i) => (i + 1) % EXAMPLES.length), 3500);
    return () => clearInterval(t);
  }, []);

  function clearAll() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function launch(text: string) {
    clearAll();
    const agents = pickAgents(text);
    setRequiredAgents(agents);
    setPhase("analysis");
    setStep(0);

    timers.current.push(setTimeout(() => setPhase("pipeline"), 900));
    PIPELINE_STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStep(i + 1), 900 + 480 * (i + 1)));
    });
    timers.current.push(setTimeout(() => setPhase("done"), 900 + 480 * PIPELINE_STEPS.length + 300));
  }

  // Mode auto: launch a demo mission after 30s of inactivity if idle.
  useEffect(() => {
    if (phase !== "idle") return;
    idleTimer.current = setTimeout(() => launch(EXAMPLES[placeholderIdx]), 30000);
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, placeholderIdx]);

  useEffect(() => clearAll, []);

  return (
    <section className="px-4 md:px-8" style={{ background: "rgba(11,11,19,0.82)", paddingTop: 90, paddingBottom: 100, borderTop: "0.5px solid var(--color-hairline)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, pointerEvents: "none", opacity: phase === "idle" ? 0.35 : 0.6, transition: "opacity 0.6s" }}>
        <AICore interactive={phase !== "idle"} />
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "2.5px", color: "var(--color-violet)", textTransform: "uppercase", fontWeight: 700, marginBottom: 14, background: "rgba(124,58,237,0.1)", padding: "4px 12px", borderRadius: 6 }}>
            <Radio size={11} /> Live AI Mission Center
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 600, color: "var(--color-text-1)", marginBottom: 12, letterSpacing: "-0.8px" }}>
            Décrivez une mission. Regardez vos agents l&apos;exécuter.
          </h2>
        </div>

        {/* Console */}
        <div className="glass-2" style={{ borderRadius: 20, padding: 24, boxShadow: "var(--shadow-glass)" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) launch(input); }}
              placeholder={EXAMPLES[placeholderIdx]}
              disabled={phase !== "idle" && phase !== "done"}
              style={{
                flex: 1, background: "var(--color-void)", border: "1px solid var(--color-hairline)",
                borderRadius: 12, padding: "14px 18px", fontSize: 14, color: "var(--color-text-1)", outline: "none",
              }}
            />
            <button
              onClick={() => launch(input || EXAMPLES[placeholderIdx])}
              disabled={phase === "analysis" || phase === "pipeline"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7, padding: "0 22px", borderRadius: 12,
                background: "linear-gradient(135deg, #5b21b6, #6d28d9)", color: "#fff", border: "none",
                fontSize: 13.5, fontWeight: 700, cursor: "pointer", flexShrink: 0,
                opacity: (phase === "analysis" || phase === "pipeline") ? 0.6 : 1,
              }}
            >
              Launch AI Mission <ArrowRight size={14} />
            </button>
          </div>

          {phase !== "idle" && (
            <div style={{ marginTop: 24, animation: "vx-fade-up 0.4s ease both" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-text-3)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
                Required agents
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {requiredAgents.map((id) => {
                  const a = AGENTS.find((x) => x.id === id)!;
                  const Icon = a.icon;
                  return (
                    <span key={id} className="glass-1" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 13px", borderRadius: 20, fontSize: 12, color: a.color, fontWeight: 600 }}>
                      <Icon size={12} /> {a.name}
                    </span>
                  );
                })}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {PIPELINE_STEPS.map((s, i) => {
                  const reached = step > i;
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: reached ? "var(--color-cyan)" : "rgba(255,255,255,0.12)", transition: "background 0.3s" }} />
                      <span style={{ fontSize: 12.5, color: reached ? "var(--color-text-1)" : "var(--color-text-3)", fontWeight: reached ? 600 : 400, transition: "color 0.3s" }}>{s}</span>
                    </div>
                  );
                })}
              </div>

              {phase === "done" && (
                <div style={{ marginTop: 22, paddingTop: 18, borderTop: "0.5px solid var(--color-hairline)", textAlign: "center", animation: "vx-fade-up 0.4s ease both" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-1)", marginBottom: 4 }}>Mission Successfully Completed</p>
                  <p style={{ fontSize: 12.5, color: "var(--color-text-3)", marginBottom: 18 }}>Votre équipe IA est prête à traiter vos prochaines missions.</p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg, #5b21b6, #7c3aed)", color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                      Start Free <ArrowRight size={14} />
                    </Link>
                    <button onClick={onOpenDemo} className="glass-1" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "var(--color-text-2)", cursor: "pointer" }}>
                      <Play size={13} /> Voir une démo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
