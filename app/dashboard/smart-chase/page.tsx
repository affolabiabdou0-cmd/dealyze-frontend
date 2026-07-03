"use client";

import { useState } from "react";
import { Mail, Copy, Check, AlertCircle, Sparkles, Calendar, Download, Building2, Wallet, Clock, AlertTriangle, TrendingUp, User } from "lucide-react";
import { api } from "../../lib/api";

interface SmartChaseResult {
  chase_id: string; invoice_id: string; client_name: string; amount_display: string;
  days_overdue: number; escalation_level: number; client_profile: string; tone: string;
  email_subject: string; email_body: string; next_action_date: string; generated_at: string;
}

const COLOR = "#f97316";
const GLOW  = "rgba(249,115,22,0.45)";
const ANIM_STYLE = `
  @keyframes fadeInSection { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeInFast { from { opacity:0; } to { opacity:1; } }
`;

type EscCfg = { label: string; color: string; bg: string };
const ESCALATION_CONFIG: EscCfg[] = [
  { label: "Inconnu",         color: COLOR,     bg: `${COLOR}15`  },
  { label: "Rappel doux",     color: "#10b981", bg: "#10b98115"   },
  { label: "Relance ferme",   color: "#f59e0b", bg: "#f59e0b15"   },
  { label: "Mise en demeure", color: "#ef4444", bg: "#ef444415"   },
  { label: "Alerte critique", color: "#dc2626", bg: "#dc262615"   },
];

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

