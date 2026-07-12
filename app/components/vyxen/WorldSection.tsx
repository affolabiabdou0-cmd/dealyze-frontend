"use client";

import dynamic from "next/dynamic";
import { useReducedMotion, useWebGLSupported } from "./useReducedMotion";

const GLOBE_SPARKS = [
  { radius: 62, size: 4,   duration: 16, delay: -3,  reverse: false, color: "#67e8f9" },
  { radius: 62, size: 3,   duration: 16, delay: -10, reverse: false, color: "#a78bfa" },
  { radius: 84, size: 3,   duration: 26, delay: -14, reverse: true,  color: "#c4b5fd" },
];

// Animation is neutralized automatically for prefers-reduced-motion by the global
// override in globals.css, so this serves both the reduced-motion and WebGL-unavailable
// fallback cases without needing two variants.
function StaticGlobeGlow() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", maxWidth: 300, maxHeight: 300, margin: "40px auto" }}>
      <style>{`
        @keyframes vx-globe-breathe { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.04); opacity: 0.8; } }
        @keyframes vx-globe-spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, rgba(124,58,237,0.25), transparent 70%)",
        border: "1px solid rgba(167,139,250,0.25)",
        animation: "vx-globe-breathe 5s ease-in-out infinite",
      }} />

      {/* Rotating aurora sweep, same treatment as the hero core, sized down */}
      <div style={{
        position: "absolute", inset: "18%", borderRadius: "50%",
        background: "conic-gradient(from 0deg, transparent 0%, rgba(34,211,238,0.4) 20%, transparent 36%, rgba(167,139,250,0.35) 60%, transparent 78%)",
        maskImage: "radial-gradient(circle, transparent 66%, black 68%, black 82%, transparent 84%)",
        WebkitMaskImage: "radial-gradient(circle, transparent 66%, black 68%, black 82%, transparent 84%)",
        mixBlendMode: "screen",
        animation: "vx-globe-spin 20s linear infinite",
      }} />

      <div style={{
        position: "absolute", inset: "12%", borderRadius: "50%",
        border: "1px solid rgba(34,211,238,0.18)",
        animation: "vx-globe-spin 28s linear infinite reverse",
      }} />

      {GLOBE_SPARKS.map((s, i) => (
        <div key={i} style={{
          position: "absolute", top: "50%", left: "50%",
          width: `${s.radius}%`, height: `${s.radius}%`,
          transform: "translate(-50%,-50%)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            animation: `vx-globe-spin ${s.duration}s linear infinite${s.reverse ? " reverse" : ""}`,
            animationDelay: `${s.delay}s`,
          }}>
            <div style={{
              position: "absolute", top: 0, left: "50%",
              width: s.size, height: s.size, borderRadius: "50%",
              transform: "translate(-50%,-50%)",
              background: s.color, opacity: 0.75,
              boxShadow: `0 0 ${s.size * 2.5}px ${s.color}`,
            }} />
          </div>
        </div>
      ))}
    </div>
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
