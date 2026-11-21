"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { deployments, EXPLORER } from "@/lib/chain";
import { PQTICKET_ABI } from "@/lib/contract";

type Result =
  | { kind: "idle" }
  | { kind: "ok"; tx: string }
  | { kind: "error"; message: string };

export function CheckInForm() {
  const { address, connected, getWalletClient } = useWallet();
  const [ticketId, setTicketId] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result>({ kind: "idle" });
  const { address: contract } = deployments();

  async function checkIn(e: React.FormEvent) {
    e.preventDefault();
    setResult({ kind: "idle" });
    if (!ticketId.trim()) {
      setResult({ kind: "error", message: "Enter a ticket ID or scan a QR code first." });
      return;
    }
    if (!contract) {
      setResult({ kind: "error", message: "Contract not deployed yet." });
      return;
    }
    const wallet = getWalletClient();
    if (!wallet || !address) {
      setResult({ kind: "error", message: "Connect the organizer or scanner wallet first." });
      return;
    }
    setPending(true);
    try {
      const { mldsa, shake256 } = await import("@qorechain/pqc");
      const { publicKey, secretKey } = mldsa.keygen();
      const message = shake256(
        new TextEncoder().encode(`pqticket:checkin:${ticketId.trim()}`),
        32
      );
      const signature = mldsa.sign(secretKey, message);
      const toHex = (b: Uint8Array) => `0x${Buffer.from(b).toString("hex")}` as const;
      const hash = await wallet.writeContract({
        address: contract,
        abi: PQTICKET_ABI,
        functionName: "checkIn",
        args: [BigInt(ticketId.trim()), toHex(signature), toHex(message)],
        account: address,
        chain: wallet.chain,
      } as never);
      void publicKey;
      setResult({ kind: "ok", tx: hash as string });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Check in failed.";
      if (msg.includes("AlreadyUsed")) {
        setResult({ kind: "error", message: "Rejected: ticket already used." });
      } else if (msg.includes("NotAuthorized")) {
        setResult({ kind: "error", message: "Rejected: this wallet is not the organizer or a scanner." });
      } else if (msg.includes("PqCheckFailed")) {
        setResult({ kind: "error", message: "Rejected: PQ check failed, classical key alone cannot check in." });
      } else {
        setResult({ kind: "error", message: msg.slice(0, 220) });
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={checkIn} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="ticket" className="text-sm font-medium">
            Ticket ID
          </label>
          <input
            id="ticket"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="e.g. 1"
            inputMode="numeric"
            className="min-h-[44px] rounded-xl border border-line bg-transparent px-4 font-mono text-[16px] tabular-nums outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={pending || !connected}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 font-medium text-accent-ink transition-transform enabled:active:scale-95 disabled:opacity-50"
        >
          {pending ? "Checking in." : "Check in"}
        </button>
        {!connected && (
          <p className="text-sm text-ink-muted">
            Connect the organizer or scanner wallet to check tickets in.
          </p>
        )}
      </form>
      {result.kind === "ok" && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-success/40 p-5">
          <span aria-hidden="true" className="text-xl text-success">✓</span>
          <p className="text-[16px] leading-relaxed text-success">
            Checked in.{" "}
            <a href={`${EXPLORER}/tx/${result.tx}`} className="underline underline-offset-4">
              View on explorer
            </a>
          </p>
        </div>
      )}
      {result.kind === "error" && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-danger/40 p-5">
          <span aria-hidden="true" className="text-xl text-danger">✕</span>
          <p className="text-[16px] leading-relaxed text-danger">{result.message}</p>
        </div>
      )}
    </div>
  );
}
