"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import WalletBar from "@/components/WalletBar";
import GameScene from "@/components/GameScene";
import { Shield, Users, Zap, Flame, ArrowRight } from "lucide-react";

/* ─── Animated counter ───────────────────────────────────────── */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const dur = 1200;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            setVal(Math.round(ease * to));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Step card ──────────────────────────────────────────────── */
function Step({
  num,
  icon: Icon,
  colorHex,
  title,
  body,
}: {
  num: string;
  icon: any;
  colorHex: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative group">
      {/* giant step number — decorative bg text */}
      <div
        className="absolute -top-5 -left-2 font-display font-800 leading-none select-none pointer-events-none z-0"
        style={{
          fontSize: "clamp(80px, 10vw, 120px)",
          color: `${colorHex}09`,
          lineHeight: 1,
        }}
      >
        {num}
      </div>

      <div
        className="relative z-10 p-6 rounded-2xl border transition-all duration-300 group-hover:border-opacity-60"
        style={{
          background: `linear-gradient(135deg, ${colorHex}08 0%, transparent 60%), var(--surface)`,
          border: `1px solid ${colorHex}22`,
          boxShadow: `0 0 0 0 ${colorHex}00`,
          transition: "box-shadow 0.3s, border-color 0.3s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 32px ${colorHex}12`;
          (e.currentTarget as HTMLDivElement).style.borderColor = `${colorHex}45`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${colorHex}00`;
          (e.currentTarget as HTMLDivElement).style.borderColor = `${colorHex}22`;
        }}
      >
        {/* top strip */}
        <div
          className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${colorHex}55, transparent)` }}
        />

        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `${colorHex}16`,
            border: `1px solid ${colorHex}35`,
            boxShadow: `0 0 14px ${colorHex}20`,
          }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: colorHex, filter: `drop-shadow(0 0 4px ${colorHex}80)` }}
          />
        </div>

        <h3 className="font-display font-700 text-white text-lg mb-2">{title}</h3>
        <p className="text-sm text-white/45 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

