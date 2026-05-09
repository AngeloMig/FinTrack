# FinTrack Auth And Onboarding Design Guide

Auth and onboarding screens should make FinTrack feel trustworthy, simple, and safe before the user adds financial data.

## Auth Screen Goal

A user should quickly understand:

1. what FinTrack helps them do
2. whether their data experience feels trustworthy
3. what action to take next
4. how to recover from form errors

## Recommended Auth Layout

Keep auth screens mobile-first and calm.

Use this structure:

1. Brand Header
   - FinTrack name
   - short trust-focused subtitle

2. Form Card
   - visible labels
   - clear inputs
   - primary submit button
   - secondary account-switch action

3. Helper Area
   - concise privacy or local-data note if relevant
   - password or validation guidance

4. Error State
   - specific error message
   - placed near the relevant field or form action

## Form Rules

Forms should feel secure and easy.

Use:

- visible labels
- helpful placeholders
- full-width mobile inputs
- strong focus states
- clear disabled states
- obvious submit button
- calm validation messages

Avoid:

- placeholder-only labels
- tiny helper text
- unclear secondary links
- harsh error styling
- crowded form rows

## Onboarding Goal

Onboarding should help users set up the app without turning into a long tutorial.

Prioritize:

1. starting balance or accounts
2. income schedule
3. basic monthly budget
4. first transaction
5. optional goals or debts

## Onboarding Layout

Use:

- short step titles
- one main task per step
- visible progress
- clear Back and Continue actions
- Skip only for non-critical setup
- concise helper text

Avoid:

- long paragraphs
- too many choices on one screen
- hiding the primary action below the fold
- making financial setup feel like a form marathon

## Trust And Privacy Copy

Trust copy should be plain and specific.

Good:

"Your data is stored locally in this browser."

Avoid:

"Bank-grade intelligence for all your financial needs."

Do not overpromise security, automation, or bank connectivity unless the app actually supports it.

## Empty First-Run States

After onboarding, empty screens should guide the next action.

Examples:

- "Add your first income to start tracking monthly cash flow."
- "Add your first expense to see spending by category."
- "Create a savings goal to track progress over time."

## Accessibility

Check:

- every input has a visible label
- errors are associated with the right field
- focus order follows the visual order
- buttons have clear names
- password visibility controls have accessible labels
- contrast is strong in both light and dark mode

## Design Checks Before Finishing

Verify:

- forms fit small mobile screens
- submit actions remain visible
- validation text does not overlap controls
- keyboard navigation works
- no horizontal overflow
- desktop remains a centered mobile finance app
