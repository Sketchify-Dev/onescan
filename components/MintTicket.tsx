"use client";

import { useState } from "react";
import { decodeEventLog } from "viem";
import { useWallet } from "@/lib/wallet";
import { usePqStatus } from "@/lib/usePqStatus";
import { deployments, EXPLORER, publicClient } from "@/lib/chain";
import { PQTICKET_ABI } from "@/lib/contract";
import { TicketQr } from "@/components/TicketQr";
import { ShieldCheckIcon } from "@phosphor-icons/react";
import { CopyIcon } from "@phosphor-icons/react";
import { TicketIcon } from "@phosphor-icons/react";

export function MintTicket({ eventId, priceWei }: { eventId: bigint; priceWei: bigint }) {
  const { address, connected, getWalletClient } = useWallet();
  const pq = usePqStatus(address);
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { address: contract } = deployments();

  async function mint() {
    setError(null);
    setTxHash(null);
    setTicketId(null);
    if (!contract) {
      setError("Contract not deployed yet. Add NEXT_PUBLIC_PQTICKET_ADDRESS.");
      return;
    }
    const wallet = getWalletClient();
    if (!wallet || !address) {
      setError("Connect QoreX first.");
      return;
    }
    setPending(true);
    try {
      const { mldsa } = await import("@qorechain/pqc");
      const { publicKey } = mldsa.keygen();
      const hash = await wallet.writeContract({
        address: contract,
        abi: PQTICKET_ABI,
        functionName: "mintTicket",
        args: [eventId, `0x${Buffer.from(publicKey).toString("hex")}`],
        value: priceWei,
        account: address,
        chain: wallet.chain,
      } as never);
      setTxHash(hash as string);
      const receipt = await publicClient().waitForTransactionReceipt({
        hash: hash as `0x${string}`,
      });
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: PQTICKET_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (
            decoded.eventName === "Minted" &&
            (decoded.args as { owner?: string }).owner?.toLowerCase() ===
              address.toLowerCase()
          ) {
            setTicketId((decoded.args as { ticketId: bigint }).ticketId);
            break;
          }
        } catch {
          continue;
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Mint failed.";
      if (msg.includes("User rejected") || msg.includes("rejected")) {
        setError("Transaction rejected in wallet.");
      } else if (msg.includes("AlreadyHasTicket")) {
        setError("This wallet already minted a ticket for this event.");
      } else if (msg.includes("WrongPrice")) {
        setError("Wrong payment amount for this event.");
      } else if (msg.includes("SoldOut")) {
        setError("This event is sold out.");
      } else {
        setError(msg.slice(0, 200));
      }
    } finally {
      setPending(false);
    }
  }

  if (!connected) {
    return <p className="text-sm text-ink-muted">Connect QoreX to mint.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {pq.kind === "checking" && (
        <p role="status" className="text-sm text-ink-muted">
          Checking PQ key status onchain.
        </p>
      )}
      {pq.kind === "registered" && (
        <p role="status" className="inline-flex items-center gap-2 text-sm text-success">
          <ShieldCheckIcon size={18} weight="regular" aria-hidden="true" />
          <span>
            PQ ready: ML-DSA-87 key registered onchain (algorithm{" "}
            {pq.algorithmId}).
          </span>
        </p>
      )}
      {pq.kind === "unregistered" && (
        <p role="alert" className="text-sm text-danger">
          {pq.message}
        </p>
      )}
      <button
        onClick={mint}
        disabled={pending || pq.kind !== "registered"}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-ink transition-transform enabled:active:scale-95 disabled:opacity-50"
      >
        <TicketIcon size={18} weight="regular" aria-hidden="true" />
        {pending ? "Minting." : "Mint ticket"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {txHash && (
        <p role="status" className="flex flex-wrap items-center gap-2 text-sm text-success">
          <span>Minted.</span>
          <a
            href={`${EXPLORER}/tx/${txHash}`}
            className="underline underline-offset-4"
          >
            View on explorer
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(`${EXPLORER}/tx/${txHash}`)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-line transition-transform enabled:active:scale-95"
            aria-label="Copy explorer link"
          >
            <CopyIcon size={18} weight="regular" aria-hidden="true" />
          </button>
        </p>
      )}
      {ticketId !== null && (
        <div className="pq-pop">
          <TicketQr value={ticketId.toString()} />
        </div>
      )}
    </div>
  );
}
