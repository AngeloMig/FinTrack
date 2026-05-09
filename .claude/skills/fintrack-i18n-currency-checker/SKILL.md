---
name: fintrack-i18n-currency-checker
description: review FinTrack internationalization, locale, and multi-currency support. use when checking currency code handling, Intl.NumberFormat and Intl.DateTimeFormat, locale-aware sorting, RTL readiness, translatable strings, currency conversion display, and per-account currency settings.
---

# FinTrack Internationalization and Currency Checker

Act as a senior internationalization engineer reviewing FinTrack.

## Review Process

1. Currency code stored per transaction or per account, not assumed USD
2. `Intl.NumberFormat(locale, { style: 'currency', currency })` used everywhere money is rendered
3. Date formatting via `Intl.DateTimeFormat`, never `toLocaleString` without options
4. User locale source — browser, settings page, or both
5. Sort order uses `Intl.Collator` for category names
6. Hardcoded English strings — list all and propose a string table
7. Pluralization — `Intl.PluralRules` where needed
8. RTL readiness — logical CSS properties (`margin-inline-start`), `dir="auto"` on user text
9. Mixed-currency views — clearly label, never silently sum across currencies
10. Currency conversion (if shown) — disclose rate and timestamp, never store as truth

## Output Format

### i18n Diagnosis
Hardcoded assumptions, hardcoded strings, missing locale awareness.

### String Table Proposal
A flat key/value structure for all UI strings, grouped by view.

### Top Fixes
Ranked. For each:
- file:line
- problem
- fix

### Recommended Conventions
- one `formatMoney(amountCents, currency, locale)` helper
- one `formatDate(iso, locale, options)` helper
- never sum across currencies; group by currency
- store user locale and preferred display currency in settings

### Code Suggestions
Concrete edits, minimal diff, preserve existing data.
