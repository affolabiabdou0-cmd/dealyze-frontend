"use client";

import { useState } from "react";
import { FileText, Copy, Check, AlertCircle, Sparkles } from "lucide-react";
import { api } from "../../lib/api";

interface DealDraftContent {
  introduction?: string;
  description_besoin?: string;
  proposition_valeur?: string;
  livrables?: string[];
  calendrier?: string;
  budget_details?: string;
  conditions_paiement?: string;
  conclusion?: string;
  [key: string]: unknown;
}

interface DealDraftResult {
  quote_id: string;
  client_name: string;
  generated_at: string;
  tone: string;
  language: string;
  content: DealDraftContent;
}

const FIELD = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white";
const FE = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#2563EB"),
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#E2E8F0"),
};

export default function DealDraftPage() {
  const [form, setForm] = useState({
    client_name: "",
    sector: "",
    need: "",
    budget: "",
    timeline: "",
    language: "fr",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DealDraftResult | null>(null);
  const [copied, setCopied] = useState(false);

  function set(field: string, val: string) {
    setForm((p) => ({ ...p, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<DealDraftResult>("/agents/deal-draft/generate", form);
      setResult(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Erreur lors de la génération. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  function copyText() {
    if (!result) return;
    const c = result.content;
    const lines = [
      `DEVIS — ${result.quote_id}`,
      `Client : ${result.client_name}`,
      `Généré le : ${new Date(result.generated_at).toLocaleDateString("fr-FR")}`,
      "",
    ];
    const keys: (keyof DealDraftContent)[] = ["introduction", "description_besoin", "proposition_valeur", "calendrier", "budget_details", "conditions_paiement", "conclusion"];
    const labels: Record<string, string> = {
      introduction: "Introduction",
      description_besoin: "Description du besoin",
      proposition_valeur: "Proposition de valeur",
      livrables: "Livrables",
      calendrier: "Calendrier",
      budget_details: "Budget",
      conditions_paiement: "Conditions de paiement",
      conclusion: "Conclusion",
    };
    for (const k of keys) {
      if (c[k]) {
        lines.push(`${labels[k] ?? k}:`, c[k] as string, "");
      }
    }
    if (c.livrables?.length) {
      lines.push("Livrables:", ...(c.livrables as string[]).map((l) => `• ${l}`), "");
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const SECTIONS: { key: keyof DealDraftContent; label: string }[] = [
    { key: "introduction", label: "Introduction" },
    { key: "description_besoin", label: "Description du besoin" },
    { key: "proposition_valeur", label: "Proposition de valeur" },
    { key: "calendrier", label: "Calendrier" },
    { key: "budget_details", label: "Budget" },
    { key: "conditions_paiement", label: "Conditions de paiement" },
    { key: "conclusion", label: "Conclusion" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF", color: "#2563EB" }}>
          <FileText size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#0F2552" }}>Deal Draft</h2>
          <p className="text-sm text-gray-400">Générez un devis professionnel en quelques secondes</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-sm mb-5" style={{ color: "#0F2552" }}>Informations du deal</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Nom du client *</label>
              <input type="text" required value={form.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="Acme Corp" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Secteur d&apos;activité *</label>
              <input type="text" required value={form.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Agence web / E-commerce" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Besoin / Prestation *</label>
              <textarea required value={form.need} onChange={(e) => set("need", e.target.value)} placeholder="Création d'un site e-commerce avec tableau de bord analytique et intégration paiement..." rows={3} className={FIELD + " resize-none"} style={{ borderColor: "#E2E8F0" }} {...FE} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Budget *</label>
                <input type="text" required value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="8 000 €" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Délai *</label>
                <input type="text" required value={form.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="6 semaines" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Langue</label>
              <select value={form.language} onChange={(e) => set("language", e.target.value)} className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE}>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "#2563EB" }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération…</>
                : <><Sparkles size={16} /> Générer le devis</>}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                <FileText size={28} style={{ color: "#2563EB" }} />
              </div>
              <p className="text-sm text-gray-400 max-w-xs">Remplissez le formulaire et cliquez sur « Générer » pour obtenir votre devis professionnel instantanément.</p>
            </div>
          )}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full animate-spin mb-4" style={{ border: "3px solid #EFF6FF", borderTopColor: "#2563EB" }} />
              <p className="text-sm text-gray-400">Gemini 2.5 génère votre devis…</p>
            </div>
          )}
          {result && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs text-gray-400">{result.quote_id}</div>
                  <h4 className="font-bold text-base" style={{ color: "#0F2552" }}>{result.client_name}</h4>
                </div>
                <button onClick={copyText} className="p-2 rounded-lg border hover:bg-gray-50 transition-all flex items-center gap-1.5 text-xs text-gray-500" style={{ borderColor: "#E2E8F0" }}>
                  {copied ? <><Check size={14} style={{ color: "#16A34A" }} /> Copié</> : <><Copy size={14} /> Copier</>}
                </button>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {SECTIONS.map((s) => {
                  const val = result.content[s.key];
                  if (!val || typeof val !== "string") return null;
                  return (
                    <div key={s.key}>
                      <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#2563EB" }}>{s.label}</div>
                      <p className="text-sm text-gray-600 leading-relaxed">{val}</p>
                    </div>
                  );
                })}
                {Array.isArray(result.content.livrables) && result.content.livrables.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#2563EB" }}>Livrables</div>
                    <ul className="space-y-1">
                      {(result.content.livrables as string[]).map((l, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span style={{ color: "#2563EB" }}>•</span>{l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
