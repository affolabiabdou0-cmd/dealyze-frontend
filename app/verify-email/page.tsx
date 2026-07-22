"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { api, getErrorMessage } from "../lib/api";

export default function VerifyEmailPage() {
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Vérification en cours…");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setState("error");
      setMessage("Lien de vérification incomplet.");
      return;
    }
    api.get("/auth/verify-email", { params: { token } })
      .then(() => {
        setState("success");
        setMessage("Votre email a été vérifié avec succès.");
      })
      .catch((err: unknown) => {
        setState("error");
        setMessage(getErrorMessage(err, "Lien invalide ou expiré."));
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F9FAFB", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 16, padding: "48px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", textAlign: "center" }}>
        {state === "loading" && (
          <>
            <Loader2 size={30} className="animate-spin" style={{ color: "#7c3aed", margin: "0 auto 20px" }} />
            <p style={{ fontSize: 14, color: "#64748B" }}>{message}</p>
          </>
        )}
        {state === "success" && (
          <>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={26} style={{ color: "#10B981" }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginBottom: 10 }}>Email vérifié</h2>
            <p style={{ fontSize: 14, color: "#64748B", marginBottom: 24 }}>{message}</p>
            <Link href="/dashboard" style={{ fontSize: 13.5, color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Aller au tableau de bord →</Link>
          </>
        )}
        {state === "error" && (
          <>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <AlertCircle size={26} style={{ color: "#DC2626" }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginBottom: 10 }}>Vérification échouée</h2>
            <p style={{ fontSize: 14, color: "#64748B", marginBottom: 24 }}>{message}</p>
            <Link href="/dashboard/settings" style={{ fontSize: 13.5, color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Renvoyer un email depuis les paramètres →</Link>
          </>
        )}
      </div>
    </div>
  );
}
