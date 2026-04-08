import { createPublicClient, createWalletClient, http, parseAbi, custom } from "viem";
import { celoAlfajores, celo } from "viem/chains";

export const GOG_MAGOG_ABI = parseAbi([
  "function tendBase() external",
  "function scavenge() external",
  "function reinforceWalls() external",
  "function getBaseState(address player) external view returns (uint256 walls, uint256 water, uint256 food, uint256 lastAction, uint256 streak)",
  "function hireCeloAgent(uint8 agentType, uint256 durationDays) external payable",
  "function getAgentStatus(address player) external view returns (bool active, uint8 agentType, uint256 expiresAt)",
  "event BaseTended(address indexed player, uint256 block, uint256 streak)",
  "event BaseDecayed(address indexed player, uint256 walls, uint256 water, uint256 food)",
  "event Attacked(address indexed base, address indexed attacker, uint256 damageDone)",
]);

export const GOG_CONTRACT_CELO = "0xGOGMAGOG_CELO_ADDRESS_HERE";

export function getCeloClient(isTestnet = true) {
  return createPublicClient({
    chain: isTestnet ? celoAlfajores : celo,
    transport: http(),
  });
}

export async function getBaseState(playerAddress: `0x${string}`, isTestnet = true) {
  const client = getCeloClient(isTestnet);
  const result = await client.readContract({
    address: GOG_CONTRACT_CELO,
    abi: GOG_CONTRACT_ABI,
    functionName: "getBaseState",
    args: [playerAddress],
  });
  const [walls, water, food, lastAction, streak] = result as bigint[];
  return {
    walls: Number(walls),
    water: Number(water),
    food: Number(food),
    lastAction: Number(lastAction),
    streak: Number(streak),
  };
}

export async function tendBase() {
  if (typeof window === "undefined" || !window.ethereum) throw new Error("No wallet found");
  const walletClient = createWalletClient({ chain: celoAlfajores, transport: custom(window.ethereum) });
  const [account] = await walletClient.getAddresses();
  return walletClient.writeContract({
    address: GOG_CONTRACT_CELO,
    abi: GOG_MAGOG_ABI,
    functionName: "tendBase",
    account,
  });
}

export async function hireCeloAgent(agentType: number, durationDays: number, feeCelo: bigint) {
  if (typeof window === "undefined" || !window.ethereum) throw new Error("No wallet found");
  const walletClient = createWalletClient({ chain: celoAlfajores, transport: custom(window.ethereum) });
  const [account] = await walletClient.getAddresses();
  return walletClient.writeContract({
    address: GOG_CONTRACT_CELO,
    abi: GOG_MAGOG_ABI,
    functionName: "hireCeloAgent",
    args: [agentType, BigInt(durationDays)],
    account,
    value: feeCelo,
  });
}

const GOG_CONTRACT_ABI = GOG_MAGOG_ABI;
