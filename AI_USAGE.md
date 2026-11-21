# AI Usage

Best AI Native Build evidence for PQ Ticket, QoreChain Developer Fest.

## Workflow

- Coding agent (Claude Code) for scaffolding, contract, frontend, tests, docs. Human reviewed every file, ran builds, and made all product calls.
- QoreChain MCP plus kit READMEs as the source of truth for `pqcVerify` precompile (`0x...0A01`), `pqcKeyStatus` (`0x...0A02`), EVM window rules, and QoreX provider behavior. No memorized APIs.
- Browser verification loop: build, read the error, fix, rebuild. Every fix in git history with passing `npm run build` plus `forge test`.

## Generated work

- `contracts/PqTicket.sol`: soulbound mint, scanner allowlist, enrolled key PQ check, Foundry harness plus 6 tests.
- Next.js App Router pages: home, event create, event detail with live reads, scanner, health route.
- `lib/wallet.tsx`, `lib/usePqStatus.ts`, `components/*`: QoreX EIP-6963 connect, PQ registration gate, mint, session key check in.
- `PLAN.md`, `design.md`, `README.md`, this file.

## Human contribution

- Category pick after reading all 109 projects plus prize math: Quantum Pass, PQ Ticket, zero clones.
- All spec calls: soulbound, paid per event, creator plus scanners, session key flow.
- Caught and fixed the scanner key flaw: v1 bound the wrong key, rewrote contract plus frontend to enroll keys at creation.
- Demo script, seeded events, judging story, deadlines, submission checklist.
- Deploy, testnet wallets, video, project page: human runs these.
