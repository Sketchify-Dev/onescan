import type { Metadata } from "next";
import Link from "next/link";
import { TicketMark } from "@/components/icons";
import { WalletProvider } from "@/lib/wallet";
import "./globals.css";

import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneScan | Quantum safe event ticketing on QoreChain",
  description:
    "Soulbound event tickets on QoreChain testnet. One ticket per wallet, one scan at the door, forged entry rejected.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
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
            <nav aria-label="Primary" className="flex items-center gap-1 text-sm sm:gap-2">
              <Link
                href="/events/new"
                className="inline-flex min-h-[44px] items-center rounded-full px-4 py-2 font-medium hover:bg-ink/5"
              >
                Create event
              </Link>
              <Link
                href="/scan"
                className="inline-flex min-h-[44px] items-center rounded-full bg-ink px-4 py-2 font-medium text-paper transition-transform enabled:active:scale-95 dark:bg-paper dark:text-ink"
              >
                Scan
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <WalletProvider>{children}</WalletProvider>
        </div>
        <footer className="border-t border-line">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-[1.2fr_1fr_1fr] sm:px-6">
            <div className="flex flex-col gap-2">
              <p className="inline-flex items-center gap-2 text-base font-semibold text-ink">
                <TicketMark size={18} />
                OneScan
              </p>
              <p className="max-w-[42ch] leading-relaxed text-ink-muted">
                Soulbound event tickets on QoreChain testnet Diana. One
                ticket per wallet, one scan at the door.
              </p>
              <p className="text-ink-muted">
                Built for QoreChain Developer Fest, Quantum Pass.
              </p>
            </div>
            <nav aria-label="Product" className="flex flex-col gap-1">
              <p className="pb-1 text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">
                Product
              </p>
              <Link href="/events/new" className="w-fit py-1.5 underline-offset-4 hover:underline">
                Create an event
              </Link>
              <Link href="/events/7" className="w-fit py-1.5 underline-offset-4 hover:underline">
                Campus Show, live demo
              </Link>
              <Link href="/scan" className="w-fit py-1.5 underline-offset-4 hover:underline">
                Open scanner
              </Link>
            </nav>
            <nav aria-label="Network" className="flex flex-col gap-1">
              <p className="pb-1 text-xs font-semibold tracking-[0.08em] text-ink-muted uppercase">
                Network
              </p>
              <p className="py-1.5 text-ink-muted">
                QoreChain testnet Diana, EVM 9800
              </p>
              <a
                href="https://explore.qore.network"
                className="w-fit py-1.5 underline underline-offset-4"
              >
                Explorer
              </a>
              <a
                href="https://explore.qore.network/address/0xd4A62117c4E5726f5A94A25Eb191261510c20Dac"
                className="w-fit py-1.5 underline underline-offset-4"
              >
                PqTicket contract
              </a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
