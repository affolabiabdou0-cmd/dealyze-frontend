"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { AgentId } from "./agents";

interface Ctx {
  selected: AgentId;
  select: (id: AgentId, scroll?: boolean) => void;
}

const AgentSelectionCtx = createContext<Ctx | null>(null);

export function AgentSelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<AgentId>("deal_draft");

  function select(id: AgentId, scroll = false) {
    setSelected(id);
    if (scroll) {
      document.getElementById("agents-lab")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return <AgentSelectionCtx.Provider value={{ selected, select }}>{children}</AgentSelectionCtx.Provider>;
}

export function useAgentSelection() {
  const ctx = useContext(AgentSelectionCtx);
  if (!ctx) throw new Error("useAgentSelection must be used within AgentSelectionProvider");
  return ctx;
}
