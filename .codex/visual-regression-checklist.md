# FinTrack Visual Regression Checklist

Use this checklist after UI changes to catch layout, spacing, and mobile regressions.

## App Shell

Check:

- app remains a centered mobile shell
- main content does not stretch into a wide desktop dashboard
- bottom navigation aligns with the same app width
- page padding is consistent
- no section touches the viewport edge awkwardly
- safe-area padding still works on mobile

## Responsive Widths

Check at:

- 320px
- 360px
- 390px
- 430px
- desktop browser width with centered app

Verify:

- no horizontal scrolling
- cards fit within the shell
- buttons do not overflow
- long labels wrap cleanly
- financial numbers remain readable
- bottom nav items fit

## Typography

Check:

- page title is the strongest text
- section titles are smaller than page titles
- money values are readable
- labels and helper text are not too faint
- text does not overlap icons, buttons, or neighboring content
- long category names and notes wrap gracefully

## Cards And Surfaces

Check:

- cards have consistent radius
- card padding is consistent
- nested cards are avoided
- borders are subtle but visible
- shadows are not heavy
- repeated cards align visually
- empty states do not look like errors

## Navigation

Check:

- active tab state is obvious
- nav tap targets are comfortable
- nav icons and labels do not collide
- bottom nav does not cover important actions
- modals and drawers appear above navigation correctly

## Forms

Check:

- every input has a visible label
- inputs have enough height
- focus states are visible
- validation messages are near fields
- submit and cancel actions are obvious
- mobile keyboard does not hide the primary action where practical

## Transaction Lists

Check:

- descriptions and amounts align cleanly
- income and expense are not identified by color alone
- action buttons are reachable on touch devices
- delete actions are not accidentally easy to tap
- long notes do not break layout
- empty and filtered states are specific

## Charts And Reports

Check:

- charts fit inside cards
- chart labels are readable
- legends do not wrap awkwardly
- chart colors are distinguishable
- written insight exists when chart meaning is important

## Modals And Drawers

Check:

- modal content fits small screens
- drawer width does not exceed the app shell intent
- close controls are visible
- overlay contrast is sufficient
- scrolling works inside long drawers
- focus states remain visible

## Dark Mode

If dark mode is present, check:

- card backgrounds and borders remain distinct
- text contrast stays readable
- badges remain legible
- charts are still visible
- focus states are visible
- destructive actions are clear but not harsh

## Final Pass

Before finishing, verify:

- no horizontal overflow
- no clipped text
- no overlapping UI
- no missing icons or broken symbols
- no accidental desktop dashboard layout
- no removed working feature
- desktop still presents FinTrack as a centered mobile finance app
