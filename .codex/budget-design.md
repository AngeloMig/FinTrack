# FinTrack Budget Design Guide

The budgets screen should help users understand where money is planned, where it is going, and what needs attention.

## Budget Screen Goal

A user should quickly understand:

1. total monthly budget
2. spent versus remaining
3. which categories are safe
4. which categories are close to the limit
5. which categories are overspent
6. what adjustment or action to take next

## Recommended Layout

Keep budgets mobile-first and single-column.

Use this structure:

1. Header
   - clear page title
   - current month or budget period
   - primary action such as Edit Budget or Smart Setup

2. Budget Overview
   - total budgeted
   - total spent
   - total remaining
   - savings or unallocated amount if available

3. Budget Health
   - short status message
   - overspending warning if needed
   - categories needing attention

4. Category Budgets
   - category name and icon
   - spent amount
   - budget amount
   - remaining amount
   - progress bar
   - status label

5. Actions
   - adjust category budget
   - rebalance budget
   - review monthly spending

## Budget Card Rules

Each category budget row or card should show:

- category name
- category group if useful
- spent amount
- remaining amount
- budget limit
- progress percentage
- clear status label

Do not rely on progress bar color alone. Add labels such as:

- On track
- Watch
- Near limit
- Overspent

## Progress Bars

Progress bars should be readable and calm.

Use:

- emerald or accent for healthy progress
- amber for warning
- rose or red for overspending
- soft background track
- percentage or remaining label near the bar

Avoid:

- harsh red everywhere
- progress bars without numbers
- tiny bars that are hard to read on mobile

## Overspending States

Overspending should be clear but not panic-inducing.

A good overspending card explains:

- how much over budget
- which category caused it
- whether cash flow is still safe
- one recommended next action

Example:

"Dining is ₱1,200 over budget. Reduce non-essential spend or move budget from another category."

## Category Grouping

If category groups exist, use clear labels:

- Needs
- Wants
- Savings
- Debt
- Income-related

Group labels should help scanning, not create a cramped dashboard.

## Budget Editing

Budget inputs should be easy to adjust on mobile.

Use:

- visible labels
- currency-aware placeholders
- clear save and cancel actions
- compact quick adjustment controls if already supported
- validation messages near the field

Avoid:

- tiny number inputs
- hidden save actions
- destructive reset controls near primary save actions

## Empty States

Empty states should explain the benefit of budgeting.

Examples:

- "No budgets set yet. Create category budgets to see where your money should go this month."
- "No spending in this budget period. Expenses will appear here after you add transactions."

Use one primary action only.

## Accessibility

Check:

- progress bars have text labels
- status is not communicated by color alone
- inputs have labels
- warning text has enough contrast
- quick adjustment buttons have readable names
- focus states are visible

## Design Checks Before Finishing

Verify:

- no horizontal overflow on small screens
- long category names wrap cleanly
- progress labels fit inside the mobile shell
- overspent categories are obvious
- budget actions are easy to tap
- desktop remains a centered mobile finance app
