import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admisien | Dashboard de Admisión",
  description: "Dashboard de métricas de admisión para instituciones de educación superior",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
