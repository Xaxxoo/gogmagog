"use client";
import { useState, useEffect, useRef } from "react";
import WalletBar from "@/components/WalletBar";
import GameScene from "@/components/GameScene";
import { Shield, Droplets, Wheat, Flame, Clock, Zap, Swords, Bot, ChevronRight, TrendingUp } from "lucide-react";
import clsx from "clsx";

type Action = "tend" | "scavenge" | "reinforce" | "raid";

const CONFETTI_COLORS = ["#FF3333","#FFB800","#00CC66","#3399FF","#FF6666","#FFCC33"];

function Particle({ x, color }: { x: number; color: string }) {
  const style = {
    position: "absolute" as const, left: x, top: "50%",
    width: 6, height: 6, borderRadius: "50%", background: color,
    animation: "confettiFall 1s ease-out forwards",
  };
  return <div style={style} />;
}

function ResourceRing({ value, color, label, icon: Icon }: { value: number; color: string; label: string; icon: any }) {
  const r = 28, circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const isLow = value < 30;
  return (
    <div className={clsx("card p-4 flex flex-col items-center gap-2 relative", isLow && "danger-border")}>
      {isLow && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />}
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle className="ring-base" cx="36" cy="36" r={r} strokeWidth="5" />
        <circle className="ring-fill" cx="36" cy="36" r={r} strokeWidth="5"
          stroke={isLow ? "#FF3333" : color}
          strokeDasharray={circ}
          strokeDashoffset={offset} />
        <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="JetBrains Mono" fill="white">{value}</text>
      </svg>
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3 text-white/40" />
        <span className="text-xs font-medium text-white/50">{label}</span>
      </div>
    </div>
  );
}

