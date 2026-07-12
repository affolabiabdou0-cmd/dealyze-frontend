"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText, Mail, BarChart3,
  Check, ArrowRight, Menu, X as CloseIcon,
  Zap, Users, type LucideIcon,
} from "lucide-react";
import { AgentSelectionProvider } from "./components/vyxen/AgentSelectionContext";
import Hero from "./components/vyxen/Hero";
import AgentsLab from "./components/vyxen/AgentsLab";
import WorldSection from "./components/vyxen/WorldSection";
import MissionCenter from "./components/vyxen/MissionCenter";
import LivingBackground from "./components/vyxen/LivingBackground";

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
        <a href="#" style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo-vyxen.png" alt="" style={{ height: 38, width: "auto", display: "block" }} />
          <span translate="no" className="notranslate" style={{
            background: "linear-gradient(135deg, #c4b5fd, #67e8f9)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            fontSize: 18, fontWeight: 800, letterSpacing: "5px",
            display: "inline-flex", alignItems: "center",
          }}>
            VY<span style={{
              fontSize: "1.7em", fontWeight: 900, lineHeight: 0.85,
              background: "linear-gradient(180deg, #e0f2fe 0%, #67e8f9 50%, #22d3ee 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              letterSpacing: 0,
            }}>X</span>EN
          </span>
        </a>

        {/* ── CENTRE : Liens ── */}
        <div className="hidden md:flex items-center gap-10">
          {[["Agents", "#agents-lab"], ["Tarifs", "#tarifs"], ["À propos", "#apropos"]].map(([label, href]) => (
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
          {[["Agents", "#agents-lab"], ["Tarifs", "#tarifs"], ["À propos", "#apropos"]].map(([label, href]) => (
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

// ─── DEMO MODAL ──────────────────────────────────────────────────────────────
type DemoTab = "deal_draft" | "smart_chase" | "pitch_radar";

const DEMO_TABS: { id: DemoTab; label: string; icon: LucideIcon }[] = [
  { id: "deal_draft",  label: "Deal Draft",  icon: FileText  },
  { id: "smart_chase", label: "Smart Chase", icon: Mail      },
  { id: "pitch_radar", label: "Pitch Radar", icon: BarChart3 },
];

function DealDraftResult() {
  return (
    <div style={{ fontSize: 12.5, lineHeight: 1.8, color: "#c8d3e0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "10px 14px", background: "rgba(124,58,237,0.1)", borderRadius: 10, border: "1px solid rgba(124,58,237,0.2)" }}>
        <FileText size={13} style={{ color: "#a78bfa", flexShrink: 0 }} strokeWidth={1.75} />
        <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, letterSpacing: "0.5px" }}>DEAL DRAFT · Réf. DD-2026-0847 · Généré en 24 secondes</span>
      </div>
      {([
        ["CLIENT", "TechVision SAS · M. Karim Diallo, Directeur Général"],
        ["SERVICE", "Développement plateforme e-commerce B2B sur-mesure\n• Catalogue multi-fournisseurs · Tunnel de commande optimisé\n• Dashboard analytique temps réel"],
        ["INVESTISSEMENT", "28 000 € HT\nRépartition : 40 % démarrage · 40 % livraison · 20 % recette"],
        ["PLANNING", "Démarrage : 21 juil. 2026  ·  Livraison v1 : 5 sept. 2026  ·  Recette : 21 sept. 2026"],
        ["ARGUMENTS CLÉS", "✦ Spécialisés e-commerce B2B depuis 2019  ·  47 plateformes livrées\n✦ Équipe dédiée : PM + Tech Lead + Designer UX  ·  Délais garantis contractuellement"],
        ["VALIDITÉ", "30 jours à compter de la date d'émission. Retourner ce document contresigné pour démarrer."],
      ] as [string, string][]).map(([key, val]) => (
        <div key={key} style={{ marginBottom: 13 }}>
          <div style={{ color: "#7c3aed", fontSize: 9.5, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 3 }}>{key}</div>
          <div style={{ color: "#d0dae8", whiteSpace: "pre-line" }}>{val}</div>
        </div>
      ))}
    </div>
  );
}

function SmartChaseResult() {
  return (
    <div style={{ fontSize: 13, lineHeight: 1.75, color: "#c8d3e0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "10px 14px", background: "rgba(249,115,22,0.09)", borderRadius: 10, border: "1px solid rgba(249,115,22,0.2)" }}>
        <Mail size={13} style={{ color: "#fb923c", flexShrink: 0 }} strokeWidth={1.75} />
        <span style={{ fontSize: 11, color: "#fb923c", fontWeight: 600, letterSpacing: "0.5px" }}>SMART CHASE · Profil : Bon payeur historique · Généré en 18 secondes</span>
      </div>
      {([ ["De", "vous@entreprise.com"], ["À", "k.diallo@techvision.fr"], ["Objet", "Rappel — Facture FAC-2026-0312 · 28 000 € · Échéance dépassée"] ] as [string, string][]).map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 12, marginBottom: 6, paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ color: "#475569", minWidth: 48, fontWeight: 600, fontSize: 11, flexShrink: 0 }}>{k}</span>
          <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>
        </div>
      ))}
      <div style={{ marginTop: 16, color: "#d0dae8", whiteSpace: "pre-line", fontSize: 12.5 }}>{`Monsieur Diallo,

Je me permets de revenir vers vous concernant notre facture FAC-2026-0312 émise le 15 juin pour un montant de 28 000 € HT, arrivée à échéance le 15 juillet 2026.

Au vu de l'excellente relation que nous entretenons, je reste convaincu qu'il s'agit d'un simple oubli de traitement. Pourriez-vous me confirmer la date de virement prévue, ou me faire part de toute difficulté afin que nous trouvions ensemble la meilleure solution ?

Sans retour sous 72 heures, je serai contraint de transmettre le dossier à notre service recouvrement.

Bien cordialement,`}</div>
    </div>
  );
}

function PitchRadarResult() {
  const scores = [
    { label: "Marché adressable", s: 8.2 },
    { label: "Équipe fondatrice",  s: 7.1 },
    { label: "Différenciation",   s: 8.0 },
    { label: "Modèle économique", s: 6.5 },
    { label: "Traction",          s: 5.8 },
    { label: "Scalabilité",       s: 7.8 },
  ];
  return (
    <div style={{ fontSize: 13, color: "#c8d3e0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "10px 14px", background: "rgba(6,182,212,0.09)", borderRadius: 10, border: "1px solid rgba(6,182,212,0.2)" }}>
        <BarChart3 size={13} style={{ color: "#22d3ee", flexShrink: 0 }} strokeWidth={1.75} />
        <span style={{ fontSize: 11, color: "#22d3ee", fontWeight: 600, letterSpacing: "0.5px" }}>PITCH RADAR · TechVision AI · Généré en 31 secondes</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(6,182,212,0.1)", border: "2px solid #06b6d4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#22d3ee", lineHeight: 1 }}>7.4</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>/10</span>
        </div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#e2e8f0", marginBottom: 3 }}>Score global VC</div>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>Pitch solide avec marges de progression sur la traction et le moat technologique.</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {scores.map(({ label, s }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "#64748b", minWidth: 148, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 5, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${s * 10}%`, borderRadius: 4, background: "linear-gradient(90deg, #0891b2, #22d3ee)" }} />
            </div>
            <span style={{ fontSize: 11, color: "#22d3ee", fontWeight: 700, minWidth: 28, textAlign: "right" }}>{s}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
        <div style={{ padding: "10px 12px", borderRadius: 9, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)" }}>
          <div style={{ fontSize: 9.5, color: "#10b981", fontWeight: 700, letterSpacing: "0.5px", marginBottom: 7 }}>POINTS FORTS</div>
          {["Marché B2B IA en croissance", "Fondateur 8 ans SaaS", "ARR 47k$ en pré-seed"].map((p) => (
            <div key={p} style={{ fontSize: 11, color: "#6ee7b7", marginBottom: 3 }}>+ {p}</div>
          ))}
        </div>
        <div style={{ padding: "10px 12px", borderRadius: 9, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.16)" }}>
          <div style={{ fontSize: 9.5, color: "#ef4444", fontWeight: 700, letterSpacing: "0.5px", marginBottom: 7 }}>ALERTES</div>
          {["Moat technique à définir", "Concurrence bien financée", "Traction encore limitée"].map((p) => (
            <div key={p} style={{ fontSize: 11, color: "#fca5a5", marginBottom: 3 }}>⚠ {p}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<DemoTab>("deal_draft");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 950);
    return () => clearTimeout(t);
  }, []);

  function switchTab(next: DemoTab) {
    if (next === tab) return;
    setLoading(true);
    setTimeout(() => { setTab(next); setLoading(false); }, 750);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,6,15,0.88)", backdropFilter: "blur(14px)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 740, borderRadius: 22, overflow: "hidden", boxShadow: "0 40px 100px rgba(91,31,200,0.38), 0 8px 32px rgba(0,0,0,0.55)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header gradient */}
        <div style={{ background: "linear-gradient(135deg, #1e0547 0%, #3b0d8c 35%, #5b1fc8 68%, #7c3aed 100%)", padding: "22px 28px 0", position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: -50, right: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.35)", filter: "blur(65px)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "2px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 600, marginBottom: 5 }}>Démonstration live</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 3 }}><span translate="no" className="notranslate">VYXEN</span> en action</h3>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>Résultats réels générés par Gemini 2.5 Flash · Moins de 30 secondes</p>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "background 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.26)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}>
              <CloseIcon size={14} style={{ color: "#fff" }} />
            </button>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
            {DEMO_TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => switchTab(id)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: "8px 8px 0 0", background: tab === id ? "#0d0d1a" : "rgba(255,255,255,0.07)", border: tab === id ? "none" : "1px solid rgba(255,255,255,0.1)", borderBottom: "none", color: tab === id ? "#fff" : "rgba(255,255,255,0.45)", fontSize: 12.5, fontWeight: tab === id ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}>
                <Icon size={13} strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ background: "#0d0d1a", flex: 1, overflowY: "auto", padding: "22px 28px", minHeight: 340 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, gap: 16 }}>
              <style>{`@keyframes vxbounce{0%,80%,100%{transform:translateY(0);opacity:0.35}40%{transform:translateY(-10px);opacity:1}}`}</style>
              <div style={{ display: "flex", gap: 8 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", animation: `vxbounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.3px" }}>Gemini 2.5 Flash génère le résultat…</p>
            </div>
          ) : tab === "deal_draft" ? <DealDraftResult />
            : tab === "smart_chase" ? <SmartChaseResult />
            : <PitchRadarResult />}
        </div>

        {/* Footer */}
        <div style={{ background: "#090910", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", flexShrink: 0 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Essai gratuit 14 jours · Sans carte bancaire</p>
          <Link href="/register" onClick={onClose} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg, #5b21b6, #7c3aed)", color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 18px rgba(91,31,200,0.38)" }}>
            Essayer gratuitement <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
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
    <section className="px-4 md:px-8" style={{ background: "rgba(5,5,7,0.72)", paddingTop: 90, paddingBottom: 90, borderTop: "0.5px solid var(--color-hairline)" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "2.5px", color: "var(--color-violet)", textTransform: "uppercase", fontWeight: 700, marginBottom: 14, background: "rgba(124,58,237,0.1)", padding: "4px 12px", borderRadius: 6 }}>
            Comment ça marche
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 600, color: "var(--color-text-1)", marginBottom: 12, letterSpacing: "-0.8px" }}>Opérationnel en 3 étapes.</h2>
          <p style={{ fontSize: 15, color: "var(--color-text-2)", maxWidth: 400, margin: "0 auto", lineHeight: 1.75 }}>Pas de configuration complexe. <span translate="no" className="notranslate">VYXEN</span> est prêt en quelques minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 14 }}>
          {STEPS.map(({ n, title, desc, icon: Icon }) => (
            <div key={n} style={{ background: "var(--color-panel)", border: "0.5px solid var(--color-hairline)", borderRadius: 16, padding: "28px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-violet-2)", background: "rgba(124,58,237,0.14)", padding: "3px 9px", borderRadius: 6, letterSpacing: "0.5px" }}>{n}</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} style={{ color: "var(--color-violet)" }} strokeWidth={1.75} />
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-1)", marginBottom: 10, letterSpacing: "-0.3px" }}>{title}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-2)", lineHeight: 1.75 }}>{desc}</div>
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
    <section id="tarifs" className="px-4 md:px-8" style={{ background: "rgba(5,5,7,0.72)", paddingTop: 90, paddingBottom: 90, borderTop: "0.5px solid var(--color-hairline)" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "2.5px", color: "var(--color-violet)", textTransform: "uppercase", fontWeight: 700, marginBottom: 14, background: "rgba(124,58,237,0.1)", padding: "4px 12px", borderRadius: 6 }}>
            Tarification
          </div>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 600, color: "var(--color-text-1)", marginBottom: 12, letterSpacing: "-0.8px" }}>Simple. Transparent. Sans surprise.</h2>
          <p style={{ fontSize: 15, color: "var(--color-text-2)" }}>Essai gratuit inclus — sans carte bancaire. Annulez à tout moment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 14, alignItems: "start" }}>
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
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-1)" }}>{plan.name}</div>
                  <div style={{ fontSize: 10, color: plan.accent, background: `${plan.accent}14`, border: `0.5px solid ${plan.accent}30`, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{plan.target}</div>
                </div>
                <div style={{ fontSize: 12, color: plan.descColor, marginBottom: 16, lineHeight: 1.5 }}>{plan.desc}</div>

                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: plan.accentLight, letterSpacing: "-1px" }}>${plan.price}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-2)", fontWeight: 400 }}> /mois</span>
                </div>

                <div style={{ height: "0.5px", background: `${plan.accent}22`, margin: "14px 0" }} />

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "var(--color-text-2)", padding: "4px 0" }}>
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

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "0.5px solid var(--color-hairline)", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
          {["Paiement SSL sécurisé", "Via Paddle", "Annulation à tout moment", "VISA · Mastercard · Mobile Money"].map((t) => (
            <span key={t} style={{ fontSize: 11.5, color: "var(--color-text-3)" }}>· {t}</span>
          ))}
        </div>

      </div>
    </section>
  );
}

