import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Planora - Wedding Planning Made Unforgettable",
  description: "Complete wedding planning platform. From venue to vows, manage every detail of your perfect day with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased bg-cream">
      <body className="min-h-full flex flex-col bg-cream text-body-text">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
