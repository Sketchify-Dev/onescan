const fs = require("fs");
const path = require("path");

async function main() {
  const { createWalletClient, http, parseEther } = await import("viem");
  const { privateKeyToAccount } = await import("viem/accounts");
  const { qorechainTestnet } = await import("@qorechain/evm");
  const artifact = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "contracts", "out", "PqTicket.json"), "utf8")
  );

  const key = process.env.DEPLOYER_KEY;
  if (!key) throw new Error("Set DEPLOYER_KEY=0x... first");
  const account = privateKeyToAccount(key);
  const wallet = createWalletClient({
    account,
    chain: qorechainTestnet,
    transport: http("https://evm-testnet.qore.host"),
  });

  const hash = await wallet.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [],
  });
  console.log("deploy tx:", hash);

  const { createPublicClient } = await import("viem");
  const pub = createPublicClient({
    chain: qorechainTestnet,
    transport: http("https://evm-testnet.qore.host"),
  });
  const receipt = await pub.waitForTransactionReceipt({ hash });
  console.log("contract:", receipt.contractAddress);
  console.log("NEXT_PUBLIC_PQTICKET_ADDRESS=" + receipt.contractAddress);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
