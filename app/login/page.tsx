"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { login } from "../lib/auth";
import { getGoogleIdToken } from "../lib/firebase";
import { api, type TokenResponse } from "../lib/api";
import { saveAuth } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const idToken = await getGoogleIdToken();
      const res = await api.post<TokenResponse>("/auth/google", {
        firebase_token: idToken,
        profile: "pme",
      });
      saveAuth(res.data);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Connexion Google échouée. Réessayez.");
    } finally {
      setGoogleLoading(false);
    }
  }

  const inputFE = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#2563EB"),
    onBlur:  (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#E2E8F0"),
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F4F6F9" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12" style={{ background: "linear-gradient(135deg, #0A1A3E 0%, #0F2552 60%, #1A3A7A 100%)" }}>
        <div className="font-display text-2xl font-bold text-white">Dealyze</div>
        <div>
          <blockquote className="text-xl font-display italic text-white/80 leading-relaxed mb-4">
            &ldquo;Turn every deal into done.&rdquo;
          </blockquote>
          <p className="text-white/50 text-sm">4 agents IA pour automatiser chaque étape de vos deals.</p>
        </div>
        <div className="text-white/30 text-xs">© 2026 Dealyze · XPRIZE Hackathon</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <Link href="/" className="font-display text-xl font-bold lg:hidden" style={{ color: "#0F2552" }}>Dealyze</Link>
              <h1 className="text-2xl font-bold mt-4 mb-1" style={{ color: "#0F2552" }}>Bon retour</h1>
              <p className="text-sm text-gray-400">Connectez-vous à votre espace Dealyze</p>
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border font-medium text-sm transition-all hover:bg-gray-50 disabled:opacity-60 mb-5"
              style={{ borderColor: "#E2E8F0", color: "#1A1A2E" }}
            >
              {googleLoading ? (
                <span className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
              )}
              Continuer avec Google
            </button>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">ou avec votre email</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A2E" }}>Email</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@example.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: "#E2E8F0", background: "#FAFAFA" }}
                  {...inputFE}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A1A2E" }}>Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all pr-12"
                    style={{ borderColor: "#E2E8F0", background: "#FAFAFA" }}
                    {...inputFE}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                  <AlertCircle size={16} className="flex-shrink-0" />{error}
                </div>
              )}

              <button
                type="submit" disabled={loading || googleLoading}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ background: "#2563EB" }}
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Se connecter <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-gray-400">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: "#2563EB" }}>
                Créer un compte gratuit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
