# AI Usage

Best AI Native Build evidence for OneScan, QoreChain Developer Fest.

## Workflow

- Coding partner: Claude Code for scaffolding, contract, frontend, tests,
docs, deploys, and the landing redesign. Human reviewed every file, ran
builds, and made all product calls.
- Advisor: ChatGPT for strategy, idea validation, submission editing, demo
coaching, and judge-style review, per `PLAYBOOK.md` (adapted from the AI
Hackathon Prompt Playbook PDF).
- QoreChain MCP plus kit READMEs as the source of truth for `pqcVerify` precompile (`0x...0A01`), `pqcKeyStatus` (`0x...0A02`), EVM window rules, and QoreX provider behavior. No memorized APIs.
- Browser verification loop: build, read the error, fix, rebuild. Every fix in git history with passing `npm run build` plus `forge test`.

## Generated work

- `contracts/PqTicket.sol`: soulbound mint, scanner allowlist, enrolled key PQ check, Foundry harness plus 6 tests.
- Next.js App Router pages: home, event create, event detail with live reads, scanner, health route.
- `lib/wallet.tsx`, `lib/usePqStatus.ts`, `components/*`: QoreX EIP-6963 connect, PQ registration gate, mint, session key check in.
- `PLAN.md`, `design.md`, `README.md`, this file.

## Design resource pass

- Mapped all 74 resources on resources.cesaroeduardo.com (20 categories) via
  its Sanity CMS endpoint. Selected 4 with written reasons in `design.md`:
  Phosphor Icons, Motion In Design, Fontshare (Clash Display 600 for hero and
  page H1 only), SVGOMG (noted as pre-satisfied by Phosphor paths).
- Applied: Phosphor outline icons replace text glyphs on every status
  (CheckCircle, XCircle, ShieldCheck, Ticket, QrCode, Scan, Wallet, Copy),
  server components use a client icon wrapper to satisfy the build, Clash
  Display on hero and H1, entrance motion (near-95 percent scale, 300ms
  ease-out, 100ms stagger) plus pop on result cards, visible focus ring,
  copy button for the event signing key, mint now waits for the receipt and
  parses the Minted event so the QR shows the real ticket ID.
- Landing redesign: premium editorial direction. Clamp-scaled hero with
eyebrow pill, ticket stub preview card with live contract link, five-tx
onchain proof strip, numbered how-to-test list, inverted CTA band. All
within the 5-token system, no gradients, 44px targets, reduced-motion
safe. Tier A skills applied: better-colors, better-typography,
better-layout, better-ui.
- Human contribution: picked the 4 resources, rejected the rest, verified
  each page renders locally at 200 with icons and motion classes present.

## Human contribution

- Category pick after reading all 109 projects plus prize math: Quantum Pass, OneScan, zero clones.
- All spec calls: soulbound, paid per event, creator plus scanners, session key flow.
- Caught and fixed the scanner key flaw: v1 bound the wrong key, rewrote contract plus frontend to enroll keys at creation.
- Demo script, seeded events, judging story, deadlines, submission checklist.
- Deploy, testnet wallets, video, project page: human runs these.
