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
