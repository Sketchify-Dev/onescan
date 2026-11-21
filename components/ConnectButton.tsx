"use client";

import { WalletIcon } from "@phosphor-icons/react";
import { useWallet } from "@/lib/wallet";

export function ConnectButton() {
  const { address, connected, connecting, error, connect, disconnect } =
    useWallet();

  if (!connected) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={connect}
          disabled={connecting}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-ink transition-transform enabled:active:scale-95 disabled:opacity-50"
        >
          <WalletIcon size={18} weight="regular" aria-hidden="true" />
          {connecting ? "Connecting." : "Connect QoreX"}
        </button>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full border border-line px-4 py-2 font-mono text-sm tabular-nums">
        {address?.slice(0, 6)}.{address?.slice(-4)}
      </span>
      <button
        onClick={disconnect}
        className="inline-flex min-h-[44px] items-center rounded-full border border-line px-5 text-sm font-medium transition-transform enabled:active:scale-95"
      >
        Disconnect
      </button>
    </div>
  );
}
