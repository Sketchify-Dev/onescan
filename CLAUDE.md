# Qorechain CLAUDE.md

## Stack

Next.js 16.4.6 App Router, React 19.3, Tailwind 4.3.3, TypeScript.
Package manager: npm.
Chain: QoreChain testnet Diana, EVM chain id 9800.
EVM RPC: https://evm-testnet.qore.host
Explorer: https://explore.qore.network
Wallet: QoreX on testnet, EVM lane via viem.
Kits in use: @qorechain/sdk, @qorechain/evm plus viem, @qorechain/qoresign, @qorechain/pqc.

## Commands

npm run dev : local dev, check app boots and /api/health shows block.
npm run build : must pass before commit.
npm run lint : must pass before commit.
forge test : contract tests in contracts dir, all green before deploy.
npx create-qorechain-dapp reference only : README credits template lineage.

## Rules

Read node_modules/next/dist/docs/01-app/01-getting-started before writing any Next code. This Next version has breaking changes. Heed deprecation notices.
Follow repo AGENTS.md. Do not remove its block.
One core flow only: create event, mint soulbound ticket, scan check in, forged entry fails. No transfers, no resale, no refunds in v1.
Quantum Pass scope: create-qorechain-dapp lineage credited, QoreX connect, deploy on testnet Diana, at least one hybrid signed transaction in code path.
Contract rule: checkIn is organizer or approved scanner only, one scan per ticket, classical only call reverts.
Frontend rules: single column forms, labels above inputs, validate on blur, errors below field with what to do, loading plus disabled plus error states, 44px targets, visible focus, sentence case labels.
Writing rule: never use the em dash or en dash in output or files. Use commas, colons, or separate sentences. Plain hyphens are fine.
No mock chain. Every demo action hits testnet Diana and links to explorer.
README opens with How to Test plus test accounts and faucet steps.
Before any design or polish task, name 2 to 4 specific Tier A skills with reasons, load them, follow them, then run the UI polish pass.
Before every commit or submission, run build plus lint plus contract tests and confirm output.
