"use client";
import { useState, useCallback } from "react";

export type Chain = "celo" | "stellar";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [chain, setChain] = useState<Chain>("celo");
  const [connecting, setConnecting] = useState(false);

  const connectCelo = useCallback(async () => {
    setConnecting(true);
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAddress(accounts[0] ?? null);
        setChain("celo");
        // Switch to Celo Alfajores
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0xAEF3",
            chainName: "Celo Alfajores Testnet",
            rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
            nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
          }],
        });
      }
    } catch (e) { console.error(e); }
    setConnecting(false);
  }, []);

  const connectStellar = useCallback(async () => {
    setConnecting(true);
    try {
      // Freighter wallet
      if (typeof window !== "undefined" && (window as any).freighter) {
        const { publicKey } = await (window as any).freighter.getPublicKey();
        setAddress(publicKey);
        setChain("stellar");
      } else {
        alert("Please install Freighter wallet for Stellar");
      }
    } catch (e) { console.error(e); }
    setConnecting(false);
  }, []);

  const disconnect = useCallback(() => setAddress(null), []);

  return { address, chain, connecting, connectCelo, connectStellar, disconnect };
}
