"use client";

import { useEffect, useState } from "react";
import { WalletIcon } from "@phosphor-icons/react";
import { useWallet } from "@/lib/wallet";
import type { Address } from "viem";

function ShortAddr({ value }: { value: Address | string }) {
  const v = String(value);
  return (
    <span className="rounded-full border border-line px-4 py-2 font-mono text-sm tabular-nums">
      {v.slice(0, 6)}.{v.slice(-4)}
    </span>
  );
}

export function ConnectButton({ compact = false }: { compact?: boolean }) {
  const { address, nativeQor, connected, connecting, error, connect, disconnect } =
    useWallet();
  const [counterpart, setCounterpart] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function derive() {
      if (!address) {
        if (!cancelled) setCounterpart(null);
        return;
      }
      try {
        const { toQorAddress } = await import("@qorechain/evm");
        if (!cancelled) setCounterpart(toQorAddress(address));
      } catch {
        if (!cancelled) setCounterpart(null);
      }
    }
    derive();
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (!connected) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={connect}
          disabled={connecting}
          className={
            compact
              ? "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-transform enabled:active:scale-95 disabled:opacity-50"
              : "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-ink transition-transform enabled:active:scale-95 disabled:opacity-50"
          }
        >
          <WalletIcon size={18} weight="regular" aria-hidden="true" />
          {connecting ? "Connecting." : "Connect QoreX"}
        </button>
        {error && !compact && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {error && compact && (
          <span role="alert" className="sr-only">
            {error}
          </span>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {address && (
          <span className="hidden rounded-full border border-line px-4 py-2 font-mono text-sm tabular-nums sm:inline">
            {address.slice(0, 6)}.{address.slice(-4)}
          </span>
        )}
        <button
          onClick={disconnect}
          className="inline-flex min-h-[44px] items-center rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-transform enabled:active:scale-95 dark:bg-paper dark:text-ink"
        >
          {address
            ? `${address.slice(0, 4)}.${address.slice(-4)}`
            : "Disconnect"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {address && <ShortAddr value={address} />}
        <button
          onClick={disconnect}
          className="inline-flex min-h-[44px] items-center rounded-full border border-line px-5 text-sm font-medium transition-transform enabled:active:scale-95"
        >
          Disconnect
        </button>
      </div>
      {address && counterpart && (
        <p className="break-all font-mono text-xs text-ink-muted">
          This EVM address is {counterpart} on the native lane.
        </p>
      )}
      {nativeQor && counterpart && nativeQor.toLowerCase() !== counterpart.toLowerCase() && (
        <p className="break-all font-mono text-xs text-ink-muted">
          Funded wallet on native lane: {nativeQor}. The window opens from there.
        </p>
      )}
    </div>
  );
}
