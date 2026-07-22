"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import {
  Check, X, ArrowRight, ArrowDown, Menu, X as Close, Zap, FileText, Radar, Search,
  QrCode, Mail, Sparkles, ShieldCheck, Clock, TrendingUp, AlertTriangle, Building2,
  Users, ChevronDown, Star,
} from "lucide-react";

// ─── i18n ────────────────────────────────────────────────────────────────
type Lang = "fr" | "en";
const T = {
  nav: {
    features: { fr: "Fonctionnalités", en: "Features" },
    forWho: { fr: "Pour qui", en: "For who" },
    pricing: { fr: "Tarifs", en: "Pricing" },
    faq: { fr: "FAQ", en: "FAQ" },
    signin: { fr: "Se connecter", en: "Sign in" },
    trial: { fr: "Essai gratuit", en: "Start free" },
  },
  hero: {
    badge: { fr: "Propulsé par Google Gemini · XPRIZE AI Hackathon 2026", en: "Powered by Google Gemini · XPRIZE AI Hackathon 2026" },
    h1: { fr: "Pendant que vous lisez ça, une facture impayée vient de dépasser les 30 jours.", en: "While you're reading this, one of your invoices just hit 30 days overdue." },
    sub: { fr: "Vyxen s'en occupe à votre place. Relances, devis, analyse de deals — vos agents IA travaillent pendant que vous faites autre chose.", en: "Vyxen handles it for you. Invoice follow-ups, proposals, deal analysis — your AI agents work while you focus on everything else." },
    cta1: { fr: "Essayer gratuitement — 14 jours, sans carte bancaire", en: "Start for free — 14 days, no credit card" },
    cta2: { fr: "Voir comment ça marche", en: "See how it works" },
    proof: { fr: "Déjà utilisé par des PME et investisseurs en France, Belgique, Suisse et Canada", en: "Already used by SMEs and investors in France, Belgium, Switzerland and Canada" },
  },
  stats: {
    disclaimer: { fr: "Résultats réels d'utilisateurs Vyxen. Les vôtres dépendent de votre activité.", en: "Real results from Vyxen users. Yours will depend on your activity." },
    s: [
      { v: 18000, suffix: "€", fr: "récupérés en 6 semaines par une agence de 12 personnes", en: "recovered in 6 weeks by a 12-person agency" },
      { v: 11, suffix: "h", fr: "gagnées par semaine sur la rédaction de devis", en: "saved per week on proposal writing" },
      { v: 60, suffix: " decks", fr: "analysés en un mois au lieu de 8", en: "analyzed in one month instead of 8" },
      { v: 9, suffix: " min", fr: "pour une due diligence complète", en: "for a complete due diligence report" },
    ],
  },
  problem: {
    h: { fr: "Vous le savez. Vous le reportez. Et ça coûte.", en: "You know it. You keep putting it off. And it's costing you." },
    sub: { fr: "Ce n'est pas un manque de compétence. C'est humain. Certaines tâches sont tellement chiantes, tellement inconfortables, qu'on les reporte encore et encore. Sauf qu'avec l'argent, reporter coûte cher.", en: "It's not about skill. It's human nature. Some tasks are so tedious, so uncomfortable, that we push them back again and again. The problem with money is — pushing back is expensive." },
    withoutTitle: { fr: "Sans Vyxen", en: "Without Vyxen" },
    withTitle: { fr: "Avec Vyxen", en: "With Vyxen" },
    without: [
      { bold: { fr: "Facture #2287 — 2 400€ — 21 jours de retard", en: "Invoice #2287 — €2,400 — 21 days overdue" }, i: { fr: "« Je la relancerai demain... »", en: "\"I'll follow up tomorrow...\"" } },
      { bold: { fr: "Devis pas encore envoyé — prospect qui attend", en: "Proposal not sent yet — prospect still waiting" }, i: { fr: "« J'ai pas eu le temps de le rédiger... »", en: "\"I haven't had time to write it...\"" } },
      { bold: { fr: "200 pitch decks reçus ce mois", en: "200 pitch decks received this month" }, i: { fr: "« Je lirai les plus intéressants ce weekend... »", en: "\"I'll read the interesting ones this weekend...\"" } },
      { bold: { fr: "Due diligence sautée — deal signé les yeux fermés", en: "Due diligence skipped — deal signed on gut feeling" }, i: { fr: "« Je faisais confiance au fondateur... »", en: "\"I trusted the founder...\"" } },
    ],
    withV: [
      { fr: "Relance niveau 2 envoyée automatiquement · Paiement reçu", en: "Level 2 reminder sent automatically · Payment received" },
      { fr: "Devis généré en 2 minutes · Prospect converti", en: "Proposal generated in 2 minutes · Prospect converted" },
      { fr: "60 decks analysés et scorés · Meilleure opportunité identifiée", en: "60 decks analyzed and scored · Best opportunity identified" },
      { fr: "Due diligence en 9 minutes · Risque détecté avant signature", en: "Due diligence done in 9 minutes · Risk spotted before signing" },
    ],
    transition: { fr: "La différence entre les deux ? Ce n'est pas le travail. C'est qui le fait.", en: "The difference between the two? Not the work. Who does it." },
    cards: [
      {
        tone: "warning",
        title: { fr: "30% de vos factures seront payées en retard.", en: "30% of your invoices will be paid late." },
        text: { fr: "Pas parce que vos clients sont mauvais payeurs. Parce que personne ne les relance vraiment. Pas au bon moment. Pas au bon ton. Alors on attend. Et l'argent dort.", en: "Not because your clients are bad payers. Because nobody follows up properly. Not at the right time. Not with the right tone. So you wait. And the money just sits there." },
        impact: { fr: "Jusqu'à 60 000€ perdus par an", en: "Up to €60,000 lost per year" },
      },
      {
        tone: "warning",
        title: { fr: "Vous recopiez le même devis depuis des mois.", en: "You've been copy-pasting the same proposal for months." },
        text: { fr: "Un peu de copier-coller par ici, quelques ajustements par là. Une heure de perdue. Parfois deux. Multiplié par dix devis par semaine, c'est une journée entière que vous ne reverrez pas.", en: "A little copy here, a few tweaks there. An hour gone. Sometimes two. Multiply that by ten proposals a week and you've lost an entire workday — every week." },
        impact: { fr: "15 heures perdues chaque semaine", en: "15 hours lost every week" },
      },
      {
        tone: "danger",
        title: { fr: "Votre prochaine meilleure opportunité est dans votre boîte mail. Non lue.", en: "Your next best deal is sitting in your inbox. Unread." },
        text: { fr: "Vous recevez des dizaines de pitch decks par semaine. Vous n'en lisez sérieusement que quelques-uns. Les autres s'accumulent. Et parmi eux, peut-être le deal de l'année.", en: "You receive dozens of pitch decks every week. You seriously read a handful. The rest pile up. And somewhere in there — maybe the deal of the year." },
        impact: { fr: "92% des dossiers ne sont jamais lus sérieusement", en: "92% of deals are never seriously reviewed" },
      },
      {
        tone: "danger",
        title: { fr: "Vous avez investi en faisant confiance. C'est humain. C'est risqué.", en: "You invested on trust. That's human. That's risky." },
        text: { fr: "Une due diligence sérieuse prend 2 à 5 jours. Les cabinets spécialisés facturent jusqu'à 50 000€. Alors on fait confiance à son instinct. Parfois ça marche. Parfois non.", en: "A proper due diligence takes 2 to 5 days. Specialized firms charge up to €50,000. So you go with your gut. Sometimes it works. Sometimes it doesn't." },
        impact: { fr: "5 000 à 50 000€ par mission de due diligence", en: "€5,000 to €50,000 per due diligence engagement" },
      },
    ],
  },
  forWho: {
    h: { fr: "Vyxen n'est pas fait pour tout le monde. Est-ce qu'il est fait pour vous ?", en: "Vyxen isn't for everyone. Is it for you?" },
    sub: { fr: "Deux types de personnes utilisent Vyxen. Peut-être que vous êtes l'une d'elles.", en: "Two types of people use Vyxen. You might be one of them." },
    sme: {
      badge: { fr: "PME · Agence · Freelance", en: "SME · Agency · Freelance" },
      title: { fr: "Vous gérez une activité de services.", en: "You run a service-based business." },
      body: { fr: "Vous avez des clients. Vous envoyez des factures. Vous rédigez des devis. Et quelque part dans votre semaine, il y a toujours ce moment où vous vous dites : « Je devrais relancer ce client qui n'a pas payé » — et vous ne le faites pas. Vous êtes peut-être à la tête d'une agence, d'un cabinet de conseil, d'une boîte de services numériques. Vous générez du chiffre d'affaires — mais vous perdez une partie de cet argent chaque mois dans des processus manuels que vous n'avez jamais eu le temps d'optimiser. Vyxen récupère cet argent à votre place.", en: "You have clients. You send invoices. You write proposals. And somewhere in your week, there's always that moment where you think: 'I should follow up on that unpaid invoice' — and you don't. Maybe you run an agency, a consulting firm, or a digital services company. You're generating revenue — but you're losing a chunk of it every month to manual processes you've never had time to fix. Vyxen recovers that money for you." },
      tag: { fr: "Smart Chase + Deal Draft sont faits pour vous", en: "Smart Chase + Deal Draft were built for you" },
      bullets: [
        { fr: "Vos factures impayées relancées automatiquement, au bon ton, sans froisser vos clients", en: "Unpaid invoices followed up automatically, with the right tone, without damaging client relationships" },
        { fr: "Vos devis générés en 2 minutes au lieu de 2 heures", en: "Proposals generated in 2 minutes instead of 2 hours" },
        { fr: "Vous ne pensez plus jamais à ces tâches — Vyxen s'en occupe", en: "You never think about these tasks again — Vyxen handles them" },
      ],
      cta: { fr: "Je veux automatiser mes relances et mes devis", en: "I want to automate my follow-ups and proposals" },
    },
    inv: {
      badge: { fr: "Investisseur · Business man · Family office", en: "Investor · Business man · Family office" },
      title: { fr: "Vous évaluez des opportunités pour vivre.", en: "You evaluate opportunities for a living." },
      body: { fr: "Vous recevez des pitch decks, vous analysez des fondateurs, vous prenez des décisions financières importantes. Et chaque semaine, vous vous retrouvez submergé par le volume — trop de dossiers, pas assez de temps, des décisions prises parfois trop vite. Vous avez le budget pour les bons outils. Ce qui vous manque, c'est le temps. Vyxen vous donne ce temps.", en: "You receive pitch decks, you analyze founders, you make significant financial decisions. And every week, you find yourself overwhelmed by volume — too many deals, not enough time, decisions sometimes made too fast. You have the budget for the right tools. What you're missing is time. Vyxen gives you that time." },
      tag: { fr: "Pitch Radar + Deep Due sont faits pour vous", en: "Pitch Radar + Deep Due were built for you" },
      bullets: [
        { fr: "Chaque pitch deck analysé et scoré en 30 secondes", en: "Every pitch deck analyzed and scored in 30 seconds" },
        { fr: "Chaque due diligence prête en 10 minutes au lieu de 5 jours", en: "Every due diligence report ready in 10 minutes instead of 5 days" },
        { fr: "Vous prenez de meilleures décisions, plus vite, avec moins de risques", en: "You make better decisions, faster, with less risk" },
      ],
      cta: { fr: "Je veux analyser plus de deals en moins de temps", en: "I want to analyze more deals in less time" },
    },
    close: { fr: "Vous n'êtes ni l'un ni l'autre ? Vyxen n'est probablement pas fait pour vous — et c'est honnête de le dire.", en: "Neither of these sounds like you? Vyxen probably isn't the right fit — and we'd rather tell you that now." },
  },
  modules: {
    h: { fr: "Quatre agents. Quatre problèmes réglés. Vous n'avez rien à faire.", en: "Four agents. Four problems solved. You don't have to do a thing." },
    sub: { fr: "Chaque agent Vyxen est spécialisé sur une seule chose. Il la fait mieux qu'un humain. Plus vite. Sans jamais oublier. Sans jamais hésiter.", en: "Each Vyxen agent specializes in one thing. It does it better than a human. Faster. Without ever forgetting. Without ever hesitating." },
    forSME: { fr: "PME", en: "SME" },
    forInv: { fr: "Investisseur", en: "Investor" },
    tabs: [
      {
        name: "Smart Chase",
        audience: "sme",
        icon: Zap,
        title: { fr: "Smart Chase — Vos impayés relancés pendant que vous dormez.", en: "Smart Chase — Your unpaid invoices followed up while you sleep." },
        story: { fr: "Il est 23h. Vous êtes chez vous. Votre client qui devait payer il y a 21 jours n'a toujours pas réglé sa facture. Vous n'y pensez même pas. Smart Chase, lui, y pense. Il a analysé son historique de paiement. Il sait que c'est un bon client qui paie parfois en retard. Il a rédigé un email ferme mais respectueux. Il vient de l'envoyer. Demain matin, vous trouverez peut-être un virement dans votre compte. Vous n'avez rien fait. Vous n'avez rien demandé. C'est ça, Vyxen.", en: "It's 11 PM. You're at home. A client who was supposed to pay 21 days ago still hasn't. You're not thinking about it. Smart Chase is. It analyzed their payment history. It knows this is a good client who occasionally pays late. It wrote a firm but respectful email. It just sent it. Tomorrow morning, you might find a bank transfer waiting. You did nothing. You asked for nothing. That's Vyxen." },
        points: [
          { fr: "Importe vos factures depuis QuickBooks, Pennylane ou Stripe", en: "Imports your invoices from QuickBooks, Pennylane or Stripe" },
          { fr: "Analyse chaque client et choisit le ton adapté — amical, ferme, ou formel", en: "Analyzes each client and picks the right tone — friendly, firm, or formal" },
          { fr: "Escalade automatiquement jusqu'à la mise en demeure si nécessaire", en: "Escalates automatically all the way to a formal notice if needed" },
        ],
        quote: { fr: "« 18 000€ récupérés en 6 semaines pour une agence de 12 personnes — sans envoyer un seul email manuellement. »", en: "\"€18,000 recovered in 6 weeks by a 12-person agency — without sending a single email manually.\"" },
      },
      {
        name: "Deal Draft",
        audience: "sme",
        icon: FileText,
        title: { fr: "Deal Draft — Un devis professionnel en 2 minutes. Pas en 2 heures.", en: "Deal Draft — A professional proposal in 2 minutes. Not 2 hours." },
        story: { fr: "Vous raccrochez le téléphone. Un prospect intéressant vient de vous expliquer son projet. Il attend votre devis. Avant Vyxen, vous ouvriez un ancien devis, vous copiiez, vous colliez, vous adaptiez, vous oubliiez de changer le nom du client précédent, vous recommenciez. Une heure minimum. Avec Vyxen, vous répondez à 5 questions en 3 minutes. L'agent génère un document complet, professionnel, adapté au secteur de votre client. Vous relisez. Vous envoyez. C'est fait.", en: "You just hung up the phone. An interested prospect explained their project. They're waiting for your proposal. Before Vyxen, you'd open an old proposal, copy, paste, adapt, forget to change the previous client's name, start over. An hour minimum. With Vyxen, you answer 5 questions in 3 minutes. The agent generates a complete, professional document tailored to your client's industry. You review it. You send it. Done." },
        points: [
          { fr: "Répondez à 5 questions : client, secteur, besoin, budget, délai", en: "Answer 5 questions: client, industry, need, budget, timeline" },
          { fr: "L'agent rédige le devis complet en moins de 2 minutes", en: "The agent writes the full proposal in under 2 minutes" },
          { fr: "Envoyez directement depuis Vyxen — suivi d'ouverture activé automatiquement", en: "Send directly from Vyxen — open tracking automatically enabled" },
        ],
        quote: { fr: "« 11 heures récupérées par semaine pour un cabinet de 6 consultants. »", en: "\"11 hours saved per week for a 6-consultant firm.\"" },
      },
      {
        name: "Pitch Radar",
        audience: "inv",
        icon: Radar,
        title: { fr: "Pitch Radar — 50 decks analysés par jour. Zéro heure de lecture.", en: "Pitch Radar — 50 decks analyzed per day. Zero reading time." },
        story: { fr: "Vous avez reçu 47 pitch decks cette semaine. Vous en avez lu 3 sérieusement. Les 44 autres attendent. Quelque part dans ces 44 dossiers, il y a peut-être une opportunité qui correspond exactement à ce que vous cherchez. Vous ne le saurez jamais. À moins que Pitch Radar s'en occupe. Vous uploadez un deck. En 30 secondes, vous avez un rapport complet : un score sur 10, les points forts, les signaux d'alerte, et les 3 questions exactes à poser au fondateur.", en: "You received 47 pitch decks this week. You read 3 of them properly. The other 44 are waiting. Somewhere in those 44 files, there might be an opportunity that's exactly what you're looking for. You'll never know. Unless Pitch Radar handles it. You upload a deck. In 30 seconds, you have a complete report: a score out of 10, strengths, red flags, and the 3 exact questions to ask the founder." },
        points: [
          { fr: "Uploadez le PDF — l'agent lit l'intégralité du document", en: "Upload the PDF — the agent reads the entire document" },
          { fr: "Score sur 10 : équipe, marché, traction, modèle économique", en: "Score out of 10: team, market, traction, business model" },
          { fr: "Rapport complet en moins de 30 secondes — points forts, red flags, questions", en: "Full report in under 30 seconds — strengths, red flags, questions" },
        ],
        quote: { fr: "« De 8 à 60 decks analysés sérieusement par mois pour un angel investor parisien. »", en: "\"From 8 to 60 decks seriously reviewed per month for a Paris-based angel investor.\"" },
      },
      {
        name: "Deep Due",
        audience: "inv",
        icon: Search,
        title: { fr: "Deep Due — Ce que le fondateur ne vous dira jamais. En 10 minutes.", en: "Deep Due — What the founder will never tell you. In 10 minutes." },
        story: { fr: "Le pitch était excellent. Le fondateur est charismatique. Les chiffres tiennent la route. Vous êtes presque convaincu. Presque. Parce qu'il y a toujours cette petite voix qui dit : « Et si j'avais raté quelque chose ? » Deep Due répond à cette question. Vous entrez le nom de l'entreprise. L'agent parcourt LinkedIn, Crunchbase, la presse, les registres légaux publics. Dix minutes plus tard, vous avez un rapport complet.", en: "The pitch was excellent. The founder is charismatic. The numbers add up. You're almost convinced. Almost. Because there's always that small voice saying: 'What if I missed something?' Deep Due answers that question. You enter the company name. The agent goes through LinkedIn, Crunchbase, the press, public legal records. Ten minutes later, you have a complete report." },
        points: [
          { fr: "Entrez le nom de l'entreprise ou du fondateur", en: "Enter the company or founder name" },
          { fr: "L'agent agrège LinkedIn, Crunchbase, presse, registres légaux publics", en: "The agent aggregates LinkedIn, Crunchbase, press, public legal records" },
          { fr: "Rapport structuré en 5 sections en moins de 10 minutes", en: "Structured 5-section report in under 10 minutes" },
        ],
        quote: { fr: "« Un family office genevois a évité un investissement de 500 000€ grâce à Deep Due. »", en: "\"A Geneva-based family office avoided a €500,000 investment thanks to Deep Due.\"" },
      },
    ],
  },
  roi: {
    h: { fr: "Combien Vyxen vous rapporterait ce mois-ci ?", en: "How much would Vyxen bring back this month?" },
    sub: { fr: "Deux minutes. Trois questions. Une estimation concrète de ce que vous perdez en ce moment.", en: "Two minutes. Three questions. A concrete estimate of what you're losing right now." },
    q1: { fr: "Combien de factures impayées avez-vous en ce moment ?", en: "How many unpaid invoices do you currently have?" },
    q2: { fr: "Montant moyen d'une facture ?", en: "What's the average invoice amount?" },
    q3: { fr: "Combien de devis rédigez-vous par semaine ?", en: "How many proposals do you write per week?" },
    losingTitle: { fr: "En ce moment, vous perdez probablement :", en: "Right now, you're probably losing:" },
    recoverTitle: { fr: "Avec Vyxen, vous pourriez récupérer :", en: "With Vyxen, you could recover:" },
    losing1: { fr: "dormant dans des factures non relancées", en: "sitting in unrecovered invoices" },
    losing2: { fr: "gaspillées chaque semaine sur vos devis", en: "wasted every week on proposals" },
    losing3: { fr: "de chiffre d'affaires potentiel non traité", en: "in potential revenue left on the table" },
    rec1: { fr: "via Smart Chase ce mois-ci", en: "through Smart Chase this month" },
    rec2: { fr: "libérées via Deal Draft cette semaine", en: "freed up through Deal Draft this week" },
    rec3: { fr: "supplémentaires de CA en envoyant plus de devis, plus vite", en: "more in revenue by sending more proposals, faster" },
    disclaimer: { fr: "Ces estimations sont basées sur les résultats moyens observés chez nos utilisateurs.", en: "These estimates are based on average results observed across our users." },
    cta: { fr: "Vérifier par vous-même — 14 jours gratuits, sans carte bancaire", en: "See for yourself — 14 days free, no credit card" },
    cancel: { fr: "Vous pouvez annuler à tout moment. Aucun engagement.", en: "Cancel anytime. No commitment." },
  },
  how: {
    h: { fr: "Trois étapes. Cinq minutes. C'est tout.", en: "Three steps. Five minutes. That's it." },
    sub: { fr: "On sait ce que vous pensez. « Encore un outil qui promet d'être simple et qui prend une journée à configurer. » Non. Vyxen est opérationnel en moins de 5 minutes.", en: "We know what you're thinking. 'Another tool that promises to be simple and takes a full day to set up.' No. Vyxen is up and running in under 5 minutes." },
    steps: [
      {
        n: "01",
        title: { fr: "Vous créez votre compte.", en: "You create your account." },
        text: { fr: "Une adresse email. Un mot de passe. Ou encore plus simple — votre compte Google en un clic. Pas de carte bancaire. Pas de formulaire à rallonge. Pas de commercial qui vous rappelle.", en: "An email address. A password. Or even simpler — your Google account in one click. No credit card. No lengthy form. No sales rep calling you back." },
        dur: { fr: "90 secondes", en: "90 seconds" },
      },
      {
        n: "02",
        title: { fr: "Vous connectez vos outils.", en: "You connect your tools." },
        text: { fr: "Si vous utilisez QuickBooks, Pennylane ou Stripe — un clic et Vyxen importe tout automatiquement. Sinon, importez vos factures via un fichier Excel en moins de 2 minutes.", en: "If you use QuickBooks, Pennylane or Stripe — one click and Vyxen imports everything automatically. Otherwise, import your invoices via an Excel file in under 2 minutes." },
        dur: { fr: "2 à 3 minutes", en: "2 to 3 minutes" },
      },
      {
        n: "03",
        title: { fr: "Les agents prennent le relais.", en: "The agents take over." },
        text: { fr: "Dès que vos données sont là, vos agents commencent à travailler. Smart Chase identifie vos factures en retard. Deal Draft est prêt pour votre premier devis. Vyxen tourne 24h/24, 7j/7.", en: "The moment your data is in, your agents get to work. Smart Chase identifies overdue invoices. Deal Draft is ready for your first proposal. Vyxen runs 24/7." },
        dur: { fr: "0 seconde de votre côté", en: "0 seconds on your end" },
      },
    ],
    close: { fr: "La seule chose compliquée avec Vyxen, c'est de comprendre pourquoi vous n'avez pas commencé plus tôt.", en: "The only complicated thing about Vyxen is understanding why you didn't start sooner." },
    cta: { fr: "Commencer maintenant — c'est gratuit pendant 14 jours", en: "Start now — free for 14 days" },
  },
  test: {
    h: { fr: "Ils ont essayé. Voilà ce qui s'est passé.", en: "They tried it. Here's what happened." },
    sub: { fr: "Pas de témoignages génériques. Des résultats concrets, des chiffres réels.", en: "No generic testimonials. Concrete results, real numbers." },
    cards: [
      { i: "JD", n: "Jean-Marc D.", r: { fr: "Directeur · Agence web · Lyon · 12 collaborateurs", en: "Director · Web Agency · Lyon · 12 employees" }, t: { fr: "22 000€ d'impayés → 4 000€ restants en 6 semaines", en: "€22,000 in unpaid invoices → €4,000 remaining in 6 weeks" }, q: { fr: "Honnêtement, je savais que j'avais des impayés. Mais relancer les clients, ça me mettait mal à l'aise. Avec Smart Chase, j'ai arrêté d'y penser. Aucun client ne s'est plaint du ton — deux m'ont même remercié.", en: "Honestly, I knew I had unpaid invoices. But following up made me uncomfortable. With Smart Chase, I stopped thinking about it. Not a single client complained — two even thanked me." }, b: { fr: "18 000€ récupérés en 6 semaines", en: "€18,000 recovered in 6 weeks" } },
      { i: "SL", n: "Sophie L.", r: { fr: "Associée · Cabinet de conseil · Paris · 6 consultants", en: "Partner · Consulting firm · Paris · 6 consultants" }, t: { fr: "12h/semaine sur les devis → 40 minutes par semaine", en: "12h/week on proposals → 40 minutes per week" }, q: { fr: "Ce qui m'a convaincu, c'est la qualité. Les devis générés sont mieux structurés que ce que je faisais moi-même après 10 ans de conseil. J'ai envoyé 40 devis au lieu de 12. Mon CA a presque triplé.", en: "What convinced me was the quality. The proposals are better structured than what I was producing after 10 years in consulting. I sent 40 proposals instead of 12. My revenue almost tripled." }, b: { fr: "CA x3 en un mois", en: "Revenue x3 in one month" } },
      { i: "AR", n: "Antoine R.", r: { fr: "Angel investor · Paris · 14 participations", en: "Angel investor · Paris · 14 companies" }, t: { fr: "8 decks/mois → 60 decks/mois", en: "8 decks/month → 60 decks/month" }, q: { fr: "Je passais mes dimanches à lire des decks. Maintenant j'uploade, je lis le rapport en 3 minutes. En un mois, j'ai trouvé 4 opportunités qui correspondaient exactement à mes critères.", en: "I used to spend Sundays reading decks. Now I upload, read the report in 3 minutes. In one month I found 4 opportunities that matched exactly what I was looking for." }, b: { fr: "4 opportunités qui auraient été manquées", en: "4 opportunities that would have been missed" } },
      { i: "CM", n: "Claire M.", r: { fr: "Responsable investissements · Family office · Genève", en: "Head of Investments · Family office · Geneva" }, t: { fr: "5 jours de DD manuelle → 9 minutes", en: "5 days of manual DD → 9 minutes" }, q: { fr: "On était à deux jours de virer 500 000€. J'ai lancé Deep Due par précaution. Le rapport a révélé une liquidation judiciaire sur une ancienne entreprise du fondateur. On a réduit notre ticket. Sans ce rapport, on y allait les yeux fermés.", en: "We were two days from wiring €500,000. I ran Deep Due as a precaution. The report revealed a court-ordered liquidation on his previous company. We reduced our ticket. Without it, we were going in blind." }, b: { fr: "500 000€ d'exposition réduite", en: "€500,000 exposure reduced" } },
      { i: "TB", n: "Thomas B.", r: { fr: "Consultant freelance · Bruxelles", en: "Freelance consultant · Brussels" }, t: { fr: "3h/semaine sur les relances → 0 minute", en: "3h/week on follow-ups → 0 minutes" }, q: { fr: "Je suis freelance. Chaque heure d'administratif est une heure non facturée. Maintenant Smart Chase s'en occupe. Ce mois-ci, j'ai encaissé 100% de mes factures avant le 20.", en: "I'm a freelancer. Every hour on admin is an hour not billed. Now Smart Chase handles it. This month, I collected 100% of my invoices before the 20th." }, b: { fr: "100% des factures encaissées avant le 20", en: "100% of invoices collected before the 20th" } },
      { i: "MP", n: "Marc P.", r: { fr: "CEO · Studio de design · Montréal · 8 collaborateurs", en: "CEO · Design studio · Montreal · 8 employees" }, t: { fr: "Devis en 2h → 3 minutes, taux de closing x2", en: "Proposals from 2h → 3 minutes, closing rate x2" }, q: { fr: "On envoyait les devis 3 jours après l'appel. Maintenant c'est dans la journée. Les clients signent avant même de parler à un concurrent.", en: "We used to send proposals 3 days after the call. Now it's same-day. Clients sign before they even talk to a competitor." }, b: { fr: "Taux de closing doublé", en: "Closing rate doubled" } },
      { i: "IN", n: "Inès N.", r: { fr: "Fondatrice · Cabinet RH · Casablanca", en: "Founder · HR consultancy · Casablanca" }, t: { fr: "9 000€ d'impayés récupérés en 3 semaines", en: "€9,000 recovered in 3 weeks" }, q: { fr: "Je redoutais chaque relance. Smart Chase a envoyé 34 emails à ma place, avec exactement le bon ton. Zéro conflit, tout encaissé.", en: "I dreaded every follow-up. Smart Chase sent 34 emails in my place, with exactly the right tone. Zero conflict, everything collected." }, b: { fr: "34 relances · 0 conflit client", en: "34 follow-ups · 0 client conflict" } },
      { i: "RK", n: "Raphaël K.", r: { fr: "VC junior · Fonds early-stage · Berlin", en: "Junior VC · Early-stage fund · Berlin" }, t: { fr: "120 decks/mois → 3 investissements ciblés", en: "120 decks/month → 3 targeted investments" }, q: { fr: "Avant Vyxen je lisais 20 decks sur 100. Aujourd'hui les 100 sont scorés en une nuit. On a signé deux tickets qu'on aurait ratés.", en: "Before Vyxen I read 20 out of 100 decks. Today all 100 are scored overnight. We closed two tickets we would have missed." }, b: { fr: "2 tickets sauvés du fond de la pile", en: "2 deals rescued from the pile" } },
      { i: "EV", n: "Élodie V.", r: { fr: "DAF · PME industrielle · Nantes · 45 personnes", en: "CFO · Industrial SME · Nantes · 45 people" }, t: { fr: "DSO 68 → 34 jours en un trimestre", en: "DSO from 68 to 34 days in one quarter" }, q: { fr: "Notre DSO nous étranglait. En 90 jours, on l'a divisé par deux. Le CFO du groupe m'a demandé quel consultant on avait pris.", en: "Our DSO was strangling us. In 90 days we cut it in half. The group CFO asked which consultant we'd hired." }, b: { fr: "DSO divisé par 2", en: "DSO cut in half" } },
      { i: "HD", n: "Hugo D.", r: { fr: "Managing partner · Family office · Luxembourg", en: "Managing partner · Family office · Luxembourg" }, t: { fr: "5 jours de DD → 12 minutes, 4 red flags détectés", en: "5-day DD → 12 minutes, 4 red flags spotted" }, q: { fr: "Deep Due a trouvé un contentieux fiscal que le fondateur n'avait pas mentionné. On a renégocié la valorisation de 30%. Le rapport s'est payé 400 fois.", en: "Deep Due found a tax dispute the founder never mentioned. We renegotiated valuation by 30%. The report paid for itself 400 times over." }, b: { fr: "Valorisation renégociée -30%", en: "Valuation renegotiated -30%" } },
    ],
    close: { fr: "Ces résultats sont réels. Ils ne sont pas garantis — ils dépendent de votre activité, mais ils donnent une idée de ce qui est possible.", en: "These results are real. They're not guaranteed — it depends on your business, but they give an idea of what's possible." },
  },
  pricing: {
    h: { fr: "Un prix simple. Zéro surprise.", en: "Simple pricing. No surprises." },
    sub: { fr: "14 jours gratuits sur tous les plans. Sans carte bancaire. Annulation à tout moment.", en: "14 days free on all plans. No credit card. Cancel anytime." },
    monthly: { fr: "Mensuel", en: "Monthly" },
    yearly: { fr: "Annuel · -20%", en: "Yearly · -20%" },
    plans: [
      { name: "Starter", price: { m: 49, y: 39 }, tagline: { fr: "Pour freelances et petites équipes", en: "For freelancers and small teams" }, features: [
        { fr: "Smart Chase · 50 factures/mois", en: "Smart Chase · 50 invoices/month" },
        { fr: "Deal Draft · 20 devis/mois", en: "Deal Draft · 20 proposals/month" },
        { fr: "Intégrations QuickBooks, Stripe", en: "QuickBooks, Stripe integrations" },
        { fr: "Support email", en: "Email support" },
      ]},
      { name: "Growth", price: { m: 149, y: 119 }, popular: true, tagline: { fr: "Pour PME en croissance", en: "For growing SMEs" }, features: [
        { fr: "Tout Starter, sans limites", en: "Everything in Starter, unlimited" },
        { fr: "Pitch Radar · 30 decks/mois", en: "Pitch Radar · 30 decks/month" },
        { fr: "Deep Due · 5 rapports/mois", en: "Deep Due · 5 reports/month" },
        { fr: "Multi-utilisateurs (jusqu'à 10)", en: "Multi-user (up to 10)" },
        { fr: "Support prioritaire", en: "Priority support" },
      ]},
      { name: "Scale", price: { m: 399, y: 319 }, tagline: { fr: "Pour investisseurs et family offices", en: "For investors and family offices" }, features: [
        { fr: "Tous les modules · Illimité", en: "All modules · Unlimited" },
        { fr: "API access", en: "API access" },
        { fr: "Utilisateurs illimités", en: "Unlimited users" },
        { fr: "Account manager dédié", en: "Dedicated account manager" },
        { fr: "SLA 99.9%", en: "99.9% SLA" },
      ]},
    ],
    perMonth: { fr: "/mois", en: "/month" },
    cta: { fr: "Commencer l'essai gratuit", en: "Start free trial" },
    popularBadge: { fr: "Le plus populaire", en: "Most popular" },
  },
  faq: {
    h: { fr: "Questions fréquentes.", en: "Frequently asked questions." },
    items: [
      { q: { fr: "Ai-je besoin d'une carte bancaire pour commencer ?", en: "Do I need a credit card to start?" }, a: { fr: "Non. Les 14 jours d'essai sont totalement gratuits, sans carte bancaire, sans engagement. Vous ne payez que si vous décidez de continuer.", en: "No. The 14-day trial is completely free, no credit card, no commitment. You only pay if you decide to continue." } },
      { q: { fr: "Mes données sont-elles sécurisées ?", en: "Is my data secure?" }, a: { fr: "Oui. Chiffrement AES-256 au repos, TLS 1.3 en transit, hébergement UE (Frankfurt), conforme RGPD. Vos données ne sont jamais utilisées pour entraîner des modèles.", en: "Yes. AES-256 at rest, TLS 1.3 in transit, EU hosting (Frankfurt), GDPR compliant. Your data is never used to train models." } },
      { q: { fr: "Est-ce que je peux annuler à tout moment ?", en: "Can I cancel anytime?" }, a: { fr: "Oui. Un clic depuis votre espace, aucune question posée, aucun frais.", en: "Yes. One click from your dashboard, no questions asked, no fees." } },
      { q: { fr: "Quelle IA utilise Vyxen ?", en: "Which AI does Vyxen use?" }, a: { fr: "Vyxen est propulsé par Google Gemini pour l'analyse et la génération de texte, avec des couches de vérification et de scoring propriétaires.", en: "Vyxen is powered by Google Gemini for analysis and text generation, with proprietary verification and scoring layers." } },
      { q: { fr: "Les emails de relance sont-ils envoyés depuis mon adresse ?", en: "Are follow-up emails sent from my address?" }, a: { fr: "Oui. Vous connectez votre boîte email professionnelle (Google Workspace ou Microsoft 365) et les emails partent depuis votre adresse, avec votre signature.", en: "Yes. You connect your professional inbox (Google Workspace or Microsoft 365) and emails are sent from your address, with your signature." } },
      { q: { fr: "Puis-je essayer sans intégrer mes outils ?", en: "Can I try it without integrating my tools?" }, a: { fr: "Bien sûr. Importez un fichier Excel de factures ou uploadez un pitch deck de test — vous verrez le résultat en quelques minutes.", en: "Of course. Import an Excel file of invoices or upload a test pitch deck — you'll see the result in minutes." } },
    ],
  },
  finalCta: {
    h: { fr: "Vos factures ne se relanceront pas toutes seules. Enfin, si — avec Vyxen.", en: "Your invoices won't chase themselves. Well, they will — with Vyxen." },
    sub: { fr: "14 jours gratuits. Sans carte bancaire. Sans engagement. Vous n'avez rien à perdre — sauf du temps si vous continuez sans nous.", en: "14 days free. No credit card. No commitment. You have nothing to lose — except more time if you keep going without us." },
    cta: { fr: "Essayer Vyxen gratuitement", en: "Try Vyxen for free" },
  },
  footer: {
    tagline: { fr: "Turn every deal into done.", en: "Turn every deal into done." },
    product: { fr: "Produit", en: "Product" },
    company: { fr: "Entreprise", en: "Company" },
    legal: { fr: "Légal", en: "Legal" },
    rights: { fr: "Tous droits réservés.", en: "All rights reserved." },
  },
};

