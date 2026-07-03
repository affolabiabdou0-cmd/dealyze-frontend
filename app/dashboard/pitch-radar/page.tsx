"use client";

import { useState } from "react";
import { BarChart3, Copy, Check, AlertCircle, Sparkles, Upload, Download } from "lucide-react";
import { api } from "../../lib/api";

interface CriterionScore { key: string; label: string; score: number; weight: number; note: string; }
interface PitchRadarResult {
  radar_id: string; startup_name: string; generated_at: string; language: string;
  scores: CriterionScore[]; score_global: number;
  points_forts: string[]; points_alerte: string[];
  questions_suggerees: string[]; recommandation: string;
}

const COLOR = "#06b6d4";
const GLOW  = "rgba(6,182,212,0.45)";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  border: "1px solid #2a2a3a", background: "#0f0f13", color: "#e2e8f0",
  fontSize: 14, outline: "none", transition: "border-color 0.15s", boxSizing: "border-box",
};
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = COLOR);
const onBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#2a2a3a");
const Label   = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 6 }}>{children}</label>
);
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 16, padding: "24px", ...style }}>{children}</div>
);

const ANIM_STYLE = `
  @keyframes fadeInSection { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
`;

function ScoreBar({ score }: { score: number }) {
  const col = score >= 7 ? "#10b981" : score >= 5 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 4, background: "#2a2a3a", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score * 10}%`, borderRadius: 4, background: col, transition: "width 0.6s" }} />
      </div>
      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: col, width: 36, textAlign: "right" }}>{score}/10</span>
    </div>
  );
}

function GlobalScore({ score }: { score: number }) {
  const col = score >= 7 ? "#10b981" : score >= 5 ? "#f59e0b" : "#ef4444";
  const pct = score * 25.1;
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 110, height: 110 }}>
        <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a3a" strokeWidth="10" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={col} strokeWidth="10" strokeDasharray={`${pct} 251`} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "monospace", color: col }}>{score.toFixed(1)}</span>
          <span style={{ fontSize: 11, color: "#4a4a6a" }}>/10</span>
        </div>
      </div>
    </div>
  );
}

export default function PitchRadarPage() {
  const [startupName, setStartupName] = useState("");
  const [deckText, setDeckText]       = useState("");
  const [file, setFile]               = useState<File | null>(null);
  const [language, setLanguage]       = useState("fr");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [result, setResult]           = useState<PitchRadarResult | null>(null);
  const [copied, setCopied]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!deckText.trim() && !file) { setError("Entrez du texte ou uploadez un PDF."); return; }
    setError(""); setLoading(true);
    try {
      const formData = new FormData();
      formData.append("startup_name", startupName);
      formData.append("language", language);
      formData.append("deck_text", deckText);
      if (file) formData.append("file", file);
      const res = await api.post<PitchRadarResult>("/agents/pitch-radar/analyze", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Erreur lors de l'analyse. Réessayez.");
    } finally { setLoading(false); }
  }

  function buildText() {
    if (!result) return "";
    return [
      `PITCH RADAR — ${result.startup_name}`, `Score global : ${result.score_global}/10`, "",
      "SCORES :", ...result.scores.map((s) => `${s.label} : ${s.score}/10 — ${s.note}`), "",
      "POINTS FORTS :", ...result.points_forts.map((f) => `• ${f}`), "",
      "POINTS D'ALERTE :", ...result.points_alerte.map((a) => `• ${a}`), "",
      "QUESTIONS :", ...result.questions_suggerees.map((q) => `• ${q}`), "",
      "RECOMMANDATION :", result.recommandation,
    ].join("\n");
  }

  function copyReport() {
    navigator.clipboard.writeText(buildText()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function downloadPDF() {
    if (!result) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const scoresHtml = result.scores.map((s) => `<div class="score-row"><span class="label">${s.label}</span><span class="score" style="color:${s.score>=7?"#16A34A":s.score>=5?"#D97706":"#DC2626"}">${s.score}/10</span></div><p class="note">${s.note}</p>`).join("");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pitch Radar — ${result.startup_name}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;color:#111;line-height:1.7;padding:0 20px}
    h1{font-size:22px;font-weight:700}h2{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#0891b2;margin:24px 0 8px}
    .global{text-align:center;font-size:48px;font-weight:800;color:#0891b2;margin:12px 0 24px}
    .score-row{display:flex;justify-content:space-between}.label{font-weight:600}.score{font-family:monospace;font-weight:700}.note{color:#666;font-size:13px;margin:2px 0 12px}
    ul{padding-left:20px}li{margin-bottom:4px}p{margin:0 0 8px}@media print{body{margin:20px}}</style></head>
    <body><h1>Pitch Radar — ${result.startup_name}</h1>
    <div class="global">${result.score_global.toFixed(1)}/10</div>
    <h2>Scores par critère</h2>${scoresHtml}
    <h2>Points forts</h2><ul>${result.points_forts.map((f) => `<li>${f}</li>`).join("")}</ul>
    <h2>Points d'alerte</h2><ul>${result.points_alerte.map((a) => `<li>${a}</li>`).join("")}</ul>
    <h2>Questions investisseur</h2><ul>${result.questions_suggerees.map((q) => `<li>${q}</li>`).join("")}</ul>
    <h2>Recommandation</h2><p>${result.recommandation}</p></body></html>`);
    win.print(); win.close();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <style>{ANIM_STYLE}</style>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChart3 size={22} style={{ color: COLOR }} strokeWidth={1.5} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>Pitch Radar</h2>
          <p style={{ fontSize: 13, color: "#4a4a6a" }}>Analysez un pitch startup — score par dimension, forces et recommandations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Form */}
        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20 }}>Données du pitch</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <Label>Nom de la startup *</Label>
              <input type="text" required value={startupName} onChange={(e) => setStartupName(e.target.value)} placeholder="TechVision AI" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <Label>Pitch deck PDF (optionnel)</Label>
              <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderRadius: 10, border: `2px dashed ${file ? COLOR : "#2a2a3a"}`, cursor: "pointer", transition: "border-color 0.15s" }}>
                <Upload size={18} style={{ color: file ? COLOR : "#4a4a6a", flexShrink: 0 }} strokeWidth={1.5} />
                <div>
                  <div style={{ fontSize: 13, color: file ? "#e2e8f0" : "#4a4a6a" }}>{file ? file.name : "Cliquez pour uploader un PDF"}</div>
                  <div style={{ fontSize: 11, color: "#3a3a5a", marginTop: 2 }}>PDF jusqu&apos;à 10 Mo</div>
                </div>
                <input type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#1e1e2e" }} />
              <span style={{ fontSize: 11, color: "#3a3a5a" }}>ou copiez-collez le texte</span>
              <div style={{ flex: 1, height: 1, background: "#1e1e2e" }} />
            </div>
            <div>
              <Label>Contenu du pitch</Label>
              <textarea value={deckText} onChange={(e) => setDeckText(e.target.value)} rows={7}
                placeholder={"Collez ici le contenu du pitch :\n\nProblème : Les PME perdent 40% de temps...\nSolution : Plateforme IA avec 4 agents...\nMarché : 250M$ TAM, croissance 18%/an..."}
                style={{ ...inputStyle, resize: "none", minHeight: 160 }} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <Label>Langue</Label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                <option value="fr">Français</option><option value="en">English</option>
              </select>
            </div>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "#1f1015", border: "1px solid #ef444433", color: "#f87171", fontSize: 13 }}>
                <AlertCircle size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${COLOR}, #0891b2)`, color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: `0 4px 14px ${GLOW}`, transition: "box-shadow 0.15s" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = `0 8px 24px ${GLOW}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 14px ${GLOW}`; }}
            >
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse…</> : <><Sparkles size={15} strokeWidth={1.5} /> Analyser le pitch</>}
            </button>
          </form>
        </Card>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!result && !loading && (
            <Card style={{ minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <BarChart3 size={30} style={{ color: COLOR }} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: 13, color: "#4a4a6a", maxWidth: 260, lineHeight: 1.6 }}>Uploadez un PDF ou collez le contenu du pitch pour obtenir une analyse complète avec score par dimension.</p>
            </Card>
          )}
          {loading && (
            <Card style={{ minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div className="w-10 h-10 rounded-full animate-spin mb-4" style={{ border: `3px solid ${COLOR}22`, borderTopColor: COLOR }} />
              <p style={{ fontSize: 13, color: "#4a4a6a" }}>Analyse du pitch en cours…</p>
            </Card>
          )}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 760, overflowY: "auto", paddingRight: 2 }}>
              {/* Header + score */}
              <Card style={{ animation: "fadeInSection 0.4s ease both" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3a3a5a", marginBottom: 4 }}>{result.radar_id}</div>
                    <h4 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>{result.startup_name}</h4>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={copyReport} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "1px solid #2a2a3a", background: "none", cursor: "pointer", color: "#6a6a8a", fontSize: 11 }}>
                      {copied ? <><Check size={11} style={{ color: "#10b981" }} /> Copié</> : <><Copy size={11} strokeWidth={1.5} /> Copier</>}
                    </button>
                    <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "1px solid #2a2a3a", background: "none", cursor: "pointer", color: "#6a6a8a", fontSize: 11 }}>
                      <Download size={11} strokeWidth={1.5} /> PDF
                    </button>
                  </div>
                </div>
                <GlobalScore score={result.score_global} />
              </Card>

              {result.scores?.length > 0 && (
                <Card style={{ animation: "fadeInSection 0.4s ease both", animationDelay: "100ms" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR, marginBottom: 14 }}>Scores par critère</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {result.scores.map((s) => (
                      <div key={s.key}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{s.label}</span>
                          <span style={{ fontSize: 11, color: "#4a4a6a" }}>{Math.round(s.weight * 100)}%</span>
                        </div>
                        <ScoreBar score={s.score} />
                        {s.note && <p style={{ fontSize: 12, color: "#4a4a6a", marginTop: 4, lineHeight: 1.5 }}>{s.note}</p>}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {(result.points_forts?.length > 0 || result.points_alerte?.length > 0) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, animation: "fadeInSection 0.4s ease both", animationDelay: "200ms" }}>
                  {result.points_forts?.length > 0 && (
                    <Card style={{ padding: "18px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#10b981", marginBottom: 10 }}>Points forts</div>
                      <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {result.points_forts.map((f, i) => <li key={i} style={{ fontSize: 12, color: "#94a3b8", display: "flex", gap: 6 }}><span style={{ color: "#10b981" }}>✓</span>{f}</li>)}
                      </ul>
                    </Card>
                  )}
                  {result.points_alerte?.length > 0 && (
                    <Card style={{ padding: "18px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f59e0b", marginBottom: 10 }}>Points d&apos;alerte</div>
                      <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {result.points_alerte.map((a, i) => <li key={i} style={{ fontSize: 12, color: "#94a3b8", display: "flex", gap: 6 }}><span style={{ color: "#f59e0b" }}>⚠</span>{a}</li>)}
                      </ul>
                    </Card>
                  )}
                </div>
              )}

              {result.questions_suggerees?.length > 0 && (
                <Card style={{ animation: "fadeInSection 0.4s ease both", animationDelay: "300ms" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR, marginBottom: 12 }}>Questions pour l&apos;investisseur</div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.questions_suggerees.map((q, i) => (
                      <li key={i} style={{ fontSize: 13, color: "#94a3b8", display: "flex", gap: 10 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#3a3a5a", flexShrink: 0, marginTop: 1 }}>Q{i + 1}</span>{q}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {result.recommandation && (
                <div style={{ borderRadius: 14, border: `1px solid ${COLOR}33`, padding: "16px 18px", background: `${COLOR}08`, animation: "fadeInSection 0.4s ease both", animationDelay: "400ms" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR, marginBottom: 6 }}>Recommandation</div>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{result.recommandation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
