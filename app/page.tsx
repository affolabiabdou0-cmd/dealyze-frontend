"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText, Mail, BarChart3, Shield,
  Check, ArrowRight, Menu, X as CloseIcon, ChevronDown,
  Zap, Clock, Users,
} from "lucide-react";

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? "rgba(6,6,15,0.96)" : "transparent",
      borderBottom: scrolled ? "0.5px solid rgba(255,255,255,0.07)" : "none",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>

        {/* ── GAUCHE : Logo ── */}
        <a href="#" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span style={{
            background: "linear-gradient(135deg, #c4b5fd, #67e8f9)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            fontSize: 28, fontWeight: 800, letterSpacing: "6px", display: "inline-flex", alignItems: "center",
          }}>
            VY<span style={{
              fontSize: "1.7em", fontWeight: 900, display: "inline-block", lineHeight: 0.85,
              background: "linear-gradient(180deg, #e0f2fe 0%, #67e8f9 50%, #22d3ee 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              letterSpacing: 0,
            }}>X</span>EN
          </span>
        </a>

        {/* ── CENTRE : Liens ── */}
        <div className="hidden md:flex items-center gap-10">
          {[["Agents", "#agents"], ["Tarifs", "#tarifs"], ["À propos", "#apropos"]].map(([label, href]) => (
            <a key={label} href={href}
              style={{ fontSize: 13.5, color: "rgba(255,255,255,0.48)", textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.48)"; }}>
              {label}
            </a>
          ))}
        </div>

        {/* ── DROITE : Se connecter + CTA ── */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/login"
            style={{ fontSize: 13.5, color: "rgba(255,255,255,0.48)", textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.48)"; }}>
            Se connecter
          </Link>
          <Link href="/register" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "linear-gradient(135deg, #5b21b6, #6d28d9)",
            color: "#ede9fe", padding: "9px 20px", borderRadius: 10,
            fontSize: 13.5, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 20px rgba(91,33,182,0.38)", transition: "box-shadow 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(91,33,182,0.58)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(91,33,182,0.38)"; }}>
            Essai gratuit <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 4 }}>
          {open ? <CloseIcon size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Menu mobile ── */}
      {open && (
        <div style={{ background: "#08080f", borderTop: "0.5px solid rgba(255,255,255,0.07)", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          {[["Agents", "#agents"], ["Tarifs", "#tarifs"], ["À propos", "#apropos"]].map(([label, href]) => (
            <a key={label} href={href} onClick={() => setOpen(false)}
              style={{ fontSize: 14.5, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: 500 }}>{label}</a>
          ))}
          <Link href="/login" onClick={() => setOpen(false)}
            style={{ fontSize: 14.5, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: 500 }}>Se connecter</Link>
          <Link href="/register" onClick={() => setOpen(false)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14.5, fontWeight: 700, color: "#c4b5fd", textDecoration: "none" }}>
            Essai gratuit <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
const STATS = [
  { n: "2 min",  l: "Devis généré",   icon: Zap   },
  { n: "30 sec", l: "Pitch scoré",    icon: BarChart3 },
  { n: "10 min", l: "Due diligence",  icon: Shield  },
  { n: "0 €",    l: "Impayé manqué",  icon: Clock  },
];

function Hero() {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "#06060f", position: "relative", overflow: "hidden",
    }}>
      {/* Glows décoratifs */}
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 900, height: 700, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(124,58,237,0.11) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, right: "8%", width: 600, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(34,211,238,0.06) 0%, transparent 68%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "35%", left: "3%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(91,33,182,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
      {/* Dot grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

      {/* Contenu centré */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "100px 32px 48px", position: "relative", zIndex: 1 }}>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "0.5px solid rgba(139,92,246,0.35)", borderRadius: 20, padding: "5px 16px", marginBottom: 38, background: "rgba(139,92,246,0.07)" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8b5cf6", display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1.1px", fontWeight: 500, textTransform: "uppercase" }}>XPRIZE AI Hackathon 2026 · Gemini 2.5 Flash</span>
        </div>

        {/* Titre principal */}
        <h1 style={{ fontSize: "clamp(34px, 5.8vw, 64px)", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-1.8px", color: "#f8fafc", marginBottom: 18, maxWidth: 800 }}>
          Automatisez chaque deal.<br />
          <span style={{
            background: "linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Concentrez-vous sur gagner.
          </span>
        </h1>

        {/* Sous-titre */}
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.34)", maxWidth: 520, margin: "0 auto 38px", lineHeight: 1.9, fontWeight: 400 }}>
          4 agents IA spécialisés — devis, relances, pitch decks, due diligence.<br />En quelques secondes.
        </p>

        {/* Boutons CTA */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          <Link href="/register" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #5b21b6, #6d28d9)",
            color: "#ede9fe", padding: "13px 30px", borderRadius: 12,
            fontSize: 14.5, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 32px rgba(91,33,182,0.48)",
          }}>
            Essai gratuit 14 jours <ArrowRight size={16} />
          </Link>
          <a href="#agents" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.52)", padding: "13px 30px", borderRadius: 12,
            fontSize: 14.5, fontWeight: 500, textDecoration: "none",
            border: "0.5px solid rgba(255,255,255,0.12)",
          }}>
            Voir une démo <ChevronDown size={16} />
          </a>
        </div>

        {/* Note */}
        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.18)", letterSpacing: "0.4px" }}>
          Sans carte bancaire · Résultats en moins de 10 secondes
        </p>
      </div>

      {/* Stats row — plancher du hero */}
      <div style={{ position: "relative", zIndex: 1, borderTop: "0.5px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.025)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {STATS.map(({ n, l, icon: Icon }, i) => (
            <div key={l} style={{
              padding: "24px 16px", textAlign: "center",
              borderRight: i < 3 ? "0.5px solid rgba(255,255,255,0.05)" : "none",
            }}>
              <Icon size={13} style={{ color: "#5b21b6", marginBottom: 6, display: "block", margin: "0 auto 8px" }} strokeWidth={1.75} />
              <div style={{ fontSize: 22, fontWeight: 600, color: "#a78bfa", letterSpacing: "-0.5px" }}>{n}</div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 5, letterSpacing: "0.9px", textTransform: "uppercase", fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── LES 4 AGENTS ─────────────────────────────────────────────────────────────
const AGENTS_DATA = [
  {
    icon: FileText, name: "Deal Draft", color: "#7c3aed", iconBg: "rgba(124,58,237,0.15)",
    tag: "PME · 2 min · FR & EN",
    headline: "Vos devis en 2 minutes, pas en 2 heures.",
    desc: "Propositions commerciales structurées, clauses adaptées au secteur, montants calculés — bilingues, professionnelles, prêtes à envoyer. Idéal pour les commerciaux et consultants B2B.",
    for: "PME de services",
  },
  {
    icon: Mail, name: "Smart Chase", color: "#ec4899", iconBg: "rgba(236,72,153,0.14)",
    tag: "PME · 4 niveaux d'escalade",
    headline: "Zéro impayé laissé sans suite.",
    desc: "Relances automatisées avec escalade progressive. Ton adapté — courtois, ferme, juridique. Sans jamais froisser la relation client. Récupérez ce qui vous est dû.",
    for: "Dirigeants & Finance",
  },
  {
    icon: BarChart3, name: "Pitch Radar", color: "#06b6d4", iconBg: "rgba(6,182,212,0.14)",
    tag: "Investisseurs · Score /10",
    headline: "Analysez 10× plus de pitchs, sans perdre en qualité.",
    desc: "Score multicritère VC, forces et alertes, recommandation investissement. Accélérez votre sourcing et prenez des décisions mieux informées — en 30 secondes par pitch.",
    for: "Fonds & Business Angels",
  },
  {
    icon: Shield, name: "Deep Due", color: "#84cc16", iconBg: "rgba(132,204,22,0.14)",
    tag: "Investisseurs · 10 min",
    headline: "3 jours de due diligence en 10 minutes.",
    desc: "Profil fondateur, analyse concurrentielle, cartographie des risques et recommandation finale. Ce que votre analyste fait en 3 jours — structuré, exhaustif, exportable.",
    for: "VC & Investisseurs",
  },
];

function AgentsSection() {
  return (
    <section id="agents" style={{ background: "#06060f", padding: "90px 32px", borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "2.5px", color: "#7c3aed", textTransform: "uppercase", fontWeight: 700, marginBottom: 14, background: "rgba(124,58,237,0.1)", padding: "4px 12px", borderRadius: 6 }}>
            Vos 4 agents IA
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 600, color: "#f1f5f9", marginBottom: 12, letterSpacing: "-0.8px" }}>Chaque deal a son expert.</h2>
          <p style={{ fontSize: 15, color: "#475569", maxWidth: 480, margin: "0 auto", lineHeight: 1.75 }}>
            Pour les PME qui veulent conclure plus vite. Pour les investisseurs qui analysent plus — et mieux.
          </p>
        </div>

        {/* Grid 2×2 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {AGENTS_DATA.map(({ icon: Icon, name, color, iconBg, tag, headline, desc, for: target }) => (
            <div key={name} style={{
              background: "#0c0c1a", border: "0.5px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: "24px 26px", position: "relative", overflow: "hidden",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}40`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>

              {/* Barre colorée haut */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color }} />

              {/* Cible + icône */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} style={{ color }} strokeWidth={1.75} />
                </div>
                <span style={{ fontSize: 10, color: "#334155", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", padding: "3px 9px", borderRadius: 5, letterSpacing: "0.3px", fontWeight: 500 }}>
                  <Users size={9} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />{target}
                </span>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: color, marginBottom: 6, letterSpacing: "0.02em" }}>{name}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 10, lineHeight: 1.35, letterSpacing: "-0.3px" }}>{headline}</div>
              <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.75, marginBottom: 16 }}>{desc}</div>
              <span style={{ fontSize: 10, padding: "4px 11px", borderRadius: 6, background: iconBg, color, fontWeight: 600, letterSpacing: "0.3px" }}>{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── COMMENT ÇA MARCHE ────────────────────────────────────────────────────────
const STEPS = [
  {
    n: "01", title: "Créez votre compte", icon: Users,
    desc: "Inscription en 30 secondes — sans carte bancaire. Vous obtenez 5 utilisations gratuites par agent pour tester dans de vraies conditions.",
  },
  {
    n: "02", title: "Choisissez votre agent", icon: Zap,
    desc: "PME : Deal Draft pour vos devis, Smart Chase pour vos impayés. Investisseur : Pitch Radar pour vos deals, Deep Due pour votre analyse.",
  },
  {
    n: "03", title: "Obtenez votre résultat", icon: ArrowRight,
    desc: "En moins de 10 secondes, Gemini 2.5 génère un contenu structuré et professionnel. Copiez, exportez en PDF, envoyez directement.",
  },
];

function HowItWorks() {
  return (
    <section style={{ background: "#08080f", padding: "90px 32px", borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "2.5px", color: "#7c3aed", textTransform: "uppercase", fontWeight: 700, marginBottom: 14, background: "rgba(124,58,237,0.1)", padding: "4px 12px", borderRadius: 6 }}>
            Comment ça marche
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 600, color: "#f1f5f9", marginBottom: 12, letterSpacing: "-0.8px" }}>Opérationnel en 3 étapes.</h2>
          <p style={{ fontSize: 15, color: "#475569", maxWidth: 400, margin: "0 auto", lineHeight: 1.75 }}>Pas de configuration complexe. VYXEN est prêt en quelques minutes.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {STEPS.map(({ n, title, desc, icon: Icon }) => (
            <div key={n} style={{ background: "#0c0c1a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#5b21b6", background: "rgba(91,33,182,0.14)", padding: "3px 9px", borderRadius: 6, letterSpacing: "0.5px" }}>{n}</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(91,33,182,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} style={{ color: "#7c3aed" }} strokeWidth={1.75} />
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-0.3px" }}>{title}</div>
              <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.75 }}>{desc}</div>
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
    name: "Starter", price: "47", cta: "Commencer",
    target: "PME · Services B2B",
    desc: "Pour les PME qui démarrent",
    features: ["17 Deal Draft / mois", "17 Smart Chase / mois", "5 Pitch Radar / mois", "Deep Due non inclus", "Support email"],
    featured: false,
    accent:      "#5b8fa8",
    accentLight: "#8dbcd4",
    barGrad:     "linear-gradient(90deg, #4a7b96, #7ab8cc)",
    descColor:   "#4e7d94",
    glow:        "rgba(91,143,168,0.07)",
    borderColor: "rgba(91,143,168,0.28)",
    bg:          "#0b0e14",
  },
  {
    name: "Growth", price: "147", cta: "Passer au Growth",
    target: "PME & Investisseurs",
    desc: "Pour les équipes qui concluent chaque semaine",
    features: ["Deal Draft illimité", "Smart Chase illimité", "Pitch Radar illimité", "5 Deep Due / mois", "Support prioritaire"],
    featured: true,
    accent:      "#7c3aed",
    accentLight: "#a78bfa",
    barGrad:     "linear-gradient(90deg, #4c1d95, #7c3aed)",
    descColor:   "#9b82e0",
    glow:        "rgba(124,58,237,0.20)",
    borderColor: "rgba(91,33,182,0.55)",
    bg:          "#100d1e",
  },
  {
    name: "Enterprise", price: "477", cta: "Contacter",
    target: "Fonds & Cabinets",
    desc: "Pour les fonds et cabinets en volume",
    features: ["Tout illimité", "Deep Due illimité", "Accès API complet", "Onboarding dédié", "SLA 99.9%"],
    featured: false,
    accent:      "#b87c20",
    accentLight: "#d4a040",
    barGrad:     "linear-gradient(90deg, #8a5c12, #c9921a)",
    descColor:   "#896030",
    glow:        "rgba(184,124,32,0.08)",
    borderColor: "rgba(184,124,32,0.35)",
    bg:          "#0d0b08",
  },
];

