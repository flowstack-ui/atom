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
6. Generate a draft Manual Test Protocol in `.manual-tests/<component>.md`.
7. Execute Manual Test Protocol.
8. Fix implementation issues.
9. Repeat manual testing until complete.
10. Update `component-coverage.xlsx`.
11. Commit the component.
12. Review the draft protocol.
13. Promote the reviewed protocol to `manual-tests/<component>.md`.
14. Commit the reviewed protocol.
15. Reusable Lessons Review.

The workflow is not complete until Step 15 has been answered. After the final
component or protocol commit, do not move on to the next component or answer
“what’s next” until the Reusable Lessons Review is complete.

## 1. Read Component Documentation

- Read the public docs for the component.
- Read package maintainer docs that apply to the component type.
- Read the component source only as needed to understand real public behavior.
- Identify the public anatomy parts and their order.
- Identify controlled props, keyboard behavior, Field integration, direction
  behavior, composition support, and generated DOM.

## 2. Read Workbook Rows

- Before reading `component-coverage.xlsx`, read
  [../../../docs/tooling.md](../../../docs/tooling.md), activate the shared
  developer tooling environment using the command documented there, and verify
  `openpyxl` is available.
- Use `openpyxl` to inspect the component sheet in `component-coverage.xlsx`.
- Do not inspect raw XLSX XML unless `openpyxl` or LibreOffice cannot perform
  the task.
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

## 6. Generate Draft Manual Test Protocol

Create or update the component's draft Manual Test Protocol before final
testing. Use `component-testing.md` as the canonical authoring guide.

Use this lifecycle:

1. Generate the draft protocol in `.manual-tests/<component>.md`.
2. Execute the protocol during manual testing.
3. Improve the draft based on real testing.
4. Finish manual testing and workbook updates.
5. Commit the completed component.
6. Review the draft protocol.
7. Promote the reviewed protocol to `manual-tests/<component>.md`.
8. Commit the reviewed protocol.

Files under `manual-tests/` are reviewed, version-controlled regression
protocols. Do not promote a draft protocol until the component has completed
manual testing and workbook updates.

Write protocol steps in the order from `component-testing.md`:

- `Step 0: Playground Smoke Check`
- `Step 1: Feature-Wide State`
- `Step 2+: public parts in public anatomy order`
- `Source`
- `Inspector / Logs`
- `Nested / Portal / Focus Behavior`, when applicable
- `Workbook Cleanup / Rewrite Notes`

Keep the workflow reminder short: each step has one testing target, begins from
a clearly defined state, separates setup, action, verification, and reset when
needed, and reads like an executable QA test script rather than a component
explanation.

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

- Before writing `component-coverage.xlsx`, read
  [../../../docs/tooling.md](../../../docs/tooling.md), activate the shared
  developer tooling environment using the command documented there, and verify
  `openpyxl` is available.
- Use `openpyxl` for workbook edits.
- Preserve formulas, formatting, conditional formatting, and workbook structure.
- Do not inspect or edit raw XLSX XML unless `openpyxl` or LibreOffice cannot
  perform the task.
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

## 12. Review Draft Protocol

Review the draft protocol after the completed component is committed. Keep the
review focused on whether the draft is stable regression coverage for future
component work.

## 13. Promote Reviewed Protocol

Move the reviewed draft from `.manual-tests/<component>.md` to
`manual-tests/<component>.md` only after successful manual testing, workbook
updates, component verification, and draft review.

## 14. Commit Reviewed Protocol

Commit the promoted protocol separately from the completed component.

## 15. Reusable Lessons Review

After implementation, manual testing, workbook update, component commit,
protocol review, protocol promotion, and protocol commit are complete, answer
this before starting the next component:

```text
Did this component teach any reusable lesson that should improve future components?
```

Classify the answer as one of:

- `No reusable lessons`
- `Playground implementation pattern`
- `Manual Test Protocol pattern`
- `Workbook coverage pattern`
- `Documentation/process pattern`
- `Atom package pattern`

Do not edit documentation automatically during this review. Recommend
documentation updates only when the lesson applies beyond this one component.
One-off component fixes should stay in the component commit.

If a reusable lesson exists, summarize:

- what was learned
- which future components it affects
- which documentation file likely owns the change
- whether it is worth a separate documentation session

This is a required completion gate. If the user asks what remains or what is
next immediately after a component commit, first perform this review and then
answer the question.
