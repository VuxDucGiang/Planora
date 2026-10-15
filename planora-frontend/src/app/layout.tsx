import type { Metadata } from "next";
import { Barlow, Syne, EB_Garamond, Abhaya_Libre, Great_Vibes } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PlanProvider } from "@/contexts/PlanContext";

const barlow = Barlow({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const abhayaLibre = Abhaya_Libre({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-hero",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Planora - Event & Wedding Planning Platform",
  description: "Sophisticated wedding and event planner dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="vi" 
      className={`h-full antialiased ${barlow.variable} ${syne.variable} ${ebGaramond.variable} ${abhayaLibre.variable} ${greatVibes.variable}`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-body-text">
        <LanguageProvider>
          <AuthProvider>
            <PlanProvider>
              {children}
            </PlanProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
