import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vyxen — Turn every deal into done.",
  description: "AI agents that chase unpaid invoices, draft proposals, score pitch decks and run due diligence — while you focus on everything else.",
  keywords: ["deal", "IA", "PME", "investisseur", "négociation", "due diligence", "Gemini"],
  openGraph: {
    title: "Vyxen — Turn every deal into done.",
    description: "AI agents that chase unpaid invoices, draft proposals, score pitch decks and run due diligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`h-full ${cormorant.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
