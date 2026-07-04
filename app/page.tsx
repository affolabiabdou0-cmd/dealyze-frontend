"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText, Mail, BarChart3, Shield,
  Check, ArrowRight, Menu, X as CloseIcon, ChevronDown,
} from "lucide-react";

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? "rgba(6,6,15,0.96)" : "transparent",
      borderBottom: scrolled ? "0.5px solid rgba(255,255,255,0.07)" : "none",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      transition: "all 0.3s",
    }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" style={{ textDecoration: "none" }}>
          <span style={{
            background: "linear-gradient(135deg, #c4b5fd, #67e8f9)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            fontSize: 26, fontWeight: 800, letterSpacing: "6px", display: "inline-flex", alignItems: "center",
          }}>
            VY<span style={{
              fontSize: "1.7em", fontWeight: 900, display: "inline-block", lineHeight: 0.85,
              background: "linear-gradient(180deg, #ffffff 0%, #67e8f9 55%, #22d3ee 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              letterSpacing: 0,
            }}>X</span>EN
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[["Agents", "#agents"], ["Tarifs", "#tarifs"]].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
              {label}
            </a>
          ))}
          <Link href="/login" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 500 }}>
            Se connecter
          </Link>
          <Link href="/register" style={{
            fontSize: 12, color: "#c4b5fd", border: "0.5px solid rgba(139,92,246,0.45)",
            padding: "7px 18px", borderRadius: 8, textDecoration: "none", fontWeight: 600,
            transition: "all 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            Essai gratuit
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 4 }}>
          {open ? <CloseIcon size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: "rgba(6,6,15,0.98)", borderTop: "0.5px solid rgba(255,255,255,0.07)", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <a href="#agents" style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", textDecoration: "none" }} onClick={() => setOpen(false)}>Agents</a>
          <a href="#tarifs" style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", textDecoration: "none" }} onClick={() => setOpen(false)}>Tarifs</a>
          <Link href="/login" style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", textDecoration: "none" }} onClick={() => setOpen(false)}>Se connecter</Link>
          <Link href="/register" style={{ fontSize: 14, fontWeight: 600, color: "#c4b5fd", textDecoration: "none" }} onClick={() => setOpen(false)}>Commencer gratuitement →</Link>
        </div>
      )}
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
const STATS = [
  { n: "2 min",  l: "Devis généré"  },
  { n: "30 sec", l: "Pitch scoré"   },
  { n: "10 min", l: "Due diligence" },
  { n: "0 €",    l: "Impayé manqué" },
];

