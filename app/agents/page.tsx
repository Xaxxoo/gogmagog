"use client";
import { useState } from "react";
import WalletBar from "@/components/WalletBar";
import { Shield, Zap, Hammer, Eye, Info, Check } from "lucide-react";
import clsx from "clsx";

const AGENTS = [
  {
    name: "Scout", tier: "scout", chains: "both",
    price: "0.01 CELO / 0.5 XLM / day",
    color: "rgba(255,255,255,0.6)",
    colorVal: "#999",
    description: "Performs one daily tend to keep your streak alive. Passive — no raiding.",
    skills: ["tend_base", "streak_preserve"],
    badge: null,
  },
  {
    name: "Warrior", tier: "warrior", chains: "celo",
    price: "0.05 CELO / day",
    color: "var(--red)",
    colorVal: "#FF3333",
    description: "Tends base, raids weakened neighbors, deposits loot. Best for competitive play.",
    skills: ["tend_base", "raid_neighbors", "loot_deposit"],
    badge: "Popular",
  },
  {
    name: "Builder", tier: "builder", chains: "stellar",
    price: "1.0 XLM / day",
    color: "var(--green)",
    colorVal: "#00CC66",
    description: "Stellar-native. Focuses on wall reinforcement and stockpiling. Never attacks.",
    skills: ["reinforce_walls", "scavenge", "stockpile", "tend_base"],
    badge: null,
  },
  {
    name: "Guardian", tier: "guardian", chains: "both",
    price: "0.12 CELO + 2 XLM / day",
    color: "var(--gold)",
    colorVal: "#FFB800",
    description: "Dual-chain elite agent. Cross-chain resource arbitrage, elite defense, streak maintenance on both networks.",
    skills: ["multi_chain", "tend_base", "reinforce_walls", "scavenge", "raid", "cross_chain_arb"],
    badge: "Best",
  },
];

const ICONS: any = { scout: Eye, warrior: Zap, builder: Hammer, guardian: Shield };

export default function AgentsPage() {
  const [active, setActive] = useState<string | null>(null);
  const [duration, setDuration] = useState("7");

  return (
    <div className="min-h-screen">
      <WalletBar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">

        <div className="mb-10">
          <div className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Autonomous guardians</div>
          <h1 className="font-display font-800 text-4xl text-white mb-3">Hire an Agent</h1>
          <p className="text-white/50 max-w-xl">Agents are on-chain accounts authorized to sign daily transactions for you. They maintain your streak and defend your citadel — without access to your funds.</p>
        </div>

        {/* How it works */}
        <div className="card p-5 mb-8 flex gap-3">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
          <div className="text-sm text-white/50 space-y-1">
            <p><span className="text-white">Celo agents</span> use a scoped EOA — they can only call <code className="text-red-400 bg-white/5 px-1 rounded font-mono text-xs">tendBase()</code>, <code className="text-red-400 bg-white/5 px-1 rounded font-mono text-xs">scavenge()</code>, <code className="text-red-400 bg-white/5 px-1 rounded font-mono text-xs">reinforceWalls()</code>. Cannot touch your CELO.</p>
            <p><span className="text-white">Stellar agents</span> use Soroban keypair auth — a separate key authorized via <code className="text-blue-400 bg-white/5 px-1 rounded font-mono text-xs">hire_agent()</code> for specific contract functions only.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {AGENTS.map(agent => {
            const Icon = ICONS[agent.tier];
            const isActive = active === agent.name;
            return (
              <div key={agent.name}
                className={clsx("card p-6 cursor-pointer transition-all hover:border-white/20",
                  isActive && "ring-1")}
                style={isActive ? { ringColor: agent.colorVal, borderColor: `${agent.colorVal}50` } : {}}
                onClick={() => setActive(isActive ? null : agent.name)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${agent.colorVal}15`, border: `1px solid ${agent.colorVal}30` }}>
                      <Icon className="w-5 h-5" style={{ color: agent.color }} />
                    </div>
                    <div>
                      <div className="font-display font-700 text-white">{agent.name}</div>
                      <div className="text-xs font-mono text-white/30">{agent.chains === "both" ? "Celo + Stellar" : agent.chains}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {agent.badge && (
                      <span className="badge text-xs" style={{ background: `${agent.colorVal}20`, color: agent.color, border: `1px solid ${agent.colorVal}40` }}>
                        {agent.badge}
                      </span>
                    )}
                    {isActive && <Check className="w-4 h-4 text-green-400" />}
                  </div>
                </div>
                <p className="text-sm text-white/50 mb-4">{agent.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {agent.skills.map(s => (
                    <span key={s} className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-600 text-white">{agent.price}</span>
                  <span className="text-xs text-white/30">per day</span>
                </div>
              </div>
            );
          })}
        </div>

        {active && (
          <div className="card p-6" style={{ borderColor: "rgba(255,184,0,0.3)" }}>
            <h3 className="font-display font-700 text-lg text-white mb-5">Configure {active}</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-mono text-white/30 uppercase tracking-wider mb-2">Duration</label>
                <select value={duration} onChange={e => setDuration(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm font-mono text-white bg-transparent outline-none"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border-strong)" }}>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="9999">Indefinite</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-white/30 uppercase tracking-wider mb-2">Priority</label>
                <select className="w-full rounded-lg px-3 py-2.5 text-sm font-mono text-white bg-transparent outline-none"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border-strong)" }}>
                  <option>Balanced</option><option>Walls first</option><option>Food first</option><option>Water first</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-white/30 uppercase tracking-wider mb-2">Aggression</label>
                <select className="w-full rounded-lg px-3 py-2.5 text-sm font-mono text-white bg-transparent outline-none"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border-strong)" }}>
                  <option>Passive</option><option>Defensive only</option><option>Opportunistic</option><option>Aggressive</option>
                </select>
              </div>
            </div>
            <button className="btn btn-gold px-8 py-3">
              Deploy Agent — Sign Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
