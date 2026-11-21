import Link from "next/link";
import { TicketMark } from "@/components/icons";
import { ConnectButton } from "@/components/ConnectButton";

export function SiteHeader() {
return (
<header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
<div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
<Link
href="/"
className="inline-flex min-h-[44px] items-center gap-2.5 text-lg font-semibold tracking-tight"
>
<span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink">
<TicketMark size={20} />
</span>
<span className="font-display font-bold">OneScan</span>
<span className="hidden rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-ink-muted sm:inline">
Quantum Pass
</span>
</Link>
<div className="flex items-center">
<ConnectButton compact />
</div>
</div>
</header>
);
}
