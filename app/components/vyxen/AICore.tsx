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
        @keyframes vx-core-breathe { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.06); opacity: 0.85; } }
      `}</style>
      <div style={{
        width: "42%", aspectRatio: "1", borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, #a78bfa, #5b21b6 55%, #1e0547 100%)",
        boxShadow: "0 0 120px rgba(124,58,237,0.45)",
        animation: "vx-core-breathe 4.5s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: "62%", aspectRatio: "1", borderRadius: "50%",
        border: "1px solid rgba(167,139,250,0.35)",
        animation: "vx-orbit 24s linear infinite",
      }} />
      <div style={{
        position: "absolute", width: "78%", aspectRatio: "1", borderRadius: "50%",
        border: "1px solid rgba(34,211,238,0.2)",
        animation: "vx-orbit 36s linear infinite reverse",
      }} />
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
