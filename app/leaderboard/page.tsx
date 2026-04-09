"use client";
import WalletBar from "@/components/WalletBar";
import { Flame, Shield, Zap, Trophy } from "lucide-react";

const PLAYERS = [
  { rank:1, name:"vitalik.eth",   streak:42, walls:98, chain:"celo",    raids:18, level:5 },
  { rank:2, name:"merlin.xlm",    streak:38, walls:91, chain:"stellar", raids:9,  level:4 },
  { rank:3, name:"anon7331",      streak:31, walls:87, chain:"celo",    raids:24, level:4 },
  { rank:4, name:"siege.eth",     streak:29, walls:72, chain:"stellar", raids:11, level:3 },
  { rank:5, name:"0xbuilder",     streak:22, walls:65, chain:"celo",    raids:6,  level:3 },
  { rank:6, name:"nightwatch.xlm",streak:19, walls:60, chain:"stellar", raids:3,  level:2 },
  { rank:7, name:"cryptoking",    streak:15, walls:55, chain:"celo",    raids:7,  level:2 },
  { rank:8, name:"stargazer.xlm", streak:12, walls:48, chain:"stellar", raids:2,  level:1 },
];

const RANK_COLORS: Record<number,string> = { 1:"var(--gold)", 2:"#C0C0C0", 3:"#CD7F32" };

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen">
      <WalletBar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">

        <div className="mb-10">
          <div className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Hall of fame</div>
          <h1 className="font-display font-800 text-4xl text-white mb-2">Leaderboard</h1>
          <p className="text-white/40">Ranked by streak. Updated every block.</p>
        </div>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[PLAYERS[1], PLAYERS[0], PLAYERS[2]].map((p, i) => {
            const podiumRank = [2,1,3][i];
            const color = RANK_COLORS[podiumRank];
            return (
              <div key={p.rank} className={`card p-5 text-center ${podiumRank === 1 ? "ring-1" : ""}`}
                style={podiumRank === 1 ? { ringColor: "var(--gold)", borderColor: "rgba(255,184,0,0.4)" } : {}}>
                <Trophy className="w-5 h-5 mx-auto mb-2" style={{ color }} />
                <div className="font-display font-700 text-2xl mb-1" style={{ color }}>{podiumRank === 1 ? "I" : podiumRank === 2 ? "II" : "III"}</div>
                <div className="font-semibold text-white text-sm">{p.name}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="fire-flicker">🔥</span>
                  <span className="font-mono font-600 text-xl text-white">{p.streak}</span>
                </div>
                <div className="text-xs text-white/30 mt-1">day streak</div>
              </div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_80px_80px_80px_80px] gap-0">
            <div className="col-span-6 grid grid-cols-[40px_1fr_80px_80px_80px_80px] px-4 py-3 border-b"
              style={{ borderColor: "var(--border)", background: "var(--surface2)" }}>
              {["#","Player","Chain","Streak","Walls","Raids"].map(h => (
                <span key={h} className="text-xs font-mono text-white/30 uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {PLAYERS.map(p => (
              <div key={p.rank} className="col-span-6 grid grid-cols-[40px_1fr_80px_80px_80px_80px] items-center px-4 py-3.5 border-b hover:bg-white/[0.02] transition-colors"
                style={{ borderColor: "var(--border)" }}>
                <span className="font-mono font-600 text-sm" style={{ color: RANK_COLORS[p.rank] || "rgba(255,255,255,0.3)" }}>
                  {p.rank <= 3 ? ["I","II","III"][p.rank-1] : p.rank}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: p.chain === "celo" ? "rgba(0,204,102,0.15)" : "rgba(51,153,255,0.15)", color: p.chain === "celo" ? "var(--green)" : "var(--blue)" }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-white text-sm">{p.name}</span>
                </div>
                <span className="badge" style={p.chain === "celo" ? { background:"rgba(0,204,102,0.1)",color:"var(--green)" } : { background:"rgba(51,153,255,0.1)",color:"var(--blue)" }}>
                  {p.chain}
                </span>
                <div className="flex items-center gap-1">
                  <span className="fire-flicker text-sm">🔥</span>
                  <span className="font-mono font-600 text-sm text-white">{p.streak}</span>
                </div>
                <span className="font-mono text-sm text-white">{p.walls}%</span>
                <span className="font-mono text-sm text-white/60">{p.raids}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
