---
name: fintrack-state-architecture-checker
description: review FinTrack state management and data architecture. use when checking single source of truth, event flow, stale UI after mutations, race conditions on async saves, module boundaries between js/state, js/data, js/features, and how transactions, budgets, and settings propagate to views.
---

# FinTrack State Architecture Checker

Act as a senior frontend architect reviewing FinTrack state.

## Review Process

1. Where is the single source of truth for transactions, budgets, settings
2. Read paths — does every view derive from state, or do some read localStorage directly
3. Write paths — every mutation goes through one API, or scattered
4. Event/observer flow — how views know to re-render after a mutation
5. Stale UI risk — components that cache values and miss updates
6. Race conditions on async saves (debounced writes, multiple tabs)
7. Cross-tab sync via `storage` event — present, missing, or buggy
8. Module boundaries between `js/state/`, `js/data/`, `js/features.js`
9. Circular dependencies or implicit globals
10. Selectors/derived data — recomputed on every render vs memoized
11. Initial load — hydrate order, default state shape, missing-key safety
12. Undo/redo feasibility (immutable updates vs in-place mutation)

## Output Format

### Architecture Diagnosis
Where state ownership is unclear or update flow is fragile.

### Top Fixes
Ranked. For each:
- problem (file:line)
- proposed structure
- migration path (small steps, no big rewrite)

### Recommended Pattern
- single `store` object with `getState`, `setState`, `subscribe`
- mutations always through action functions
- views subscribe and re-render on relevant slice changes
- persistence layer is a subscriber, not the source of truth
- cross-tab sync via `storage` event reapplied through the store

### Code Suggestions
Concrete, minimal-diff edits. Preserve all existing features.
