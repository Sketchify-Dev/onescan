"use client";

import { ConnectButton } from "@/components/ConnectButton";
import { CheckInForm } from "@/components/CheckInForm";

export default function ScanPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.02em]">
          Door scanner
        </h1>
        <p className="text-pretty leading-relaxed text-ink-muted">
          Only the organizer or an approved scanner wallet can check tickets
          in. Each ticket scans once. The PQ check runs onchain, so a classical
          key alone fails.
        </p>
      </div>
      <ConnectButton />
      <CheckInForm />
      <section className="flex flex-col gap-2 rounded-2xl border border-line p-6">
        <h2 className="font-semibold">What the judge will see</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-6 text-sm leading-relaxed text-ink-muted">
          <li>First scan of a fresh ticket: accepted, event recorded onchain.</li>
          <li>Second scan of the same ticket: rejected, already used.</li>
          <li>Forged check in with a leaked classical key: reverts, PQ check failed.</li>
        </ol>
      </section>
    </main>
  );
}
