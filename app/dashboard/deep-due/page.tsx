"use client";

import { useState } from "react";
import { Shield, Copy, Check, AlertCircle, Sparkles } from "lucide-react";
import { api } from "../../lib/api";

interface RiskItem {
  level: string;
  description: string;
}

interface FounderProfile {
  resume: string;
  experience: string;
  reputation: string;
  signaux_positifs: string[];
  signaux_negatifs: string[];
}

interface CompanyAnalysis {
  resume: string;
  structure: string;
  position_marche: string;
  concurrents: string[];
  risques: string[];
}

interface DeepDueResult {
  due_id: string;
  company_name: string;
  founder_name: string;
  generated_at: string;
  score_confiance: number;
  synthese_executive: string;
  profil_fondateur: FounderProfile;
  analyse_entreprise: CompanyAnalysis;
  risques_identifies: RiskItem[];
  recommandation_finale: string;
}

const FIELD = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white";
const FE = { onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#059669"), onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#E2E8F0") };

const RISK_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  élevé:  { bg: "#FEF2F2", text: "#DC2626", label: "Élevé" },
  high:   { bg: "#FEF2F2", text: "#DC2626", label: "Élevé" },
  moyen:  { bg: "#FFFBEB", text: "#D97706", label: "Moyen" },
  medium: { bg: "#FFFBEB", text: "#D97706", label: "Moyen" },
  faible: { bg: "#F0FDF4", text: "#16A34A", label: "Faible" },
  low:    { bg: "#F0FDF4", text: "#16A34A", label: "Faible" },
};

const RECO_COLOR: Record<string, { bg: string; text: string; icon: string }> = {
  "Investir":         { bg: "#F0FDF4", text: "#16A34A", icon: "✅" },
  "Invest":           { bg: "#F0FDF4", text: "#16A34A", icon: "✅" },
  "Ne pas investir":  { bg: "#FEF2F2", text: "#DC2626", icon: "❌" },
  "Do not invest":    { bg: "#FEF2F2", text: "#DC2626", icon: "❌" },
};
const DEFAULT_RECO = { bg: "#FFFBEB", text: "#D97706", icon: "⚠️" };