function Pricing() {
  return (
    <section id="tarifs" style={{ background: "#06060f", padding: "90px 32px", borderTop: "0.5px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "2.5px", color: "#7c3aed", textTransform: "uppercase", fontWeight: 700, marginBottom: 14, background: "rgba(124,58,237,0.1)", padding: "4px 12px", borderRadius: 6 }}>
            Tarification
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 600, color: "#f1f5f9", marginBottom: 12, letterSpacing: "-0.8px" }}>Simple. Transparent. Sans surprise.</h2>
          <p style={{ fontSize: 15, color: "#475569" }}>Essai gratuit inclus — sans carte bancaire. Annulez à tout moment.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, alignItems: "start" }}>
          {PLANS.map((plan) => (
            <div key={plan.name} style={{
              background: plan.bg,
              border: `0.5px solid ${plan.borderColor}`,
              borderRadius: 16,
              display: "flex", flexDirection: "column",
              overflow: "hidden",
              boxShadow: plan.featured
                ? `0 0 60px ${plan.glow}, 0 4px 24px rgba(0,0,0,0.3)`
                : `0 0 30px ${plan.glow}, 0 2px 12px rgba(0,0,0,0.2)`,
            }}>
              {/* Barre de couleur en haut */}
              <div style={{ height: 3, background: plan.barGrad, flexShrink: 0 }} />

              <div style={{ padding: "22px 22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                {plan.featured && (
                  <div style={{ display: "inline-block", fontSize: 9.5, padding: "3px 10px", borderRadius: 5, background: `${plan.accent}20`, color: plan.accentLight, marginBottom: 12, letterSpacing: "1px", fontWeight: 700, alignSelf: "flex-start", border: `0.5px solid ${plan.accent}40` }}>RECOMMANDÉ</div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{plan.name}</div>
                  <div style={{ fontSize: 10, color: plan.accent, background: `${plan.accent}14`, border: `0.5px solid ${plan.accent}30`, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{plan.target}</div>
                </div>
                <div style={{ fontSize: 12, color: plan.descColor, marginBottom: 16, lineHeight: 1.5 }}>{plan.desc}</div>

                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: plan.accentLight, letterSpacing: "-1px" }}>${plan.price}</span>
                  <span style={{ fontSize: 12, color: "#475569", fontWeight: 400 }}> /mois</span>
                </div>

                <div style={{ height: "0.5px", background: `${plan.accent}22`, margin: "14px 0" }} />

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "#94a3b8", padding: "4px 0" }}>
                      <Check size={12} style={{ color: plan.accent, flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>

                <Link href="/register" style={{
                  display: "block", marginTop: 20, padding: "10px 0", borderRadius: 10,
                  fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none",
                  background: plan.featured ? `linear-gradient(135deg, ${plan.accent}, ${plan.accent}cc)` : "transparent",
                  border: plan.featured ? "none" : `0.5px solid ${plan.accent}60`,
                  color: plan.featured ? "#fff" : plan.accentLight,
                  boxShadow: plan.featured ? `0 4px 20px ${plan.glow}` : "none",
                }}>
                  {plan.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "0.5px solid rgba(255,255,255,0.05)", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
          {["Paiement SSL sécurisé", "Via Paddle", "Annulation à tout moment", "VISA · Mastercard · Mobile Money"].map((t) => (
            <span key={t} style={{ fontSize: 11.5, color: "#334155" }}>· {t}</span>
          ))}
        </div>

        <div style={{ marginTop: 13, textAlign: "center" }}>
          <span style={{ fontSize: 11.5, color: "#334155" }}>Développé par </span>
          <span style={{ position: "relative", display: "inline-block" }}>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: "#c8c8d0" }}>f4ntom_kox</span>
            <span style={{
              position: "absolute", bottom: -2, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg, #7c3aed, transparent)",
              display: "block",
            }} />
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── CTA FINAL ────────────────────────────────────────────────────────────────
function CTAFinal() {
  return (
    <section style={{ background: "#08080f", padding: "100px 32px", borderTop: "0.5px solid rgba(255,255,255,0.04)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(91,33,182,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 600, color: "#f1f5f9", letterSpacing: "-1px", marginBottom: 16, lineHeight: 1.12 }}>
          Votre prochain deal<br />
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            commence maintenant.
          </span>
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.32)", marginBottom: 36, lineHeight: 1.85, maxWidth: 520, margin: "0 auto 36px" }}>
          PME : concluez vos deals 10× plus vite. Investisseurs : analysez chaque opportunité sans perdre en rigueur.
          <br />VYXEN s&apos;adapte à votre profil.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #5b21b6, #6d28d9)",
            color: "#ede9fe", padding: "13px 30px", borderRadius: 12,
            fontSize: 14.5, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 32px rgba(91,33,182,0.42)",
          }}>
            Essai gratuit 14 jours <ArrowRight size={16} />
          </Link>
          <Link href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", padding: "13px 30px", borderRadius: 12,
            fontSize: 14.5, fontWeight: 500, textDecoration: "none",
            border: "0.5px solid rgba(255,255,255,0.12)",
          }}>
            Se connecter
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer id="apropos" style={{
      background: "#06060f", borderTop: "0.5px solid rgba(255,255,255,0.06)",
      padding: "32px 32px 24px",
    }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>

          {/* Logo + about */}
          <div>
            <span style={{
              background: "linear-gradient(135deg, #c4b5fd, #67e8f9)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              fontSize: 18, fontWeight: 800, letterSpacing: "4px", display: "inline-flex", alignItems: "center", marginBottom: 10,
            }}>
              VY<span style={{
                fontSize: "1.65em", fontWeight: 900, display: "inline-block", lineHeight: 0.85,
                background: "linear-gradient(180deg, #e0f2fe 0%, #67e8f9 50%, #22d3ee 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                letterSpacing: 0,
              }}>X</span>EN
            </span>
            <p style={{ fontSize: 12, color: "#334155", maxWidth: 260, lineHeight: 1.7, marginTop: 8 }}>
              Plateforme IA pour PME et investisseurs. 4 agents spécialisés pour automatiser chaque étape de vos deals. Projet XPRIZE AI Hackathon 2026.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, color: "#334155", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Produit</div>
              {[["Agents IA", "#agents"], ["Tarifs", "#tarifs"], ["Se connecter", "/login"], ["Essai gratuit", "/register"]].map(([l, href]) => (
                <div key={l} style={{ marginBottom: 8 }}>
                  <Link href={href} style={{ fontSize: 13, color: "#1e293b", textDecoration: "none" }}>{l}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#334155", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Légal</div>
              {[["Conditions d'utilisation", "/terms"], ["Politique de confidentialité", "/privacy"], ["Politique de remboursement", "/refund"]].map(([l, href]) => (
                <div key={l} style={{ marginBottom: 8 }}>
                  <Link href={href} style={{ fontSize: 13, color: "#1e293b", textDecoration: "none" }}>{l}</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: "0.5px", background: "rgba(255,255,255,0.05)", margin: "0 0 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#1e293b" }}>© 2026 VYXEN · Turn every deal into done.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/terms"  style={{ fontSize: 11, color: "#1e293b", textDecoration: "none" }}>CGU</Link>
            <Link href="/privacy" style={{ fontSize: 11, color: "#1e293b", textDecoration: "none" }}>Confidentialité</Link>
            <Link href="/refund"  style={{ fontSize: 11, color: "#1e293b", textDecoration: "none" }}>Remboursement</Link>
          </div>
        </div>
      </div>
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
      <HowItWorks />
      <Pricing />
      <CTAFinal />
      <Footer />
    </>
  );
}
