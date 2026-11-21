# OneScan

Quantum safe event ticketing on QoreChain testnet. Forwarded QR codes kill small events. OneScan mints soulbound tickets with hybrid post-quantum signatures and checks entry in onchain, so a leaked classical key cannot forge entry.

Built for the QoreChain Developer Fest, Build Before Q-Day. Category: Quantum Pass, solo.

## How to Test

You need QoreX on testnet Diana, plus test QOR from the faucet.

1. Go to the live URL and connect QoreX. Switch to QoreChain Diana, EVM chain 9800.
2. Create an event: name, date, price in test QOR (0 means free), max supply, optional scanner wallets. Save the event signing key shown once.
3. Mint 1 ticket as an attendee wallet. If your wallet has no registered ML-DSA-87 key, the app tells you to register first in QoreX.
4. Open Scan as the organizer, paste ticket ID plus the event signing key, check in once. Status: accepted, with explorer link.
5. Scan the same ticket again. Status: rejected, already used.
6. Try a classical only forged check in without the signing key. Status: reverts, PQ check failed.

Test accounts: use two QoreX wallets, one organizer and one attendee. Faucet: QoreChain testnet faucet for test QOR, fest faucet for fUSD, fETH, fBTC.

## Demo script (60 seconds)

0 to 10s: problem. Fake screenshot QR vs real check in. Say: forwarded QRs kill small events.
10 to 35s: live flow. Create Campus Show, mint ticket with QoreX, show QR.
35 to 50s: scan to enter, show Checked In onchain plus explorer link. Then forged check in with leaked classical key, show Rejected.
50 to 60s: close. Say: doors that survive Q-Day. Show testnet address and repo.

## Architecture

- Contract `contracts/PqTicket.sol`: soulbound mint (one per wallet per event), organizer plus max 3 scanners, one check in per ticket, PQ verification through the `pqcVerify` precompile at `0x...0a01` against the key enrolled at event creation. Classical only calls revert.
- Frontend Next.js 16 App Router: `/` story plus seeded events plus live chain status, `/events/new` onchain creation, `/events/[id]` live reads plus mint plus QR, `/scan` organizer check in, `/api/health` RPC read.
- Kits used and verified in code: `@qorechain/sdk` (chain reads, hybrid tx path), `@qorechain/evm` plus `viem` (EVM calls, `pqcKeyStatus` and `pqcVerify` precompiles, chain `qorechainTestnet` 9800), `@qorechain/qoresign` (hybrid key model), `@qorechain/pqc` (ML-DSA-87 browser signing, key status helpers), `@qorechain/qorex-types` (QoreX EIP-6963 discovery).
- Template lineage: UI scaffolded from `create-next-app`, QoreChain integration follows `create-qorechain-dapp` patterns. No copied project code.

## Network

- Testnet: qorechain-diana, EVM chain id 9800
- EVM RPC: https://evm-testnet.qore.host
- REST: https://api-testnet.qore.host
- Explorer: https://explore.qore.network
- Contract: `0xd4a62117c4E5726F5A94a25EB191261510C20daC` (Diana 9800)

## Onchain proof (Diana 9800, all real txs)

- createEvent: https://explore.qore.network/tx/0xac7ce1d476250a25b6bbcd26a210fce35bceb8a6f5a07007eb78e0a9ba1cb026 (event 5)
- mintTicket: https://explore.qore.network/tx/0xe0932144041438873fd5c8adfdd381cc75d8330a3e80e0a8f9070364ea6340bb (ticket 3)
- checkIn valid: https://explore.qore.network/tx/0x7af5a98c7f5f0b29523e974ce11cc1297df8aebc647233e8b1e7cf3d76807e57 (success)
- double check-in: https://explore.qore.network/tx/0xd91577a1de4fcde11eabb6c1943eaff6e9a61e37926e7cf8c0a35cd49e201d8a (reverted, AlreadyUsed)
- forged check-in: https://explore.qore.network/tx/0xd8a3e3d106a19dd600ded6c3acae9fbe37d2fe83078807b4f0c5f0a1994b7b56 (reverted, PqCheckFailed)

Reproduce: `DEPLOYER_KEY=0x... node scripts/proof-cycle.mjs`. Revert txs are sent raw with explicit gas (viem `writeContract` simulates first and never broadcasts a revert).
- Events scanned so far: event 1 (live scan from the UI wallet), event 2 forge-test, events 3-6 proof cycles, events 7-8 seeded demos (Campus Show Nov 30, Builders Meetup Dec 5).
- Seeded demo events: event 7 Campus Show Nov 30 (free, 200 seats) https://explore.qore.network/tx/0x44827b688d7033cb657b7e4d56afbe1d865c1711b32f5b695cbd993f37b20a8e, event 8 Builders Meetup Dec 5 (paid 1 test QOR, 100 seats) https://explore.qore.network/tx/0xf2addba6a83dda3b9979d91124bac11a046fa6784d89532c418256f7eaa097b4. Seed: `DEPLOYER_KEY=0x... node scripts/seed-events.mjs` (open a window first: `node scripts/onboard.cjs`).

## Commands

- `npm run dev`: local dev, check `/api/health` shows latest block
- `npm run build`: must pass before commit
- `npm run lint`: must pass before commit
- `node scripts/compile.cjs`: compile contract to `contracts/out/PqTicket.json`
- `forge test`: contract tests, 6 passing
- `DEPLOYER_KEY=0x... node scripts/deploy.cjs`: deploy to Diana 9800

## Project links

- Fest project page: added at creation
- Testnet addresses used: posted on project page, format `qor1...` plus `0x...`
- Video: max 3 min, live testnet mint plus scan plus rejected forge
- Cover: 16:9, min 1200x675, JPG/PNG/WebP under 5 MB
