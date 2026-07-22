"use client";

import { useState, useEffect } from "react";
import { Shield, Copy, Check, AlertCircle, Sparkles, Download, User, Building2, AlertTriangle, CheckCircle2, XCircle, FileSearch } from "lucide-react";
import { api, getErrorMessage } from "../../lib/api";
import { addActivity } from "../../lib/activity";
import { getUser } from "../../lib/auth";
import PageHeader from "../../components/PageHeader";

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
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  useEffect(() => { setUser(getUser()); }, []);
  const [form, setForm]       = useState({ company_name: "", founder_name: "", context: "", language: "fr" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<DeepDueResult | null>(null);
  const [copied, setCopied]   = useState(false);

  function set(f: string, v: string) { setForm((p) => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true); setResult(null);
    try {
      const res = await api.post<DeepDueResult>("/agents/deep-due/analyze", form);
      setResult(res.data);
      addActivity({
        type: "deep_due",
        title: `Due diligence — ${res.data.recommandation_finale}`,
        subtitle: `${res.data.company_name} · Score de confiance ${res.data.score_confiance}%`,
        timestamp: new Date().toISOString(),
        href: "/dashboard/deep-due",
        details: [
          { label: "Entreprise",       value: res.data.company_name },
          { label: "Fondateur",        value: res.data.founder_name || "—" },
          { label: "Score confiance",  value: `${res.data.score_confiance}%` },
          { label: "Recommandation",   value: res.data.recommandation_finale },
          { label: "Risques détectés", value: `${res.data.risques_identifies.length} risque(s) identifié(s)` },
        ],
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erreur lors de l'analyse. Réessayez."));
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

    const dateStr = new Date(result.generated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    win.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Due Diligence — ${result.company_name}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#052e16;background:#fff;line-height:1.7;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:794px;margin:0 auto}
/* ── Banner ── */
.banner{background:linear-gradient(135deg,#14532d 0%,#15803d 50%,#16a34a 100%);padding:32px 56px 28px}
.brand-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px}
.brand-name{font-size:24px;font-weight:900;letter-spacing:5px;color:#fff;line-height:1}
.brand-x{font-size:1.65em;font-weight:900;line-height:.85;letter-spacing:0;color:#a7f3d0}
.brand-sub{font-size:9.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-top:5px}
.doc-meta{text-align:right}.doc-id{font-family:monospace;font-size:10.5px;color:rgba(255,255,255,.45);margin-bottom:3px}.doc-date{font-size:12px;color:rgba(255,255,255,.65)}
.banner-title{font-size:24px;font-weight:800;color:#fff;letter-spacing:-.5px;margin-bottom:5px}
.banner-sub{font-size:13px;color:rgba(255,255,255,.7)}
/* ── Body ── */
.body{padding:36px 56px 52px}
/* Hero cards */
.hero{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px}
.hero-card{padding:20px 24px;border-radius:14px;border:1.5px solid #e2e8f0;background:#fafffe;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.hero-card.reco{background:${rc.bg};border-color:${rc.border}}
.hero-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9090c0;margin-bottom:10px}
.reco-text{font-size:20px;font-weight:800;color:${rc.color};line-height:1.2}
.conf-bar-bg{height:8px;background:#dcfce7;border-radius:4px;overflow:hidden;margin:10px 0 6px}
.conf-bar-fill{height:100%;width:${confPct}%;background:${confCol};border-radius:4px}
.conf-num{font-size:24px;font-weight:900;color:${confCol};font-family:monospace}
/* Section titles */
.st{display:flex;align-items:center;gap:8px;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.15em;color:#15803d;margin:28px 0 14px;padding-bottom:8px;border-bottom:2px solid #dcfce7}
.st::before{content:'';display:block;width:4px;height:14px;background:linear-gradient(180deg,#10b981,#059669);border-radius:2px;flex-shrink:0}
/* Prose */
.prose{font-size:13.5px;color:#374151;line-height:1.85;margin-bottom:10px}
/* Signals */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:8px}
.signal-box{padding:16px 18px;border-radius:12px}
.signal-box.pos{background:#f0fdf4;border:1.5px solid #86efac}.signal-box.neg{background:#fef2f2;border:1.5px solid #fca5a5}
.signal-title{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px}
.signal-box.pos .signal-title{color:#16a34a}.signal-box.neg .signal-title{color:#dc2626}
.signal-box ul{list-style:none;display:flex;flex-direction:column;gap:7px}
.signal-box li{font-size:12.5px;color:#374151;display:flex;gap:8px;align-items:flex-start;line-height:1.5}
.signal-box.pos li::before{content:"+";color:#16a34a;font-weight:800;flex-shrink:0;margin-top:1px}
.signal-box.neg li::before{content:"−";color:#dc2626;font-weight:800;flex-shrink:0;margin-top:1px}
/* Tags */
.tag-list{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.tag{font-size:11px;padding:4px 12px;border-radius:20px;background:#f0fdf4;border:1px solid #86efac;color:#15803d;font-weight:500}
/* Risks */
.risk-item{padding:13px 16px;border-radius:10px;margin-bottom:10px;background:#fafafa;display:flex;gap:14px;align-items:flex-start;border-left:3px solid transparent}
.risk-badge{font-size:10px;font-weight:700;padding:3px 10px;border-radius:6px;flex-shrink:0;margin-top:1px}
.risk-desc{font-size:13px;color:#374151;line-height:1.65}
/* Footer */
.footer{display:flex;justify-content:space-between;align-items:center;margin-top:44px;padding-top:20px;border-top:2px solid #dcfce7}
.footer-left{font-size:11px;color:#9ca3af;line-height:1.7}
.footer-badge{background:linear-gradient(135deg,#15803d,#16a34a);color:#fff;font-size:10px;font-weight:700;padding:7px 16px;border-radius:8px;letter-spacing:.06em}
@media print{.banner{padding:24px 40px 20px}.body{padding:28px 40px 36px}}
</style></head><body>
<div class="page">
  <div class="banner">
    <div class="brand-row">
      <div>
        <div class="brand-name">VY<span class="brand-x">X</span>EN</div>
        <div class="brand-sub">Deep Due &middot; Due Diligence IA</div>
      </div>
      <div class="doc-meta">
        <div class="doc-id">${result.due_id}</div>
        <div class="doc-date">Analysé le ${dateStr}</div>
      </div>
    </div>
    <div class="banner-title">Due Diligence — ${result.company_name}</div>
    <div class="banner-sub">${result.founder_name ? `Fondateur : ${result.founder_name}` : "Analyse entreprise"}</div>
  </div>
  <div class="body">
    <div class="hero">
      <div class="hero-card reco">
        <div class="hero-label">Recommandation finale</div>
        <div class="reco-text">${rc.icon} ${result.recommandation_finale}</div>
      </div>
      <div class="hero-card">
        <div class="hero-label">Score de confiance données</div>
        <div class="conf-num">${result.score_confiance}<span style="font-size:14px;color:#9090b0;font-weight:400">/10</span></div>
        <div class="conf-bar-bg"><div class="conf-bar-fill"></div></div>
        <div style="font-size:11px;color:#9ca3af">Qualité et quantité des données disponibles</div>
      </div>
    </div>
    ${result.synthese_executive ? `<div class="st">Synthèse exécutive</div><p class="prose">${result.synthese_executive}</p>` : ""}
    ${result.profil_fondateur ? `<div class="st">Profil fondateur</div>
    ${result.profil_fondateur.resume ? `<p class="prose">${result.profil_fondateur.resume}</p>` : ""}
    ${result.profil_fondateur.experience ? `<p class="prose"><strong>Expérience :</strong> ${result.profil_fondateur.experience}</p>` : ""}
    ${(result.profil_fondateur.signaux_positifs?.length || result.profil_fondateur.signaux_negatifs?.length) ? `<div class="two-col" style="margin-top:12px"><div class="signal-box pos"><div class="signal-title">+ Signaux positifs</div><ul>${(result.profil_fondateur.signaux_positifs ?? []).map((s) => `<li>${s}</li>`).join("")}</ul></div><div class="signal-box neg"><div class="signal-title">− Signaux négatifs</div><ul>${(result.profil_fondateur.signaux_negatifs ?? []).map((s) => `<li>${s}</li>`).join("")}</ul></div></div>` : ""}` : ""}
    ${result.analyse_entreprise ? `<div class="st">Analyse entreprise</div>
    ${result.analyse_entreprise.resume ? `<p class="prose">${result.analyse_entreprise.resume}</p>` : ""}
    ${result.analyse_entreprise.structure ? `<p class="prose"><strong>Structure :</strong> ${result.analyse_entreprise.structure}</p>` : ""}
    ${result.analyse_entreprise.position_marche ? `<p class="prose"><strong>Position marché :</strong> ${result.analyse_entreprise.position_marche}</p>` : ""}
    ${result.analyse_entreprise.concurrents?.length ? `<p class="prose"><strong>Concurrents :</strong></p><div class="tag-list">${result.analyse_entreprise.concurrents.map((c) => `<span class="tag">${c}</span>`).join("")}</div>` : ""}` : ""}
    ${result.risques_identifies?.length ? `<div class="st">Risques identifiés</div>${risksHtml}` : ""}
    <div class="footer">
      <div class="footer-left">Document généré par VYXEN Deep Due IA &middot; ${new Date().getFullYear()}<br>Rapport confidentiel &middot; Usage investisseur uniquement</div>
      <div class="footer-badge">VYXEN &middot; XPRIZE 2026</div>
    </div>
  </div>
</div></body></html>`);
    setTimeout(() => { win.print(); }, 300);
  }

  const rc = result ? recoConfig(result.recommandation_finale) : null;

  return (
    <div className="w-full">
      <style>{ANIM_STYLE}</style>

      <PageHeader
        title="Deep Due"
        subtitle="Due diligence IA complète — profil fondateur, analyse concurrentielle et cartographie des risques"
        accentColor={COLOR}
        icon={<Shield size={22} style={{ color: COLOR }} strokeWidth={1.75} />}
        plan={user?.plan}
      />

      <div className={result ? "block" : "grid lg:grid-cols-2 gap-6"}>
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
          <div style={{ ...CARD, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
            <div className="w-12 h-12 rounded-full animate-spin mb-5" style={{ border: "3px solid #f0fdf4", borderTopColor: COLOR }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Due diligence en cours…</p>
            <p style={{ fontSize: 12, color: "#94a3b8" }}>Analyse approfondie — cela peut prendre 30 à 60 secondes</p>
          </div>
        )}
        {!result && !loading && (
          <div style={{ ...CARD, padding: 28, display: "flex", flexDirection: "column", minHeight: 400 }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Shield size={24} style={{ color: COLOR }} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Due diligence de niveau institutionnel</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                Deep Due agrège et analyse les signaux disponibles pour produire un rapport d'investigation complet sur n'importe quelle cible.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
              {[
                "Synthèse exécutive avec score de confiance",
                "Profil détaillé du fondateur",
                "Analyse concurrentielle et positionnement marché",
                "Cartographie des risques par niveau de criticité",
                "Recommandation d'investissement argumentée",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#334155" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={11} style={{ color: COLOR }} strokeWidth={2.5} />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto", padding: "14px 18px", borderRadius: 11, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 4 }}>Profondeur d'analyse</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Équivalent à 4h de recherche humaine</div>
            </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12, marginTop: 16 }}>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12, marginTop: 12 }}>
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
                <p style={{ fontSize: 11, color: "#94a3b8" }}>Rapport généré par VYXEN Deep Due IA · XPRIZE 2026</p>
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
