"use client";

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  return reduced;
}

/** Rough device tier detection for adaptive particle/effect density. */
export function usePerfTier(): "low" | "mid" | "high" {
  const [tier, setTier] = useState<"low" | "mid" | "high">("mid");

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile || cores <= 4 || mem <= 4) setTier("low");
    else if (cores <= 8 || mem <= 8) setTier("mid");
    else setTier("high");
  }, []);

  return tier;
}

/**
 * Feature-detects WebGL before attempting to mount a Three.js scene. Needed because
 * WebGLRenderer throws (as an unhandled promise rejection, not a normal render error) when
 * a context can't be created — hardware acceleration disabled, sandboxed/locked-down
 * browser, old GPU drivers. React error boundaries don't catch that kind of async throw, so
 * the only reliable fix is never attempting to create the context in the first place.
 * Returns null while the check is pending (first client render) to avoid a hydration
 * mismatch, then true/false once known.
 */
export function useWebGLSupported(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
