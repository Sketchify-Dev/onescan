"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useWallet } from "@/lib/wallet";
import { deployments, EXPLORER, publicClient } from "@/lib/chain";
import { PQTICKET_ABI } from "@/lib/contract";
import { ConnectButton } from "@/components/ConnectButton";
import { MintTicket } from "@/components/MintTicket";
import { TicketQr } from "@/components/TicketQr";
import { CopyIcon, ScanIcon } from "@phosphor-icons/react";

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
  "7": {
    name: "Campus Show Nov 30",
    detail: "Free entry, 200 seats, 1 ticket per wallet.",
    price: "Free",
  },
  "8": {
    name: "Builders Meetup Dec 5",
    detail: "Paid entry in test QOR, proves the payment path.",
    price: "1 QOR",
  },
};

function useEvent(id: string | null, contract: `0x${string}` | undefined) {
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (id === null || !contract) {
        if (!cancelled) {
          setEvent(null);
          setLoading(false);
        }
        return;
      }
      const numeric = Number(id);
      if (!Number.isInteger(numeric) || numeric < 1) {
        if (!cancelled) {
          setEvent(null);
          setLoading(false);
        }
        return;
      }
      try {
        const res = (await publicClient().readContract({
          address: contract,
          abi: PQTICKET_ABI,
          functionName: "events",
          args: [BigInt(numeric)],
        } as never)) as unknown as [
          `0x${string}`,
          `0x${string}`,
          string,
          bigint,
          bigint,
          bigint,
          bigint,
          boolean
        ];
        if (!cancelled) {
          const [, organizer, name, dateUnix, price, maxSupply, minted, active] = res;
          setEvent(
            name
              ? { organizer, name, dateUnix, price, maxSupply, minted, active }
              : null
          );
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setEvent(null);
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, contract]);

  return { event, loading };
}

function useMyTicket(
  eventId: string,
  event: EventInfo | null,
  owner: `0x${string}` | null,
  contract: `0x${string}` | undefined
) {
  const [ticketId, setTicketId] = useState<bigint | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!event || !owner || !contract) {
        if (!cancelled) setTicketId(null);
        return;
      }
      try {
        const count = Number(event.minted);
        for (let i = 1; i <= count; i++) {
          const t = (await publicClient().readContract({
            address: contract,
            abi: PQTICKET_ABI,
            functionName: "tickets",
            args: [BigInt(i)],
          } as never)) as unknown as [
            bigint,
            `0x${string}`,
            `0x${string}`,
            boolean
          ];
          const [tEventId, tOwner] = t;
          if (
            tEventId === BigInt(eventId) &&
            tOwner.toLowerCase() === owner.toLowerCase()
          ) {
            if (!cancelled) setTicketId(BigInt(i));
            return;
          }
        }
        if (!cancelled) setTicketId(null);
      } catch {
        if (!cancelled) setTicketId(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [eventId, event, owner, contract]);

  return ticketId;
}

function EventBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { address, getWalletClient } = useWallet();
  const { address: contract } = deployments();
  const { event, loading } = useEvent(id, contract);
  const myTicket = useMyTicket(id, event, address, contract);
  const [scanners, setScanners] = useState<`0x${string}`[] | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [actionTx, setActionTx] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [walletBalance, setWalletBalance] = useState<bigint | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!contract || !event) {
        if (!cancelled) {
          setScanners(null);
          setBalance(null);
        }
        return;
      }
      try {
        const list = (await publicClient().readContract({
          address: contract,
          abi: PQTICKET_ABI,
          functionName: "scannersOf",
          args: [BigInt(id)],
        } as never)) as unknown as `0x${string}`[];
        const bal = await publicClient().getBalance({ address: contract });
        if (!cancelled) {
          setScanners(list);
          setBalance(bal);
        }
      } catch {
        if (!cancelled) {
          setScanners(null);
          setBalance(null);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [contract, event, id]);

  useEffect(() => {
    let cancelled = false;
    async function loadBalance() {
      if (!address) {
        if (!cancelled) setWalletBalance(null);
        return;
      }
      try {
        const bal = await publicClient().getBalance({ address });
        if (!cancelled) setWalletBalance(bal);
      } catch {
        if (!cancelled) setWalletBalance(null);
      }
    }
    loadBalance();
    return () => {
      cancelled = true;
    };
  }, [address]);

  async function withdraw() {
    setActionTx(null);
    setActionError(null);
    if (!contract) {
      setActionError("Contract not deployed yet.");
      return;
    }
    const wallet = getWalletClient();
    if (!wallet || !address) {
      setActionError("Connect the organizer wallet first.");
      return;
    }
    setActionPending(true);
    try {
      const hash = await wallet.writeContract({
        address: contract,
        abi: PQTICKET_ABI,
        functionName: "withdraw",
        args: [BigInt(id)],
        account: address,
        chain: wallet.chain,
      } as never);
      setActionTx(hash as string);
      const bal = await publicClient().getBalance({ address: contract });
      setBalance(bal);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Withdraw failed.";
      if (msg.includes("NotOrganizer")) {
        setActionError("Only the organizer can withdraw.");
      } else {
        setActionError(msg.slice(0, 200));
      }
    } finally {
      setActionPending(false);
    }
  }

  if (loading) {
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
        <h1 className="font-display text-3xl font-bold">Event not found</h1>
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
      <div className="pq-entrance flex flex-col gap-2">
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
            "Seeded demo event, connect to testnet for live data"
          )}
        </p>
        <h1 className="font-display text-balance text-3xl font-bold leading-[1.1] tracking-[-0.02em]">
          {title}
        </h1>
        <p className="text-pretty leading-relaxed text-ink-muted">{detail}</p>
      </div>
      <section className="pq-entrance pq-entrance-1 flex flex-col gap-4 rounded-2xl border border-line p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your ticket</h2>
          <span className="rounded-full border border-line px-3 py-1 font-mono text-xs tabular-nums">
            {priceLabel}
          </span>
        </div>
        {event ? (
          <>
            <ConnectButton />
            {address && (
              <div className="flex flex-col gap-2 rounded-2xl border border-line p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink-muted">EVM lane balance</span>
                  <span className="font-mono tabular-nums">
                    {walletBalance === null ? "loading." : `${formatEther(walletBalance)} QOR`}
                  </span>
                </div>
                {walletBalance !== null && walletBalance < event.price + BigInt(1000000000000000) && (
                  <p className="text-[13px] leading-relaxed text-ink-muted">
                    Your QOR may sit on the Cosmos lane (qor1 address) while this page spends from the EVM lane (0x address).
                    In QoreX, move a little QOR to your own 0x address, wait one block, then mint again.
                    Free events still need gas, paid events need price plus gas.
                  </p>
                )}
              </div>
            )}
            <MintTicket eventId={BigInt(id)} priceWei={event.price} />
            {myTicket !== null && <TicketQr value={myTicket.toString()} />}
            <Link
              href="/scan"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line px-6 font-medium transition-transform enabled:active:scale-95"
            >
              <ScanIcon size={18} weight="regular" aria-hidden="true" />
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
      {event && (
        <section className="flex flex-col gap-4 rounded-2xl border border-line p-6">
          <h2 className="font-semibold">Door staff</h2>
          {scanners === null ? (
            <p className="text-sm text-ink-muted">Loading scanner list.</p>
          ) : scanners.length === 0 ? (
            <p className="text-sm leading-relaxed text-ink-muted">
              Only the organizer can check tickets in. Add scanners at creation.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              <li className="flex items-center justify-between gap-3 font-mono text-sm">
                <span className="min-w-0 flex-1 break-all tabular-nums">{event.organizer}</span>
                <span className="shrink-0 rounded-full border border-line px-3 py-1 text-xs font-medium">
                  Organizer
                </span>
              </li>
              {scanners.map((s) => (
                <li key={s} className="flex items-center justify-between gap-3 font-mono text-sm">
                  <span className="min-w-0 flex-1 break-all tabular-nums">{s}</span>
                  <span className="shrink-0 rounded-full border border-line px-3 py-1 text-xs font-medium">
                    Scanner
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {event && (
        <section className="flex flex-col gap-3 rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Event balance</h2>
            <span className="font-mono text-sm tabular-nums">
              {balance === null ? "loading." : `${formatEther(balance)} QOR`}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-ink-muted">
            Paid mints collect here. Only the organizer wallet can withdraw.
          </p>
          <button
            onClick={withdraw}
            disabled={actionPending}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line px-6 font-medium transition-transform enabled:active:scale-95 disabled:opacity-50"
          >
            {actionPending ? "Withdrawing." : "Withdraw to organizer"}
          </button>
          {actionError && (
            <p role="alert" className="text-sm text-danger">
              {actionError}
            </p>
          )}
          {actionTx && (
            <p role="status" className="flex flex-wrap items-center gap-2 text-sm text-success">
              <span>Withdrawn.</span>
              <a
                href={`${EXPLORER}/tx/${actionTx}`}
                className="underline underline-offset-4"
              >
                View on explorer
              </a>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`${EXPLORER}/tx/${actionTx}`)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-line transition-transform enabled:active:scale-95"
                aria-label="Copy explorer link"
              >
                <CopyIcon size={18} weight="regular" aria-hidden="true" />
              </button>
            </p>
          )}
        </section>
      )}
    </main>
  );
}

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-12 sm:px-6">
          <p className="text-ink-muted">Loading event.</p>
        </main>
      }
    >
      <EventBody params={params} />
    </Suspense>
  );
}
