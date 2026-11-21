// Seed the two homepage demo events onchain (Diana 9800).
// Campus Show Nov 30: free, 200 seats. Builders Meetup Dec 5: paid 1 test QOR.
// RPC goes through curl --resolve (IPv4-pinned, SNI intact): this sandbox has
// broken IPv6 egress and Node TLS fails against the raw IP.
// Requires DEPLOYER_KEY=0x... in env. Prints event IDs + tx links.
import { execFileSync } from "node:child_process";
import { lookup } from "node:dns/promises";
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
const CONTRACT = "0xd4A62117c4E5726f5a94A25Eb191261510c20Dac";
const CHAIN_ID = 9800;

const key = process.env.DEPLOYER_KEY;
if (!key) throw new Error("Set DEPLOYER_KEY=0x... first");

const { encodeFunctionData, parseEventLogs } = await import("viem");
const { privateKeyToAccount } = await import("viem/accounts");
const { mldsa } = await import("@qorechain/pqc");

const account = privateKeyToAccount(key);

const { address: V4 } = await lookup("evm-testnet.qore.host", { family: 4 });
const RESOLVE = `evm-testnet.qore.host:443:${V4}`;

function rpc(method, params) {
  const payload = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
  const out = execFileSync(
    "curl",
    ["-s", "--max-time", "30", "--resolve", RESOLVE,
     "-X", "POST", RPC, "-H", "Content-Type: application/json", "-d", payload],
    { encoding: "utf8", maxBuffer: 1 << 20 }
  );
  const j = JSON.parse(out);
  if (j.error) throw new Error(`RPC ${method}: ${JSON.stringify(j.error)}`);
  return j.result;
}

const sleep = (ms) => new Promise((s) => setTimeout(s, ms));

async function sendRaw(to, data, value = "0x0") {
  const nonce = rpc("eth_getTransactionCount", [account.address, "pending"]);
  const gasPrice = rpc("eth_gasPrice", []);
  const est = rpc("eth_estimateGas", [{ from: account.address, to, data, value }]);
  const gas = (BigInt(est) * 130n) / 100n; // 30% headroom
  const raw = await account.signTransaction({
    to, data, nonce: BigInt(nonce), gas,
    gasPrice: BigInt(gasPrice), value: BigInt(value), chainId: CHAIN_ID, type: "legacy",
  });
  const hash = rpc("eth_sendRawTransaction", [raw]);
  for (let i = 0; i < 60; i++) {
    const r = rpc("eth_getTransactionReceipt", [hash]);
    if (r) return { hash, receipt: r };
    await sleep(3000);
  }
  throw new Error(`no receipt for ${hash}`);
}

const toHex = (b) => `0x${Buffer.from(b).toString("hex")}`;
const link = (h) => `${EXPLORER}/tx/${h}`;

async function ensureEvent(name, dateISO, priceWei, maxSupply) {
  const orgKeys = mldsa.keygen();
  const dateUnix = BigInt(Math.floor(new Date(dateISO).getTime() / 1000));
  const data = encodeFunctionData({
    abi: ABI, functionName: "createEvent",
    args: [name, dateUnix, priceWei, maxSupply, [], [], toHex(orgKeys.publicKey)],
  });
  const { hash, receipt } = await sendRaw(CONTRACT, data);
  console.log(`  tx sent: ${hash} status=${receipt.status} logs=${receipt.logs.length} ${link(hash)}`);
  const logs = parseEventLogs({ abi: ABI, logs: receipt.logs, eventName: "EventCreated" });
  console.log(`  parsed EventCreated logs: ${logs.length}`);
  const id = logs[0].args.eventId.toString();
  console.log(`${name}: eventId=${id} tx=${hash} ${link(hash)}`);
  console.log(`  organizer PQ secret (save for /scan demo): ${toHex(orgKeys.secretKey)}`);
  return id;
}

const campus = await ensureEvent("Campus Show Nov 30", "2026-11-30T18:00:00Z", 0n, 200n);
const builders = await ensureEvent("Builders Meetup Dec 5", "2026-12-05T19:00:00Z", 1000000000000000000n, 100n);
console.log(JSON.stringify({ campus, builders }, null, 2));
