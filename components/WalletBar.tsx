"use client";
import { useWallet } from "@/lib/hooks/useWallet";
import { useStreak } from "@/lib/hooks/useStreak";
import { Flame, Zap, Shield } from "lucide-react";
import Link from "next/link";

export default function WalletBar() {
  const { address, chain, connecting, connectCelo, connectStellar, disconnect } = useWallet();
  const streak = useStreak(address, chain);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-ember-900/40 bg-ash-950/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm border border-ember-700/50 bg-ember-900/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-ember-500" />
          </div>
          <span className="font-display text-sm text-ember-400 tracking-widest hidden sm:block">GOG &amp; MAGOG</span>
        </Link>

        <nav className="flex items-center gap-1 text-xs font-mono">
          {[["Game","/game"],["Agents","/agents"],["Market","/market"],["Leaders","/leaderboard"]].map(([label, href]) => (
            <Link key={href} href={href}
              className="px-3 py-1 text-bone-400 hover:text-ember-300 hover:bg-ember-900/20 rounded transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {address && (
            <div className="flex items-center gap-2 px-3 py-1 bg-ash-800/60 rounded border border-ember-900/30">
              <Flame className="w-3 h-3 text-ember-500" />
              <span className="font-mono text-xs text-ember-400">{streak.current} day streak</span>
            </div>
          )}

          {address ? (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${chain === "celo" ? "bg-moss-400" : "bg-blue-400"} animate-pulse`} />
              <span className="font-mono text-xs text-bone-400">
                {address.slice(0,6)}…{address.slice(-4)}
              </span>
              <button onClick={disconnect}
                className="text-xs text-bone-500 hover:text-blood-400 transition-colors font-mono">
                [exit]
              </button>
            </div>
          ) : (
            <div className="flex gap-1">
              <button onClick={connectCelo} disabled={connecting}
                className="px-3 py-1.5 text-xs font-mono border border-moss-600/50 text-moss-400 hover:bg-moss-700/20 rounded transition-all disabled:opacity-50">
                {connecting ? "…" : "Celo"}
              </button>
              <button onClick={connectStellar} disabled={connecting}
                className="px-3 py-1.5 text-xs font-mono border border-blue-700/50 text-blue-400 hover:bg-blue-900/20 rounded transition-all disabled:opacity-50">
                {connecting ? "…" : "Stellar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
