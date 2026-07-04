"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle, Building2, TrendingUp } from "lucide-react";
import { register, saveAuth } from "../lib/auth";
import { signInWithGoogle } from "../lib/firebase";
import { api, type TokenResponse } from "../lib/api";

const AGENTS = [
  { icon: "⚡", name: "Deal Draft",  desc: "Propositions commerciales en 10s" },
  { icon: "💬", name: "Smart Chase", desc: "Relances impayés automatisées"     },
  { icon: "🎯", name: "Pitch Radar", desc: "Scoring pitch investisseurs"        },
  { icon: "🔍", name: "Deep Due",    desc: "Due diligence en 1 clic"           },
];

const PERKS = [
  "5 utilisations gratuites dès l'inscription",
  "Aucune carte bancaire requise",
  "Résultats en moins de 10 secondes",
];

function GIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [profile,  setProfile]  = useState<"pme" | "investisseur">("pme");
  const [fullName, setFullName] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères."); return; }
    setLoading(true);
    try {
      await register(email, password, fullName, profile);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          || "Une erreur est survenue. Réessayez."
      );
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setError(""); setGLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const res = await api.post<TokenResponse>("/auth/google", {
        firebase_token: idToken,
        profile,
      });
      saveAuth(res.data);
      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
        setError("Popup fermée. Réessayez ou désactivez votre bloqueur de popups.");
      } else if (code === "auth/unauthorized-domain") {
        setError("Domaine non autorisé dans Firebase. Contactez le support.");
      } else if (code === "auth/cancelled-popup-request") {
        setError("");
      } else {
        setError(
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            || "Connexion Google échouée. Réessayez."
        );
      }
      setGLoading(false);
    }
  }

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: 10,
    border: "1.5px solid #E2E8F0", fontSize: 14,
    outline: "none", background: "#F9FAFB",
    transition: "border-color 0.15s, background 0.15s",
    boxSizing: "border-box",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#2563EB"; e.target.style.background = "#fff";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#E2E8F0"; e.target.style.background = "#F9FAFB";
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT ── */}
      <div className="hidden lg:flex flex-col justify-between flex-1 relative overflow-hidden"
        style={{ padding:"52px 64px", background:"linear-gradient(150deg,#060C1A 0%,#0B1830 52%,#0F2552 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background:"radial-gradient(ellipse 70% 55% at 65% 25%, rgba(37,99,235,0.13) 0%, transparent 70%)" }} />

        <Link href="/" className="relative z-10" style={{ textDecoration:"none", display:"block" }}>
          <span style={{
            background: "linear-gradient(135deg, #8b5cf6, #22d3ee)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            fontSize: 54, fontWeight: 800, letterSpacing: "8px", display: "inline-block",
          }}>
            VY<span style={{ fontSize: "1.12em", fontWeight: 900 }}>X</span>EN
          </span>
        </Link>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2" style={{ background:"rgba(37,99,235,0.14)", border:"1px solid rgba(37,99,235,0.28)", borderRadius:100, padding:"5px 14px", marginBottom:28 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#34D399", display:"inline-block" }} />
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontWeight:600, letterSpacing:"0.08em" }}>XPRIZE AI HACKATHON 2026</span>
          </div>
          <h1 className="font-display" style={{ fontSize:"clamp(34px,3.4vw,50px)", fontWeight:700, color:"#fff", lineHeight:1.1, letterSpacing:"-1px", marginBottom:20 }}>
            Automatisez vos deals<br /><em style={{ color:"#60A5FA", fontStyle:"italic" }}>dès aujourd&apos;hui.</em>
          </h1>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:40 }}>
            {PERKS.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <div style={{ width:20, height:20, borderRadius:"50%", flexShrink:0, background:"rgba(37,99,235,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:"#60A5FA", fontSize:11, fontWeight:700 }}>✓</span>
                </div>
                <span style={{ fontSize:14, color:"rgba(255,255,255,0.55)" }}>{p}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {AGENTS.map((a) => (
              <div key={a.name} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 18px", background:"rgba(255,255,255,0.035)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14 }}>
                <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, background:"rgba(37,99,235,0.22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19 }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.9)" }}>{a.name}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.36)", marginTop:2 }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10" style={{ fontSize:12, color:"rgba(255,255,255,0.18)" }}>© 2026 VYXEN · XPRIZE Hackathon</div>
      </div>

      {/* ── RIGHT ── */}
      <div className="w-full lg:w-[500px] lg:flex-none flex items-center justify-center overflow-y-auto"
        style={{ background:"#fff", padding:"48px 28px", minHeight:"100vh" }}>
        <div style={{ width:"100%", maxWidth:380, paddingTop:8, paddingBottom:8 }}>

          <Link href="/" className="lg:hidden font-display text-xl font-bold"
            style={{ textDecoration:"none", display:"block", marginBottom:28 }}>
            <span style={{
              background: "linear-gradient(135deg, #8b5cf6, #22d3ee)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              fontSize: 28, fontWeight: 800, letterSpacing: "5px", display: "inline-block",
            }}>
              VY<span style={{ fontSize: "1.12em", fontWeight: 900 }}>X</span>EN
            </span>
          </Link>

          <h2 style={{ fontSize:28, fontWeight:700, color:"#0A1628", letterSpacing:"-0.75px", marginBottom:4 }}>Créer votre compte</h2>
          <p style={{ fontSize:14, color:"#94A3B8", marginBottom:26 }}>Gratuit · Sans CB · 30 secondes</p>

          {/* Profile selector */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>Je suis</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {([
                { value:"pme" as const,          label:"PME / Commercial",  Icon:Building2  },
                { value:"investisseur" as const,  label:"Investisseur / VC", Icon:TrendingUp },
              ] as const).map(({ value, label, Icon }) => (
                <button key={value} type="button" onClick={() => setProfile(value)}
                  style={{ display:"flex", alignItems:"center", gap:9, padding:"11px 14px", borderRadius:10, border:`1.5px solid ${profile===value?"#2563EB":"#E2E8F0"}`, background:profile===value?"#EFF6FF":"#F9FAFB", color:profile===value?"#2563EB":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                  <Icon size={15} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Google */}
          <button type="button" onClick={handleGoogle} disabled={gLoading || loading}
            className="w-full flex items-center justify-center gap-3"
            style={{ padding:"15px 20px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:14, fontWeight:600, color:"#111827", cursor:(gLoading||loading)?"default":"pointer", marginBottom:20, opacity:(gLoading||loading)?0.6:1, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", transition:"background 0.12s, box-shadow 0.12s" }}
            onMouseEnter={(e) => { if (!gLoading && !loading) { e.currentTarget.style.background="#F9FAFB"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.08)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background="#fff"; e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.06)"; }}
          >
            {gLoading ? <span className="w-[18px] h-[18px] rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" /> : <GIcon />}
            Continuer avec Google
          </button>

          <div className="flex items-center gap-4" style={{ marginBottom:20 }}>
            <div className="flex-1" style={{ height:1, background:"#F1F5F9" }} />
            <span style={{ fontSize:12, color:"#CBD5E1", fontWeight:500 }}>ou avec email</span>
            <div className="flex-1" style={{ height:1, background:"#F1F5F9" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Nom complet</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jean Dupont" style={inputBase} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@example.com" style={inputBase} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Mot de passe</label>
              <div style={{ position:"relative" }}>
                <input type={showPw?"text":"password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  style={{ ...inputBase, paddingRight:44 }} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", padding:0, display:"flex" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 14px", borderRadius:10, background:"#FEF2F2", color:"#DC2626", fontSize:13 }}>
                <AlertCircle size={14} style={{ flexShrink:0 }} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading || gLoading}
              className="w-full flex items-center justify-center gap-2"
              style={{ padding:"15px 20px", borderRadius:12, background:"#2563EB", color:"#fff", border:"none", cursor:(loading||gLoading)?"default":"pointer", fontSize:14, fontWeight:700, opacity:(loading||gLoading)?0.7:1, boxShadow:"0 4px 14px rgba(37,99,235,0.3)", transition:"background 0.12s, box-shadow 0.12s", marginTop:4 }}
              onMouseEnter={(e) => { if (!loading && !gLoading) { e.currentTarget.style.background="#1D4ED8"; e.currentTarget.style.boxShadow="0 6px 20px rgba(37,99,235,0.4)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background="#2563EB"; e.currentTarget.style.boxShadow="0 4px 14px rgba(37,99,235,0.3)"; }}
            >
              {loading ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Créer mon compte <ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ marginTop:24, textAlign:"center", fontSize:13, color:"#94A3B8" }}>
            Déjà un compte ?{" "}
            <Link href="/login" style={{ color:"#2563EB", fontWeight:600, textDecoration:"none" }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
