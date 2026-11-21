const fs = require("fs");
const path = require("path");
const solc = require("solc");

const sourcePath = path.join(__dirname, "..", "contracts", "PqTicket.sol");
const outDir = path.join(__dirname, "..", "contracts", "out");
fs.mkdirSync(outDir, { recursive: true });

const source = fs.readFileSync(sourcePath, "utf8");
const input = {
  language: "Solidity",
  sources: { "PqTicket.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors || []).filter((e) => e.severity === "error");
if (errors.length > 0) {
  for (const e of errors) console.error(e.formattedMessage);
  process.exit(1);
}
for (const w of output.errors || []) {
  if (w.severity === "warning") console.warn(w.formattedMessage);
}

const contract = output.contracts["PqTicket.sol"]["PqTicket"];
fs.writeFileSync(
  path.join(outDir, "PqTicket.json"),
  JSON.stringify(
    { abi: contract.abi, bytecode: "0x" + contract.evm.bytecode.object },
    null,
    2
  )
);
console.log("Compiled PqTicket.sol to contracts/out/PqTicket.json");
