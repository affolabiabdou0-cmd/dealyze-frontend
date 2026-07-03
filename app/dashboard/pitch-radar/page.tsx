"use client";

import { useState } from "react";
import { BarChart3, Copy, Check, AlertCircle, Sparkles, Upload, Download, TrendingUp, AlertTriangle, HelpCircle, Star } from "lucide-react";
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
const ANIM_STYLE = `
  @keyframes fadeInSection { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeInFast { from { opacity:0; } to { opacity:1; } }
  @keyframes growBar { from { width:0; } to { width:var(--w); } }
`;

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

function scoreColor(s: number) { return s >= 7 ? "#10b981" : s >= 5 ? "#f59e0b" : "#ef4444"; }

function GlobalScore({ score }: { score: number }) {
  const col = scoreColor(score);
  const pct = score * 25.1;
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="10" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={col} strokeWidth="10"
            strokeDasharray={`${pct} 251`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 30, fontWeight: 800, fontFamily: "monospace", color: col }}>{score.toFixed(1)}</span>
          <span style={{ fontSize: 11, color: "#4a4a6a" }}>/10</span>
        </div>
      </div>
    </div>
  );
}

function recoConfig(r: string) {
  if (r === "À investir" || r === "To invest")
    return { color: "#10b981", bg: "#10b98115", border: "#10b98133", icon: "✅" };
  if (r === "À passer" || r === "To pass")
    return { color: "#ef4444", bg: "#ef444415", border: "#ef444433", icon: "❌" };
  return { color: "#f59e0b", bg: "#f59e0b15", border: "#f59e0b33", icon: "⚠️" };
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
    setError(""); setLoading(true); setResult(null);
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
      "POINTS FORTS :", ...result.points_forts.map((f) => `✓ ${f}`), "",
      "POINTS D'ALERTE :", ...result.points_alerte.map((a) => `⚠ ${a}`), "",
      "QUESTIONS :", ...result.questions_suggerees.map((q, i) => `Q${i+1}. ${q}`), "",
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
    const rc = recoConfig(result.recommandation);
    const col = scoreColor(result.score_global);

    const barsHtml = result.scores.map((s) => {
      const sc = scoreColor(s.score);
      const pct = Math.round(s.score * 10);
      return `<div class="score-item">
        <div class="score-top">
          <span class="score-label">${s.label}</span>
          <div class="score-right">
            <span class="score-weight">${Math.round(s.weight*100)}%</span>
            <span class="score-num" style="color:${sc}">${s.score}/10</span>
          </div>
        </div>
        <div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:${sc}"></div></div>
        ${s.note ? `<p class="score-note">${s.note}</p>` : ""}
      </div>`;
    }).join("");

    win.document.write(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Pitch Radar — ${result.startup_name}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;background:#fff;line-height:1.7}
.page{max-width:794px;margin:0 auto;padding:48px 56px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #f0f0f8}
.logo{font-size:20px;font-weight:800;color:#0891b2}.logo span{color:#1a1a2e}
.meta-right{text-align:right}.radar-id{font-family:monospace;font-size:11px;color:#9090b0;margin-bottom:4px}.radar-date{font-size:12px;color:#555}
.title-block{margin-bottom:28px}
h1{font-size:26px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px;margin-bottom:4px}
.subtitle{font-size:14px;color:#0891b2;font-weight:600}
.score-hero{display:flex;align-items:center;gap:32px;padding:24px;background:#f0fdff;border-radius:16px;border:1px solid #a5f3fc;margin-bottom:32px}
.score-circle{text-align:center;flex-shrink:0}
.score-big{font-size:52px;font-weight:800;color:${col};font-family:monospace;line-height:1}
.score-denom{font-size:16px;color:#9090b0;font-weight:400}
.score-desc{flex:1}
.score-desc h2{font-size:16px;font-weight:700;color:#1a1a2e;margin-bottom:8px}
.score-desc p{font-size:13px;color:#555;line-height:1.6}
.reco-box{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:20px;background:${rc.bg};border:1px solid ${rc.border};color:${rc.color};font-size:13px;font-weight:700;margin-top:12px}
.section-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#0891b2;margin-bottom:16px;margin-top:28px;padding-bottom:8px;border-bottom:1px solid #f0f0f8}
.score-item{margin-bottom:18px}
.score-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.score-label{font-size:13px;font-weight:600;color:#1a1a2e}
.score-right{display:flex;align-items:center;gap:12px}
.score-weight{font-size:11px;color:#9090b0}.score-num{font-family:monospace;font-size:13px;font-weight:700}
.bar-bg{height:6px;background:#f0f0f8;border-radius:4px;overflow:hidden;margin-bottom:4px}
.bar-fill{height:100%;border-radius:4px}
.score-note{font-size:12px;color:#666;line-height:1.5}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:8px}
.col-box{padding:16px;border-radius:10px}
.col-box.green{background:#f0fdf4;border:1px solid #86efac}
.col-box.amber{background:#fffbeb;border:1px solid #fcd34d}
.col-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px}
.col-box.green .col-title{color:#16a34a}.col-box.amber .col-title{color:#d97706}
.col-box ul{list-style:none;padding:0;display:flex;flex-direction:column;gap:6px}
.col-box li{font-size:12.5px;color:#333;display:flex;gap:8px;align-items:flex-start}
.col-box.green li::before{content:"✓";color:#16a34a;font-weight:700;flex-shrink:0}
.col-box.amber li::before{content:"⚠";color:#d97706;flex-shrink:0}
.q-list{display:flex;flex-direction:column;gap:10px}
.q-item{display:flex;gap:12px;align-items:flex-start}
.q-num{font-family:monospace;font-size:11px;color:#9090b0;flex-shrink:0;margin-top:2px;background:#f8fafc;padding:2px 6px;border-radius:4px}
.q-text{font-size:13px;color:#333;line-height:1.6}
.footer{margin-top:40px;padding-top:20px;border-top:2px solid #f0f0f8;display:flex;justify-content:space-between;align-items:center}
.footer-left{font-size:11px;color:#9090b0;line-height:1.6}
.footer-badge{background:#0891b2;color:#fff;font-size:11px;font-weight:700;padding:6px 16px;border-radius:8px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:24px 32px}}
</style></head><body>
<div class="page">
  <div class="header">
    <div class="logo">Pitch<span>Radar</span> <span style="font-size:13px;color:#9090b0;font-weight:400">by Dealyze</span></div>
    <div class="meta-right">
      <div class="radar-id">${result.radar_id}</div>
      <div class="radar-date">Analysé le ${new Date(result.generated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
    </div>
  </div>

  <div class="title-block">
    <h1>Rapport d'analyse — ${result.startup_name}</h1>
    <div class="subtitle">Scoring VC par critères pondérés · Dealyze AI</div>
  </div>

  <div class="score-hero">
    <div class="score-circle">
      <div class="score-big">${result.score_global.toFixed(1)}<span class="score-denom">/10</span></div>
      <div style="font-size:12px;color:#9090b0;margin-top:4px">Score global</div>
    </div>
    <div class="score-desc">
      <h2>${result.startup_name}</h2>
      <p>Analyse basée sur 8 critères VC pondérés : équipe, marché, traction, modèle économique, solution, problème, concurrence et demande de financement.</p>
      <div class="reco-box">${rc.icon} ${result.recommandation}</div>
    </div>
  </div>

  <div class="section-title">Scores par critère</div>
  ${barsHtml}

  <div class="section-title">Synthèse analytique</div>
  <div class="two-col">
    <div class="col-box green">
      <div class="col-title">Points forts</div>
      <ul>${result.points_forts.map((f) => `<li>${f}</li>`).join("")}</ul>
    </div>
    <div class="col-box amber">
      <div class="col-title">Points d'alerte</div>
      <ul>${result.points_alerte.map((a) => `<li>${a}</li>`).join("")}</ul>
    </div>
  </div>

  <div class="section-title">Questions à poser au fondateur</div>
  <div class="q-list">
    ${result.questions_suggerees.map((q, i) => `<div class="q-item"><span class="q-num">Q${i+1}</span><span class="q-text">${q}</span></div>`).join("")}
  </div>

  <div class="footer">
    <div class="footer-left">Document généré par Dealyze Pitch Radar IA · ${new Date().getFullYear()}<br>Rapport confidentiel · Usage investisseur uniquement</div>
    <div class="footer-badge">Dealyze · XPRIZE 2026</div>
  </div>
</div></body></html>`);
    setTimeout(() => { win.print(); }, 300);
  }

  const rc = result ? recoConfig(result.recommandation) : null;

  return (
    <div className="max-w-6xl mx-auto">
      <style>{ANIM_STYLE}</style>
      <div className="flex items-center gap-3 mb-6">
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChart3 size={22} style={{ color: COLOR }} strokeWidth={1.5} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>Pitch Radar</h2>
          <p style={{ fontSize: 13, color: "#4a4a6a" }}>Score VC par dimension · Forces · Recommandation investisseur</p>
        </div>
      </div>

      <div className={result ? "block" : "grid lg:grid-cols-2 gap-5"}>
        {/* FORM */}
        {!result && (
          <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 16, padding: 24 }}>
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
                <span style={{ fontSize: 11, color: "#3a3a5a" }}>ou collez le texte</span>
                <div style={{ flex: 1, height: 1, background: "#1e1e2e" }} />
              </div>
              <div>
                <Label>Contenu du pitch</Label>
                <textarea value={deckText} onChange={(e) => setDeckText(e.target.value)} rows={7}
                  placeholder={"Problème : Les PME perdent 40% de temps...\nSolution : Plateforme IA avec 4 agents...\nMarché : 250M$ TAM, croissance 18%/an..."}
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
                style={{ width: "100%", padding: "14px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${COLOR},#0891b2)`, color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: `0 4px 14px ${GLOW}`, transition: "box-shadow 0.15s" }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = `0 8px 24px ${GLOW}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 14px ${GLOW}`; }}
              >
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse…</> : <><Sparkles size={15} strokeWidth={1.5} /> Analyser le pitch</>}
              </button>
            </form>
          </div>
        )}

        {loading && !result && (
          <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
            <div className="w-10 h-10 rounded-full animate-spin mb-4" style={{ border: `3px solid ${COLOR}22`, borderTopColor: COLOR }} />
            <p style={{ fontSize: 13, color: "#4a4a6a" }}>Analyse du pitch en cours…</p>
          </div>
        )}
        {!result && !loading && (
          <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <BarChart3 size={30} style={{ color: COLOR }} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 13, color: "#4a4a6a", maxWidth: 260, lineHeight: 1.6 }}>Uploadez un PDF ou collez le contenu pour obtenir un score VC complet avec recommandation.</p>
          </div>
        )}

        {/* RESULT */}
        {result && rc && (
          <div style={{ animation: "fadeInFast 0.4s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={() => { setResult(null); setError(""); setFile(null); setDeckText(""); }}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #2a2a3a", background: "none", cursor: "pointer", color: "#6a6a8a", fontSize: 12, fontWeight: 600 }}>
                ← Nouvelle analyse
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copyReport} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, border: "1px solid #2a2a3a", background: "none", cursor: "pointer", color: "#6a6a8a", fontSize: 12 }}>
                  {copied ? <><Check size={12} style={{ color: "#10b981" }} /> Copié</> : <><Copy size={12} strokeWidth={1.5} /> Copier</>}
                </button>
                <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: `linear-gradient(135deg,${COLOR},#0891b2)`, cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 2px 8px ${GLOW}` }}>
                  <Download size={12} strokeWidth={1.5} /> Télécharger PDF
                </button>
              </div>
            </div>

            <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 20, overflow: "hidden" }}>
              {/* Hero header */}
              <div style={{ background: `linear-gradient(135deg,${COLOR}18,#1a1a24)`, borderBottom: "1px solid #2a2a3a", padding: "28px 32px", animation: "fadeInSection 0.4s ease both" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                  <GlobalScore score={result.score_global} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3a3a5a", marginBottom: 6 }}>{result.radar_id}</div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 8 }}>{result.startup_name}</h3>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 20, background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color, fontSize: 13, fontWeight: 700 }}>
                      {rc.icon} {result.recommandation}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", background: `linear-gradient(135deg,${COLOR},#0891b2)`, cursor: "pointer", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                      <Download size={11} strokeWidth={1.5} /> PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Scores */}
              {result.scores?.length > 0 && (
                <div style={{ padding: "24px 32px", borderBottom: "1px solid #1e1e2e", animation: "fadeInSection 0.4s ease both", animationDelay: "80ms" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${COLOR}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BarChart3 size={13} style={{ color: COLOR }} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR }}>Scores par critère</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {result.scores.map((s) => {
                      const col = scoreColor(s.score);
                      return (
                        <div key={s.key}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{s.label}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 10, color: "#3a3a5a" }}>{Math.round(s.weight*100)}%</span>
                              <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: col }}>{s.score}/10</span>
                            </div>
                          </div>
                          <div style={{ height: 5, borderRadius: 4, background: "#2a2a3a", overflow: "hidden", marginBottom: 4 }}>
                            <div style={{ height: "100%", width: `${s.score * 10}%`, borderRadius: 4, background: col, transition: "width 0.8s ease" }} />
                          </div>
                          {s.note && <p style={{ fontSize: 11, color: "#4a4a6a", lineHeight: 1.5 }}>{s.note}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Forces & Alertes */}
              {(result.points_forts?.length > 0 || result.points_alerte?.length > 0) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderBottom: "1px solid #1e1e2e", animation: "fadeInSection 0.4s ease both", animationDelay: "160ms" }}>
                  {result.points_forts?.length > 0 && (
                    <div style={{ padding: "24px 32px", borderRight: "1px solid #1e1e2e" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#10b98115", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <TrendingUp size={13} style={{ color: "#10b981" }} strokeWidth={1.5} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#10b981" }}>Points forts</span>
                      </div>
                      <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {result.points_forts.map((f, i) => (
                          <li key={i} style={{ fontSize: 12.5, color: "#94a3b8", display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <Check size={12} style={{ color: "#10b981", flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.points_alerte?.length > 0 && (
                    <div style={{ padding: "24px 32px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f59e0b15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <AlertTriangle size={13} style={{ color: "#f59e0b" }} strokeWidth={1.5} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f59e0b" }}>Points d&apos;alerte</span>
                      </div>
                      <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {result.points_alerte.map((a, i) => (
                          <li key={i} style={{ fontSize: 12.5, color: "#94a3b8", display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <AlertTriangle size={12} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }} strokeWidth={2} />{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Questions */}
              {result.questions_suggerees?.length > 0 && (
                <div style={{ padding: "24px 32px", borderBottom: "1px solid #1e1e2e", animation: "fadeInSection 0.4s ease both", animationDelay: "240ms" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${COLOR}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <HelpCircle size={13} style={{ color: COLOR }} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR }}>Questions à poser au fondateur</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {result.questions_suggerees.map((q, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: `${COLOR}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: COLOR }}>Q{i+1}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommandation */}
              {result.recommandation && (
                <div style={{ padding: "24px 32px", borderBottom: "1px solid #1e1e2e", animation: "fadeInSection 0.4s ease both", animationDelay: "320ms" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${rc.bg}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Star size={13} style={{ color: rc.color }} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: rc.color }}>Recommandation finale</span>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 12, background: rc.bg, border: `1px solid ${rc.border}`, fontSize: 15, fontWeight: 800, color: rc.color }}>
                    {rc.icon} {result.recommandation}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: "20px 32px", background: "#0f0f13", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 11, color: "#3a3a5a" }}>Rapport généré par Dealyze Pitch Radar IA · XPRIZE 2026</p>
                <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${COLOR},#0891b2)`, cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 4px 14px ${GLOW}` }}>
                  <Download size={13} strokeWidth={1.5} /> Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
