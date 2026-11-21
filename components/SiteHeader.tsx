import Link from "next/link";
import { TicketMark } from "@/components/icons";
import { ConnectButton } from "@/components/ConnectButton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2.5 text-lg font-semibold tracking-tight"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink">
            <TicketMark size={20} />
          </span>
          <span className="font-display font-bold">OneScan</span>
          <span className="hidden rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-ink-muted md:inline">
            Quantum Pass
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <Link
            href="/events/7"
            className="inline-flex min-h-[44px] items-center px-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Campus Show
          </Link>
          <Link
            href="/events/8"
            className="inline-flex min-h-[44px] items-center px-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Builders Meetup
          </Link>
          <Link
            href="/scan"
            className="inline-flex min-h-[44px] items-center px-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Scanner
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/events/new"
            className="hidden min-h-[44px] items-center rounded-full border border-line px-5 text-sm font-medium transition-transform active:scale-95 sm:inline-flex"
          >
            Create event
          </Link>
          <ConnectButton compact />
        </div>
      </div>
    </header>
  );
}
