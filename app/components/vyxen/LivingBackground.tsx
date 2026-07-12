"use client";

/**
 * Fixed, full-viewport aurora background — three large blurred color blobs drifting slowly
 * behind the whole page. Pure CSS: only transform/opacity animate, the blur itself is static,
 * so it's cheap to composite and needs no WebGL (works even where the hero/globe fall back
 * to their static state). Mounted once, first, in HomePage — sections layer semi-transparent
 * backgrounds on top so it reads through consistently while text contrast is preserved.
 * Neutralized by the existing prefers-reduced-motion override in globals.css.
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
        @keyframes vx-aurora-a { 0%, 100% { transform: translate(-8%, -8%) scale(1); } 50% { transform: translate(6%, 10%) scale(1.15); } }
        @keyframes vx-aurora-b { 0%, 100% { transform: translate(8%, 12%) scale(1); } 50% { transform: translate(-10%, -6%) scale(1.12); } }
        @keyframes vx-aurora-c { 0%, 100% { transform: translate(0%, 0%) scale(1); } 50% { transform: translate(-6%, 8%) scale(1.18); } }
      `}</style>
      <div style={{
        position: "absolute", top: "2%", left: "6%", width: "46vw", height: "46vw", maxWidth: 640, maxHeight: 640,
        borderRadius: "50%", background: "#7c3aed", opacity: 0.16, filter: "blur(110px)",
        animation: "vx-aurora-a 34s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "38%", right: "4%", width: "38vw", height: "38vw", maxWidth: 560, maxHeight: 560,
        borderRadius: "50%", background: "#22d3ee", opacity: 0.11, filter: "blur(100px)",
        animation: "vx-aurora-b 42s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "2%", left: "26%", width: "42vw", height: "42vw", maxWidth: 600, maxHeight: 600,
        borderRadius: "50%", background: "#5b21b6", opacity: 0.14, filter: "blur(120px)",
        animation: "vx-aurora-c 38s ease-in-out infinite",
      }} />
    </div>
  );
}
