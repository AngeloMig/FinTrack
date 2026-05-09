---
name: fintrack-darkmode-checker
description: review and implement FinTrack dark mode. use when adding or auditing dark theme, toggling between light and dark, system preference matching, color tokens, contrast in dark backgrounds, chart colors in dark, card surfaces, borders, and persisted theme preference.
---

# FinTrack Dark Mode Checker

Act as a senior product designer adding or auditing FinTrack dark mode.

## Review Process

1. Theme tokens — define light and dark via CSS variables, not hardcoded colors
2. Surface hierarchy in dark — `bg-slate-950` page, `bg-slate-900` card, subtle border (`border-white/5`)
3. Text contrast — meets WCAG AA on every surface
4. Money colors — income green and expense red still readable in dark, tuned (e.g., `emerald-400`, `rose-400`)
5. Chart palette in dark — re-derived, not the same as light
6. Borders and shadows — shadows are weaker in dark, prefer borders + subtle inner highlight
7. Inputs and forms — focus ring still visible in dark
8. Toggle UX — light, dark, system; persist via localStorage; respect `prefers-color-scheme` by default
9. Flash of wrong theme on load — set theme class before first paint
10. Images, icons, and illustrations adapt or use neutral assets

## Output Format

### Dark Mode Diagnosis
What is missing, hardcoded, or low-contrast.

### Token Map
Side-by-side light vs dark tokens for: bg, surface, surface-elevated, border, text, text-muted, primary, success, danger, warning, chart palette.

### Top Fixes
Ranked. For each:
- file:line
- problem
- fix

### Implementation Plan
- add CSS variables in `css/base.css`
- swap hardcoded colors in `css/components.css` and `css/features.css`
- theme toggle wiring in `js/app.js`
- pre-paint inline script in `index.html` to avoid flash

### Code Suggestions
Concrete edits, minimal diff, preserve existing UI.
