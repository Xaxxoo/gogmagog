"use client";
import WalletBar from "@/components/WalletBar";
import { Flame, Shield, Zap } from "lucide-react";
import clsx from "clsx";

const PLAYERS = [
  { rank:1,  address:"0xdEaD…C0de", name:"vitalik.eth",    streak:42, walls:98, chain:"celo",    raids:18 },
  { rank:2,  address:"0xBEEF…f00d", name:"merlin.xlm",     streak:38, walls:91, chain:"stellar", raids:9  },
  { rank:3,  address:"0xF00D…babe", name:"anon7331",        streak:31, walls:87, chain:"celo",    raids:24 },
  { rank:4,  address:"0xCAFE…1337", name:"siege.eth",       streak:29, walls:72, chain:"stellar", raids:11 },
  { rank:5,  address:"0x1337…dead", name:"0xbuilder",       streak:22, walls:65, chain:"celo",    raids:6  },
  { rank:6,  address:"0xABCD…5678", name:"nightwatch.xlm",  streak:19, walls:60, chain:"stellar", raids:3  },
  { rank:7,  address:"0x9999…0001", name:"cryptoking",      streak:15, walls:55, chain:"celo",    raids:7  },
  { rank:8,  address:"0x8888…0002", name:"stargazer.xlm",   streak:12, walls:48, chain:"stellar", raids:2  },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-ash-950 noise">
      <WalletBar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <p className="font-mono text-xs text-ember-600 tracking-widest uppercase mb-2">The long survivors</p>
        <h1 className="font-display text-4xl text-bone-200 mb-1">Wall of Flame</h1>
        <p className="text-sm text-bone-500 mb-10">Ranked by consecutive daily streak. Both chains, one leaderboard.</p>

        <div className="space-y-2">
          {PLAYERS.map((p) => (
            <div key={p.rank} className={clsx(
              "flex items-center gap-4 px-5 py-4 rounded-lg border transition-all",
              p.rank === 1 ? "border-ember-600/50 bg-ember-900/10" :
              p.rank === 2 ? "border-bone-400/20 bg-ash-800/40" :
              p.rank === 3 ? "border-ember-800/30 bg-ash-800/30" :
              "border-ash-600/20 bg-ash-800/20 hover:border-ash-500/30"
            )}>
              <div className={clsx("w-8 text-center font-display text-sm",
                p.rank === 1 ? "text-ember-400" : p.rank <= 3 ? "text-bone-400" : "text-bone-600"
              )}>
                {p.rank <= 3 ? ["I","II","III"][p.rank-1] : p.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-bone-200 truncate">{p.name}</div>
                <div className="font-mono text-xs text-bone-600">{p.address}</div>
              </div>
              <div className={clsx("px-2 py-0.5 rounded text-xs font-mono border",
                p.chain === "celo" ? "border-moss-700/40 text-moss-400" : "border-blue-700/40 text-blue-400"
              )}>{p.chain.toUpperCase()}</div>
              <div className="flex gap-5">
                <div className="text-right">
                  <div className="flex items-center gap-1"><Flame className="w-3 h-3 text-ember-500"/><span className="font-mono text-sm text-ember-400">{p.streak}</span></div>
                  <div className="font-mono text-xs text-bone-600">streak</div>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-bone-500"/><span className="font-mono text-sm text-bone-300">{p.walls}%</span></div>
                  <div className="font-mono text-xs text-bone-600">walls</div>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-blood-400"/><span className="font-mono text-sm text-blood-300">{p.raids}</span></div>
                  <div className="font-mono text-xs text-bone-600">raids</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="font-display text-sm text-bone-500 tracking-widest uppercase mb-4">Streak Milestones</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { days:7,   reward:"Iron Crest NFT",      color:"text-bone-400 border-bone-400/20" },
              { days:14,  reward:"Ember Blade NFT",     color:"text-ember-400 border-ember-700/30" },
              { days:30,  reward:"Wall of Gog title",   color:"text-moss-400 border-moss-700/30" },
              { days:100, reward:"Eternal Flame — rare",color:"text-ember-300 border-ember-500/40" },
            ].map(m => (
              <div key={m.days} className={`rounded-lg border bg-ash-800/30 p-4 ${m.color}`}>
                <div className="font-display text-2xl mb-1">{m.days}</div>
                <div className="font-mono text-xs text-bone-500 mb-1">day streak</div>
                <div className={`font-mono text-xs ${m.color.split(" ")[0]}`}>{m.reward}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
