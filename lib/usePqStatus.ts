"use client";

import { useEffect, useState } from "react";
import { getAddress } from "viem";
import { publicClient } from "@/lib/chain";
import { PRECOMPILE_ADDRESSES, IQORE_PQC_ABI } from "@qorechain/evm";
import type { Address } from "viem";

type PqState =
  | { kind: "checking" }
  | { kind: "registered"; algorithmId: number }
  | { kind: "unregistered"; message: string }
  | { kind: "unavailable"; message: string };

async function fetchPqStatus(account: Address): Promise<PqState> {
  try {
    const res = (await publicClient().readContract({
      address: getAddress(PRECOMPILE_ADDRESSES.pqcKeyStatus),
      abi: IQORE_PQC_ABI,
      functionName: "pqcKeyStatus",
      args: [account],
    })) as unknown as [boolean, number, `0x${string}`];
    const [registered, algorithmId] = res;
    if (registered) return { kind: "registered", algorithmId: Number(algorithmId) };
    return {
      kind: "unregistered",
      message:
        "No ML-DSA-87 key registered for this wallet. Register your PQ key in QoreX first, then mint.",
    };
  } catch (e: unknown) {
    return {
      kind: "unavailable",
      message: e instanceof Error ? e.message.slice(0, 160) : "PQ status unreadable.",
    };
  }
}

export function usePqStatus(account: Address | null) {
  const [state, setState] = useState<PqState>(() =>
    account ? { kind: "checking" } : { kind: "unavailable", message: "Connect a wallet first." }
  );

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    fetchPqStatus(account).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [account]);

  return state;
}