function DecayTimer() {
  const [secs, setSecs] = useState(6 * 3600 + 23 * 60 + 11);
  useEffect(() => {
    const id = setInterval(() => setSecs(s => s > 0 ? s - 1 : 86400), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pct = (secs / 86400) * 100;
  const isUrgent = secs < 3600;
  const p2 = (n: number) => String(n).padStart(2, "0");
  return (
    <div className={clsx("card p-5", isUrgent && "danger-border")}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/40" />
          <span className="text-sm font-medium text-white/60">Next decay</span>
        </div>
        {isUrgent && <span className="badge" style={{ background: "rgba(255,51,51,0.15)", color: "var(--red)", border: "1px solid rgba(255,51,51,0.3)" }}>Urgent</span>}
      </div>
      <div className="font-mono font-600 text-3xl text-white mb-3" style={{ color: isUrgent ? "var(--red)" : "white" }}>
        {p2(h)}:{p2(m)}:{p2(s)}
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: isUrgent ? "var(--red)" : "var(--green)" }} />
      </div>
      <p className="text-xs text-white/30 mt-2">Resources drop 8% when timer hits zero</p>
    </div>
  );
}

export default function GamePage() {
  const [walls, setWalls] = useState(19);
  const [water, setWater] = useState(38);
  const [food,  setFood]  = useState(74);
  const [streak, setStreak] = useState(7);
  const [xp, setXp] = useState(340);
  const [pending, setPending] = useState<Action | null>(null);
  const [justActed, setJustActed] = useState<Action | null>(null);
  const [log, setLog] = useState([
    { type: "danger",  text: "Wall integrity critical — scavenger breach detected" },
    { type: "neutral", text: "Decay event: all resources −8%  ·  Block 21,049,190" },
    { type: "success", text: "Base tended by vitalik.eth  ·  Streak: 7  ·  Block 21,049,181" },
    { type: "neutral", text: "Decay event: all resources −8%  ·  Block 21,049,170" },
  ]);

  const addLog = (type: string, text: string) => {
    setLog(prev => [{ type, text: `${text}  ·  Block ${21_049_200 + prev.length}` }, ...prev].slice(0, 10));
  };

  const act = async (action: Action) => {
    if (pending) return;
    setPending(action);
    await new Promise(r => setTimeout(r, 1100));
    if (action === "tend") {
      setWalls(v => Math.min(100, v + 15)); setWater(v => Math.min(100, v + 15)); setFood(v => Math.min(100, v + 15));
      setStreak(v => v + 1); setXp(v => v + 50);
      addLog("success", `Base tended · Resources +15% · Streak ${streak + 1} · +50 XP`);
    } else if (action === "scavenge") {
      setFood(v => Math.min(100, v + 22)); setWater(v => Math.min(100, v + 12)); setXp(v => v + 20);
      addLog("success", "Scavenged · Food +22% · Water +12% · +20 XP");
    } else if (action === "reinforce") {
      setWalls(v => Math.min(100, v + 30)); setXp(v => v + 30);
      addLog("success", "Walls reinforced +30% · +30 XP");
    } else if (action === "raid") {
      addLog("neutral", "Raid launched on neighboring base — awaiting result");
    }
    setJustActed(action);
    setTimeout(() => setJustActed(null), 800);
    setPending(null);
  };

  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  return (
    <div className="min-h-screen">
      <WalletBar />
      <div className="pt-14">
        <GameScene wallHealth={walls} waterLevel={water} foodLevel={food} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — resources + actions */}
          <div className="lg:col-span-2 space-y-5">

            {/* Player bar */}
            <div className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-700 text-sm"
                  style={{ background: "var(--surface2)", border: "1px solid rgba(255,184,0,0.4)", color: "var(--gold)" }}>
                  {level}
                </div>
                <div>
                  <div className="font-semibold text-white">vitalik.eth</div>
                  <div className="text-xs text-white/40 font-mono">Level {level} Citadel Lord</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <span className="fire-flicker text-base">🔥</span>
                    <span className="font-mono font-600 text-lg text-white">{streak}</span>
                  </div>
                  <div className="text-xs text-white/30">streak</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-600 text-lg text-white">{xp}</div>
                  <div className="text-xs text-white/30">XP</div>
                </div>
                <div className="w-24">
                  <div className="text-xs text-white/30 mb-1 font-mono">{xpInLevel}/100 XP</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${xpInLevel}%`, background: "var(--gold)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h2 className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Citadel resources</h2>
              <div className="grid grid-cols-3 gap-3">
                <ResourceRing value={walls} color="var(--blue)"  label="Walls"  icon={Shield}   />
                <ResourceRing value={water} color="var(--blue)"  label="Water"  icon={Droplets} />
                <ResourceRing value={food}  color="var(--green)" label="Food"   icon={Wheat}    />
              </div>
            </div>

            {/* Streak milestones */}
            <div>
              <h2 className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Streak rewards</h2>
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 relative">
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <div className="h-1.5 rounded-full absolute top-0 left-0 transition-all duration-1000"
                      style={{ width: `${Math.min((streak / 100) * 100, 100)}%`, background: "var(--gold)" }} />
                    {[7, 14, 30, 100].map(d => (
                      <div key={d} className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 flex items-center justify-center"
                        style={{ left: `${(d / 100) * 100}%`, transform: "translate(-50%,-50%)", background: streak >= d ? "var(--gold)" : "var(--surface2)", borderColor: streak >= d ? "var(--gold)" : "rgba(255,255,255,0.15)" }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { days: 7,   label: "Iron Crest",    icon: "🛡" },
                    { days: 14,  label: "Ember Blade",   icon: "⚔️" },
                    { days: 30,  label: "Wall of Gog",   icon: "🏰" },
                    { days: 100, label: "Eternal Flame", icon: "🔥" },
                  ].map(m => (
                    <div key={m.days} className={clsx("rounded-lg p-2 text-center", streak >= m.days ? "ring-1 ring-yellow-500/40" : "")}
                      style={{ background: streak >= m.days ? "rgba(255,184,0,0.08)" : "var(--surface2)" }}>
                      <div className="text-lg mb-1" style={{ filter: streak < m.days ? "grayscale(1) opacity(0.3)" : "" }}>{m.icon}</div>
                      <div className="text-xs font-semibold text-white/60">{m.days}d</div>
                      <div className="text-xs text-white/30 truncate">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h2 className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { action:"tend"     as Action, label:"Tend Base",       sub:"Restore all +15% · +1 streak · +50 XP", icon: Shield, color:"var(--red)",   primary: true },
                  { action:"scavenge" as Action, label:"Scavenge",        sub:"Food +22%, Water +12% · +20 XP",         icon: Wheat,  color:"var(--green)", primary: false },
                  { action:"reinforce"as Action, label:"Reinforce Walls", sub:"Walls +30% · +30 XP",                    icon: Shield, color:"var(--blue)",  primary: false },
                  { action:"raid"     as Action, label:"Raid Neighbor",   sub:"Attack weakened citadels",               icon: Swords, color:"var(--red)",   primary: false },
                ]).map(({ action, label, sub, icon: Icon, color, primary }) => (
                  <button key={action} onClick={() => act(action)} disabled={!!pending}
                    className={clsx("card p-4 text-left transition-all hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed",
                      justActed === action && "scale-95",
                      primary && "ring-1 ring-red-500/30"
                    )}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {pending === action
                        ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        : <Icon className="w-4 h-4" style={{ color }} />
                      }
                      <span className="font-semibold text-sm text-white">{label}</span>
                      {primary && <span className="badge ml-auto" style={{ background:"rgba(255,51,51,0.15)", color:"var(--red)", border:"1px solid rgba(255,51,51,0.3)" }}>Daily</span>}
                    </div>
                    <div className="text-xs text-white/40">{sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — timer + log + agent */}
          <div className="space-y-5">
            <DecayTimer />

            <div className="card p-4 flex items-start gap-3" style={{ border: "1px solid rgba(51,153,255,0.25)" }}>
              <Bot className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--blue)" }} />
              <div className="flex-1">
                <div className="font-semibold text-sm text-white mb-1">No agent active</div>
                <div className="text-xs text-white/40 mb-3">If you miss a day, your streak resets and raiders can attack. An agent signs for you while you're offline.</div>
                <a href="/agents" className="btn btn-secondary text-xs py-1.5 px-3 w-full justify-center" style={{ color: "var(--blue)", borderColor: "rgba(51,153,255,0.3)" }}>
                  Hire an agent →
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Chain log</h2>
              <div className="space-y-2">
                {log.map((entry, i) => (
                  <div key={i} className={clsx("rounded-lg px-3 py-2 text-xs font-mono border-l-2",
                    entry.type === "danger"  ? "text-red-400 border-red-500"   :
                    entry.type === "success" ? "text-green-400 border-green-500" :
                    "text-white/40 border-white/10"
                  )} style={{ background: "var(--surface)" }}>
                    {entry.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby threats */}
            <div>
              <h2 className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Threats nearby</h2>
              {[
                { name: "The Ash Raiders", distance: "3 blocks", strength: 80 },
                { name: "Scavenger Bot #88", distance: "breach imminent", strength: 45 },
              ].map(t => (
                <div key={t.name} className="card p-3 mb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white">{t.name}</span>
                    <span className="text-xs font-mono text-white/30">{t.distance}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${t.strength}%`, background: "var(--red)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
