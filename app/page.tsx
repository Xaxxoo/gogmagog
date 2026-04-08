"use client";
import Link from "next/link";
import { Shield, Zap, Users } from "lucide-react";
import GameScene from "@/components/GameScene";
import WalletBar from "@/components/WalletBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-ash-950 noise">
      <WalletBar />

      {/* Hero */}
      <section className="pt-14">
        <div className="relative">
          <GameScene wallHealth={19} waterLevel={38} foodLevel={74} />
          <div className="absolute inset-0 bg-gradient-to-t from-ash-950 via-ash-950/20 to-transparent pointer-events-none" />

          {/* Title overlay */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <p className="font-mono text-xs text-ember-600 tracking-[0.3em] mb-2 uppercase">The walls are crumbling</p>
            <h1 className="font-display text-5xl md:text-7xl text-ember-400 glow-ember mb-2 tracking-wide">
              Gog &amp; Magog
            </h1>
            <p className="font-body text-bone-400 text-sm tracking-[0.15em]">Onchain Survival · Sign or Fall</p>
          </div>
        </div>
      </section>

      {/* Core loop explainer */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Defend the Citadel",
              body: "Your base decays every 24 hours on-chain. Sign a transaction daily to tend your base — reinforce walls, replenish supplies, and fight off the Gog &amp; Magog horde.",
              accent: "border-ember-700/40 text-ember-400",
            },
            {
              icon: Zap,
              title: "Keep Your Streak",
              body: "Miss a day and your walls crumble. Raiders exploit weakened defenses. Long streaks unlock new structures, rare loot, and leaderboard prestige — but only the disciplined survive.",
              accent: "border-blood-600/40 text-blood-400",
            },
            {
              icon: Users,
              title: "Hire Agents",
              body: "Can't play every day? Deploy an on-chain agent — a smart contract authorized to act on your behalf. Agents tend your base, scavenge resources, and repel attackers while you're away.",
              accent: "border-moss-600/40 text-moss-400",
            },
          ].map(({ icon: Icon, title, body, accent }) => (
            <div key={title} className={`rounded-lg border bg-ash-800/40 p-6 ${accent.split(" ")[0]}`}>
              <Icon className={`w-6 h-6 mb-4 ${accent.split(" ")[1]}`} />
              <h3 className="font-display text-base text-bone-200 mb-3">{title}</h3>
              <p className="text-sm text-bone-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          ))}
        </div>
      </section>

      {/* Chain support */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-lg border border-ash-600/30 bg-ash-800/30 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="font-mono text-xs text-bone-500 tracking-widest mb-2 uppercase">Multi-chain survival</p>
            <h2 className="font-display text-2xl text-bone-200 mb-3">One citadel. Two chains.</h2>
            <p className="text-sm text-bone-500 max-w-sm leading-relaxed">
              Play on <span className="text-moss-400">Celo (EVM)</span> or <span className="text-blue-400">Stellar (Soroban)</span>.
              Agents work on both — deploy a Celo guardian or a Stellar scout based on your preferred network.
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-moss-600/50 bg-moss-900/20 flex items-center justify-center mb-2">
                <span className="font-mono text-xs text-moss-400 font-bold">CELO</span>
              </div>
              <p className="text-[10px] font-mono text-bone-500">EVM / Solidity</p>
            </div>
            <div className="flex items-center text-bone-600 font-mono text-xs">+</div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-blue-700/50 bg-blue-900/10 flex items-center justify-center mb-2">
                <span className="font-mono text-xs text-blue-400 font-bold">XLM</span>
              </div>
              <p className="text-[10px] font-mono text-bone-500">Stellar / Soroban</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-24">
        <Link href="/game"
          className="inline-block px-10 py-4 border border-ember-600/60 text-ember-400 font-display text-lg tracking-wider hover:bg-ember-900/20 rounded transition-all hover:border-ember-400/80 animate-pulse_glow">
          Enter the Citadel
        </Link>
      </section>
    </div>
  );
}
