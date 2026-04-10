"use client";
import { useState } from "react";
import WalletBar from "@/components/WalletBar";
import { Shield, Zap, Hammer, Eye, Info, Check, ChevronRight } from "lucide-react";
import clsx from "clsx";

const AGENTS = [
  {
    name: "Scout",
    tier: "scout",
    chains: "both",
    price: "0.01 CELO",
    priceSub: "or 0.5 XLM / day",
    colorHex: "#888888",
    description: "Performs one daily tend to keep your streak alive. Passive — no raiding.",
    skills: ["tend_base", "streak_preserve"],
    badge: null,
  },
  {
    name: "Warrior",
    tier: "warrior",
    chains: "celo",
    price: "0.05 CELO",
    priceSub: "per day",
    colorHex: "#FF3333",
    description: "Tends base, raids weakened neighbors, deposits loot. Best for competitive play.",
    skills: ["tend_base", "raid_neighbors", "loot_deposit"],
    badge: "Popular",
  },
  {
    name: "Builder",
    tier: "builder",
    chains: "stellar",
    price: "1.0 XLM",
    priceSub: "per day",
    colorHex: "#00CC66",
    description: "Stellar-native. Focuses on wall reinforcement and stockpiling. Never attacks.",
    skills: ["reinforce_walls", "scavenge", "stockpile", "tend_base"],
    badge: null,
  },
  {
    name: "Guardian",
    tier: "guardian",
    chains: "both",
    price: "0.12 CELO + 2 XLM",
    priceSub: "per day",
    colorHex: "#FFB800",
    description:
      "Dual-chain elite agent. Cross-chain resource arbitrage, elite defense, streak maintenance on both networks.",
    skills: ["multi_chain", "tend_base", "reinforce_walls", "scavenge", "raid", "cross_chain_arb"],
    badge: "Best",
  },
];

const ICONS: Record<string, any> = {
  scout: Eye,
  warrior: Zap,
  builder: Hammer,
  guardian: Shield,
};

