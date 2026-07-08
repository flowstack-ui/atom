# Playground Workflow

Follow this flow when completing a component or making a substantial scenario
update.

## Component Completion Workflow

1. Read component documentation.
2. Read workbook rows.
3. Compare workbook against playground.
4. Implement missing playground behavior.
5. Classify issues:
   - Playground
   - Atom package
   - Workbook
   - Documentation
6. Create or update Manual Test Protocol.
7. Execute Manual Test Protocol.
8. Fix discovered issues.
9. Repeat manual testing until complete.
10. Update workbook.
11. Commit the component.
12. Capture reusable documentation improvements.

## 1. Read Component Documentation

- Read the public docs for the component.
- Read package maintainer docs that apply to the component type.
- Read the component source only as needed to understand real public behavior.
- Identify the public anatomy parts and their order.
- Identify controlled props, keyboard behavior, Field integration, direction
  behavior, composition support, and generated DOM.

## 2. Read Workbook Rows

- Read the component sheet in `component-coverage.xlsx`.
- Identify missing, partial, implemented-but-untested, and stale rows.
- Check whether existing rows use real public parts and playground-verifiable
  behavior.

## 3. Compare Workbook Against Playground

- Compare every relevant workbook row against the current scenario.
- Note behavior that exists in the playground but is not reflected in the
  workbook.
- Note workbook rows that are release, export, docs-only, or otherwise not
  playground-verifiable.
- Add or revise coverage planning only after confirming the current playground
  state.

## 4. Implement Missing Playground Behavior

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

- **Playground**: scenario behavior, shared workbench helper,
  Source snippet, Anatomy/Inspector wiring, logs, styling, or Manual Test
  Protocol issue inside `package/playground/`.
- **Atom package**: primitive behavior, public API behavior, generated DOM,
  accessibility wiring, event handling, or ref behavior that requires package
  source changes.
- **Workbook**: workbook row, workbook status, workbook evidence, worksheet
  formula, or index issue.
- **Documentation**: playground authoring rule, workflow, coverage rule,
  package docs, public docs, or reusable process improvement.

If a package implementation issue is discovered, stop before changing package
source unless the user has already approved that scope. Package source changes
must follow package-level test, documentation, and changelog rules.

## 6. Create Or Update Manual Test Protocol

Create or update the component's Manual Test Protocol before final testing.
Protocols are saved, step-by-step QA procedures for one component.

Use this lifecycle:

1. Generate the draft protocol in `.manual-tests/`.
2. Execute the protocol during manual testing.
3. Improve the protocol based on real testing.
4. After review, promote the stable protocol to `manual-tests/<component>.md`.

Files under `manual-tests/` are reviewed, version-controlled regression
protocols. Do not promote a draft protocol just because it exists.

Write protocol steps in the structure from `component-testing.md`:

- `Playground Smoke Check`
- `Feature-Wide State`
- `Root`
- each public part in public anatomy order
- `Source`
- `Inspector / Logs`
- `Nested / Portal / Focus Behavior`, when applicable
- `Workbook Cleanup / Rewrite Notes`

Keep steps part-first and concise. Separate action from expectation, use
checkbox-style expected results, and prefer short setup blocks over long prose.
Each step should have one testing target. Do not put Trigger or Content checks
inside Root, do not mix feature-wide behavior into part-specific steps, and do
not repeat the same check in multiple steps.

## 7. Execute Manual Test Protocol

Run the Manual Test Protocol in the browser one step at a time.

Agent behavior:

1. Create or update the draft in `.manual-tests/`.
2. Show only Step 0 first.
3. Wait for tester confirmation.
4. When the tester says `next`, show only the next step.
5. If the tester reports an issue, classify it before deciding where to fix it:
   - `Playground issue`
   - `Atom package issue`
   - `Workbook issue`
   - `Documentation/process issue`
6. Do not continue until the current step passes or the issue is resolved or
   triaged.
7. Do not update `component-coverage.xlsx` until every protocol step passes.
8. Promote to `manual-tests/<component>.md` only after the protocol is reviewed
   and considered stable.

## 8. Fix Discovered Issues

Fix Playground issues inside the playground. Keep fixes scoped to the failing
behavior and preserve the component's public contract.

For Workbook or Documentation issues, update the relevant artifact only after
confirming the change is reusable beyond the current component. Keep workbook
cleanup separate from manual testing execution.

## 9. Repeat Manual Testing Until Complete

After each fix, rerun the affected Manual Test Protocol step and any adjacent
steps that could regress. Do not update the workbook until every protocol step
has passed and the component is complete.

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
