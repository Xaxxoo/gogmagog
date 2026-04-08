"use client";
import { Shield, Zap, Hammer, Eye } from "lucide-react";
import clsx from "clsx";

export type AgentTier = "scout" | "warrior" | "builder" | "guardian";
export type AgentChain = "celo" | "stellar" | "both";

interface AgentCardProps {
  name: string;
  tier: AgentTier;
  chains: AgentChain;
  description: string;
  skills: string[];
  dailyFee: string;
  currency: string;
  active?: boolean;
  onHire?: () => void;
}

const TIER_STYLES: Record<AgentTier, { border: string; glow: string; badge: string; icon: any }> = {
  scout:    { border: "border-bone-400/20",   glow: "",                         badge: "text-bone-400 bg-ash-700/50",    icon: Eye },
  warrior:  { border: "border-blood-600/40",  glow: "shadow-[0_0_20px_rgba(192,32,32,0.1)]",  badge: "text-blood-400 bg-blood-900/30",  icon: Zap },
  builder:  { border: "border-moss-600/40",   glow: "shadow-[0_0_20px_rgba(90,138,48,0.1)]",  badge: "text-moss-400 bg-moss-900/30",    icon: Hammer },
  guardian: { border: "border-ember-600/50",  glow: "shadow-[0_0_20px_rgba(200,88,32,0.2)]",  badge: "text-ember-400 bg-ember-900/30",  icon: Shield },
};

export default function AgentCard({ name, tier, chains, description, skills, dailyFee, currency, active, onHire }: AgentCardProps) {
  const style = TIER_STYLES[tier];
  const Icon = style.icon;

  return (
    <div className={clsx(
      "relative rounded-lg border bg-ash-800/60 p-5 transition-all duration-300",
      "hover:bg-ash-700/60 hover:translate-y-[-2px]",
      style.border, style.glow,
      active && "ring-1 ring-ember-500/40"
    )}>
      {active && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 bg-ember-900/60 rounded border border-ember-700/40">
          <div className="w-1.5 h-1.5 rounded-full bg-ember-400 animate-pulse"/>
          <span className="text-[10px] font-mono text-ember-400">ACTIVE</span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className={clsx("w-10 h-10 rounded border flex items-center justify-center flex-shrink-0", style.border, "bg-ash-900/50")}>
          <Icon className="w-5 h-5 text-bone-400" />
        </div>
        <div>
          <h3 className="font-display text-sm text-bone-200 mb-0.5">{name}</h3>
          <div className="flex items-center gap-2">
            <span className={clsx("text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider", style.badge)}>
              {tier}
            </span>
            <span className="text-[10px] font-mono text-bone-500">
              {chains === "both" ? "CELO + STELLAR" : chains.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-bone-500 mb-3 leading-relaxed">{description}</p>

      <div className="flex flex-wrap gap-1 mb-4">
        {skills.map(skill => (
          <span key={skill} className="text-[10px] font-mono px-2 py-0.5 bg-ash-700/50 text-bone-400 rounded border border-ash-600/30">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-bone-500 mb-0.5">DAILY FEE</div>
          <div className="text-sm font-mono text-ember-400">{dailyFee} <span className="text-bone-500 text-xs">{currency}</span></div>
        </div>
        <button onClick={onHire}
          className={clsx(
            "px-4 py-2 text-xs font-mono rounded border transition-all",
            active
              ? "border-blood-600/40 text-blood-400 hover:bg-blood-900/20"
              : "border-ember-700/50 text-ember-400 hover:bg-ember-900/20 hover:border-ember-500/60"
          )}>
          {active ? "Dismiss" : "Hire Agent"}
        </button>
      </div>
    </div>
  );
}
