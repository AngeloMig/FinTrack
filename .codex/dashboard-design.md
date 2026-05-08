# FinTrack Dashboard Design Guide

The dashboard is the most important page.

## Dashboard Goal

A user should understand their financial situation in 5 seconds.

Prioritize:
1. current balance
2. monthly income
3. monthly expenses
4. savings or remaining budget
5. recent transactions
6. spending trend
7. next action

## Recommended Layout

Use this structure:

1. Header
   - page title
   - short financial summary
   - primary action like Add Transaction

2. Metric Cards
   - Balance
   - Income
   - Expenses
   - Savings / Budget Remaining

3. Main Content Grid
   - Spending chart
   - Budget progress
   - Category breakdown

4. Recent Transactions
   - clean list
   - amount aligned right
   - category badges
   - empty state if no data

## Metric Card Rules

Each card should have:
- label
- main value
- small helper text
- optional icon
- optional trend badge

Do not overload cards with too much text.

## Chart Rules

Charts should:
- sit inside a clean card
- have a clear heading
- include timeframe controls if available
- not use too many colors
- have readable labels

## Recent Transactions Rules

Transaction rows should show:
- merchant/description
- category
- date
- amount
- status/type

Mobile should use stacked list items instead of cramped tables.
