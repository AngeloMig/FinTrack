# FinTrack Reports And Analytics Design Guide

Reports should turn financial activity into clear, calm insight without overwhelming the mobile app shell.

## Reports Screen Goal

A user should quickly understand:

1. how much they earned
2. how much they spent
3. whether cash flow is positive or negative
4. which categories changed the most
5. what trend or pattern deserves attention

## Recommended Layout

Keep reports mobile-first and single-column.

Use this structure:

1. Header
   - clear page title
   - selected date range
   - compact range control

2. Summary Metrics
   - income
   - expenses
   - net cash flow
   - savings rate or average spend if available

3. Primary Chart
   - one main chart per section
   - readable title
   - short context line

4. Insights
   - plain-language spending or income observations
   - budget warnings
   - improvement opportunities

5. Details
   - category breakdown
   - top transactions or merchants
   - monthly comparison

## Chart Rules

Charts should fit comfortably inside the mobile card width.

Use:

- clear headings
- readable labels
- restrained colors
- simple legends
- enough padding around labels
- short supporting text

Avoid:

- tiny labels
- too many colors
- charts wider than the app shell
- charts that require horizontal scrolling unless there is no better option
- charts without a written takeaway

## Metric Cards

Metric cards should be compact and comparable.

Each metric should have:

- short label
- prominent number
- helper text
- trend or status label if useful

Do not make every metric visually equal if one is more important.

## Insights

Insights should be practical and specific.

Good:

"Food delivery is 28% of spending this month."

Better:

"Food delivery is 28% of spending this month, up from 18% last month."

Avoid vague copy like:

"Your finances changed."

## Date Range Controls

Date controls should be compact and understandable.

Use:

- month selector
- quick ranges
- segmented controls
- clear active state

Avoid putting too many controls before the first report result.

## Empty States

Reports need useful empty states.

Examples:

- "No spending data for this range. Add transactions or choose a different month."
- "No income recorded for this period. Income trends will appear once income is added."

Include one clear action or reset.

## Accessibility

Check:

- chart meaning is also available in text
- colors have enough contrast
- legends are readable
- controls have labels
- focus states are visible
- chart containers do not trap keyboard navigation

## Design Checks Before Finishing

Verify:

- charts do not overflow the mobile shell
- labels remain readable on small screens
- metric numbers do not wrap awkwardly
- empty states are specific
- insights are concise
- desktop remains a centered mobile finance app
