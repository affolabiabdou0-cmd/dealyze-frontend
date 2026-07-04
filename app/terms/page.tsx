"use client";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div style={{ background: "#06060f", minHeight: "100vh", color: "#cbd5e1", fontFamily: "system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ background: "linear-gradient(135deg, #c4b5fd, #67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontSize: 22, fontWeight: 800, letterSpacing: "5px", display: "inline-flex", alignItems: "center" }}>
            VY<span style={{ fontSize: "1.65em", fontWeight: 900, lineHeight: 0.85, background: "linear-gradient(180deg, #e0f2fe 0%, #67e8f9 50%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: 0 }}>X</span>EN
          </span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Retour</Link>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 32px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f1f5f9", marginBottom: 8, letterSpacing: "-0.5px" }}>Conditions d&apos;utilisation</h1>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 48 }}>Dernière mise à jour : 4 juillet 2026</p>

        {[
          {
            title: "1. Acceptation des conditions",
            content: `En accédant à VYXEN et en utilisant nos services, vous acceptez d'être lié par ces Conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme. VYXEN est une plateforme SaaS propulsée par l'intelligence artificielle, conçue pour automatiser les processus commerciaux des PME et des investisseurs.`,
          },
          {
            title: "2. Description du service",
            content: `VYXEN propose 4 agents IA spécialisés : Deal Draft (génération de propositions commerciales), Smart Chase (relances d'impayés), Pitch Radar (analyse de pitch decks), et Deep Due (due diligence automatisée). Ces services sont accessibles via abonnement mensuel après une période d'essai gratuit de 14 jours.`,
          },
          {
            title: "3. Comptes et inscription",
            content: `Vous devez créer un compte pour accéder aux services VYXEN. Vous êtes responsable de maintenir la confidentialité de vos identifiants de connexion et de toutes les activités effectuées sous votre compte. Vous devez nous informer immédiatement de tout accès non autorisé à votre compte.`,
          },
          {
            title: "4. Abonnements et tarification",
            content: `VYXEN propose trois plans d'abonnement mensuel :\n• Starter : $47/mois\n• Growth : $147/mois\n• Enterprise : $477/mois\n\nTous les plans incluent un essai gratuit de 14 jours sans carte bancaire requise. Les abonnements sont facturés mensuellement et se renouvellent automatiquement jusqu'à annulation.`,
          },
          {
            title: "5. Annulation",
            content: `Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. L'annulation prend effet à la fin de la période de facturation en cours. Aucun remboursement partiel n'est accordé pour les périodes non utilisées, sauf cas prévus dans notre Politique de remboursement.`,
          },
          {
            title: "6. Propriété intellectuelle",
            content: `Le contenu généré par les agents IA de VYXEN à partir de vos données vous appartient. VYXEN conserve tous les droits sur sa technologie, ses algorithmes, son interface et son infrastructure. Vous ne pouvez pas reproduire, distribuer ou créer des œuvres dérivées de notre plateforme sans autorisation écrite.`,
          },
          {
            title: "7. Utilisation acceptable",
            content: `Vous vous engagez à ne pas utiliser VYXEN à des fins illégales, à ne pas tenter de contourner nos mesures de sécurité, à ne pas surcharger délibérément notre infrastructure, et à ne pas utiliser notre service pour générer du contenu frauduleux ou trompeur.`,
          },
          {
            title: "8. Limitation de responsabilité",
            content: `VYXEN fournit ses services "tels quels". Nous ne garantissons pas que le service sera ininterrompu ou exempt d'erreurs. Notre responsabilité est limitée au montant payé pour le service au cours des 3 derniers mois précédant le litige.`,
          },
          {
            title: "9. Modifications des conditions",
            content: `Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes seront notifiées par email avec un préavis de 30 jours. L'utilisation continue du service après notification constitue votre acceptation des nouvelles conditions.`,
          },
          {
            title: "10. Contact",
            content: `Pour toute question relative à ces Conditions d'utilisation, contactez-nous à : affolabiabdou0@gmail.com`,
          },
        ].map(({ title, content }) => (
          <div key={title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 10 }}>{title}</h2>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.85, whiteSpace: "pre-line" }}>{content}</p>
          </div>
        ))}
      </div>

      <footer style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", padding: "20px 32px", textAlign: "center" }}>
        <span style={{ fontSize: 12, color: "#1e293b" }}>© 2026 VYXEN · <a href="mailto:affolabiabdou0@gmail.com" style={{ color: "#334155", textDecoration: "none" }}>affolabiabdou0@gmail.com</a></span>
      </footer>
    </div>
  );
}
