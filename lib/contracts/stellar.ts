/**
 * Gog & Magog — Stellar Soroban integration
 * Uses @stellar/stellar-sdk (>= 11) with dynamic imports to avoid SSR.
 */

export const GOG_CONTRACT_STELLAR =
  process.env.NEXT_PUBLIC_GOG_CONTRACT_STELLAR ?? "";

const IS_TESTNET =
  (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet") !== "mainnet";

export const STELLAR_RPC_URL = IS_TESTNET
  ? "https://soroban-testnet.stellar.org"
  : "https://horizon.stellar.org";

export const STELLAR_NETWORK_PASSPHRASE = IS_TESTNET
  ? "Test SDF Network ; September 2015"
  : "Public Global Stellar Network ; September 2015";

export type StellarBaseState = {
  walls:            number;
  water:            number;
  food:             number;
  lastActionLedger: number;
  streak:           number;
};

export type AgentType = "SCOUT" | "WARRIOR" | "BUILDER" | "GUARDIAN";

export interface StellarAgentConfig {
  type:            AgentType;
  priority:        "WALLS" | "WATER" | "FOOD" | "BALANCED";
  aggressiveness:  number;   // 0-100
  durationLedgers: number;
  feeLumens:       number;
}

/* ── Helpers ─────────────────────────────────────────────────── */
async function getRpcServer() {
  const { rpc } = await import("@stellar/stellar-sdk");
  return new rpc.Server(STELLAR_RPC_URL);
}

async function buildViewTx(playerPublicKey: string, method: string, ...args: unknown[]) {
  const { Contract, TransactionBuilder, BASE_FEE, Address } =
    await import("@stellar/stellar-sdk");
  const server  = await getRpcServer();
  const account = await server.getAccount(playerPublicKey);
  const contract = new Contract(GOG_CONTRACT_STELLAR);

  const scArgs = await Promise.all(
    args.map(async a => {
      const { nativeToScVal } = await import("@stellar/stellar-sdk");
      return nativeToScVal(a);
    })
  );

  return new TransactionBuilder(account, {
    fee:               BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...scArgs))
    .setTimeout(30)
    .build();
}

async function signAndSubmit(xdr: string): Promise<string> {
  if (typeof window === "undefined" || !(window as any).freighter)
    throw new Error("Freighter wallet not found. Install the Freighter extension.");

  const signedXdr = await (window as any).freighter.signTransaction(xdr, {
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  });

  const { Transaction } = await import("@stellar/stellar-sdk");
  const server = await getRpcServer();
  const tx     = new Transaction(signedXdr, STELLAR_NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(tx);

  if (result.status === "ERROR") {
    throw new Error(`Transaction failed: ${result.errorResult?.toXDR()}`);
  }

  // Wait for confirmation
  let tries = 0;
  while (tries < 20) {
    await new Promise(r => setTimeout(r, 2000));
    const status = await server.getTransaction(result.hash);
    if (status.status === "SUCCESS") return result.hash;
    if (status.status === "FAILED")  throw new Error("Transaction failed on-chain.");
    tries++;
  }
  throw new Error("Transaction timed out waiting for confirmation.");
}

/* ── Read: base state ────────────────────────────────────────── */
export async function getStellarBaseState(
  playerPublicKey: string
): Promise<StellarBaseState> {
  const { rpc, scValToNative } = await import("@stellar/stellar-sdk");
  const server = await getRpcServer();
  const tx     = await buildViewTx(playerPublicKey, "get_base_state");
  const sim    = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Contract read failed: ${sim.error}`);
  }

  const success = sim as rpc.Api.SimulateTransactionSuccessResponse;
  const raw     = scValToNative(success.result!.retval) as Record<string, bigint>;

  return {
    walls:            Number(raw.walls),
    water:            Number(raw.water),
    food:             Number(raw.food),
    lastActionLedger: Number(raw.last_action_ledger),
    streak:           Number(raw.streak),
  };
}

/* ── Read: has base ──────────────────────────────────────────── */
export async function stellarHasBase(playerPublicKey: string): Promise<boolean> {
  const { rpc, scValToNative } = await import("@stellar/stellar-sdk");
  const server = await getRpcServer();
  const tx     = await buildViewTx(playerPublicKey, "has_base");
  const sim    = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) return false;
  const success = sim as rpc.Api.SimulateTransactionSuccessResponse;
  return Boolean(scValToNative(success.result!.retval));
}

/* ── Read: attackable targets ────────────────────────────────── */
export async function getStellarAttackableTargets(
  playerPublicKey: string
): Promise<Array<{ address: string; walls: number }>> {
  const { rpc, scValToNative } = await import("@stellar/stellar-sdk");
  const server = await getRpcServer();
  const tx     = await buildViewTx(playerPublicKey, "get_attackable_targets");
  const sim    = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) return [];
  const success = sim as rpc.Api.SimulateTransactionSuccessResponse;
  const raw = scValToNative(success.result!.retval) as Array<{ address: string; walls: bigint }>;
  return raw.map(t => ({ address: t.address, walls: Number(t.walls) }));
}

/* ── Write helpers ───────────────────────────────────────────── */
async function buildWriteTx(playerPublicKey: string, method: string, ...args: unknown[]) {
  const xdrObj = await buildViewTx(playerPublicKey, method, ...args);
  const { rpc } = await import("@stellar/stellar-sdk");
  const server  = await getRpcServer();
  const prepared = await server.prepareTransaction(xdrObj);
  return prepared.toXDR();
}

export async function initBaseSoroban(playerPublicKey: string) {
  const xdr = await buildWriteTx(playerPublicKey, "init_base");
  return signAndSubmit(xdr);
}

export async function tendBaseSoroban(playerPublicKey: string) {
  const xdr = await buildWriteTx(playerPublicKey, "tend_base");
  return signAndSubmit(xdr);
}

export async function scavengeSoroban(playerPublicKey: string) {
  const xdr = await buildWriteTx(playerPublicKey, "scavenge");
  return signAndSubmit(xdr);
}

export async function reinforceWallsSoroban(playerPublicKey: string) {
  const xdr = await buildWriteTx(playerPublicKey, "reinforce_walls");
  return signAndSubmit(xdr);
}

export async function attackBaseSoroban(
  playerPublicKey: string,
  targetPublicKey: string
) {
  const xdr = await buildWriteTx(playerPublicKey, "attack_base", targetPublicKey);
  return signAndSubmit(xdr);
}

export async function hireStellarAgent(
  playerPublicKey: string,
  config: StellarAgentConfig
): Promise<{ agentPublicKey: string; txHash: string }> {
  const { Keypair } = await import("@stellar/stellar-sdk");
  const agentKeypair = Keypair.random();

  const xdr = await buildWriteTx(
    playerPublicKey,
    "hire_agent",
    agentKeypair.publicKey(),
    config.type,
    config.priority,
    config.aggressiveness,
    config.durationLedgers,
  );

  const hash = await signAndSubmit(xdr);
  return { agentPublicKey: agentKeypair.publicKey(), txHash: hash };
}
