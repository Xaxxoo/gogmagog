"use client";
import WalletBar from "@/components/WalletBar";

const LISTINGS = [
  { id:1, name:"Wolfsbane Axe",     type:"Weapon",    rarity:"Rare",    price:"2.4 CELO",  chain:"celo",    streak:14 },
  { id:2, name:"Iron Parapet",      type:"Structure", rarity:"Common",  price:"0.8 CELO",  chain:"celo",    streak:5  },
  { id:3, name:"Deep Well",         type:"Structure", rarity:"Uncommon",price:"3.2 XLM",   chain:"stellar", streak:10 },
  { id:4, name:"Bone Shield",       type:"Armor",     rarity:"Rare",    price:"1.5 XLM",   chain:"stellar", streak:7  },
  { id:5, name:"Blood Banner",      type:"Cosmetic",  rarity:"Epic",    price:"5.0 CELO",  chain:"both",    streak:21 },
  { id:6, name:"Ember Torch",       type:"Cosmetic",  rarity:"Common",  price:"0.3 XLM",   chain:"stellar", streak:3  },
];

const RARITY_COLORS: Record<string,string> = {
  Common:"text-bone-400 bg-ash-700/40",
  Uncommon:"text-moss-400 bg-moss-900/20",
  Rare:"text-blue-400 bg-blue-900/20",
  Epic:"text-ember-400 bg-ember-900/20",
};

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-ash-950 noise">
      <WalletBar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <p className="font-mono text-xs text-ember-600 tracking-widest uppercase mb-2">On-chain loot</p>
        <h1 className="font-display text-4xl text-bone-200 mb-2">Spoils of War</h1>
        <p className="text-sm text-bone-500 mb-8">Items earned through streaks, raids, and survival. All tradeable on-chain.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LISTINGS.map(item => (
            <div key={item.id}
              className="bg-ash-800/60 rounded-lg border border-ash-600/30 p-5 hover:border-ember-800/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded border border-ash-600/30 bg-ash-700/50 flex items-center justify-center text-xl">
                  {item.type === "Weapon" ? "⚔" : item.type === "Structure" ? "🏰" : item.type === "Armor" ? "🛡" : "🔥"}
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${RARITY_COLORS[item.rarity]}`}>
                  {item.rarity}
                </span>
              </div>
              <h3 className="font-body text-sm text-bone-200 mb-1">{item.name}</h3>
              <p className="text-[11px] font-mono text-bone-500 mb-3">{item.type} · {item.chain === "both" ? "All chains" : item.chain}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-bone-500">Requires streak</div>
                  <div className="text-xs font-mono text-ember-400">{item.streak}+ days</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-bone-500">Price</div>
                  <div className="text-sm font-mono text-bone-200">{item.price}</div>
                </div>
              </div>
              <button className="mt-4 w-full py-2 text-xs font-mono border border-ash-600/40 text-bone-400 rounded hover:border-ember-700/40 hover:text-ember-400 transition-all">
                Buy →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
