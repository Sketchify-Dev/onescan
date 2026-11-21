# OneScan PLAN.md

## 1. Product and category

Product: OneScan, quantum safe event ticketing on QoreChain testnet.
Category: Quantum Pass, solo, 1 person.
Level: newcomer path, built to Top Quality standard for fallback prizes.

Problem in one sentence: fake screenshots and forwarded QR codes let anyone walk into small events.
Solution in one sentence: OneScan mints soulbound tickets with hybrid signatures and checks entry in onchain, so a leaked classical key cannot forge entry.
Story for judges: Build Before Q-Day applied to doors, not vaults.

Stackable targets: Quantum Pass merit (10 x $150), Top Quality (7 x $250, needs 70 plus), Regional, Peoples Choice, Best AI Native (add AI_USAGE.md).

Q-Day Survivor is out of scope. Drill was 18 Nov, registration closed 17 Nov.

## 2. One core flow that must work end to end

Roles:
A. Organizer creates event with name, date, price in test QOR (0 means free), max supply, plus up to 3 scanner wallets.
B. Attendee connects QoreX on testnet Diana, mints 1 soulbound ticket per event, pays price if set.
C. Door scanner (organizer or approved scanner) scans ticket QR and calls check in once. Second scan fails.
D. Attack demo: classical only transfer or forged check in is rejected onchain and in UI.

Out of scope for v1: transfers, resale, refunds, multi use passes, seat maps.

## 3. Demo script (60 seconds, write before code)

0 to 10s: problem. Show fake QR screenshot vs real check in. Say line: forwarded QRs kill small events.
10 to 35s: live flow. Create Campus Show event, mint ticket with QoreX, show QR.
35 to 50s: scan to enter, show Checked In onchain plus explorer link. Then try forged check in from leaked classical key, show Rejected.
50 to 60s: close. Say line: doors that survive Q-Day. Show testnet address and repo.

Seeded demo data: Campus Show Nov 30 (free), Builders Meetup Dec 5 (paid 1 fQOR or test QOR).

## 4. Tech and repo rules

Base: this repo, Next.js 16.4.6 App Router, React 19.3, Tailwind 4.3.3, TypeScript.
Chain: QoreChain testnet Diana, EVM chain id 9800, EVM RPC https://evm-testnet.qore.host, explorer https://explore.qore.network.
Wallets: QoreX on testnet, EVM lane via viem plus QoreX connectors.
Kits to declare and actually use (verified from code):
- @qorechain/sdk for chain reads and hybrid tx
- @qorechain/evm plus viem for EVM contract calls
- @qorechain/qoresign or @qorechain/pqc for hybrid ML-DSA-87 helpers
- contract uses pqcVerify pattern for PQ gated check in
- Foundry or Hardhat tests for contract

License: MIT, public repo, README credits kits.
Docs to read before code per AGENTS.md: node_modules/next/dist/docs/01-app/01-getting-started (project structure, layouts and pages, server and client components, fetching data, mutating data, route handlers), plus QoreChain quickstart and EVM plus pqcVerify docs.

## 5. Contract v1 (EVM Solidity)

File: contracts/PqTicket.sol

State:
- eventId counter
- Event struct: organizer, name, date unix, price, maxSupply, minted, scanners mapping, active
- Ticket struct: eventId, owner classical address, owner PQ key binding (bytes), used bool, tokenId
- one ticket per address per event: mapping eventId plus address to tokenId

Functions:
- createEvent(name, date, price, maxSupply, scanners[3]) returns eventId
- addScanner(eventId, wallet) only organizer, max 3 total
- mintTicket(eventId) payable, checks supply, price, one per wallet, emits Mint
- checkIn(tokenId) only organizer or approved scanner, checks not used, sets used true, emits CheckIn
- pqcVerify hook on checkIn path: require ML-DSA-87 approval for organizer or scanner action where supported, classical only call reverts

Tests: mint once, second mint reverts, non scanner checkIn reverts, double checkIn reverts, wrong price reverts, forged classical transfer cannot check in.

Deploy: Diana EVM 9800, verify address in explorer, save address plus ABI.

## 6. Frontend v1 (Next.js App Router)

Routes:
- / : hero with 10 sec story, two seeded events, Connect QoreX, How to Test
- /events/new : create event form (single column, labels above inputs, validate on blur)
- /events/[id] : event detail, Mint button, QR for ticket, explorer link
- /scan : scanner view, paste tokenId or scan QR via camera input, Check In button, success or rejected states
- /api/health : chain status read (RPC plus latest block)

Client components for wallet and QR only, server components for reads where possible.
State: loading, error below field, disabled while tx pending, focus visible, 44px targets.
Empty states with one clear action.

## 7. Build steps, each testable

Step 1 Interview done: category Quantum Pass, soulbound, paid per event, creator plus scanners.
Step 2 Plan: this file. Test: spec covers story, flow, contract, routes, checks.
Step 3 Rules: create CLAUDE.md plus design.md with stack, commands, tokens. Test: files exist.
Step 4 Scaffold kits: npm i @qorechain/sdk @qorechain/evm viem @qorechain/qoresign @qorechain/pqc, run dev, health check passes. Test: npm run dev boots, /api/health shows block.
Step 5 Contract: write PqTicket.sol, Foundry tests pass, deploy to 9800, explorer link works. Test: forge test green, mint plus checkIn on testnet.
Step 6 Frontend core: connect QoreX testnet, list events, create event, mint ticket, show QR. Test: manual mint on testnet with fresh wallet.
Step 7 Scanner: /scan checkIn works, double scan rejected, non scanner rejected. Test: scanner demo video clip.
Step 8 Attack demo: classical only forged checkIn reverts with clear message, UI shows Rejected. Test: failing tx hash saved.
Step 9 Deploy public URL day one target, seed demo events, test on 390, 768, 1440, no horizontal scroll. Test: live URL plus screenshots.
Step 10 Submission pack: README opens with How to Test plus test accounts, video max 3 min, cover 1200x675, qor1 address, kits ticked, Build App installed, AI_USAGE.md, Check again passes. Test: superpowers verification run.

## 8. Risks, top 5

1. QoreX EVM wiring on Diana 9800 unclear, mitigate with SDK plus viem docs and wallet mock for local dev.
2. pqcVerify exact call differs from guess, mitigate by reading Kits page example plus deployed Redzone or Q-Day Vault pattern before finalizing contract.
3. Quantum Pass requires create-qorechain-dapp lineage, mitigate by crediting template in README and keeping SDK usage explicit in code.
4. Scope creep into resale or refunds, mitigate by soulbound lock, refuse transfer features until after freeze.
5. Video plus README plus cover rushed at end, mitigate by drafting README How to Test now and recording 60 sec flow at Step 7.

## 9. Submission checklist (must all pass by 2 Dec 23:59 UTC)

- Public repo, MIT, README with How to Test, kit credits, test accounts, faucet steps
- Video 3 min max showing live testnet mint plus scan plus rejected forge
- Cover 16:9 min 1200x675 JPG PNG or WebP under 5 MB
- Testnet addresses used, format qor1 where native plus 0x where EVM
- Kits and network features ticked only if in code, then Check again
- Commits during fest, Build App installed, project created early with updates and #BuildBeforeQDay
- AI_USAGE.md for Best AI Native
- No submit button, frozen version is judged, jury change requests answered in 48h
