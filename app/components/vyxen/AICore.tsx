"use client";

import dynamic from "next/dynamic";
import { useReducedMotion, usePerfTier, useWebGLSupported } from "./useReducedMotion";

// loading: () => null left the hero completely blank while the WebGL chunk downloaded —
// on any real-world connection that reads as "nothing shows up when you land on the page".
// Show the same static glow used for reduced-motion so there's always something on screen
// immediately, then it's replaced by the live scene once the chunk is ready.
const AICoreScene = dynamic(() => import("./AICoreScene"), {
  ssr: false,
  loading: () => <StaticCoreGlow />,
});

// Orbiting sparks — a pure-CSS stand-in for the particle field in the WebGL scene.
// Each is two nested elements: an unanimated "center" div does the positioning (so it can
// use translate(-50%,-50%) safely), and an inner "spin" div carries the rotation — keeping
// the two transforms from fighting each other. Negative animation-delay staggers each
// particle's starting angle around the circle without needing a third wrapper.
const SPARKS = [
  { radius: 50, size: 5,   duration: 18, delay: -2,  reverse: false, color: "#c4b5fd", op: 0.9 },
  { radius: 50, size: 4,   duration: 18, delay: -11, reverse: false, color: "#67e8f9", op: 0.7 },
  { radius: 68, size: 3.5, duration: 27, delay: -6,  reverse: true,  color: "#a78bfa", op: 0.65 },
  { radius: 68, size: 3,   duration: 27, delay: -19, reverse: true,  color: "#67e8f9", op: 0.55 },
  { radius: 68, size: 4,   duration: 27, delay: -24, reverse: true,  color: "#c4b5fd", op: 0.6 },
  { radius: 88, size: 3,   duration: 42, delay: -9,  reverse: false, color: "#22d3ee", op: 0.45 },
  { radius: 88, size: 2.5, duration: 42, delay: -30, reverse: false, color: "#a78bfa", op: 0.4 },
];

/**
 * CSS-only fallback — used both for prefers-reduced-motion (must stay static) and for
 * WebGL-unavailable (should still feel alive). The animations below are automatically
 * neutralized by the global `prefers-reduced-motion: reduce` override in globals.css
 * (animation-duration: 0.001ms !important), so this one component correctly serves both
 * cases without forking into two variants.
 */
function StaticCoreGlow() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes vx-core-breathe { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.07); opacity: 0.9; } }
        @keyframes vx-core-drift   { 0%, 100% { transform: translate(0,0); } 33% { transform: translate(-3%, 2%); } 66% { transform: translate(2%, -2%); } }
        @keyframes vx-ring-spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes vx-atmo-breathe { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 0.85; transform: scale(1.08); } }
      `}</style>

      {/* Outer atmosphere — soft bleed of light, breathes slower than the core */}
      <div style={{
        position: "absolute", width: "92%", aspectRatio: "1", borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, rgba(167,139,250,0.30), rgba(34,211,238,0.08) 45%, transparent 72%)",
        filter: "blur(18px)",
        animation: "vx-atmo-breathe 7s ease-in-out infinite",
      }} />

      {/* Rotating energy ring — conic aurora sweep, additive blend for a glow-on-glow feel */}
      <div style={{
        position: "absolute", width: "70%", aspectRatio: "1", borderRadius: "50%",
        background: "conic-gradient(from 0deg, transparent 0%, rgba(167,139,250,0.5) 18%, transparent 32%, rgba(34,211,238,0.45) 52%, transparent 68%, rgba(167,139,250,0.35) 86%, transparent 100%)",
        maskImage: "radial-gradient(circle, transparent 62%, black 64%, black 78%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(circle, transparent 62%, black 64%, black 78%, transparent 80%)",
        mixBlendMode: "screen",
        animation: "vx-ring-spin 22s linear infinite",
      }} />

      {/* Structural rings — thin, quiet, counter-rotating for depth */}
      <div style={{
        position: "absolute", width: "62%", aspectRatio: "1", borderRadius: "50%",
        border: "1px solid rgba(167,139,250,0.3)",
        animation: "vx-ring-spin 24s linear infinite",
      }} />
      <div style={{
        position: "absolute", width: "82%", aspectRatio: "1", borderRadius: "50%",
        border: "1px solid rgba(34,211,238,0.16)",
        animation: "vx-ring-spin 36s linear infinite reverse",
      }} />

      {/* Orbiting sparks */}
      {SPARKS.map((s, i) => (
        <div key={i} style={{
          position: "absolute", top: "50%", left: "50%",
          width: `${s.radius}%`, height: `${s.radius}%`,
          transform: "translate(-50%,-50%)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            animation: `vx-ring-spin ${s.duration}s linear infinite${s.reverse ? " reverse" : ""}`,
            animationDelay: `${s.delay}s`,
          }}>
            <div style={{
              position: "absolute", top: 0, left: "50%",
              width: s.size, height: s.size, borderRadius: "50%",
              transform: "translate(-50%,-50%)",
              background: s.color, opacity: s.op,
              boxShadow: `0 0 ${s.size * 2.5}px ${s.color}`,
            }} />
          </div>
        </div>
      ))}

      {/* Core — layered gradient with a slow-drifting highlight so it never reads as flat */}
      <div style={{
        position: "relative", width: "42%", aspectRatio: "1", borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, #a78bfa, #5b21b6 55%, #1e0547 100%)",
        boxShadow: "0 0 120px rgba(124,58,237,0.45)",
        animation: "vx-core-breathe 4.5s ease-in-out infinite",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "10%", left: "15%", width: "55%", height: "55%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)",
          animation: "vx-core-drift 6s ease-in-out infinite",
        }} />
      </div>
    </div>
  );
}

export default function AICore({
  interactive = false,
  className,
  style,
}: {
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reducedMotion = useReducedMotion();
  const tier = usePerfTier();
  const webglSupported = useWebGLSupported();

  return (
    <div className={className} style={{ width: "100%", height: "100%", ...style }}>
      {reducedMotion || webglSupported !== true ? (
        <StaticCoreGlow />
      ) : (
        <AICoreScene quality={tier} interactive={interactive} />
      )}
    </div>
  );
}
