# FinTrack Transactions Design Guide

The transactions screen should make money movement easy to scan, filter, and trust.

## Transaction Screen Goal

A user should quickly understand:

1. what money came in or went out
2. when it happened
3. which category or account it belongs to
4. whether it affects cash flow, debt, savings, or transfers
5. what action they can take next

## Recommended Layout

Keep transactions mobile-first and single-column.

Use this structure:

1. Header
   - clear page title
   - concise summary of the current filtered range
   - primary action such as Add Transaction

2. Summary Strip
   - total income
   - total expenses
   - net cash flow
   - transaction count or average spend if useful

3. Filters
   - search input
   - date range controls
   - type filter
   - category filter
   - account filter
   - saved presets if already supported

4. Transaction List
   - grouped by date when helpful
   - newest first unless the existing behavior says otherwise
   - mobile card rows instead of dense tables

5. Empty Or Error State
   - explain what is missing
   - show the current filter context
   - provide one clear next action

## Transaction Row Rules

Each transaction row should clearly show:

- merchant, source, or description
- category
- date
- account if available
- amount
- income, expense, transfer, debt, or adjustment status

Amount alignment matters. Keep amounts visually aligned to the right side of the row when space allows.

Use signs and labels, not color alone:

- income: `+₱1,000` with an Income label or icon
- expense: `-₱500` with an Expense label or icon
- transfer: clear Transfer label and source/destination context
- debt payment: clear Debt Payment label
- borrowed money: clearly distinguish from normal income

## Mobile Transaction Cards

Prefer this visual order:

1. description on the top-left
2. amount on the top-right
3. category and date below
4. account, notes, or status details as muted supporting text
5. actions in a compact menu or quiet action row

Avoid cramped tables on mobile.

Keep tap targets comfortable:

- buttons and menus should be at least 44px tall where practical
- action icons need accessible labels
- swipe-like or compact controls must still be discoverable

## Filters And Search

Filters should feel helpful, not heavy.

Use:

- one obvious search field
- compact filter chips or segmented controls
- clear active filter states
- an easy reset action when filters are active
- visible result count when a filter narrows the list

Avoid:

- hiding important filters behind unclear icons
- stacking too many controls before the user sees any transactions
- making reset or clear actions hard to find

## Category And Status Badges

Badges should be small, readable, and consistent.

Use badges for:

- category
- income or expense type
- transfer status
- debt-related entries
- recurring entries
- borrowed-money entries

Do not use overly bright badges. Prefer soft backgrounds with readable text.

## Empty States

Empty states should be specific.

Examples:

- "No transactions yet. Add your first transaction to start tracking your cash flow."
- "No transactions match these filters. Clear filters or try a different date range."
- "No expenses this month. New expenses will appear here when you add them."

Include one primary action only.

## Edit And Delete Actions

Editing and deletion should feel safe.

For edit:

- preserve the existing values
- keep labels visible
- make save and cancel actions obvious

For delete:

- use clear confirmation copy
- name the transaction being removed when possible
- avoid harsh full-screen destructive styling unless the action is truly final

## Accessibility

Check:

- transaction rows have readable text contrast
- icon-only actions have accessible labels
- focus states are visible
- filter inputs have labels
- amounts are not identified by color alone
- badges remain readable in dark mode
- keyboard users can reach edit, delete, filter, and reset actions

## Design Checks Before Finishing

Verify:

- no horizontal overflow on small screens
- amounts stay aligned and readable
- long merchant names wrap cleanly
- filters do not push content too far down
- empty states fit inside the mobile app shell
- bottom navigation remains aligned with the same app width
- desktop still looks like a centered mobile finance app
