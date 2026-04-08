# Gog & Magog — Onchain Survival

> Defend your citadel. Sign or fall.

A fully onchain survival game where your base decays every 24 hours. Sign a transaction daily or watch your walls crumble. The Gog & Magog horde — giant rodents with glowing eyes — attacks weakened citadels. Hire autonomous agents to guard your base while you sleep.

---

## Game Loop

```
Player signs tx (tendBase) ─▶ Resources restored ─▶ Streak +1
                                                          │
                          ◀── Decay every 24h ───────────┘
                                    │
                    No tx ──▶ Resources drop 8%/day
                                    │
                          Walls hit 0 ──▶ Raiders invade
```

---

## Stack

| Layer         | Celo             | Stellar            |
|---------------|------------------|--------------------|
| Chain         | Celo (EVM, 42220)| Stellar / Soroban  |
| Contract lang | Solidity ^0.8.24 | Rust (soroban-sdk) |
| Wallet        | MetaMask / CELO  | Freighter          |
| Frontend      | Next.js 14 + Tailwind CSS          |
| Agent tx auth | EOA scope mask   | Soroban keypair auth|

---

## Project Structure

```
gog-and-magog/
├── app/
│   ├── page.tsx              ← Landing (hero + game preview)
│   ├── game/page.tsx         ← Main game view
│   ├── agents/page.tsx       ← Agent marketplace
│   ├── market/page.tsx       ← NFT item market
│   └── leaderboard/page.tsx  ← Streak leaderboard
├── components/
│   ├── GameScene.tsx         ← Animated SVG game scene
│   ├── WalletBar.tsx         ← Chain switcher + connect
│   └── AgentCard.tsx         ← Agent hire card
├── lib/
│   ├── contracts/
│   │   ├── celo.ts           ← viem contract calls (Celo)
│   │   └── stellar.ts        ← @stellar/stellar-sdk (Soroban)
│   └── hooks/
│       ├── useWallet.ts      ← Wallet connect (Celo + Stellar)
│       └── useStreak.ts      ← Streak tracking hook
└── contracts/
    ├── celo/
    │   ├── GogAndMagog.sol   ← Celo Solidity contract
    │   ├── deploy.js         ← Hardhat deploy script
    │   └── hardhat.config.js
    └── stellar/
        ├── Cargo.toml
        └── src/lib.rs        ← Soroban Rust contract
```

---

## Setup

### Frontend

```bash
npm install
npm run dev        # http://localhost:3000
```

### Deploy Celo Contract

```bash
cd contracts/celo
npm install
cp .env.example .env   # set DEPLOYER_PRIVATE_KEY
npx hardhat run deploy.js --network celo_alfajores
# copy deployed address → lib/contracts/celo.ts → GOG_CONTRACT_CELO
```

### Deploy Stellar Contract

```bash
cd contracts/stellar
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/gog_and_magog.wasm \
  --source <your-secret-key> \
  --network testnet
# copy contract ID → lib/contracts/stellar.ts → GOG_CONTRACT_STELLAR
```

---

## Agent System

Agents are authorized smart accounts that sign daily transactions on behalf of absent players.

### Celo Agents
An agent is an EOA with a **scope bitmask** — it can only call whitelisted functions (`tendBase`, `scavenge`, `reinforceWalls`, `raidBase`). It cannot transfer tokens or do anything else. Auth enforced at the contract level.

```solidity
// Hire an agent for 7 days, allow tend + scavenge only
contract.hireAgent(agentEOA, SCOPE_TEND | SCOPE_SCAVENGE, 7)
```

### Stellar Agents
An agent is a separate Stellar keypair. The player calls `hire_agent()` authorizing the agent's public key for specific contract functions for N ledgers.

```rust
// Hire agent for 30 days (~518,400 ledgers)
hire_agent(env, player, agent_pubkey, SCOPE_TEND | SCOPE_REINFORCE, 518400)
```

---

## Grant Positioning

| Ecosystem         | Why this wins grants                                    |
|-------------------|---------------------------------------------------------|
| Celo              | Daily active wallets, mobile-first, social impact angle |
| Stellar Community | Soroban smart contracts showcase, agent auth pattern    |
| Gitcoin           | Public goods: open source, dual-chain, agent infra      |
| Autonomous Worlds | Fully onchain game state, persistent world              |

---

## Roadmap

- [ ] Deploy contracts to Celo Alfajores + Stellar testnet
- [ ] Real-time decay countdown via block subscriptions
- [ ] Cross-chain bridge: resources transferable Celo ↔ Stellar
- [ ] PvP raid tournaments with stake pools
- [ ] Agent NFTs — tradeable guardian contracts
- [ ] Mobile app (PWA) for one-tap daily signing
