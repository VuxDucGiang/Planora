import type { Metadata } from "next";
import { Barlow, EB_Garamond, Great_Vibes } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PlanProvider } from "@/contexts/PlanContext";
import { NavigationProvider } from "@/contexts/NavigationContext";

const barlow = Barlow({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
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
      className={`h-full antialiased ${barlow.variable} ${ebGaramond.variable} ${greatVibes.variable}`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-body-text">
        <LanguageProvider>
          <AuthProvider>
            <PlanProvider>
              <NavigationProvider>
                {children}
              </NavigationProvider>
            </PlanProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
