"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "../lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: 10,
    border: "1.5px solid #E2E8F0", fontSize: 14,
    outline: "none", background: "#F9FAFB",
    transition: "border-color 0.15s, background 0.15s",
    boxSizing: "border-box",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("8 caractères minimum."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          || "Lien invalide ou expiré. Refaites une demande."
      );
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

        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={26} style={{ color: "#10B981" }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginBottom: 10 }}>Mot de passe mis à jour</h2>
            <p style={{ fontSize: 14, color: "#64748B" }}>Redirection vers la connexion…</p>
          </div>
        ) : !token ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <AlertCircle size={26} style={{ color: "#DC2626", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 10 }}>Lien invalide</h2>
            <p style={{ fontSize: 14, color: "#64748B", marginBottom: 20 }}>Ce lien de réinitialisation est incomplet ou a expiré.</p>
            <Link href="/forgot-password" style={{ fontSize: 13.5, color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Refaire une demande →</Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A1628", letterSpacing: "-0.5px", marginBottom: 8 }}>Nouveau mot de passe</h2>
            <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 28 }}>Choisissez un mot de passe d&apos;au moins 8 caractères.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Nouveau mot de passe</label>
                <div style={{ position: "relative" }}>
                  <input type={showPw ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    style={{ ...inputBase, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, display: "flex" }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Confirmer le mot de passe</label>
                <input type={showPw ? "text" : "password"} required value={confirm}
                  onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" style={inputBase} />
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
                  : <>Réinitialiser <ArrowRight size={15} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
