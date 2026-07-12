"use client";

import dynamic from "next/dynamic";
import { useReducedMotion, useWebGLSupported } from "./useReducedMotion";

function StaticGlobeGlow() {
  return (
    <div style={{
      width: "100%", height: "100%", borderRadius: "50%", margin: "40px auto",
      background: "radial-gradient(circle at 35% 30%, rgba(124,58,237,0.25), transparent 70%)",
      border: "1px solid rgba(167,139,250,0.25)", maxWidth: 300, maxHeight: 300,
    }} />
  );
}

// Same reasoning as AICore: a blank loading state reads as "the world section never
// loaded" on any real connection. Show the static glow immediately, swap to the live
// globe once the WebGL chunk is ready.
const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false, loading: () => <StaticGlobeGlow /> });

const INDUSTRIES = [
  "Cabinets d'avocats", "Comptabilité", "Immobilier", "Restaurants", "Santé",
  "Éducation", "Industrie", "Logistique", "Assurances", "Startups",
  "Freelances", "PME", "Banques", "E-commerce", "Construction",
];

const HUBS_LABELS = ["Paris", "Londres", "New York", "Tokyo", "Dubai", "Singapour", "São Paulo", "Lagos", "Sydney"];

export default function WorldSection() {
  const reducedMotion = useReducedMotion();
  const webglSupported = useWebGLSupported();

  return (
    <section className="px-4 md:px-8" style={{ background: "var(--color-void)", paddingTop: 90, paddingBottom: 60, borderTop: "0.5px solid var(--color-hairline)", overflow: "hidden" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "2.5px", color: "var(--color-cyan)", textTransform: "uppercase", fontWeight: 700, marginBottom: 14, background: "rgba(34,211,238,0.1)", padding: "4px 12px", borderRadius: 6 }}>
            Un réseau mondial
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 600, color: "var(--color-text-1)", marginBottom: 12, letterSpacing: "-0.8px" }}>
            One AI workforce. Every industry.
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-3)", maxWidth: 480, margin: "0 auto", lineHeight: 1.75 }}>
            Peu importe votre secteur ou votre fuseau horaire, vos agents travaillent déjà.
          </p>
        </div>

        <div style={{ width: "100%", maxWidth: 460, height: 380, margin: "0 auto" }}>
          {reducedMotion || webglSupported !== true ? <StaticGlobeGlow /> : <GlobeScene />}
        </div>

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center", marginTop: -10, marginBottom: 40 }}>
          {HUBS_LABELS.map((h) => (
            <span key={h} className="font-mono" style={{ fontSize: 10.5, color: "var(--color-text-3)", letterSpacing: "0.5px" }}>
              ● {h}
            </span>
          ))}
        </div>
      </div>

      {/* Industries marquee */}
      <div style={{ position: "relative", maxWidth: "100%" }}>
        <style>{`
          @keyframes vx-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .vx-marquee-track { animation: vx-marquee 32s linear infinite; }
          @media (prefers-reduced-motion: reduce) { .vx-marquee-track { animation: none; } }
        `}</style>
        <div style={{ display: "flex", overflow: "hidden", WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)", maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}>
          <div className="vx-marquee-track" style={{ display: "flex", gap: 12, flexShrink: 0, padding: "4px 0" }}>
            {[...INDUSTRIES, ...INDUSTRIES].map((ind, i) => (
              <span key={i} className="glass-1" style={{ padding: "8px 18px", borderRadius: 20, fontSize: 12.5, color: "var(--color-text-2)", whiteSpace: "nowrap", flexShrink: 0 }}>
                {ind}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
