import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VYXEN — Turn every deal into done.",
  description: "Automatisez vos négociations, relances et due diligences avec 4 agents IA spécialisés — pour PME et investisseurs.",
  keywords: ["deal", "IA", "PME", "investisseur", "négociation", "due diligence", "Gemini"],
  openGraph: {
    title: "VYXEN — Turn every deal into done.",
    description: "4 agents IA pour automatiser chaque étape de vos deals.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
