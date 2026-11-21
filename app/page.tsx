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
import { EXPLORER, deployments } from "@/lib/chain";

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

const CONTRACT_FALLBACK = "0xd4A62117c4E5726f5a94A25Eb191261510c20Dac";

function shortHash(hash: string): string {
return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

const DEMO_EVENTS = [
{
id: "7",
name: "Campus Show Nov 30",
detail: "Free entry, 200 seats, 1 ticket per wallet. Created onchain.",
price: "Free",
createTx:
"0x44827b688d7033cb657b7e4d56afbe1d865c1711b32f5b695cbd993f37b20a8e",
},
{
id: "8",
name: "Builders Meetup Dec 5",
detail: "Paid entry in test QOR. Proves the payment path end to end.",
price: "1 QOR",
createTx:
"0xf2addba6a83dda3b9979d91124bac11a046fa6784d89532c418256f7eaa097b4",
},
];

const PROOF_TXS = [
{
label: "Event created",
hash: "0xac7ce1d476250a25b6bbcd26a210fce35bceb8a6f5a07007eb78e0a9ba1cb026",
},
{
label: "Ticket minted",
hash: "0xe0932144041438873fd5c8adfdd381cc75d8330a3e80e0a8f9070364ea6340bb",
},
{
label: "Checked in once",
hash: "0x7af5a98c7f5f0b29523e974ce11cc1297df8aebc647233e8b1e7cf3d76807e57",
},
{
label: "Second scan reverted",
hash: "0xd91577a1de4fcde11eabb6c1943eaff6e9a61e37926e7cf8c0a35cd49e201d8a",
},
{
label: "Forged key reverted",
hash: "0xd8a3e3d106a19dd600ded6c3acae9fbe37d2fe83078807b4f0c5f0a1994b7b56",
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
body: "Check in needs organizer or scanner PQ approval. A classical key alone reverts.",
icon: ShieldMark,
},
];

const TEST_STEPS = [
"Install QoreX, switch to testnet Diana, fund with test QOR.",
"Open a seeded event and mint 1 ticket with QoreX.",
"Open Scan as the organizer, check the ticket in once.",
"Scan again and confirm it is rejected as already used.",
"Try a classical only forged check in and confirm it reverts.",
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
<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
<p className="text-sm text-ink-muted">Loading testnet status.</p>
</main>
);
}

async function HomeContent() {
const health = await getHealth();
const contract = deployments().address ?? CONTRACT_FALLBACK;

return (
<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-12 sm:gap-20 sm:px-6 sm:py-16">
<section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
<div className="pq-entrance flex flex-col gap-6">
<p className="inline-flex w-fit items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink-muted">
<TicketMark size={16} />
QoreChain Developer Fest, Quantum Pass
</p>
<h1 className="font-display max-w-2xl text-balance text-[clamp(2.75rem,6vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.02em]">
Forwarded QR codes kill small events.{" "}
<em className="font-editorial font-normal">OneScan holds the door.</em>
</h1>
<p className="max-w-[62ch] text-pretty text-lg leading-relaxed text-ink-muted">
Each ticket is soulbound to one wallet on QoreChain testnet Diana.
The organizer or an approved scanner checks it in once, onchain. A
leaked classical key cannot forge entry or move the ticket.
</p>
<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
<span className="font-mono tabular-nums">{health.latestBlock}</span>.
</span>
) : (
<span>Testnet RPC unreachable right now.</span>
)}
</div>
</div>

<aside
aria-label="Sample soulbound ticket"
className="pq-entrance pq-entrance-1 overflow-hidden rounded-3xl border border-line"
>
<div className="flex items-center justify-between gap-3 bg-ink/[0.04] px-6 py-4">
<p className="text-sm font-semibold tracking-[0.08em] uppercase">
Admit one
</p>
<span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
<ShieldMark size={14} />
Soulbound
</span>
</div>
<div className="flex flex-col gap-4 px-6 py-6">
<div className="flex items-start justify-between gap-3">
<div className="flex flex-col gap-1">
<p className="font-display text-2xl font-bold tracking-[-0.01em]">
Campus Show
</p>
<p className="text-sm text-ink-muted">Nov 30, testnet Diana</p>
</div>
<TicketMark size={32} className="text-accent" />
</div>
<dl className="flex flex-col gap-3 border-t border-dashed border-line pt-4 text-sm">
<div className="flex items-center justify-between gap-3">
<dt className="text-ink-muted">Ticket</dt>
<dd className="font-mono tabular-nums">#3, 1 per wallet</dd>
</div>
<div className="flex items-center justify-between gap-3">
<dt className="text-ink-muted">Status</dt>
<dd className="font-medium text-success">Unused, scannable</dd>
</div>
<div className="flex items-center justify-between gap-3">
<dt className="text-ink-muted">Contract</dt>
<dd className="font-mono tabular-nums">
<a
href={`${EXPLORER}/address/${contract}`}
className="underline underline-offset-4"
>
{contract.slice(0, 6)}...{contract.slice(-4)}
</a>
</dd>
</div>
</dl>
<Link
href="/events/7"
className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line px-6 font-medium transition-transform enabled:active:scale-95"
>
View the live event
</Link>
</div>
</aside>
</section>