function Hero() {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
      background: "#06060f", position: "relative", overflow: "hidden", padding: "80px 32px 60px",
    }}>
      {/* Violet glow center */}
      <div style={{ position: "absolute", top: "22%", left: "50%", transform: "translateX(-50%)", width: 800, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(124,58,237,0.11) 0%, transparent 68%)", pointerEvents: "none" }} />
      {/* Cyan glow bottom-right */}
      <div style={{ position: "absolute", bottom: "8%", right: "8%", width: 550, height: 420, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 68%)", pointerEvents: "none" }} />
      {/* Dot grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.032) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1, width: "100%" }}>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "0.5px solid rgba(139,92,246,0.38)", borderRadius: 20, padding: "5px 14px", marginBottom: 34, background: "rgba(139,92,246,0.07)" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8b5cf6", display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", letterSpacing: "1px", fontWeight: 500 }}>XPRIZE AI HACKATHON 2026 · GEMINI 2.5 FLASH</span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-1.5px", color: "#f8fafc", marginBottom: 18 }}>
          Automatisez chaque deal.<br />
          <span style={{
            background: "linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Concentrez-vous sur gagner.
          </span>
        </h1>

        {/* Sub */}
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.37)", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.9 }}>
          4 agents IA spécialisés qui rédigent vos devis, relancent vos impayés, scorent vos pitchs et font votre due diligence — en quelques secondes.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <Link href="/register" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#5b21b6", color: "#ede9fe", padding: "11px 26px", borderRadius: 10,
            fontSize: 14, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 28px rgba(91,33,182,0.42)",
          }}>
            Essai gratuit 14 jours <ArrowRight size={15} />
          </Link>
          <a href="#agents" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "transparent", color: "rgba(255,255,255,0.58)", padding: "11px 26px", borderRadius: 10,
            fontSize: 14, fontWeight: 500, textDecoration: "none", border: "0.5px solid rgba(255,255,255,0.13)",
          }}>
            Voir les agents <ChevronDown size={15} />
          </a>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", letterSpacing: "0.5px" }}>
          Sans carte bancaire · Résultats en moins de 10 secondes
        </p>

        {/* Stats row */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px", background: "rgba(255,255,255,0.05)",
          borderRadius: 12, overflow: "hidden", marginTop: 52,
          border: "0.5px solid rgba(255,255,255,0.06)",
        }}>
          {STATS.map((s) => (
            <div key={s.l} style={{ background: "#0d0d1a", padding: "20px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#a78bfa", letterSpacing: "-0.5px" }}>{s.n}</div>
              <div style={{ fontSize: 9.5, color: "#475569", marginTop: 5, letterSpacing: "0.9px", textTransform: "uppercase", fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── AGENTS ───────────────────────────────────────────────────────────────────
const AGENTS_LANDING = [
  {
    icon: FileText, name: "Deal Draft",  color: "#7c3aed", iconBg: "rgba(124,58,237,0.15)",
    tag: "2 min · FR & EN",
    desc: "Propositions commerciales professionnelles en 2 minutes. Ton adapté au secteur, bilingue.",
  },
  {
    icon: Mail,     name: "Smart Chase", color: "#ec4899", iconBg: "rgba(236,72,153,0.14)",
    tag: "4 niveaux d'escalade",
    desc: "Relances impayées automatiques avec escalade progressive. Relation client préservée.",
  },
  {
    icon: BarChart3,name: "Pitch Radar", color: "#06b6d4", iconBg: "rgba(6,182,212,0.14)",
    tag: "Score /10 · Rapport PDF",
    desc: "Score et analyse de pitch deck en 30 secondes. Forces, faiblesses, questions anticipées.",
  },
  {
    icon: Shield,   name: "Deep Due",    color: "#84cc16", iconBg: "rgba(132,204,22,0.14)",
    tag: "Rapport complet · 10 min",
    desc: "Due diligence complète sur une entreprise ou fondateur. Risques et opportunités détaillés.",
  },
];

function AgentsSection() {
  return (
    <section id="agents" style={{ background: "#06060f", padding: "80px 32px", borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: "3px", color: "#7c3aed", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Vos 4 agents IA</div>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 600, color: "#f1f5f9", marginBottom: 10, letterSpacing: "-0.5px" }}>Chaque deal a son expert.</h2>
          <p style={{ fontSize: 14, color: "#475569", maxWidth: 420, lineHeight: 1.75 }}>
            Des agents autonomes formés sur des milliers de deals réels — bilingues, adaptatifs, disponibles 24h/24.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {AGENTS_LANDING.map(({ icon: Icon, name, color, iconBg, tag, desc }) => (
            <div key={name} style={{
              background: "#0d0d1a", border: "0.5px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "20px 22px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color }} />
              <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, flexShrink: 0 }}>
                <Icon size={19} style={{ color }} strokeWidth={1.75} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 7 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.75, marginBottom: 14 }}>{desc}</div>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, background: iconBg, color, fontWeight: 600, letterSpacing: "0.3px" }}>{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Starter", price: "47", desc: "Pour démarrer vos premiers deals", featured: false, cta: "Commencer",
    features: ["17 Deal Draft / mois", "17 Smart Chase / mois", "5 Pitch Radar / mois", "Deep Due non inclus", "Support email"],
  },
  {
    name: "Growth", price: "147", desc: "Pour les équipes actives", featured: true, cta: "Passer au Growth",
    features: ["Deal Draft illimité", "Smart Chase illimité", "Pitch Radar illimité", "5 Deep Due / mois", "Support prioritaire"],
  },
  {
    name: "Enterprise", price: "477", desc: "Pour les fonds et grandes équipes", featured: false, cta: "Contacter",
    features: ["Tout illimité", "Accès API complet", "Onboarding dédié", "SLA 99.9%", "Multi-sièges"],
  },
];

function Pricing() {
  return (
    <section id="tarifs" style={{ background: "#08080f", padding: "80px 32px", borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: "3px", color: "#7c3aed", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Tarification</div>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 600, color: "#f1f5f9", marginBottom: 8, letterSpacing: "-0.5px" }}>Simple. Transparent. Sans surprise.</h2>
          <p style={{ fontSize: 13, color: "#475569" }}>Essai 14 jours inclus — sans carte bancaire</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {PLANS.map((plan) => (
            <div key={plan.name} style={{
              background: plan.featured ? "#100d1e" : "#0d0d1a",
              border: `0.5px solid ${plan.featured ? "#5b21b6" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 14, padding: "22px 20px", display: "flex", flexDirection: "column",
              boxShadow: plan.featured ? "0 0 40px rgba(91,33,182,0.18)" : "none",
            }}>
              {plan.featured && (
                <div style={{ display: "inline-block", fontSize: 9, padding: "3px 9px", borderRadius: 5, background: "rgba(167,139,250,0.14)", color: "#a78bfa", marginBottom: 10, letterSpacing: "1px", fontWeight: 700, alignSelf: "flex-start" }}>RECOMMANDÉ</div>
              )}
              <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{plan.name}</div>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 14 }}>{plan.desc}</div>
              <div style={{ marginBottom: 3 }}>
                <span style={{ fontSize: 30, fontWeight: 600, color: plan.featured ? "#a78bfa" : "#f1f5f9" }}>${plan.price}</span>
                <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}> /mois</span>
              </div>
              <div style={{ height: "0.5px", background: "rgba(255,255,255,0.06)", margin: "14px 0" }} />
              <div style={{ flex: 1 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#94a3b8", padding: "4px 0" }}>
                    <Check size={11} style={{ color: plan.featured ? "#7c3aed" : "#334155", flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/register" style={{
                display: "block", marginTop: 18, padding: "9px 0", borderRadius: 9,
                fontSize: 12, fontWeight: 600, textAlign: "center", textDecoration: "none",
                background: plan.featured ? "#5b21b6" : "transparent",
                border: plan.featured ? "none" : "0.5px solid rgba(255,255,255,0.1)",
                color: plan.featured ? "#ede9fe" : "rgba(255,255,255,0.45)",
              }}>
                {plan.cta} →
              </Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "0.5px solid rgba(255,255,255,0.05)", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
          {["Paiement SSL sécurisé", "Via Lemon Squeezy", "Annulation à tout moment", "VISA · Mastercard · Toutes devises"].map((t) => (
            <span key={t} style={{ fontSize: 11, color: "#334155" }}>· {t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: "#06060f", borderTop: "0.5px solid rgba(255,255,255,0.06)",
      padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
    }}>
      <span style={{
        background: "linear-gradient(135deg, #c4b5fd, #67e8f9)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        fontSize: 16, fontWeight: 800, letterSpacing: "4px", display: "inline-flex", alignItems: "center",
      }}>
        VY<span style={{
          fontSize: "1.65em", fontWeight: 900, display: "inline-block", lineHeight: 0.85,
          background: "linear-gradient(180deg, #7ffeff 0%, #22d3ee 55%, #0ea5e9 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          letterSpacing: 0,
        }}>X</span>EN
      </span>
      <span style={{ fontSize: 10, color: "#1e293b", letterSpacing: "0.4px" }}>
        Propulsé par Gemini 2.5 Flash · XPRIZE AI Hackathon 2026 · Turn every deal into done.
      </span>
    </footer>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <AgentsSection />
      <Pricing />
      <Footer />
    </>
  );
}
