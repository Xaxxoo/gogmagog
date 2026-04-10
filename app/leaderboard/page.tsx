"use client";
import { useState, useEffect } from "react";
import WalletBar from "@/components/WalletBar";
import { Flame, Trophy, RefreshCw } from "lucide-react";
import { getLeaderboard, GOG_CONTRACT_CELO } from "@/lib/contracts/celo";

type Player = {
  rank:    number;
  address: string;
  streak:  number;
};

const RANK_COLORS: Record<number, string> = {
  1: "var(--gold)",
  2: "#C0C0C0",
  3: "#CD7F32",
};

function short(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export default function LeaderboardPage() {
  const [players,  setPlayers]  = useState<Player[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [refreshed, setRefreshed] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!GOG_CONTRACT_CELO || GOG_CONTRACT_CELO === "0x") {
        setError("Contract not deployed yet. Set NEXT_PUBLIC_GOG_CONTRACT_CELO in .env.local");
        setPlayers([]);
        return;
      }
      const rows = await getLeaderboard();
      setPlayers(rows.map((r, i) => ({ rank: i + 1, address: r.address, streak: r.streak })));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    await load();
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 1500);
  };

  const top3 = [players[1], players[0], players[2]].filter(Boolean);
  const podiumRankOf = (i: number) => [2, 1, 3][i];

  return (
    <div className="min-h-screen">
      <WalletBar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">

        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Hall of fame</div>
            <h1 className="font-display font-800 text-4xl text-white mb-2">Leaderboard</h1>
            <p className="text-white/40">Ranked by streak · sourced from on-chain BaseTended events.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-secondary flex items-center gap-2 text-xs py-2 px-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {refreshed ? "Updated" : "Refresh"}
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="card p-5 mb-6 text-center" style={{ borderColor: "rgba(255,51,51,0.3)", background: "rgba(255,51,51,0.05)" }}>
            <p className="text-sm text-red-400 font-mono">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-5 animate-pulse" style={{ height: 72 }} />
            ))}
          </div>
        )}

        {/* Top 3 podium */}
        {!loading && top3.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {top3.map((p, i) => {
              const podiumRank = podiumRankOf(i);
              const color = RANK_COLORS[podiumRank];
              if (!p) return <div key={i} className="card p-5" />;
              return (
                <div
                  key={p.address}
                  className="card p-5 text-center"
                  style={podiumRank === 1 ? { borderColor: "rgba(255,184,0,0.4)" } : {}}
                >
                  <Trophy className="w-5 h-5 mx-auto mb-2" style={{ color }} />
                  <div className="font-display font-700 text-2xl mb-1" style={{ color }}>
                    {podiumRank === 1 ? "I" : podiumRank === 2 ? "II" : "III"}
                  </div>
                  <div className="font-semibold text-white text-sm font-mono">{short(p.address)}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="fire-flicker">🔥</span>
                    <span className="font-mono font-600 text-xl text-white">{p.streak}</span>
                  </div>
                  <div className="text-xs text-white/30 mt-1">day streak</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        {!loading && players.length > 0 && (
          <div className="card overflow-hidden">
            <div className="grid grid-cols-[40px_1fr_80px_80px] gap-0">
              {/* Header */}
              <div
                className="col-span-4 grid grid-cols-[40px_1fr_80px_80px] px-4 py-3 border-b"
                style={{ borderColor: "var(--border)", background: "var(--surface2)" }}
              >
                {["#", "Address", "Chain", "Streak"].map(h => (
                  <span key={h} className="text-xs font-mono text-white/30 uppercase tracking-wider">{h}</span>
                ))}
              </div>

              {players.map(p => (
                <div
                  key={p.address}
                  className="col-span-4 grid grid-cols-[40px_1fr_80px_80px] items-center px-4 py-3.5 border-b hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="font-mono font-600 text-sm"
                    style={{ color: RANK_COLORS[p.rank] || "rgba(255,255,255,0.3)" }}
                  >
                    {p.rank <= 3 ? ["I", "II", "III"][p.rank - 1] : p.rank}
                  </span>

                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(0,204,102,0.15)", color: "var(--green)" }}
                    >
                      {p.address[2]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="font-medium text-white text-sm font-mono">{short(p.address)}</span>
                  </div>

                  <span
                    className="badge text-xs"
                    style={{ background: "rgba(0,204,102,0.1)", color: "var(--green)" }}
                  >
                    celo
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="fire-flicker text-sm">🔥</span>
                    <span className="font-mono font-600 text-sm text-white">{p.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && players.length === 0 && (
          <div className="card p-16 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-4 text-white/20" />
            <p className="text-white/40 text-sm">No players yet. Be the first to tend your base!</p>
          </div>
        )}

      </div>
    </div>
  );
}
