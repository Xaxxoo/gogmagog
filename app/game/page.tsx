"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import WalletBar from "@/components/WalletBar";
import GameScene from "@/components/GameScene";
import { useWalletCtx } from "@/app/providers";
import { useToast } from "@/app/providers";
import {
  IS_CONTRACT_DEPLOYED,
  getBaseState,
  tendBase    as contractTend,
  scavenge    as contractScavenge,
  reinforceWalls as contractReinforce,
  attackBase,
} from "@/lib/contracts/celo";
import {
  Shield, Droplets, Wheat, Clock, Swords, Bot,
  AlertTriangle, ChevronRight, Wallet, X, Target, Crosshair,
} from "lucide-react";
import clsx from "clsx";

type Action = "tend" | "scavenge" | "reinforce" | "raid";

/* ─── Milestone definitions ────────────────────────────────── */
const MILESTONES = [
  { days: 7,   label: "Iron Crest",    icon: "🛡", desc: "Wall durability +10% permanent" },
  { days: 14,  label: "Ember Blade",   icon: "⚔️", desc: "Raid damage +5 permanent" },
  { days: 30,  label: "Wall of Gog",   icon: "🏰", desc: "Title NFT minted to your wallet" },
  { days: 100, label: "Eternal Flame", icon: "🔥", desc: "Legendary status + rare NFT drop" },
];

/* ─── Mock raid targets ────────────────────────────────────── */
const RAID_TARGETS = [
  { name: "cryptoking",     addr: "0xDEAD000000000000000000000000000000001234" as `0x${string}`, walls: 28, chain: "celo",    reward: 32 },
  { name: "scavenger_b0t",  addr: "0xCAFE000000000000000000000000000000005678" as `0x${string}`, walls: 21, chain: "stellar", reward: 18 },
  { name: "anon7331",       addr: "0xBEEF000000000000000000000000000000009ABC" as `0x${string}`, walls: 15, chain: "celo",    reward: 44 },
];

