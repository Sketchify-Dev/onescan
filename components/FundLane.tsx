"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useWallet } from "@/lib/wallet";
import { REST_API, publicClient } from "@/lib/chain";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { XCircleIcon } from "@phosphor-icons/react";

type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "ok"; tx: string };

type WindowState =
  | { kind: "loading" }
  | { kind: "live"; remainingTxs: string; remainingBlocks: string }
  | { kind: "expired" }
  | { kind: "unavailable" };

const CHAIN_ID = "qorechain-diana";

export function FundLane() {
  const { address, nativeQor } = useWallet();
  const [qorAddress, setQorAddress] = useState<string | null>(null);
  const [evmBalance, setEvmBalance] = useState<bigint | null>(null);
  const [window, setWindow] = useState<WindowState>({ kind: "loading" });
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!address) {
        if (!cancelled) {
          setQorAddress(null);
          setEvmBalance(null);
          setWindow({ kind: "loading" });
        }
        return;
      }
      try {
        const { toQorAddress, evmWindowStatus } = await import("@qorechain/evm");
        const qor = toQorAddress(address);
        if (!cancelled) setQorAddress(qor);
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
          setQorAddress(null);
          setEvmBalance(null);
          setWindow({ kind: "unavailable" });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [address, status]);

  async function openWindow() {
    setStatus({ kind: "idle" });
    if (!address || !qorAddress) {
      setStatus({ kind: "error", message: "Connect QoreX first." });
      return;
    }
    setPending(true);
    try {
      const { getQorexNative, qorexSignAndBroadcast } = await import("@qorechain/qorex-types");
      const { openEvmWindowMessage } = await import("@qorechain/evm");
      const { qorechainRegistry } = await import("@qorechain/sdk");

      const native = getQorexNative();
      if (!native) {
        setStatus({ kind: "error", message: "Open this page in the QoreX mobile app browser. The PC extension cannot sign native lane messages." });
        return;
      }
      await native.enable(CHAIN_ID);
      const key = await native.getKey(CHAIN_ID);
      const signerQor = String(key.bech32Address ?? "");
      if (!signerQor) {
        setStatus({ kind: "error", message: "QoreX returned no native account. Unlock it and try again." });
        return;
      }

      const msg = openEvmWindowMessage({
        sender: signerQor,
        blocks: 600,
        maxTxs: 20,
        maxValue: "20000000000000",
      });
      const registry = qorechainRegistry();
      const encoded = registry.encode(msg);
      const res = await qorexSignAndBroadcast(
        {
          chainId: CHAIN_ID,
          messages: [{ typeUrl: msg.typeUrl, value: encoded }],
          memo: "OneScan EVM window",
          gasLimit: 400000,
        },
        { native }
      );
      if (res.code !== 0) {
        setStatus({ kind: "error", message: `Window open refused, code ${res.code}.` });
        return;
      }
      setStatus({ kind: "ok", tx: res.txHash });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Window open failed.";
      setStatus({ kind: "error", message: msg.slice(0, 220) });
    } finally {
      setPending(false);
    }
  }

  if (!address) return null;

  const lanesAgree =
    !!nativeQor && !!qorAddress && nativeQor.toLowerCase() === qorAddress.toLowerCase();

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
      {qorAddress && (
        <p className="break-all font-mono text-xs text-ink-muted">
          Minting wallet: {address} ({qorAddress})
        </p>
      )}
      {nativeQor && !lanesAgree && (
        <p className="break-all font-mono text-xs text-ink-muted">
          Window signer: {nativeQor} (your funded wallet, signs the window open)
        </p>
      )}
      {window.kind === "live" && (
        <p role="status" className="text-sm text-success">
          Window live: {window.remainingTxs} txs left, {window.remainingBlocks} blocks left. Mint away.
        </p>
      )}
      {window.kind === "expired" && (
        <p role="alert" className="text-sm leading-relaxed text-danger">
          EVM window expired. The chain refuses every EVM tx until you open a
          new one. This is the usual cause of mints that fail with balance
          showing fine.
        </p>
      )}
      <p className="text-sm leading-relaxed text-ink-muted">
        The window opens from your funded wallet and covers this minting wallet.
        Tap below, approve in QoreX, wait one block, then mint.
      </p>
      <button
        onClick={openWindow}
        disabled={pending}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 font-medium text-accent-ink transition-transform enabled:active:scale-95 disabled:opacity-50"
      >
        {pending ? "Opening." : "Open EVM window (600 blocks, 20 txs)"}
      </button>
      {status.kind === "error" && (
        <p role="alert" className="flex items-start gap-2 text-sm text-danger">
          <XCircleIcon size={18} weight="regular" aria-hidden="true" className="shrink-0" />
          <span>{status.message}</span>
        </p>
      )}
      {status.kind === "ok" && (
        <p role="status" className="flex items-start gap-2 text-sm text-success">
          <CheckCircleIcon size={18} weight="regular" aria-hidden="true" className="shrink-0" />
          <span>
            Window opened, tx {status.tx.slice(0, 18)}. Wait one block, then mint.
          </span>
        </p>
      )}
    </section>
  );
}
