"use client";

import { useState } from "react";
import { Mail, Copy, Check, AlertCircle, Sparkles, Calendar } from "lucide-react";
import { api } from "../../lib/api";

interface SmartChaseResult {
  chase_id:         string;
  invoice_id:       string;
  client_name:      string;
  amount_display:   string;
  days_overdue:     number;
  escalation_level: number;
  client_profile:   string;
  tone:             string;
  email_subject:    string;
  email_body:       string;
  next_action_date: string;
  generated_at:     string;
}

const COLOR = "#f97316";
const GLOW  = "rgba(249,115,22,0.45)";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  border: "1px solid #2a2a3a", background: "#0f0f13",
  color: "#e2e8f0", fontSize: 14, outline: "none",
  transition: "border-color 0.15s", boxSizing: "border-box",
};
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  (e.target.style.borderColor = COLOR);
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  (e.target.style.borderColor = "#2a2a3a");

const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 6 }}>
    {children}
  </label>
);
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 16, padding: "24px", ...style }}>
    {children}
  </div>
);

const ESCALATION_LABELS = ["", "Rappel doux", "Relance ferme", "Mise en demeure"];

export default function SmartChasePage() {
  const [form, setForm] = useState({
    invoice_id:          "",
    client_name:         "",
    amount:              "",
    currency:            "EUR",
    due_date:            "",
    issue_date:          "",
    description:         "",
    previous_reminders:  "0",
    payment_history:     "nouveau_client",
    company_name:        "",
    chase_style:         "professionnel",
    language:            "fr",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<SmartChaseResult | null>(null);
  const [copied, setCopied]   = useState(false);

  function set(f: string, v: string) { setForm((p) => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 22 }}>💬</span>
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>Smart Chase</h2>
          <p style={{ fontSize: 13, color: "#4a4a6a" }}>Relances intelligentes pour vos factures impayées</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Form */}
        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20 }}>Détails de la facture</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Votre entreprise *</Label>
                <input type="text" required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Mon Agence SAS" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <Label>Nom du client *</Label>
                <input type="text" required value={form.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="Acme Corp" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Montant *</Label>
                <input type="number" required value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="3 500" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <Label>Devise</Label>
                <select value={form.currency} onChange={(e) => set("currency", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  {["EUR", "USD", "XOF", "MAD", "GBP"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Date d&apos;émission *</Label>
                <input type="date" required value={form.issue_date} onChange={(e) => set("issue_date", e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <Label>Date d&apos;échéance *</Label>
                <input type="date" required value={form.due_date} onChange={(e) => set("due_date", e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div>
              <Label>Description de la prestation</Label>
              <input type="text" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Développement site e-commerce Phase 1" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Relances précédentes</Label>
                <select value={form.previous_reminders} onChange={(e) => set("previous_reminders", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="0">Aucune (1ère relance)</option>
                  <option value="1">1 relance</option>
                  <option value="2">2 relances</option>
                  <option value="3">3 ou plus</option>
                </select>
              </div>
              <div>
                <Label>Profil client</Label>
                <select value={form.payment_history} onChange={(e) => set("payment_history", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="nouveau_client">Nouveau client</option>
                  <option value="bon_payeur">Bon payeur</option>
                  <option value="retardataire">Retardataire</option>
                  <option value="mauvais_payeur">Mauvais payeur</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Style de relance</Label>
                <select value={form.chase_style} onChange={(e) => set("chase_style", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  {["professionnel", "amical", "ferme", "juridique"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label>Langue</Label>
                <select value={form.language} onChange={(e) => set("language", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "#1f1015", border: "1px solid #ef444433", color: "#f87171", fontSize: 13 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: "100%", padding: "14px 20px", borderRadius: 10, border: "none",
                background: `linear-gradient(135deg, ${COLOR}, #ea580c)`,
                color: "#fff", fontSize: 14, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1,
                boxShadow: `0 4px 14px ${GLOW}`, transition: "box-shadow 0.15s",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = `0 8px 24px ${GLOW}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 14px ${GLOW}`; }}
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération…</>
                : <><Sparkles size={15} /> Générer la relance</>}
            </button>
          </form>
        </Card>

        {/* Result */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!result && !loading && (
            <Card style={{ minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, marginBottom: 16 }}>💬</div>
              <p style={{ fontSize: 13, color: "#4a4a6a", maxWidth: 240, lineHeight: 1.6 }}>Entrez les détails de la facture impayée pour générer une relance personnalisée et professionnelle.</p>
            </Card>
          )}
          {loading && (
            <Card style={{ minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div className="w-10 h-10 rounded-full animate-spin mb-4" style={{ border: `3px solid ${COLOR}22`, borderTopColor: COLOR }} />
              <p style={{ fontSize: 13, color: "#4a4a6a" }}>Gemini 2.5 rédige votre relance…</p>
            </Card>
          )}
          {result && (
            <>
              {/* Meta card */}
              <Card>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3a3a5a", marginBottom: 4 }}>{result.chase_id}</div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{result.client_name}</h4>
                    <p style={{ fontSize: 13, color: "#4a4a6a" }}>{result.amount_display}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: `${COLOR}18`, color: COLOR, marginBottom: 4 }}>
                      {ESCALATION_LABELS[result.escalation_level] ?? `Niveau ${result.escalation_level}`}
                    </span>
                    <div style={{ fontSize: 11, color: "#4a4a6a" }}>{result.days_overdue} jours de retard</div>
                  </div>
                </div>
                {result.next_action_date && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#0f0f13", border: "1px solid #2a2a3a" }}>
                    <Calendar size={13} style={{ color: COLOR, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#6a6a8a" }}>Prochaine action : <strong style={{ color: "#94a3b8" }}>{result.next_action_date}</strong></span>
                  </div>
                )}
              </Card>

              {/* Email card */}
              <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mail size={14} style={{ color: COLOR }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Email de relance</span>
                  </div>
                  <button onClick={copyEmail} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 7,
                    border: "1px solid #2a2a3a", background: "none", cursor: "pointer", color: "#6a6a8a", fontSize: 11,
                  }}>
                    {copied ? <><Check size={11} style={{ color: "#10b981" }} /> Copié</> : <><Copy size={11} /> Copier</>}
                  </button>
                </div>
                <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: "#0f0f13", border: "1px solid #2a2a3a" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR, marginBottom: 4 }}>Objet</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{result.email_subject}</div>
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.75, whiteSpace: "pre-wrap", maxHeight: 300, overflowY: "auto", padding: "14px 16px", background: "#0f0f13", borderRadius: 8, border: "1px solid #2a2a3a" }}>
                  {result.email_body}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
