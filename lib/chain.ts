import { createPublicClient, defineChain, http } from "viem";

export const EVM_RPC = "https://evm-testnet.qore.host";
export const REST_API = "https://api-testnet.qore.host";
export const EXPLORER = "https://explore.qore.network";
export const CHAIN_ID = 9800;

export const diana = defineChain({
  id: CHAIN_ID,
  name: "QoreChain Diana Testnet",
  nativeCurrency: { name: "QOR", symbol: "QOR", decimals: 18 },
  rpcUrls: { default: { http: [EVM_RPC] } },
  blockExplorers: { default: { name: "QoreChain Explorer", url: EXPLORER } },
  testnet: true,
});

export function publicClient() {
  return createPublicClient({
    chain: diana,
    transport: http(EVM_RPC),
  });
}

export function deployments() {
  const address = process.env.NEXT_PUBLIC_PQTICKET_ADDRESS as
    | `0x${string}`
    | undefined;
  return { address };
}
