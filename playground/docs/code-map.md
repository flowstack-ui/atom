# Playground Code Map

Use this as a quick orientation map before editing playground scenarios.

## App Shell

- `src/main.tsx` mounts the React app.
- `src/App.tsx` owns the main workbench shell, top navigation, scenario
  registry, Anatomy/Canvas/Inspector layout, and scenario selection.
- `src/styles.css` holds the shared playground styling.

## Shared Workbench Helpers

- `src/WorkbenchPrimitives.tsx` contains shared toolbar, menu, log, prop-check,
  and slot-override helpers used across scenarios.
- `src/domEvidence.ts` is the canonical collector, filter, sorter, and formatter
  for live `Attributes`, `ARIA`, `Data`, text, value, checked, disabled, and
  hidden evidence.
- `src/domEvidenceRevision.ts` owns the shared evidence revision context,
  animation-frame scheduling, and mutation filtering used to refresh Anatomy
  and Inspector together.
- `src/AnatomyPanel.tsx` renders Anatomy groups and accepts raw `Attributes`,
  `ARIA`, and `Data` only from the shared live evidence collector; curated
  scenario sentinels cannot become DOM attributes.
- `src/inspector.ts` owns selected/focused targeting, portal-safe element
  recovery, and the mutation observer that drives the shared evidence revision.

## Scenario Files

Scenario implementations live under `src/scenarios/`.

- Single-scenario files such as `DialogScenario.tsx`, `SelectScenario.tsx`, and
  `MenuScenario.tsx` contain Anatomy, Canvas, Toolbar, Log, and Source pieces
  for larger components.
- Hook files such as `useDialogScenario.ts` and `useSelectScenario.ts` hold
  scenario state and behavior helpers for larger components.
- Grouped files such as `FormControlScenarios.tsx`,
  `FormFieldScenarios.tsx`, `DisplayPrimitiveScenarios.tsx`,
  `UtilityPrimitiveScenarios.tsx`, `NavigationPrimitiveScenarios.tsx`,
  `SelectionPrimitiveScenarios.tsx`, and `DataPrimitiveScenarios.tsx` contain
  related smaller component scenarios.

## Coverage Workbook

- `component-coverage.xlsx` is the manual coverage workbook.
- `component-coverage.xlsx.inspect.ndjson` is an inspection artifact and should
  stay untouched unless a task explicitly asks for it.

## Verify When Unsure

This map reflects the current file layout. If scenario routing or grouped
scenario ownership changes, verify `src/App.tsx` and `src/scenarios/` before
editing.
