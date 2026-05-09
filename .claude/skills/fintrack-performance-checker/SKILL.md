---
name: fintrack-performance-checker
description: audit and improve FinTrack frontend performance. use when checking page load, script loading order, DOM rendering speed, transaction list rendering, chart re-render cost, localStorage access patterns, image/font loading, paint and layout thrash, and overall responsiveness on slower devices.
---

# FinTrack Performance Checker

Act as a senior frontend performance engineer reviewing FinTrack (vanilla HTML/CSS/JS, no bundler).

## Review Process

Check in this order:

1. `index.html` script and stylesheet loading (defer/async, order, blocking)
2. Critical render path and first paint
3. CSS size and unused selectors in `css/*.css`
4. JS execution cost in `js/app.js`, `js/features.js`
5. Transaction list rendering (re-render on every change vs diff/append)
6. Chart redraw frequency and resize handlers
7. `localStorage` read/write patterns (parsing JSON on every render is a red flag)
8. Event listener count and delegation
9. Layout thrash (read/write DOM in loops, forced reflows)
10. Image, icon, and font loading
11. Long tasks > 50ms during interaction
12. Memory growth over a session

## Output Format

### Performance Diagnosis
What is slow or wasteful, and why.

### Top Fixes
Top 10 wins ranked by impact. For each:
- problem (with file:line if visible)
- fix
- expected gain (paint, interaction latency, memory)

### Patterns to Apply
- defer non-critical JS
- batch DOM writes
- cache parsed state in memory, persist to localStorage on change only
- event delegation on list containers
- `requestAnimationFrame` for chart/animation work
- virtualize long transaction lists if > 200 rows

### Code Suggestions
Concrete edits. Preserve functionality. No new dependencies unless justified.
