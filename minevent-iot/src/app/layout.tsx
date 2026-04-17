import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MineVent IoT | Sécurité et Ventilation Minière Intelligente",
  description:
    "Solution IoT Edge-to-Cloud pour la supervision et l'automatisation de la ventilation minière. Intéragissez avec une interface 3D temps réel, profitez d'alertes hors ligne < 2s, et d'un audit IA via Google LLM.",
  keywords: [
    "ventilation minière",
    "IoT industriel",
    "supervision temps réel",
    "Edge Computing",
    "sécurité minière",
    "automatisation",
    "alertes hors ligne",
  ],
  openGraph: {
    title: "MineVent IoT | Sécurité et Ventilation Minière Intelligente",
    description: "Solution IoT Edge-to-Cloud pour la supervision et l'automatisation de la ventilation minière. Alertes hors ligne et IA.",
    type: "website",
    locale: "fr_FR",
    siteName: "MineVent IoT",
  },
  twitter: {
    card: "summary_large_image",
    title: "MineVent IoT",
    description: "Solution IoT Edge-to-Cloud pour la supervision et l'automatisation de la ventilation minière.",
  },
  verification: {
    google: "5ff82463ca9f6c4a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-zinc-200">
        {children}
      </body>
    </html>
  );
}
