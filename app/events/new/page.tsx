"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useWallet } from "@/lib/wallet";
import { deployments, EXPLORER } from "@/lib/chain";
import { PQTICKET_ABI } from "@/lib/contract";
import { ConnectButton } from "@/components/ConnectButton";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { CopyIcon } from "@phosphor-icons/react";
import { XCircleIcon } from "@phosphor-icons/react";

type Status =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "ok"; tx: string; organizerSecret: string };

export default function NewEventPage() {
  const { address, connected, getWalletClient } = useWallet();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("0");
  const [supply, setSupply] = useState("200");
  const [scanners, setScanners] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, setPending] = useState(false);
  const { address: contract } = deployments();

  function validate(): string | null {
    if (name.trim().length < 3) return "Enter an event name, at least 3 characters.";
    if (!date) return "Pick a date and time for the event.";
    if (Number.isNaN(Number(price)) || Number(price) < 0)
      return "Price must be 0 or more, in test QOR.";
    if (!Number.isInteger(Number(supply)) || Number(supply) < 1)
      return "Max supply must be a whole number, 1 or more.";
    const list = scanners
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length > 3) return "Max 3 scanner wallets.";
    for (const s of list) {
      if (!/^0x[0-9a-fA-F]{40}$/.test(s)) return `Bad scanner address: ${s}`;
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "idle" });
    const problem = validate();
    if (problem) {
      setStatus({ kind: "error", message: problem });
      return;
    }
    if (!contract) {
      setStatus({ kind: "error", message: "Contract not deployed yet." });
      return;
    }
    const wallet = getWalletClient();
    if (!wallet || !address) {
      setStatus({ kind: "error", message: "Connect QoreX first." });
      return;
    }
    setPending(true);
    try {
      const scannerList = scanners
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean) as `0x${string}`[];
      const dateUnix = BigInt(Math.floor(new Date(date).getTime() / 1000));
      const { mldsa } = await import("@qorechain/pqc");
      const { publicKey: organizerKey, secretKey: organizerSecret } = mldsa.keygen();
      const toHex = (b: Uint8Array) => `0x${Buffer.from(b).toString("hex")}` as const;
      const hash = await wallet.writeContract({
        address: contract,
        abi: PQTICKET_ABI,
        functionName: "createEvent",
        args: [
          name.trim(),
          dateUnix,
          parseEther(price || "0"),
          BigInt(supply),
          scannerList,
          scannerList.map(() => toHex(organizerKey)),
          toHex(organizerKey),
        ],
        account: address,
        chain: wallet.chain,
      } as never);
      setStatus({ kind: "ok", tx: hash as string, organizerSecret: toHex(organizerSecret) });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Creation failed.";
      setStatus({ kind: "error", message: msg.slice(0, 220) });
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.02em]">
          Create an event
        </h1>
        <p className="text-pretty text-base leading-relaxed text-ink-muted">
          One event, soulbound tickets, one scan at the door. You are the
          organizer. Only you and up to 3 scanner wallets can check tickets in.
        </p>
      </div>
      <ConnectButton />
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Event name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Campus Show Nov 30"
            className="min-h-[44px] rounded-xl border border-line bg-transparent px-4 text-[16px] outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="date" className="text-sm font-medium">
            Date and time
          </label>
          <input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-[44px] rounded-xl border border-line bg-transparent px-4 text-[16px] outline-none focus:border-accent"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="price" className="text-sm font-medium">
              Price in test QOR
            </label>
            <input
              id="price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="min-h-[44px] rounded-xl border border-line bg-transparent px-4 font-mono text-[16px] tabular-nums outline-none focus:border-accent"
            />
            <p className="text-[13px] leading-relaxed text-ink-muted">
              Use 0 for a free event.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="supply" className="text-sm font-medium">
              Max supply
            </label>
            <input
              id="supply"
              inputMode="numeric"
              value={supply}
              onChange={(e) => setSupply(e.target.value)}
              className="min-h-[44px] rounded-xl border border-line bg-transparent px-4 font-mono text-[16px] tabular-nums outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="scanners" className="text-sm font-medium">
            Scanner wallets, optional
          </label>
          <textarea
            id="scanners"
            value={scanners}
            onChange={(e) => setScanners(e.target.value)}
            placeholder="0xabc..., 0xdef... (max 3, one per line or comma)"
            rows={3}
            className="rounded-xl border border-line bg-transparent px-4 py-3 font-mono text-sm outline-none focus:border-accent"
          />
          <p className="text-[13px] leading-relaxed text-ink-muted">
            Door staff wallets. Only these plus you can check tickets in. In
            v1 they share this event signing key, per scanner keys come next.
          </p>
        </div>
        {status.kind === "error" && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/40 px-4 py-3 text-sm text-danger">
            <XCircleIcon size={18} weight="regular" aria-hidden="true" className="shrink-0" />
            <span>{status.message}</span>
          </p>
        )}
        {status.kind === "ok" && (
          <div role="status" className="flex flex-col gap-2 rounded-xl border border-success/40 px-4 py-3 text-sm">
            <p className="inline-flex items-center gap-2 text-success">
              <CheckCircleIcon size={18} weight="regular" aria-hidden="true" />
              <span>
                Event created.{" "}
                <a href={`${EXPLORER}/tx/${status.tx}`} className="underline underline-offset-4">
                  View on explorer
                </a>
              </span>
            </p>
            <p className="text-ink-muted">
              Save this event signing key now. It checks tickets in at the door.
              It shows once.
            </p>
            <div className="flex items-start gap-2">
              <code className="min-w-0 flex-1 break-all rounded-lg border border-line p-3 font-mono text-xs">
                {status.organizerSecret}
              </code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(status.organizerSecret)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-line transition-transform enabled:active:scale-95"
                aria-label="Copy event signing key"
              >
                <CopyIcon size={18} weight="regular" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={pending || !connected}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 font-medium text-accent-ink transition-transform enabled:active:scale-95 disabled:opacity-50"
        >
          {pending ? "Creating." : "Create event onchain"}
        </button>
        {!connected && (
          <p className="text-sm text-ink-muted">Connect QoreX to create.</p>
        )}
      </form>
    </main>
  );
}
