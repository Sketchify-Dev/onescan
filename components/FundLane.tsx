"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useWallet } from "@/lib/wallet";
import { REST_API, publicClient } from "@/lib/chain";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";

type WindowState =
  | { kind: "loading" }
  | { kind: "live"; remainingTxs: string; remainingBlocks: string }
  | { kind: "expired" }
  | { kind: "unavailable" };

export function FundLane() {
  const { address } = useWallet();
  const [evmBalance, setEvmBalance] = useState<bigint | null>(null);
  const [window, setWindow] = useState<WindowState>({ kind: "loading" });
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address) {
        if (!cancelled) {
          setEvmBalance(null);
          setWindow({ kind: "loading" });
        }
        return;
      }
      try {
        const { toQorAddress, evmWindowStatus } = await import("@qorechain/evm");
        const qor = toQorAddress(address);
        const bal = await publicClient().getBalance({ address });
        if (!cancelled) setEvmBalance(bal);
        try {
          const w = await evmWindowStatus({ rest: REST_API, address: qor });
          if (!cancelled) {
            setWindow(
              w.live
                ? { kind: "live", remainingTxs: String(w.remainingTxs), remainingBlocks: String(w.remainingBlocks) }
                : { kind: "expired" }
            );
          }
        } catch {
          if (!cancelled) setWindow({ kind: "unavailable" });
        }
      } catch {
        if (!cancelled) {
          setEvmBalance(null);
          setWindow({ kind: "unavailable" });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [address, refreshTick]);

  if (!address) return null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-semibold">
          <ArrowsLeftRightIcon size={18} weight="regular" aria-hidden="true" />
          EVM spending window
        </h2>
        <span className="font-mono text-sm tabular-nums">
          {evmBalance === null ? "loading." : `${formatEther(evmBalance)} QOR`}
        </span>
      </div>
      {window.kind === "live" && (
        <p role="status" className="text-sm text-success">
          Window live: {window.remainingTxs} txs left, {window.remainingBlocks} blocks left. Mint away.
        </p>
      )}
      {window.kind === "expired" && (
        <p role="alert" className="text-sm leading-relaxed text-danger">
          EVM window expired. Open a new window inside the QoreX app for this
          account, then tap Refresh below and mint.
        </p>
      )}
      <button
        type="button"
        onClick={() => setRefreshTick((t) => t + 1)}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line px-6 font-medium transition-transform enabled:active:scale-95"
      >
        <ArrowClockwiseIcon size={18} weight="regular" aria-hidden="true" />
        Refresh window status
      </button>
    </section>
  );
}
