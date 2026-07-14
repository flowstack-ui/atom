# Playground Todo

Active unfinished playground work only. Conventions and maintenance rules live
in `CURRENT.md` and `docs/`.

## 1. Add Browser Smoke Tests

- Add the playground's browser-test setup, scripts, and initial smoke-test
  helpers after the inspection consolidation is stable.
- Automate the highest-risk manual flows in this order:
  1. Dialog
  2. Select
  3. Menu
  4. Combobox
  5. File Upload
  6. Slider
  7. Rating
  8. Swipeable Item
- Keep the reviewed Manual Test Protocols as the source for test steps and
  expected browser behavior.
