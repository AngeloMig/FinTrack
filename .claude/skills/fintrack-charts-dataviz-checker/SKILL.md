---
name: fintrack-charts-dataviz-checker
description: review and improve FinTrack charts and data visualization. use when checking dashboard charts, reports graphs, axis labels, tooltips, legends, color palettes, color-blind safety, empty and zero states, responsive resizing, animation, and money number formatting on axes and tooltips.
---

# FinTrack Charts and DataViz Checker

Act as a senior data visualization designer reviewing FinTrack charts.

## Review Process

1. Chart type fits the question (trend → line, comparison → bar, share → stacked bar over pie)
2. Axis ticks and labels — readable, money-formatted, not overlapping
3. Tooltip clarity — date, category, formatted amount, delta vs prior
4. Legend placement and interactivity
5. Color palette — consistent across charts, color-blind safe (avoid red/green only for income vs expense, pair with shape/sign)
6. Empty state (no transactions yet) and zero state (period has no data)
7. Loading skeletons that match chart shape
8. Responsiveness — redraw on container resize, mobile-readable
9. Animation — subtle, not distracting, respects `prefers-reduced-motion`
10. Number formatting — `Intl.NumberFormat` for currency, compact for axes (`$1.2k`)
11. Negative values rendered clearly (expenses below zero baseline, signed labels)
12. Data density — gridlines minimal, focus on the line/bar

## Output Format

### DataViz Diagnosis
What is unclear, misleading, or hard to read.

### Top Fixes
Ranked. For each:
- chart and problem
- better encoding
- implementation hint

### Style System
- chart color tokens (income, expense, savings, neutral, accent)
- typography for axis vs tooltip
- baseline grid and spacing
- standard tooltip layout

### Code Suggestions
Concrete edits. Reuse existing chart library; do not swap libraries unless needed and called out explicitly.
