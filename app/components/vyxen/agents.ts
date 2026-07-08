import { FileText, Mail, BarChart3, Globe2, type LucideIcon } from "lucide-react";

export type AgentId = "deal_draft" | "smart_chase" | "pitch_radar" | "deep_due";

export interface AgentConfig {
  id: AgentId;
  name: string;
  color: string;
  accent: string;
  icon: LucideIcon;
  mission: string;
  personality: string;
  lab: string;
  placeholder: string;
  chatter: string; // what this agent says when another agent finishes
}

export const AGENTS: AgentConfig[] = [
  {
    id: "deal_draft",
    name: "Deal Draft",
    color: "var(--color-agent-deal-draft)",
    accent: "var(--color-agent-deal-draft-accent)",
    icon: FileText,
    mission: "Créer des documents parfaits",
    personality: "Créatif, rapide, perfectionniste",
    lab: "Atelier de création",
    placeholder: "Create a proposal for a construction company.",
    chatter: "Je programmerai automatiquement le suivi.",
  },
  {
    id: "smart_chase",
    name: "Smart Chase",
    color: "var(--color-agent-smart-chase)",
    accent: "var(--color-agent-smart-chase-accent)",
    icon: Mail,
    mission: "Accélérer les paiements",
    personality: "Calme, rigoureux, précis",
    lab: "Salle financière",
    placeholder: "Recover unpaid invoices.",
    chatter: "Relance programmée, ton calibré sur le profil client.",
  },
  {
    id: "pitch_radar",
    name: "Pitch Radar",
    color: "var(--color-agent-pitch-radar)",
    accent: "var(--color-agent-pitch-radar-accent)",
    icon: BarChart3,
    mission: "Analyser les startups",
    personality: "Curieux, observateur, analytique",
    lab: "Observatoire",
    placeholder: "Analyze this startup's pitch deck.",
    chatter: "Ce client possède également une startup en amorçage.",
  },
  {
    id: "deep_due",
    name: "Deep Due",
    color: "var(--color-agent-deep-due)",
    accent: "var(--color-agent-deep-due-accent)",
    icon: Globe2,
    mission: "Comprendre le monde",
    personality: "Visionnaire, stratégique, patient",
    lab: "Cartographie mondiale",
    placeholder: "Prepare a Due Diligence report.",
    chatter: "Analyse de risque lancée en parallèle.",
  },
];

export const PIPELINE_STEPS = [
  "Mission Received",
  "Analysis",
  "Planning",
  "Execution",
  "Validation",
  "Delivery",
] as const;
