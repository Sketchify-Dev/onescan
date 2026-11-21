# PQ Ticket design.md (project tier)

## Skill picks for this task

1. better-colors: token ramp, 5 token cap, contrast for QR and status states.
2. better-typography: scale, measure, tabular numbers for tokenId and block numbers.
3. better-layout: grouping, 390 plus 768 plus 1440 checks, tables become stacked cards under 768.
4. better-ui: exact press, focus, loading, and empty states, verification table.

## Tokens (only these 5 colors)

--paper: #FAFAF8 page background
--ink: #141310 body text and headings
--accent: #4F46E5 primary action fill, links, QR frame
--success: #15803D checked in state, paired with icon plus label, never color alone
--danger: #B91C1C rejected plus forged state, paired with icon plus label

Muted text is ink at 60 percent opacity, no extra token.
Borders are ink at 12 percent opacity, no extra token.
No gradients. Dark mode: paper #0A0A0B, ink #EDEDEA, same accent, success, danger remeasured.

## Type scale

Display 36px, lh 1.1, tracking -0.02em, balance, headings only.
H1 28px, lh 1.2, tracking -0.01em.
H2 22px, lh 1.25.
Body 16px, lh 1.6, pretty, max 70ch.
Small 14px, lh 1.5 for meta and addresses.
Caption 13px for helper text.
Numbers (tokenId, supply, block): tabular-nums.
Inputs at 16px on mobile to avoid iOS zoom.
Labels in sentence case, above inputs.

## Spacing scale

4, 8, 12, 16, 24, 32, 48. Group gap at least 2x inner gap.
Page margins 16px mobile, 24px desktop. Full width buttons stay inside margins.
Touch targets 44px min. Focus visible ring on all controls.
Cards: inner radius 12px, outer 16px with 16px padding (outer equals inner plus padding).

## Layout rules

Home: hero (story plus 2 seeded events) then How to Test then status.
Event detail: single column, ticket card with QR (aspect-ratio 1/1 to prevent shift), Mint button, explorer link.
Scan view: large input plus Check in button plus result card with icon plus text.
Breakpoints: hold desktop until it breaks, stack under 768, no horizontal scroll.
Empty states carry one clear action.

## Motion

Entrance near 95 percent scale, ease-out 300ms with 100ms stagger on first load only.
Press feedback scale 0.96, ease-out 150ms.
Tab switches and hover feedback instant or 150ms max.
Reduced motion: cross fade opacity only.
Modals use solid backdrop, no blur.
