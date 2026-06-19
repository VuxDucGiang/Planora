import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/stores/AuthContext";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-canvas text-body-text">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
