"use client";
import Link from "next/link";

export default function RefundPage() {
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
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f1f5f9", marginBottom: 8, letterSpacing: "-0.5px" }}>Politique de remboursement</h1>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 48 }}>Dernière mise à jour : 4 juillet 2026</p>

        {/* Highlight box */}
        <div style={{ background: "rgba(124,58,237,0.08)", border: "0.5px solid rgba(124,58,237,0.3)", borderRadius: 12, padding: "20px 24px", marginBottom: 40 }}>
          <p style={{ fontSize: 14, color: "#a78bfa", fontWeight: 600, marginBottom: 6 }}>Notre engagement</p>
          <p style={{ fontSize: 14, color: "#7c3aed", lineHeight: 1.75 }}>
            VYXEN offre un essai gratuit de 14 jours sans carte bancaire requise. Si vous rencontrez un problème technique majeur dans les 30 jours suivant votre premier paiement, nous vous remboursons intégralement.
          </p>
        </div>

        {[
          {
            title: "1. Essai gratuit",
            content: `Tous les plans VYXEN incluent un essai gratuit de 14 jours. Aucune carte bancaire n'est requise pour démarrer. À l'issue de la période d'essai, votre compte passe automatiquement en plan gratuit limité, sauf si vous souscrivez à un abonnement payant.`,
          },
          {
            title: "2. Remboursement sous 30 jours",
            content: `Vous pouvez demander un remboursement complet dans les 30 jours suivant votre premier paiement si :\n• Vous rencontrez un problème technique majeur empêchant l'utilisation normale du service\n• Le service ne correspond pas à la description fournie sur notre site\n• Une erreur de facturation a été commise de notre côté\n\nLes demandes de remboursement sont examinées dans un délai de 5 jours ouvrables.`,
          },
          {
            title: "3. Cas non éligibles au remboursement",
            content: `Les remboursements ne sont pas accordés dans les cas suivants :\n• Changement d'avis après plus de 30 jours\n• Utilisation partielle du service durant la période de facturation\n• Non-satisfaction des résultats des agents IA (les résultats IA varient par nature)\n• Violation des Conditions d'utilisation entraînant une suspension du compte\n• Renouvellements automatiques après la période initiale de 30 jours`,
          },
          {
            title: "4. Annulation d'abonnement",
            content: `Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord VYXEN. Après annulation :\n• Votre accès reste actif jusqu'à la fin de la période payée en cours\n• Aucun renouvellement automatique n'aura lieu\n• Vos données sont conservées 90 jours après l'expiration\n\nL'annulation ne donne pas droit à un remboursement proratisé des jours restants.`,
          },
          {
            title: "5. Processus de remboursement",
            content: `Pour demander un remboursement :\n1. Envoyez un email à affolabiabdou0@gmail.com\n2. Objet : "Demande de remboursement — [votre email de compte]"\n3. Décrivez le problème rencontré\n4. Joignez votre preuve de paiement si disponible\n\nNous répondons sous 48h ouvrables. Le remboursement est effectué via le même moyen de paiement utilisé pour la transaction originale, dans un délai de 5 à 10 jours ouvrables.`,
          },
          {
            title: "6. Remboursements partiels",
            content: `Dans certains cas exceptionnels (interruption prolongée du service de notre fait, plus de 24h consécutives), nous pouvons accorder un crédit ou un remboursement partiel calculé au prorata de la durée d'indisponibilité. Ces cas sont évalués individuellement.`,
          },
          {
            title: "7. Contact",
            content: `Pour toute question relative aux remboursements :\naffolabiabdou0@gmail.com\n\nNous nous engageons à traiter chaque demande équitablement et rapidement.`,
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
