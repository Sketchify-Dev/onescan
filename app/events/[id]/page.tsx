"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { formatEther } from "viem";
import { useWallet } from "@/lib/wallet";
import { deployments, EXPLORER, publicClient } from "@/lib/chain";
import { PQTICKET_ABI } from "@/lib/contract";
import { ConnectButton } from "@/components/ConnectButton";
import { MintTicket } from "@/components/MintTicket";

type EventInfo = {
  organizer: `0x${string}`;
  name: string;
  dateUnix: bigint;
  price: bigint;
  maxSupply: bigint;
  minted: bigint;
  active: boolean;
};

const SEEDED: Record<string, { name: string; detail: string; price: string }> = {
  "campus-show": {
    name: "Campus Show Nov 30",
    detail: "Free entry, 200 seats, 1 ticket per wallet.",
    price: "Free",
  },
  "builders-meetup": {
    name: "Builders Meetup Dec 5",
    detail: "Paid entry in test QOR, proves the payment path.",
    price: "Paid",
  },
};

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { address } = useWallet();
  const { address: contract } = deployments();

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (id === null) return;
    if (SEEDED[id] || !contract) {
      setLoading(false);
      return;
    }
    const numeric = Number(id);
    if (!Number.isInteger(numeric) || numeric < 1) {
      setLoading(false);
      return;
    }
    publicClient()
      .readContract({
        address: contract,
        abi: PQTICKET_ABI,
        functionName: "events",
        args: [BigInt(numeric)],
      } as never)
      .then((res) => {
        const [organizer, name, dateUnix, price, maxSupply, minted, active] =
          res as [unknown, unknown, unknown, unknown, unknown, unknown, unknown] as [
            `0x${string}`,
            string,
            bigint,
            bigint,
            bigint,
            bigint,
            boolean
          ];
        if (!name) {
          setLoading(false);
          return;
        }
        setEvent({ organizer, name, dateUnix, price, maxSupply, minted, active });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, contract]);

  if (id === null || loading) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-12 sm:px-6">
        <p className="text-ink-muted">Loading event.</p>
      </main>
    );
  }

  const seed = SEEDED[id];
  if (!event && !seed) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold">Event not found</h1>
        <p className="text-ink-muted">Check the event ID or create a new one.</p>
        <Link href="/" className="font-medium text-accent underline-offset-4 hover:underline">
          Back home
        </Link>
      </main>
    );
  }

  const title = event ? event.name : seed.name;
  const detail = event
    ? `${Number(event.minted)} of ${Number(event.maxSupply)} minted. ${event.active ? "Sales open." : "Sales closed."}`
    : seed.detail;
  const priceLabel = event ? `${formatEther(event.price)} QOR` : seed.price;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-ink-muted">
          {event ? (
            <>
              Onchain event #{id} ·{" "}
              <a
                href={`${EXPLORER}/address/${contract}`}
                className="underline underline-offset-4"
              >
                contract
              </a>
            </>
          ) : (
            "Seeded demo event"
          )}
        </p>
        <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.02em]">
          {title}
        </h1>
        <p className="text-pretty leading-relaxed text-ink-muted">{detail}</p>
      </div>
      <section className="flex flex-col gap-4 rounded-2xl border border-line p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your ticket</h2>
          <span className="rounded-full border border-line px-3 py-1 font-mono text-xs tabular-nums">
            {priceLabel}
          </span>
        </div>
        {event ? (
          <>
            <ConnectButton />
            <MintTicket eventId={BigInt(id)} priceWei={event.price} />
            {address && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="aspect-square w-48 bg-white p-3">
                  <QRCode value={`pqticket:${contract}:${id}:${address}`} className="h-full w-full" />
                </div>
                <p className="font-mono text-xs text-ink-muted">Scan at the door</p>
              </div>
            )}
            <Link
              href="/scan"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line px-6 font-medium"
            >
              Open scanner
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-ink-muted">
              Minting goes live with QoreX right after the contract deploys. One
              ticket per wallet, soulbound, no transfers.
            </p>
            <button
              disabled
              className="inline-flex min-h-[44px] cursor-not-allowed items-center justify-center rounded-full bg-accent px-6 font-medium text-accent-ink opacity-50"
            >
              Mint ticket, coming with contract
            </button>
          </>
        )}
      </section>
    </main>
  );
}
