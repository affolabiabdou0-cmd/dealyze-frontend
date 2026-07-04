"use client";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div style={{ background: "#06060f", minHeight: "100vh", color: "#cbd5e1", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ background: "linear-gradient(135deg, #c4b5fd, #67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontSize: 22, fontWeight: 800, letterSpacing: "5px", display: "inline-flex", alignItems: "center" }}>
            VY<span style={{ fontSize: "1.65em", fontWeight: 900, lineHeight: 0.85, background: "linear-gradient(180deg, #e0f2fe 0%, #67e8f9 50%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: 0 }}>X</span>EN
          </span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Retour</Link>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 32px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f1f5f9", marginBottom: 8, letterSpacing: "-0.5px" }}>Politique de confidentialité</h1>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 48 }}>Dernière mise à jour : 4 juillet 2026</p>

        {[
          {
            title: "1. Collecte des données",
            content: `VYXEN collecte les informations suivantes :\n• Données de compte : nom, adresse email, mot de passe (chiffré)\n• Données d'utilisation : prompts soumis aux agents IA, résultats générés, historique d'activité\n• Données de paiement : traitées par Paddle (nous ne stockons pas vos coordonnées bancaires)\n• Données techniques : adresse IP, type de navigateur, pages visitées`,
          },
          {
            title: "2. Utilisation des données",
            content: `Nous utilisons vos données pour :\n• Fournir et améliorer nos services IA\n• Gérer votre compte et votre abonnement\n• Vous envoyer des communications liées au service\n• Analyser l'utilisation pour améliorer notre plateforme\n• Respecter nos obligations légales\n\nNous n'utilisons pas vos données pour entraîner nos modèles IA sans votre consentement explicite.`,
          },
          {
            title: "3. Partage des données",
            content: `VYXEN ne vend pas vos données personnelles. Nous partageons vos données uniquement avec :\n• Google (Firebase Authentication, Gemini 2.5 Flash) — pour l'authentification et les agents IA\n• Supabase — pour le stockage sécurisé des données\n• Paddle — pour le traitement des paiements\n• Autorités légales si requis par la loi`,
          },
          {
            title: "4. Sécurité des données",
            content: `Vos données sont protégées par :\n• Chiffrement SSL/TLS pour toutes les transmissions\n• Authentification Firebase avec tokens JWT sécurisés\n• Stockage chiffré sur Supabase (PostgreSQL)\n• Accès restreint aux données selon le principe du moindre privilège\n• Audits de sécurité réguliers`,
          },
          {
            title: "5. Conservation des données",
            content: `Nous conservons vos données pendant toute la durée de votre abonnement actif, plus 90 jours après la clôture de votre compte pour permettre la récupération en cas de suppression accidentelle. Après ce délai, vos données sont définitivement supprimées de nos systèmes.`,
          },
          {
            title: "6. Vos droits",
            content: `Vous disposez des droits suivants sur vos données :\n• Droit d'accès : obtenir une copie de vos données\n• Droit de rectification : corriger des données inexactes\n• Droit à l'effacement : supprimer votre compte et vos données\n• Droit à la portabilité : exporter vos données en format standard\n• Droit d'opposition : refuser certains traitements\n\nPour exercer ces droits : affolabiabdou0@gmail.com`,
          },
          {
            title: "7. Cookies",
            content: `VYXEN utilise des cookies essentiels pour le fonctionnement du service (session, authentification). Nous n'utilisons pas de cookies publicitaires ou de suivi tiers. Vous pouvez désactiver les cookies dans votre navigateur, ce qui peut limiter certaines fonctionnalités.`,
          },
          {
            title: "8. Services tiers",
            content: `Notre service utilise Google Gemini 2.5 Flash pour les agents IA. Les données soumises aux agents sont traitées selon la politique de confidentialité de Google. Nous vous recommandons de ne pas soumettre d'informations personnelles sensibles ou confidentielles dans vos requêtes.`,
          },
          {
            title: "9. Modifications",
            content: `Nous pouvons mettre à jour cette politique de confidentialité. Nous vous notifierons par email de tout changement significatif avec un préavis de 30 jours.`,
          },
          {
            title: "10. Contact",
            content: `Pour toute question relative à notre politique de confidentialité ou pour exercer vos droits :\naffolabiabdou0@gmail.com`,
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
