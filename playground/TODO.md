# Playground Todo

Active unfinished playground work only. Conventions and maintenance rules live
in `CURRENT.md` and `docs/`.

## Mobile Evidence Follow-up

- Tooltip `0.3.5` physical iPhone Safari evidence is complete. Android Chrome
  remains recorded as `not run` until a named device is available; do not treat
  the unavailable platform as a pass.

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
- Create and review automation-ready protocols for these targets before
  implementing their smoke tests; none currently has a reviewed protocol.
- Use each reviewed protocol as the source for test steps and expected browser
  behavior once it exists.

## 2. Refactor Oversized Scenario Modules

- Begin only after the browser-test setup from item 1 exists and passes.
- Reassess module size and responsibilities when this work begins. Current
  likely candidates include `UtilityPrimitiveScenarios.tsx`,
  `NavigationPrimitiveScenarios.tsx`, `DataPrimitiveScenarios.tsx`, and
  `FormFieldScenarios.tsx`.
- Refactor one module at a time along stable component or responsibility
  boundaries.
- Add or identify browser regression coverage for the affected scenarios before
  splitting each module. The initial eight smoke tests establish the automation
  baseline but do not automatically cover every grouped scenario.
- Preserve Canvas, Source, Anatomy, Inspector, toolbar, log, and coverage
  workbook behavior. Update the playground code map when file ownership moves.
- Require the playground build and all applicable browser tests to pass after
  each refactor.
