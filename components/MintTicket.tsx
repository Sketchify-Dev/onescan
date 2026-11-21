"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { usePqStatus } from "@/lib/usePqStatus";
import { deployments, EXPLORER } from "@/lib/chain";
import { PQTICKET_ABI } from "@/lib/contract";

export function MintTicket({ eventId, priceWei }: { eventId: bigint; priceWei: bigint }) {
  const { address, connected, getWalletClient } = useWallet();
  const pq = usePqStatus(address);
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { address: contract } = deployments();

  async function mint() {
    setError(null);
    setTxHash(null);
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
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Mint failed.";
      if (msg.includes("User rejected") || msg.includes("rejected")) {
        setError("Transaction rejected in wallet.");
      } else if (msg.includes("no-pqc-key") || msg.includes("no-window")) {
        setError("EVM window closed. Open the PQ authorization window first.");
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
      {pq.kind === "registered" && (
        <p role="status" className="text-sm text-success">
          PQ ready: ML-DSA-87 key registered onchain (algorithm {pq.algorithmId}).
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
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 font-medium text-accent-ink transition-transform enabled:active:scale-95 disabled:opacity-50"
      >
        {pending ? "Minting." : "Mint ticket"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {txHash && (
        <p role="status" className="text-sm text-success">
          Minted.{" "}
          <a
            href={`${EXPLORER}/tx/${txHash}`}
            className="underline underline-offset-4"
          >
            View on explorer
          </a>
        </p>
      )}
    </div>
  );
}
