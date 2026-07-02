"use client";

import { useState } from "react";
import { Mail, Copy, Check, AlertCircle, Sparkles, Calendar } from "lucide-react";
import { api } from "../../lib/api";

interface SmartChaseResult {
  chase_id: string;
  invoice_id: string;
  client_name: string;
  amount_display: string;
  days_overdue: number;
  escalation_level: number;
  client_profile: string;
  tone: string;
  email_subject: string;
  email_body: string;
  next_action_date: string;
  generated_at: string;
}

const FIELD = "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white";
const FE = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#7C3AED"),
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => (e.target.style.borderColor = "#E2E8F0"),
};

export default function SmartChasePage() {
  const [form, setForm] = useState({
    invoice_id: "",
    client_name: "",
    amount: "",
    currency: "EUR",
    due_date: "",
    issue_date: "",
    description: "",
    previous_reminders: "0",
    payment_history: "nouveau_client",
    company_name: "",
    chase_style: "professionnel",
    language: "fr",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SmartChaseResult | null>(null);
  const [copied, setCopied] = useState(false);

  function set(f: string, v: string) { setForm((p) => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<SmartChaseResult>("/agents/smart-chase/generate", {
        invoice: {
          invoice_id: form.invoice_id || `FAC-${Date.now()}`,
          client_name: form.client_name,
          amount: parseFloat(form.amount) || 0,
          currency: form.currency,
          due_date: form.due_date,
          issue_date: form.issue_date,
          description: form.description,
          previous_reminders: parseInt(form.previous_reminders) || 0,
          payment_history: form.payment_history,
        },
        company_name: form.company_name,
        chase_style: form.chase_style,
        language: form.language,
      });
      setResult(res.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Erreur lors de la génération. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  function copyEmail() {
    if (!result) return;
    const text = `Objet : ${result.email_subject}\n\n${result.email_body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const ESCALATION_LABELS = ["", "Rappel doux", "Relance ferme", "Mise en demeure"];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F5F3FF", color: "#7C3AED" }}>
          <Mail size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#0F2552" }}>Smart Chase</h2>
          <p className="text-sm text-gray-400">Relance de factures impayées — email personnalisé selon le profil client</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-sm mb-5" style={{ color: "#0F2552" }}>Détails de la facture</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Votre entreprise *</label>
                <input type="text" required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Mon Agence SAS" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Nom du client *</label>
                <input type="text" required value={form.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="Acme Corp" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Montant *</label>
                <input type="number" required value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="3 500" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Devise</label>
                <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE}>
                  {["EUR", "USD", "XOF", "MAD", "GBP"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Date d&apos;émission *</label>
                <input type="date" required value={form.issue_date} onChange={(e) => set("issue_date", e.target.value)} className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Date d&apos;échéance *</label>
                <input type="date" required value={form.due_date} onChange={(e) => set("due_date", e.target.value)} className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Description de la prestation</label>
              <input type="text" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Développement site e-commerce Phase 1" className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Relances précédentes</label>
                <select value={form.previous_reminders} onChange={(e) => set("previous_reminders", e.target.value)} className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE}>
                  <option value="0">Aucune (1ère relance)</option>
                  <option value="1">1 relance</option>
                  <option value="2">2 relances</option>
                  <option value="3">3 relances ou plus</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Profil client</label>
                <select value={form.payment_history} onChange={(e) => set("payment_history", e.target.value)} className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE}>
                  <option value="nouveau_client">Nouveau client</option>
                  <option value="bon_payeur">Bon payeur habituel</option>
                  <option value="retardataire">Retardataire habituel</option>
                  <option value="mauvais_payeur">Mauvais payeur</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Style de relance</label>
                <select value={form.chase_style} onChange={(e) => set("chase_style", e.target.value)} className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE}>
                  {["professionnel", "amical", "ferme", "juridique"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Langue</label>
                <select value={form.language} onChange={(e) => set("language", e.target.value)} className={FIELD} style={{ borderColor: "#E2E8F0" }} {...FE}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "#7C3AED" }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération…</>
                : <><Sparkles size={16} /> Générer la relance</>}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center" style={{ background: "#F5F3FF" }}>
                <Mail size={28} style={{ color: "#7C3AED" }} />
              </div>
              <p className="text-sm text-gray-400 max-w-xs">Entrez les détails de la facture impayée pour générer une relance personnalisée et professionnelle.</p>
            </div>
          )}
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full animate-spin mb-4" style={{ border: "3px solid #F5F3FF", borderTopColor: "#7C3AED" }} />
              <p className="text-sm text-gray-400">Gemini génère votre relance…</p>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              {/* Meta */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-mono text-xs text-gray-400">{result.chase_id}</div>
                    <h4 className="font-bold" style={{ color: "#0F2552" }}>{result.client_name}</h4>
                    <p className="text-sm text-gray-400">{result.amount_display}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: "#F5F3FF", color: "#7C3AED" }}>
                      {ESCALATION_LABELS[result.escalation_level] ?? `Niveau ${result.escalation_level}`}
                    </div>
                    <div className="text-xs text-gray-400">{result.days_overdue} jours de retard</div>
                  </div>
                </div>
                {result.next_action_date && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 p-2 rounded-lg" style={{ background: "#FFFBEB" }}>
                    <Calendar size={13} style={{ color: "#D97706" }} />
                    <span>Prochaine action : <strong style={{ color: "#D97706" }}>{result.next_action_date}</strong></span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm" style={{ color: "#0F2552" }}>Email de relance</h4>
                  <button onClick={copyEmail} className="p-1.5 rounded-lg border hover:bg-gray-50 flex items-center gap-1.5 text-xs text-gray-500" style={{ borderColor: "#E2E8F0" }}>
                    {copied ? <><Check size={13} style={{ color: "#16A34A" }} /> Copié</> : <><Copy size={13} /> Copier</>}
                  </button>
                </div>
                <div className="mb-3 p-3 rounded-xl" style={{ background: "#F4F6F9" }}>
                  <div className="text-xs text-gray-400 mb-0.5">Objet</div>
                  <div className="text-sm font-medium" style={{ color: "#0F2552" }}>{result.email_subject}</div>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line" style={{ maxHeight: "380px", overflowY: "auto" }}>
                  {result.email_body}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
