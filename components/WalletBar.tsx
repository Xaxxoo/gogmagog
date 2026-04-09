"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { label: "Game",      href: "/game" },
  { label: "Agents",    href: "/agents" },
  { label: "Market",    href: "/market" },
  { label: "Leaders",   href: "/leaderboard" },
  { label: "How to Play", href: "/how-to-play" },
];

export default function WalletBar() {
  const path = usePathname();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 gap-6"
      style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>

      <Link href="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--red)" }}>
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-700 text-white text-sm tracking-tight">Gog &amp; Magog</span>
      </Link>

      <nav className="flex items-center gap-1 flex-1">
        {NAV.map(({ label, href }) => (
          <Link key={href} href={href}
            className={clsx(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              path === href
                ? "text-white"
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            )}
            style={path === href ? { background: "rgba(255,255,255,0.08)" } : {}}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="btn btn-secondary text-xs py-1.5 px-3">
          Connect Celo
        </button>
        <button className="btn btn-secondary text-xs py-1.5 px-3" style={{ color: "var(--blue)", borderColor: "rgba(51,153,255,0.3)" }}>
          Connect Stellar
        </button>
      </div>
    </header>
  );
}
