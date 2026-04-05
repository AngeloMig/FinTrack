# FinTrack Refactor (Starter Split)

This is your original prototype split into folders so it is easier to maintain.

## What was extracted
- CSS moved into `/css`
- data constants moved into `/js/data/defaults.js`
- global state moved into `/js/state/store.js`
- persistence moved into `/js/state/persistence.js`
- remaining runtime logic kept in `/js/app.js`

## Notes
This is a structural refactor, not yet a full logic-by-feature rewrite. The app behavior should stay close to the original file while giving you a cleaner starting point for deeper modularization.
