"use client";

import { useState } from "react";
import { BarChart2, Copy, Check, AlertCircle, Sparkles, Upload } from "lucide-react";
import { api } from "../../lib/api";

interface CriterionScore {
  key: string;
  label: string;
  score: number;
  weight: number;
  note: string;
}

interface PitchRadarResult {
  radar_id: string;
  startup_name: string;
  generated_at: string;
  language: string;
  scores: CriterionScore[];
  score_global: number;
  points_forts: string[];
  points_alerte: string[];
  questions_suggerees: string[];
  recommandation: string;
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score * 10}%`, background: color }} />
      </div>
      <span className="font-mono text-xs font-bold w-8 text-right" style={{ color: "#0F2552" }}>{score}/10</span>
    </div>
  );
}

function GlobalScore({ score }: { score: number }) {
  const color = score >= 7 ? "#16A34A" : score >= 5 ? "#D97706" : "#DC2626";
  const pct = score * 25.1;
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="10" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${pct} 251`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono" style={{ color }}>{score.toFixed(1)}</span>
          <span className="text-xs text-gray-400">/10</span>
        </div>
      </div>
    </div>
  );
}

export default function PitchRadarPage() {
  const [startupName, setStartupName] = useState("");
  const [deckText, setDeckText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("fr");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PitchRadarResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!deckText.trim() && !file) { setError("Entrez du texte ou uploadez un PDF."); return; }
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("startup_name", startupName);
      formData.append("language", language);
      formData.append("deck_text", deckText);
      if (file) formData.append("file", file);

      const res = await api.post<PitchRadarResult>("/agents/pitch-radar/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
      `PITCH RADAR — ${result.startup_name}`,
      `Score global : ${result.score_global}/10`,
      "",
      "SCORES :",
      ...result.scores.map((s) => `${s.label} : ${s.score}/10 — ${s.note}`),
      "",
      "POINTS FORTS :", ...result.points_forts.map((f) => `• ${f}`),
      "",
      "POINTS D'ALERTE :", ...result.points_alerte.map((a) => `• ${a}`),
      "",
      "QUESTIONS INVESTISSEUR :", ...result.questions_suggerees.map((q) => `• ${q}`),
      "",
      "RECOMMANDATION :", result.recommandation,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const borderFocus = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#0891B2"),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#E2E8F0"),
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E0F2FE", color: "#0891B2" }}>
          <BarChart2 size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#0F2552" }}>Pitch Radar</h2>
          <p className="text-sm text-gray-400">Analysez un pitch startup — score par dimension, forces et recommandations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-sm mb-5" style={{ color: "#0F2552" }}>Données du pitch</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Nom de la startup *</label>
              <input
                type="text" required value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="TechVision AI"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white"
                style={{ borderColor: "#E2E8F0" }} {...borderFocus}
              />
            </div>

            {/* PDF upload */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Pitch deck PDF (optionnel)</label>
              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: file ? "#0891B2" : "#E2E8F0" }}>
                <Upload size={18} style={{ color: file ? "#0891B2" : "#94A3B8" }} />
                <div>
                  <div className="text-sm" style={{ color: file ? "#0F2552" : "#94A3B8" }}>
                    {file ? file.name : "Cliquez pour uploader un PDF"}
                  </div>
                  <div className="text-xs text-gray-400">PDF jusqu&apos;à 10 Mo</div>
                </div>
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">ou copiez-collez le texte</div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Contenu du pitch</label>
              <textarea
                value={deckText} onChange={(e) => setDeckText(e.target.value)}
                placeholder={`Collez ici le contenu du pitch :\n\nProblème : Les PME perdent 40% de temps sur la gestion manuelle...\nSolution : Plateforme IA avec 4 agents spécialisés...\nMarchés : 250M$ TAM, croissance 18%/an...\nÉquipe : CEO ex-Google, CTO 10 ans SaaS...\nLevée : 500K$ pour 18 mois de runway...`}
                rows={7}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white resize-none"
                style={{ borderColor: "#E2E8F0" }} {...borderFocus}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Langue</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white" style={{ borderColor: "#E2E8F0" }} {...borderFocus}>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "#0891B2" }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse…</>
                : <><Sparkles size={16} /> Analyser le pitch</>}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center" style={{ background: "#E0F2FE" }}>
                <BarChart2 size={28} style={{ color: "#0891B2" }} />
              </div>
              <p className="text-sm text-gray-400 max-w-xs">Uploadez un PDF ou collez le contenu du pitch pour obtenir une analyse complète avec score par dimension.</p>
            </div>
          )}
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full animate-spin mb-4" style={{ border: "3px solid #E0F2FE", borderTopColor: "#0891B2" }} />
              <p className="text-sm text-gray-400">Analyse du pitch en cours…</p>
            </div>
          )}
          {result && (
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {/* Header + score */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-mono text-xs text-gray-400">{result.radar_id}</div>
                    <h4 className="font-bold text-lg" style={{ color: "#0F2552" }}>{result.startup_name}</h4>
                  </div>
                  <button onClick={copyReport} className="p-1.5 rounded-lg border hover:bg-gray-50 flex items-center gap-1.5 text-xs text-gray-500" style={{ borderColor: "#E2E8F0" }}>
                    {copied ? <><Check size={13} style={{ color: "#16A34A" }} /> Copié</> : <><Copy size={13} /> Copier</>}
                  </button>
                </div>
                <GlobalScore score={result.score_global} />
              </div>

              {/* Scores by dimension */}
              {result.scores?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#0891B2" }}>Scores par critère</div>
                  {result.scores.map((s) => (
                    <div key={s.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: "#0F2552" }}>{s.label}</span>
                        <span className="text-xs text-gray-400">{Math.round(s.weight * 100)}%</span>
                      </div>
                      <ScoreBar score={s.score} color="#0891B2" />
                      {s.note && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.note}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Forces / Alertes */}
              {(result.points_forts?.length > 0 || result.points_alerte?.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {result.points_forts?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#16A34A" }}>Points forts</div>
                      <ul className="space-y-1.5">
                        {result.points_forts.map((f, i) => <li key={i} className="text-xs text-gray-600 flex gap-1.5"><span style={{ color: "#16A34A" }}>✓</span>{f}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.points_alerte?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#D97706" }}>Points d&apos;alerte</div>
                      <ul className="space-y-1.5">
                        {result.points_alerte.map((a, i) => <li key={i} className="text-xs text-gray-600 flex gap-1.5"><span style={{ color: "#D97706" }}>⚠</span>{a}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Questions */}
              {result.questions_suggerees?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#0891B2" }}>Questions pour l&apos;investisseur</div>
                  <ul className="space-y-2">
                    {result.questions_suggerees.map((q, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-gray-300 font-mono text-xs">Q{i + 1}</span>{q}</li>)}
                  </ul>
                </div>
              )}

              {/* Recommandation */}
              {result.recommandation && (
                <div className="rounded-2xl border p-4" style={{ background: "#F0F9FF", borderColor: "#BAE6FD" }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#0891B2" }}>Recommandation</div>
                  <p className="text-sm leading-relaxed" style={{ color: "#0F2552" }}>{result.recommandation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
