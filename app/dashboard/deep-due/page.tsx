"use client";

import { useState } from "react";
import { Shield, Copy, Check, AlertCircle, Sparkles, Download } from "lucide-react";
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
const GLOW  = "rgba(16,185,129,0.45)";

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

const RISK_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  élevé: { bg: "#ef444415", color: "#ef4444", label: "Élevé" }, high:   { bg: "#ef444415", color: "#ef4444", label: "Élevé" },
  moyen: { bg: "#f59e0b15", color: "#f59e0b", label: "Moyen" }, medium: { bg: "#f59e0b15", color: "#f59e0b", label: "Moyen" },
  faible:{ bg: "#10b98115", color: "#10b981", label: "Faible"}, low:    { bg: "#10b98115", color: "#10b981", label: "Faible"},
};
const RECO_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  "Investir":{ bg: "#10b98115", color: "#10b981", icon: "✅" }, "Invest":{ bg: "#10b98115", color: "#10b981", icon: "✅" },
  "Ne pas investir":{ bg: "#ef444415", color: "#ef4444", icon: "❌" }, "Do not invest":{ bg: "#ef444415", color: "#ef4444", icon: "❌" },
};
const DEFAULT_RECO = { bg: "#f59e0b15", color: "#f59e0b", icon: "⚠️" };
const ANIM_STYLE = `
  @keyframes fadeInSection { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
`;

