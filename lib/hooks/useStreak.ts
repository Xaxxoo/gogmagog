"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getBaseState,
  getAgentStatus,
  GOG_CONTRACT_CELO,
} from "@/lib/contracts/celo";
import {
  getStellarBaseState,
  stellarHasBase,
  GOG_CONTRACT_STELLAR,
} from "@/lib/contracts/stellar";

export type Chain = "celo" | "stellar";

export interface StreakData {
  loading:          boolean;
  current:          number;
  lastAction:       Date | null;
  hoursUntilDecay:  number;
  isAgentActive:    boolean;
  agentType:        string | null;
  agentExpiresAt:   Date | null;
}

const EMPTY: StreakData = {
  loading:         false,
  current:         0,
  lastAction:      null,
  hoursUntilDecay: 0,
  isAgentActive:   false,
  agentType:       null,
  agentExpiresAt:  null,
};

export function useStreak(address: string | null, chain: Chain): StreakData {
  const [data, setData] = useState<StreakData>(EMPTY);

  const fetch = useCallback(async () => {
    if (!address) { setData(EMPTY); return; }

    setData(prev => ({ ...prev, loading: true }));

    try {
      if (chain === "celo") {
        if (!GOG_CONTRACT_CELO || GOG_CONTRACT_CELO === "0x") {
          setData({ ...EMPTY, loading: false });
          return;
        }
        const addr = address as `0x${string}`;
        const [base, agent] = await Promise.all([
          getBaseState(addr),
          getAgentStatus(addr),
        ]);
        const lastActionMs    = base.lastAction * 1_000;
        const nextDecayMs     = lastActionMs + 86_400_000;
        const hoursUntilDecay = Math.max(0, (nextDecayMs - Date.now()) / 3_600_000);

        setData({
          loading:         false,
          current:         base.streak,
          lastAction:      base.lastAction ? new Date(lastActionMs) : null,
          hoursUntilDecay,
          isAgentActive:   agent.active,
          agentType:       agent.active ? String(agent.agentType) : null,
          agentExpiresAt:  agent.active ? new Date(agent.expiresAt * 1_000) : null,
        });
      } else {
        // Stellar
        if (!GOG_CONTRACT_STELLAR) {
          setData({ ...EMPTY, loading: false });
          return;
        }
        const hasBase = await stellarHasBase(address);
        if (!hasBase) { setData({ ...EMPTY, loading: false }); return; }

        const base = await getStellarBaseState(address);
        // Stellar uses ledger numbers, not timestamps — decay window unknown without current ledger
        setData({
          loading:         false,
          current:         base.streak,
          lastAction:      null,
          hoursUntilDecay: 0,
          isAgentActive:   false,
          agentType:       null,
          agentExpiresAt:  null,
        });
      }
    } catch (err) {
      console.error("useStreak:", err);
      setData({ ...EMPTY, loading: false });
    }
  }, [address, chain]);

  useEffect(() => {
    fetch();
    if (!address) return;
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, [fetch, address]);

  return data;
}