export default function AgentsPage() {
  const [active, setActive] = useState<string | null>(null);
  const [duration, setDuration] = useState("7");

  const selectedAgent = AGENTS.find((a) => a.name === active);

  return (
    <div className="min-h-screen">
      <WalletBar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="mb-10">
          <div className="text-xs font-mono text-white/25 tracking-widest uppercase mb-3">
            Autonomous guardians
          </div>
          <h1 className="font-display font-800 text-4xl text-white mb-3">Hire an Agent</h1>
          <p className="text-white/45 max-w-xl leading-relaxed">
            Agents are on-chain accounts authorized to sign daily transactions for you. They
            maintain your streak and defend your citadel — without access to your funds.
          </p>
        </div>

        {/* Info box */}
        <div
          className="card p-4 mb-8 flex gap-3"
          style={{ borderColor: "rgba(51,153,255,0.2)", background: "rgba(51,153,255,0.04)" }}
        >
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
          <div className="text-sm text-white/45 space-y-1 leading-relaxed">
            <p>
              <span className="text-white font-medium">Celo agents</span> use a scoped EOA —
              they can only call{" "}
              <code className="text-red-400 bg-white/[0.05] px-1 py-0.5 rounded font-mono text-xs">
                tendBase()
              </code>
              ,{" "}
              <code className="text-red-400 bg-white/[0.05] px-1 py-0.5 rounded font-mono text-xs">
                scavenge()
              </code>
              ,{" "}
              <code className="text-red-400 bg-white/[0.05] px-1 py-0.5 rounded font-mono text-xs">
                reinforceWalls()
              </code>
              . Cannot touch your CELO.
            </p>
            <p>
              <span className="text-white font-medium">Stellar agents</span> use Soroban keypair
              auth — a separate key authorized via{" "}
              <code className="text-blue-400 bg-white/[0.05] px-1 py-0.5 rounded font-mono text-xs">
                hire_agent()
              </code>{" "}
              for specific contract functions only.
            </p>
          </div>
        </div>

        {/* Agent grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {AGENTS.map((agent) => {
            const Icon = ICONS[agent.tier];
            const isActive = active === agent.name;
            return (
              <div
                key={agent.name}
                className={clsx(
                  "card p-6 cursor-pointer transition-all duration-250 relative overflow-hidden group",
                  isActive && "ring-1"
                )}
                style={
                  isActive
                    ? {
                        borderColor: `${agent.colorHex}40`,
                        boxShadow: `0 0 24px ${agent.colorHex}12`,
                      }
                    : { borderColor: `${agent.colorHex}15` }
                }
                onClick={() => setActive(isActive ? null : agent.name)}
              >
                {/* hover bg */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 50% 100%, ${agent.colorHex}0c 0%, transparent 70%)`,
                  }}
                />

                {/* top gradient strip */}
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${agent.colorHex}50, transparent)`,
                    opacity: isActive ? 1 : 0.4,
                  }}
                />

                <div className="relative">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                        style={{
                          background: `${agent.colorHex}14`,
                          border: `1px solid ${agent.colorHex}30`,
                          boxShadow: isActive ? `0 0 16px ${agent.colorHex}25` : "none",
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{
                            color: agent.colorHex,
                            filter: `drop-shadow(0 0 4px ${agent.colorHex}60)`,
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-display font-700 text-white">{agent.name}</div>
                        <div className="text-xs font-mono text-white/30">
                          {agent.chains === "both" ? "Celo + Stellar" : agent.chains}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {agent.badge && (
                        <span
                          className="badge"
                          style={{
                            background: `${agent.colorHex}18`,
                            color: agent.colorHex,
                            border: `1px solid ${agent.colorHex}35`,
                            boxShadow: `0 0 8px ${agent.colorHex}20`,
                          }}
                        >
                          {agent.badge}
                        </span>
                      )}
                      {isActive && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(0,204,102,0.2)", border: "1px solid rgba(0,204,102,0.4)" }}
                        >
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-white/45 mb-4 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {agent.skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-mono px-2 py-0.5 rounded-md"
                        style={{
                          background: `${agent.colorHex}0e`,
                          color: `${agent.colorHex}cc`,
                          border: `1px solid ${agent.colorHex}20`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Price row */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span
                        className="text-base font-mono font-700"
                        style={{
                          color: agent.colorHex,
                          textShadow: `0 0 12px ${agent.colorHex}50`,
                        }}
                      >
                        {agent.price}
                      </span>
                      <span className="text-xs text-white/25 font-mono ml-2">{agent.priceSub}</span>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 transition-all duration-200 group-hover:translate-x-0.5"
                      style={{ color: `${agent.colorHex}60` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Config panel */}
        {active && selectedAgent && (
          <div
            className="card p-6 relative overflow-hidden"
            style={{ borderColor: `${selectedAgent.colorHex}30` }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 50% 100%, ${selectedAgent.colorHex}06 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${selectedAgent.colorHex}50, transparent)`,
              }}
            />

            <div className="relative">
              <h3 className="font-display font-700 text-lg text-white mb-1">
                Configure {active}
              </h3>
              <p className="text-sm text-white/35 mb-6">
                Set how the agent behaves while you're offline.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    label: "Duration",
                    defaultVal: duration,
                    onChange: (v: string) => setDuration(v),
                    opts: [
                      { v: "7", l: "7 days" },
                      { v: "14", l: "14 days" },
                      { v: "30", l: "30 days" },
                      { v: "9999", l: "Indefinite" },
                    ],
                  },
                  {
                    label: "Priority",
                    defaultVal: "balanced",
                    onChange: undefined,
                    opts: [
                      { v: "balanced", l: "Balanced" },
                      { v: "walls", l: "Walls first" },
                      { v: "food", l: "Food first" },
                      { v: "water", l: "Water first" },
                    ],
                  },
                  {
                    label: "Aggression",
                    defaultVal: "passive",
                    onChange: undefined,
                    opts: [
                      { v: "passive", l: "Passive" },
                      { v: "defensive", l: "Defensive only" },
                      { v: "opportunistic", l: "Opportunistic" },
                      { v: "aggressive", l: "Aggressive" },
                    ],
                  },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-mono text-white/30 uppercase tracking-wider mb-2">
                      {field.label}
                    </label>
                    <select
                      defaultValue={field.defaultVal}
                      onChange={field.onChange ? (e) => field.onChange!(e.target.value) : undefined}
                      className="w-full rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none transition-all"
                      style={{
                        background: "var(--surface2)",
                        border: "1px solid var(--border-strong)",
                        appearance: "none",
                        cursor: "pointer",
                      }}
                    >
                      {field.opts.map((o) => (
                        <option key={o.v} value={o.v}>
                          {o.l}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-gold px-8 py-3 text-sm font-700"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Deploy Agent — Sign Transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
