// One-time onboarding for the disposable deployer account (unified eth-native):
// 1. register its ML-DSA-87 key (MsgRegisterPQCKeyV2, classical bootstrap)
// 2. open an EVM authorisation window (MsgOpenEVMWindow, hybrid)
// After this, the account can send EVM transactions (deploy, create, mint).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function loadEnv() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=\s]+)=(.*)$/);
      if (m) process.env[m[1]] = m[2].trim();
    }
  } catch { /* no .env.local */ }
}

async function main() {
  loadEnv();
  const { StargateClient } = await import("@cosmjs/stargate");
  const sdk = await import("@qorechain/sdk");
  const rest = "https://api-testnet.qore.host";
  const rpc = "https://rpc-testnet.qore.host";
  const chainId = "qorechain-diana";

  const key = process.env.DEPLOYER_KEY;
  if (!key) throw new Error("Set DEPLOYER_KEY=0x... first (or in .env.local)");
  const seed32 = Buffer.from(key.replace(/^0x/, ""), "hex");

  // Deterministic PQ secret stored alongside (gitignored): same account every run.
  const storePath = path.join(__dirname, "..", ".pqc-key.json");
  let pqcSecret;
  try {
    pqcSecret = Buffer.from(JSON.parse(fs.readFileSync(storePath, "utf8")).pqcSecret, "hex");
  } catch {
    pqcSecret = crypto.randomBytes(32);
    fs.writeFileSync(storePath, JSON.stringify({ pqcSecret: pqcSecret.toString("hex") }));
  }

  const account = sdk.unifiedAccountFromSeed(seed32, { pqcSecret });
  console.log("evm:", account.evm);
  console.log("qor:", account.cosmos);

  const transport = await StargateClient.connect(rpc);
  const fee = { amount: [{ denom: "uqor", amount: "50000" }], gas: "400000" };

  async function signAndBroadcastOnce(signer, seq) {
    const { accountNumber, sequence } = await transport.getSequence(account.cosmos);
    return signer.signAndBroadcast(transport, {
      chainId,
      accountNumber,
      sequence: seq !== undefined ? seq : sequence,
      fee,
      messages: [],
    });
  }

  // Step 1: classical registration (chain accepts classical only for the key registration).
  const classical = new sdk.EthNativeSigner(account, { rest, signMode: "classical" });
  // Balance check first: unfunded accounts fail with a clear RPC error.
  try {
    const { accountNumber, sequence } = await transport.getSequence(account.cosmos);
    const regMsg = sdk.buildRegisterPqcKeyMsg(account.cosmos, {
      pqcKeypair: account.pqc,
      ecdsaPubkey: Buffer.from(String(account.publicKey).replace(/^0x/, ""), "hex"),
    });
    const res = await classical.signAndBroadcast(transport, {
      chainId, accountNumber, sequence, fee, messages: [regMsg],
    });
    console.log("registered:", res.transactionHash);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/already|exists|duplicate/i.test(msg)) {
      console.log("key already registered, continuing");
    } else {
      throw e;
    }
  }

  // Step 2: hybrid window open (needs pqcKeypair, auto-resolves sign bytes via rest).
  const w0 = await sdk.fetchEvmWindow({ rest, address: account.cosmos });
  console.log("window live:", w0.live);
  if (!w0.live) {
    const hybrid = new sdk.EthNativeSigner(account, { rest, signMode: "hybrid" });
    const { accountNumber, sequence } = await transport.getSequence(account.cosmos);
    const res = await hybrid.signAndBroadcast(transport, {
      chainId,
      accountNumber,
      sequence,
      fee,
      messages: [sdk.openEvmWindowMsg({
        sender: account.cosmos,
        blocks: 600,
        maxTxs: 20,
        maxValue: "20000000000000", // 0.02 QOR budget in uqor, covers value + fees
      })],
    });
    console.log("window opened:", res.transactionHash);
  }
  console.log("done. Now run: node scripts/deploy.cjs (DEPLOYER_KEY still required)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
