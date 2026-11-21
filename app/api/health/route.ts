const EVM_RPC = "https://evm-testnet.qore.host";
const EXPECTED_CHAIN_ID = 9800;

export async function GET() {
  try {
    const res = await fetch(EVM_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      return Response.json(
        { ok: false, rpc: EVM_RPC, error: `RPC status ${res.status}` },
        { status: 502 }
      );
    }
    const data = await res.json();
    const blockNumber = parseInt(data.result as string, 16);
    return Response.json({
      ok: true,
      network: "qorechain-diana",
      evmChainId: EXPECTED_CHAIN_ID,
      rpc: EVM_RPC,
      latestBlock: blockNumber,
      explorer: "https://explore.qore.network",
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        rpc: EVM_RPC,
        error: err instanceof Error ? err.message : "RPC unreachable",
      },
      { status: 502 }
    );
  }
}
