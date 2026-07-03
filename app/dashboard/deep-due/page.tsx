"use client";

import { useState } from "react";
import { Shield, Copy, Check, AlertCircle, Sparkles, Download, User, Building2, AlertTriangle, CheckCircle2, XCircle, FileSearch } from "lucide-react";
import { api } from "../../lib/api";

interface RiskItem { level: string; description: string; }
interface FounderProfile { resume: string; experience: string; reputation: string; signaux_positifs: string[]; signaux_negatifs: string[]; }
interface CompanyAnalysis { resume: string; structure: string; position_marche: string; concurrents: string[]; risques: string[]; }
interface DeepDueResult {
  due_id: string; company_name: string; founder_name: string; generated_at: string;
  score_confiance: number; synthese_executive: string;
  profil_fondateur: FounderProfile; analyse_entreprise: CompanyAnalysis;
  risques_identifies: RiskItem[]; recommandation_finale: string;
}

const COLOR = "#10b981";
const GLOW  = "rgba(16,185,129,0.25)";

const ANIM_STYLE = `
  @keyframes fadeInSection { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeInFast { from { opacity:0; } to { opacity:1; } }
`;

const RISK_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  élevé:  { bg: "#fef2f2", color: "#ef4444", label: "Élevé"  },
  high:   { bg: "#fef2f2", color: "#ef4444", label: "Élevé"  },
  moyen:  { bg: "#fffbeb", color: "#f59e0b", label: "Moyen"  },
  medium: { bg: "#fffbeb", color: "#f59e0b", label: "Moyen"  },
  faible: { bg: "#f0fdf4", color: "#10b981", label: "Faible" },
  low:    { bg: "#f0fdf4", color: "#10b981", label: "Faible" },
};

function recoConfig(r: string) {
  if (r === "Investir" || r === "Invest")
    return { color: "#10b981", bg: "#f0fdf4", border: "#86efac", icon: "✅" };
  if (r === "Ne pas investir" || r === "Do not invest")
    return { color: "#ef4444", bg: "#fef2f2", border: "#fca5a5", icon: "❌" };
  return { color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d", icon: "⚠️" };
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 9,
  border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#0f172a",
  fontSize: 14, outline: "none", transition: "border-color 0.15s, background 0.15s", boxSizing: "border-box",
};
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.target.style.borderColor = COLOR; e.target.style.background = "#fff"; };
const onBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; };

const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>{children}</label>
);

