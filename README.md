# FinTrack

FinTrack is a client-side personal finance tracker built with plain HTML, CSS, and JavaScript. It runs without a build step, stores app data in `localStorage`, and focuses on day-to-day cash flow, budgeting, savings goals, debt tracking, and account balances.

## Stack

- HTML entry point: `index.html`
- JavaScript modules loaded directly in the page:
  - `js/data/defaults.js`
  - `js/state/store.js`
  - `js/state/persistence.js`
  - `js/app.js`
- CSS split by responsibility:
  - `css/base.css`
  - `css/layout.css`
  - `css/components.css`
  - `css/features.css`
  - `css/responsive.css` (currently a placeholder for future extraction)

There is no package manager, bundler, backend, or test setup in this repository.

## What The App Currently Does

### Dashboard

- Greeting carousel with summary cards
- Safe-to-spend daily guidance
- Salary receipt prompt based on configured pay schedule
- Upcoming recurring bills and income reminders
- Alerts and insights panel
- Money flow visualization with fullscreen mode
- Debt focus card and budget attention card
- Recent transactions and expandable analytics
- Notifications panel with badge counts

### Add Flow

- Add expenses with category, account, date, and note
- Add extra income by source
- Quick-add shortcuts
- Recent expense and income suggestions
- Favorite expense templates
- Balance validation before saving spending actions

### History

- Unified expense and income history
- Search, category, account, type, amount, and date-range filters
- Day, week, month, and custom range filtering
- Grouping by transaction, day, category, or account
- Saved filter presets
- Bulk selection tools
- CSV export

### Goals And Debts

- Savings goals with contributions and history
- Wishlist items
- Emergency fund calculator
- Debt tracker with payment logging and payment history
- Debt payoff support data for focus cards and strategy views
- Milestone sheet when a goal or debt is completed

### Net Worth And Planning

- Multiple net worth accounts with editable balances
- Transfers between accounts with optional transfer fees
- Net worth history
- Transfer history
- Annual report view
- Budget strategy and 50/30/20 guidance
- Smart Budget Setup, Smart Refresh, and budget rebalance tools

### Extra UX

- Dark mode
- Help mode and inline tooltips
- Guided onboarding
- In-app tutorial flows
- Backup and restore using JSON exports

## Data Storage

Primary app state is stored in `localStorage` under `ft_all`.

Additional UI preferences use separate keys, including:

- `ft_money_flow_theme`
- `ft_help_mode`
- `ft_onboarded`
- `ft_guided_tutorial_done`
- `ft_more_tutorial_done`

Backups downloaded from the app are JSON snapshots of the saved local state.

## Project Structure

```text
FinTrack/
├── index.html
├── README.md
├── css/
│   ├── base.css
│   ├── components.css
│   ├── features.css
│   ├── layout.css
│   └── responsive.css
└── js/
    ├── app.js
    ├── data/
    │   └── defaults.js
    └── state/
        ├── persistence.js
        └── store.js
```

## File Responsibilities

- `index.html`: full app shell, tabs, cards, modals, onboarding markup, and script loading order
- `js/data/defaults.js`: default categories, budgets, chart colors, and starter net worth accounts
- `js/state/store.js`: in-memory state initialization and default values
- `js/state/persistence.js`: save/load logic for `localStorage`
- `js/app.js`: rendering, interactions, calculations, exports, onboarding, and all app behavior
- `css/base.css`: tokens, theme variables, app shell, base controls, and shared primitives
- `css/layout.css`: layout patterns, lists, cards, modals, settings, notifications, and onboarding shells
- `css/components.css`: visual refinements and feature-specific component styling
- `css/features.css`: onboarding polish, add-flow helpers, smart refresh UI, and small-screen refinements

## Running The App

Open `index.html` directly in a browser, or serve the folder with any static file server.

Example:

```bash
python3 -m http.server
```

Then open `http://localhost:8000`.

## Current Architecture Notes

- This is a modularized static app, not a framework-based application.
- Most business logic and rendering still live in `js/app.js`.
- Persistence is entirely browser-side.
- The CSS has been split into multiple files, but responsive rules have not yet been fully extracted into `css/responsive.css`.

## Suggested Next Refactor Steps

- Split `js/app.js` by feature area such as dashboard, history, goals, debts, and net worth
- Move calculation helpers into smaller utilities
- Replace inline `onclick` handlers with event listeners
- Add a lightweight test strategy for pure calculation functions
- Continue moving responsive rules into `css/responsive.css`