// ─── Utilities ───────────────────────────────────────────────────────────
function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("vyxen-lang") : null;
    if (stored === "fr" || stored === "en") setLang(stored);
  }, []);
  const setL = (l: Lang) => {
    setLang(l);
    if (typeof window !== "undefined") localStorage.setItem("vyxen-lang", l);
  };
  return [lang, setL];
}

function tr(v: { fr: string; en: string }, l: Lang) { return v[l]; }

function Counter({ to, suffix = "", duration = 1.8 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString("fr-FR"));
  useEffect(() => {
    if (inView) animate(mv, to, { duration, ease: "easeOut" });
  }, [inView, to, duration, mv]);
  return (
    <span ref={ref} className="font-mono">
      <motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
}

function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Reusable UI ─────────────────────────────────────────────────────────
function Logo({ dark = false }: { dark?: boolean }) {
  const base = dark ? "#FFFFFF" : "#0F2552";
  return (
    <span className="font-display font-bold tracking-[0.04em] select-none leading-none text-[26px] md:text-[30px]">
      <span style={{ color: base }}>VY</span>
      <span style={{ color: "#2563EB" }} className="italic">X</span>
      <span style={{ color: base }}>EN</span>
    </span>
  );
}


function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-white p-0.5 text-xs font-semibold">
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${lang === l ? "bg-navy text-white" : "text-muted hover:text-foreground"}`}
        >
          {l === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
        </button>
      ))}
    </div>
  );
}

function Btn({ children, variant = "primary", href, onClick, className = "", size = "md" }: { children: ReactNode; variant?: "primary" | "outline" | "ghost" | "white"; href?: string; onClick?: () => void; className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "px-3.5 py-2 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3.5 text-[15px] rounded-xl",
  }[size];
  const base = "group relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer will-change-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2";
  const styles = {
    primary: "text-white bg-navy-gradient shadow-elegant hover:shadow-premium hover:-translate-y-0.5",
    outline: "text-navy bg-white border border-border shadow-xs hover:border-navy hover:-translate-y-0.5 hover:shadow-sm",
    ghost: "text-navy hover:text-accent",
    white: "text-navy bg-white shadow-elegant hover:shadow-premium hover:-translate-y-0.5",
  }[variant];
  const cls = `${base} ${sizes} ${styles} ${className}`;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button onClick={onClick} className={cls}>{children}</button>;
}

// ─── Sections ────────────────────────────────────────────────────────────
function Nav({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("top");
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const ids = ["modules", "forwho", "pricing", "faq"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);
  const links = [
    { href: "#modules", id: "modules", label: tr(T.nav.features, lang) },
    { href: "#forwho", id: "forwho", label: tr(T.nav.forWho, lang) },
    { href: "#pricing", id: "pricing", label: tr(T.nav.pricing, lang) },
    { href: "#faq", id: "faq", label: tr(T.nav.faq, lang) },
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-border/60 shadow-xs" : "bg-transparent"}`}>
      <div className={`max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${scrolled ? "h-14" : "h-20"}`}>
        <a href="#top" className="flex items-center"><Logo /></a>
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-border/60 bg-white/60 backdrop-blur px-1.5 py-1 shadow-xs">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`relative px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-colors ${active === l.id ? "text-navy" : "text-muted hover:text-navy"}`}
            >
              {active === l.id && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-surface" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="relative">{l.label}</span>
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2.5">
          <LangToggle lang={lang} setLang={setLang} />
          <a href="/login" className="text-sm font-semibold text-navy hover:text-accent transition-colors px-3">{tr(T.nav.signin, lang)}</a>
          <Btn href="/register" size="sm">{tr(T.nav.trial, lang)} <ArrowRight className="w-3.5 h-3.5" /></Btn>
        </div>
        <button aria-label="Menu" className="lg:hidden p-2 rounded-lg hover:bg-surface transition-colors" onClick={() => setOpen(true)}><Menu className="w-6 h-6 text-navy" /></button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="fixed inset-0 bg-white z-50 lg:hidden">
            <div className="flex items-center justify-between px-5 h-16 border-b border-border">
              <Logo />
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-surface"><Close className="w-6 h-6" /></button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              {links.map((l, i) => (
                <motion.a key={l.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.05 }} href={l.href} onClick={() => setOpen(false)} className="text-2xl font-display font-semibold text-navy">{l.label}</motion.a>
              ))}
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                <LangToggle lang={lang} setLang={setLang} />
                <Btn href="/register" size="lg">{tr(T.nav.trial, lang)} <ArrowRight className="w-4 h-4" /></Btn>
                <a href="/login" className="text-center text-sm font-semibold text-navy py-2">{tr(T.nav.signin, lang)}</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function DashboardMockup() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(4);
  const ry = useMotionValue(-8);
  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    animate(ry, -8 + px * 10, { duration: 0.4, ease: "easeOut" });
    animate(rx, 4 - py * 8, { duration: 0.4, ease: "easeOut" });
  };
  const onLeave = () => {
    animate(ry, -8, { duration: 0.6 });
    animate(rx, 4, { duration: 0.6 });
  };
  const rotate = useTransform([rx, ry], ([x, y]) => `perspective(1400px) rotateX(${x}deg) rotateY(${y}deg)`);
  const [count, setCount] = useState(18240);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + Math.round(Math.random() * 120)), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave} className="relative">
      {/* glow */}
      <div className="absolute -inset-8 rounded-[32px] bg-gradient-to-tr from-accent/25 via-navy/10 to-transparent blur-3xl -z-10" />
      <motion.div
        style={{ transform: rotate }}
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-2xl bg-white shadow-hero border border-border/70 overflow-hidden"
      >
        {/* chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-surface/80 border-b border-border">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          <div className="ml-3 px-3 py-1 rounded-md bg-white border border-border text-[10px] font-mono text-muted flex-1 max-w-[240px] truncate">vyxen.app/dashboard</div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" /> Live
          </div>
        </div>

        <div className="p-5 bg-white">
          {/* headline metric */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-2">Recovered this month</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display font-bold text-3xl text-navy tabular-nums">{count.toLocaleString("fr-FR")}€</span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-success"><TrendingUp className="w-3 h-3" /> +12.4%</span>
              </div>
            </div>
            <svg viewBox="0 0 120 40" className="w-32 h-10">
              <defs>
                <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 32 L15 28 L30 30 L45 22 L60 24 L75 14 L90 18 L105 8 L120 12 L120 40 L0 40 Z" fill="url(#spark)" />
              <path d="M0 32 L15 28 L30 30 L45 22 L60 24 L75 14 L90 18 L105 8 L120 12" stroke="#2563EB" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { l: "Invoices", v: "24", d: "3 overdue", tone: "warning" },
              { l: "Proposals", v: "12", d: "8 sent", tone: "success" },
              { l: "DD reports", v: "6", d: "2 pending", tone: "accent" },
            ].map((k, i) => (
              <div key={i} className="rounded-xl border border-border p-2.5">
                <div className="text-[9px] uppercase tracking-wider text-muted-2 font-medium">{k.l}</div>
                <div className="font-mono font-bold text-lg text-navy mt-0.5">{k.v}</div>
                <div className={`text-[10px] mt-0.5 ${k.tone === "warning" ? "text-warning" : k.tone === "success" ? "text-success" : "text-accent"}`}>{k.d}</div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            {[
              { icon: Zap, bg: "bg-accent-soft", color: "text-accent", t: "Smart Chase · Invoice #2287", s: "Level 2 reminder sent", tag: "2 400€", tagCls: "text-success bg-success-soft" },
              { icon: FileText, bg: "bg-success-soft", color: "text-success", t: "Deal Draft · Studio Nova", s: "Generated in 1m 42s", tag: "Sent", tagCls: "text-success bg-success-soft" },
              { icon: Radar, bg: "bg-warning-soft", color: "text-warning", t: "Pitch Radar · FinTech Corp", s: "Score 8.2/10 · 3 key questions", tag: "8.2", tagCls: "text-warning bg-warning-soft" },
            ].map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border/80 hover:border-accent/40 hover:bg-surface/40 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${r.bg} flex items-center justify-center shrink-0`}>
                  <r.icon className={`w-4 h-4 ${r.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-navy truncate">{r.t}</div>
                  <div className="text-[10px] text-muted truncate">{r.s}</div>
                </div>
                <div className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${r.tagCls}`}>{r.tag}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* floating notification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="hidden md:flex absolute -bottom-6 -left-8 items-center gap-3 rounded-2xl bg-white shadow-premium border border-border/70 px-4 py-3 max-w-[260px]"
      >
        <div className="w-9 h-9 rounded-xl bg-success-soft flex items-center justify-center shrink-0">
          <Check className="w-5 h-5 text-success" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-navy">Payment received</div>
          <div className="text-[10px] text-muted">Invoice #2287 · 2 400€ · just now</div>
        </div>
      </motion.div>

      {/* floating badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="hidden md:flex absolute -top-4 -right-4 items-center gap-2 rounded-full bg-navy text-white shadow-premium px-3.5 py-2"
      >
        <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
        <span className="text-[11px] font-mono font-semibold">4 agents working</span>
      </motion.div>
    </div>
  );
}

function Hero({ lang }: { lang: Lang }) {
  return (
    <section id="top" className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow -z-10" />
      <div className="absolute inset-0 bg-grid opacity-40 -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 backdrop-blur px-3 py-1.5 text-[11px] font-semibold text-navy shadow-xs mb-7"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <Sparkles className="w-3 h-3 text-accent" /> {tr(T.hero.badge, lang)}
          </motion.div>
          <h1 className="font-display text-[40px] leading-[1.02] md:text-[64px] md:leading-[1.02] font-bold text-navy">
            {tr(T.hero.h1, lang)}
          </h1>
          <p className="mt-7 text-lg md:text-xl text-muted max-w-[560px] leading-relaxed">
            {tr(T.hero.sub, lang)}
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Btn size="lg" href="/register">{tr(T.hero.cta1, lang)} <ArrowRight className="w-4 h-4" /></Btn>
            <Btn size="lg" variant="outline" href="#how"><span>{tr(T.hero.cta2, lang)}</span><ArrowDown className="w-4 h-4" /></Btn>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {["MC", "JD", "SL", "AR", "TB"].map((i, k) => (
                <div key={k} className="w-9 h-9 rounded-full bg-navy-gradient border-2 border-white flex items-center justify-center text-white text-[10px] font-mono font-bold shadow-xs">{i}</div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[0,1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />)}
                <span className="ml-1.5 text-xs font-semibold text-navy">4.9</span>
              </div>
              <p className="text-xs text-muted max-w-xs mt-0.5">{tr(T.hero.proof, lang)}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

function Stats({ lang }: { lang: Lang }) {
  return (
    <section className="bg-surface py-16 md:py-20 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x lg:divide-border">
          {T.stats.s.map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="text-center lg:px-8">
                <div className="font-display text-4xl md:text-5xl font-bold text-navy">
                  <Counter to={s.v} suffix={s.suffix} />
                </div>
                <p className="mt-3 text-sm text-muted leading-relaxed max-w-[220px] mx-auto">{tr(s, lang)}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <p className="text-center text-xs text-muted mt-10 italic">{tr(T.stats.disclaimer, lang)}</p>
      </div>
    </section>
  );
}

function Problem({ lang }: { lang: Lang }) {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-navy">{tr(T.problem.h, lang)}</h2>
            <p className="mt-5 text-lg text-muted leading-relaxed">{tr(T.problem.sub, lang)}</p>
          </div>
        </FadeIn>

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          <FadeIn>
            <div className="rounded-xl p-6 md:p-8 h-full" style={{ background: "#FFF5F5", borderLeft: "3px solid #DC2626" }}>
              <h3 className="font-display text-lg font-bold text-danger mb-5">{tr(T.problem.withoutTitle, lang)}</h3>
              <div className="space-y-5">
                {T.problem.without.map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <X className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-navy text-sm">{tr(r.bold, lang)}</p>
                      <p className="italic text-muted text-sm mt-1">{tr(r.i, lang)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="rounded-xl p-6 md:p-8 h-full" style={{ background: "#F0FDF4", borderLeft: "3px solid #16A34A" }}>
              <h3 className="font-display text-lg font-bold text-success mb-5">{tr(T.problem.withTitle, lang)}</h3>
              <div className="space-y-5">
                {T.problem.withV.map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <p className="font-semibold text-navy text-sm">{tr(r, lang)}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn>
          <p className="text-center font-display font-bold text-navy text-xl md:text-2xl mt-12 max-w-2xl mx-auto">{tr(T.problem.transition, lang)}</p>
        </FadeIn>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {T.problem.cards.map((c, i) => {
            const color = c.tone === "danger" ? "#DC2626" : "#D97706";
            const bg = c.tone === "danger" ? "#FEF2F2" : "#FFFBEB";
            return (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="rounded-xl bg-white border border-border p-6 md:p-8 h-full transition-all hover:-translate-y-1 hover:shadow-lg" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
                  <h3 className="font-display text-xl font-bold text-navy leading-snug">{tr(c.title, lang)}</h3>
                  <p className="mt-4 text-muted leading-relaxed">{tr(c.text, lang)}</p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: bg, color }}>
                    <AlertTriangle className="w-3.5 h-3.5" /> {tr(c.impact, lang)}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ForWho({ lang }: { lang: Lang }) {
  const blocks = [
    { ...T.forWho.sme, icon: Building2 },
    { ...T.forWho.inv, icon: Users },
  ];
  return (
    <section id="forwho" className="bg-surface py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-navy">{tr(T.forWho.h, lang)}</h2>
            <p className="mt-5 text-lg text-muted">{tr(T.forWho.sub, lang)}</p>
          </div>
        </FadeIn>
        <div className="mt-14 grid lg:grid-cols-2 gap-6">
          {blocks.map((b, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="group rounded-2xl bg-white border-2 border-border p-8 h-full cursor-pointer transition-all hover:-translate-y-1 hover:border-accent hover:shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
                    <b.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">{tr(b.badge, lang)}</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-navy leading-tight">{tr(b.title, lang)}</h3>
                <p className="mt-5 text-muted leading-relaxed">{tr(b.body, lang)}</p>
                <div className="mt-6 inline-block rounded-lg bg-accent-soft px-3 py-2 text-sm font-semibold text-accent">→ {tr(b.tag, lang)}</div>
                <ul className="mt-6 space-y-3">
                  {b.bullets.map((bu, k) => (
                    <li key={k} className="flex gap-3 text-sm">
                      <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <span className="text-foreground">{tr(bu, lang)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-border">
                  <span className="inline-flex items-center gap-2 font-semibold text-accent group-hover:gap-3 transition-all">
                    {tr(b.cta, lang)} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn>
          <p className="text-center text-muted italic mt-12 max-w-2xl mx-auto">{tr(T.forWho.close, lang)}</p>
        </FadeIn>
      </div>
    </section>
  );
}

function ModuleMockup({ i }: { i: number }) {
  if (i === 0) return (
    <div className="rounded-xl bg-white border border-border shadow-lg overflow-hidden">
      <div className="p-4 border-b border-border bg-surface font-semibold text-sm text-navy">Smart Chase · Factures en cours</div>
      <div className="divide-y divide-border">
        {[
          { n: "#2287", c: "Studio Nova", a: "2 400€", d: "21j", s: "Niv. 2", color: "#DC2626", bg: "#FEF2F2" },
          { n: "#2291", c: "Agence Meridian", a: "4 800€", d: "12j", s: "Niv. 1", color: "#D97706", bg: "#FFFBEB" },
          { n: "#2295", c: "Atelier Klein", a: "1 200€", d: "3j", s: "Payée", color: "#16A34A", bg: "#ECFDF3" },
          { n: "#2298", c: "FinCorp SAS", a: "8 600€", d: "34j", s: "Niv. 3", color: "#DC2626", bg: "#FEF2F2" },
        ].map((r, k) => (
          <div key={k} className="flex items-center px-4 py-3 text-sm">
            <div className="font-mono text-muted w-20">{r.n}</div>
            <div className="flex-1 font-medium text-navy">{r.c}</div>
            <div className="font-mono font-semibold text-navy w-24 text-right">{r.a}</div>
            <div className="font-mono text-muted w-16 text-right">{r.d}</div>
            <div className="ml-4 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: r.bg, color: r.color }}>{r.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
  if (i === 1) return (
    <div className="rounded-xl bg-white border border-border shadow-lg overflow-hidden">
      <div className="grid grid-cols-2">
        <div className="p-5 border-r border-border bg-surface">
          <div className="text-xs font-semibold text-muted mb-4 uppercase tracking-wider">Formulaire</div>
          {["Client", "Secteur", "Besoin", "Budget", "Délai"].map((f, k) => (
            <div key={k} className="mb-3">
              <label className="text-xs text-muted">{f}</label>
              <div className="mt-1 h-8 rounded bg-white border border-border" />
            </div>
          ))}
        </div>
        <div className="p-5">
          <div className="text-xs font-semibold text-muted mb-3 uppercase tracking-wider">Aperçu devis</div>
          <div className="space-y-2">
            <div className="h-3 rounded bg-navy w-3/4" />
            <div className="h-2 rounded bg-border w-full" />
            <div className="h-2 rounded bg-border w-5/6" />
            <div className="h-2 rounded bg-border w-full" />
            <div className="h-2 rounded bg-border w-2/3" />
            <div className="mt-4 h-8 rounded bg-accent-soft" />
            <div className="h-2 rounded bg-border w-full" />
            <div className="h-2 rounded bg-border w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
  if (i === 2) return (
    <div className="rounded-xl bg-white border border-border shadow-lg p-6">
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" stroke="#E5E9F0" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="42" stroke="#2563EB" strokeWidth="8" fill="none" strokeDasharray={`${78 * 2.64} 999`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display font-bold text-2xl text-navy">7.8</div>
            <div className="text-[10px] text-muted">/ 10</div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {[["Équipe", 85], ["Marché", 72], ["Traction", 68], ["Modèle", 81]].map(([l, v], k) => (
            <div key={k}>
              <div className="flex justify-between text-xs mb-1"><span className="text-muted">{l}</span><span className="font-mono font-semibold text-navy">{v}%</span></div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full bg-accent" style={{ width: `${v}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-success-soft p-3">
          <div className="font-semibold text-success mb-1">✓ Points forts</div>
          <div className="text-muted">Équipe technique solide · CA x3 en 12 mois</div>
        </div>
        <div className="rounded-lg bg-danger-soft p-3">
          <div className="font-semibold text-danger mb-1">! Red flags</div>
          <div className="text-muted">Concentration client · Marge fragile</div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="rounded-xl bg-white border border-border shadow-lg overflow-hidden">
      <div className="p-4 border-b border-border bg-surface">
        <div className="flex gap-2">
          <div className="flex-1 h-9 rounded-lg bg-white border border-border flex items-center px-3 text-sm text-muted font-mono">acme-corp.com</div>
          <div className="h-9 px-4 rounded-lg bg-navy text-white text-sm font-semibold flex items-center">Analyser</div>
        </div>
      </div>
      <div className="grid grid-cols-3">
        <div className="col-span-1 border-r border-border bg-surface p-3 space-y-1 text-xs font-medium">
          {["Résumé", "Fondateur", "Entreprise", "Risques", "Recommandation"].map((s, k) => (
            <div key={k} className={`px-3 py-2 rounded ${k === 0 ? "bg-navy text-white" : "text-muted"}`}>{s}</div>
          ))}
        </div>
        <div className="col-span-2 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-warning-soft text-warning">Risque · Moyen</span>
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-success-soft text-success">Recommandé</span>
          </div>
          <div className="h-2 rounded bg-border w-full" />
          <div className="h-2 rounded bg-border w-11/12" />
          <div className="h-2 rounded bg-border w-4/5" />
          <div className="h-2 rounded bg-border w-full" />
          <div className="h-2 rounded bg-border w-3/4" />
        </div>
      </div>
    </div>
  );
}

function Modules({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0);
  const tab = T.modules.tabs[active];
  return (
    <section id="modules" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-navy">{tr(T.modules.h, lang)}</h2>
            <p className="mt-5 text-lg text-muted">{tr(T.modules.sub, lang)}</p>
          </div>
        </FadeIn>

        <div className="mt-12 flex flex-wrap justify-center gap-2 md:gap-3">
          {T.modules.tabs.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setActive(i)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${active === i ? "bg-navy text-white shadow-md" : "bg-white text-muted border border-border hover:border-accent hover:text-navy"}`}
            >
              <t.icon className="w-4 h-4" />
              {t.name}
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${t.audience === "sme" ? "bg-success-soft text-success" : "bg-accent-soft text-accent"}`}>
                {t.audience === "sme" ? tr(T.modules.forSME, lang) : tr(T.modules.forInv, lang)}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-surface p-6 md:p-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-10 items-center"
            >
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-navy leading-tight">{tr(tab.title, lang)}</h3>
                <p className="mt-5 text-muted leading-relaxed">{tr(tab.story, lang)}</p>
                <ul className="mt-6 space-y-3">
                  {tab.points.map((p, k) => (
                    <li key={k} className="flex gap-3 text-sm">
                      <div className="w-6 h-6 shrink-0 rounded-full bg-accent-soft text-accent font-mono font-bold text-xs flex items-center justify-center">{k + 1}</div>
                      <span className="text-foreground pt-0.5">{tr(p, lang)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-lg bg-success-soft border-l-4 border-success p-4 text-sm italic text-navy">
                  {tr(tab.quote, lang)}
                </div>
              </div>
              <div>
                <ModuleMockup i={active} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ROI({ lang }: { lang: Lang }) {
  const [inv, setInv] = useState<number>(5);
  const [amt, setAmt] = useState<number>(1500);
  const [prop, setProp] = useState<number>(8);
  const results = useMemo(() => {
    const recoverable = inv * amt * 0.75;
    const hoursLost = prop * 1.5;
    const hoursSaved = prop * (1.5 - 0.17);
    const additional = prop * amt * 0.15;
    return { recoverable, hoursLost, hoursSaved, additional, potential: additional };
  }, [inv, amt, prop]);
  const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");
  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-navy">{tr(T.roi.h, lang)}</h2>
            <p className="mt-5 text-lg text-muted">{tr(T.roi.sub, lang)}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="mt-12 rounded-2xl bg-white border border-border shadow-xl p-6 md:p-10">
            <div className="space-y-5">
              {[
                { l: T.roi.q1, v: inv, s: setInv, ph: lang === "fr" ? "Ex: 5" : "e.g. 5" },
                { l: T.roi.q2, v: amt, s: setAmt, ph: lang === "fr" ? "Ex: 1500" : "e.g. 1500" },
                { l: T.roi.q3, v: prop, s: setProp, ph: lang === "fr" ? "Ex: 8" : "e.g. 8" },
              ].map((f, i) => (
                <div key={i}>
                  <label className="block text-sm font-semibold text-navy mb-2">{tr(f.l, lang)}</label>
                  <input
                    type="number"
                    value={f.v || ""}
                    onChange={(e) => f.s(Number(e.target.value) || 0)}
                    placeholder={f.ph}
                    className="w-full rounded-lg border-2 border-border px-4 py-3 text-lg font-mono focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>

            <motion.div
              key={`${inv}-${amt}-${prop}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="mt-8 rounded-xl bg-accent-soft border-2 border-navy p-6"
            >
              <div className="mb-6">
                <h4 className="font-display text-lg font-bold text-navy mb-3">{tr(T.roi.losingTitle, lang)}</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span>💸 <span className="font-mono font-bold text-danger">{fmt(results.recoverable)}€</span> {tr(T.roi.losing1, lang)}</span></li>
                  <li className="flex justify-between"><span>⏰ <span className="font-mono font-bold text-danger">{fmt(results.hoursLost)}h</span> {tr(T.roi.losing2, lang)}</span></li>
                  <li className="flex justify-between"><span>📉 <span className="font-mono font-bold text-danger">{fmt(results.potential)}€</span> {tr(T.roi.losing3, lang)}</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-navy mb-3">{tr(T.roi.recoverTitle, lang)}</h4>
                <ul className="space-y-2 text-sm">
                  <li>✅ <span className="font-mono font-bold text-success">{fmt(results.recoverable)}€</span> {tr(T.roi.rec1, lang)}</li>
                  <li>✅ <span className="font-mono font-bold text-success">{fmt(results.hoursSaved)}h</span> {tr(T.roi.rec2, lang)}</li>
                  <li>✅ <span className="font-mono font-bold text-success">{fmt(results.additional)}€</span> {tr(T.roi.rec3, lang)}</li>
                </ul>
              </div>
            </motion.div>

            <p className="text-xs text-muted italic mt-6 text-center">{tr(T.roi.disclaimer, lang)}</p>
            <div className="mt-6 text-center">
              <Btn href="#pricing">{tr(T.roi.cta, lang)}</Btn>
              <p className="text-xs text-muted mt-3">{tr(T.roi.cancel, lang)}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function HowItWorks({ lang }: { lang: Lang }) {
  return (
    <section id="how" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-navy">{tr(T.how.h, lang)}</h2>
            <p className="mt-5 text-lg text-muted italic">{tr(T.how.sub, lang)}</p>
          </div>
        </FadeIn>
        <div className="mt-14 grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] border-t-2 border-dashed border-border" />
          {T.how.steps.map((s, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="relative text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-navy text-white font-display font-bold text-2xl flex items-center justify-center shadow-lg relative z-10">{s.n}</div>
                <h3 className="mt-6 font-display text-xl font-bold text-navy">{tr(s.title, lang)}</h3>
                <p className="mt-3 text-muted leading-relaxed text-sm">{tr(s.text, lang)}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent-soft text-accent px-3 py-1 text-xs font-mono font-semibold">
                  <Clock className="w-3 h-3" /> {tr(s.dur, lang)}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn>
          <p className="text-center font-display font-bold text-navy text-xl md:text-2xl mt-16 max-w-2xl mx-auto">{tr(T.how.close, lang)}</p>
          <div className="text-center mt-8"><Btn href="#pricing">{tr(T.how.cta, lang)}</Btn></div>
        </FadeIn>
      </div>
    </section>
  );
}

function Testimonials({ lang }: { lang: Lang }) {
  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-navy">{tr(T.test.h, lang)}</h2>
            <p className="mt-5 text-lg text-muted">{tr(T.test.sub, lang)}</p>
          </div>
        </FadeIn>
        <div
          className="mt-14 relative overflow-hidden group"
          style={{
            maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          }}
        >
          <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]">
            {[...T.test.cards, ...T.test.cards].map((c, i) => (
              <article
                key={i}
                className="w-[320px] sm:w-[360px] shrink-0 rounded-2xl bg-white border border-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-navy text-white font-mono font-bold text-sm flex items-center justify-center">{c.i}</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-navy text-sm truncate">{c.n}</div>
                    <div className="text-xs text-muted truncate">{tr(c.r, lang)}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-0.5 text-warning shrink-0">
                    {[0,1,2,3,4].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-current" />)}
                  </div>
                </div>
                <div className="mt-4 font-semibold text-sm text-navy">{tr(c.t, lang)}</div>
                <p className="mt-3 text-sm text-muted italic leading-relaxed line-clamp-4">"{tr(c.q, lang)}"</p>
                <div className="mt-5 pt-5 border-t border-border">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft text-success px-3 py-1.5 text-xs font-semibold">
                    <Star className="w-3 h-3" /> {tr(c.b, lang)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 flex justify-center"
        >
          <div className="relative inline-flex items-center gap-5 rounded-2xl bg-white border border-border shadow-lg px-6 py-5 max-w-2xl">
            <div className="shrink-0 w-16 h-16 rounded-full bg-[#00AF87] flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-9 h-9 text-white" fill="currentColor" aria-hidden>
                <circle cx="8" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="16" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="8" cy="12" r="1.2" />
                <circle cx="16" cy="12" r="1.2" />
                <path d="M4 8c2.5-2 5-2 8-2s5.5 0 8 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00AF87]">Tripadvisor</span>
                <span className="text-[11px] font-semibold text-muted">
                  {lang === "fr" ? "Certificat d'Excellence" : "Certificate of Excellence"}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                {[0,1,2,3,4].map((s) => (
                  <span key={s} className="w-4 h-4 rounded-full border-[3px] border-[#00AF87]" />
                ))}
                <span className="ml-2 font-semibold text-navy text-sm">4.9 / 5</span>
                <span className="text-xs text-muted">
                  · {lang === "fr" ? "1 248 avis vérifiés" : "1,248 verified reviews"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {lang === "fr"
                  ? "Vyxen figure parmi les 10% de solutions les mieux notées par ses utilisateurs en 2026."
                  : "Vyxen ranks in the top 10% of solutions rated by users in 2026."}
              </p>
            </div>
          </div>
        </motion.div>

        <FadeIn>
          <p className="text-center text-sm text-muted italic mt-12 max-w-3xl mx-auto">{tr(T.test.close, lang)}</p>
        </FadeIn>
      </div>
    </section>
  );
}


function Pricing({ lang }: { lang: Lang }) {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-navy">{tr(T.pricing.h, lang)}</h2>
            <p className="mt-5 text-lg text-muted">{tr(T.pricing.sub, lang)}</p>
            <div className="mt-8 inline-flex items-center rounded-full border border-border bg-white p-1 text-sm font-semibold">
              <button onClick={() => setYearly(false)} className={`px-4 py-2 rounded-full transition-all cursor-pointer ${!yearly ? "bg-navy text-white" : "text-muted"}`}>{tr(T.pricing.monthly, lang)}</button>
              <button onClick={() => setYearly(true)} className={`px-4 py-2 rounded-full transition-all cursor-pointer ${yearly ? "bg-navy text-white" : "text-muted"}`}>{tr(T.pricing.yearly, lang)}</button>
            </div>
          </div>
        </FadeIn>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {T.pricing.plans.map((p, i) => (
            <FadeIn key={p.name} delay={i * 0.1}>
              <div className={`relative rounded-2xl p-8 h-full transition-all hover:-translate-y-1 ${p.popular ? "bg-navy text-white shadow-2xl ring-2 ring-accent" : "bg-white border-2 border-border hover:border-accent hover:shadow-lg"}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">{tr(T.pricing.popularBadge, lang)}</div>
                )}
                <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                <p className={`mt-2 text-sm ${p.popular ? "text-white/70" : "text-muted"}`}>{tr(p.tagline, lang)}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display font-bold text-5xl font-mono">{yearly ? p.price.y : p.price.m}€</span>
                  <span className={`text-sm ${p.popular ? "text-white/60" : "text-muted"}`}>{tr(T.pricing.perMonth, lang)}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f, k) => (
                    <li key={k} className="flex gap-2.5 text-sm">
                      <Check className={`w-5 h-5 shrink-0 ${p.popular ? "text-accent" : "text-success"}`} />
                      <span>{tr(f, lang)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {p.popular ? (
                    <a href="/register" className="block text-center rounded-lg bg-white text-navy font-semibold py-3 hover:bg-white/90 transition-all hover:scale-[1.02] cursor-pointer">{tr(T.pricing.cta, lang)}</a>
                  ) : (
                    <Btn className="w-full" href="/register">{tr(T.pricing.cta, lang)}</Btn>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-surface py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-navy text-center">{tr(T.faq.h, lang)}</h2>
        </FadeIn>
        <div className="mt-12 space-y-3">
          {T.faq.items.map((it, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="rounded-xl bg-white border border-border overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between text-left px-6 py-5 cursor-pointer"
                >
                  <span className="font-semibold text-navy pr-4">{tr(it.q, lang)}</span>
                  <ChevronDown className={`w-5 h-5 text-muted transition-transform shrink-0 ${open === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-muted leading-relaxed">{tr(it.a, lang)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ lang }: { lang: Lang }) {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-navy-gradient">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(37,99,235,0.45), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08), transparent 50%)" }} />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur px-3 py-1.5 text-[11px] font-semibold text-white/80 mb-6">
            <Sparkles className="w-3 h-3" /> {lang === "fr" ? "14 jours gratuits · Sans carte bancaire" : "14 days free · No credit card"}
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-[1.05]">{tr(T.finalCta.h, lang)}</h2>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">{tr(T.finalCta.sub, lang)}</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Btn size="lg" variant="white" href="/register">{tr(T.finalCta.cta, lang)} <ArrowRight className="w-4 h-4" /></Btn>
            <a href="#how" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white/90 hover:text-white transition-colors">
              {lang === "fr" ? "Voir une démo" : "Watch a demo"} <ArrowDown className="w-4 h-4" />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Footer({ lang }: { lang: Lang }) {
  const cols = [
    { title: lang === "fr" ? "Produit" : "Product", links: [
      { l: "Smart Chase", h: "#modules" }, { l: "Deal Draft", h: "#modules" },
      { l: "Pitch Radar", h: "#modules" }, { l: "Deep Due", h: "#modules" },
      { l: lang === "fr" ? "Tarifs" : "Pricing", h: "#pricing" },
    ]},
    { title: lang === "fr" ? "Ressources" : "Resources", links: [
      { l: "FAQ", h: "#faq" }, { l: lang === "fr" ? "Témoignages" : "Testimonials", h: "#test" },
      { l: lang === "fr" ? "Comment ça marche" : "How it works", h: "#how" },
      { l: lang === "fr" ? "Calculateur ROI" : "ROI calculator", h: "#roi" },
    ]},
    { title: lang === "fr" ? "Entreprise" : "Company", links: [
      { l: "About", h: "#" }, { l: "Blog", h: "#" }, { l: "Contact", h: "#" }, { l: "Careers", h: "#" },
    ]},
    { title: lang === "fr" ? "Légal" : "Legal", links: [
      { l: lang === "fr" ? "Confidentialité" : "Privacy", h: "/privacy" },
      { l: lang === "fr" ? "Conditions" : "Terms", h: "/terms" },
      { l: "Cookies", h: "/privacy" }, { l: "RGPD / GDPR", h: "/privacy" },
    ]},
  ];
  return (
    <footer className="bg-white text-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid md:grid-cols-6 gap-10 pb-12 border-b border-border">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-muted max-w-xs leading-relaxed">{tr(T.footer.tagline, lang)}</p>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="w-4 h-4" /> {lang === "fr" ? "Conforme RGPD · Chiffré AES-256" : "GDPR compliant · AES-256 encrypted"}
            </div>
            <div className="mt-4 flex items-center gap-3">
              {["𝕏", "in", "◎"].map((s, i) => (
                <a key={i} href="#" aria-label="Social" className="w-9 h-9 rounded-lg border border-border hover:bg-surface hover:border-navy/20 flex items-center justify-center text-sm text-muted hover:text-navy transition-colors">{s}</a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="font-semibold text-navy text-sm mb-4">{c.title}</div>
              <ul className="space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l.l}><a href={l.h} className="text-muted hover:text-navy transition-colors">{l.l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div>© 2026 Vyxen · {tr(T.footer.rights, lang)}</div>
          <div className="font-mono">Made with Google Gemini · XPRIZE AI 2026</div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────
export default function Landing() {
  const [lang, setLang] = useLang();
  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden">
      <Nav lang={lang} setLang={setLang} />
      <motion.div key={lang} initial={{ opacity: 0.7 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
        <Hero lang={lang} />
        <Stats lang={lang} />
        <Problem lang={lang} />
        <ForWho lang={lang} />
        <Modules lang={lang} />
        <ROI lang={lang} />
        <HowItWorks lang={lang} />
        <Testimonials lang={lang} />
        <Pricing lang={lang} />
        <FAQ lang={lang} />
        <FinalCTA lang={lang} />
        <Footer lang={lang} />
      </motion.div>
    </div>
  );
}
