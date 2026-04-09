"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import WalletBar from "@/components/WalletBar";
import GameScene from "@/components/GameScene";
import { Flame, Shield, Users, Zap, Trophy, Clock, ChevronRight } from "lucide-react";

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="card p-6 text-center">
      <div className="font-display font-800 text-3xl text-white mb-1">{value}</div>
      <div className="text-sm font-semibold text-white/60">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

function FeatureRow({ icon: Icon, color, title, body }: any) {
  return (
    <div className="flex gap-4 p-5 card hover:border-white/20 transition-all">
      <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="font-semibold text-white mb-1">{title}</div>
        <div className="text-sm text-white/50 leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [countdown, setCountdown] = useState({ h: 6, m: 23, s: 11 });
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen">
      <WalletBar />

      {/* HERO */}
      <section className="pt-14">
        <div className="relative">
          <GameScene wallHealth={19} waterLevel={38} foodLevel={74} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 40%, var(--bg) 100%)" }} />

          {/* Floating decay pill */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-fade-in">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono font-medium"
              style={{ background: "rgba(255,51,51,0.15)", border: "1px solid rgba(255,51,51,0.4)", color: "var(--red)" }}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Next decay in {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center animate-slide-up pointer-events-none">
            <h1 className="font-display font-800 text-6xl md:text-8xl text-white mb-3 tracking-tight">
              Gog <span style={{ color: "var(--red)" }}>&amp;</span> Magog
            </h1>
            <p className="text-white/50 text-lg font-medium">Onchain survival. Sign daily or lose everything.</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">

        {/* Live ticker */}
        <div className="mb-12 py-3 rounded-lg overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="ticker-wrap">
            <div className="ticker-inner animate-ticker">
              {Array(2).fill([
                "🔥 vitalik.eth — 42 day streak",
                "⚔️ merlin.xlm raided anon7331 — 18 damage",
                "🏆 siege.eth reached 30 day milestone — Wall of Gog title earned",
                "💀 cryptoking — base destroyed after 3 days offline",
                "🤖 Ironwall Agent defended 0xbuilder's base overnight",
                "🐀 Magog horde breached the northern wall — Block 21,049,312",
              ]).flat().map((item, i) => (
                <span key={i} className="text-sm text-white/40 font-mono">{item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <StatCard value="1,204" label="Active citadels" sub="across both chains" />
          <StatCard value="42" label="Longest streak" sub="vitalik.eth" />
          <StatCard value="387" label="Agents deployed" sub="right now" />
          <StatCard value="6h 23m" label="Until next decay" sub="sign before it hits" />
        </div>

        {/* Core loop */}
        <div className="mb-16">
          <div className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">The loop</div>
          <h2 className="font-display font-700 text-3xl text-white mb-8">Simple rules. Brutal consequences.</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <FeatureRow icon={Shield}  color="var(--red)"   title="Defend your base"     body="Your walls, water, and food decay by 8% every 24 hours. Sign one transaction daily to restore them and keep your citadel alive." />
            <FeatureRow icon={Flame}   color="var(--gold)"  title="Build your streak"    body="Every consecutive day you sign earns +1 streak. Streaks unlock rare loot, title NFTs, and leaderboard prestige. Miss a day — reset." />
            <FeatureRow icon={Zap}     color="var(--red)"   title="Raid your neighbors"  body="When enemy walls drop below 30%, you can raid. Steal resources, earn XP, and deal permanent damage. High-streak players raid harder." />
            <FeatureRow icon={Users}   color="var(--blue)"  title="Hire an agent"        body="Can't log in? Buy an autonomous agent — a smart contract authorized to sign on your behalf and maintain your streak while you sleep." />
          </div>
        </div>

        {/* Chain section */}
        <div className="mb-16 p-8 card">
          <div className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Multi-chain</div>
          <h2 className="font-display font-700 text-2xl text-white mb-2">One world. Two chains.</h2>
          <p className="text-white/40 text-sm mb-8 max-w-lg">Play on Celo EVM or Stellar Soroban. Both chains share the same leaderboard. Agents work on both.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Celo", sub: "EVM · Chain 42220", color: "var(--green)", desc: "Use MetaMask or any EVM wallet. Low fees, fast finality, mobile-first." },
              { name: "Stellar", sub: "Soroban · Testnet", color: "var(--blue)", desc: "Use Freighter wallet. Soroban smart contracts power the agent system." },
            ].map(c => (
              <div key={c.name} className="rounded-lg p-5" style={{ background: "var(--surface2)", border: `1px solid ${c.color}30` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                  <span className="font-semibold text-white">{c.name}</span>
                  <span className="font-mono text-xs text-white/30">{c.sub}</span>
                </div>
                <p className="text-sm text-white/40">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mb-24 text-center">
          <h2 className="font-display font-700 text-4xl text-white mb-4">Your citadel awaits.</h2>
          <p className="text-white/40 mb-8">The horde never sleeps. Neither should you.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/game" className="btn btn-primary px-8 py-3 text-base">
              Enter the game <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/how-to-play" className="btn btn-secondary px-8 py-3 text-base">
              How to play
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
