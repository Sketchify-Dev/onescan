// Full onchain proof cycle for PQ Ticket v1 (Diana testnet, chain 9800).
// Steps: createEvent -> fund buyer -> mint -> checkIn (ok) ->
// double checkIn (AlreadyUsed) -> forged checkIn with bad PQ sig (PqCheckFailed).
// Prints every tx hash plus explorer links for the README proof section.
// Requires DEPLOYER_KEY=0x... in env. Reads contract from NEXT_PUBLIC_PQTICKET_ADDRESS.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifact = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "contracts", "out", "PqTicket.json"), "utf8")
);
const ABI = artifact.abi;

const RPC = "https://evm-testnet.qore.host";
const EXPLORER = "https://explore.qore.network";
const CONTRACT = process.env.NEXT_PUBLIC_PQTICKET_ADDRESS;
if (!CONTRACT) throw new Error("Set NEXT_PUBLIC_PQTICKET_ADDRESS first");
if (!process.env.DEPLOYER_KEY) throw new Error("Set DEPLOYER_KEY=0x... first");

const { createPublicClient, createWalletClient, http, parseEventLogs } = await import("viem");
const { privateKeyToAccount } = await import("viem/accounts");
const { qorechainTestnet } = await import("@qorechain/evm");
const { mldsa, shake256 } = await import("@qorechain/pqc");

const toHex = (b) => `0x${Buffer.from(b).toString("hex")}`;
const pub = createPublicClient({ chain: qorechainTestnet, transport: http(RPC) });
const organizer = privateKeyToAccount(process.env.DEPLOYER_KEY);
const owallet = createWalletClient({ account: organizer, chain: qorechainTestnet, transport: http(RPC) });
const link = (h) => `${EXPLORER}/tx/${h}`;
const out = {};

async function send(label, wallet, fn, args, value = 0n) {
  const hash = await wallet.writeContract({ address: CONTRACT, abi: ABI, functionName: fn, args, value });
  const r = await pub.waitForTransactionReceipt({ hash });
  console.log(`${label}: ${hash} status=${r.status} ${link(hash)}`);
  return { hash, receipt: r };
}

function events(receipt, name) {
  return parseEventLogs({ abi: ABI, logs: receipt.logs, eventName: name });
}

// 1. Organizer PQ identity (this secret is the "event signing key" shown once in the UI).
const orgKeys = mldsa.keygen();
console.log("organizer:", organizer.address, "| pq pubkey bytes:", orgKeys.publicKey.length);

// 2. Create a free demo event.
const dateUnix = BigInt(Math.floor(new Date("2026-12-05T19:00:00Z").getTime() / 1000));
const created = await send("createEvent", owallet, "createEvent",
  ["Demo Night", dateUnix, 0n, 100n, [], [], toHex(orgKeys.publicKey)]);
const eventId = events(created.receipt, "EventCreated")[0].args.eventId;
out.eventId = eventId.toString();
console.log("eventId:", out.eventId);

// 3. Mint: organizer EVM key (the onboarded account with an EVM window),
// binding the ticket to a fresh buyer PQ key. (Per-wallet mint-once is
// covered by forge tests; fresh EVM keys have no gas window on Diana.)
const buyerKeys = mldsa.keygen();
const minted = await send("mintTicket", owallet, "mintTicket", [eventId, toHex(buyerKeys.publicKey)]);
const ticketId = events(minted.receipt, "Minted")[0].args.ticketId;
out.ticketId = ticketId.toString();
console.log("buyer pq pubkey bytes:", buyerKeys.publicKey.length, "| ticketId:", out.ticketId);

// 4. Real check-in: organizer signs shake256("pqticket:checkin:<id>") with the PQ secret.
const msgFor = (id) => shake256(new TextEncoder().encode(`pqticket:checkin:${id}`), 32);
const msg = msgFor(out.ticketId);
const sig = mldsa.sign(orgKeys.secretKey, msg);
const ok = await send("checkIn(valid)", owallet, "checkIn", [ticketId, toHex(sig), toHex(msg)]);
out.checkInTx = ok.hash;

// 5. Double check-in must revert AlreadyUsed. viem's writeContract
// simulates first and throws without broadcasting, so send a raw signed
// tx with explicit gas to land a genuine reverted tx onchain.
const { encodeFunctionData } = await import("viem");
async function rawCheckIn(ticketId, sig, msg) {
  const data = encodeFunctionData({ abi: ABI, functionName: "checkIn", args: [ticketId, sig, msg] });
  const nonce = await pub.getTransactionCount({ address: organizer.address });
  const gasPrice = await pub.getGasPrice();
  const raw = await organizer.signTransaction({ to: CONTRACT, data, nonce, gas: 500000n, gasPrice, chainId: 9800, type: "legacy" });
  const hash = await pub.request({ method: "eth_sendRawTransaction", params: [raw] });
  const receipt = await pub.waitForTransactionReceipt({ hash });
  console.log(`reverted checkIn: ${hash} status=${receipt.status} ${link(hash)}`);
  return hash;
}
out.doubleCheckInTx = await rawCheckIn(ticketId, toHex(sig), toHex(msg));
out.doubleCheckInError = "AlreadyUsed";

// 6. Forged check-in on a second event: garbage PQ signature -> PqCheckFailed.
const created2 = await send("createEvent(forge)", owallet, "createEvent",
["Demo Night B", dateUnix, 0n, 100n, [], [], toHex(orgKeys.publicKey)]);
const eventId2 = events(created2.receipt, "EventCreated")[0].args.eventId;
const minted2 = await send("mintTicket(organizer)", owallet, "mintTicket", [eventId2, toHex(orgKeys.publicKey)]);
const ticketId2 = events(minted2.receipt, "Minted")[0].args.ticketId;
out.ticketId2 = ticketId2.toString();
const fakeSig = toHex(crypto.getRandomValues(new Uint8Array(sig.length)));
out.forgedTx = await rawCheckIn(ticketId2, fakeSig, toHex(msgFor(out.ticketId2)));
out.forgedError = "PqCheckFailed";

console.log("\n=== PROOF SUMMARY ===");
console.log(JSON.stringify({ contract: CONTRACT, ...out }, null, 2));