<section className="pq-entrance pq-entrance-2 flex flex-col gap-5">
<div className="flex flex-col gap-2">
<p className="text-sm font-semibold tracking-[0.08em] text-accent uppercase">
Proof, not promises
</p>
<h2 className="font-display text-3xl font-bold tracking-[-0.01em] sm:text-4xl">
Every claim links to a transaction
</h2>
<p className="max-w-[70ch] leading-relaxed text-ink-muted">
The full door cycle ran on testnet Diana: create, mint, check in,
then two reverted attacks. Open any hash in the explorer.
</p>
</div>
<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
{PROOF_TXS.map((tx) => (
<li
key={tx.hash}
className="flex flex-col gap-2 rounded-2xl border border-line p-4"
>
<p className="text-sm font-semibold">{tx.label}</p>
<a
href={`${EXPLORER}/tx/${tx.hash}`}
className="font-mono text-xs break-all text-accent underline-offset-4 hover:underline"
>
{shortHash(tx.hash)}
</a>
</li>
))}
</ul>
</section>

<section className="flex flex-col gap-5">
<div className="flex flex-wrap items-end justify-between gap-3">
<h2 className="font-display text-3xl font-bold tracking-[-0.01em] sm:text-4xl">
Seeded demo events
</h2>
<p className="text-sm text-ink-muted">
Live on Diana, ready to mint against.
</p>
</div>
<div className="grid gap-4 md:grid-cols-2">
{DEMO_EVENTS.map((event, index) => (
<article
key={event.id}
className={`flex flex-col gap-4 rounded-3xl border border-line p-6 sm:p-8 ${index === 0 ? "pq-entrance pq-entrance-1" : "pq-entrance pq-entrance-2"}`}
>
<div className="flex items-start justify-between gap-3">
<div className="flex flex-col gap-1">
<p className="font-mono text-xs text-ink-muted tabular-nums">
Event #{event.id}
</p>
<h3 className="font-display text-2xl font-bold tracking-[-0.01em]">
{event.name}
</h3>
</div>
<span className="rounded-full border border-line px-3 py-1 text-xs font-medium whitespace-nowrap">
{event.price}
</span>
</div>
<p className="text-[16px] leading-relaxed text-ink-muted">
{event.detail}
</p>
<div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
<Link
href={`/events/${event.id}`}
className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-ink transition-transform enabled:active:scale-95"
>
<TicketMark size={18} />
Open event
</Link>
<a
href={`${EXPLORER}/tx/${event.createTx}`}
className="inline-flex min-h-[44px] items-center font-medium text-accent underline-offset-4 hover:underline"
>
Creation tx
</a>
</div>
</article>
))}
</div>
</section>

<section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
<div className="flex flex-col gap-3">
<p className="text-sm font-semibold tracking-[0.08em] text-accent uppercase">
For judges
</p>
<h2 className="font-display text-3xl font-bold tracking-[-0.01em] sm:text-4xl">
How to test in five steps
</h2>
<p className="leading-relaxed text-ink-muted">
Every step touches testnet Diana and links back to the explorer.
No staging, no mocks.
</p>
</div>
<ol className="flex flex-col gap-0">
{TEST_STEPS.map((step, index) => (
<li
key={step}
className="flex gap-4 border-t border-line py-4 last:border-b"
>
<span
aria-hidden="true"
className="font-mono text-sm font-semibold text-accent tabular-nums"
>
{String(index + 1).padStart(2, "0")}
</span>
<p className="text-[16px] leading-relaxed">{step}</p>
</li>
))}
</ol>
</section>

<section className="flex flex-col gap-5">
<h2 className="font-display text-3xl font-bold tracking-[-0.01em] sm:text-4xl">
Why quantum safe
</h2>
<div className="grid gap-4 sm:grid-cols-3">
{WHY_CARDS.map((card) => (
<article
key={card.title}
className="flex flex-col gap-3 rounded-3xl border border-line p-6 sm:p-8"
>
<span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10">
<card.icon size={22} className="text-accent" />
</span>
<h3 className="font-display text-xl font-bold">{card.title}</h3>
<p className="text-[16px] leading-relaxed text-ink-muted">
{card.body}
</p>
</article>
))}
</div>
</section>

<section className="flex flex-col items-start gap-4 overflow-hidden rounded-3xl bg-ink px-6 py-10 text-paper sm:px-10 sm:py-12 dark:bg-paper dark:text-ink">
<p className="inline-flex items-center gap-2 rounded-full border border-paper/25 px-4 py-1.5 text-sm font-medium dark:border-ink/25">
<ScanMark size={16} />
Built for the door, not the deck
</p>
<h2 className="font-display max-w-2xl text-balance text-3xl font-bold tracking-[-0.01em] sm:text-4xl">
Run the door yourself. Create an event, mint a ticket, scan it
once, then try to break it.
</h2>
<div className="flex flex-col gap-3 sm:flex-row">
<Link
href="/events/new"
className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-ink transition-transform enabled:active:scale-95"
>
<TicketMark size={18} />
Create an event
</Link>
<Link
href="/scan"
className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-paper/30 px-6 font-medium transition-transform enabled:active:scale-95 dark:border-ink/30"
>
<ScanMark size={18} />
Open scanner
</Link>
</div>
</section>
</main>
);
}
