# Playground Workflow

Follow this flow when completing a component or making a substantial scenario
update.

## Component Completion Workflow

1. Read component documentation.
2. Read the workbook.
3. Compare workbook vs playground.
4. Implement missing behavior.
5. Classify playground/package/documentation issues.
6. Generate manual checklist.
7. Manual testing.
8. Fix discovered issues.
9. Repeat manual testing until complete.
10. Update workbook.
11. Commit component.
12. Capture reusable documentation improvements.

## 1. Read Component Documentation

- Read the public docs for the component.
- Read package maintainer docs that apply to the component type.
- Read the component source only as needed to understand real public behavior.
- Identify the public anatomy parts and their order.
- Identify controlled props, keyboard behavior, Field integration, direction
  behavior, composition support, and generated DOM.

## 2. Read The Workbook

- Read the component sheet in `component-coverage.xlsx`.
- Identify missing, partial, implemented-but-untested, and stale rows.
- Check whether existing rows use real public parts and playground-verifiable
  behavior.

## 3. Compare Workbook Vs Playground

- Compare every relevant workbook row against the current scenario.
- Note behavior that exists in the playground but is not reflected in the
  workbook.
- Note workbook rows that are release, export, docs-only, or otherwise not
  playground-verifiable.
- Add or revise coverage planning only after confirming the current playground
  state.

## 4. Implement Missing Behavior

- Reuse shared workbench primitives first.
- Keep state, actions, anatomy data, Source, and live Atom JSX in the scenario.
- Put controls in the Canvas toolbar.
- Keep Canvas stage focused on the live component.
- Use generic toolbar labels when possible, such as `Disable Item`.
- Hide controlled value controls when controlled mode is off.
- Add prop-check and slot-override coverage only for real Atom DOM parts.

## 5. Classify Issues

Manual testing and implementation can reveal different kinds of work. Classify
each finding before proposing a fix:

- **Playground implementation**: scenario behavior, shared workbench helper,
  Source snippet, Anatomy/Inspector wiring, logs, styling, or manual testing
  checklist issue inside `package/playground/`.
- **Atom package implementation**: primitive behavior, public API behavior,
  generated DOM, accessibility wiring, event handling, or ref behavior that
  requires package source changes.
- **Workbook/documentation**: workbook row, workbook status, workbook evidence,
  package docs, or public docs issue.
- **Documentation/process**: playground authoring rule, workflow, coverage rule,
  or reusable process improvement.

If a package implementation issue is discovered, stop before changing package
source unless the user has already approved that scope. Package source changes
must follow package-level test, documentation, and changelog rules.

## 6. Generate Manual Checklist

Create a manual checklist before final testing. Each item should state the
action and expected result. Use explicit stable values and relationship-based
expectations for dynamic ids or generated attributes.

The checklist should cover Canvas behavior, Anatomy summaries and expanded
rows, raw `Attributes`/`ARIA`/`Data`, Inspector `Selected` and `Focused`, Logs,
Source, mobile layout when relevant, and axe issues when accessibility is part
of the scenario.

## 7. Manual Testing

Run the manual checklist in the browser. Record discovered issues with their
classification before deciding where to fix them.

## 8. Fix Discovered Issues

Fix playground implementation issues inside the playground. Keep fixes scoped to
the failing behavior and preserve the component's public contract.

For workbook/documentation or documentation/process issues, update the relevant
documentation only after confirming the rule is reusable beyond the current
component.

## 9. Repeat Manual Testing Until Complete

After each fix, rerun the affected manual checklist items and any adjacent
checks that could regress. Do not update the workbook until manual testing has
passed and the component is complete.

## 10. Update Workbook

After manual verification:

- mark rows `Implemented yes`
- mark rows `Tested yes`
- set coverage to `covered`
- update notes with concise results
- confirm the index reflects the updated sheet

Add or reopen rows when a real gap remains. Remove rows that belong to
release/docs/export checks rather than playground-verifiable behavior.

## 11. Commit Component

Run verification before committing.

For playground-only changes, run:

```bash
npm run playground:build
```

When changes reveal or require package source fixes, follow the package-level
verification rules from the Atom package docs and changelogs.

Commit the component only after implementation, manual testing, workbook status,
and verification are complete.

## 12. Capture Reusable Documentation Improvements

After the component is complete, capture only lessons proven by the component
work. Put durable authoring rules in the detailed documentation, keep router
files short, and avoid adding component-specific layouts or one-off standards.
