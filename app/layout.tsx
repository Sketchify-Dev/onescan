import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WalletProvider } from "@/lib/wallet";
import "./globals.css";

import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://onescan-qorechain.vercel.app"),
  title: "OneScan | Quantum safe event ticketing on QoreChain",
  description:
    "Soulbound event tickets on QoreChain testnet. One ticket per wallet, one scan at the door, forged entry rejected.",
  openGraph: {
    title: "OneScan | Quantum safe event ticketing on QoreChain",
    description:
      "Soulbound event tickets on QoreChain testnet. One ticket per wallet, one scan at the door.",
    url: "https://onescan-qorechain.vercel.app",
    siteName: "OneScan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneScan | Quantum safe event ticketing on QoreChain",
    description:
      "Soulbound event tickets on QoreChain testnet. One ticket per wallet, one scan at the door.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#4F46E5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
      <WalletProvider>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </WalletProvider>
      </body>
    </html>
  );
}
