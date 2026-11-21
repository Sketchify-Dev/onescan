"use client";

import { TicketIcon } from "@phosphor-icons/react";
import { ScanIcon } from "@phosphor-icons/react";
import { ShieldCheckIcon } from "@phosphor-icons/react";
import { QrCodeIcon } from "@phosphor-icons/react";
import { FingerprintIcon } from "@phosphor-icons/react";

type MarkProps = {
  size?: number;
  className?: string;
};

function mark(Icon: typeof TicketIcon) {
  return function Mark({ size = 18, className }: MarkProps) {
    return (
      <Icon size={size} weight="regular" aria-hidden="true" className={className} />
    );
  };
}

export const TicketMark = mark(TicketIcon);
export const ScanMark = mark(ScanIcon);
export const ShieldMark = mark(ShieldCheckIcon);
export const QrMark = mark(QrCodeIcon);
export const FingerprintMark = mark(FingerprintIcon);