export default function SmartChasePage() {
  const [form, setForm] = useState({
    invoice_id: "", client_name: "", amount: "", currency: "EUR",
    due_date: "", issue_date: "", description: "",
    previous_reminders: "0", payment_history: "nouveau_client",
    company_name: "", chase_style: "professionnel", language: "fr",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<SmartChaseResult | null>(null);
  const [copied, setCopied]   = useState(false);

  function set(f: string, v: string) { setForm((p) => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true); setResult(null);
    try {
      const res = await api.post<SmartChaseResult>("/agents/smart-chase/generate", {
        invoice: {
          invoice_id:         form.invoice_id || `FAC-${Date.now()}`,
          client_name:        form.client_name,
          amount:             parseFloat(form.amount) || 0,
          currency:           form.currency,
          due_date:           form.due_date,
          issue_date:         form.issue_date,
          description:        form.description,
          previous_reminders: parseInt(form.previous_reminders) || 0,
          payment_history:    form.payment_history,
        },
        company_name: form.company_name,
        chase_style:  form.chase_style,
        language:     form.language,
      });
      setResult(res.data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Erreur lors de la génération. Réessayez.");
    } finally { setLoading(false); }
  }

  function copyEmail() {
    if (!result) return;
    navigator.clipboard.writeText(`Objet : ${result.email_subject}\n\n${result.email_body}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadPDF() {
    if (!result) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const lvl = result.escalation_level;
    const esc = lvl >= 1 && lvl <= 4 ? ESCALATION_CONFIG[lvl] : { label: `Niveau ${lvl}`, color: "#f97316", bg: "#f9731615" };
    const emailLines = result.email_body.split("\n").map((l) => l ? `<p>${l}</p>` : "<br>").join("");

    win.document.write(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Relance — ${result.client_name}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;background:#fff;line-height:1.7}
.page{max-width:794px;margin:0 auto;padding:48px 56px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #f0f0f8}
.logo{font-size:20px;font-weight:800;color:#f97316}.logo span{color:#1a1a2e}
.meta-right{text-align:right}.chase-id{font-family:monospace;font-size:11px;color:#9090b0;margin-bottom:4px}.chase-date{font-size:12px;color:#555}
.title-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
h1{font-size:22px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px}
.level-badge{font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;background:${esc.bg};color:${esc.color};border:1px solid ${esc.color}40}
.info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;padding:18px;background:#fff8f5;border-radius:12px;border:1px solid #fed7aa}
.info-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9090b0;margin-bottom:4px}
.info-value{font-size:13px;font-weight:700;color:#1a1a2e}
.alert-bar{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:10px;background:${esc.bg};border:1px solid ${esc.color}33;margin-bottom:24px}
.alert-text{font-size:13px;font-weight:600;color:${esc.color}}.alert-sub{font-size:12px;color:#666}
.email-wrap{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px}
.email-head{background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:16px 20px}
.email-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9090b0;margin-bottom:4px}
.email-subject{font-size:15px;font-weight:700;color:#1a1a2e}
.email-body{padding:24px}.email-body p{font-size:13.5px;color:#333;line-height:1.8}
.next-box{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:10px;background:#f0fdf4;border:1px solid #86efac;margin-bottom:24px}
.next-label{font-size:11px;font-weight:600;color:#16a34a}.next-date{font-size:13px;font-weight:700;color:#15803d}
.footer{margin-top:32px;padding-top:20px;border-top:2px solid #f0f0f8;display:flex;justify-content:space-between;align-items:center}
.footer-left{font-size:11px;color:#9090b0;line-height:1.6}
.footer-badge{background:#f97316;color:#fff;font-size:11px;font-weight:700;padding:6px 16px;border-radius:8px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:24px 32px}}
</style></head><body>
<div class="page">
  <div class="header">
    <div class="logo">Smart<span>Chase</span> <span style="font-size:13px;color:#9090b0;font-weight:400">by Dealyze</span></div>
    <div class="meta-right">
      <div class="chase-id">${result.chase_id}</div>
      <div class="chase-date">Généré le ${new Date(result.generated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
    </div>
  </div>
  <div class="title-row"><h1>Relance — ${result.client_name}</h1><span class="level-badge">${esc.label}</span></div>
  <div class="info-grid">
    <div><div class="info-label">Client</div><div class="info-value">${result.client_name}</div></div>
    <div><div class="info-label">Montant</div><div class="info-value">${result.amount_display}</div></div>
    <div><div class="info-label">Retard</div><div class="info-value">${result.days_overdue} jours</div></div>
    <div><div class="info-label">Facture</div><div class="info-value">${result.invoice_id}</div></div>
  </div>
  <div class="alert-bar">
    <div><div class="alert-text">Niveau d'escalade ${result.escalation_level}/4 — ${esc.label}</div><div class="alert-sub">Ton appliqué : ${result.tone}</div></div>
  </div>
  <div class="email-wrap">
    <div class="email-head"><div class="email-label">Objet de l'email</div><div class="email-subject">${result.email_subject}</div></div>
    <div class="email-body">${emailLines}</div>
  </div>
  ${result.next_action_date ? `<div class="next-box"><span style="font-size:18px">📅</span><div><div class="next-label">Prochaine action recommandée</div><div class="next-date">${new Date(result.next_action_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div></div></div>` : ""}
  <div class="footer">
    <div class="footer-left">Document généré par Dealyze Smart Chase IA · ${new Date().getFullYear()}<br>Ce document est confidentiel et destiné uniquement au destinataire désigné.</div>
    <div class="footer-badge">Dealyze · XPRIZE 2026</div>
  </div>
</div></body></html>`);
    setTimeout(() => { win.print(); }, 300);
  }

  const lvl = result?.escalation_level ?? 0;
  const esc = lvl >= 1 && lvl <= 4 ? ESCALATION_CONFIG[lvl] : { label: `Niveau ${lvl}`, color: COLOR, bg: `${COLOR}15` };

  return (
    <div className="max-w-6xl mx-auto">
      <style>{ANIM_STYLE}</style>
      <div className="flex items-center gap-3 mb-6">
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={22} style={{ color: COLOR }} strokeWidth={1.5} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>Smart Chase</h2>
          <p style={{ fontSize: 13, color: "#4a4a6a" }}>Relances intelligentes pour vos factures impayées</p>
        </div>
      </div>

      <div className={result ? "block" : "grid lg:grid-cols-2 gap-5"}>
        {/* FORM */}
        {!result && (
          <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20 }}>Détails de la facture</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><Label>Votre entreprise *</Label><input type="text" required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Mon Agence SAS" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
                <div><Label>Nom du client *</Label><input type="text" required value={form.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="Acme Corp" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><Label>Montant *</Label><input type="number" required value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="3 500" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
                <div><Label>Devise</Label>
                  <select value={form.currency} onChange={(e) => set("currency", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                    {["EUR","USD","XOF","MAD","GBP"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><Label>Date d&apos;émission *</Label><input type="date" required value={form.issue_date} onChange={(e) => set("issue_date", e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} onFocus={onFocus} onBlur={onBlur} /></div>
                <div><Label>Date d&apos;échéance *</Label><input type="date" required value={form.due_date} onChange={(e) => set("due_date", e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} onFocus={onFocus} onBlur={onBlur} /></div>
              </div>
              <div><Label>Description de la prestation</Label><input type="text" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Développement site e-commerce Phase 1" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><Label>Relances précédentes</Label>
                  <select value={form.previous_reminders} onChange={(e) => set("previous_reminders", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                    <option value="0">Aucune (1ère relance)</option><option value="1">1 relance</option><option value="2">2 relances</option><option value="3">3 ou plus</option>
                  </select>
                </div>
                <div><Label>Profil client</Label>
                  <select value={form.payment_history} onChange={(e) => set("payment_history", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                    <option value="nouveau_client">Nouveau client</option><option value="bon_payeur">Bon payeur</option><option value="retardataire">Retardataire</option><option value="mauvais_payeur">Mauvais payeur</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><Label>Style de relance</Label>
                  <select value={form.chase_style} onChange={(e) => set("chase_style", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                    {["professionnel","bienveillant","ferme"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><Label>Langue</Label>
                  <select value={form.language} onChange={(e) => set("language", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                    <option value="fr">Français</option><option value="en">English</option>
                  </select>
                </div>
              </div>
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "#1f1015", border: "1px solid #ef444433", color: "#f87171", fontSize: 13 }}>
                  <AlertCircle size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} /> {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "14px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${COLOR},#ea580c)`, color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: `0 4px 14px ${GLOW}`, transition: "box-shadow 0.15s" }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = `0 8px 24px ${GLOW}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 14px ${GLOW}`; }}
              >
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération…</> : <><Sparkles size={15} strokeWidth={1.5} /> Générer la relance</>}
              </button>
            </form>
          </div>
        )}

        {loading && !result && (
          <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
            <div className="w-10 h-10 rounded-full animate-spin mb-4" style={{ border: `3px solid ${COLOR}22`, borderTopColor: COLOR }} />
            <p style={{ fontSize: 13, color: "#4a4a6a" }}>Gemini rédige votre relance…</p>
          </div>
        )}
        {!result && !loading && (
          <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Mail size={30} style={{ color: COLOR }} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 13, color: "#4a4a6a", maxWidth: 240, lineHeight: 1.6 }}>Entrez les détails de la facture pour générer une relance personnalisée et professionnelle.</p>
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div style={{ animation: "fadeInFast 0.4s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={() => { setResult(null); setError(""); }}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #2a2a3a", background: "none", cursor: "pointer", color: "#6a6a8a", fontSize: 12, fontWeight: 600 }}>
                ← Nouvelle relance
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copyEmail} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, border: "1px solid #2a2a3a", background: "none", cursor: "pointer", color: "#6a6a8a", fontSize: 12 }}>
                  {copied ? <><Check size={12} style={{ color: "#10b981" }} /> Copié</> : <><Copy size={12} strokeWidth={1.5} /> Copier l&apos;email</>}
                </button>
                <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: `linear-gradient(135deg,${COLOR},#ea580c)`, cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 2px 8px ${GLOW}` }}>
                  <Download size={12} strokeWidth={1.5} /> Télécharger PDF
                </button>
              </div>
            </div>

            <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 20, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: `linear-gradient(135deg,${COLOR}22,#1a1a24)`, borderBottom: "1px solid #2a2a3a", padding: "28px 32px", animation: "fadeInSection 0.4s ease both" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3a3a5a", marginBottom: 6 }}>{result.chase_id}</div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 4 }}>Relance — {result.client_name}</h3>
                    <p style={{ fontSize: 13, color: COLOR, fontWeight: 600 }}>{esc.label} · {result.days_overdue} jours de retard · {result.amount_display}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: esc.bg, color: esc.color, border: `1px solid ${esc.color}33` }}>
                      <AlertTriangle size={11} /> {esc.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#3a3a5a", marginTop: 6 }}>Niveau {result.escalation_level}/4</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {([
                    { Icon: Building2,  label: form.company_name },
                    { Icon: Wallet,     label: result.amount_display },
                    { Icon: Clock,      label: `${result.days_overdue}j de retard` },
                    { Icon: User,       label: result.client_profile?.replace("_", " ") },
                    { Icon: TrendingUp, label: result.tone },
                  ] as { Icon: React.ElementType; label: string }[]).filter((p) => p.label).map(({ Icon, label }, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, background: "#0f0f13", border: "1px solid #2a2a3a", fontSize: 11, color: "#94a3b8" }}>
                      <Icon size={10} style={{ color: COLOR }} /> {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Objet */}
              <div style={{ padding: "24px 32px", borderBottom: "1px solid #1e1e2e", animation: "fadeInSection 0.4s ease both", animationDelay: "80ms" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${COLOR}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mail size={13} style={{ color: COLOR }} strokeWidth={1.5} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR }}>Objet de l&apos;email</span>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 10, background: "#0f0f13", border: `1px solid ${COLOR}33` }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{result.email_subject}</p>
                </div>
              </div>

              {/* Corps */}
              <div style={{ padding: "24px 32px", borderBottom: "1px solid #1e1e2e", animation: "fadeInSection 0.4s ease both", animationDelay: "160ms" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${COLOR}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={13} style={{ color: COLOR }} strokeWidth={1.5} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR }}>Corps du message</span>
                </div>
                <div style={{ padding: "20px", borderRadius: 10, background: "#0f0f13", border: "1px solid #2a2a3a", fontSize: 13.5, color: "#94a3b8", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {result.email_body}
                </div>
              </div>

              {/* Prochaine action */}
              {result.next_action_date && (
                <div style={{ padding: "20px 32px", borderBottom: "1px solid #1e1e2e", animation: "fadeInSection 0.4s ease both", animationDelay: "240ms" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: "#0f2318", border: "1px solid #10b98133" }}>
                    <Calendar size={16} style={{ color: "#10b981", flexShrink: 0 }} strokeWidth={1.5} />
                    <div>
                      <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600, marginBottom: 2 }}>Prochaine action recommandée</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>
                        {new Date(result.next_action_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: "20px 32px", background: "#0f0f13", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 11, color: "#3a3a5a" }}>Généré par Dealyze Smart Chase IA · XPRIZE 2026</p>
                <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${COLOR},#ea580c)`, cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 4px 14px ${GLOW}` }}>
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
