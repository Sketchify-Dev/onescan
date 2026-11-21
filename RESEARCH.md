# PQ Ticket research (build loop step 0)

Recorded before code. Source: all live projects on build.qorechain.io/projects
(109 surveyed at spec time) plus fest docs (start, kits, rules pages).

## Heavily cloned, avoided

- Vaults (Q-Day Vault and Redzone patterns). Template lane, many clones.
  Reject: no differentiation, judges have seen ten of them.
- Escrows. Same template lane. Reject: crowded, weak 60 second demo.
- Proof-of-X checkers. Copied patterns. Reject: no story.
- Flip and chance games. Reject: no real problem solved.
- Generic AI chatbots and agents. Reject: playbook rule, pure AI output
  without an edge is luck, and the track is crowded.

## Missing, the gap this project takes

- Ticketing: zero of 109 live projects.
- Door and scanner flow with a human in the loop: nobody built it.
- Soulbound non-transferable tickets: absent.
- PQ-gated check in through the pqcVerify precompile: absent.

## Pain points

- Real world: small events admit by QR screenshot. Forwarding a QR forwards
  entry. Existing NFT tickets do not fix this, a screenshot of the QR still
  walks in. Organizers eat the loss or pay for staff and lists.
- Developer side: pqcVerify usage and QoreX EVM wiring are poorly documented,
  so builders stay in safe template lanes. That is why vaults are cloned and
  the door is empty.

## Feasibility check, why this survives

- Can it be built? Yes. One contract, pqcVerify precompile exists on Diana,
  Foundry tests green, frontend is four routes.
- Real problem? Yes. Every small organizer knows screenshot fraud.
- Room for something better? Yes. Zero clones in the category.
- Demoable? Yes. Mint, scan accepted, scan again rejected, forged classical
  call reverts. All inside 60 seconds.

## Rejected ideas with reasons

1. Q-Day Vault clone. Heavily cloned, no story.
2. Escrow dApp. Crowded, weak demo.
3. Transferable NFT tickets with resale. Resale reintroduces the screenshot
   problem. Soulbound is the fix, not a limitation.
4. Seat maps and multi-use passes. Scope creep, breaks the one-core-flow rule.
5. Generic AI agent. No edge, crowded track.
6. Q-Day Survivor path. Ineligible, drill registration closed 17 Nov.

## Name options

- PQ Ticket (current). Accurate, but PQ is insider jargon. Weak for judges
  outside the PQ track.
- OneScan (recommended). One ticket, one scan. Says the mechanism, easy to
  say on the demo video, product-like per the playbook.
- StubQ (alternate). Ticket stub plus QoreChain and Q-Day tie-in. Short.
- Unforward (alternate). Names the exact enemy, forwarded QRs.
- Uniqueness: the live projects list needs login, so confirm no collision on
  the projects page at creation time. All three options are distinctive
  enough that a collision is unlikely.
