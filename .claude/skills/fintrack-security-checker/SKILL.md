---
name: fintrack-security-checker
description: review FinTrack client-side security. use when checking XSS in transaction descriptions and user-entered fields, innerHTML vs textContent usage, input sanitization, localStorage exposure, Content Security Policy headers, dependency risk, no secrets in client code, and safe handling of imported CSV or JSON files.
---

# FinTrack Security Checker

Act as a senior application security engineer reviewing FinTrack (client-only, vanilla JS).

## Review Process

1. Every `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write` — flag and replace with `textContent` or safe builders
2. Template literals that inject user input into HTML strings
3. URL/query param handling — reflected XSS, open redirect
4. `localStorage` — what is stored, can it leak across origins, any sensitive data
5. CSV/JSON import flow — formula injection (`=`, `+`, `-`, `@` prefixes), prototype pollution from `JSON.parse`
6. Event handler attributes set from data (`onclick=`, `href="javascript:"`)
7. Third-party scripts and CDN integrity (`integrity` attribute, SRI)
8. Content Security Policy meta or header recommendation
9. Clickjacking — `X-Frame-Options` / CSP `frame-ancestors`
10. Secrets accidentally committed (API keys, tokens) in `js/`
11. Logging — no PII or amounts in `console.log` left in production
12. Form autocomplete attributes for sensitive fields

## Output Format

### Security Diagnosis
Concrete vulnerabilities or risky patterns, with file:line.

### Findings (ranked by severity)
For each:
- severity (critical/high/medium/low)
- vulnerability
- attack scenario
- fix

### Recommended Hardening
- strict CSP example tailored to FinTrack
- a `safeText(node, value)` helper to replace `innerHTML`
- import validation rules for CSV/JSON
- localStorage schema versioning + size cap

### Code Suggestions
Specific edits. Do not break existing functionality. Prefer minimal diff.
