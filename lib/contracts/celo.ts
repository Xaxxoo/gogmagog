import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  custom,
  type Log,
} from "viem";
import { celoAlfajores, celo } from "viem/chains";

/* ── Contract config ──────────────────────────────────────────── */
export const GOG_CONTRACT_CELO =
  (process.env.NEXT_PUBLIC_GOG_CONTRACT_CELO as `0x${string}`) ?? "0x";

const IS_TESTNET =
  (process.env.NEXT_PUBLIC_CELO_NETWORK ?? "testnet") !== "mainnet";

export const CELO_CHAIN = IS_TESTNET ? celoAlfajores : celo;

/* ── ABI ─────────────────────────────────────────────────────── */
export const GOG_MAGOG_ABI = parseAbi([
  // Writes
  "function initBase() external",
  "function tendBase() external",
  "function scavenge() external",
  "function reinforceWalls() external",
  "function attackBase(address target) external",
  "function hireCeloAgent(uint8 agentType, uint256 durationDays) external payable",

  // Reads
  "function getBaseState(address player) external view returns (uint256 walls, uint256 water, uint256 food, uint256 lastAction, uint256 streak)",
  "function getAttackableTargets() external view returns (address[] memory targets, uint256[] memory walls)",
  "function getAgentStatus(address player) external view returns (bool active, uint8 agentType, uint256 expiresAt)",
  "function hasBase(address player) external view returns (bool)",

  // Events
  "event BaseTended(address indexed player, uint256 indexed blockNumber, uint256 streak)",
  "event BaseDecayed(address indexed player, uint256 walls, uint256 water, uint256 food)",
  "event Attacked(address indexed base, address indexed attacker, uint256 damageDone)",
  "event BaseInitialized(address indexed player)",
  "event AgentHired(address indexed player, uint8 agentType, uint256 expiresAt)",
]);

/* ── Public client ───────────────────────────────────────────── */
export function getCeloClient() {
  return createPublicClient({ chain: CELO_CHAIN, transport: http() });
}

/* ── Wallet client ───────────────────────────────────────────── */
function getWalletClient() {
  if (typeof window === "undefined" || !(window as any).ethereum)
    throw new Error("No EVM wallet detected. Install MetaMask.");
  return createWalletClient({
    chain:     CELO_CHAIN,
    transport: custom((window as any).ethereum),
  });
}

/* ── Wait for transaction receipt ────────────────────────────── */
export async function waitForReceipt(hash: `0x${string}`) {
  const client = getCeloClient();
  return client.waitForTransactionReceipt({ hash, timeout: 60_000 });
}

/* ── Read: base state ────────────────────────────────────────── */
export async function getBaseState(playerAddress: `0x${string}`) {
  const client = getCeloClient();
  const result = await (client as any).readContract({
    address:      GOG_CONTRACT_CELO,
    abi:          GOG_MAGOG_ABI,
    functionName: "getBaseState",
    args:         [playerAddress],
  });
  const [walls, water, food, lastAction, streak] = result as bigint[];
  return {
    walls:      Number(walls),
    water:      Number(water),
    food:       Number(food),
    lastAction: Number(lastAction), // unix timestamp of last tendBase()
    streak:     Number(streak),
  };
}

/* ── Read: whether player has initialised a base ─────────────── */
export async function hasBase(playerAddress: `0x${string}`): Promise<boolean> {
  const client = getCeloClient();
  return (client as any).readContract({
    address:      GOG_CONTRACT_CELO,
    abi:          GOG_MAGOG_ABI,
    functionName: "hasBase",
    args:         [playerAddress],
  }) as Promise<boolean>;
}

/* ── Read: raidable targets ──────────────────────────────────── */
export async function getAttackableTargets(): Promise<
  Array<{ address: `0x${string}`; walls: number }>
> {
  const client = getCeloClient();
  const [targets, walls] = (await (client as any).readContract({
    address:      GOG_CONTRACT_CELO,
    abi:          GOG_MAGOG_ABI,
    functionName: "getAttackableTargets",
  })) as [`0x${string}`[], bigint[]];

  return targets.map((addr, i) => ({
    address: addr,
    walls:   Number(walls[i]),
  }));
}

/* ── Read: agent status ──────────────────────────────────────── */
export async function getAgentStatus(playerAddress: `0x${string}`) {
  const client = getCeloClient();
  const [active, agentType, expiresAt] = (await (client as any).readContract({
    address:      GOG_CONTRACT_CELO,
    abi:          GOG_MAGOG_ABI,
    functionName: "getAgentStatus",
    args:         [playerAddress],
  })) as [boolean, number, bigint];
  return { active, agentType, expiresAt: Number(expiresAt) };
}