// ─── CTA FINAL ────────────────────────────────────────────────────────────────
function CTAFinal() {
  return (
    <section className="px-4 md:px-8" style={{ background: "rgba(5,5,7,0.72)", paddingTop: 100, paddingBottom: 100, borderTop: "0.5px solid var(--color-hairline)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(124,58,237,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 600, color: "var(--color-text-1)", letterSpacing: "-1px", marginBottom: 16, lineHeight: 1.12 }}>
          Votre prochain deal<br />
          <span style={{ background: "linear-gradient(135deg, var(--color-violet-2), var(--color-cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            commence maintenant.
          </span>
        </h2>
        <p style={{ fontSize: 15, color: "var(--color-text-2)", marginBottom: 36, lineHeight: 1.85, maxWidth: 520, margin: "0 auto 36px" }}>
          PME : concluez vos deals 10× plus vite. Investisseurs : analysez chaque opportunité sans perdre en rigueur.
          <br /><span translate="no" className="notranslate">VYXEN</span>{" "}s&apos;adapte à votre profil.
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
            background: "var(--glass-1-bg)", color: "var(--color-text-2)", padding: "13px 30px", borderRadius: 12,
            fontSize: 14.5, fontWeight: 500, textDecoration: "none",
            border: "0.5px solid var(--glass-1-border)",
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
    <footer id="apropos" className="px-4 md:px-8" style={{
      background: "rgba(5,5,7,0.72)", borderTop: "0.5px solid var(--color-hairline)",
      paddingTop: 32, paddingBottom: 24,
    }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>

          {/* Logo + about */}
          <div>
            <span translate="no" className="notranslate" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <img src="/logo-vyxen.png" alt="" style={{ height: 28, width: "auto", display: "block" }} />
              <span style={{
                background: "linear-gradient(135deg, #c4b5fd, #67e8f9)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                fontSize: 16, fontWeight: 800, letterSpacing: "4px",
                display: "inline-flex", alignItems: "center",
              }}>
                VY<span style={{
                  fontSize: "1.65em", fontWeight: 900, lineHeight: 0.85,
                  background: "linear-gradient(180deg, #e0f2fe 0%, #67e8f9 50%, #22d3ee 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  letterSpacing: 0,
                }}>X</span>EN
              </span>
            </span>
            <p style={{ fontSize: 12, color: "var(--color-text-2)", maxWidth: 260, lineHeight: 1.7, marginTop: 8 }}>
              Plateforme IA pour PME et investisseurs. 4 agents spécialisés pour automatiser chaque étape de vos deals. Projet XPRIZE AI Hackathon 2026.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--color-text-2)", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Produit</div>
              {[["Agents IA", "#agents-lab"], ["Tarifs", "#tarifs"], ["Se connecter", "/login"], ["Essai gratuit", "/register"]].map(([l, href]) => (
                <div key={l} style={{ marginBottom: 8 }}>
                  <Link href={href} style={{ fontSize: 13, color: "var(--color-text-2)", textDecoration: "none" }}>{l}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 10, color: "var(--color-text-2)", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Légal</div>
              {[["Conditions d'utilisation", "/terms"], ["Politique de confidentialité", "/privacy"], ["Politique de remboursement", "/refund"]].map(([l, href]) => (
                <div key={l} style={{ marginBottom: 8 }}>
                  <Link href={href} style={{ fontSize: 13, color: "var(--color-text-2)", textDecoration: "none" }}>{l}</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: "0.5px", background: "var(--color-hairline)", margin: "0 0 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
            <span translate="no" className="notranslate" style={{ position: "relative", display: "inline-block" }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-1)" }}>f4ntom_kox</span>
              <span style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, var(--color-violet), transparent)", display: "block" }} />
            </span>
            <span style={{ fontSize: 11, color: "var(--color-text-2)" }}>· Tous droits réservés.</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--color-text-2)" }}>© 2026 <span translate="no" className="notranslate">VYXEN</span> · Turn every deal into done.</span>
            <Link href="/terms"   style={{ fontSize: 11, color: "var(--color-text-2)", textDecoration: "none" }}>CGU</Link>
            <Link href="/privacy" style={{ fontSize: 11, color: "var(--color-text-2)", textDecoration: "none" }}>Confidentialité</Link>
            <Link href="/refund"  style={{ fontSize: 11, color: "var(--color-text-2)", textDecoration: "none" }}>Remboursement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <AgentSelectionProvider>
      <style>{`
        .stat-item { border-right: 0.5px solid rgba(255,255,255,0.05); }
        .stat-item:last-child { border-right: none; }
        @media (max-width: 640px) { .stat-item:nth-child(even) { border-right: none; } }
      `}</style>
      <LivingBackground />
      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
      <Navbar />
      <Hero onOpenDemo={() => setDemoOpen(true)} />
      <AgentsLab />
      <WorldSection />
      <MissionCenter onOpenDemo={() => setDemoOpen(true)} />
      <HowItWorks />
      <Pricing />
      <CTAFinal />
      <Footer />
    </AgentSelectionProvider>
  );
}
