# FinTrack

FinTrack is a client-side personal finance tracker built with plain HTML, CSS, and JavaScript. It runs without a build step, stores app data in `localStorage`, and focuses on day-to-day cash flow, budgeting, debt recovery, goals, and account balances.

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
  - `css/responsive.css`

There is no package manager, bundler, backend, or automated test setup in this repository.

## What The App Currently Does

### Dashboard

- Greeting carousel with summary cards
- Safe-to-spend daily guidance and this-month analytics
- Salary receipt prompt based on configured pay schedule and split accounts
- Upcoming recurring bills and income reminders with one-tap pay/receive
- Alerts and insights panel
- Money flow visualization with fullscreen mode
- Debt focus card and budget attention card
- Recent transactions, expandable charts, and notifications

### Add Flow

- Add expenses with category, custom category, account, date, and note
- Balance preview and validation before saving expense-like actions
- Quick-add shortcuts
- Recent expense and income suggestions
- Favorite expense templates
- Extra income tracking by source
- Borrowed-money income sources such as `Borrowed Money`, `Loan Release`, and `Cash Advance / Debt Proceeds`
- XM Trading close-cycle workflow for logging principal recovery plus profit or loss

### History

- Unified expense and income history
- Summary cards with exact expense, income, net, average-per-day, and largest-transaction amounts
- Search, category, account, type, amount, and date-range filters
- Day, week, month, quick-range, and custom-range filtering
- Grouping by transaction, day, category, or account
- Saved filter presets
- Bulk selection tools
- Load-more pagination instead of rendering the full list at once
- CSV export

### Goals, Debts, And Recovery

- Savings goals with contribution logging and contribution history
- Wishlist items
- Emergency fund calculator
- Financial journal
- Debt tracker with debt product, lender type, interest rate, due date, minimum due, and late-fee risk
- Debt payment logging with optional bank transfer fee and payment history
- Debt strategy support for minimum-only, snowball, and avalanche views
- Debt Mode budget preset for heavy debt-payoff periods
- Milestone sheet when a goal or debt is completed

### Net Worth, Accounts, And Planning

- Multiple net worth accounts with editable balances
- Transfers between accounts with optional transfer fees
- Transfer undo support
- Net worth history
- Transfer history
- Annual report view
- Budget review card with budgeted-vs-spent totals and month-end projection
- Budget strategy and preset guidance
- Needs / Wants / Savings split summary bar against the active preset target
- Per-category remaining budget chips and quick `±500` budget adjustments
- Unallocated budget guidance when large amounts are still not assigned
- Smart Budget Setup, Smart Refresh, and budget rebalance tools

### Guidance, Safety, And UX

- Bad reality alerts for debt-recovery conflicts
- Borrowed proceeds flagged separately from normal income behavior
- Dark mode
- Help mode and inline tooltips
- Guided onboarding
- In-app tutorial flows
- Backup and restore using JSON exports
- Notification badge and action toasts

## What Would Add The Most Next

The app already covers a lot of surface area. The highest-value additions now are operational, not more tabs.

- CSV or statement import: export already exists, but re-entering bank or wallet history manually will become the first real scale problem
- Recurring batch-post assistant: let the user approve due recurring bills and income in one flow instead of marking them one by one
- Calendar-level due-date view: combine salary receipts, recurring bills, debt due dates, and goal targets into one timeline
- Transfer fee upper-bound validation: currently only blocks negative fees, not fees that exceed the transfer amount

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
|-- index.html
|-- README.md
|-- css/
|   |-- base.css
|   |-- components.css
|   |-- features.css
|   |-- layout.css
|   `-- responsive.css
`-- js/
    |-- app.js
    |-- data/
    |   `-- defaults.js
    `-- state/
        |-- persistence.js
        `-- store.js
```

## File Responsibilities

- `index.html`: full app shell, tabs, cards, modals, onboarding markup, and script loading order
- `js/data/defaults.js`: default categories, budgets, chart colors, and starter net worth accounts
- `js/state/store.js`: in-memory state initialization and default values
- `js/state/persistence.js`: save/load logic for `localStorage`
- `js/app.js`: rendering, interactions, calculations, exports, onboarding, and most app behavior
- `css/base.css`: tokens, theme variables, app shell, base controls, and shared primitives
- `css/layout.css`: layout patterns, lists, cards, modals, settings, notifications, and onboarding shells
- `css/components.css`: visual refinements and feature-specific component styling
- `css/features.css`: onboarding polish, add-flow helpers, smart refresh UI, and small-screen refinements

## Running The App

Open `index.html` directly in a browser, or serve the folder with any static file server.

Example:

```bash
python -m http.server
```

Then open `http://localhost:8000`.

## Current Architecture Notes

- This is a modularized static app, not a framework-based application.
- Most business logic and rendering still live in `js/app.js`.
- Persistence is entirely browser-side.
- The CSS has been split into multiple files, but responsive rules are still partly mixed into non-responsive files.

## Suggested Next Refactor Steps

- Split `js/app.js` by feature area such as dashboard, history, goals, debts, and net worth
- Move calculation helpers into smaller utilities
- Replace inline `onclick` handlers with event listeners
- Add a lightweight test strategy for pure calculation functions
- Continue moving responsive rules into `css/responsive.css`