/* ── Read: leaderboard from BaseTended events ────────────────── */
export async function getLeaderboard(lookbackBlocks = 100_000) {
  const client  = getCeloClient();
  const latest  = await client.getBlockNumber();
  const fromBlock = latest > BigInt(lookbackBlocks)
    ? latest - BigInt(lookbackBlocks)
    : BigInt(0);

  const logs = await (client as any).getContractEvents({
    address:   GOG_CONTRACT_CELO,
    abi:       GOG_MAGOG_ABI,
    eventName: "BaseTended",
    fromBlock,
    toBlock:   "latest",
  });

  // Keep the highest streak seen per player
  const map = new Map<string, { streak: number; blockNumber: bigint }>();
  for (const log of logs) {
    const { player, streak, blockNumber } = log.args as {
      player: `0x${string}`;
      streak: bigint;
      blockNumber: bigint;
    };
    const existing = map.get(player);
    if (!existing || Number(streak) > existing.streak) {
      map.set(player, { streak: Number(streak), blockNumber });
    }
  }

  return Array.from(map.entries())
    .map(([address, { streak }]) => ({ address, streak }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 20);
}

/* ── Read: recent chain events for activity log ──────────────── */
export async function getRecentEvents(lookbackBlocks = 2_000) {
  const client    = getCeloClient();
  const latest    = await client.getBlockNumber();
  const fromBlock = latest > BigInt(lookbackBlocks) ? latest - BigInt(lookbackBlocks) : BigInt(0);

  const [tended, decayed, attacked] = await Promise.all([
    (client as any).getContractEvents({ address: GOG_CONTRACT_CELO, abi: GOG_MAGOG_ABI, eventName: "BaseTended",  fromBlock, toBlock: "latest" }),
    (client as any).getContractEvents({ address: GOG_CONTRACT_CELO, abi: GOG_MAGOG_ABI, eventName: "BaseDecayed", fromBlock, toBlock: "latest" }),
    (client as any).getContractEvents({ address: GOG_CONTRACT_CELO, abi: GOG_MAGOG_ABI, eventName: "Attacked",    fromBlock, toBlock: "latest" }),
  ]);

  type Entry = { type: "success" | "danger" | "neutral"; text: string; block: bigint };
  const entries: Entry[] = [
    ...tended.map(e => ({
      type:  "success" as const,
      text:  `Base tended by ${short(String(e.args.player))} · Streak: ${e.args.streak}`,
      block: e.blockNumber ?? BigInt(0),
    })),
    ...decayed.map(e => ({
      type:  "neutral" as const,
      text:  `Decay event: ${short(String(e.args.player))} — Walls ${e.args.walls}% Water ${e.args.water}% Food ${e.args.food}%`,
      block: e.blockNumber ?? BigInt(0),
    })),
    ...attacked.map(e => ({
      type:  "danger" as const,
      text:  `${short(String(e.args.attacker))} raided ${short(String(e.args.base))} — ${e.args.damageDone} damage`,
      block: e.blockNumber ?? BigInt(0),
    })),
  ];

  return entries
    .sort((a, b) => Number(b.block - a.block))
    .slice(0, 12)
    .map(e => ({ type: e.type, text: `${e.text}  ·  Block ${e.block}` }));
}

function short(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

/* ── Writes ──────────────────────────────────────────────────── */
async function write(functionName: string, args: unknown[] = [], value?: bigint) {
  const wc = getWalletClient();
  const [account] = await wc.getAddresses();
  return (wc as any).writeContract({
    chain:        CELO_CHAIN,
    address:      GOG_CONTRACT_CELO,
    abi:          GOG_MAGOG_ABI,
    functionName,
    args,
    account,
    ...(value !== undefined ? { value } : {}),
  });
}

export const initBase       = ()                                    => write("initBase");
export const tendBase       = ()                                    => write("tendBase");
export const scavenge       = ()                                    => write("scavenge");
export const reinforceWalls = ()                                    => write("reinforceWalls");
export const attackBase     = (target: `0x${string}`)              => write("attackBase", [target]);
export const hireCeloAgent  = (type: number, days: number, fee: bigint) => write("hireCeloAgent", [type, BigInt(days)], fee);
