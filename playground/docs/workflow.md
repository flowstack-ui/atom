# Playground Workflow

Follow this flow when adding or changing a scenario.

## 1. Read The Component

- Read the public docs for the component.
- Read the component source only as needed to understand real public behavior.
- Identify the public anatomy parts and their order.
- Identify controlled props, keyboard behavior, Field integration, direction
  behavior, composition support, and generated DOM.

## 2. Update The Coverage Plan

- Add only playground-testable rows to `component-coverage.xlsx`.
- Remove rows that belong to release/docs/export checks.
- Add prop-check and slot-override rows only for real Atom DOM parts.

## 3. Build Or Update The Scenario

- Reuse shared workbench primitives first.
- Keep state, actions, anatomy data, Source, and live Atom JSX in the scenario.
- Put controls in the Canvas toolbar.
- Keep Canvas stage focused on the live component.
- Use generic toolbar labels when possible, such as `Disable Item`.
- Hide controlled value controls when controlled mode is off.

## 4. Verify Manually

Check every scenario surface:

- Canvas behavior
- Anatomy summaries and expanded rows
- raw `Attributes`, `ARIA`, and `Data`
- Inspector `Selected` and `Focused`
- Logs
- Source view
- mobile layout when relevant
- axe issues when accessibility is part of the scenario

## 5. Mark Coverage

After manual verification:

- mark rows `Implemented yes`
- mark rows `Tested yes`
- set coverage to `covered`
- update notes with concise results
- confirm the index reflects the updated sheet

## 6. Run Verification

For playground-only changes, run:

```bash
npm run playground:build
```

When changes reveal or require package source fixes, follow the package-level
verification rules from the Atom package docs and changelogs.

## Playground Finding To Package Fix

Manual testing can reveal different kinds of work. Classify the finding before
editing:

- **Playground-only issue**: fix the scenario, shared workbench helper, Source
  snippet, Anatomy/Inspector wiring, styling, or workbook row inside
  `package/playground/`.
- **Package source bug**: stop treating it as playground work, inspect the Atom
  component source, update package tests when practical, and follow the package
  docs/changelog rules before release.
- **Package docs issue**: update package docs only when the public API or
  documented behavior is stale or misleading. Do not track docs-only checks in
  the playground workbook.
- **Missing package test**: add or plan a package test when the behavior is a
  contract that should not rely only on manual playground verification.
- **Release-note-worthy behavior change**: update the relevant package
  changelog/release notes when the public behavior changes, even if the bug was
  found through the playground.

If a task starts as playground-only but requires package source changes, say so
before changing package files unless the user has already approved that scope.