export default function DeepDuePage() {
  const [form, setForm]       = useState({ company_name: "", founder_name: "", context: "", language: "fr" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<DeepDueResult | null>(null);
  const [copied, setCopied]   = useState(false);

  function set(f: string, v: string) { setForm((p) => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
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
      `DUE DILIGENCE — ${result.company_name}`, `Fondateur : ${result.founder_name}`,
      `Score de confiance : ${result.score_confiance}/10`, `Recommandation : ${result.recommandation_finale}`, "",
      "SYNTHÈSE :", result.synthese_executive, "",
      "PROFIL FONDATEUR :", result.profil_fondateur?.resume, result.profil_fondateur?.experience, "",
      "ANALYSE ENTREPRISE :", result.analyse_entreprise?.resume, result.analyse_entreprise?.position_marche, "",
      "RISQUES :", ...result.risques_identifies.map((r) => `[${r.level.toUpperCase()}] ${r.description}`),
    ].join("\n");
  }

  function copyReport() {
    navigator.clipboard.writeText(buildText()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function downloadPDF() {
    if (!result) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const risksHtml = result.risques_identifies.map((r) => {
      const s = RISK_STYLE[r.level.toLowerCase()] ?? RISK_STYLE.moyen;
      return `<div style="padding:10px 14px;border-radius:8px;background:${s.bg};margin-bottom:8px;display:flex;gap:12px;align-items:flex-start"><strong style="color:${s.color};flex-shrink:0;font-size:12px">${s.label}</strong><span>${r.description}</span></div>`;
    }).join("");
    const reco = RECO_STYLE[result.recommandation_finale] ?? DEFAULT_RECO;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Due Diligence — ${result.company_name}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;color:#111;line-height:1.7;padding:0 20px}
    h1{font-size:22px;font-weight:700}h2{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#059669;margin:24px 0 8px}
    .meta{color:#666;font-size:13px;margin-bottom:24px}.reco{padding:14px 18px;border-radius:10px;font-weight:700;font-size:16px;background:${reco.bg};color:${reco.color};margin-bottom:20px}
    p{margin:0 0 12px}@media print{body{margin:20px}}</style></head>
    <body><h1>Due Diligence — ${result.company_name}</h1>
    <p class="meta">${result.due_id} · ${result.founder_name} · Score de confiance : ${result.score_confiance}/10</p>
    <div class="reco">${reco.icon} ${result.recommandation_finale}</div>
    <h2>Synthèse exécutive</h2><p>${result.synthese_executive}</p>
    ${result.profil_fondateur?.resume ? `<h2>Profil fondateur</h2><p>${result.profil_fondateur.resume}</p>` : ""}
    ${result.analyse_entreprise?.resume ? `<h2>Analyse entreprise</h2><p>${result.analyse_entreprise.resume}</p>` : ""}
    <h2>Risques identifiés</h2>${risksHtml}</body></html>`);
    win.print(); win.close();
  }

  const recoStyle = result ? (RECO_STYLE[result.recommandation_finale] ?? DEFAULT_RECO) : DEFAULT_RECO;

  return (
    <div className="max-w-6xl mx-auto">
      <style>{ANIM_STYLE}</style>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield size={22} style={{ color: COLOR }} strokeWidth={1.5} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>Deep Due</h2>
          <p style={{ fontSize: 13, color: "#4a4a6a" }}>Due diligence automatisée sur une entreprise et son fondateur</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Form */}
        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20 }}>Cible de la due diligence</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <Label>Nom de l&apos;entreprise *</Label>
              <input type="text" required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="TechVision AI" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <Label>Nom du fondateur</Label>
              <input type="text" value={form.founder_name} onChange={(e) => set("founder_name", e.target.value)} placeholder="Kofi Mensah" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <Label>Informations disponibles</Label>
              <textarea value={form.context} onChange={(e) => set("context", e.target.value)}
                placeholder={"Collez ici toutes les informations disponibles :\nLinkedIn, Crunchbase, articles de presse, données financières...\n\nPlus vous fournissez d'informations, plus l'analyse sera précise."}
                rows={7} style={{ ...inputStyle, resize: "none", minHeight: 160 }} onFocus={onFocus} onBlur={onBlur} />
              <p style={{ fontSize: 11, color: "#3a3a5a", marginTop: 6 }}>Optionnel. Sans contexte, l&apos;analyse se base sur les informations publiques connues.</p>
            </div>
            <div>
              <Label>Langue du rapport</Label>
              <select value={form.language} onChange={(e) => set("language", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                <option value="fr">Français</option><option value="en">English</option>
              </select>
            </div>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "#1f1015", border: "1px solid #ef444433", color: "#f87171", fontSize: 13 }}>
                <AlertCircle size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${COLOR}, #059669)`, color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: `0 4px 14px ${GLOW}`, transition: "box-shadow 0.15s" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = `0 8px 24px ${GLOW}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 14px ${GLOW}`; }}
            >
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse en cours…</> : <><Sparkles size={15} strokeWidth={1.5} /> Lancer la due diligence</>}
            </button>
          </form>
        </Card>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!result && !loading && (
            <Card style={{ minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Shield size={30} style={{ color: COLOR }} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: 13, color: "#4a4a6a", maxWidth: 250, lineHeight: 1.6 }}>Entrez le nom d&apos;une entreprise pour lancer une due diligence complète avec profil fondateur et cartographie des risques.</p>
            </Card>
          )}
          {loading && (
            <Card style={{ minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div className="w-10 h-10 rounded-full animate-spin mb-4" style={{ border: `3px solid ${COLOR}22`, borderTopColor: COLOR }} />
              <p style={{ fontSize: 13, color: "#4a4a6a" }}>Due diligence en cours…</p>
              <p style={{ fontSize: 11, color: "#3a3a5a", marginTop: 4 }}>Cela peut prendre 30 à 60 secondes</p>
            </Card>
          )}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 760, overflowY: "auto", paddingRight: 2 }}>
              {/* Header + score */}
              <Card style={{ animation: "fadeInSection 0.4s ease both" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3a3a5a", marginBottom: 4 }}>{result.due_id}</div>
                    <h4 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>{result.company_name}</h4>
                    {result.founder_name && <p style={{ fontSize: 13, color: "#4a4a6a", marginTop: 2 }}>{result.founder_name}</p>}
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
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "#4a4a6a", flexShrink: 0 }}>Score de confiance</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 4, background: "#2a2a3a", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${result.score_confiance * 10}%`, borderRadius: 4, background: COLOR, transition: "width 1s" }} />
                  </div>
                  <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#f1f5f9", flexShrink: 0 }}>{result.score_confiance}/10</span>
                </div>
              </Card>

              {result.recommandation_finale && (
                <div style={{ borderRadius: 14, border: `1px solid ${recoStyle.color}33`, padding: "16px 20px", background: recoStyle.bg, display: "flex", alignItems: "center", gap: 14, animation: "fadeInSection 0.4s ease both", animationDelay: "80ms" }}>
                  <span style={{ fontSize: 24 }}>{recoStyle.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: recoStyle.color, marginBottom: 4 }}>Recommandation</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: recoStyle.color }}>{result.recommandation_finale}</div>
                  </div>
                </div>
              )}

              {result.synthese_executive && (
                <Card style={{ animation: "fadeInSection 0.4s ease both", animationDelay: "160ms" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR, marginBottom: 8 }}>Synthèse exécutive</div>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{result.synthese_executive}</p>
                </Card>
              )}

              {result.profil_fondateur && (
                <Card style={{ animation: "fadeInSection 0.4s ease both", animationDelay: "240ms" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR, marginBottom: 12 }}>Profil fondateur</div>
                  {result.profil_fondateur.resume && <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 10 }}>{result.profil_fondateur.resume}</p>}
                  {result.profil_fondateur.experience && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: "#4a4a6a", marginBottom: 4 }}>Expérience</div>
                      <p style={{ fontSize: 13, color: "#94a3b8" }}>{result.profil_fondateur.experience}</p>
                    </div>
                  )}
                  {(result.profil_fondateur.signaux_positifs?.length > 0 || result.profil_fondateur.signaux_negatifs?.length > 0) && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {result.profil_fondateur.signaux_positifs?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#10b981", marginBottom: 6 }}>Signaux positifs</div>
                          <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {result.profil_fondateur.signaux_positifs.map((s, i) => <li key={i} style={{ fontSize: 12, color: "#94a3b8", display: "flex", gap: 6 }}><span style={{ color: "#10b981" }}>+</span>{s}</li>)}
                          </ul>
                        </div>
                      )}
                      {result.profil_fondateur.signaux_negatifs?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", marginBottom: 6 }}>Signaux négatifs</div>
                          <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {result.profil_fondateur.signaux_negatifs.map((s, i) => <li key={i} style={{ fontSize: 12, color: "#94a3b8", display: "flex", gap: 6 }}><span style={{ color: "#ef4444" }}>−</span>{s}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )}

              {result.risques_identifies?.length > 0 && (
                <Card style={{ animation: "fadeInSection 0.4s ease both", animationDelay: "320ms" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR, marginBottom: 12 }}>Risques identifiés</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.risques_identifies.map((risk, i) => {
                      const s = RISK_STYLE[risk.level.toLowerCase()] ?? RISK_STYLE.moyen;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#0f0f13", border: `1px solid ${s.color}33` }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
                          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{risk.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
