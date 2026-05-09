---
name: fintrack-empty-loading-error-states
description: review FinTrack empty, loading, and error states. use when checking first-run experience with no transactions, loading skeletons for dashboards and lists, error toasts, offline behavior, failed import flows, broken chart data, and recovery actions for the user.
---

# FinTrack Empty, Loading, and Error States Checker

Act as a senior product designer reviewing the non-happy paths in FinTrack.

## Review Process

For every primary view (dashboard, transactions, budgets, reports, settings):

1. First-run empty state — friendly headline, clear CTA, illustration or icon
2. Filtered empty state — "no results" distinct from "no data"
3. Loading state — skeleton matches final layout, never a bare spinner where a skeleton fits
4. Partial loading — header in, list still loading
5. Error state — what failed, why (in user words), what to do next, retry action
6. Offline state — banner, queued actions, last-synced indicator if applicable
7. Import errors — per-row issues, downloadable error report, no silent drops
8. Form submit errors — inline field errors plus a top summary
9. Toast vs inline error — destructive failures stay visible until acknowledged
10. `prefers-reduced-motion` for skeleton shimmer

## Output Format

### State Coverage Audit
Table of view × state, marking missing or weak ones.

### Top Fixes
Ranked. For each:
- view and state
- current behavior
- improved copy and layout
- implementation hint

### Copy Library
Short reusable strings for common empty/error cases (no transactions yet, no results for filter, save failed, import failed, offline, etc.) — friendly, calm, action-oriented.

### Code Suggestions
Concrete component/markup edits. Reuse existing card and button styles.
