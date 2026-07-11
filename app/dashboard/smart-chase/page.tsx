"use client";

import { useState, useEffect } from "react";
import { Mail, Copy, Check, AlertCircle, Sparkles, Calendar, Download, Building2, Wallet, Clock, AlertTriangle, TrendingUp, User, type LucideIcon } from "lucide-react";
import { api } from "../../lib/api";
import { addActivity } from "../../lib/activity";
import { getUser } from "../../lib/auth";
import PageHeader from "../../components/PageHeader";

interface SmartChaseResult {
  chase_id: string; invoice_id: string; client_name: string; amount_display: string;
  days_overdue: number; escalation_level: number; client_profile: string; tone: string;
  email_subject: string; email_body: string; next_action_date: string; generated_at: string;
}

const COLOR = "#f97316";
const GLOW  = "rgba(249,115,22,0.3)";

const ANIM_STYLE = `
  @keyframes fadeInSection { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeInFast { from { opacity:0; } to { opacity:1; } }
`;

type EscCfg = { label: string; color: string; bg: string };
const ESCALATION_CONFIG: EscCfg[] = [
  { label: "Inconnu",         color: COLOR,     bg: "#fff7ed"   },
  { label: "Rappel doux",     color: "#10b981", bg: "#f0fdf4"   },
  { label: "Relance ferme",   color: "#f59e0b", bg: "#fffbeb"   },
  { label: "Mise en demeure", color: "#ef4444", bg: "#fef2f2"   },
  { label: "Alerte critique", color: "#dc2626", bg: "#fef2f2"   },
];

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

