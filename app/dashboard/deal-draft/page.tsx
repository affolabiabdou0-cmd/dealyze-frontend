"use client";

import { useState } from "react";
import { FileText, Copy, Check, AlertCircle, Sparkles } from "lucide-react";
import { api } from "../../lib/api";

interface DealDraftContent {
  introduction?: string;
  description_besoin?: string;
  proposition_valeur?: string;
  livrables?: string[];
  calendrier?: string;
  budget_details?: string;
  conditions_paiement?: string;
  conclusion?: string;
  [key: string]: unknown;
}

interface DealDraftResult {
  quote_id: string;
  client_name: string;
  generated_at: string;
  tone: string;
  language: string;
  content: DealDraftContent;
}

const COLOR = "#7c3aed";
const GLOW  = "rgba(124,58,237,0.45)";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 10,
  border: "1px solid #2a2a3a", background: "#0f0f13",
  color: "#e2e8f0", fontSize: 14, outline: "none",
  transition: "border-color 0.15s", boxSizing: "border-box",
};
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.target.style.borderColor = COLOR;
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.target.style.borderColor = "#2a2a3a";
};

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

const SECTIONS: { key: keyof DealDraftContent; label: string }[] = [
  { key: "introduction",        label: "Introduction"          },
  { key: "description_besoin",  label: "Description du besoin" },
  { key: "proposition_valeur",  label: "Proposition de valeur" },
  { key: "calendrier",          label: "Calendrier"            },
  { key: "budget_details",      label: "Budget"                },
  { key: "conditions_paiement", label: "Conditions de paiement"},
  { key: "conclusion",          label: "Conclusion"            },
];

export default function DealDraftPage() {
  const [form, setForm] = useState({ client_name: "", sector: "", need: "", budget: "", timeline: "", language: "fr" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState<DealDraftResult | null>(null);
  const [copied, setCopied]   = useState(false);

  function set(field: string, val: string) { setForm((p) => ({ ...p, [field]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await api.post<DealDraftResult>("/agents/deal-draft/generate", form);
      setResult(res.data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Erreur lors de la génération. Réessayez.");
    } finally { setLoading(false); }
  }

  function copyText() {
    if (!result) return;
    const lines = [`DEVIS — ${result.quote_id}`, `Client : ${result.client_name}`, `Généré le : ${new Date(result.generated_at).toLocaleDateString("fr-FR")}`, ""];
    for (const s of SECTIONS) {
      const val = result.content[s.key];
      if (val && typeof val === "string") lines.push(`${s.label}:`, val, "");
    }
    if (result.content.livrables?.length) {
      lines.push("Livrables:", ...(result.content.livrables as string[]).map((l) => `• ${l}`), "");
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 22 }}>⚡</span>
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>Deal Draft</h2>
          <p style={{ fontSize: 13, color: "#4a4a6a" }}>Générez un devis professionnel en quelques secondes</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Form */}
        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 20 }}>Informations du deal</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <Label>Nom du client *</Label>
              <input type="text" required value={form.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="Acme Corp" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <Label>Secteur d&apos;activité *</Label>
              <input type="text" required value={form.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Agence web / E-commerce" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <Label>Besoin / Prestation *</Label>
              <textarea required value={form.need} onChange={(e) => set("need", e.target.value)} placeholder="Création d'un site e-commerce avec tableau de bord analytique..." rows={3}
                style={{ ...inputStyle, resize: "none", minHeight: 90 }} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Budget *</Label>
                <input type="text" required value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="8 000 €" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <Label>Délai *</Label>
                <input type="text" required value={form.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="6 semaines" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <div>
              <Label>Langue</Label>
              <select value={form.language} onChange={(e) => set("language", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }} onFocus={onFocus} onBlur={onBlur}>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "#1f1015", border: "1px solid #ef444433", color: "#f87171", fontSize: 13 }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                width: "100%", padding: "14px 20px", borderRadius: 10, border: "none",
                background: `linear-gradient(135deg, ${COLOR}, #6d28d9)`,
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
                : <><Sparkles size={15} /> Générer le devis</>}
            </button>
          </form>
        </Card>

        {/* Result */}
        <Card style={{ minHeight: 400 }}>
          {!result && !loading && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 20px" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `${COLOR}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, marginBottom: 16 }}>⚡</div>
              <p style={{ fontSize: 13, color: "#4a4a6a", maxWidth: 240, lineHeight: 1.6 }}>Remplissez le formulaire et cliquez sur Générer pour obtenir votre devis instantanément.</p>
            </div>
          )}
          {loading && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
              <div className="w-10 h-10 rounded-full animate-spin mb-4" style={{ border: `3px solid ${COLOR}22`, borderTopColor: COLOR }} />
              <p style={{ fontSize: 13, color: "#4a4a6a" }}>Gemini 2.5 génère votre devis…</p>
            </div>
          )}
          {result && (
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3a3a5a", marginBottom: 4 }}>{result.quote_id}</div>
                  <h4 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>{result.client_name}</h4>
                </div>
                <button onClick={copyText} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8,
                  border: "1px solid #2a2a3a", background: "none", cursor: "pointer",
                  color: "#6a6a8a", fontSize: 12,
                }}>
                  {copied ? <><Check size={13} style={{ color: "#10b981" }} /> Copié</> : <><Copy size={13} /> Copier</>}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: 480, overflowY: "auto", paddingRight: 4 }}>
                {SECTIONS.map((s) => {
                  const val = result.content[s.key];
                  if (!val || typeof val !== "string") return null;
                  return (
                    <div key={s.key}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR, marginBottom: 6 }}>{s.label}</div>
                      <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{val}</p>
                    </div>
                  );
                })}
                {Array.isArray(result.content.livrables) && result.content.livrables.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLOR, marginBottom: 6 }}>Livrables</div>
                    <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {(result.content.livrables as string[]).map((l, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#94a3b8", display: "flex", gap: 8 }}><span style={{ color: COLOR }}>•</span>{l}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
