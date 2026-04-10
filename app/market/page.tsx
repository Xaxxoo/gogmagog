"use client";
import WalletBar from "@/components/WalletBar";
import { Lock, Wallet } from "lucide-react";
import clsx from "clsx";
import { useWalletCtx } from "@/app/providers";
import { useStreak } from "@/lib/hooks/useStreak";

const ITEMS = [
  { id:1, name:"Iron Crest",       type:"Cosmetic", rarity:"Common",   streak:7,   price:"0.8 CELO",  emoji:"🛡", chain:"celo"    },
  { id:2, name:"Deep Well",        type:"Structure",rarity:"Uncommon", streak:10,  price:"3.2 XLM",   emoji:"💧", chain:"stellar" },
  { id:3, name:"Wolfsbane Axe",    type:"Weapon",   rarity:"Rare",     streak:14,  price:"2.4 CELO",  emoji:"⚔️", chain:"celo"    },
  { id:4, name:"Blood Banner",     type:"Cosmetic", rarity:"Epic",     streak:21,  price:"5.0 CELO",  emoji:"🚩", chain:"both"    },
  { id:5, name:"Bone Parapet",     type:"Structure",rarity:"Common",   streak:5,   price:"0.6 XLM",   emoji:"🧱", chain:"stellar" },
  { id:6, name:"Ember Torch",      type:"Cosmetic", rarity:"Common",   streak:3,   price:"0.3 XLM",   emoji:"🔥", chain:"stellar" },
  { id:7, name:"Soroban Relic",    type:"Artifact", rarity:"Legendary",streak:60,  price:"12.0 XLM",  emoji:"💎", chain:"stellar" },
  { id:8, name:"Raid Trophy",      type:"Artifact", rarity:"Rare",     streak:20,  price:"3.5 CELO",  emoji:"🏆", chain:"celo"    },
];

const RARITY: Record<string, { bg: string; text: string }> = {
  Common:    { bg:"rgba(255,255,255,0.06)",   text:"rgba(255,255,255,0.5)" },
  Uncommon:  { bg:"rgba(0,204,102,0.1)",      text:"var(--green)" },
  Rare:      { bg:"rgba(51,153,255,0.1)",     text:"var(--blue)" },
  Epic:      { bg:"rgba(255,51,51,0.1)",      text:"var(--red)" },
  Legendary: { bg:"rgba(255,184,0,0.15)",     text:"var(--gold)" },
};

export default function MarketPage() {
  const { address, chain, connectCelo, connectStellar } = useWalletCtx();
  const { current: userStreak, loading } = useStreak(address, chain);

  return (
    <div className="min-h-screen">
      <WalletBar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-10">
          <div className="text-xs font-mono text-white/30 tracking-widest uppercase mb-3">Loot &amp; spoils</div>
          <h1 className="font-display font-800 text-4xl text-white mb-2">Market</h1>
          <p className="text-white/40">Items earned through streaks and raids. Streak-gated — the longer you survive, the more you can buy.</p>
        </div>

        {/* Connect banner */}
        {!address && (
          <div
            className="card p-5 mb-6 flex items-center gap-4"
            style={{ borderColor: "rgba(255,184,0,0.2)", background: "linear-gradient(135deg, rgba(255,184,0,0.04), var(--surface))" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: "rgba(255,184,0,0.12)", border: "1px solid rgba(255,184,0,0.3)" }}
            >
              <Wallet className="w-5 h-5" style={{ color: "var(--gold)" }} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white text-sm mb-0.5">Connect your wallet</div>
              <div className="text-xs text-white/40">Connect to see your streak and unlock items you've earned.</div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={connectCelo}
                className="btn btn-secondary text-xs py-1.5 px-3"
                style={{ color: "var(--green)", borderColor: "rgba(0,204,102,0.25)", background: "rgba(0,204,102,0.06)" }}
              >
                Celo
              </button>
              <button
                onClick={connectStellar}
                className="btn btn-secondary text-xs py-1.5 px-3"
                style={{ color: "var(--blue)", borderColor: "rgba(51,153,255,0.25)", background: "rgba(51,153,255,0.06)" }}
              >
                Stellar
              </button>
            </div>
          </div>
        )}

        {/* Streak status bar */}
        {address && (
          <div
            className="flex items-center gap-3 mb-6 p-3 rounded-lg"
            style={{ background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)" }}
          >
            <span className="fire-flicker">🔥</span>
            {loading ? (
              <span className="text-sm text-white/40 font-mono">Loading streak…</span>
            ) : (
              <span className="text-sm text-white/70">
                Your streak:{" "}
                <span className="font-semibold text-white">{userStreak} day{userStreak !== 1 ? "s" : ""}</span>
                {" "}—{" "}
                {ITEMS.filter(i => i.streak <= userStreak).length} item{ITEMS.filter(i => i.streak <= userStreak).length !== 1 ? "s" : ""} unlocked
              </span>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ITEMS.map(item => {
            const r      = RARITY[item.rarity];
            const locked = !address || item.streak > userStreak;
            return (
              <div
                key={item.id}
                className={clsx("card p-5 transition-all", !locked && "hover:border-white/20", locked && "opacity-60")}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: r.bg }}
                  >
                    {locked ? "🔒" : item.emoji}
                  </div>
                  <span className="badge text-xs" style={{ background: r.bg, color: r.text }}>{item.rarity}</span>
                </div>
                <h3 className="font-semibold text-white mb-0.5">{item.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-white/30">{item.type}</span>
                  <span className="text-white/20">·</span>
                  <span
                    className="text-xs"
                    style={{ color: item.chain === "celo" ? "var(--green)" : item.chain === "stellar" ? "var(--blue)" : "var(--gold)" }}
                  >
                    {item.chain === "both" ? "all chains" : item.chain}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 mb-3 p-2 rounded-lg"
                  style={{ background: "var(--surface2)" }}
                >
                  <span className="fire-flicker text-xs">🔥</span>
                  <span className="text-xs font-mono text-white/50">Requires</span>
                  <span
                    className="text-xs font-mono font-600"
                    style={{ color: locked ? "var(--red)" : "var(--gold)" }}
                  >
                    {item.streak} day streak
                  </span>
                  {locked && <Lock className="w-3 h-3 text-red-400 ml-auto" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-600 text-sm text-white">{item.price}</span>
                  <button
                    disabled={locked}
                    className={clsx("btn text-xs py-1.5 px-3", locked ? "btn-secondary opacity-40 cursor-not-allowed" : "btn-primary")}
                  >
                    {!address
                      ? "Connect"
                      : locked
                        ? `${item.streak - userStreak}d away`
                        : "Buy"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
