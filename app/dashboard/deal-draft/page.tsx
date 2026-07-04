"use client";

import { useState } from "react";
import { FileText, Copy, Check, AlertCircle, Sparkles, Download, Building2, Clock, Wallet, Globe, Tag, Lightbulb, Package, Calendar, CreditCard, Zap, CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";
import { addActivity } from "../../lib/activity";

interface DealDraftContent {
  titre?:                string;
  introduction?:         string;
  comprehension_besoin?: string;
  solution_proposee?:    string;
  livrables?:            string[];
  timeline?:             string;
  investissement?:       string;
  conditions?:           string;
  conclusion?:           string;
  [key: string]: unknown;
}
interface DealDraftResult {
  quote_id: string; client_name: string; generated_at: string;
  tone: string; language: string; content: DealDraftContent;
}

const COLOR = "#7c3aed";
const GLOW  = "rgba(124,58,237,0.3)";

const ANIM_STYLE = `
  @keyframes fadeInSection { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeInFast { from { opacity:0; } to { opacity:1; } }
`;

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

const CONTENT_SECTIONS: { key: keyof DealDraftContent; label: string; Icon: React.ElementType }[] = [
  { key: "introduction",         label: "Introduction",              Icon: Zap          },
  { key: "comprehension_besoin", label: "Compréhension du besoin",   Icon: Lightbulb    },
  { key: "solution_proposee",    label: "Solution proposée",         Icon: CheckCircle2 },
  { key: "timeline",             label: "Calendrier de réalisation", Icon: Calendar     },
  { key: "investissement",       label: "Investissement",            Icon: Wallet       },
  { key: "conditions",           label: "Conditions de paiement",    Icon: CreditCard   },
  { key: "conclusion",           label: "Conclusion & CTA",          Icon: Sparkles     },
];

const TONE_LABELS: Record<string, string> = {
  formel: "Formel", dynamique: "Dynamique", professionnel: "Professionnel",
};

export default function DealDraftPage() {
  const [form, setForm] = useState({ client_name: "", sector: "", need: "", budget: "", timeline: "", language: "fr" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<DealDraftResult | null>(null);
  const [copied, setCopied]   = useState(false);

  function set(field: string, val: string) { setForm((p) => ({ ...p, [field]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true); setResult(null);
    try {
      const res = await api.post<DealDraftResult>("/agents/deal-draft/generate", form);
      setResult(res.data);
      addActivity({
        type: "deal_draft",
        title: `Devis ${res.data.quote_id} généré`,
        subtitle: `${res.data.client_name} · ${form.budget}`,
        timestamp: new Date().toISOString(),
        href: "/dashboard/deal-draft",
        details: [
          { label: "Client",    value: res.data.client_name },
          { label: "Secteur",   value: form.sector },
          { label: "Budget",    value: form.budget },
          { label: "Délai",     value: form.timeline },
          { label: "Référence", value: res.data.quote_id },
          { label: "Titre",     value: res.data.content.titre ?? "—" },
        ],
      });
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Erreur lors de la génération. Réessayez.");
    } finally { setLoading(false); }
  }

  function buildText() {
    if (!result) return "";
    const c = result.content;
    const lines = [`DEVIS — ${result.quote_id}`, `Client : ${result.client_name}`, `Généré le : ${new Date(result.generated_at).toLocaleDateString("fr-FR")}`, ""];
    if (c.titre) lines.push(`TITRE : ${c.titre}`, "");
    for (const s of CONTENT_SECTIONS) {
      const val = c[s.key];
      if (val && typeof val === "string") lines.push(`${s.label.toUpperCase()} :`, val, "");
    }
    if (Array.isArray(c.livrables) && c.livrables.length) lines.push("LIVRABLES :", ...(c.livrables as string[]).map((l) => `  ✓ ${l}`), "");
    return lines.join("\n");
  }

  function copyText() {
    navigator.clipboard.writeText(buildText()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function downloadPDF() {
    if (!result) return;
    const c = result.content;
    const win = window.open("", "_blank");
    if (!win) return;

    const sectionsHtml = CONTENT_SECTIONS.map((s) => {
      const val = c[s.key];
      if (!val || typeof val !== "string") return "";
      return `<div class="section"><div class="section-label">${s.label}</div><p>${val.replace(/\n/g, "<br>")}</p></div>`;
    }).join("");

    const livrablesHtml = Array.isArray(c.livrables) && c.livrables.length
      ? `<div class="section"><div class="section-label">Livrables inclus</div><ul>${(c.livrables as string[]).map((l) => `<li>${l}</li>`).join("")}</ul></div>` : "";

    win.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>${c.titre || `Devis — ${result.client_name}`}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;background:#fff;line-height:1.7}
.page{max-width:794px;margin:0 auto;padding:48px 56px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;padding-bottom:28px;border-bottom:2px solid #f0f0f8}
.logo{font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#7c3aed}.logo span{color:#1a1a2e}
.quote-meta{text-align:right}.quote-id{font-family:monospace;font-size:11px;color:#9090b0;margin-bottom:4px}.quote-date{font-size:13px;color:#555}
.quote-title{font-size:26px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px;margin-bottom:6px;line-height:1.2}
.quote-subtitle{font-size:14px;color:#7c3aed;font-weight:600;margin-bottom:28px}
.client-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:36px;padding:20px;background:#f8f7ff;border-radius:12px;border:1px solid #ede9fe}
.client-item-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9090b0;margin-bottom:4px}
.client-item-value{font-size:13px;font-weight:600;color:#1a1a2e}
.section{margin-bottom:26px;padding-bottom:26px;border-bottom:1px solid #f0f0f8}.section:last-child{border-bottom:none}
.section-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#7c3aed;margin-bottom:10px}
.section p{font-size:13.5px;color:#333;line-height:1.8}
ul{padding-left:0;list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:8px}
ul li{font-size:13px;color:#333;display:flex;align-items:flex-start;gap:8px}
ul li::before{content:"✓";color:#7c3aed;font-weight:700;flex-shrink:0;margin-top:1px}
.tone-badge{display:inline-block;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;background:#ede9fe;color:#7c3aed;margin-bottom:28px}
.footer{margin-top:40px;padding-top:24px;border-top:2px solid #f0f0f8;display:flex;justify-content:space-between;align-items:center}
.footer-left{font-size:12px;color:#9090b0;line-height:1.6}
.footer-badge{background:#7c3aed;color:#fff;font-size:11px;font-weight:700;padding:8px 18px;border-radius:8px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:24px 32px}}
</style></head><body>
<div class="page">
  <div class="header"><div class="logo">Deal<span>yze</span></div><div class="quote-meta"><div class="quote-id">${result.quote_id}</div><div class="quote-date">Généré le ${new Date(result.generated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div></div></div>
  <h1 class="quote-title">${c.titre || `Proposition commerciale — ${result.client_name}`}</h1>
  <div class="quote-subtitle">Préparée exclusivement pour ${result.client_name}</div>
  <div class="tone-badge">Ton : ${TONE_LABELS[result.tone] || result.tone}</div>
  <div class="client-bar">
    <div><div class="client-item-label">Client</div><div class="client-item-value">${result.client_name}</div></div>
    <div><div class="client-item-label">Secteur</div><div class="client-item-value">${form.sector || "—"}</div></div>
    <div><div class="client-item-label">Budget</div><div class="client-item-value">${form.budget || "—"}</div></div>
    <div><div class="client-item-label">Délai</div><div class="client-item-value">${form.timeline || "—"}</div></div>
  </div>
  ${sectionsHtml}${livrablesHtml}
  <div class="footer"><div class="footer-left">Document généré par VYXEN AI · ${new Date().getFullYear()}<br>Ce devis est valable 30 jours à compter de sa date d'émission.</div><div class="footer-badge">VYXEN · XPRIZE 2026</div></div>
</div></body></html>`);
    setTimeout(() => { win.print(); }, 300);
  }

  return (
    <div className="w-full">
      <style>{ANIM_STYLE}</style>

      {/* Page header */}
      <div className="flex items-center gap-4 mb-6">
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(167,139,250,0.28)" }}>
          <FileText size={26} style={{ color: COLOR }} strokeWidth={1.75} />
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 3, letterSpacing: "-0.5px" }}>Deal Draft</h2>
          <p style={{ fontSize: 13.5, color: "#64748b" }}>Générez une proposition commerciale professionnelle sur-mesure en moins de 30 secondes</p>
        </div>
      </div>

      <div className={result ? "block" : "grid lg:grid-cols-2 gap-6"}>
        {/* FORM */}
        {!result && (
          <div style={{ ...CARD, padding: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 20 }}>Informations du deal</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><Label>Nom du client *</Label>
                <input type="text" required value={form.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="Acme Corp" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div><Label>Secteur d&apos;activité *</Label>
                <input type="text" required value={form.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Agence web / E-commerce" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div><Label>Besoin / Prestation *</Label>
                <textarea required value={form.need} onChange={(e) => set("need", e.target.value)} placeholder="Création d'un site e-commerce avec tableau de bord analytique..." rows={3} style={{ ...inputStyle, resize: "none", minHeight: 90 }} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><Label>Budget *</Label><input type="text" required value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="8 000 €" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
                <div><Label>Délai *</Label><input type="text" required value={form.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="6 semaines" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
              </div>
              <div><Label>Langue</Label>
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
                style={{ width: "100%", padding: "13px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${COLOR}, #6d28d9)`, color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: `0 4px 14px ${GLOW}` }}>
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération…</> : <><Sparkles size={15} strokeWidth={1.75} /> Générer le devis</>}
              </button>
            </form>
          </div>
        )}

        {/* Loading / Preview panel */}
        {loading && !result && (
          <div style={{ ...CARD, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
            <div className="w-12 h-12 rounded-full animate-spin mb-5" style={{ border: `3px solid #ede9fe`, borderTopColor: COLOR }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Gemini rédige votre proposition…</p>
            <p style={{ fontSize: 12, color: "#94a3b8" }}>Personnalisation en cours selon vos critères</p>
          </div>
        )}
        {!result && !loading && (
          <div style={{ ...CARD, padding: 28, display: "flex", flexDirection: "column", minHeight: 400 }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <FileText size={24} style={{ color: COLOR }} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Ce que vous obtiendrez</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                Deal Draft génère une proposition structurée, calibrée sur votre secteur et sur les attentes de votre client.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
              {[
                "Proposition structurée en 9 sections détaillées",
                "Ton personnalisé selon votre secteur d'activité",
                "Livrables et calendrier sur-mesure",
                "Export PDF prêt à envoyer au client",
                "Disponible en français et en anglais",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#334155" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={11} style={{ color: COLOR }} strokeWidth={2.5} />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto", padding: "14px 18px", borderRadius: 11, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 4 }}>Temps de génération</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>15 – 30 secondes</div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div style={{ animation: "fadeInFast 0.4s ease both" }}>
            {/* Top action bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={() => { setResult(null); setError(""); }}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#64748b", fontSize: 12, fontWeight: 600 }}>
                ← Nouveau devis
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copyText} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#64748b", fontSize: 12 }}>
                  {copied ? <><Check size={12} style={{ color: "#10b981" }} /> Copié</> : <><Copy size={12} strokeWidth={1.75} /> Copier</>}
                </button>
                <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: `linear-gradient(135deg,${COLOR},#6d28d9)`, cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 2px 8px ${GLOW}` }}>
                  <Download size={12} strokeWidth={1.75} /> Télécharger PDF
                </button>
              </div>
            </div>

            {/* Quote card */}
            <div style={{ ...CARD, overflow: "hidden" }}>

              {/* Quote header */}
              <div style={{ background: "linear-gradient(135deg, #f5f3ff, #faf5ff)", borderBottom: "1px solid #ede9fe", padding: "28px 32px", animation: "fadeInSection 0.4s ease both" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.05em" }}>{result.quote_id}</div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 6 }}>
                      {result.content.titre || `Proposition — ${result.client_name}`}
                    </h3>
                    <p style={{ fontSize: 13, color: COLOR, fontWeight: 600 }}>Préparée pour {result.client_name}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                      {new Date(result.generated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "#ede9fe", color: COLOR }}>
                      <Tag size={10} /> {TONE_LABELS[result.tone] || result.tone}
                    </div>
                  </div>
                </div>
                {/* Client info pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {([
                    { Icon: Building2, label: form.sector },
                    { Icon: Wallet,    label: form.budget },
                    { Icon: Clock,     label: form.timeline },
                    { Icon: Globe,     label: result.language === "fr" ? "Français" : "English" },
                  ] as { Icon: React.ElementType; label: string }[]).filter((p) => p.label).map(({ Icon, label }, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "#fff", border: "1px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
                      <Icon size={11} style={{ color: COLOR }} /> {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content sections */}
              <div style={{ padding: "8px 0" }}>
                {CONTENT_SECTIONS.map((s, i) => {
                  const val = result.content[s.key];
                  if (!val || typeof val !== "string") return null;
                  return (
                    <div key={s.key} style={{ padding: "22px 32px", borderBottom: i < CONTENT_SECTIONS.length - 1 ? "1px solid #f1f5f9" : "none", animation: "fadeInSection 0.4s ease both", animationDelay: `${i * 70}ms` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <s.Icon size={13} style={{ color: COLOR }} strokeWidth={1.75} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR }}>{s.label}</span>
                      </div>
                      <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75, paddingLeft: 36 }}>{val}</p>
                    </div>
                  );
                })}
                {/* Livrables */}
                {Array.isArray(result.content.livrables) && result.content.livrables.length > 0 && (
                  <div style={{ padding: "22px 32px", borderTop: "1px solid #f1f5f9", animation: "fadeInSection 0.4s ease both", animationDelay: "560ms" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Package size={13} style={{ color: COLOR }} strokeWidth={1.75} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR }}>Livrables inclus</span>
                    </div>
                    <div style={{ paddingLeft: 36, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {(result.content.livrables as string[]).map((l, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <div style={{ width: 18, height: 18, borderRadius: 5, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                            <Check size={10} style={{ color: COLOR }} strokeWidth={2.5} />
                          </div>
                          <span style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: "20px 32px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", animation: "fadeInSection 0.4s ease both", animationDelay: "640ms" }}>
                <div>
                  <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>Devis valable 30 jours · Généré par VYXEN AI</p>
                  <p style={{ fontSize: 11, color: "#cbd5e1" }}>XPRIZE AI Hackathon 2026</p>
                </div>
                <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${COLOR},#6d28d9)`, cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: `0 4px 14px ${GLOW}` }}>
                  <Download size={14} strokeWidth={1.75} /> Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
