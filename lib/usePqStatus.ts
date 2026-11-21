"use client";

import { useEffect, useState } from "react";
import { publicClient } from "@/lib/chain";
import { PRECOMPILE_ADDRESSES, IQORE_PQC_ABI } from "@qorechain/evm";
import type { Address } from "viem";

type PqState =
  | { kind: "checking" }
  | { kind: "registered"; algorithmId: number }
  | { kind: "unregistered"; message: string }
  | { kind: "unavailable"; message: string };

export function usePqStatus(account: Address | null) {
  const [state, setState] = useState<PqState>({ kind: "checking" });

  useEffect(() => {
    if (!account) {
      setState({ kind: "unavailable", message: "Connect a wallet first." });
      return;
    }
    let cancelled = false;
    setState({ kind: "checking" });
    publicClient()
      .readContract({
        address: PRECOMPILE_ADDRESSES.pqcKeyStatus,
        abi: IQORE_PQC_ABI,
        functionName: "pqcKeyStatus",
        args: [account],
      })
      .then((res) => {
        if (cancelled) return;
        const [registered, algorithmId] = res as unknown as [boolean, number, `0x${string}`];
        if (registered) {
          setState({ kind: "registered", algorithmId: Number(algorithmId) });
        } else {
          setState({
            kind: "unregistered",
            message:
              "No ML-DSA-87 key registered for this wallet. Register your PQ key in QoreX first, then mint.",
          });
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setState({
          kind: "unavailable",
          message: e instanceof Error ? e.message.slice(0, 160) : "PQ status unreadable.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [account]);

  return state;
}