export default function SmartChasePage() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  useEffect(() => { setUser(getUser()); }, []);
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
      const esc = ESCALATION_CONFIG[res.data.escalation_level] ?? ESCALATION_CONFIG[0];
      addActivity({
        type: "smart_chase",
        title: `Relance générée — ${esc.label}`,
        subtitle: `${res.data.client_name} · ${res.data.amount_display} · ${res.data.days_overdue}j de retard`,
        timestamp: new Date().toISOString(),
        href: "/dashboard/smart-chase",
        details: [
          { label: "Client",          value: res.data.client_name },
          { label: "Montant",         value: res.data.amount_display },
          { label: "Retard",          value: `${res.data.days_overdue} jours` },
          { label: "Niveau escalade", value: `${res.data.escalation_level}/4 — ${esc.label}` },
          { label: "Objet email",     value: res.data.email_subject },
          { label: "Facture",         value: res.data.invoice_id },
        ],
      });
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
    const esc = lvl >= 1 && lvl <= 4 ? ESCALATION_CONFIG[lvl] : { label: `Niveau ${lvl}`, color: COLOR, bg: "#fff7ed" };
    const emailLines = result.email_body.split("\n").map((l) => l ? `<p>${l}</p>` : "<br>").join("");

    const dateStr = new Date(result.generated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    win.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Relance — ${result.client_name}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c0a00;background:#fff;line-height:1.7;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:794px;margin:0 auto}
/* ── Banner ── */
.banner{background:linear-gradient(135deg,#9a3412 0%,#c2410c 50%,#ea580c 100%);padding:32px 56px 28px}
.brand-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px}
.brand-name{font-size:24px;font-weight:900;letter-spacing:5px;color:#fff;line-height:1}
.brand-x{font-size:1.65em;font-weight:900;line-height:.85;letter-spacing:0;color:#fed7aa}
.brand-sub{font-size:9.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-top:5px}
.doc-meta{text-align:right}.doc-id{font-family:monospace;font-size:10.5px;color:rgba(255,255,255,.45);margin-bottom:3px}.doc-date{font-size:12px;color:rgba(255,255,255,.65)}
.banner-title{font-size:24px;font-weight:800;color:#fff;letter-spacing:-.5px;margin-bottom:8px}
.banner-badge{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;padding:6px 16px;border-radius:20px;background:rgba(255,255,255,.18);color:#fff;border:1px solid rgba(255,255,255,.3)}
/* ── Body ── */
.body{padding:36px 56px 52px}
/* Info grid */
.info-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#fed7aa;border-radius:12px;overflow:hidden;margin-bottom:28px;border:1px solid #fed7aa}
.info-cell{background:#fff8f5;padding:16px 18px}.il{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#fb923c;margin-bottom:5px}.iv{font-size:13px;font-weight:700;color:#1c0a00}
/* Alert */
.alert-bar{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:10px;background:${esc.bg};border:1px solid ${esc.color}44;margin-bottom:24px}
.at{font-size:13px;font-weight:700;color:${esc.color}}.as{font-size:12px;color:#666;margin-top:2px}
/* Email */
.email-wrap{border:1.5px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.email-head{background:linear-gradient(135deg,#fff8f5,#fff);border-bottom:1px solid #fed7aa;padding:18px 22px}
.email-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#fb923c;margin-bottom:5px}
.email-subject{font-size:15px;font-weight:700;color:#1c0a00}
.email-body{padding:24px 28px}.email-body p{font-size:13.5px;color:#374151;line-height:1.85}
/* Next action */
.next-box{display:flex;align-items:center;gap:14px;padding:16px 20px;border-radius:12px;background:#f0fdf4;border:1.5px solid #86efac;margin-bottom:24px}
.next-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#16a34a;margin-bottom:3px}.next-date{font-size:14px;font-weight:700;color:#15803d}
/* Footer */
.footer{display:flex;justify-content:space-between;align-items:center;margin-top:40px;padding-top:20px;border-top:2px solid #fef3c7}
.footer-left{font-size:11px;color:#9ca3af;line-height:1.7}
.footer-badge{background:linear-gradient(135deg,#c2410c,#ea580c);color:#fff;font-size:10px;font-weight:700;padding:7px 16px;border-radius:8px;letter-spacing:.06em}
@media print{.banner{padding:24px 40px 20px}.body{padding:28px 40px 36px}}
</style></head><body>
<div class="page">
  <div class="banner">
    <div class="brand-row">
      <div>
        <div class="brand-name">VY<span class="brand-x">X</span>EN</div>
        <div class="brand-sub">Smart Chase &middot; Relance Impayés</div>
      </div>
      <div class="doc-meta">
        <div class="doc-id">${result.chase_id}</div>
        <div class="doc-date">Généré le ${dateStr}</div>
      </div>
    </div>
    <div class="banner-title">Relance — ${result.client_name}</div>
    <div class="banner-badge">${esc.label} &nbsp;·&nbsp; Niveau ${result.escalation_level}/4</div>
  </div>
  <div class="body">
    <div class="info-bar">
      <div class="info-cell"><div class="il">Client</div><div class="iv">${result.client_name}</div></div>
      <div class="info-cell"><div class="il">Montant</div><div class="iv">${result.amount_display}</div></div>
      <div class="info-cell"><div class="il">Retard</div><div class="iv">${result.days_overdue} jours</div></div>
      <div class="info-cell"><div class="il">Facture</div><div class="iv">${result.invoice_id}</div></div>
    </div>
    <div class="alert-bar"><div><div class="at">Niveau d'escalade ${result.escalation_level}/4 — ${esc.label}</div><div class="as">Ton appliqué : ${result.tone}</div></div></div>
    <div class="email-wrap">
      <div class="email-head"><div class="email-label">Objet de l'email</div><div class="email-subject">${result.email_subject}</div></div>
      <div class="email-body">${emailLines}</div>
    </div>
    ${result.next_action_date ? `<div class="next-box"><span style="font-size:22px">📅</span><div><div class="next-label">Prochaine action recommandée</div><div class="next-date">${new Date(result.next_action_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div></div></div>` : ""}
    <div class="footer">
      <div class="footer-left">Document généré par VYXEN Smart Chase IA &middot; ${new Date().getFullYear()}<br>Confidentiel — destiné uniquement au destinataire désigné.</div>
      <div class="footer-badge">VYXEN &middot; XPRIZE 2026</div>
    </div>
  </div>
</div></body></html>`);
    setTimeout(() => { win.print(); }, 300);
  }

  const lvl = result?.escalation_level ?? 0;
  const esc = lvl >= 1 && lvl <= 4 ? ESCALATION_CONFIG[lvl] : { label: `Niveau ${lvl}`, color: COLOR, bg: "#fff7ed" };

  return (
    <div className="w-full">
      <style>{ANIM_STYLE}</style>

      <PageHeader
        title="Smart Chase"
        subtitle="Transformez vos impayés en paiements avec des relances IA calibrées au profil de chaque client"
        accentColor={COLOR}
        icon={<Mail size={22} style={{ color: COLOR }} strokeWidth={1.75} />}
        plan={user?.plan}
      />

      <div className={result ? "block" : "grid lg:grid-cols-2 gap-6"}>
        {/* FORM */}
        {!result && (
          <div style={{ ...CARD, padding: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 20 }}>Détails de la facture</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
                <div><Label>Votre entreprise *</Label><input type="text" required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Mon Agence SAS" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
                <div><Label>Nom du client *</Label><input type="text" required value={form.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="Acme Corp" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
                <div><Label>Montant *</Label><input type="number" required value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="3 500" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
                <div><Label>Devise</Label>
                  <select value={form.currency} onChange={(e) => set("currency", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                    {["EUR","USD","XOF","MAD","GBP"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
                <div><Label>Date d&apos;émission *</Label><input type="date" required value={form.issue_date} onChange={(e) => set("issue_date", e.target.value)} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
                <div><Label>Date d&apos;échéance *</Label><input type="date" required value={form.due_date} onChange={(e) => set("due_date", e.target.value)} style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
              </div>
              <div><Label>Description de la prestation</Label><input type="text" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Développement site e-commerce Phase 1" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13 }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "13px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${COLOR},#ea580c)`, color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: `0 4px 14px ${GLOW}` }}>
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération…</> : <><Sparkles size={15} strokeWidth={1.75} /> Générer la relance</>}
              </button>
            </form>
          </div>
        )}

        {loading && !result && (
          <div style={{ ...CARD, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
            <div className="w-12 h-12 rounded-full animate-spin mb-5" style={{ border: "3px solid #fff7ed", borderTopColor: COLOR }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>Gemini rédige votre relance…</p>
            <p style={{ fontSize: 12, color: "#94a3b8" }}>Analyse du profil client et calibrage du ton</p>
          </div>
        )}
        {!result && !loading && (
          <div style={{ ...CARD, padding: 28, display: "flex", flexDirection: "column", minHeight: 400 }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Mail size={24} style={{ color: COLOR }} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Relances IA intelligentes</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                Smart Chase analyse le profil de votre débiteur et génère un email calibré pour maximiser vos chances de recouvrement.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
              {[
                "Niveau d'escalade automatiquement déterminé",
                "Ton adapté au profil de paiement du client",
                "Email rédigé, objet et corps inclus",
                "Date de relance suivante recommandée",
                "Export PDF conforme pour archivage",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#334155" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={11} style={{ color: COLOR }} strokeWidth={2.5} />
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto", padding: "14px 18px", borderRadius: 11, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 4 }}>Taux de recouvrement moyen</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>+34% après relance IA</div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div style={{ animation: "fadeInFast 0.4s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={() => { setResult(null); setError(""); }}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#64748b", fontSize: 12, fontWeight: 600 }}>
                ← Nouvelle relance
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copyEmail} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#64748b", fontSize: 12 }}>
                  {copied ? <><Check size={12} style={{ color: "#10b981" }} /> Copié</> : <><Copy size={12} strokeWidth={1.75} /> Copier l&apos;email</>}
                </button>
                <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: `linear-gradient(135deg,${COLOR},#ea580c)`, cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 2px 8px ${GLOW}` }}>
                  <Download size={12} strokeWidth={1.75} /> Télécharger PDF
                </button>
              </div>
            </div>

            <div style={{ ...CARD, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg,#fff7ed,#fffbf5)", borderBottom: "1px solid #fed7aa", padding: "28px 32px", animation: "fadeInSection 0.4s ease both" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{result.chase_id}</div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", marginBottom: 4 }}>Relance — {result.client_name}</h3>
                    <p style={{ fontSize: 13, color: COLOR, fontWeight: 600 }}>{esc.label} · {result.days_overdue} jours de retard · {result.amount_display}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: esc.bg, color: esc.color, border: `1px solid ${esc.color}33` }}>
                      <AlertTriangle size={11} /> {esc.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Niveau {result.escalation_level}/4</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {([
                    { Icon: Building2,  label: form.company_name },
                    { Icon: Wallet,     label: result.amount_display },
                    { Icon: Clock,      label: `${result.days_overdue}j de retard` },
                    { Icon: User,       label: result.client_profile?.replace("_", " ") },
                    { Icon: TrendingUp, label: result.tone },
                  ] as { Icon: LucideIcon; label: string }[]).filter((p) => p.label).map(({ Icon, label }, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, background: "#fff", border: "1px solid #e2e8f0", fontSize: 11, color: "#64748b" }}>
                      <Icon size={10} style={{ color: COLOR }} /> {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Email subject */}
              <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", animation: "fadeInSection 0.4s ease both", animationDelay: "80ms" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mail size={13} style={{ color: COLOR }} strokeWidth={1.75} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR }}>Objet de l&apos;email</span>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 10, background: "#fffbf5", border: `1px solid ${COLOR}33` }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{result.email_subject}</p>
                </div>
              </div>

              {/* Email body */}
              <div style={{ padding: "24px 32px", borderBottom: "1px solid #f1f5f9", animation: "fadeInSection 0.4s ease both", animationDelay: "160ms" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={13} style={{ color: COLOR }} strokeWidth={1.75} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR }}>Corps du message</span>
                </div>
                <div style={{ padding: "20px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 13.5, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {result.email_body}
                </div>
              </div>

              {/* Next action */}
              {result.next_action_date && (
                <div style={{ padding: "20px 32px", borderBottom: "1px solid #f1f5f9", animation: "fadeInSection 0.4s ease both", animationDelay: "240ms" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #86efac" }}>
                    <Calendar size={16} style={{ color: "#10b981", flexShrink: 0 }} strokeWidth={1.75} />
                    <div>
                      <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600, marginBottom: 2 }}>Prochaine action recommandée</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>
                        {new Date(result.next_action_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: "20px 32px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 11, color: "#94a3b8" }}>Généré par VYXEN Smart Chase IA · XPRIZE 2026</p>
                <button onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${COLOR},#ea580c)`, cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 4px 14px ${GLOW}` }}>
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
