import { createPublicClient, createWalletClient, http, parseAbi, custom } from "viem";
import { celoAlfajores, celo } from "viem/chains";

export const GOG_MAGOG_ABI = parseAbi([
  "function initBase() external",
  "function tendBase() external",
  "function scavenge() external",
  "function reinforceWalls() external",
  "function attackBase(address target) external",
  "function getBaseState(address player) external view returns (uint256 walls, uint256 water, uint256 food, uint256 lastAction, uint256 streak)",
  "function getAttackableTargets() external view returns (address[] memory targets, uint256[] memory walls)",
  "function hireCeloAgent(uint8 agentType, uint256 durationDays) external payable",
  "function getAgentStatus(address player) external view returns (bool active, uint8 agentType, uint256 expiresAt)",
  "event BaseTended(address indexed player, uint256 block, uint256 streak)",
  "event BaseDecayed(address indexed player, uint256 walls, uint256 water, uint256 food)",
  "event Attacked(address indexed base, address indexed attacker, uint256 damageDone)",
  "event AgentHired(address indexed player, uint8 agentType, uint256 expiresAt)",
]);

export const GOG_CONTRACT_CELO = "0xGOGMAGOG_CELO_ADDRESS_HERE";
export const IS_CONTRACT_DEPLOYED = GOG_CONTRACT_CELO !== "0xGOGMAGOG_CELO_ADDRESS_HERE";

export function getCeloClient(isTestnet = true) {
  return createPublicClient({
    chain:     isTestnet ? celoAlfajores : celo,
    transport: http(),
  });
}

export async function getBaseState(playerAddress: `0x${string}`, isTestnet = true) {
  const client = getCeloClient(isTestnet);
  const result = await client.readContract({
    address:      GOG_CONTRACT_CELO as `0x${string}`,
    abi:          GOG_MAGOG_ABI,
    functionName: "getBaseState",
    args:         [playerAddress],
  });
  const [walls, water, food, lastAction, streak] = result as bigint[];
  return {
    walls:      Number(walls),
    water:      Number(water),
    food:       Number(food),
    lastAction: Number(lastAction),
    streak:     Number(streak),
  };
}

function getWalletClient() {
  if (typeof window === "undefined" || !(window as any).ethereum)
    throw new Error("No wallet found");
  return createWalletClient({
    chain:     celoAlfajores,
    transport: custom((window as any).ethereum),
  });
}

export async function tendBase() {
  const wc = getWalletClient();
  const [account] = await wc.getAddresses();
  return wc.writeContract({
    address:      GOG_CONTRACT_CELO as `0x${string}`,
    abi:          GOG_MAGOG_ABI,
    functionName: "tendBase",
    account,
  });
}

export async function scavenge() {
  const wc = getWalletClient();
  const [account] = await wc.getAddresses();
  return wc.writeContract({
    address:      GOG_CONTRACT_CELO as `0x${string}`,
    abi:          GOG_MAGOG_ABI,
    functionName: "scavenge",
    account,
  });
}

export async function reinforceWalls() {
  const wc = getWalletClient();
  const [account] = await wc.getAddresses();
  return wc.writeContract({
    address:      GOG_CONTRACT_CELO as `0x${string}`,
    abi:          GOG_MAGOG_ABI,
    functionName: "reinforceWalls",
    account,
  });
}

export async function attackBase(targetAddress: `0x${string}`) {
  const wc = getWalletClient();
  const [account] = await wc.getAddresses();
  return wc.writeContract({
    address:      GOG_CONTRACT_CELO as `0x${string}`,
    abi:          GOG_MAGOG_ABI,
    functionName: "attackBase",
    args:         [targetAddress],
    account,
  });
}

export async function hireCeloAgent(agentType: number, durationDays: number, feeCelo: bigint) {
  const wc = getWalletClient();
  const [account] = await wc.getAddresses();
  return wc.writeContract({
    address:      GOG_CONTRACT_CELO as `0x${string}`,
    abi:          GOG_MAGOG_ABI,
    functionName: "hireCeloAgent",
    args:         [agentType, BigInt(durationDays)],
    account,
    value:        feeCelo,
  });
}
