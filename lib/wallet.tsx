"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createWalletClient, custom, type Address } from "viem";
import { diana } from "@/lib/chain";

type WalletState = {
  address: Address | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  getWalletClient: () => ReturnType<typeof createWalletClient> | null;
};

const WalletContext = createContext<WalletState | null>(null);

async function findProvider(): Promise<{ provider: never; rdns: string } | null> {
  const { discoverQorexEip1193, findQorexEip1193 } = await import(
    "@qorechain/qorex-types"
  );
  const qorex = (await discoverQorexEip1193().catch(() => undefined)) ?? findQorexEip1193();
  if (qorex) return { provider: qorex as never, rdns: "QoreX" };
  const eth = (window as unknown as { ethereum?: never }).ethereum;
  if (eth) return { provider: eth, rdns: "injected" };
  return null;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [provider, setProvider] = useState<never | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const found = await findProvider();
      if (!found) {
        setError("No wallet found. Install QoreX and switch to testnet Diana.");
        return;
      }
      const wallet = createWalletClient({
        chain: diana,
        transport: custom(found.provider as never),
      });
      const list = (await wallet.requestAddresses()) as Address[];
      if (list.length === 0) {
        setError("Wallet returned no accounts. Unlock QoreX and try again.");
        return;
      }
      try {
        await wallet.switchChain({ id: diana.id });
      } catch {
        try {
          await wallet.addChain({ chain: diana });
          await wallet.switchChain({ id: diana.id });
        } catch {
          setError(
            "Add QoreChain Diana manually: RPC https://evm-testnet.qore.host, chain 9800, symbol QOR, explorer https://explore.qore.network. Then reconnect."
          );
          return;
        }
      }
      setProvider(found.provider);
      setAddress(list[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wallet connection failed.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setError(null);
  }, []);

  const getWalletClient = useCallback(() => {
    if (!provider || !address) return null;
    return createWalletClient({
      account: address,
      chain: diana,
      transport: custom(provider as never),
    });
  }, [provider, address]);

  const value = useMemo<WalletState>(
    () => ({
      address,
      connected: address !== null,
      connecting,
      error,
      connect,
      disconnect,
      getWalletClient,
    }),
    [address, connecting, error, connect, disconnect, getWalletClient]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet needs WalletProvider");
  return ctx;
}
