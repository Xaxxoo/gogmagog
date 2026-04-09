"use client";
import { useState } from "react";
import Link from "next/link";
import WalletBar from "@/components/WalletBar";
import {
  Shield, Droplets, Wheat, Flame, Clock, Zap, Users, Bot, Trophy, ChevronRight,
  AlertTriangle, CheckCircle, Skull, Star, Lock, Unlock, Target
} from "lucide-react";
import clsx from "clsx";

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-display font-700 text-sm text-white"
        style={{ background: "var(--surface2)", border: "1px solid rgba(255,255,255,0.15)" }}>
        {number}
      </div>
      <div className="flex-1 pt-2 pb-8 border-l" style={{ borderColor: "rgba(255,255,255,0.06)", paddingLeft: "28px", marginLeft: "-13px" }}>
        <h3 className="font-display font-700 text-lg text-white mb-2">{title}</h3>
        <div className="text-white/50 text-sm leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function Rule({ icon: Icon, color, title, body }: any) {
  return (
    <div className="flex gap-4 p-4 rounded-xl" style={{ background: "var(--surface2)" }}>
      <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <div className="font-semibold text-white text-sm mb-1">{title}</div>
        <div className="text-xs text-white/40 leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

function MilestoneBar() {
  const milestones = [
    { day: 1,   label: "First Brick",    icon: "🧱", desc: "+50 XP bonus" },
    { day: 7,   label: "Iron Crest",     icon: "🛡", desc: "NFT drop" },
    { day: 14,  label: "Ember Blade",    icon: "⚔️", desc: "NFT drop" },
    { day: 30,  label: "Wall of Gog",    icon: "🏰", desc: "Title unlock" },
    { day: 60,  label: "The Unbroken",   icon: "💎", desc: "Rare NFT" },
    { day: 100, label: "Eternal Flame",  icon: "🔥", desc: "Legendary" },
  ];
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="card p-6">
      <h3 className="font-display font-700 text-lg text-white mb-5">Streak milestone rewards</h3>
      <div className="relative mb-8">
        <div className="h-1 rounded-full w-full" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-1 rounded-full absolute top-0 left-0 w-[7%]" style={{ background: "var(--gold)" }} />
        {milestones.map((m, i) => {
          const pct = (m.day / 100) * 100;
          const isReached = m.day <= 7;
          const isHovered = hovered === i;
          return (
            <div key={m.day}
              className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${pct}%`, transform: "translate(-50%,-50%)" }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <div className="w-4 h-4 rounded-full flex items-center justify-center transition-transform"
                style={{
                  background: isReached ? "var(--gold)" : "var(--surface2)",
                  border: `2px solid ${isReached ? "var(--gold)" : "rgba(255,255,255,0.2)"}`,
                  transform: isHovered ? "scale(1.5)" : "scale(1)",
                }} />
              {isHovered && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap text-center rounded-lg p-2"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-strong)" }}>
                  <div className="text-lg mb-0.5">{m.icon}</div>
                  <div className="text-xs font-semibold text-white">{m.label}</div>
                  <div className="text-xs text-white/40">{m.desc}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {milestones.map((m, i) => (
          <div key={m.day}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            className="rounded-lg p-3 text-center cursor-pointer transition-all hover:bg-white/5"
            style={{ background: m.day <= 7 ? "rgba(255,184,0,0.08)" : "var(--surface2)", border: m.day <= 7 ? "1px solid rgba(255,184,0,0.3)" : "1px solid var(--border)" }}>
            <div className="text-xl mb-1" style={{ filter: m.day > 7 ? "grayscale(1) opacity(0.4)" : "" }}>{m.icon}</div>
            <div className="font-mono font-600 text-xs text-white">{m.day}d</div>
            <div className="text-xs text-white/30 truncate">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between p-4">
        <span className="font-semibold text-sm text-white">{q}</span>
        <ChevronRight className={clsx("w-4 h-4 text-white/30 transition-transform flex-shrink-0 ml-3", open && "rotate-90")} />
      </div>
      {open && (
        <div className="px-4 pb-4 text-sm text-white/50 leading-relaxed border-t" style={{ borderColor: "var(--border)" }}>
          <div className="pt-3">{a}</div>
        </div>
      )}
    </div>
  );
}

export default function HowToPlay() {
  return (
    <div className="min-h-screen">
      <WalletBar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-20">

        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">The basics</div>
          <h1 className="font-display font-800 text-5xl text-white mb-4 leading-tight">
            How to<br /><span style={{ color: "var(--red)" }}>play</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Gog &amp; Magog is a daily onchain survival game. Your job is simple:
            keep your citadel alive. Miss a single day and the horde moves in.
          </p>
        </div>

        {/* The core loop — BIG and clear */}
        <div className="mb-14">
          <div className="card p-6 mb-4" style={{ borderColor: "rgba(255,51,51,0.3)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,51,51,0.15)" }}>
                <Clock className="w-4 h-4 text-red-400" />
              </div>
              <h2 className="font-display font-700 text-xl text-white">The one rule</h2>
            </div>
            <p className="text-white text-base leading-relaxed mb-4">
              Every <span className="text-red-400 font-semibold">24 hours</span>, your base loses 8% of all resources. Sign one transaction before the timer hits zero — or watch your walls crumble.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield,   label: "Walls",      color: "var(--blue)"  },
                { icon: Droplets, label: "Water",      color: "var(--blue)"  },
                { icon: Wheat,    label: "Food",       color: "var(--green)" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="rounded-lg p-3 text-center" style={{ background: "var(--surface2)" }}>
                  <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-red-400 font-mono">−8% / day</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center text-xs font-mono text-white/20">↕</div>
          <div className="card p-5 mt-4" style={{ borderColor: "rgba(0,204,102,0.3)" }}>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-white/70 text-sm">Sign <code className="text-green-400 bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">tendBase()</code> once a day → resources restore +15%, streak goes up, you earn XP. That's it.</p>
            </div>
          </div>
        </div>

        {/* Step by step */}
        <div className="mb-14">
          <h2 className="font-display font-700 text-2xl text-white mb-8">Getting started</h2>
          <Step number={1} title="Connect your wallet">
            <p>Choose your chain: <span className="text-green-400">Celo</span> (EVM — use MetaMask, Rabby, or any EVM wallet) or <span className="text-blue-400">Stellar</span> (Soroban — use Freighter).</p>
            <p>You'll need a small amount of CELO or XLM to pay transaction fees. Celo fees are typically &lt;$0.001.</p>
          </Step>
          <Step number={2} title="Initialize your citadel">
            <p>Call <code className="text-red-400 bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">initBase()</code> once. This creates your citadel onchain: 80% walls, 80% water, 80% food.</p>
            <p>From this point, the 24-hour decay clock starts. The horde already knows you exist.</p>
          </Step>
          <Step number={3} title="Sign daily — no exceptions">
            <p>Every day, open the game and click <strong className="text-white">Tend Base</strong>. This calls <code className="text-red-400 bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">tendBase()</code> on-chain. Resources restore. Streak ticks up.</p>
            <p>You can also <strong className="text-white">Scavenge</strong> for extra food/water, or <strong className="text-white">Reinforce Walls</strong> for extra defense — but the daily tend is mandatory.</p>
          </Step>
          <Step number={4} title="Protect your streak">
            <p>Every consecutive day builds your streak. Streaks unlock milestone rewards — Iron Crest at 7 days, Ember Blade at 14, Wall of Gog title at 30, and the legendary Eternal Flame at 100 days.</p>
            <p className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>Miss a day: streak resets to 0. All milestone progress toward the next unlock is lost.</span>
            </p>
          </Step>
          <Step number={5} title="Raid or be raided">
            <p>When a neighbor's walls drop below 30%, you can raid. Your raid damage scales with your streak — a 42-day streak deals 47 wall damage per raid. Raiders steal resources and earn XP.</p>
            <p>Your walls being low makes you a target. Keep them above 60% to deter casual attackers.</p>
          </Step>
        </div>

        {/* Streak milestone bar */}
        <div className="mb-14">
          <MilestoneBar />
        </div>

        {/* Actions breakdown */}
        <div className="mb-14">
          <h2 className="font-display font-700 text-2xl text-white mb-5">Actions explained</h2>
          <div className="grid grid-cols-1 gap-3">
            <Rule icon={Shield}  color="var(--red)"   title="Tend Base (daily)"         body="Restores all resources +15%. Required to maintain streak. One call per day is enough. This is your most important action." />
            <Rule icon={Wheat}   color="var(--green)" title="Scavenge"                  body="Bonus action: +22% food, +12% water. Use when food/water are critically low. No streak effect." />
            <Rule icon={Shield}  color="var(--blue)"  title="Reinforce Walls"           body="Bonus action: +30% walls. Use before going offline or when a raider is nearby. No streak effect." />
            <Rule icon={Target}  color="var(--red)"   title="Raid Neighbor"             body="Attack a weakened citadel. Damage = 5 + your streak (capped at 25). You take 3 wall damage per raid. Costs nothing if you win." />
            <Rule icon={Bot}     color="var(--blue)"  title="Agent (passive)"           body="Hire an agent to call tendBase() for you every day. They're authorized for specific functions only — no access to your funds." />
          </div>
        </div>

        {/* What makes it addictive */}
        <div className="mb-14">
          <h2 className="font-display font-700 text-2xl text-white mb-2">Why you won't want to stop</h2>
          <p className="text-white/40 text-sm mb-6">The game is designed around one psychological loop: loss aversion.</p>
          <div className="space-y-3">
            {[
              { icon: Flame,    color: "var(--gold)", title: "Sunk cost creates loyalty",       body: "A 20-day streak is worth protecting at almost any cost. Every day you miss resets 20 days of milestone progress. This keeps players returning daily." },
              { icon: Trophy,   color: "var(--gold)", title: "Public leaderboard pressure",     body: "Your streak is onchain and visible. Falling off the top 10 stings. Watching someone surpass your longest streak creates the urge to reclaim your rank." },
              { icon: Skull,    color: "var(--red)",  title: "Real consequences",               body: "This is not a game where nothing matters. Your citadel can be invaded, stripped to zero, and destroyed. Permanent onchain damage makes every action count." },
              { icon: Star,     color: "var(--blue)", title: "Milestone unlocks feel earned",   body: "NFT rewards at day 7, 14, 30, 60, 100 are not random — they require sustained daily commitment. They signal status to other players in a way you can't fake." },
              { icon: Bot,      color: "var(--blue)", title: "Agents lower the friction",       body: "The agent system means you can commit long-term. Going on holiday? Hire an agent. This removes the biggest pain point and increases retention." },
              { icon: Lock,     color: "var(--red)",  title: "Fear of the decay timer",         body: "The countdown is real, persistent, and visible. Walking away from an active timer takes willpower. Most players don't." },
            ].map(({ icon: Icon, color, title, body }) => (
              <div key={title} className="flex gap-4 p-4 rounded-xl" style={{ background: "var(--surface2)" }}>
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
                <div>
                  <div className="font-semibold text-sm text-white mb-1">{title}</div>
                  <div className="text-xs text-white/40 leading-relaxed">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-14">
          <h2 className="font-display font-700 text-2xl text-white mb-5">FAQ</h2>
          <div className="space-y-2">
            <FAQ q="What happens if my base is completely destroyed?" a="All resources hit 0 and your citadel enters 'ruin' state. Raiders can loot it for a small resource gain. You must re-call initBase() to start over — with streak 0 and full resources." />
            <FAQ q="Can an agent raid on my behalf?" a="Only if you hire a Warrior or Guardian agent with SCOPE_RAID enabled. Scout and Builder agents are passive and will not attack." />
            <FAQ q="Does the agent have access to my wallet?" a="No. Celo agents are separate EOAs with a scope bitmask — they can only call specific contract functions. They cannot transfer CELO or other tokens. Stellar agents are separate keypairs authorized only for specific Soroban contract calls." />
            <FAQ q="What's the minimum daily commitment?" a="One transaction: tendBase(). On Celo it costs under $0.001 and takes 5 seconds. That's the full commitment if you just want to maintain your streak." />
            <FAQ q="Can I play on both chains at once?" a="Each chain has its own citadel and streak. They share the same global leaderboard. Playing both doubles your chances of milestone NFTs." />
            <FAQ q="How do raid damage and streak interact?" a="Raid damage = min(5 + your_streak, 25). A 20-day streak deals 25 damage per raid (the cap). The defender's walls must be below 30% for you to initiate." />
            <FAQ q="What are agents paid in?" a="Celo agents are paid in CELO (minimum 0.01 CELO/day). Stellar agents in XLM (minimum 0.5 XLM/day). The contract holds the fee; you can recover unused fees if you dismiss the agent early." />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-10 card" style={{ borderColor: "rgba(255,51,51,0.3)" }}>
          <div className="text-4xl mb-3">🏰</div>
          <h2 className="font-display font-700 text-2xl text-white mb-2">Ready to defend your citadel?</h2>
          <p className="text-white/40 text-sm mb-6">The decay timer started the moment you landed here. Sign your first transaction.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/game" className="btn btn-primary px-8 py-3">
              Enter the game <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/agents" className="btn btn-secondary px-6 py-3">
              Browse agents
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