const CARD: React.CSSProperties = {
  background: "#ffffff", border: "1px solid #e2e8f0",
  borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

export default function DeepDuePage() {
  const [form, setForm]       = useState({ company_name: "", founder_name: "", context: "", language: "fr" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<DeepDueResult | null>(null);
  const [copied, setCopied]   = useState(false);

  function set(f: string, v: string) { setForm((p) => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true); setResult(null);
    try {
      const res = await api.post<DeepDueResult>("/agents/deep-due", form);
      setResult(res.data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Erreur lors de l'analyse. Réessayez.");
    } finally { setLoading(false); }
  }

  function buildText() {
    if (!result) return "";
    return [
      `DUE DILIGENCE — ${result.company_name}`,
      `Fondateur : ${result.founder_name}`,
      `Score de confiance : ${result.score_confiance}/10`,
      `Recommandation : ${result.recommandation_finale}`, "",
      "SYNTHÈSE EXÉCUTIVE :", result.synthese_executive, "",
      "PROFIL FONDATEUR :", result.profil_fondateur?.resume, result.profil_fondateur?.experience, "",
      "SIGNAUX POSITIFS :", ...(result.profil_fondateur?.signaux_positifs ?? []).map((s) => `+ ${s}`), "",
      "SIGNAUX NÉGATIFS :", ...(result.profil_fondateur?.signaux_negatifs ?? []).map((s) => `− ${s}`), "",
      "ANALYSE ENTREPRISE :", result.analyse_entreprise?.resume, "",
      "POSITION MARCHÉ :", result.analyse_entreprise?.position_marche, "",
      "CONCURRENTS :", ...(result.analyse_entreprise?.concurrents ?? []).map((c) => `• ${c}`), "",
      "RISQUES IDENTIFIÉS :", ...result.risques_identifies.map((r) => `[${r.level.toUpperCase()}] ${r.description}`),
    ].join("\n");
  }

  function copyReport() {
    navigator.clipboard.writeText(buildText()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function downloadPDF() {
    if (!result) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const rc = recoConfig(result.recommandation_finale);
    const confPct = Math.round(result.score_confiance * 10);
    const confCol = result.score_confiance >= 7 ? "#10b981" : result.score_confiance >= 5 ? "#f59e0b" : "#ef4444";

    const risksHtml = result.risques_identifies.map((r) => {
      const rs = RISK_STYLE[r.level.toLowerCase()] ?? RISK_STYLE.moyen;
      return `<div class="risk-item" style="border-left:3px solid ${rs.color}"><span class="risk-badge" style="background:${rs.bg};color:${rs.color}">${rs.label}</span><p class="risk-desc">${r.description}</p></div>`;
    }).join("");

    win.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Due Diligence — ${result.company_name}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;background:#fff;line-height:1.7}
.page{max-width:794px;margin:0 auto;padding:48px 56px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #f0f0f8}
.logo{font-size:20px;font-weight:800;color:#059669}.logo span{color:#1a1a2e}
.meta-right{text-align:right}.due-id{font-family:monospace;font-size:11px;color:#9090b0;margin-bottom:4px}.due-date{font-size:12px;color:#555}
h1{font-size:26px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px;margin-bottom:4px}.subtitle{font-size:14px;color:#059669;font-weight:600;margin-bottom:24px}
.hero{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px}
.hero-card{padding:20px;border-radius:12px;border:1px solid #e2e8f0}.hero-card.reco{background:${rc.bg};border-color:${rc.border}}
.hero-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9090b0;margin-bottom:8px}
.reco-text{font-size:20px;font-weight:800;color:${rc.color}}
.conf-bar-bg{height:8px;background:#f0f0f8;border-radius:4px;overflow:hidden;margin:10px 0 4px}
.conf-bar-fill{height:100%;width:${confPct}%;background:${confCol};border-radius:4px}
.conf-num{font-size:22px;font-weight:800;color:${confCol};font-family:monospace}
.section-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#059669;margin:28px 0 14px;padding-bottom:8px;border-bottom:1px solid #f0f0f8}
.prose{font-size:13.5px;color:#333;line-height:1.8;margin-bottom:8px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:8px}
.signal-box{padding:14px;border-radius:10px}
.signal-box.pos{background:#f0fdf4;border:1px solid #86efac}.signal-box.neg{background:#fef2f2;border:1px solid #fca5a5}
.signal-title{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
.signal-box.pos .signal-title{color:#16a34a}.signal-box.neg .signal-title{color:#dc2626}
.signal-box ul{list-style:none;display:flex;flex-direction:column;gap:6px}
.signal-box li{font-size:12.5px;color:#333;display:flex;gap:8px;align-items:flex-start}
.signal-box.pos li::before{content:"+";color:#16a34a;font-weight:700;flex-shrink:0}
.signal-box.neg li::before{content:"−";color:#dc2626;font-weight:700;flex-shrink:0}
.tag-list{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.tag{font-size:11px;padding:4px 10px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0;color:#555}
.risk-item{padding:12px 14px 12px 16px;border-radius:8px;margin-bottom:8px;background:#fafafa;display:flex;gap:12px;align-items:flex-start}
.risk-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;flex-shrink:0;margin-top:2px}
.risk-desc{font-size:13px;color:#333;line-height:1.6}
.footer{margin-top:40px;padding-top:20px;border-top:2px solid #f0f0f8;display:flex;justify-content:space-between;align-items:center}
.footer-left{font-size:11px;color:#9090b0;line-height:1.6}.footer-badge{background:#059669;color:#fff;font-size:11px;font-weight:700;padding:6px 16px;border-radius:8px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:24px 32px}}
</style></head><body><div class="page">
<div class="header"><div class="logo">Deep<span>Due</span> <span style="font-size:13px;color:#9090b0;font-weight:400">by Dealyze</span></div><div class="meta-right"><div class="due-id">${result.due_id}</div><div class="due-date">Analysé le ${new Date(result.generated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div></div></div>
<h1>Due Diligence — ${result.company_name}</h1>
<div class="subtitle">${result.founder_name ? `Fondateur : ${result.founder_name}` : "Analyse entreprise"}</div>
<div class="hero">
  <div class="hero-card reco"><div class="hero-label">Recommandation finale</div><div class="reco-text">${rc.icon} ${result.recommandation_finale}</div></div>
  <div class="hero-card"><div class="hero-label">Score de confiance données</div><div class="conf-num">${result.score_confiance}<span style="font-size:14px;color:#9090b0">/10</span></div><div class="conf-bar-bg"><div class="conf-bar-fill"></div></div><div style="font-size:11px;color:#9090b0">Qualité et quantité des données disponibles</div></div>
</div>
${result.synthese_executive ? `<div class="section-title">Synthèse exécutive</div><p class="prose">${result.synthese_executive}</p>` : ""}
${result.profil_fondateur ? `<div class="section-title">Profil fondateur</div>
${result.profil_fondateur.resume ? `<p class="prose">${result.profil_fondateur.resume}</p>` : ""}
${result.profil_fondateur.experience ? `<p class="prose"><strong>Expérience :</strong> ${result.profil_fondateur.experience}</p>` : ""}
${(result.profil_fondateur.signaux_positifs?.length || result.profil_fondateur.signaux_negatifs?.length) ? `<div class="two-col" style="margin-top:12px"><div class="signal-box pos"><div class="signal-title">Signaux positifs</div><ul>${(result.profil_fondateur.signaux_positifs ?? []).map((s) => `<li>${s}</li>`).join("")}</ul></div><div class="signal-box neg"><div class="signal-title">Signaux négatifs</div><ul>${(result.profil_fondateur.signaux_negatifs ?? []).map((s) => `<li>${s}</li>`).join("")}</ul></div></div>` : ""}` : ""}
${result.analyse_entreprise ? `<div class="section-title">Analyse entreprise</div>
${result.analyse_entreprise.resume ? `<p class="prose">${result.analyse_entreprise.resume}</p>` : ""}
${result.analyse_entreprise.structure ? `<p class="prose"><strong>Structure :</strong> ${result.analyse_entreprise.structure}</p>` : ""}
${result.analyse_entreprise.position_marche ? `<p class="prose"><strong>Position marché :</strong> ${result.analyse_entreprise.position_marche}</p>` : ""}
${result.analyse_entreprise.concurrents?.length ? `<p class="prose"><strong>Concurrents :</strong></p><div class="tag-list">${result.analyse_entreprise.concurrents.map((c) => `<span class="tag">${c}</span>`).join("")}</div>` : ""}` : ""}
${result.risques_identifies?.length ? `<div class="section-title">Risques identifiés</div>${risksHtml}` : ""}
<div class="footer"><div class="footer-left">Document généré par Dealyze Deep Due IA · ${new Date().getFullYear()}<br>Rapport confidentiel — Usage investisseur uniquement</div><div class="footer-badge">Dealyze · XPRIZE 2026</div></div>
</div></body></html>`);
    setTimeout(() => { win.print(); }, 300);
  }

  const rc = result ? recoConfig(result.recommandation_finale) : null;

  return (
    <div className="max-w-6xl mx-auto">
      <style>{ANIM_STYLE}</style>

      <div className="flex items-center gap-3 mb-6">
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield size={22} style={{ color: COLOR }} strokeWidth={1.75} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>Deep Due</h2>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>Due diligence automatisée · Profil fondateur · Cartographie des risques</p>
        </div>
      </div>

      <div className={result ? "block" : "grid lg:grid-cols-2 gap-5"}>
        {/* FORM */}
        {!result && (
          <div style={{ ...CARD, padding: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 20 }}>Cible de la due diligence</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><Label>Nom de l&apos;entreprise *</Label>
                <input type="text" required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="TechVision AI" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div><Label>Nom du fondateur</Label>
                <input type="text" value={form.founder_name} onChange={(e) => set("founder_name", e.target.value)} placeholder="Kofi Mensah" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div><Label>Informations disponibles</Label>
                <textarea value={form.context} onChange={(e) => set("context", e.target.value)}
                  placeholder={"Collez ici toutes les informations :\nLinkedIn, Crunchbase, articles de presse, données financières...\n\nPlus vous fournissez d'informations, plus l'analyse sera précise."}
                  rows={7} style={{ ...inputStyle, resize: "none", minHeight: 160 }} onFocus={onFocus} onBlur={onBlur} />
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Optionnel. Sans contexte, l&apos;analyse se base sur les informations publiques connues.</p>
              </div>
              <div><Label>Langue du rapport</Label>
                <select value={form.language} onChange={(e) => set("language", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="fr">Français</option><option value="en">English</option>
                </select>
              </div>
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13 }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "13px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${COLOR},#059669)`, color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: `0 4px 14px ${GLOW}` }}>
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse en cours…</> : <><Sparkles size={15} strokeWidth={1.75} /> Lancer la due diligence</>}
              </button>
            </form>
          </div>
        )}

        {loading && !result && (
          <div style={{ ...CARD, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
            <div className="w-10 h-10 rounded-full animate-spin mb-4" style={{ border: "3px solid #f0fdf4", borderTopColor: COLOR }} />
            <p style={{ fontSize: 13, color: "#64748b" }}>Due diligence en cours…</p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Cela peut prendre 30 à 60 secondes</p>
          </div>
        )}
        {!result && !loading && (
          <div style={{ ...CARD, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Shield size={30} style={{ color: COLOR }} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", maxWidth: 250, lineHeight: 1.6 }}>Entrez le nom d&apos;une entreprise pour lancer une due diligence complète avec cartographie des risques.</p>
          </div>
        )}

        {/* RESULT */}
        {result && rc && (
          <div style={{ animation: "fadeInFast 0.4s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={() => { setResult(null); setError(""); }}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#64748b", fontSize: 12, fontWeight: 600 }}>
                ← Nouvelle analyse
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copyReport} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#64748b", fontSize: 12 }}>
                  {copied ? <><Check size={12} style={{ color: "#10b981" }} /> Copié</> : <><Copy size={12} strokeWidth={1.75} /> Copier</>}
                </button>
                <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: `linear-gradient(135deg,${COLOR},#059669)`, cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 2px 8px ${GLOW}` }}>
                  <Download size={12} strokeWidth={1.75} /> Télécharger PDF
                </button>
              </div>
            </div>

            <div style={{ ...CARD, overflow: "hidden" }}>
              {/* Hero header */}
              <div style={{ background: "linear-gradient(135deg, #f0fdf4, #f7fffe)", borderBottom: "1px solid #86efac", padding: "28px 32px", animation: "fadeInSection 0.4s ease both" }}>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{result.due_id}</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", marginBottom: 4 }}>Due Diligence — {result.company_name}</h3>
                {result.founder_name && <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Fondateur : {result.founder_name}</p>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                  <div style={{ padding: "14px 16px", borderRadius: 12, background: rc.bg, border: `1px solid ${rc.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: rc.color, marginBottom: 6 }}>Recommandation</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: rc.color }}>{rc.icon} {result.recommandation_finale}</div>
                  </div>
                  <div style={{ padding: "14px 16px", borderRadius: 12, background: "#fff", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>Score de confiance</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 4, background: "#e2e8f0", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${result.score_confiance * 10}%`, borderRadius: 4, background: COLOR, transition: "width 1s ease" }} />
                      </div>
                      <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{result.score_confiance}/10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Synthèse */}
              {result.synthese_executive && (
                <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", animation: "fadeInSection 0.4s ease both", animationDelay: "80ms" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileSearch size={13} style={{ color: COLOR }} strokeWidth={1.75} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR }}>Synthèse exécutive</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75, paddingLeft: 36 }}>{result.synthese_executive}</p>
                </div>
              )}

              {/* Profil fondateur */}
              {result.profil_fondateur && (
                <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", animation: "fadeInSection 0.4s ease both", animationDelay: "160ms" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={13} style={{ color: COLOR }} strokeWidth={1.75} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR }}>Profil fondateur</span>
                  </div>
                  <div style={{ paddingLeft: 36 }}>
                    {result.profil_fondateur.resume && <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, marginBottom: 10 }}>{result.profil_fondateur.resume}</p>}
                    {result.profil_fondateur.experience && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Expérience</div>
                        <p style={{ fontSize: 13, color: "#334155" }}>{result.profil_fondateur.experience}</p>
                      </div>
                    )}
                    {(result.profil_fondateur.signaux_positifs?.length > 0 || result.profil_fondateur.signaux_negatifs?.length > 0) && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                        {result.profil_fondateur.signaux_positifs?.length > 0 && (
                          <div style={{ padding: "12px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #86efac" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                              <CheckCircle2 size={12} style={{ color: "#10b981" }} strokeWidth={2} />
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em" }}>Signaux positifs</span>
                            </div>
                            {result.profil_fondateur.signaux_positifs.map((s, i) => (
                              <div key={i} style={{ fontSize: 12, color: "#334155", display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: "#10b981", flexShrink: 0 }}>+</span>{s}</div>
                            ))}
                          </div>
                        )}
                        {result.profil_fondateur.signaux_negatifs?.length > 0 && (
                          <div style={{ padding: "12px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fca5a5" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                              <XCircle size={12} style={{ color: "#ef4444" }} strokeWidth={2} />
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em" }}>Signaux négatifs</span>
                            </div>
                            {result.profil_fondateur.signaux_negatifs.map((s, i) => (
                              <div key={i} style={{ fontSize: 12, color: "#334155", display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: "#ef4444", flexShrink: 0 }}>−</span>{s}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Analyse entreprise */}
              {result.analyse_entreprise && (
                <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", animation: "fadeInSection 0.4s ease both", animationDelay: "240ms" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Building2 size={13} style={{ color: COLOR }} strokeWidth={1.75} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR }}>Analyse entreprise</span>
                  </div>
                  <div style={{ paddingLeft: 36 }}>
                    {result.analyse_entreprise.resume && <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, marginBottom: 10 }}>{result.analyse_entreprise.resume}</p>}
                    {result.analyse_entreprise.position_marche && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Position marché</div>
                        <p style={{ fontSize: 13, color: "#334155" }}>{result.analyse_entreprise.position_marche}</p>
                      </div>
                    )}
                    {result.analyse_entreprise.concurrents?.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>Concurrents</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {result.analyse_entreprise.concurrents.map((c, i) => (
                            <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b" }}>{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Risques */}
              {result.risques_identifies?.length > 0 && (
                <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", animation: "fadeInSection 0.4s ease both", animationDelay: "320ms" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <AlertTriangle size={13} style={{ color: "#ef4444" }} strokeWidth={1.75} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ef4444" }}>Risques identifiés</span>
                  </div>
                  <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.risques_identifies.map((risk, i) => {
                      const rs = RISK_STYLE[risk.level.toLowerCase()] ?? RISK_STYLE.moyen;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, background: rs.bg, borderLeft: `3px solid ${rs.color}`, border: `1px solid ${rs.color}33` }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: rs.bg, color: rs.color, flexShrink: 0, marginTop: 2, border: `1px solid ${rs.color}44` }}>{rs.label}</span>
                          <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{risk.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: "20px 32px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>Rapport généré par Dealyze Deep Due IA · XPRIZE 2026</p>
                <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${COLOR},#059669)`, cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 4px 14px ${GLOW}` }}>
                  <Download size={13} strokeWidth={1.75} /> Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
