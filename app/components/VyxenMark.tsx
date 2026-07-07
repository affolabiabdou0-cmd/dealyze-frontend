"use client";

import { useId } from "react";

interface VyxenMarkProps {
  size?: number;
  glow?: boolean;
  style?: React.CSSProperties;
}

/**
 * Geometric X brand mark — cyan (left bar) × violet (right bar).
 * The X is the dominant element, matching the spotlight given to X in
 * the VYXEN wordmark. Scale via `size`; enable ambient glow with `glow`.
 */
export default function VyxenMark({ size = 40, glow = false, style }: VyxenMarkProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 64"
      fill="none"
      aria-hidden="true"
      style={{
        flexShrink: 0,
        filter: glow ? "drop-shadow(0 0 10px rgba(124,58,237,0.55)) drop-shadow(0 0 4px rgba(34,211,238,0.35))" : undefined,
        ...style,
      }}
    >
      <defs>
        {/* Cyan — left bar of X */}
        <linearGradient id={`${uid}c`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        {/* Violet — right bar of X */}
        <linearGradient id={`${uid}v`} x1="1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        {/* Center diamond highlight */}
        <radialGradient id={`${uid}d`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Bar  \  (top-left → bottom-right) — CYAN ── */}
      <polygon points="0,0 18,0 60,64 42,64" fill={`url(#${uid}c)`} />

      {/* ── Bar  /  (top-right → bottom-left) — VIOLET ── */}
      <polygon points="42,0 60,0 18,64 0,64" fill={`url(#${uid}v)`} />

      {/* ── Center crossing highlight (depth) ── */}
      <polygon points="30,26 38,32 30,38 22,32" fill={`url(#${uid}d)`} />
    </svg>
  );
}