/* ─── Chain pill ─────────────────────────────────────────────── */
function ChainCard({
  name,
  sub,
  colorHex,
  desc,
  wallet,
}: {
  name: string;
  sub: string;
  colorHex: string;
  desc: string;
  wallet: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden group cursor-default"
      style={{
        background: `linear-gradient(135deg, ${colorHex}0c 0%, transparent 55%), var(--surface)`,
        border: `1px solid ${colorHex}28`,
      }}
    >
      {/* hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 110%, ${colorHex}14 0%, transparent 65%)`,
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${colorHex}60, transparent)` }}
      />

      <div className="relative">
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ background: colorHex, boxShadow: `0 0 10px ${colorHex}` }}
          />
          <span className="font-display font-700 text-white text-lg">{name}</span>
          <span
            className="font-mono text-xs px-2 py-0.5 rounded-md"
            style={{
              background: `${colorHex}14`,
              border: `1px solid ${colorHex}28`,
              color: `${colorHex}CC`,
            }}
          >
            {sub}
          </span>
        </div>
        <p className="text-sm text-white/40 leading-relaxed mb-4">{desc}</p>
        <div
          className="text-xs font-mono font-medium"
          style={{ color: `${colorHex}99` }}
        >
          Wallet: {wallet}
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function Home() {
  const [secs, setSecs] = useState(6 * 3600 + 23 * 60 + 11);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 86400)), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const p2 = (n: number) => String(n).padStart(2, "0");
  const urgency = secs < 3600;

  const TICKER_ITEMS = [
    "🔥 vitalik.eth — 42 day streak",
    "⚔️ merlin.xlm raided anon7331 — 18 damage",
    "🏆 siege.eth reached 30 day milestone — Wall of Gog title earned",
    "💀 cryptoking — base destroyed after 3 days offline",
    "🤖 Ironwall Agent defended 0xbuilder's base overnight",
    "🐀 Magog horde breached the northern wall — Block 21,049,312",
    "🔥 builder.celo — 19 day streak — Walls at 88%",
    "⚔️ shaderunner.xlm launched midnight raid — +120 resources",
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <WalletBar />

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative pt-14">
        {/* Scene */}
        <div className="relative">
          <GameScene wallHealth={19} waterLevel={38} foodLevel={74} />

          {/* Multi-layer fade */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(6,6,9,0.15) 0%, transparent 25%, transparent 45%, rgba(6,6,9,0.75) 80%, var(--bg) 100%)",
            }}
          />

          {/* Side vignettes */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, var(--bg) 0%, transparent 12%, transparent 88%, var(--bg) 100%)",
            }}
          />
        </div>

        {/* Hero content — overlapping the scene */}
        <div
          className="relative -mt-56 z-10 text-center px-4"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s 0.1s" }}
        >
          {/* Decay pill */}
          <div className="flex justify-center mb-6">
            <div
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full font-mono text-sm font-medium"
              style={{
                background: urgency ? "rgba(255,51,51,0.18)" : "rgba(255,51,51,0.1)",
                border: "1px solid rgba(255,51,51,0.35)",
                color: "var(--red)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 0 30px rgba(255,51,51,0.18), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "var(--red)", boxShadow: "0 0 8px var(--red)" }}
              />
              Next decay in{" "}
              <span className="tabular-nums tracking-widest">
                {p2(h)}:{p2(m)}:{p2(s)}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1
            className="font-display font-800 tracking-tight leading-none mb-5"
            style={{ fontSize: "clamp(56px, 11vw, 128px)" }}
          >
            <span className="text-white">Gog </span>
            <span
              style={{
                background: "linear-gradient(135deg, #FF7777 0%, #FF3333 40%, #CC1111 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 30px rgba(255,51,51,0.45))",
              }}
            >
              &amp;
            </span>
            <span className="text-white"> Magog</span>
          </h1>

          <p
            className="font-medium text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Onchain survival. Sign daily or lose everything.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/game"
              className="btn btn-primary px-8 py-3.5 text-sm font-700"
            >
              Enter the game
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-to-play"
              className="btn btn-secondary px-8 py-3.5 text-sm"
            >
              How to play
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="mt-14 flex flex-col items-center gap-2 opacity-30">
            <div className="w-px h-8 bg-white/40 rounded" style={{ animation: "scrollPulse 2s ease-in-out infinite" }} />
            <span className="text-xs font-mono text-white/50 tracking-widest uppercase">Scroll</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          LIVE TICKER
      ══════════════════════════════════════════════════════════ */}
      <div className="mt-8 relative">
        {/* edge fades */}
        <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, var(--bg), transparent)" }} />
        <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, var(--bg), transparent)" }} />

        <div
          className="py-3 overflow-hidden"
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="ticker-wrap">
            <div className="ticker-inner animate-ticker">
              {Array(2)
                .fill(TICKER_ITEMS)
                .flat()
                .map((item, i) => (
                  <span key={i} className="text-xs font-mono text-white/30 tracking-wide">
                    {item}
                    <span className="mx-8 text-white/10">·</span>
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-6 mt-16 mb-20">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
            {[
              { value: 1204, suffix: "",  label: "Citadels alive",   sub: "across both chains", colorHex: "#3399FF" },
              { value: 42,   suffix: "",  label: "Day longest streak", sub: "vitalik.eth",       colorHex: "#FFB800" },
              { value: 387,  suffix: "",  label: "Agents deployed",  sub: "defending right now",  colorHex: "#00CC66" },
              { value: 0,    suffix: "",  label: "Until next decay",  sub: "sign before it hits", colorHex: "#FF3333", override: `${p2(h)}h ${p2(m)}m` },
            ].map((stat, i) => (
              <div
                key={i}
                className="py-6 px-6 text-center relative group"
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${stat.colorHex}60, transparent)` }}
                />
                <div
                  className="font-display font-800 text-3xl mb-1 tabular-nums"
                  style={{
                    color: stat.colorHex,
                    textShadow: `0 0 24px ${stat.colorHex}50`,
                  }}
                >
                  {stat.override ? (
                    <span>{stat.override}</span>
                  ) : (
                    <CountUp to={stat.value} suffix={stat.suffix} />
                  )}
                </div>
                <div className="text-xs font-semibold text-white/50">{stat.label}</div>
                <div className="text-xs text-white/20 font-mono mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          CORE LOOP — 4 STEPS
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-6 mb-24">
        <div className="mb-12">
          <div className="text-xs font-mono text-white/20 tracking-widest uppercase mb-4">
            How it works
          </div>
          <h2
            className="font-display font-800 leading-tight"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            <span className="text-white">Simple rules. </span>
            <span
              style={{
                background: "linear-gradient(90deg, #FF6666, #FF2222)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Brutal consequences.
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Step
            num="01"
            icon={Shield}
            colorHex="#FF3333"
            title="Defend your base"
            body="Your walls, water, and food decay by 8% every 24 hours. Sign one transaction daily to restore them and keep your citadel alive. Neglect kills."
          />
          <Step
            num="02"
            icon={Flame}
            colorHex="#FFB800"
            title="Build your streak"
            body="Every consecutive day you sign earns +1 streak. Streaks unlock rare loot, title NFTs, and leaderboard prestige. Miss one day — it resets to zero."
          />
          <Step
            num="03"
            icon={Zap}
            colorHex="#FF3333"
            title="Raid your neighbors"
            body="When enemy walls drop below 30%, you can raid. Steal resources, earn XP, and deal permanent damage. High-streak players strike harder."
          />
          <Step
            num="04"
            icon={Users}
            colorHex="#3399FF"
            title="Hire an agent"
            body="Can't log in? Deploy an autonomous agent — a smart contract authorized to sign on your behalf. Your streak survives. Your base holds. You sleep."
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DECAY THREAT — urgency section
      ══════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden mb-24"
        style={{
          borderTop: "1px solid rgba(255,51,51,0.12)",
          borderBottom: "1px solid rgba(255,51,51,0.12)",
        }}
      >
        {/* bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(255,51,51,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-5xl mx-auto px-6 py-16 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <div className="text-xs font-mono text-red-500/60 tracking-widest uppercase mb-4">
                The threat is real
              </div>
              <h2
                className="font-display font-800 text-white mb-5 leading-tight"
                style={{ fontSize: "clamp(24px, 3.5vw, 38px)" }}
              >
                Miss one day.<br />
                <span style={{ color: "var(--red)" }}>Lose everything.</span>
              </h2>
              <p className="text-white/45 text-sm leading-relaxed mb-6">
                Every 24 hours the Magog horde attacks. Walls crumble. Water dries. Food rots.
                Your streak resets. Raiders can walk in. One missed signature — that's all it takes.
              </p>
              <div className="flex items-center gap-3">
                <Link href="/game" className="btn btn-primary px-6 py-2.5 text-sm">
                  Defend now
                </Link>
                <Link href="/agents" className="btn btn-secondary px-6 py-2.5 text-sm">
                  Hire protection
                </Link>
              </div>
            </div>

            {/* Right: decay display */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--surface)",
                border: "1px solid rgba(255,51,51,0.18)",
                boxShadow: "0 0 40px rgba(255,51,51,0.06)",
              }}
            >
              <div className="text-xs font-mono text-white/30 uppercase tracking-widest mb-5">
                Without daily signing
              </div>
              <div className="space-y-4">
                {[
                  { label: "Walls",  from: 80, to: 19, color: "#3399FF" },
                  { label: "Water",  from: 90, to: 38, color: "#33AAFF" },
                  { label: "Food",   from: 95, to: 24, color: "#00CC66" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-mono text-white/50">{r.label}</span>
                      <span
                        className="font-mono font-600"
                        style={{ color: r.to < 30 ? "var(--red)" : "rgba(255,255,255,0.5)" }}
                      >
                        {r.to}%
                        {r.to < 30 && (
                          <span className="text-red-500/70 ml-1.5">⚠ critical</span>
                        )}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full relative overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      {/* "ghost" full bar */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-full opacity-10"
                        style={{ width: `${r.from}%`, background: r.color }}
                      />
                      {/* actual bar */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${r.to}%`,
                          background: r.to < 30
                            ? "linear-gradient(90deg, #CC0000, #FF3333)"
                            : `linear-gradient(90deg, ${r.color}99, ${r.color})`,
                          boxShadow: r.to < 30 ? "0 0 8px rgba(255,51,51,0.5)" : "none",
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div
                  className="mt-4 pt-4 flex items-center gap-2 text-xs font-mono"
                  style={{ borderTop: "1px solid rgba(255,51,51,0.12)", color: "var(--red)" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "var(--red)", flexShrink: 0 }}
                  />
                  3 days since last sign — raiders can attack now
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MULTI-CHAIN
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-6 mb-24">
        <div className="text-xs font-mono text-white/20 tracking-widest uppercase mb-4">
          Multi-chain
        </div>
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <h2
            className="font-display font-800 text-white leading-tight"
            style={{ fontSize: "clamp(24px, 3.5vw, 38px)" }}
          >
            One world.<br />Two chains.
          </h2>
          <p className="text-white/35 text-sm max-w-xs leading-relaxed">
            Both chains share the same leaderboard, same streaks, same horde. Agents work on both.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ChainCard
            name="Celo"
            sub="EVM · Chain 42220"
            colorHex="#00CC66"
            desc="Use MetaMask or any EVM-compatible wallet. Low fees, fast finality, and mobile-first design. Perfect for daily signing."
            wallet="MetaMask · Rainbow · Coinbase"
          />
          <ChainCard
            name="Stellar"
            sub="Soroban · Testnet"
            colorHex="#3399FF"
            desc="Use Freighter wallet. Soroban smart contracts power the agent authorization system with scoped keypair auth."
            wallet="Freighter · LOBSTR"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden mb-0 py-28">
        {/* Full-bleed bg glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(255,51,51,0.09) 0%, rgba(255,51,51,0.03) 40%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,51,51,0.4) 30%, rgba(255,184,0,0.3) 50%, rgba(255,51,51,0.4) 70%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
          }}
        />

        <div className="relative text-center px-6 max-w-3xl mx-auto">
          {/* kicker */}
          <div
            className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full text-xs font-mono font-medium"
            style={{
              background: "rgba(255,51,51,0.1)",
              border: "1px solid rgba(255,51,51,0.25)",
              color: "rgba(255,100,100,0.9)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--red)" }}
            />
            The horde is already at the gates
          </div>

          <h2
            className="font-display font-800 text-white leading-none tracking-tight mb-5"
            style={{ fontSize: "clamp(36px, 6vw, 72px)" }}
          >
            Your citadel<br />
            <span
              style={{
                background: "linear-gradient(135deg, #FF8888 0%, #FF3333 50%, #CC1111 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px rgba(255,51,51,0.35))",
              }}
            >
              awaits.
            </span>
          </h2>

          <p className="text-white/35 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            The horde never sleeps. Neither should you.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/game"
              className="btn btn-primary px-10 py-4 text-base font-700"
            >
              Enter the game
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/agents"
              className="btn btn-secondary px-10 py-4 text-base"
            >
              Hire an agent
            </Link>
          </div>
        </div>
      </section>

      {/* scroll pulse keyframe */}
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.2; transform: scaleY(0.6); }
          50% { opacity: 0.5; transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
