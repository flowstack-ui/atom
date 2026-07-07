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
- `src/AnatomyPanel.tsx` renders Anatomy groups and live raw DOM evidence for
  `Attributes`, `ARIA`, and `Data`.
- `src/inspector.ts` reads selected/focused live DOM details for Inspector.

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
