"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText, Mail, BarChart2, Shield,
  Check, ArrowRight, Menu, X, Zap,
  TrendingUp, Users, Building2, Star, ChevronDown,
} from "lucide-react";

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        borderBottom: scrolled ? "1px solid #E2E8F0" : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <a href="#" className="font-display text-2xl font-bold" style={{ color: scrolled ? "#0F2552" : "#fff" }}>
          Dealyze
        </a>
        <div className="hidden md:flex items-center gap-8">
          {["Fonctionnalités", "Tarifs"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium transition-colors"
              style={{ color: scrolled ? "#1A1A2E" : "rgba(255,255,255,0.85)" }}
            >
              {item}
            </a>
          ))}
          <Link href="/login" className="text-sm font-medium" style={{ color: scrolled ? "#1A1A2E" : "rgba(255,255,255,0.85)" }}>
            Se connecter
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "#2563EB" }}
          >
            Commencer gratuitement
          </Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} style={{ color: scrolled ? "#0F2552" : "#fff" }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg">
          <div className="flex flex-col p-4 gap-3">
            <a href="#fonctionnalités" className="text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>Fonctionnalités</a>
            <a href="#tarifs" className="text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>Tarifs</a>
            <Link href="/login" className="text-sm font-medium text-gray-700 py-2" onClick={() => setOpen(false)}>Se connecter</Link>
            <Link href="/register" className="py-3 rounded-lg text-sm font-semibold text-white text-center" style={{ background: "#2563EB" }} onClick={() => setOpen(false)}>
              Commencer gratuitement
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0A1A3E 0%, #0F2552 60%, #1A3A7A 100%)" }}
    >
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #2563EB 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-white/20" style={{ background: "rgba(255,255,255,0.08)" }}>
            <Zap size={13} className="text-yellow-400" />
            <span className="text-xs font-medium text-white/80 tracking-wide">Powered by Gemini 2.5 Flash · XPRIZE Hackathon 2026</span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-bold leading-tight text-white mb-6">
            Turn every deal<br />
            <span style={{ color: "#60A5FA" }}>into done.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl leading-relaxed">
            4 agents IA spécialisés pour automatiser vos devis, relances, analyses de pitch et due diligences — en quelques secondes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all hover:opacity-90 hover:scale-105"
              style={{ background: "#2563EB", boxShadow: "0 0 30px rgba(37,99,235,0.4)" }}
            >
              Essayer gratuitement <ArrowRight size={18} />
            </Link>
            <a
              href="#fonctionnalités"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base border border-white/25 transition-all hover:bg-white/10"
            >
              Découvrir les agents <ChevronDown size={18} />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-12 pt-12 border-t border-white/10">
            {[
              { icon: <Users size={14} />, text: "Pour PME & Investisseurs" },
              { icon: <Shield size={14} />, text: "Sécurisé — Firebase Auth" },
              { icon: <Star size={14} />, text: "Essai gratuit · Sans CB" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-white/60 text-sm">
                <span style={{ color: "#60A5FA" }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 flex-col gap-4 w-64">
        {[
          { label: "Devis généré en", value: "8 sec", emoji: "⚡" },
          { label: "Relances traitées en", value: "5 sec", emoji: "📩" },
          { label: "Due diligence complète", value: "< 2 min", emoji: "🔍" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl p-4 border" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
            <div className="text-xl mb-1">{c.emoji}</div>
            <div className="text-2xl font-bold text-white font-mono">{c.value}</div>
            <div className="text-xs text-white/50">{c.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── METRICS BAR ─────────────────────────────────────────────────────────────
function MetricsBar() {
  const items = [
    { icon: <TrendingUp size={18} />, value: "4 agents IA", label: "spécialisés" },
    { icon: <Zap size={18} />, value: "< 10 sec", label: "par génération" },
    { icon: <Shield size={18} />, value: "100% sécurisé", label: "Firebase Auth" },
    { icon: <Building2 size={18} />, value: "PME & VC", label: "profils dédiés" },
  ];
  return (
    <section className="py-8 border-b" style={{ background: "#F4F6F9", borderColor: "#E2E8F0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.value} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                {item.icon}
              </div>
              <div>
                <div className="text-base font-bold" style={{ color: "#0F2552" }}>{item.value}</div>
                <div className="text-xs text-gray-400">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── AGENTS ───────────────────────────────────────────────────────────────────
const AGENTS = [
  {
    icon: <FileText size={26} />, name: "Deal Draft", tag: "Génération de devis",
    desc: "Générez des devis professionnels, lettres d'intention et contrats commerciaux en quelques secondes grâce à Gemini 2.5.",
    features: ["Devis structuré et professionnel", "Calcul automatique des montants", "Clauses contractuelles adaptées"],
    color: "#0F2552", light: "#EFF6FF",
  },
  {
    icon: <Mail size={26} />, name: "Smart Chase", tag: "Relances intelligentes",
    desc: "Ne perdez plus aucun prospect. Séquences de relances personnalisées, adaptées au contexte de chaque deal et au profil du contact.",
    features: ["Séquences multi-étapes personnalisées", "Ton adapté à la relation commerciale", "Timing et fréquence optimisés"],
    color: "#1D4ED8", light: "#DBEAFE",
  },
  {
    icon: <BarChart2 size={26} />, name: "Pitch Radar", tag: "Analyse de pitch",
    desc: "Analysez n'importe quel pitch startup en temps réel. Score, forces, faiblesses et recommandations actionnables en 2 minutes.",
    features: ["Score sur 10 par dimension", "Forces & axes d'amélioration", "Recommandations actionnables"],
    color: "#7C3AED", light: "#F5F3FF",
  },
  {
    icon: <Shield size={26} />, name: "Deep Due", tag: "Due diligence IA",
    desc: "Due diligence approfondie sur une entreprise ou un fondateur. Profil, risques, réputation — tout analysé automatiquement.",
    features: ["Profil fondateur complet", "Cartographie des risques", "Recommandation investissement"],
    color: "#059669", light: "#ECFDF5",
  },
];

function AgentsSection() {
  return (
    <section id="fonctionnalités" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 tracking-widest uppercase" style={{ background: "#EFF6FF", color: "#2563EB" }}>
            Nos agents
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: "#0F2552" }}>
            Un agent pour chaque étape<br />de votre deal
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Dealyze centralise 4 agents IA dans une seule plateforme. Chacun maîtrise une étape critique de vos cycles de vente et d&apos;investissement.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {AGENTS.map((agent) => (
            <div
              key={agent.name}
              className="rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              style={{ background: "#FAFAFA" }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ background: agent.light, color: agent.color }}>
                  {agent.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: agent.color }}>{agent.tag}</div>
                  <h3 className="text-xl font-bold" style={{ color: "#0F2552" }}>{agent.name}</h3>
                </div>
              </div>
              <p className="text-gray-500 mb-6 leading-relaxed text-sm">{agent.desc}</p>
              <ul className="space-y-2">
                {agent.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: agent.light }}>
                      <Check size={11} style={{ color: agent.color }} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "Créez votre compte", desc: "Inscription en 30 secondes. Aucune carte bancaire requise pour l'essai gratuit de 5 utilisations." },
    { n: "02", title: "Choisissez votre agent", desc: "Deal Draft, Smart Chase, Pitch Radar ou Deep Due — sélectionnez l'agent adapté à votre besoin." },
    { n: "03", title: "Obtenez votre résultat", desc: "En moins de 10 secondes, Gemini 2.5 génère votre contenu. Exportez, copiez, envoyez." },
  ];
  return (
    <section className="py-24" style={{ background: "#F4F6F9" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: "#0F2552" }}>
            Opérationnel en 3 étapes
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">Pas de configuration complexe. Dealyze est prêt en quelques minutes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.n} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="font-mono text-4xl font-bold mb-4" style={{ color: "#2563EB", opacity: 0.25 }}>{step.n}</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "#0F2552" }}>{step.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{step.desc}</p>
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
    name: "Starter", price: "47",
    desc: "Pour démarrer et tester les agents sur vos premiers deals.",
    features: ["17 devis Deal Draft / mois", "17 relances Smart Chase / mois", "5 analyses Pitch Radar / mois", "Tableau de bord analytique", "Support email"],
    cta: "Commencer", highlight: false,
  },
  {
    name: "Growth", price: "147",
    desc: "Pour les équipes actives qui concluent des deals chaque semaine.",
    features: ["Deal Draft illimité", "Smart Chase illimité", "Pitch Radar illimité", "5 Due Diligences / mois", "Support prioritaire"],
    cta: "Choisir Growth", highlight: true,
  },
  {
    name: "Enterprise", price: "477",
    desc: "Pour les fonds d'investissement et équipes en volume.",
    features: ["Tout illimité", "Deep Due diligence illimité", "Export PDF & API access", "Onboarding dédié", "SLA garanti 99.9%"],
    cta: "Contacter", highlight: false,
  },
];

function Pricing() {
  return (
    <section id="tarifs" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 tracking-widest uppercase" style={{ background: "#EFF6FF", color: "#2563EB" }}>
            Tarifs
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: "#0F2552" }}>
            Investissez dans votre pipeline
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">Chaque plan inclut un essai gratuit. Passez au plan supérieur à tout moment.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-8 border flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
              style={{
                background: plan.highlight ? "#0F2552" : "#FAFAFA",
                borderColor: plan.highlight ? "#2563EB" : "#E2E8F0",
                boxShadow: plan.highlight ? "0 0 40px rgba(37,99,235,0.2)" : undefined,
              }}
            >
              {plan.highlight && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-4 self-start" style={{ background: "#2563EB", color: "#fff" }}>
                  <Star size={10} /> Populaire
                </div>
              )}
              <h3 className="text-lg font-bold mb-1" style={{ color: plan.highlight ? "#fff" : "#0F2552" }}>{plan.name}</h3>
              <p className="text-sm mb-5" style={{ color: plan.highlight ? "rgba(255,255,255,0.55)" : "#94A3B8" }}>{plan.desc}</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-5xl font-bold font-mono" style={{ color: plan.highlight ? "#fff" : "#0F2552" }}>${plan.price}</span>
                <span className="text-sm mb-2" style={{ color: plan.highlight ? "rgba(255,255,255,0.4)" : "#94A3B8" }}>/mois</span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: plan.highlight ? "rgba(37,99,235,0.25)" : "#EFF6FF" }}>
                      <Check size={11} style={{ color: plan.highlight ? "#60A5FA" : "#2563EB" }} />
                    </div>
                    <span style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "#374151" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 rounded-xl font-semibold text-center text-sm text-white hover:opacity-90 transition-opacity"
                style={{ background: plan.highlight ? "#2563EB" : "#0F2552" }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA BANNER ──────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-24" style={{ background: "linear-gradient(135deg, #0A1A3E 0%, #0F2552 50%, #1A3A7A 100%)" }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
          Votre prochain deal<br />
          <span style={{ color: "#60A5FA" }}>commence maintenant.</span>
        </h2>
        <p className="text-xl text-white/60 mb-10 max-w-xl mx-auto">
          Rejoignez Dealyze et transformez chaque opportunité en contrat signé grâce à l&apos;IA.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
            style={{ background: "#2563EB", boxShadow: "0 0 30px rgba(37,99,235,0.4)" }}
          >
            Essayer gratuitement <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white border border-white/25 hover:bg-white/10 transition-all"
          >
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
    <footer className="py-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-display text-xl font-bold" style={{ color: "#0F2552" }}>Dealyze</div>
          <p className="text-xs text-gray-400 mt-1">Turn every deal into done.</p>
        </div>
        <div className="text-xs text-gray-400">Powered by Gemini 2.5 · Firebase · Supabase</div>
        <div className="text-xs text-gray-400">© 2026 Dealyze · XPRIZE Hackathon 2026</div>
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
      <MetricsBar />
      <AgentsSection />
      <HowItWorks />
      <Pricing />
      <CTABanner />
      <Footer />
    </>
  );
}
