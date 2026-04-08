"use client";
import { useState } from "react";
import WalletBar from "@/components/WalletBar";
import AgentCard from "@/components/AgentCard";
import type { AgentTier } from "@/components/AgentCard";
import { Info } from "lucide-react";

const AGENTS: Array<{
  name: string; tier: AgentTier; chains: any;
  description: string; skills: string[];
  dailyFee: string; currency: string;
}> = [
  {
    name: "Ember Scout",
    tier: "scout",
    chains: "both",
    description: "A cautious agent that performs the minimum daily action to maintain your streak — tends base once per day and nothing more. Low cost, low risk.",
    skills: ["tend_base", "streak_preserve", "celo_evm", "stellar_soroban"],
    dailyFee: "0.01",
    currency: "CELO / 0.5 XLM",
  },
  {
    name: "Ironwall Warrior",
    tier: "warrior",
    chains: "celo",
    description: "An aggressive Celo-native agent that tends base, actively raids weakened neighbors, and deposits loot back to your citadel. Best for competitive play.",
    skills: ["tend_base", "raid_neighbors", "loot_deposit", "streak_preserve"],
    dailyFee: "0.05",
    currency: "CELO",
  },
  {
    name: "Soroban Builder",
    tier: "builder",
    chains: "stellar",
    description: "A Stellar-native Soroban agent focused on construction. Prioritizes wall integrity and stockpiles — never attacks but keeps your base near full health.",
    skills: ["reinforce_walls", "scavenge", "stockpile", "tend_base"],
    dailyFee: "1.0",
    currency: "XLM",
  },
  {
    name: "Dual-chain Guardian",
    tier: "guardian",
    chains: "both",
    description: "The most capable agent. Operates on both Celo and Stellar simultaneously — cross-chain resource arbitrage, elite defense, and streak maintenance regardless of network conditions.",
    skills: ["multi_chain", "tend_base", "reinforce_walls", "scavenge", "raid", "cross_chain_arb"],
    dailyFee: "0.12",
    currency: "CELO + 2 XLM",
  },
];

export default function AgentsPage() {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [chain, setChain] = useState<"celo"|"stellar"|"both">("both");

  const filtered = chain === "both" ? AGENTS : AGENTS.filter(a => a.chains === chain || a.chains === "both");

  return (
    <div className="min-h-screen bg-ash-950 noise">
      <WalletBar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">

        <div className="mb-10">
          <p className="font-mono text-xs text-ember-600 tracking-widest uppercase mb-2">Autonomous guardians</p>
          <h1 className="font-display text-4xl text-bone-200 glow-ember mb-4">Agent Marketplace</h1>
          <p className="text-sm text-bone-500 max-w-xl leading-relaxed">
            Agents are on-chain smart accounts authorized to sign transactions on your behalf.
            They maintain your streak and defend your citadel while you're offline — on Celo (EVM)
            or Stellar (Soroban), or both.
          </p>
        </div>

        {/* How agents work */}
        <div className="mb-8 p-5 rounded-lg border border-ember-800/30 bg-ember-950/30 flex gap-3">
          <Info className="w-4 h-4 text-ember-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-bone-500 leading-relaxed space-y-1">
            <p><span className="text-bone-300">Celo agents</span> use a dedicated EOA or Safe sub-account with limited permissions — they can only call <code className="text-ember-400 bg-ash-700/50 px-1 rounded">tendBase()</code>, <code className="text-ember-400 bg-ash-700/50 px-1 rounded">scavenge()</code>, and <code className="text-ember-400 bg-ash-700/50 px-1 rounded">reinforceWalls()</code>. They cannot transfer your assets.</p>
            <p><span className="text-bone-300">Stellar agents</span> use Soroban's contract-level auth — a separate keypair is authorized via <code className="text-ember-400 bg-ash-700/50 px-1 rounded">hire_agent()</code> and can only invoke whitelisted contract functions on your account.</p>
            <p>You can dismiss an agent at any time by signing a <code className="text-ember-400 bg-ash-700/50 px-1 rounded">dismissAgent()</code> transaction.</p>
          </div>
        </div>

        {/* Chain filter */}
        <div className="flex gap-2 mb-6">
          {(["both","celo","stellar"] as const).map(c => (
            <button key={c} onClick={() => setChain(c)}
              className={`px-4 py-1.5 text-xs font-mono rounded border transition-all ${
                chain === c
                  ? "border-ember-600/60 text-ember-400 bg-ember-900/20"
                  : "border-ash-600/30 text-bone-500 hover:border-ash-500/50"
              }`}>
              {c === "both" ? "All chains" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map(agent => (
            <AgentCard
              key={agent.name}
              {...agent}
              active={activeAgent === agent.name}
              onHire={() => setActiveAgent(prev => prev === agent.name ? null : agent.name)}
            />
          ))}
        </div>

        {/* Active agent config */}
        {activeAgent && (
          <div className="mt-8 p-6 rounded-lg border border-ember-700/40 bg-ash-800/50">
            <h3 className="font-display text-sm text-ember-400 mb-4">Configure: {activeAgent}</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block font-mono text-[10px] text-bone-500 mb-2 uppercase">Duration</label>
                <select className="w-full bg-ash-700/50 border border-ash-600/30 rounded px-3 py-2 text-sm font-mono text-bone-300 focus:outline-none focus:border-ember-700/50">
                  <option>7 days</option>
                  <option>14 days</option>
                  <option>30 days</option>
                  <option>Forever</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-bone-500 mb-2 uppercase">Priority</label>
                <select className="w-full bg-ash-700/50 border border-ash-600/30 rounded px-3 py-2 text-sm font-mono text-bone-300 focus:outline-none focus:border-ember-700/50">
                  <option>Balanced</option>
                  <option>Walls first</option>
                  <option>Food first</option>
                  <option>Water first</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] text-bone-500 mb-2 uppercase">Aggression</label>
                <select className="w-full bg-ash-700/50 border border-ash-600/30 rounded px-3 py-2 text-sm font-mono text-bone-300 focus:outline-none focus:border-ember-700/50">
                  <option>Passive (no raids)</option>
                  <option>Defensive only</option>
                  <option>Opportunistic</option>
                  <option>Aggressive</option>
                </select>
              </div>
            </div>
            <button className="px-6 py-2.5 border border-ember-600/60 text-ember-400 font-mono text-sm rounded hover:bg-ember-900/20 transition-all">
              Deploy Agent — Sign Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
