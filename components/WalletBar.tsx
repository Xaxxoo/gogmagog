"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LogOut, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useWalletCtx } from "@/app/providers";

const NAV = [
  { label: "Game",        href: "/game" },
  { label: "Agents",      href: "/agents" },
  { label: "Market",      href: "/market" },
  { label: "Leaders",     href: "/leaderboard" },
  { label: "How to Play", href: "/how-to-play" },
];

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletBar() {
  const path = usePathname();
  const { address, chain, connecting, connectCelo, connectStellar, disconnect } = useWalletCtx();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 gap-6"
      style={{
        background:          "rgba(6,6,9,0.88)",
        backdropFilter:      "blur(20px) saturate(180%)",
        WebkitBackdropFilter:"blur(20px) saturate(180%)",
        borderBottom:        "1px solid rgba(255,255,255,0.06)",
        boxShadow:           "0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.5)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #FF4444, #CC1111)",
            boxShadow:  "0 0 12px rgba(255,51,51,0.5)",
          }}
        >
          <Shield className="w-3.5 h-3.5 text-white" />
        </div>
        <span
          className="font-display font-700 text-sm tracking-tight"
          style={{
            background:            "linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip:  "text",
            WebkitTextFillColor:   "transparent",
            backgroundClip:        "text",
          }}
        >
          Gog &amp; Magog
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-0.5 flex-1">
        {NAV.map(({ label, href }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                active ? "text-white" : "text-white/35 hover:text-white/75 hover:bg-white/[0.04]"
              )}
              style={active ? { background: "rgba(255,255,255,0.07)", textShadow: "0 0 8px rgba(255,255,255,0.3)" } : {}}
            >
              {label}
              {active && <span className="nav-active-dot" />}
            </Link>
          );
        })}
      </nav>

      {/* Wallet area */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {address ? (
          /* Connected state */
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background:   chain === "celo" ? "rgba(0,204,102,0.08)" : "rgba(51,153,255,0.08)",
                border:       `1px solid ${chain === "celo" ? "rgba(0,204,102,0.25)" : "rgba(51,153,255,0.25)"}`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{
                  background: chain === "celo" ? "var(--green)" : "var(--blue)",
                  boxShadow:  chain === "celo" ? "0 0 5px var(--green)" : "0 0 5px var(--blue)",
                }}
              />
              <span
                className="text-xs font-mono font-medium"
                style={{ color: chain === "celo" ? "var(--green)" : "var(--blue)" }}
              >
                {shortAddr(address)}
              </span>
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}
              >
                {chain}
              </span>
            </div>
            <button
              onClick={disconnect}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              title="Disconnect"
            >
              <LogOut className="w-3 h-3 text-white/40" />
            </button>
          </div>
        ) : (
          /* Disconnected state */
          <>
            <button
              onClick={connectCelo}
              disabled={connecting}
              className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              style={{ color: "var(--green)", borderColor: "rgba(0,204,102,0.25)", background: "rgba(0,204,102,0.06)" }}
            >
              {connecting ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--green)", boxShadow: "0 0 5px var(--green)" }} />
              )}
              Connect Celo
            </button>
            <button
              onClick={connectStellar}
              disabled={connecting}
              className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              style={{ color: "var(--blue)", borderColor: "rgba(51,153,255,0.25)", background: "rgba(51,153,255,0.06)" }}
            >
              {connecting ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--blue)", boxShadow: "0 0 5px var(--blue)" }} />
              )}
              Connect Stellar
            </button>
          </>
        )}
      </div>
    </header>
  );
}
