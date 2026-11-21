"use client";

import QRCode from "react-qr-code";

export function TicketQr({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <div className="aspect-square w-48 border border-line bg-white p-3">
        <QRCode
          value={value}
          className="h-full w-full"
          aria-label={`Ticket QR code for ticket ${value}`}
        />
      </div>
      <p className="font-mono text-xs tabular-nums text-ink-muted">
        Ticket {value}
      </p>
      <p className="text-[13px] text-ink-muted">Show this at the door</p>
    </div>
  );
}
