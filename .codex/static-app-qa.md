# FinTrack Static App QA Guide

FinTrack is a static HTML, CSS, and JavaScript app. QA should match that architecture.

## Project Reality

FinTrack currently has:

- no package manager requirement
- no build step
- no backend
- no automated test setup by default
- direct browser execution through `index.html`
- optional static serving through a local HTTP server
- app state stored in `localStorage`

Do not assume a framework, bundler, router, API server, or database unless the repository changes.

## Before Testing

Inspect:

- `README.md`
- `index.html`
- `js/app.js`
- relevant files in `css/`
- any new package scripts if `package.json` is later added

If `package.json` exists, use its scripts. If it does not exist, validate with static-app checks.

## Basic Validation

For design-only changes, check:

1. HTML still loads
2. JavaScript has no obvious syntax errors
3. modified CSS selectors are valid
4. no missing referenced IDs or classes
5. no removed existing event handlers
6. no broken modal, tab, or drawer behavior

## Recommended Local Run

The app can be opened directly in a browser.

For a local server, use:

```bash
python -m http.server
```

Then open:

```text
http://localhost:8000
```

If port `8000` is busy, use another port.

## Browser QA Checklist

Check core flows:

- dashboard renders
- bottom nav switches tabs
- add expense opens and saves
- add income opens and saves
- history filters open and close
- transaction edit still opens
- delete confirmations still work
- modals can close
- dark mode still works if present
- backup/export actions still appear

## LocalStorage Checks

Because app data is local:

- avoid wiping `localStorage` unless explicitly testing reset behavior
- test empty state only in a clean profile or with a deliberate backup
- preserve existing storage keys unless intentionally migrating data

Primary state key:

- `ft_all`

Common preference keys:

- `ft_money_flow_theme`
- `ft_help_mode`
- `ft_onboarded`
- `ft_guided_tutorial_done`
- `ft_more_tutorial_done`

## Static Code Checks

Without a build tool, use careful source checks:

- search for duplicate IDs after editing markup
- check changed inline handlers still reference existing functions
- check CSS braces and media queries
- check responsive selectors for accidental global effects
- check that modified template strings in `js/app.js` are valid

Useful commands:

```bash
rg -n "functionName|element-id|class-name" index.html js css
```

```bash
python -m http.server
```

## What Not To Do

Avoid:

- adding a build system just for visual polish
- adding dependencies for simple CSS or DOM changes
- changing storage schema for design-only tasks
- removing inline handlers during small design tasks unless requested
- converting the app into a framework app without explicit approval

## Final Validation Summary

When finishing, report:

- files changed
- whether functionality was preserved
- how it was checked
- any checks that could not be run
- remaining risk
