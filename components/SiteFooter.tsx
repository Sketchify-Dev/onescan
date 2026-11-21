import Link from "next/link";
import { TicketMark } from "@/components/icons";
import { EXPLORER } from "@/lib/chain";

const CONTRACT = "0xd4A62117c4E5726f5A94A25Eb191261510c20Dac";

export function SiteFooter() {
return (
<footer className="bg-[#0B0C12] text-[#F4F3ED]">
<div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 text-sm sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
<div className="flex flex-col items-start gap-3">
<p className="inline-flex items-center gap-2.5 text-base font-semibold">
<span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46E5] text-white">
<TicketMark size={20} />
</span>
<span className="font-display font-bold">OneScan</span>
</p>
<p className="max-w-[42ch] leading-relaxed text-white/60">
Soulbound event tickets on QoreChain testnet Diana. One ticket
per wallet, one scan at the door, forged entry rejected
onchain.
</p>
<p className="text-white/60">
Built for QoreChain Developer Fest, Quantum Pass.
</p>
</div>
<nav aria-label="Product" className="flex flex-col items-start gap-1">
<p className="pb-2 text-xs font-semibold tracking-[0.08em] text-white/50 uppercase">
Product
</p>
<Link href="/events/new" className="w-fit py-1.5 text-white/80 underline-offset-4 hover:underline">
Create an event
</Link>
<Link href="/events/7" className="w-fit py-1.5 text-white/80 underline-offset-4 hover:underline">
Campus Show, live demo
</Link>
<Link href="/events/8" className="w-fit py-1.5 text-white/80 underline-offset-4 hover:underline">
Builders Meetup, live demo
</Link>
<Link href="/scan" className="w-fit py-1.5 text-white/80 underline-offset-4 hover:underline">
Open scanner
</Link>
</nav>
<nav aria-label="Network" className="flex flex-col items-start gap-1">
<p className="pb-2 text-xs font-semibold tracking-[0.08em] text-white/50 uppercase">
Network
</p>
<p className="py-1.5 text-white/60">Testnet Diana, EVM 9800</p>
<a
href={EXPLORER}
className="w-fit py-1.5 text-white/80 underline underline-offset-4"
>
Explorer
</a>
<a
href={`${EXPLORER}/address/${CONTRACT}`}
className="w-fit py-1.5 font-mono text-xs text-white/80 underline underline-offset-4"
>
{CONTRACT.slice(0, 6)}...{CONTRACT.slice(-4)}
</a>
</nav>
<nav aria-label="Resources" className="flex flex-col items-start gap-1">
<p className="pb-2 text-xs font-semibold tracking-[0.08em] text-white/50 uppercase">
Resources
</p>
<Link href="/events/new" className="w-fit py-1.5 text-white/80 underline-offset-4 hover:underline">
How to test
</Link>
<a
href="https://github.com/Sketchify-Dev/onescan"
className="w-fit py-1.5 text-white/80 underline underline-offset-4"
>
GitHub repository
</a>
<a
href={`${EXPLORER}/address/${CONTRACT}`}
className="w-fit py-1.5 text-white/80 underline underline-offset-4"
>
Contract source
</a>
</nav>
</div>
<div className="border-t border-white/10">
<div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
<p>OneScan, quantum safe ticketing on QoreChain testnet.</p>
<p className="font-mono tabular-nums">
Diana EVM 9800, PqTicket {CONTRACT.slice(0, 6)}...{CONTRACT.slice(-4)}
</p>
</div>
</div>
</footer>
);
}
