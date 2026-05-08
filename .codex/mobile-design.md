# FinTrack Mobile Design Guide

FinTrack should feel excellent on mobile.

## Product Shape

FinTrack is a phone-first finance app, even on desktop browsers.

Keep:
- centered mobile app shell
- bottom navigation aligned to the same shell
- stacked dashboard flow
- compact financial cards
- no full-width desktop dashboard conversion

Avoid:
- widening the main `.app` container
- desktop grid dashboards
- content stretching away from the bottom nav
- designs that only look good at large desktop widths

## Mobile Rules

- Use single-column layouts
- Avoid dense tables
- Use comfortable card spacing
- Make buttons easy to tap
- Keep page headers compact
- Keep financial numbers readable
- Do not hide important actions
- Avoid horizontal scrolling
- Keep desktop preview as a centered mobile layout

## Recommended Mobile Patterns

### Dashboard

Stack:
1. balance summary
2. key metrics
3. chart
4. budgets
5. recent transactions

Do not split the dashboard into desktop columns. Improve the stacked mobile order instead.

### Transactions

Use mobile transaction cards:
- description top-left
- amount top-right
- category/date below
- actions in menu or bottom row

### Forms

Use:
- full-width inputs
- clear labels
- large submit button
- simple field grouping

### Navigation

Use:
- bottom nav or hamburger if applicable
- clear active states
- avoid tiny sidebar links on mobile