/* ─── useTweenedValue ──────────────────────────────────────── */
function useTweenedValue(target: number, duration = 700) {
  const [display, setDisplay] = useState(target);
  const prevTarget = useRef(target);
  useEffect(() => {
    const from = prevTarget.current;
    if (from === target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * ease));
      if (t < 1) requestAnimationFrame(tick);
      else prevTarget.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return display;
}

/* ─── Confetti ─────────────────────────────────────────────── */
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const colors = ["#FF3333","#FFB800","#00CC66","#3399FF","#FF6666","#FFCC33","#9966FF","#FF88AA"];
  return (
    <div className="fixed inset-0 pointer-events-none z-[300]" aria-hidden>
      {Array.from({ length: 80 }).map((_, i) => (
        <div
          key={i}
          style={{
            position:     "absolute",
            left:         `${Math.random() * 100}%`,
            top:          "-12px",
            width:        `${4 + Math.random() * 7}px`,
            height:       `${4 + Math.random() * 7}px`,
            background:   colors[i % colors.length],
            borderRadius: i % 3 === 0 ? "50%" : "2px",
            animation:    `confettiFall ${1.2 + (i % 5) * 0.35}s ${(i % 8) * 0.1}s ease-out forwards`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Milestone celebration overlay ───────────────────────── */
function MilestoneCelebration({
  milestone,
  onClose,
}: {
  milestone: typeof MILESTONES[0];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
    >
      <div
        className="milestone-in text-center max-w-sm w-full rounded-3xl p-10 relative"
        style={{
          background: "linear-gradient(135deg, rgba(255,184,0,0.12), var(--surface))",
          border:     "1px solid rgba(255,184,0,0.45)",
          boxShadow:  "0 0 60px rgba(255,184,0,0.2)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="absolute inset-x-0 top-0 h-px rounded-t-3xl"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,184,0,0.8), transparent)" }}
        />
        <div className="text-7xl mb-5 block">{milestone.icon}</div>
        <div
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: "rgba(255,184,0,0.6)" }}
        >
          Milestone Unlocked — Day {milestone.days}
        </div>
        <h2
          className="font-display font-800 text-4xl mb-3"
          style={{ color: "var(--gold)", textShadow: "0 0 30px rgba(255,184,0,0.5)" }}
        >
          {milestone.label}
        </h2>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">{milestone.desc}</p>
        <button
          onClick={onClose}
          className="btn btn-gold px-10 py-3.5 text-sm font-700 w-full"
        >
          Claim Reward
        </button>
      </div>
    </div>
  );
}

/* ─── Raid panel ───────────────────────────────────────────── */
function RaidPanel({
  streak,
  onClose,
  onRaid,
  pending,
}: {
  streak:  number;
  onClose: () => void;
  onRaid:  (target: typeof RAID_TARGETS[0]) => void;
  pending: boolean;
}) {
  const damage = Math.min(5 + streak, 25);
  const [raiding, setRaiding] = useState<string | null>(null);

  const handleRaid = async (t: typeof RAID_TARGETS[0]) => {
    setRaiding(t.name);
    await onRaid(t);
    setRaiding(null);
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="modal-in w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border:     "1px solid rgba(255,51,51,0.3)",
          boxShadow:  "0 0 40px rgba(255,51,51,0.1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2.5">
            <Crosshair className="w-4 h-4 text-red-400" />
            <span className="font-display font-700 text-white">Select Target</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-mono px-2 py-1 rounded-md"
              style={{ background: "rgba(255,51,51,0.12)", color: "var(--red)", border: "1px solid rgba(255,51,51,0.25)" }}
            >
              Your damage: {damage} pts
            </span>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>

        {/* Targets */}
        <div className="p-3 space-y-2">
          {RAID_TARGETS.map(t => (
            <div
              key={t.name}
              className="rounded-xl p-4 flex items-center justify-between gap-3"
              style={{ background: "var(--surface2)", border: "1px solid rgba(255,51,51,0.12)" }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: t.chain === "celo" ? "var(--green)" : "var(--blue)" }}
                  />
                  <span className="font-semibold text-sm text-white">{t.name}</span>
                  <span className="text-xs font-mono text-white/30">{t.chain}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">Walls</span>
                      <span style={{ color: "var(--red)" }} className="font-mono">{t.walls}%</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${t.walls}%`,
                          background: "linear-gradient(90deg, #CC0000, #FF3333)",
                          boxShadow:  "0 0 6px rgba(255,51,51,0.5)",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/40 flex-shrink-0">
                    +{t.reward} res
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRaid(t)}
                disabled={pending || !!raiding}
                className="btn text-xs py-2 px-4 flex-shrink-0"
                style={{
                  background:   "rgba(255,51,51,0.15)",
                  border:       "1px solid rgba(255,51,51,0.35)",
                  color:        "var(--red)",
                  boxShadow:    "0 0 12px rgba(255,51,51,0.1)",
                  opacity:      raiding && raiding !== t.name ? 0.4 : 1,
                }}
              >
                {raiding === t.name ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border-2 border-red-500/30 border-t-red-400 animate-spin" />
                    Raiding…
                  </span>
                ) : "Raid"}
              </button>
            </div>
          ))}
        </div>

        <div
          className="px-5 py-3 text-xs text-white/25 font-mono text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          Only citadels with walls &lt; 30% are raidable · You take 3 wall damage per raid
        </div>
      </div>
    </div>
  );
}

/* ─── Resource Ring ────────────────────────────────────────── */
function ResourceRing({
  value, colorHex, label, icon: Icon,
}: {
  value: number; colorHex: string; label: string; icon: any;
}) {
  const display = useTweenedValue(value);
  const r = 30, circ = 2 * Math.PI * r;
  const offset  = circ - (display / 100) * circ;
  const isLow   = value < 30;
  const isCrit  = value < 15;

  return (
    <div
      className={clsx("card p-4 flex flex-col items-center gap-2 relative overflow-hidden", isLow && "danger-border")}
      style={!isLow ? { borderColor: `${colorHex}22` } : {}}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 100%, ${colorHex}10 0%, transparent 70%)` }} />
      {isCrit && <span className="animate-ping absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full inline-flex" style={{ background: "var(--red)", opacity: 0.75 }} />}

      <svg width="76" height="76" viewBox="0 0 76 76" className="relative">
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
        <circle
          cx="38" cy="38" r={r}
          fill="none"
          stroke={isLow ? "var(--red)" : colorHex}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transform: "rotate(-90deg)", transformOrigin: "center",
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.4s",
            filter: `drop-shadow(0 0 6px ${isLow ? "rgba(255,51,51,0.7)" : `${colorHex}60`})`,
          }}
        />
        <text x="38" y="43" textAnchor="middle" fontSize="15" fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
          fill={isLow ? "#FF3333" : "white"}>
          {display}
        </text>
      </svg>

      <div className="flex items-center gap-1.5 relative">
        <Icon className="w-3 h-3" style={{ color: isLow ? "var(--red)" : colorHex }} />
        <span className="text-xs font-medium text-white/50">{label}</span>
      </div>
    </div>
  );
}

/* ─── Decay Timer ───────────────────────────────────────────── */
function DecayTimer({ onNotify }: { onNotify: () => void }) {
  const [secs, setSecs] = useState(6 * 3600 + 23 * 60 + 11);
  const notified = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setSecs(s => s > 0 ? s - 1 : 86400), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (secs === 3599 && !notified.current) {
      notified.current = true;
      onNotify();
    }
  }, [secs, onNotify]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pct = (secs / 86400) * 100;
  const isUrgent = secs < 3600;
  const p2 = (n: number) => String(n).padStart(2, "0");

  return (
    <div className={clsx("card p-5 relative overflow-hidden", isUrgent && "danger-border")}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isUrgent
          ? "radial-gradient(ellipse at 50% 0%, rgba(255,51,51,0.08) 0%, transparent 70%)"
          : "radial-gradient(ellipse at 50% 0%, rgba(0,204,102,0.05) 0%, transparent 70%)",
      }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-white/35" />
            <span className="text-xs font-medium text-white/50">Next decay</span>
          </div>
          {isUrgent && (
            <span className="badge flex items-center gap-1" style={{ background:"rgba(255,51,51,0.15)", color:"var(--red)", border:"1px solid rgba(255,51,51,0.3)" }}>
              <AlertTriangle className="w-2.5 h-2.5" /> Urgent
            </span>
          )}
        </div>
        <div className="font-mono font-700 text-3xl mb-4 tabular-nums tracking-wider"
          style={{
            color: isUrgent ? "var(--red)" : "white",
            textShadow: isUrgent ? "0 0 20px rgba(255,51,51,0.4)" : "0 0 20px rgba(255,255,255,0.1)",
          }}>
          {p2(h)}:{p2(m)}:{p2(s)}
        </div>
        <div className="bar-track mb-2">
          <div className="bar-fill" style={{
            width: `${pct}%`,
            background: isUrgent ? "linear-gradient(90deg,#FF3333,#FF6644)" : "linear-gradient(90deg,#00CC66,#33FF88)",
            boxShadow:  isUrgent ? "0 0 8px rgba(255,51,51,0.5)" : "0 0 8px rgba(0,204,102,0.4)",
          }} />
        </div>
        <p className="text-xs text-white/25 font-mono">Resources drop 8% when timer hits zero</p>
      </div>
    </div>
  );
}

/* ─── Log Entry ─────────────────────────────────────────────── */
function LogEntry({ type, text }: { type: string; text: string }) {
  const s = {
    danger:  { color:"#FF6666", border:"#FF3333", bg:"rgba(255,51,51,0.05)" },
    success: { color:"#44DD88", border:"#00CC66", bg:"rgba(0,204,102,0.05)" },
    agent:   { color:"#66B3FF", border:"#3399FF", bg:"rgba(51,153,255,0.05)" },
    neutral: { color:"rgba(255,255,255,0.3)", border:"rgba(255,255,255,0.1)", bg:"rgba(255,255,255,0.02)" },
  }[type] ?? { color:"rgba(255,255,255,0.3)", border:"rgba(255,255,255,0.1)", bg:"rgba(255,255,255,0.02)" };

  return (
    <div className="rounded-lg px-3 py-2 text-xs font-mono border-l-2 leading-relaxed animate-fade-in"
      style={{ color: s.color, borderColor: s.border, background: s.bg }}>
      {text}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function GamePage() {
  const { address, chain, connectCelo, connectStellar } = useWalletCtx();
  const { toast } = useToast();

  // Game state
  const [walls,  setWalls]  = useState(19);
  const [water,  setWater]  = useState(38);
  const [food,   setFood]   = useState(74);
  const [streak, setStreak] = useState(7);
  const [xp,     setXp]     = useState(340);

  // UI state
  const [pending,     setPending]     = useState<Action | null>(null);
  const [lastAction,  setLastAction]  = useState("");
  const [showRaid,    setShowRaid]    = useState(false);
  const [celebration, setCelebration] = useState<typeof MILESTONES[0] | null>(null);
  const [confetti,    setConfetti]    = useState(false);
  const prevStreak = useRef(streak);

  const [log, setLog] = useState([
    { type: "danger",  text: "Wall integrity critical — scavenger breach detected" },
    { type: "neutral", text: "Decay event: all resources −8%  ·  Block 21,049,190" },
    { type: "success", text: "Base tended by vitalik.eth  ·  Streak: 7  ·  Block 21,049,181" },
    { type: "agent",   text: "🤖 Ironwall Agent tended base on your behalf  ·  Block 21,049,170" },
    { type: "neutral", text: "Decay event: all resources −8%  ·  Block 21,049,160" },
  ]);

  const addLog = useCallback((type: string, text: string) => {
    setLog(prev => [{ type, text: `${text}  ·  Block ${21_049_200 + prev.length}` }, ...prev].slice(0, 12));
  }, []);

  // ── Load real state from contract when wallet connects ──────
  useEffect(() => {
    if (!address || !IS_CONTRACT_DEPLOYED || chain !== "celo") return;
    getBaseState(address as `0x${string}`).then(s => {
      setWalls(s.walls); setWater(s.water);
      setFood(s.food);   setStreak(s.streak);
    }).catch(console.error);
  }, [address, chain]);

  // ── Milestone detection ─────────────────────────────────────
  useEffect(() => {
    const prev = prevStreak.current;
    prevStreak.current = streak;
    const hit = MILESTONES.find(m => streak >= m.days && prev < m.days);
    if (hit) {
      setCelebration(hit);
      setConfetti(true);
      toast("milestone", `${hit.icon} ${hit.label} unlocked!`, hit.desc);
      setTimeout(() => setConfetti(false), 3500);
    }
  }, [streak, toast]);

  // ── Push notification permission ────────────────────────────
  useEffect(() => {
    if (!address || typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [address]);

  // Called by DecayTimer when 1hr mark is crossed
  const handleDecayWarning = useCallback(() => {
    toast("warning", "Decay in 1 hour!", "Sign your daily transaction now to keep your streak alive.");
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("⚠️ Gog & Magog — Decay in 1 hour!", {
        body: "Sign your daily transaction now to protect your streak.",
      });
    }
  }, [toast]);

  // ── Keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    const map: Record<string, Action> = { t: "tend", s: "scavenge", r: "reinforce", a: "raid" };
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (pending) return;
      const action = map[e.key.toLowerCase()];
      if (action) act(action);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  // ── Core action handler ─────────────────────────────────────
  const act = useCallback(async (action: Action) => {
    if (pending) return;
    if (action === "raid") { setShowRaid(true); return; }

    setPending(action);
    setLastAction(action);

    const isReal = IS_CONTRACT_DEPLOYED && !!address && chain === "celo";

    try {
      if (isReal) {
        // Real contract call
        if (action === "tend")      await contractTend();
        if (action === "scavenge")  await contractScavenge();
        if (action === "reinforce") await contractReinforce();
        // Refresh from chain
        const s = await getBaseState(address as `0x${string}`);
        setWalls(s.walls); setWater(s.water); setFood(s.food); setStreak(s.streak);
      } else {
        // Demo simulation
        await new Promise(r => setTimeout(r, 1100));
        if (action === "tend") {
          setWalls(v => Math.min(100, v + 15));
          setWater(v => Math.min(100, v + 15));
          setFood(v  => Math.min(100, v + 15));
          setStreak(v => v + 1);
          setXp(v => v + 50);
        } else if (action === "scavenge") {
          setFood(v  => Math.min(100, v + 22));
          setWater(v => Math.min(100, v + 12));
          setXp(v => v + 20);
        } else if (action === "reinforce") {
          setWalls(v => Math.min(100, v + 30));
          setXp(v => v + 30);
        }
      }

      // Toast + log
      const msgs: Record<string, [string, string]> = {
        tend:      [`Base tended · Streak ${streak + 1} · +50 XP`, "success"],
        scavenge:  ["Scavenged · Food +22% · Water +12% · +20 XP",  "success"],
        reinforce: ["Walls reinforced +30% · +30 XP",               "success"],
      };
      const [msg, type] = msgs[action] ?? ["Action complete", "success"];
      toast("success", msg);
      addLog(type, msg);

      // Critical resource warnings
      if (walls < 30 && action !== "reinforce")
        toast("warning", "Walls critical", "Reinforce or hire an agent before raiders attack.");

    } catch (err: any) {
      const msg = err?.message?.includes("rejected") ? "Transaction rejected by wallet." : "Transaction failed. Try again.";
      toast("error", "Action failed", msg);
    }

    setTimeout(() => setLastAction(""), 1200);
    setPending(null);
  }, [pending, address, chain, streak, walls, toast, addLog]);

  // ── Raid execution ──────────────────────────────────────────
  const handleRaid = useCallback(async (target: typeof RAID_TARGETS[0]) => {
    try {
      if (IS_CONTRACT_DEPLOYED && address && chain === "celo") {
        await attackBase(target.addr);
      } else {
        await new Promise(r => setTimeout(r, 1400));
        setWalls(v => Math.max(0, v - 3)); // You take 3 wall damage
      }
      toast("success", `Raid successful — +${target.reward} resources`, `${target.name}'s walls took ${Math.min(5 + streak, 25)} damage`);
      addLog("neutral", `Raid on ${target.name} succeeded · +${target.reward} resources · You took −3 walls`);
      setXp(v => v + 40);
    } catch {
      toast("error", "Raid failed", "The target defended successfully.");
    }
    setShowRaid(false);
  }, [address, chain, streak, toast, addLog]);

  const level     = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  const ACTIONS: {
    action: Action; label: string; sub: string; icon: any;
    colorHex: string; isPrimary?: boolean; kbd: string;
  }[] = [
    { action:"tend",      label:"Tend Base",       sub:"Restore all +15% · +1 streak · +50 XP", icon:Shield, colorHex:"#FF3333", isPrimary:true, kbd:"T" },
    { action:"scavenge",  label:"Scavenge",         sub:"Food +22%, Water +12% · +20 XP",         icon:Wheat,  colorHex:"#00CC66",                kbd:"S" },
    { action:"reinforce", label:"Reinforce Walls",  sub:"Walls +30% · +30 XP",                    icon:Shield, colorHex:"#3399FF",                kbd:"R" },
    { action:"raid",      label:"Raid Neighbor",    sub:"Attack weakened citadels for resources", icon:Swords, colorHex:"#FF3333",                kbd:"A" },
  ];

  return (
    <div className="min-h-screen">
      <WalletBar />

      {/* Confetti */}
      <Confetti active={confetti} />

      {/* Milestone celebration */}
      {celebration && (
        <MilestoneCelebration
          milestone={celebration}
          onClose={() => setCelebration(null)}
        />
      )}

      {/* Raid panel */}
      {showRaid && (
        <RaidPanel
          streak={streak}
          pending={!!pending}
          onClose={() => setShowRaid(false)}
          onRaid={handleRaid}
        />
      )}

      {/* Scene */}
      <div className="pt-14">
        <GameScene
          wallHealth={walls}
          waterLevel={water}
          foodLevel={food}
          lastAction={lastAction}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Connect wallet banner ───────────────────────────── */}
        {!address && (
          <div
            className="card p-5 mb-6 flex items-center gap-4"
            style={{ borderColor: "rgba(255,184,0,0.2)", background: "linear-gradient(135deg, rgba(255,184,0,0.04), var(--surface))" }}
          >
            <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: "rgba(255,184,0,0.12)", border: "1px solid rgba(255,184,0,0.3)" }}>
              <Wallet className="w-5 h-5" style={{ color: "var(--gold)" }} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white text-sm mb-0.5">Playing in demo mode</div>
              <div className="text-xs text-white/40">Connect your wallet to save progress onchain and earn real NFT rewards.</div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={connectCelo} className="btn btn-secondary text-xs py-1.5 px-3"
                style={{ color:"var(--green)", borderColor:"rgba(0,204,102,0.25)", background:"rgba(0,204,102,0.06)" }}>
                Celo
              </button>
              <button onClick={connectStellar} className="btn btn-secondary text-xs py-1.5 px-3"
                style={{ color:"var(--blue)", borderColor:"rgba(51,153,255,0.25)", background:"rgba(51,153,255,0.06)" }}>
                Stellar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT COL ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Player bar */}
            <div className="card p-4 flex items-center justify-between" style={{ borderColor:"rgba(255,184,0,0.15)" }}>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-700 text-sm relative"
                  style={{ background:"linear-gradient(135deg,rgba(255,184,0,0.15),rgba(255,184,0,0.08))", border:"1px solid rgba(255,184,0,0.35)", color:"var(--gold)", boxShadow:"0 0 16px rgba(255,184,0,0.15)" }}>
                  {level}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">
                    {address ? `${address.slice(0,6)}…${address.slice(-4)}` : "vitalik.eth"}
                  </div>
                  <div className="text-xs text-white/35 font-mono">Level {level} Citadel Lord · {chain}</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-0.5">
                    <span className="fire-flicker text-base">🔥</span>
                    <span className="font-mono font-700 text-xl" style={{ color:"var(--gold)", textShadow:"0 0 12px rgba(255,184,0,0.5)" }}>
                      {streak}
                    </span>
                  </div>
                  <div className="text-xs text-white/25 font-mono">streak</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-600 text-lg text-white mb-0.5">{xp}</div>
                  <div className="text-xs text-white/25 font-mono">XP</div>
                </div>
                <div className="w-24">
                  <div className="flex justify-between text-xs text-white/25 font-mono mb-1">
                    <span>{xpInLevel}</span><span>100</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width:`${xpInLevel}%`, background:"linear-gradient(90deg,#FFB800,#FFDD66)", boxShadow:"0 0 6px rgba(255,184,0,0.5)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div>
              <div className="text-xs font-mono text-white/25 tracking-widest uppercase mb-3">Citadel resources</div>
              <div className="grid grid-cols-3 gap-3">
                <ResourceRing value={walls} colorHex="#3399FF" label="Walls"  icon={Shield}   />
                <ResourceRing value={water} colorHex="#33AAFF" label="Water"  icon={Droplets} />
                <ResourceRing value={food}  colorHex="#00CC66" label="Food"   icon={Wheat}    />
              </div>
            </div>

            {/* Streak milestones */}
            <div>
              <div className="text-xs font-mono text-white/25 tracking-widest uppercase mb-3">Streak rewards</div>
              <div className="card p-5" style={{ borderColor:"rgba(255,184,0,0.12)" }}>
                <div className="relative mb-5">
                  <div className="h-1.5 rounded-full w-full" style={{ background:"rgba(255,255,255,0.05)" }} />
                  <div className="h-1.5 rounded-full absolute top-0 left-0 transition-all duration-1000"
                    style={{ width:`${Math.min((streak/100)*100,100)}%`, background:"linear-gradient(90deg,#FFB800,#FFDD66)", boxShadow:"0 0 8px rgba(255,184,0,0.5)" }} />
                  {MILESTONES.map(m => (
                    <div key={m.days}
                      className="absolute top-1/2 w-3.5 h-3.5 rounded-full border-2 transition-all duration-500"
                      style={{
                        left:        `${(m.days/100)*100}%`,
                        transform:   "translate(-50%,-50%)",
                        background:  streak>=m.days ? "var(--gold)" : "var(--surface2)",
                        borderColor: streak>=m.days ? "var(--gold)" : "rgba(255,255,255,0.12)",
                        boxShadow:   streak>=m.days ? "0 0 8px rgba(255,184,0,0.6)" : "none",
                      }} />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {MILESTONES.map(m => {
                    const earned = streak >= m.days;
                    return (
                      <div key={m.days} className="rounded-xl p-3 text-center transition-all duration-300"
                        style={{ background:earned?"rgba(255,184,0,0.08)":"var(--surface2)", border:`1px solid ${earned?"rgba(255,184,0,0.25)":"rgba(255,255,255,0.05)"}`, boxShadow:earned?"0 0 12px rgba(255,184,0,0.12)":"none" }}>
                        <div className="text-xl mb-1.5" style={{ filter:earned?"none":"grayscale(1) opacity(0.25)" }}>{m.icon}</div>
                        <div className="text-xs font-semibold mb-0.5" style={{ color:earned?"var(--gold)":"rgba(255,255,255,0.35)" }}>{m.days}d</div>
                        <div className="text-xs text-white/25 truncate">{m.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="text-xs font-mono text-white/25 tracking-widest uppercase mb-3">Actions</div>
              <div className="grid grid-cols-2 gap-3">
                {ACTIONS.map(({ action, label, sub, icon: Icon, colorHex, isPrimary, kbd }) => {
                  const isLoading = pending === action;
                  return (
                    <button
                      key={action}
                      onClick={() => act(action)}
                      disabled={!!pending}
                      className={clsx(
                        "card p-4 text-left transition-all duration-200 relative overflow-hidden group",
                        "hover:border-white/15 disabled:opacity-40 disabled:cursor-not-allowed",
                        isPrimary && "ring-1",
                      )}
                      style={isPrimary ? { ringColor:`${colorHex}40`, borderColor:`${colorHex}30` } : {}}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ background:`radial-gradient(ellipse at 50% 100%, ${colorHex}0e 0%, transparent 70%)` }} />
                      {isPrimary && (
                        <div className="absolute inset-x-0 top-0 h-px"
                          style={{ background:`linear-gradient(90deg,transparent,${colorHex}60,transparent)` }} />
                      )}
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-1.5">
                          {isLoading
                            ? <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
                            : <Icon className="w-4 h-4 transition-all group-hover:scale-110" style={{ color:colorHex, filter:`drop-shadow(0 0 4px ${colorHex}60)` }} />
                          }
                          <span className="font-semibold text-sm text-white">{label}</span>
                          <div className="ml-auto flex items-center gap-1.5">
                            {isPrimary && (
                              <span className="badge text-xs" style={{ background:`${colorHex}18`, color:colorHex, border:`1px solid ${colorHex}35` }}>Daily</span>
                            )}
                            <span className="kbd">{kbd}</span>
                          </div>
                        </div>
                        <div className="text-xs text-white/35 leading-relaxed">{sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Keyboard shortcut legend */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-white/20 font-mono">
                <span>Shortcuts:</span>
                {ACTIONS.map(a => (
                  <span key={a.action} className="flex items-center gap-1">
                    <span className="kbd">{a.kbd}</span>
                    <span className="text-white/15">{a.label.split(" ")[0]}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COL ────────────────────────────────────── */}
          <div className="space-y-5">
            <DecayTimer onNotify={handleDecayWarning} />

            {/* Agent CTA */}
            <div className="card p-4 relative overflow-hidden" style={{ borderColor:"rgba(51,153,255,0.2)" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background:"radial-gradient(ellipse at 50% 100%, rgba(51,153,255,0.05) 0%, transparent 70%)" }} />
              <div className="relative flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background:"rgba(51,153,255,0.1)", border:"1px solid rgba(51,153,255,0.25)" }}>
                  <Bot className="w-4 h-4" style={{ color:"var(--blue)" }} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white mb-1">No agent active</div>
                  <div className="text-xs text-white/35 mb-3 leading-relaxed">
                    Miss a day and your streak resets. An agent signs for you while you're offline.
                  </div>
                  <a href="/agents" className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg transition-all w-full justify-center"
                    style={{ color:"var(--blue)", background:"rgba(51,153,255,0.08)", border:"1px solid rgba(51,153,255,0.25)" }}>
                    Hire an agent <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Chain log */}
            <div>
              <div className="text-xs font-mono text-white/25 tracking-widest uppercase mb-3">Chain log</div>
              <div className="space-y-1.5">
                {log.map((entry, i) => <LogEntry key={i} {...entry} />)}
              </div>
            </div>

            {/* Threats */}
            <div>
              <div className="text-xs font-mono text-white/25 tracking-widest uppercase mb-3">Threats nearby</div>
              <div className="space-y-2">
                {RAID_TARGETS.map(t => (
                  <div key={t.name} className="card p-3"
                    style={{ borderColor:t.walls<20?"rgba(255,51,51,0.2)":"rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full"
                          style={{ background:t.walls<20?"var(--red)":"var(--gold)", boxShadow:`0 0 5px ${t.walls<20?"var(--red)":"var(--gold)"}` }} />
                        <span className="text-sm font-medium text-white">{t.name}</span>
                      </div>
                      <button
                        onClick={() => setShowRaid(true)}
                        className="text-xs font-mono px-2 py-0.5 rounded transition-all hover:opacity-80"
                        style={{ color:"var(--red)", background:"rgba(255,51,51,0.1)", border:"1px solid rgba(255,51,51,0.2)" }}
                      >
                        Raid →
                      </button>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{
                        width:`${t.walls}%`,
                        background:"linear-gradient(90deg,#FF3333,#FF5544)",
                        boxShadow:"0 0 6px rgba(255,51,51,0.5)",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
