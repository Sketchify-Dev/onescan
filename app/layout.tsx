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
  title: "PQ Ticket | Quantum safe event ticketing on QoreChain",
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
        <header className="border-b border-line">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
            >
              <TicketMark size={22} />
              PQ Ticket
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/events/new"
                className="rounded-full px-4 py-2 font-medium hover:bg-ink/5"
              >
                Create event
              </Link>
              <Link
                href="/scan"
                className="rounded-full px-4 py-2 font-medium hover:bg-ink/5"
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
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-6 text-sm text-ink-muted sm:px-6">
            <p>Built for QoreChain Developer Fest, Build Before Q-Day.</p>
            <p>
              Testnet Diana, EVM 9800.{" "}
              <a
                href="https://explore.qore.network"
                className="underline underline-offset-4"
              >
                Explorer
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
