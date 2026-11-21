import Link from "next/link";
import { Suspense } from "react";
import {
  FingerprintMark,
  QrMark,
  ScanMark,
  ShieldMark,
  TicketMark,
} from "@/components/icons";
import { ConnectButton } from "@/components/ConnectButton";

type Health = {
  ok: boolean;
  latestBlock?: number;
  error?: string;
};

async function getHealth(): Promise<Health> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/health`,
      { cache: "no-store" }
    );
    if (!res.ok) return { ok: false, error: `status ${res.status}` };
    return (await res.json()) as Health;
  } catch {
    return { ok: false, error: "unreachable" };
  }
}

const DEMO_EVENTS = [
  {
    id: "7",
    name: "Campus Show Nov 30",
    detail: "Free entry, 200 seats, 1 ticket per wallet.",
    price: "Free",
  },
  {
    id: "8",
    name: "Builders Meetup Dec 5",
    detail: "Paid entry in test QOR, proves payment path.",
    price: "1 QOR",
  },
];

const WHY_CARDS = [
  {
    title: "Soulbound",
    body: "No transfer function. A screenshot cannot walk in.",
    icon: FingerprintMark,
  },
  {
    title: "One scan",
    body: "used flips true once. The second scan fails onchain.",
    icon: QrMark,
  },
  {
    title: "PQ gated",
    body: "Check in needs organizer or scanner PQ approval. Classical key alone reverts.",
    icon: ShieldMark,
  },
];

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm text-ink-muted">Loading testnet status.</p>
    </main>
  );
}

async function HomeContent() {
  const health = await getHealth();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
      <section className="pq-entrance flex flex-col gap-6">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted">
          <TicketMark size={16} />
          QoreChain Developer Fest, Quantum Pass
        </p>
        <h1 className="font-display max-w-2xl text-balance text-4xl font-bold leading-[1.05] tracking-[-0.01em] sm:text-5xl">
          Forwarded QR codes kill small events.{" "}
          <em className="font-editorial font-normal">OneScan fixes the door.</em>
        </h1>
        <p className="max-w-[70ch] text-pretty text-base leading-relaxed text-ink-muted">
          Each ticket is soulbound to one wallet on QoreChain testnet. The
          organizer or an approved scanner checks it in once, onchain. A leaked
          classical key cannot forge entry or transfer the ticket.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/events/new"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-ink transition-transform enabled:active:scale-95"
          >
            <TicketMark />
            Create an event
          </Link>
          <Link
            href="/scan"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line px-6 font-medium transition-transform enabled:active:scale-95"
          >
            <ScanMark />
            Open scanner
          </Link>
          <ConnectButton />
        </div>
        <div
          className="flex items-center gap-2 text-sm"
          role="status"
          aria-live="polite"
        >
          <span
            aria-hidden="true"
            className={`inline-block h-2.5 w-2.5 rounded-full ${health.ok ? "bg-success" : "bg-danger"}`}
          />
          {health.ok ? (
            <span>
              Testnet Diana live, latest block{" "}
              <span className="font-mono tabular-nums">
                {health.latestBlock}
              </span>
              .
            </span>
          ) : (
            <span>Testnet RPC unreachable right now.</span>
          )}
        </div>
      </section>

      <section className="pq-entrance pq-entrance-1 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">
          Seeded demo events
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {DEMO_EVENTS.map((event) => (
            <article
              key={event.id}
              className="flex flex-col gap-3 rounded-2xl border border-line p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <span className="rounded-full border border-line px-3 py-1 text-xs font-medium">
                  {event.price}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">
                {event.detail}
              </p>
              <Link
                href={`/events/${event.id}`}
                className="inline-flex min-h-[44px] items-center font-medium text-accent underline-offset-4 hover:underline"
              >
                View event
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="pq-entrance pq-entrance-2 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">
          How to test
        </h2>
        <ol className="flex list-decimal flex-col gap-2 pl-6 text-[16px] leading-relaxed">
          <li>Install QoreX, switch to testnet Diana, fund with test QOR.</li>
          <li>Open a seeded event and mint 1 ticket with QoreX.</li>
          <li>Open Scan as the organizer, check the ticket in once.</li>
          <li>Scan again and confirm it is rejected as already used.</li>
          <li>
            Try a classical only forged check in and confirm it reverts.
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">
          Why quantum safe
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {WHY_CARDS.map((card) => (
            <article
              key={card.title}
              className="flex flex-col gap-2 rounded-2xl border border-line p-6"
            >
              <card.icon size={22} className="text-accent" />
              <h3 className="font-semibold">{card.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
