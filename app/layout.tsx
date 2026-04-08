import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gog & Magog — Onchain Survival",
  description: "Defend your citadel. Sign or fall.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-ash-950 text-bone-200 font-body">{children}</body>
    </html>
  );
}
