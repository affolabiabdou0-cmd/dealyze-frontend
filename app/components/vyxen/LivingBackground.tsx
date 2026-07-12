"use client";

/**
 * Fixed, full-viewport aurora background: a large slow-rotating conic "curtain" sweep plus
 * four bolder, more saturated color blobs drifting independently — behind the whole page.
 * Pure CSS: only transform/opacity animate, blur itself is static, so it's cheap to composite
 * and needs no WebGL (works even where the hero/globe fall back to their static state).
 * Mounted once, first, in HomePage — sections layer semi-transparent backgrounds on top so it
 * reads through consistently while text contrast is preserved. Neutralized by the existing
 * prefers-reduced-motion override in globals.css.
 */
export default function LivingBackground() {
  // z-index: -1 (not 0) deliberately — several sections on this page don't set their own
  // position/z-index, and at z-index:0 those would paint *behind* this fixed layer instead
  // of above it (static-positioned content sits in a lower stacking tier than any
  // positioned z-index:0 element). Negative z-index sits below that tier unconditionally,
  // so every section paints above it regardless of its own position property.
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
      <style>{`
        @keyframes vx-aurora-a     { 0%, 100% { transform: translate(-8%, -8%) scale(1); }   50% { transform: translate(8%, 12%) scale(1.2); } }
        @keyframes vx-aurora-b     { 0%, 100% { transform: translate(8%, 12%) scale(1); }     50% { transform: translate(-12%, -8%) scale(1.15); } }
        @keyframes vx-aurora-c     { 0%, 100% { transform: translate(0%, 0%) scale(1); }      50% { transform: translate(-8%, 10%) scale(1.22); } }
        @keyframes vx-aurora-d     { 0%, 100% { transform: translate(6%, -6%) scale(1); }     50% { transform: translate(-6%, 8%) scale(1.18); } }
        @keyframes vx-aurora-spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Large rotating curtain sweep — the big, slow "living sky" motion behind everything */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", width: "150vmax", height: "150vmax",
        transform: "translate(-50%, -50%)",
        background: "conic-gradient(from 0deg, transparent 0%, rgba(124,58,237,0.16) 12%, transparent 26%, rgba(34,211,238,0.13) 42%, transparent 58%, rgba(168,85,247,0.14) 74%, transparent 88%, rgba(124,58,237,0.16) 100%)",
        animation: "vx-aurora-spin 140s linear infinite",
      }} />

      {/* Four bolder, more saturated blobs for real color presence, not just haze */}
      <div style={{
        position: "absolute", top: "0%", left: "4%", width: "48vw", height: "48vw", maxWidth: 680, maxHeight: 680,
        borderRadius: "50%", background: "#7c3aed", opacity: 0.32, filter: "blur(90px)",
        animation: "vx-aurora-a 30s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "34%", right: "2%", width: "40vw", height: "40vw", maxWidth: 600, maxHeight: 600,
        borderRadius: "50%", background: "#22d3ee", opacity: 0.24, filter: "blur(85px)",
        animation: "vx-aurora-b 38s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "0%", left: "22%", width: "44vw", height: "44vw", maxWidth: 640, maxHeight: 640,
        borderRadius: "50%", background: "#a855f7", opacity: 0.26, filter: "blur(95px)",
        animation: "vx-aurora-c 34s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "12%", right: "16%", width: "30vw", height: "30vw", maxWidth: 460, maxHeight: 460,
        borderRadius: "50%", background: "#2563eb", opacity: 0.22, filter: "blur(80px)",
        animation: "vx-aurora-d 26s ease-in-out infinite",
      }} />
    </div>
  );
}
