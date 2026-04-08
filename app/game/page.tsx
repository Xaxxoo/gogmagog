"use client";
import { useState } from "react";
import WalletBar from "@/components/WalletBar";
import GameScene from "@/components/GameScene";
import { Shield, Droplets, Wheat, Flame, Clock, Zap } from "lucide-react";
import clsx from "clsx";

type Action = "tend" | "scavenge" | "reinforce" | "attack";

export default function GamePage() {
  const [walls, setWalls] = useState(19);
  const [water, setWater] = useState(38);
  const [food, setFood] = useState(74);
  const [streak, setStreak] = useState(7);
  const [log, setLog] = useState([
    { type: "danger", text: "Block 21,049,198 — Wall integrity critical. Scavenger breach." },
    { type: "neutral", text: "Block 21,049,190 — Decay event: all resources −8%." },
    { type: "success", text: "Block 21,049,181 — Base tended. Resources +15%. Streak: 7." },
    { type: "neutral", text: "Block 21,049,170 — Decay event: all resources −8%." },
  ]);
  const [pending, setPending] = useState<Action | null>(null);

  const act = async (action: Action) => {
    setPending(action);
    await new Promise(r => setTimeout(r, 1200));
    if (action === "tend") {
      setWalls(v => Math.min(100, v + 15));
      setWater(v => Math.min(100, v + 15));
      setFood(v => Math.min(100, v + 15));
      setStreak(v => v + 1);
      addLog("success", `Base tended. Resources +15%. Streak: ${streak + 1}.`);
    } else if (action === "scavenge") {
      setFood(v => Math.min(100, v + 22));
      setWater(v => Math.min(100, v + 12));
      addLog("success", "Scavenged: Food +22%, Water +12%.");
    } else if (action === "reinforce") {
      setWalls(v => Math.min(100, v + 30));
      addLog("success", "Walls reinforced +30%.");
    } else if (action === "attack") {
      addLog("neutral", "Raid sent against neighboring base.");
    }
    setPending(null);
  };

  const addLog = (type: string, text: string) => {
    setLog(prev => [{ type, text: `Block 21,049,${204 + prev.length} — ${text}` }, ...prev].slice(0, 8));
  };

  const resources = [
    { label: "Walls", icon: Shield, value: walls, color: walls < 30 ? "bg-blood-500" : walls < 60 ? "bg-ember-500" : "bg-moss-400" },
    { label: "Water", icon: Droplets, value: water, color: water < 30 ? "bg-blood-500" : water < 60 ? "bg-ember-500" : "bg-blue-400" },
    { label: "Food",  icon: Wheat,   value: food,  color: food  < 30 ? "bg-blood-500" : food  < 60 ? "bg-ember-500" : "bg-moss-400" },
  ];

  return (
    <div className="min-h-screen bg-ash-950 noise">
      <WalletBar />
      <div className="pt-14">
        <GameScene wallHealth={walls} waterLevel={water} foodLevel={food} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Resources */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-sm text-bone-500 tracking-widest uppercase">Citadel Status</h2>
          <div className="grid grid-cols-3 gap-3">
            {resources.map(({ label, icon: Icon, value, color }) => (
              <div key={label} className="bg-ash-800/60 rounded-lg border border-ash-600/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-bone-500" />
                  <span className="font-mono text-xs text-bone-500">{label}</span>
                </div>
                <div className="text-2xl font-mono text-bone-200 mb-2">{value}<span className="text-sm text-bone-500">%</span></div>
                <div className="h-1.5 bg-ash-700 rounded-full overflow-hidden">
                  <div className={clsx("h-full rounded-full transition-all duration-700", color)} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Streak + timer */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-ash-800/60 rounded-lg border border-ember-800/30 p-4 flex items-center gap-3">
              <Flame className="w-5 h-5 text-ember-500" />
              <div>
                <div className="font-mono text-xs text-bone-500 mb-0.5">Daily streak</div>
                <div className="font-mono text-xl text-ember-400">{streak} <span className="text-sm text-bone-500">days</span></div>
              </div>
            </div>
            <div className="bg-ash-800/60 rounded-lg border border-blood-800/30 p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blood-400" />
              <div>
                <div className="font-mono text-xs text-bone-500 mb-0.5">Next decay</div>
                <div className="font-mono text-xl text-blood-400">04:32 <span className="text-sm text-bone-500">hrs</span></div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div>
            <h2 className="font-display text-sm text-bone-500 tracking-widest uppercase mb-3">Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { action: "tend"     as Action, label: "Tend Base",      sub: "+15% all · +1 streak", color: "border-ember-700/50 text-ember-400 hover:bg-ember-900/20" },
                { action: "scavenge" as Action, label: "Scavenge",       sub: "+food +water",          color: "border-bone-400/20 text-bone-400 hover:bg-ash-700/30" },
                { action: "reinforce"as Action, label: "Reinforce Walls",sub: "+30% walls",            color: "border-moss-600/40 text-moss-400 hover:bg-moss-900/20" },
                { action: "attack"   as Action, label: "Raid Neighbor",  sub: "steal their resources", color: "border-blood-600/40 text-blood-400 hover:bg-blood-900/20" },
              ]).map(({ action, label, sub, color }) => (
                <button key={action} onClick={() => act(action)} disabled={!!pending}
                  className={clsx("rounded-lg border p-4 text-left transition-all disabled:opacity-40", color)}>
                  <div className="font-mono text-sm mb-0.5 flex items-center gap-2">
                    {pending === action && <span className="inline-block w-3 h-3 border border-current rounded-full animate-spin border-t-transparent" />}
                    {label}
                  </div>
                  <div className="font-mono text-[11px] text-bone-500">{sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chain log */}
        <div>
          <h2 className="font-display text-sm text-bone-500 tracking-widest uppercase mb-3">Chain Log</h2>
          <div className="space-y-2">
            {log.map((entry, i) => (
              <div key={i} className={clsx(
                "text-xs font-mono px-3 py-2 rounded border-l-2 bg-ash-800/40",
                entry.type === "danger"  ? "border-blood-500 text-blood-300" :
                entry.type === "success" ? "border-moss-500 text-moss-300" :
                "border-ash-600/50 text-bone-500"
              )}>
                {entry.text}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg border border-blue-800/30 bg-ash-800/30">
            <div className="font-mono text-[10px] text-bone-500 mb-2 uppercase tracking-wider">Agent Status</div>
            <div className="font-mono text-xs text-bone-400">No agent deployed</div>
            <div className="font-mono text-[10px] text-blood-400 mt-1">Base will decay if you miss a day</div>
            <a href="/agents"
              className="mt-3 block text-center py-2 text-xs font-mono border border-ember-700/40 text-ember-400 rounded hover:bg-ember-900/20 transition-colors">
              Hire an Agent →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
