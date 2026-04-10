"use client";
import {
  createContext, useContext, useState, useCallback,
  useRef, useEffect, ReactNode,
} from "react";

/* ══════════════════════════════════════════════════════════════
   WALLET CONTEXT
══════════════════════════════════════════════════════════════ */
export type Chain = "celo" | "stellar";

interface WalletCtx {
  address:        string | null;
  chain:          Chain;
  connecting:     boolean;
  connectCelo:    () => Promise<void>;
  connectStellar: () => Promise<void>;
  disconnect:     () => void;
}

const WalletContext = createContext<WalletCtx>({
  address: null, chain: "celo", connecting: false,
  connectCelo: async () => {}, connectStellar: async () => {}, disconnect: () => {},
});

export function useWalletCtx() { return useContext(WalletContext); }

function WalletProvider({ children }: { children: ReactNode }) {
  const [address,    setAddress]    = useState<string | null>(null);
  const [chain,      setChain]      = useState<Chain>("celo");
  const [connecting, setConnecting] = useState(false);

  const connectCelo = useCallback(async () => {
    setConnecting(true);
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts: string[] = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts[0]) {
          setAddress(accounts[0]);
          setChain("celo");
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId:         "0xAEF3",
              chainName:       "Celo Alfajores Testnet",
              rpcUrls:         ["https://alfajores-forno.celo-testnet.org"],
              nativeCurrency:  { name: "CELO", symbol: "CELO", decimals: 18 },
            }],
          });
        }
      } else {
        alert("Please install MetaMask to connect on Celo.");
      }
    } catch (e) { console.error(e); }
    setConnecting(false);
  }, []);

  const connectStellar = useCallback(async () => {
    setConnecting(true);
    try {
      if (typeof window !== "undefined" && (window as any).freighter) {
        const { publicKey } = await (window as any).freighter.getPublicKey();
        if (publicKey) { setAddress(publicKey); setChain("stellar"); }
      } else {
        alert("Please install Freighter wallet for Stellar.");
      }
    } catch (e) { console.error(e); }
    setConnecting(false);
  }, []);

  const disconnect = useCallback(() => setAddress(null), []);

  return (
    <WalletContext.Provider value={{ address, chain, connecting, connectCelo, connectStellar, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

/* ══════════════════════════════════════════════════════════════
   TOAST CONTEXT
══════════════════════════════════════════════════════════════ */
export type ToastType = "success" | "error" | "warning" | "milestone";

interface ToastItem {
  id:    string;
  type:  ToastType;
  title: string;
  body?: string;
}

interface ToastCtx {
  toast: (type: ToastType, title: string, body?: string) => void;
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export function useToast() { return useContext(ToastContext); }

const TOAST_ICONS: Record<ToastType, string> = {
  success:   "✓",
  error:     "✕",
  warning:   "⚠",
  milestone: "🏆",
};

const TOAST_STYLES: Record<ToastType, { border: string; icon: string; bg: string }> = {
  success:   { border: "rgba(0,204,102,0.4)",   icon: "#00CC66", bg: "rgba(0,204,102,0.08)"   },
  error:     { border: "rgba(255,51,51,0.4)",   icon: "#FF3333", bg: "rgba(255,51,51,0.08)"   },
  warning:   { border: "rgba(255,184,0,0.4)",   icon: "#FFB800", bg: "rgba(255,184,0,0.08)"   },
  milestone: { border: "rgba(255,184,0,0.5)",   icon: "#FFB800", bg: "rgba(255,184,0,0.12)"   },
};

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, title: string, body?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-4), { id, type, title, body }]);
    const duration = type === "milestone" ? 5500 : type === "error" ? 4500 : 3200;
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack */}
      <div
        className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 items-end"
        style={{ pointerEvents: "none" }}
      >
        {toasts.map(t => {
          const s = TOAST_STYLES[t.type];
          return (
            <div
              key={t.id}
              className="animate-slide-up"
              style={{
                pointerEvents:  "auto",
                background:     `linear-gradient(135deg, ${s.bg}, rgba(14,14,26,0.95))`,
                border:         `1px solid ${s.border}`,
                borderRadius:   "12px",
                padding:        "12px 14px",
                maxWidth:       "320px",
                backdropFilter: "blur(16px)",
                boxShadow:      `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)`,
                display:        "flex",
                gap:            "10px",
                alignItems:     "flex-start",
              }}
            >
              <span
                className="text-sm font-bold mt-0.5 flex-shrink-0"
                style={{ color: s.icon, textShadow: `0 0 8px ${s.icon}80` }}
              >
                {TOAST_ICONS[t.type]}
              </span>
              <div>
                <div
                  className="text-sm font-semibold leading-snug"
                  style={{ color: t.type === "milestone" ? "#FFB800" : "white" }}
                >
                  {t.title}
                </div>
                {t.body && (
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {t.body}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMBINED EXPORT
══════════════════════════════════════════════════════════════ */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </WalletProvider>
  );
}
