# Playground Todo

Active unfinished playground work only. Conventions and maintenance rules live
in `CURRENT.md` and `docs/`.

## Mobile Evidence Follow-up

- Tooltip `0.3.5` physical iPhone Safari evidence is complete. Android Chrome
  remains recorded as `not run` until a named device is available; do not treat
  the unavailable platform as a pass.

## 1. Expand Browser Smoke Tests

- The shared Playwright preview, scenario helper, desktop Chromium/WebKit
  projects, Android-Chromium/iPhone-WebKit touch profiles, and initial
  Dialog/Select mobile smoke journeys are complete.
- Automate the highest-risk manual flows in this order:
  1. Menu
  2. Combobox
  3. File Upload
  4. Slider
  5. Rating
  6. Swipeable Item mobile profile
- Create or update automation-ready protocol sections for these targets before
  implementing their expanded smoke tests.
- Use each reviewed protocol as the source for test steps and expected browser
  behavior once it exists.

## 2. Refactor Oversized Scenario Modules

- The browser-test setup gate is satisfied; begin only after the mobile
  readiness expansion for the affected scenario has a stable regression.
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
