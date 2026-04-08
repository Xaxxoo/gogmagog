"use client";
import { useState, useEffect } from "react";

export type Chain = "celo" | "stellar";

export interface StreakData {
  current: number;
  longest: number;
  lastAction: Date | null;
  hoursUntilDecay: number;
  isAgentActive: boolean;
  agentType: string | null;
  agentExpiresAt: Date | null;
}

export function useStreak(address: string | null, chain: Chain): StreakData {
  const [data, setData] = useState<StreakData>({
    current: 7,
    longest: 12,
    lastAction: new Date(Date.now() - 1000 * 60 * 60 * 18),
    hoursUntilDecay: 6,
    isAgentActive: false,
    agentType: null,
    agentExpiresAt: null,
  });

  useEffect(() => {
    if (!address) return;
    // Poll contract every 30s
    const id = setInterval(() => {
      setData(prev => ({
        ...prev,
        hoursUntilDecay: Math.max(0, prev.hoursUntilDecay - 0.008),
      }));
    }, 30_000);
    return () => clearInterval(id);
  }, [address, chain]);

  return data;
}
