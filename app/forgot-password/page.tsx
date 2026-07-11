"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: 10,
    border: "1.5px solid #E2E8F0", fontSize: 14,
    outline: "none", background: "#F9FAFB",
    transition: "border-color 0.15s, background 0.15s",
    boxSizing: "border-box",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      // L'API renvoie toujours 200 pour cette route — une erreur ici est réseau/serveur, pas "email inconnu".
      setError("Une erreur est survenue. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F9FAFB", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 16, padding: "40px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

        <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94A3B8", textDecoration: "none", marginBottom: 24 }}>
          <ArrowLeft size={14} /> Retour à la connexion
        </Link>

        {sent ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={26} style={{ color: "#10B981" }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginBottom: 10 }}>Email envoyé</h2>
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7 }}>
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>, un lien de réinitialisation vient d&apos;être envoyé. Vérifiez votre boîte de réception (et les spams).
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A1628", letterSpacing: "-0.5px", marginBottom: 8 }}>Mot de passe oublié</h2>
            <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 28 }}>Entrez votre email, on vous envoie un lien pour le réinitialiser.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@example.com" style={inputBase} />
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "#FEF2F2", color: "#DC2626", fontSize: 13 }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2"
                style={{ padding: "14px 20px", borderRadius: 12, background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", color: "#fff", border: "none", cursor: loading ? "default" : "pointer", fontSize: 14, fontWeight: 700, opacity: loading ? 0.7 : 1 }}
              >
                {loading
                  ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <>Envoyer le lien <ArrowRight size={15} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
