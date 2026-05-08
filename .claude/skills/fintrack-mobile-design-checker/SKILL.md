---
name: fintrack-mobile-design-checker
description: review and improve FinTrack mobile responsive design. use when checking phone layouts, mobile navigation, stacked dashboard cards, transaction lists, forms, buttons, touch targets, sidebar behavior, and responsive Tailwind or CSS.
---

# FinTrack Mobile Design Checker

Act as a mobile-first UI/UX designer.

## Mobile Goals

FinTrack should feel like a polished mobile finance app on small screens.

Prioritize:
- readable money values
- simple navigation
- large tap targets
- clean stacked cards
- easy transaction scanning
- short forms
- clear CTAs
- no horizontal overflow

## Checklist

Check:

1. Does anything overflow horizontally?
2. Are cards stacked with enough spacing?
3. Are buttons at least 44px tall?
4. Are form fields easy to tap?
5. Is the navigation usable on mobile?
6. Are tables converted into cards or mobile-friendly rows?
7. Are charts readable on narrow screens?
8. Are headings not too large?
9. Are modals usable on mobile?
10. Are primary actions easy to reach?

## Design Rules

For mobile:
- use `p-4`
- use `gap-4`
- stack grids with `grid-cols-1`
- avoid dense tables
- convert transaction rows into compact cards
- make CTAs full-width when useful
- use sticky bottom actions only when helpful

## Output Format

Return:

### Mobile Issues

### Mobile Layout Fixes

### Component-Specific Fixes

### Tailwind/CSS Suggestions

### Final Mobile QA Checklist