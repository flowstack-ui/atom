# Playground Todo

Active unfinished playground work only. Conventions and maintenance rules live
in `CURRENT.md` and `docs/`.

## Mobile Evidence Follow-up

- Tooltip `0.3.5` physical iPhone Safari evidence is complete. Android Chrome
  remains recorded as `not run` until a named device is available; do not treat
  the unavailable platform as a pass.
- Run the consolidated `manual-tests/mobile-readiness.md` candidate protocol on
  named iPhone/Android devices with VoiceOver/TalkBack. Automated desktop/mobile
  emulation is complete and does not replace this physical lane.

## 1. Expand Browser Smoke Tests

- The shared Playwright preview, scenario helper, desktop Chromium/WebKit
  projects, Android-Chromium/iPhone-WebKit touch profiles, and initial
  Dialog/Select mobile smoke journeys are complete.
- Menu/Combobox positioning plus Slider, Rating, Tooltip, Context Menu, and
  Swipeable Item mobile cancellation coverage are complete. File Upload remains
  the next highest-risk browser-smoke expansion.
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