export default function DeepDuePage() {
  const [form, setForm] = useState({
    company_name: "",
    founder_name: "",
    context: "",
    language: "fr",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DeepDueResult | null>(null);
  const [copied, setCopied] = useState(false);

  function set(f: string, v: string) { setForm((p) => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<DeepDueResult>("/agents/deep-due", form);
      setResult(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Erreur lors de l'analyse. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  function copyReport() {
    if (!result) return;
    const text = [
      `DUE DILIGENCE — ${result.company_name}`,
      `Fondateur : ${result.founder_name}`,
      `Score de confiance : ${result.score_confiance}/10`,
      `Recommandation : ${result.recommandation_finale}`,
      "",
      "SYNTHÈSE :", result.synthese_executive,
      "",
      "PROFIL FONDATEUR :", result.profil_fondateur?.resume,
      result.profil_fondateur?.experience,
      "",
      "ANALYSE ENTREPRISE :", result.analyse_entreprise?.resume,
      result.analyse_entreprise?.position_marche,
      "",
      "RISQUES IDENTIFIÉS :",
      ...result.risques_identifies.map((r) => `[${r.level.toUpperCase()}] ${r.description}`),
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const recoStyle = result ? (RECO_COLOR[result.recommandation_finale] ?? DEFAULT_RECO) : DEFAULT_RECO;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#ECFDF5", color: "#059669" }}>
          <Shield size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#0F2552" }}>Deep Due</h2>
          <p className="text-sm text-gray-400">Due diligence automatisée sur une entreprise et son fondateur</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-sm mb-5" style={{ color: "#0F2552" }}>Cible de la due diligence</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Nom de l&apos;entreprise *</label>
              <input type="text" required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="TechVision AI" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Nom du fondateur</label>
              <input type="text" value={form.founder_name} onChange={(e) => set("founder_name", e.target.value)} placeholder="Kofi Mensah" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Informations disponibles</label>
              <textarea value={form.context} onChange={(e) => set("context", e.target.value)} placeholder="Collez ici toutes les informations disponibles : LinkedIn, Crunchbase, articles de presse, avis, données financières...&#10;&#10;Plus vous fournissez d'informations, plus l'analyse sera précise." rows={6} className={FIELD + " resize-none"} style={{ borderColor: "#E2E8F0" }} {...FE} />
              <p className="text-xs text-gray-400 mt-1.5">Optionnel. Sans contexte, l'analyse se base sur les informations publiques connues.</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Langue du rapport</label>
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
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "#059669" }}>
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse en cours…</> : <><Sparkles size={16} /> Lancer la due diligence</>}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center" style={{ background: "#ECFDF5" }}>
                <Shield size={28} style={{ color: "#059669" }} />
              </div>
              <p className="text-sm text-gray-400 max-w-xs">Entrez le nom d&apos;une entreprise pour lancer une due diligence complète avec profil fondateur et cartographie des risques.</p>
            </div>
          )}
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full animate-spin mb-4" style={{ border: "3px solid #ECFDF5", borderTopColor: "#059669" }} />
              <p className="text-sm text-gray-400">Due diligence en cours…</p>
              <p className="text-xs text-gray-400 mt-1">Cela peut prendre 30 à 60 secondes</p>
            </div>
          )}
          {result && (
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-mono text-xs text-gray-400">{result.due_id}</div>
                    <h4 className="font-bold text-lg" style={{ color: "#0F2552" }}>{result.company_name}</h4>
                    {result.founder_name && <p className="text-sm text-gray-400">{result.founder_name}</p>}
                  </div>
                  <button onClick={copyReport} className="p-1.5 rounded-lg border hover:bg-gray-50 transition-all flex-shrink-0" style={{ borderColor: "#E2E8F0" }}>
                    {copied ? <Check size={14} style={{ color: "#16A34A" }} /> : <Copy size={14} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">Score de confiance</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100">
                    <div className="h-full rounded-full" style={{ width: `${result.score_confiance * 10}%`, background: "#059669" }} />
                  </div>
                  <span className="font-mono text-sm font-bold" style={{ color: "#0F2552" }}>{result.score_confiance}/10</span>
                </div>
              </div>

              {/* Recommandation */}
              {result.recommandation_finale && (
                <div className="rounded-2xl border p-4 flex items-center gap-3" style={{ background: recoStyle.bg, borderColor: `${recoStyle.text}30` }}>
                  <span className="text-2xl">{recoStyle.icon}</span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: recoStyle.text }}>Recommandation</div>
                    <div className="font-bold" style={{ color: recoStyle.text }}>{result.recommandation_finale}</div>
                  </div>
                </div>
              )}

              {/* Synthèse */}
              {result.synthese_executive && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#059669" }}>Synthèse exécutive</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{result.synthese_executive}</p>
                </div>
              )}

              {/* Profil fondateur */}
              {result.profil_fondateur && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#059669" }}>Profil fondateur</div>
                  {result.profil_fondateur.resume && <p className="text-sm text-gray-600">{result.profil_fondateur.resume}</p>}
                  {result.profil_fondateur.experience && (
                    <div>
                      <div className="text-xs font-medium text-gray-400 mb-1">Expérience</div>
                      <p className="text-sm text-gray-600">{result.profil_fondateur.experience}</p>
                    </div>
                  )}
                  {(result.profil_fondateur.signaux_positifs?.length > 0 || result.profil_fondateur.signaux_negatifs?.length > 0) && (
                    <div className="grid grid-cols-2 gap-3">
                      {result.profil_fondateur.signaux_positifs?.length > 0 && (
                        <div>
                          <div className="text-xs font-medium mb-1" style={{ color: "#16A34A" }}>Signaux positifs</div>
                          <ul className="space-y-0.5">{result.profil_fondateur.signaux_positifs.map((s, i) => <li key={i} className="text-xs text-gray-500 flex gap-1"><span style={{ color: "#16A34A" }}>+</span>{s}</li>)}</ul>
                        </div>
                      )}
                      {result.profil_fondateur.signaux_negatifs?.length > 0 && (
                        <div>
                          <div className="text-xs font-medium mb-1" style={{ color: "#DC2626" }}>Signaux négatifs</div>
                          <ul className="space-y-0.5">{result.profil_fondateur.signaux_negatifs.map((s, i) => <li key={i} className="text-xs text-gray-500 flex gap-1"><span style={{ color: "#DC2626" }}>−</span>{s}</li>)}</ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Risques */}
              {result.risques_identifies?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#059669" }}>Risques identifiés</div>
                  <div className="space-y-2">
                    {result.risques_identifies.map((risk, i) => {
                      const style = RISK_COLOR[risk.level.toLowerCase()] ?? RISK_COLOR.moyen;
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: style.bg }}>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${style.text}20`, color: style.text }}>{style.label}</span>
                          <p className="text-sm" style={{ color: "#0F2552" }}>{risk.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
