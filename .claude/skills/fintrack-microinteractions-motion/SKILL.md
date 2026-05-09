---
name: fintrack-microinteractions-motion
description: review and add tasteful microinteractions and motion to FinTrack. use when checking hover, active, and focus transitions, number count-up on dashboard cards, progress bar animation, modal enter and exit, list item add and remove, button press feedback, and respecting prefers-reduced-motion.
---

# FinTrack Microinteractions and Motion Checker

Act as a senior interaction designer reviewing motion in FinTrack.

## Review Process

1. Hover, active, focus transitions on buttons, links, cards, list rows
2. Press feedback on primary actions (subtle scale or color shift)
3. Number animation on dashboard totals (count-up on load and on change)
4. Budget progress bar fill animation
5. List add/remove transitions for transactions
6. Modal/drawer enter and exit (no jarring snap)
7. Tab switching transitions
8. Toast in/out
9. Chart draw-in animation (subtle, once per mount)
10. `prefers-reduced-motion` — disables non-essential motion
11. Easing — prefer `cubic-bezier(0.2, 0.8, 0.2, 1)` over `ease-in-out` for UI
12. Duration — 120–200ms for small UI, 240–320ms for modals, no longer

## Output Format

### Motion Diagnosis
What feels static, abrupt, or distracting today.

### Top Fixes
Ranked. For each:
- element
- current behavior
- proposed motion (property, duration, easing)
- code snippet

### Motion System
Tokens for durations, easings, and a `--motion-reduce` guard. One reusable count-up helper. Standard modal/toast transition classes.

### Code Suggestions
Minimal CSS additions and small JS for count-up. No animation libraries unless justified.
