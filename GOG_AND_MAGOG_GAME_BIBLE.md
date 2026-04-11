# Gog & Magog — Game Bible v1.0

> **Internal reference document.** This is the canonical source of truth for all game mechanics, rules, lore, economy, and design decisions. Any developer, designer, or AI assistant building on this codebase should treat this document as authoritative. When in doubt, refer here.

---

## Table of Contents

1. [Vision & Philosophy](#1-vision--philosophy)
2. [Lore & Setting](#2-lore--setting)
3. [Core Loop](#3-core-loop)
4. [Resources](#4-resources)
5. [Decay System](#5-decay-system)
6. [Player Actions](#6-player-actions)
7. [Streak System](#7-streak-system)
8. [Milestone Rewards](#8-milestone-rewards)
9. [Combat & Raiding](#9-combat--raiding)
10. [Agent System](#10-agent-system)
11. [XP & Leveling](#11-xp--leveling)
12. [Economy & Market](#12-economy--market)
13. [Leaderboard](#13-leaderboard)
14. [Chain Architecture](#14-chain-architecture)
15. [Smart Contract Spec](#15-smart-contract-spec)
16. [UI/UX Rules](#16-uiux-rules)
17. [Visual Identity](#17-visual-identity)
18. [Addictive Design Principles](#18-addictive-design-principles)
19. [Glossary](#19-glossary)
20. [Change Log](#20-change-log)

---

## 1. Vision & Philosophy

### Elevator Pitch
Gog & Magog is a fully onchain daily survival game. Players defend a citadel against a relentless horde of giant rodent attackers. The citadel decays 8% every 24 hours. To survive, a player must sign one blockchain transaction per day. Miss a day — the walls crumble. The horde moves in.

### Design Pillars

| Pillar | Description |
|--------|-------------|
| **Sign or Fall** | Every mechanic revolves around the single daily action. Nothing else matters if the player doesn't show up. |
| **Real Consequences** | Decay is permanent until reversed. Raids deal real damage. A destroyed base requires a full restart. The blockchain remembers everything. |
| **Earned Progress** | Milestones take real time. A 30-day streak took 30 real days. No shortcuts, no pay-to-win streak resets. |
| **Accessible Daily Commitment** | One transaction takes 5 seconds and costs less than $0.001 on Celo. The floor is low; the ceiling is deep. |
| **Dual-Chain Parity** | Celo (EVM) and Stellar (Soroban) are first-class citizens. Same rules, same leaderboard, different wallets. |

### What This Game Is NOT
- Not a graphics-heavy action game
- Not pay-to-win (agents cost money but cannot buy streak progress)
- Not a passive idle game (you must actively sign; agents are a safety net, not the primary experience)
- Not a DeFi game with complex tokenomics — the economy is simple on purpose

---

## 2. Lore & Setting

### The World
The world of Gog & Magog is a post-collapse wasteland. Civilization has fragmented into isolated citadels — walled settlements each controlled by a single player. The land between citadels is barren, lawless, and crawling with two ancient enemy forces: **Gog** and **Magog**.

### The Horde: Gog & Magog
Gog and Magog are not armies of men. They are two vast, primordial tribes of giant war-rodents — enormous rats, field creatures, and burrowing beasts with massive ears, glowing red eyes, crude bone weapons, and savage intelligence. They have stalked the wasteland since the collapse.

**Gog** — The eastern horde. Larger, slower, more organized. Led by a war-chief wearing a crude crown. They carry scythes, clubs, and bone spears. They attack in coordinated waves and target the weakest walls first.

**Magog** — The western horde. Smaller, faster, more numerous. They swarm through breaches in walls. They prioritize food and water stores over structural damage.

Both hordes are attracted to citadels with weakened defenses. A citadel with walls below 30% will be targeted within hours. A citadel that falls completely may be claimed as a Gog or Magog nest — stripping it of all resources permanently until the player re-initializes.

### The Citadel
Each player controls a single citadel. The citadel has:
- Stone walls (structural integrity)
- A water cistern
- A food storage vault
- A watchtower
- A command post (where the player character lives)
- A main gate (the breach point)

The visual design should convey age, wear, and the constant battle against entropy. Torches flicker. Walls crack. Rubble accumulates near breach points.

### Player Character
The player is an unnamed Citadel Lord — a survivor who has claimed this ruin and fortified it. The character wears patchwork armor and is visible in the game scene near the command post door. No backstory is provided — the player projects themselves onto the character.

---

## 3. Core Loop

```
┌─────────────────────────────────────────────────────┐
│                   THE DAILY LOOP                    │
│                                                     │
│  [Player opens game]                                │
│         │                                           │
│         ▼                                           │
│  [Check decay timer — is it still safe?]           │
│         │                                           │
│    Yes  │  No (decay hit)                           │
│         │    └──► Resources dropped 8%             │
│         ▼                                           │
│  [Sign tendBase() transaction]                     │
│         │                                           │
│         ▼                                           │
│  Resources +15% · Streak +1 · XP +50              │
│         │                                           │
│         ▼                                           │
│  [Optional: Scavenge / Reinforce / Raid]           │
│         │                                           │
│         ▼                                           │
│  [Check leaderboard / milestone progress]          │
│         │                                           │
│         ▼                                           │
│  [Close game — come back tomorrow]                 │
└─────────────────────────────────────────────────────┘
```

### Session Design
- **Minimum session:** 30 seconds — connect wallet, tap Tend Base, done.
- **Average session:** 3–5 minutes — tend base, check threats, maybe raid, check leaderboard.
- **Deep session:** 10–15 minutes — manage resources, configure agent, browse market, read chain log.

The game must reward the 30-second session just as much as the 15-minute one. The daily transaction is the core KPI — everything else is enrichment.

---

## 4. Resources

Each citadel has three resources. All start at 80 on initialization. All are measured as integers 0–100.

### Walls (Structural Integrity)
- Represents the physical strength of the citadel's perimeter
- **Decay rate:** −8% per day
- **Tend restore:** +15 per tend
- **Reinforce action:** +30 per use
- **Combat loss:** raiders deal damage directly to walls
- **Critical threshold:** below 30 = vulnerable to raids
- **Destroyed threshold:** 0 = walls breached, citadel in ruin state
- **Color:** Blue in UI

### Water (Cistern Level)
- Represents potable water reserves
- **Decay rate:** −8% per day
- **Tend restore:** +15 per tend
- **Scavenge restore:** +12 per scavenge
- **Critical threshold:** below 20 = resource starvation flag (future mechanic: speed penalties)
- **Destroyed threshold:** 0 = starvation begins (future mechanic)
- **Color:** Blue in UI

### Food (Vault Level)
- Represents stored rations and foraged food
- **Decay rate:** −8% per day
- **Tend restore:** +15 per tend
- **Scavenge restore:** +22 per scavenge
- **Critical threshold:** below 20 = resource starvation flag
- **Destroyed threshold:** 0 = starvation begins (future mechanic)
- **Color:** Green in UI

### Resource State Reference

| Level | Status | Color | UI Behavior |
|-------|--------|-------|-------------|
| 61–100 | Healthy | Green | Normal display |
| 31–60 | Depleted | Yellow/Amber | Warning badge |
| 11–30 | Critical | Red | Danger pulse border, red alert badge |
| 0–10 | Emergency | Red | Flashing, animated warning |
| 0 | Destroyed | Black | Special "ruin" state |

---

## 5. Decay System

### Decay Trigger
Decay is **not automatic on a clock**. It is calculated **lazily** — whenever any transaction is processed on the contract, the contract computes how many full decay intervals have elapsed since the last decay event and applies them all at once.

**Celo:** Decay interval = 86,400 seconds (24 hours)
**Stellar:** Decay interval = 17,280 ledgers (approximately 24 hours at 5 seconds/ledger)

### Decay Formula
```
intervals_elapsed = floor((current_time - last_decay_time) / DECAY_INTERVAL)
total_decay = intervals_elapsed × 8

new_walls = max(0, walls - total_decay)
new_water = max(0, water - total_decay)
new_food  = max(0, food  - total_decay)
last_decay_time += intervals_elapsed × DECAY_INTERVAL
```

### Grace Period (Streak Preservation)
A player's streak is not broken if they tend within a **48-hour window** from their last tend. This exists to account for timezone differences and brief unavailability. However, the **resources still decay** if the 24-hour interval passes — the grace period only prevents the streak counter from resetting.

```
streak_breaks_if: current_time - last_tend_time > 48 hours
resources_decay_if: current_time - last_decay_time > 24 hours
```

These are independent checks.

### Ruin State
If **all three resources hit 0**, the citadel enters Ruin State:
- No actions can be performed except `initBase()` (restart)
- The citadel is flagged as ruined onchain
- Other players can loot a ruined citadel for a one-time small resource gain
- Streak resets to 0 on restart
- Resources reset to 80 on restart
- XP and level are **preserved** across restarts (penalty is streak loss, not XP loss)

---

## 6. Player Actions

### Primary Action — Tend Base

| Property | Value |
|----------|-------|
| Contract function | `tendBase()` |
| Daily requirement | Yes — must be called at least once per 24-hour window |
| Streak effect | +1 if within grace window; reset to 1 if outside |
| Resource effect | Walls +15, Water +15, Food +15 (capped at 100) |
| XP reward | +50 |
| Cost | Gas only (~$0.001 on Celo, ~0.00001 XLM on Stellar) |
| Cooldown | None — can be called multiple times per day, but only the first call increments streak |
| Agent-callable | Yes (SCOPE_TEND) |

**Important:** Calling `tendBase()` multiple times in one day is valid but wasteful — only the first call in each 24-hour window increments the streak. Subsequent calls still restore resources.

### Secondary Action — Scavenge

| Property | Value |
|----------|-------|
| Contract function | `scavenge()` |
| Daily requirement | No |
| Streak effect | None |
| Resource effect | Food +22, Water +12 |
| XP reward | +20 |
| Cost | Gas only |
| Cooldown | None |
| Agent-callable | Yes (SCOPE_SCAVENGE) |

### Secondary Action — Reinforce Walls

| Property | Value |
|----------|-------|
| Contract function | `reinforceWalls()` |
| Daily requirement | No |
| Streak effect | None |
| Resource effect | Walls +30 |
| XP reward | +30 |
| Cost | Gas only |
| Cooldown | None |
| Agent-callable | Yes (SCOPE_REINFORCE) |

### Combat Action — Raid Base

| Property | Value |
|----------|-------|
| Contract function | `raidBase(address target)` |
| Daily requirement | No |
| Streak effect | None |
| Attacker wall requirement | Attacker walls must be > 20 |
| Target wall requirement | Target walls must be ≤ 30 (vulnerability threshold) |
| Damage dealt | `min(5 + attacker_streak, 25)` to target walls |
| Self-damage | −3 to attacker walls per raid |
| XP reward | +35 if successful, +10 if failed |
| Cost | Gas only |
| Cooldown | 1 raid per target per 6 hours |
| Agent-callable | Yes (SCOPE_RAID) — only Warrior and Guardian agents |
| Self-raid | Not allowed (contract enforced) |

**Raid damage scale:**

| Streak | Damage |
|--------|--------|
| 0–5 | 5–10 |
| 10 | 15 |
| 20 | 25 (cap) |
| 30+ | 25 (cap) |

### Admin Action — Initialize Base

| Property | Value |
|----------|-------|
| Contract function | `initBase()` |
| When callable | Only once, or after Ruin State |
| Effect | Sets walls/water/food to 80, starts decay timer |
| Cost | Gas only |
| Agent-callable | No — must be called by player |

---

## 7. Streak System

### Definition
A **streak** is the count of consecutive 24-hour periods in which the player called `tendBase()`. The streak is stored onchain as an integer and is the primary measure of player commitment.

### Streak Rules

1. **Increment:** Calling `tendBase()` within 48 hours of the last tend increments streak by 1.
2. **Reset:** Calling `tendBase()` more than 48 hours after the last tend resets streak to 1 (not 0 — the current tend counts).
3. **Ruin Reset:** Calling `initBase()` after Ruin State resets streak to 0.
4. **Longest Streak:** A separate `longestStreak` counter tracks the player's all-time best and never decreases.
5. **Agent Streaks:** Streaks maintained by agents count fully. There is no distinction between player-signed and agent-signed tends in the streak counter.

### Streak Display
- Show current streak prominently with a fire emoji 🔥
- Show longest streak in profile/stats view
- On the leaderboard, rank by current streak (not longest)
- Use a real-time animated fire effect for streaks above 7 days

### Streak Loss UX
When a streak breaks, the UI should:
- Show a full-screen "Streak Lost" notification on next login
- Display the streak count that was lost (e.g. "Your 23-day streak is gone")
- Show what milestone was closest (e.g. "You were 7 days from the Wall of Gog title")
- Offer a one-click path to hire an agent immediately
- Do NOT punish excessively — the streak loss is enough

---

## 8. Milestone Rewards

Milestones are NFTs or onchain titles minted automatically when the player's streak crosses a threshold. They are **non-transferable** (soulbound) unless otherwise noted.

| Day | Name | Type | Transferable | Description |
|-----|------|------|-------------|-------------|
| 1 | First Brick | Badge | No | Participation trophy — first tend |
| 7 | Iron Crest | NFT | No | Cosmetic shield crest for your citadel |
| 14 | Ember Blade | NFT | No | Cosmetic weapon for player character |
| 30 | Wall of Gog | Title | No | Onchain title displayed on leaderboard |
| 60 | The Unbroken | NFT | Yes | Rare cosmetic — tradeable |
| 100 | Eternal Flame | NFT | Yes | Legendary — only the most disciplined hold this |

### Milestone Rules
1. Milestones are minted automatically by the contract when the streak threshold is crossed during `tendBase()`.
2. If a player loses their streak and rebuilds to the same threshold, they do **not** re-earn the milestone — it is a one-time award per threshold, per wallet.
3. Milestones are visible on the player's profile and leaderboard row.
4. Transferable milestones (60d, 100d) can be listed on the market.

### Future Milestones (Planned)
- Day 200: Siege Eternal (Legendary, transferable)
- Day 365: Citadel Immortal (Legendary, 1-of-1 per year)

---

## 9. Combat & Raiding

### Philosophy
Raiding is optional but rewarding. It is a prestige mechanic — high-streak players are more powerful raiders. It is not required to win the game, but it accelerates resource collection and is fun. It should never be so powerful that it ruins new players' experiences.

### Raid Prerequisites
**Attacker must:**
- Have walls > 20
- Not be in Ruin State
- Not have raided this specific target in the past 6 hours

**Target must:**
- Have walls ≤ 30 (vulnerability threshold)
- Be initialized (not in pre-game state)

### Raid Outcome Calculation

```
damage_to_target = min(5 + attacker.streak, 25)
damage_to_attacker = 3
attacker.walls -= damage_to_attacker
target.walls -= damage_to_target

if target.walls <= 0:
  emit BaseDestroyed(target)
  target enters Ruin State
```

No resource theft occurs in v1 (walls are damaged, but food/water are not stolen). This simplifies the contract and focuses the experience on wall combat. Resource theft may be added in v2.

### Raid Notifications
When a player's base is raided, the attack is logged onchain. On the player's next login, the UI should:
- Show a "You Were Raided" notification
- Show who attacked, how much damage was dealt, and what the current wall level is
- Offer immediate action buttons: Reinforce Walls, Tend Base, or Hire Agent

### Anti-Grief Rules
1. A player cannot be raided more than **3 times per 24 hours** by different attackers.
2. A player cannot be raided while in the first **48 hours** after `initBase()` (spawn protection).
3. Raiding a Ruin State citadel is allowed but yields minimal reward.

---

## 10. Agent System

### What Is an Agent?
An agent is an **authorized account** — either an EVM EOA (Celo) or a Stellar keypair (Soroban) — that has been granted limited permission to sign specific contract functions on behalf of the player.

Agents **cannot**:
- Transfer the player's tokens or currency
- Call `initBase()` (restarts require explicit player consent)
- Claim milestone NFTs (player must claim manually — future mechanic)
- Change agent configuration

Agents **can** (depending on scope):
- Call `tendBase()`
- Call `scavenge()`
- Call `reinforceWalls()`
- Call `raidBase()` (Warrior / Guardian tiers only)

### Scope Bitmask

| Bit | Constant | Value | Action |
|-----|----------|-------|--------|
| 0 | SCOPE_TEND | 0x01 | tendBase() |
| 1 | SCOPE_SCAVENGE | 0x02 | scavenge() |
| 2 | SCOPE_REINFORCE | 0x04 | reinforceWalls() |
| 3 | SCOPE_RAID | 0x08 | raidBase() |
| — | SCOPE_ALL | 0x0F | All of the above |

### Agent Tiers

#### Scout
| Property | Value |
|----------|-------|
| Scope | SCOPE_TEND only |
| Chains | Celo + Stellar |
| Daily fee | 0.01 CELO / 0.5 XLM |
| Behavior | Calls tendBase() once per day, earliest possible |
| Raids | Never |
| Best for | Maintaining streak during short absences |

#### Warrior
| Property | Value |
|----------|-------|
| Scope | SCOPE_TEND + SCOPE_SCAVENGE + SCOPE_RAID |
| Chains | Celo only |
| Daily fee | 0.05 CELO |
| Behavior | Tends base, scavenges if food/water < 50%, raids neighbors if their walls < 25% |
| Raids | Yes — opportunistically |
| Best for | Active competitive players who travel |

#### Builder
| Property | Value |
|----------|-------|
| Scope | SCOPE_TEND + SCOPE_SCAVENGE + SCOPE_REINFORCE |
| Chains | Stellar only |
| Daily fee | 1.0 XLM |
| Behavior | Tends base, reinforces walls if walls < 60%, scavenges if food < 40% |
| Raids | Never |
| Best for | Defense-first Stellar players |

#### Guardian
| Property | Value |
|----------|-------|
| Scope | SCOPE_ALL |
| Chains | Celo + Stellar |
| Daily fee | 0.12 CELO + 2 XLM |
| Behavior | Full autonomy — tends, reinforces, scavenges, raids based on priority config |
| Raids | Yes — configurable aggression |
| Best for | Long absences, dual-chain players, serious competitors |

### Agent Priority Config
When hiring an agent, the player configures:

```
priority: "BALANCED" | "WALLS" | "FOOD" | "WATER"
aggression: 0 (passive) | 1 (defensive) | 2 (opportunistic) | 3 (aggressive)
duration: 7 | 14 | 30 | INDEFINITE
```

Priority determines which resource the agent prioritizes spending extra actions on (scavenge vs reinforce). Aggression determines how often and under what conditions the agent raids.

### Agent Dismissal
The player calls `dismissAgent()` (or `dismiss_agent()` on Stellar) at any time. Unused prepaid fees beyond the current day are refunded. The agent account is immediately deauthorized.

### Agent Payment Flow (Celo)
1. Player calls `hireAgent(agentAddress, scopeMask, durationDays)` with `value = AGENT_FEE_MIN * durationDays`
2. Contract stores fee in `protocolFeeBalance`
3. 90% goes to protocol treasury; 10% is effectively burned (sent to zero address on dismissal)
4. If agent is dismissed early, unused portion (prorated) is returned to player — **this feature is in v2**

### Agent Payment Flow (Stellar)
1. Player calls `hire_agent(player, agent_pubkey, scope_mask, duration_ledgers)` with attached XLM payment
2. Contract stores config and duration onchain
3. Agent keypair is authorized for specified functions until `expires_ledger`

---

## 11. XP & Leveling

XP is an **onchain counter** that persists through Ruin State restarts. It is a permanent measure of total activity, not current standing.

### XP Sources

| Action | XP Gained |
|--------|-----------|
| First tend (initBase + first tendBase) | +100 (bonus) |
| tendBase() | +50 |
| scavenge() | +20 |
| reinforceWalls() | +30 |
| raidBase() — successful | +35 |
| raidBase() — failed | +10 |
| Milestone unlocked (7d) | +200 |
| Milestone unlocked (14d) | +400 |
| Milestone unlocked (30d) | +1000 |
| Milestone unlocked (60d) | +2500 |
| Milestone unlocked (100d) | +5000 |

### Level Thresholds
Level is derived from total XP. The formula scales with a simple linear-then-accelerating curve:

| Level | XP Required | Title |
|-------|-------------|-------|
| 1 | 0 | Settler |
| 2 | 100 | Fortifier |
| 3 | 300 | Warden |
| 4 | 700 | Defender |
| 5 | 1,500 | Citadel Lord |
| 6 | 3,000 | Wall Marshal |
| 7 | 6,000 | Iron Sovereign |
| 8 | 12,000 | Gog Slayer |
| 9 | 25,000 | Eternal Keeper |
| 10 | 50,000 | The Unbroken |

Level titles are displayed on the leaderboard and player profile. They are derived from XP (not streak) and represent long-term total engagement.

---

## 12. Economy & Market

### Design Principle
The market is a **prestige layer**, not a pay-to-win system. Items cannot be bought to skip streak requirements. They can only be bought once the streak is earned. Items are cosmetic (in v1) or structural (in v2).

### Item Categories

| Category | Description | Streak-gated? | Tradeable? |
|----------|-------------|--------------|------------|
| Cosmetic | Visual items — banners, crests, torch skins, wall textures | Yes | v2 |
| Weapon | Player character weapon skins | Yes | No |
| Structure | Citadel structural upgrades — wells, parapets, towers | Yes | No |
| Artifact | Rare gameplay items earned through long streaks or raids | Yes | Yes (milestone milestones only) |

### Streak Gating
Every market item has a minimum streak requirement. Players can view all items but cannot purchase until the requirement is met. Locked items show "X days away" to create aspiration.

### Pricing (v1 — fixed prices)
All prices are in the native chain token. There is no in-game token in v1.

| Item | Streak | Price (Celo) | Price (Stellar) |
|------|--------|-------------|-----------------|
| Iron Crest | 7 | 0.8 CELO | 8 XLM |
| Ember Torch | 3 | — | 0.3 XLM |
| Bone Parapet | 5 | — | 0.6 XLM |
| Deep Well | 10 | — | 3.2 XLM |
| Wolfsbane Axe | 14 | 2.4 CELO | — |
| Blood Banner | 21 | 5.0 CELO | 50 XLM |
| Soroban Relic | 60 | — | 12.0 XLM |
| Raid Trophy | 20 | 3.5 CELO | — |

### Protocol Revenue
- 5% of all market transactions go to the protocol treasury
- 90% of agent fees go to the protocol treasury
- Treasury is controlled by the deployer address (multisig in production)

---

## 13. Leaderboard

### Primary Sort: Current Streak
The leaderboard ranks players by **current active streak**, not longest streak. This means a player with a 100-day longest streak but who restarted 3 days ago ranks below a player with a 10-day current streak.

This is intentional: it rewards consistency *right now*, not historical achievement. It keeps the leaderboard dynamic.

### Secondary Sort: Walls
When two players have equal streak, they are sorted by current wall percentage (higher = better).

### Tertiary Sort: Total XP
When walls are also equal, sort by total XP.

### Leaderboard Data Points Per Player

```
rank          integer
player_name   ENS name (Celo) or Stellar friendly name, fallback to truncated address
streak        current streak (days)
longest       longest streak ever
walls         current wall % 
chain         "celo" | "stellar"
level         1–10
raids_won     total successful raids
agent_active  boolean — is an agent currently deployed?
```

### Leaderboard Refresh
- Refreshed every block (Celo: ~5 seconds, Stellar: ~5 seconds)
- Cached in frontend for 30 seconds to reduce RPC calls
- Historical snapshots stored offchain every 24 hours for analytics

---

## 14. Chain Architecture

### Celo (EVM)

| Property | Value |
|----------|-------|
| Chain name | Celo Mainnet / Celo Alfajores (testnet) |
| Chain ID | 42220 (mainnet) / 44787 (testnet) |
| RPC | https://forno.celo.org (mainnet) / https://alfajores-forno.celo-testnet.org |
| Native token | CELO |
| Block time | ~5 seconds |
| Wallet support | MetaMask, Rabby, Valora, WalletConnect |
| Contract language | Solidity ^0.8.24 |
| Dependency | OpenZeppelin (Ownable, ReentrancyGuard) |
| Agent type | EOA with scope bitmask |
| Time unit for decay | Unix seconds (block.timestamp) |

### Stellar (Soroban)

| Property | Value |
|----------|-------|
| Network | Stellar Mainnet / Testnet |
| Passphrase (mainnet) | "Public Global Stellar Network ; September 2015" |
| Passphrase (testnet) | "Test SDF Network ; September 2015" |
| RPC | https://soroban-testnet.stellar.org (testnet) |
| Native token | XLM |
| Block time | ~5 seconds (per ledger) |
| Wallet support | Freighter |
| Contract language | Rust (soroban-sdk v21) |
| Agent type | Authorized keypair via `hire_agent()` |
| Time unit for decay | Ledger sequence numbers (17,280 ledgers ≈ 24 hours) |

### Cross-Chain Identity
Players have **separate citadels** on each chain. They are linked by ENS name (Celo) or Stellar Federation address. The global leaderboard aggregates both. There is no cross-chain resource bridge in v1.

### Why Both Chains?
- **Celo** — EVM compatibility, low fees, mobile-first design, large developer ecosystem
- **Stellar Soroban** — Stellar's smart contract platform grants, unique keypair auth model, good for demonstrating Soroban agent authorization pattern, different grant pool

Both chains have active grant programs and gaming initiatives. Building on both maximizes ecosystem visibility and funding opportunities.

---

## 15. Smart Contract Spec

### Celo — `GogAndMagog.sol`

#### Constants
```solidity
uint256 DECAY_INTERVAL   = 24 hours
uint256 DECAY_AMOUNT     = 8           // percent
uint256 MAX_RESOURCE     = 100
uint256 TEND_RESTORE     = 15
uint256 SCAVENGE_FOOD    = 22
uint256 SCAVENGE_WATER   = 12
uint256 REINFORCE_WALLS  = 30
uint256 AGENT_FEE_MIN    = 0.01 ether  // per day
uint8   SCOPE_TEND       = 0x01
uint8   SCOPE_SCAVENGE   = 0x02
uint8   SCOPE_REINFORCE  = 0x04
uint8   SCOPE_RAID       = 0x08
uint8   SCOPE_ALL        = 0x0F
```

#### Storage Structs
```solidity
struct Base {
  uint32  walls;
  uint32  water;
  uint32  food;
  uint64  lastTend;
  uint64  lastDecay;
  uint32  streak;
  uint32  longestStreak;
  bool    initialized;
}

struct Agent {
  address agentAddress;
  uint8   scopeMask;
  uint64  expiresAt;
  bool    active;
}
```

#### Key Mappings
```solidity
mapping(address => Base)    public bases;
mapping(address => Agent)   public agents;    // player → agent config
mapping(address => address) public agentOf;   // agentAddress → player
```

#### External Functions

| Function | Caller | Description |
|----------|--------|-------------|
| `initBase()` | Player only | Initialize citadel at 80/80/80 |
| `tendBase()` | Player or agent (SCOPE_TEND) | Restore resources, increment streak |
| `scavenge()` | Player or agent (SCOPE_SCAVENGE) | Restore food/water |
| `reinforceWalls()` | Player or agent (SCOPE_REINFORCE) | Restore walls |
| `raidBase(address)` | Player or agent (SCOPE_RAID) | Attack target |
| `hireAgent(address, uint8, uint256)` | Player only | Authorize agent |
| `dismissAgent()` | Player only | Deauthorize agent |
| `getBaseState(address)` | Anyone | Read citadel state |
| `getAgentStatus(address)` | Anyone | Read agent config |
| `hoursUntilDecay(address)` | Anyone | Convenience view |
| `withdrawFees()` | Owner only | Collect protocol fees |

#### Events
```solidity
event BaseInitialized(address indexed player)
event BaseTended(address indexed player, address indexed actor, uint256 streak)
event BaseDecayed(address indexed player, uint32 walls, uint32 water, uint32 food)
event Scavenged(address indexed player, address indexed actor)
event WallsReinforced(address indexed player, address indexed actor, uint32 newWalls)
event AgentHired(address indexed player, address indexed agent, uint8 scopeMask, uint64 expiresAt)
event AgentDismissed(address indexed player, address indexed agent)
event BaseAttacked(address indexed attacker, address indexed target, uint256 damage)
event BaseDestroyed(address indexed player)
```

### Stellar — `gog_and_magog` (Soroban)

#### Constants (Rust)
```rust
const DECAY_LEDGERS: u64  = 17280  // ~24h at 5s/ledger
const DECAY_AMOUNT: u32   = 8
const MAX_RESOURCE: u32   = 100
const TEND_RESTORE: u32   = 15
const SCAVENGE_FOOD: u32  = 22
const SCAVENGE_WATER: u32 = 12
const REINFORCE_WALLS: u32 = 30

pub const SCOPE_TEND:      u8 = 1 << 0;
pub const SCOPE_SCAVENGE:  u8 = 1 << 1;
pub const SCOPE_REINFORCE: u8 = 1 << 2;
pub const SCOPE_RAID:      u8 = 1 << 3;
```

#### Storage Keys
```rust
enum DataKey {
  Base(Address),      // → BaseState
  Agent(Address),     // player → AgentConfig
  AgentOf(Address),   // agent_address → player Address
}
```

#### Public Functions

| Function | Caller | Description |
|----------|--------|-------------|
| `init_base(env, player)` | Player (requires_auth) | Initialize citadel |
| `tend_base(env, actor)` | Player or agent | Restore resources, streak |
| `scavenge(env, actor)` | Player or agent | Restore food/water |
| `reinforce_walls(env, actor)` | Player or agent | Restore walls |
| `raid_base(env, actor, target)` | Player or agent | Attack target |
| `hire_agent(env, player, agent_address, scope_mask, duration_ledgers)` | Player | Authorize agent |
| `dismiss_agent(env, player)` | Player | Deauthorize agent |
| `get_base(env, player)` | Anyone | Read base state |
| `get_agent(env, player)` | Anyone | Read agent config |
| `ledgers_until_decay(env, player)` | Anyone | Convenience view |

---

## 16. UI/UX Rules

### Navigation
- WalletBar is always visible at top (fixed)
- Pages: Home, Game, Agents, Market, Leaderboard, How to Play
- Active page is highlighted in nav
- Chain switcher (Celo / Stellar) is always visible

### Critical UI Elements
These elements must always be visible on the Game page:
1. **Decay timer** — live countdown, turns red under 1 hour remaining
2. **Three resource rings** — Walls, Water, Food with live values
3. **Tend Base button** — the most prominent interactive element on the page
4. **Current streak** — always visible with fire emoji

### Color System

| Purpose | Color | Hex |
|---------|-------|-----|
| Background | Near-black | #0A0A0F |
| Surface | Dark panel | #13131F |
| Surface 2 | Slightly lighter | #1C1C2E |
| Border | Subtle white | rgba(255,255,255,0.08) |
| Border strong | Less subtle | rgba(255,255,255,0.16) |
| Primary text | Off-white | #F4F4F8 |
| Muted text | Mid-purple | #6060A0 |
| Danger / Primary CTA | Red | #FF3333 |
| Streak / Reward | Gold | #FFB800 |
| Health / Celo | Green | #00CC66 |
| Water / Stellar | Blue | #3399FF |

### Typography

| Role | Font | Weight |
|------|------|--------|
| Display / Headings | Syne | 700–800 |
| Body | Inter | 400–600 |
| Monospace / Code / HUD | JetBrains Mono | 400–600 |

### Animation Principles
- Decay timer counts down in real time (client-side)
- Resource rings animate smoothly (0.8s ease cubic-bezier) when values change
- Streak fire emoji has a subtle flicker animation
- Danger border pulses red when a resource is below 30%
- Actions show a loading spinner while transaction is pending
- On successful transaction, brief flash/scale effect on affected rings

### Notification Hierarchy
1. **Full-screen modal:** Streak lost, Base destroyed, Base raided while offline
2. **Banner alert:** Decay has occurred since last visit, Agent expires in 24 hours
3. **Badge on resource ring:** Resource below critical threshold
4. **Chain log entry:** All onchain events

### Responsive Design
- The game scene SVG is responsive (16:9 aspect ratio, max 540px height)
- Below 640px, hide secondary stats, keep: decay timer, resource rings, Tend Base button
- Agents page collapses to single column on mobile
- Leaderboard hides Walls and Raids columns on small screens

---

## 17. Visual Identity

### Game Scene Requirements
The game scene is rendered as an SVG animation. It must convey:

1. **Time of day:** Always night — moonlit, stars visible
2. **Atmosphere:** Post-apocalyptic wasteland. Dead trees. Cracked ground. Rubble.
3. **The citadel:** Stone walls, watchtower, command post with warm window glow, torches flickering
4. **The horde:** Giant rodents — rats/field creatures with:
   - **Oversized ears** (defining visual trait — must be exaggerated)
   - **Glowing red eyes** (both eyes, clearly lit)
   - **Whiskers** (multiple, radiating outward)
   - **Crude weapons** (bone clubs, spears, scythes — not modern)
   - **Crude armor** (leather straps, bone plates — not metal)
   - **Tails** (curved, visible)
   - Size hierarchy: Leader (largest) > Warrior > Scout
5. **Breach indicators:** If walls < 30%, show a gap in the top wall with "BREACH" label
6. **Fire and smoke:** Near collapsed sections of wall
7. **Player character:** Visible inside base near command post door, armed

### Rodent Character Design (Canonical)

```
SCOUT RODENT
- Size: small (15–18px body in SVG units)
- Ears: large relative to head, pink inner membrane, slight rotation outward
- Eyes: small red circles with lighter red highlight dot
- Weapon: short spear or dagger
- Color: brown (body #503828), slightly lighter head

WARRIOR RODENT  
- Size: medium (20–25px body)
- Ears: large, more erect, pronounced pink interior
- Eyes: medium red circles, bright highlight
- Weapon: spear or bone club
- Armor: crude plate on chest
- Color: darker brown

GOG LEADER (War Chief)
- Size: large (28–35px body)
- Ears: massive, tall, dominant feature of silhouette
- Eyes: large glowing red, with bright inner highlight
- Weapon: war scythe (long handle, curved blade)
- Armor: studded chest plate + bone crown
- Cape: dark red/maroon flowing cape
- Tail: thick, curved prominently behind
- Color: reddish-brown #6a4838
```

### HUD Elements (Always Visible in Game Scene)
- Top-left: "GOG & MAGOG" branding + block number + chain
- Top-right: Wallet address
- Bottom-left: Resource bars (Walls, Water, Food) with percentages
- Bottom-right: Decay timer
- Bottom-center: Active action prompt ([ E ] SIGN TX: TEND BASE)

---

## 18. Addictive Design Principles

These are the psychological mechanics that drive retention. They are documented here not as manipulation techniques but as deliberate design choices that make the game compelling and worth returning to.

### 1. Loss Aversion Over Gain Motivation
Players are more motivated by the fear of losing a 20-day streak than by the prospect of gaining a 21-day streak reward. The UI should gently surface what is at risk (streak counter, milestone proximity) rather than only what is to be gained.

**Implementation:** Show "You are 7 days from Ember Blade NFT" rather than hiding milestone progress. Make the streak count visible on every page.

### 2. Variable Reward Schedule
Not every day is the same. Raids produce different outcomes. Scavenging yields vary slightly (in v2). This unpredictability activates dopamine loops more effectively than fixed rewards.

**Implementation:** Raid outcomes have slight randomness in v2. Chain log entries create narrative variety even when actions are mechanical.

### 3. Social Comparison (Leaderboard)
Humans are wired to compare themselves to others. A public, real-time leaderboard with named players creates a competitive social layer that motivates daily engagement far beyond solo play.

**Implementation:** Leaderboard updates every block. Player's own rank is always shown at top (even if not in top 10). Show "You are 3 days behind siege.eth" type comparisons.

### 4. Sunk Cost Creates Loyalty
Every day a player logs in, they have more invested. A 15-day streak is worth 15 days of effort. This psychological sunk cost makes daily return feel mandatory, not optional.

**Implementation:** Never downplay streak numbers. Celebrate them. When streak is high, show it large. When close to milestone, show countdown. When streak is lost, show the specific number lost.

### 5. Real Consequences
Games where nothing matters produce low retention. When your citadel can be permanently invaded, stripped, and destroyed, every action feels meaningful. The blockchain is permanent — that permanence creates weight.

**Implementation:** Ruin State is visible to all players. Other players can loot ruins. Base Destroyed events are broadcast in the global ticker on the landing page.

### 6. Minimal Viable Commitment
The game respects the player's time. One transaction = streak maintained. The minimum daily session is 30 seconds. This removes the "I don't have time" excuse, which is the primary reason players churn from daily games.

**Implementation:** The Tend Base button must be the most prominent CTA on the Game page. One tap from wallet connection to transaction confirmed.

### 7. Agents as Commitment Devices
Hiring an agent for 30 days is a commitment — the player has paid upfront and wants their money's worth. This creates a 30-day forward commitment that reinforces daily return. Even when the agent is handling the blockchain transaction, the player is likely to still check in to see what happened.

**Implementation:** Agent status shows on game page. When agent acts, it's logged in the chain log. Players can see their agent's transactions.

### 8. Fear of Missing Out (FOMO)
Locked market items, leaderboard positions slipping, raids happening while offline — all create FOMO that pulls players back.

**Implementation:** Market items show locked state with exact days needed. "You were raided while offline" notifications. Real-time live ticker of global events.

### 9. Progression Dopamine
Levels, XP bars, and milestone progress bars trigger classic progression loops. The bar that is almost full is irresistible.

**Implementation:** XP bar always visible on game page. Show percentage to next level. Milestone progress bar on game page showing distance to next reward.

### 10. Decay as a Ticking Clock
Nothing creates urgency like a countdown. The decay timer is permanently visible. As it approaches zero, the UI escalates: yellow warning → red alert → pulsing danger border. This creates a Pavlovian association between the timer and action.

**Implementation:** Timer is always visible. Color changes at <6h (yellow), <1h (red), <15min (pulsing). Push notifications in v2 at 4h remaining.

---

## 19. Glossary

| Term | Definition |
|------|------------|
| **Tend** | The daily action of calling `tendBase()` — the core player ritual |
| **Streak** | Count of consecutive days with at least one tend |
| **Decay** | The automatic 8% resource loss every 24 hours |
| **Ruin State** | The state when all three resources hit 0 — requires restart |
| **Agent** | An authorized account that tends on the player's behalf |
| **Scope Mask** | A bitmask defining which contract functions an agent may call |
| **Citadel** | The player's base — their onchain fortress |
| **Gog** | The eastern rodent horde — large, organized |
| **Magog** | The western rodent horde — small, numerous |
| **Breach** | An opening in the wall — occurs when walls < 30% (visual) or wall = 0 (Ruin) |
| **Milestone** | A reward unlocked at specific streak thresholds (7, 14, 30, 60, 100 days) |
| **Raid** | An attack on another player's citadel |
| **XP** | Experience points — persistent across restarts, drives level progression |
| **Level** | A prestige rank derived from total XP, 1–10 |
| **Chain Log** | The chronological list of onchain events displayed in the game UI |
| **Loot** | Resources or items gained from raids or ruined citadels |
| **Grace Period** | The 48-hour window after last tend in which streak is still preserved |
| **Spawn Protection** | The 48-hour window after `initBase()` during which raids are blocked |
| **Protocol Treasury** | The contract's accumulated fees, withdrawable by owner |

---

## 20. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-04 | Initial game bible — all v1 mechanics documented |

---

## Appendix A — Game Design To-Do (v2 Roadmap)

- [ ] Resource theft in raids (attackers steal food/water, not just wall damage)
- [ ] Alliance system (2–4 players share a citadel, shared streak)
- [ ] PvP tournament mode with stake pools
- [ ] Cross-chain bridge (resources transferable Celo ↔ Stellar)
- [ ] Mobile push notifications for decay timer
- [ ] Agent NFTs (agents become tradeable onchain entities)
- [ ] Random events (storms, plagues, bumper harvests) that modify resource rates
- [ ] Seasonal resets with season-specific milestones
- [ ] Governance module (high-level players vote on rule changes)

---

## Appendix B — For AI Assistants

If you are an AI assistant (Claude or otherwise) reading this document to help build or extend the game:

1. **Treat this document as canonical.** If the code contradicts the bible, the bible wins — fix the code.
2. **The core loop is sacred.** Do not add mechanics that allow players to skip the daily sign requirement. Agents are the only exception and they are explicitly designed-in.
3. **Keep UI clean.** The color system and typography are defined. Use them. No extra colors without a design reason.
4. **Contracts are security-critical.** Any changes to `GogAndMagog.sol` or `lib.rs` must preserve: the scope mask system (agents cannot exceed their scope), the decay logic (lazy evaluation), and the spawn protection rule.
5. **No pay-to-win.** Items in the market cannot buy streak progress. Agents maintain streaks but do not create them from nothing — they require the player to have initialized and started.
6. **Both chains are first-class.** When adding features, implement on both Celo and Stellar unless there is a documented chain-specific reason.
7. **Rodents have large ears.** The visual identity of the horde is defined. Always maintain the canonical rodent design when rendering the game scene.
