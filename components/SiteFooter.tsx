import Link from "next/link";
import { TicketMark } from "@/components/icons";
import { EXPLORER } from "@/lib/chain";

const CONTRACT = "0xd4A62117c4E5726f5A94A25Eb191261510c20Dac";

export function SiteFooter() {
  return (
    <footer className="bg-[#0B0C12] text-[#F4F3ED]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pt-12 pb-4 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="flex flex-col items-start gap-3">
          <p className="inline-flex items-center gap-2.5 text-base font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46E5] text-white">
              <TicketMark size={20} />
            </span>
            <span className="font-display font-bold">OneScan</span>
          </p>
          <p className="max-w-[42ch] text-[15px] leading-relaxed text-white/65">
            Soulbound event tickets on QoreChain testnet Diana. One ticket
            per wallet, one scan at the door, forged entry rejected
            onchain.
          </p>
          <p className="text-[15px] text-white/65">
            Built for QoreChain Developer Fest, Quantum Pass.
          </p>
        </div>
        <nav aria-label="Product" className="flex flex-col items-start gap-1">
          <p className="pb-2 text-[15px] font-semibold text-white/50">
            Product
          </p>
          <Link href="/events/new" className="inline-flex min-h-[44px] items-center py-1.5 text-[15px] text-white/80 underline-offset-4 hover:underline">
            Create an event
          </Link>
          <Link href="/events/7" className="inline-flex min-h-[44px] items-center py-1.5 text-[15px] text-white/80 underline-offset-4 hover:underline">
            Campus Show, live demo
          </Link>
          <Link href="/events/8" className="inline-flex min-h-[44px] items-center py-1.5 text-[15px] text-white/80 underline-offset-4 hover:underline">
            Builders Meetup, live demo
          </Link>
          <Link href="/scan" className="inline-flex min-h-[44px] items-center py-1.5 text-[15px] text-white/80 underline-offset-4 hover:underline">
            Open scanner
          </Link>
        </nav>
        <nav aria-label="Network" className="flex flex-col items-start gap-1">
          <p className="pb-2 text-[15px] font-semibold text-white/50">
            Network
          </p>
          <p className="inline-flex min-h-[44px] items-center py-1.5 text-[15px] text-white/60">Testnet Diana, EVM 9800</p>
          <a
            href={EXPLORER}
            className="inline-flex min-h-[44px] items-center py-1.5 text-[15px] text-white/80 underline underline-offset-4"
          >
            Explorer
          </a>
          <a
            href={`${EXPLORER}/address/${CONTRACT}`}
            className="inline-flex min-h-[44px] items-center py-1.5 font-mono text-[13px] text-white/80 underline underline-offset-4"
          >
            {CONTRACT.slice(0, 6)}...{CONTRACT.slice(-4)}
          </a>
        </nav>
        <nav aria-label="Resources" className="flex flex-col items-start gap-1">
          <p className="pb-2 text-[15px] font-semibold text-white/50">
            Resources
          </p>
          <Link href="/events/new" className="inline-flex min-h-[44px] items-center py-1.5 text-[15px] text-white/80 underline-offset-4 hover:underline">
            How to test
          </Link>
          <a
            href="https://github.com/Sketchify-Dev/onescan"
            className="inline-flex min-h-[44px] items-center py-1.5 text-[15px] text-white/80 underline underline-offset-4"
          >
            GitHub repository
          </a>
          <a
            href={`${EXPLORER}/address/${CONTRACT}`}
            className="inline-flex min-h-[44px] items-center py-1.5 text-[15px] text-white/80 underline underline-offset-4"
          >
            Contract source
          </a>
        </nav>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <p aria-hidden="true" className="font-display overflow-hidden text-[clamp(4rem,17vw,13rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white/[0.08] select-none">
          OneScan
        </p>
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
