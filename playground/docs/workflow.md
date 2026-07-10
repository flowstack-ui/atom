# Playground Workflow

Follow this flow when completing a component or making a substantial scenario
update.

## Component Completion Workflow

1. Read the component's public source, exports, tests, and package
   documentation.
2. Establish the verified public component contract and pass the Component
   Contract Gate.
3. Audit and correct package documentation when clearly necessary.
4. Audit and correct the workbook coverage model when clearly necessary.
5. Inspect the existing playground scenario.
6. Compare the playground against the verified contract and corrected workbook
   model, then pass the Default-State Gate.
7. Implement missing playground behavior.
8. Classify any package, playground, documentation, workbook, evidence, or
   protocol issues before editing.
9. Create or update the draft Manual Test Protocol and pass the Protocol
   Self-Review Gate.
10. Execute it step by step.
11. Fix issues and repeat testing until complete.
12. Update final workbook statuses.
13. Commit component work.
14. Review the draft protocol.
15. Promote the reviewed protocol.
16. Commit the reviewed protocol.
17. Run the Reusable Lessons Review.

The workflow is not complete until Step 17 has been answered. After the final
component or protocol commit, do not move on to the next component or answer
“what’s next” until the Reusable Lessons Review is complete.

## 1. Component Contract Audit

Before inspecting or changing the playground scenario, establish the actual
public component contract. Do not let stale workbook rows or an existing
playground implementation become the de facto contract.

Use this evidence hierarchy:

1. Package source implementation.
2. Package tests.
3. Public package documentation.
4. `component-coverage.xlsx`.
5. Existing playground implementation.

Use higher-confidence sources to validate lower-confidence sources:

- Source and tests define current implementation behavior.
- Public docs define intended consumer-facing behavior.
- Workbook rows are a coverage model, not the contract.
- Playground is an implementation of the contract, not the source of truth.

Read as needed:

- public exports
- component namespace and parts
- public props and defaults
- rendered DOM behavior
- ARIA and data attributes
- composition support
- controlled and uncontrolled behavior
- events and `preventDefault` behavior
- refs
- package tests
- public package documentation

Package source and tests are evidence of current implementation behavior. Public
documentation defines the intended consumer-facing contract. When they disagree,
do not guess. Report the discrepancy and classify it before changing package
source or public docs.

Conflict classification:

- Source vs tests: package implementation bug.
- Source or tests vs package docs: package documentation gap.
- Verified package contract vs workbook: workbook coverage gap.
- Verified package contract vs playground: playground implementation gap.

Before implementation, show a concise Component Contract Gate table. Do not
create a permanent file for the gate. The table must use this evidence order:
package source, package tests, package documentation, workbook, then existing
playground.

The table must cover:

- verified default mode and state
- public parts and order
- default tags and slots
- optional props and variants
- composition support per part
- rendered DOM parts eligible for prop, slot, and ref coverage
- current scenario defaults
- mismatches that must be corrected

Do not proceed until the initial scenario matches the verified defaults, except
for the minimum content required to render and demonstrate the public parts.

## 2. Package Documentation Audit

Before playground implementation, compare public component documentation against
the verified component contract.

Look for:

- missing public props
- incorrect defaults
- missing parts
- incorrect tags
- incorrect `data-slot` values
- missing ARIA behavior
- missing composition support
- stale examples
- source/docs disagreements

If the correction is clear and limited to the component being worked on, update
the relevant package documentation as part of the component task. If intended
behavior is uncertain, stop and ask before changing package source or public
documentation.

## 3. Workbook Coverage Audit

- Before reading `component-coverage.xlsx`, read
  [../../../docs/tooling.md](../../../docs/tooling.md), activate the shared
  developer tooling environment using the command documented there, and verify
  `openpyxl` is available.
- Use `openpyxl` to inspect the component sheet in `component-coverage.xlsx`.
- Do not inspect raw XLSX XML unless `openpyxl` or LibreOffice cannot perform
  the task.
- Compare the component sheet against the verified public contract.
- Identify missing, partial, implemented-but-untested, stale, duplicated, and
  incorrect rows.
- Check whether existing rows use real public parts and playground-verifiable
  behavior.
- Identify rows assigned to the wrong public part.
- Identify DOM identity rows for provider or non-DOM parts.
- Identify behavior that is not playground-verifiable.
- Identify incorrect expected values.
- Identify package-source-only checks incorrectly treated as playground checks.

The workbook coverage model may be corrected before playground implementation
when necessary. However, do not mark rows `Tested`, mark final coverage
complete, or claim manual verification until the Manual Test Protocol has
passed.

## 4. Inspect Existing Playground Scenario

After the contract, package docs, and workbook model have been audited, inspect
the existing playground scenario.

- Identify which verified contract behaviors the scenario already exposes.
- Identify which corrected workbook rows the scenario can already verify.
- Note behavior that exists in the playground but is not part of the verified
  public contract.
- Note scenario behavior that appears to follow stale workbook rows or stale
  assumptions.

## 5. Compare Contract, Workbook, And Playground

- Compare every relevant workbook row against the current scenario only after
  validating the row against the verified contract.
- Note behavior that exists in the playground but is not reflected in the
  workbook.
- Note workbook rows that are release, export, docs-only, or otherwise not
  playground-verifiable.
- Do not invent component behavior merely to satisfy workbook rows.
- Add or revise coverage planning only after confirming both the verified
  contract and current playground state.
- Before implementation, state pass or fail for this Default-State Gate:
  “Initial Canvas and default Source represent the simplest valid consumer
  usage and contain no non-default props except those required to render public
  parts.”
- If the Default-State Gate fails, correct the scenario plan before editing.

## 6. Implement Missing Playground Behavior

- Reuse shared workbench primitives first.
- Keep state, actions, anatomy data, Source, and live Atom JSX in the scenario.
- Put controls in the Canvas toolbar.
- Keep Canvas stage focused on the live component.
- Use generic toolbar labels when possible, such as `Disable Item`.
- Hide controlled value controls when controlled mode is off.
- Add prop-check and slot-override coverage only for real Atom DOM parts.

## 7. Classify Issues

Manual testing and implementation can reveal different kinds of work. Classify
each finding before proposing a fix:

- **Atom package behavior**: primitive behavior, public API behavior, generated
  DOM, accessibility wiring, event handling, ref behavior, or package tests
  that disagree with source behavior.
- **Playground implementation/composition**: scenario behavior, shared
  workbench helper, Source snippet, Anatomy/Inspector wiring, logs, styling, or
  component composition inside `package/playground/`.
- **Evidence/inspection tooling**: Anatomy, Inspector, Focused, Selected, Logs,
  raw Attributes, raw ARIA, raw Data, mutation refresh, or evidence formatting
  that makes real DOM behavior hard to verify.
- **Protocol wording**: Manual Test Protocol steps, setup, action order,
  expected results, step grouping, or tester flow.
- **Workbook model**: missing, stale, duplicated, incorrect,
  non-playground-verifiable, wrong-part, source-only, status, evidence, formula,
  or index issue in `component-coverage.xlsx`.
- **Package documentation**: public docs, examples, anatomy, props, defaults,
  tags, `data-slot`, ARIA, composition, or package docs that disagree with
  source and tests.

If an Atom package behavior issue is discovered, stop before changing package
source unless the user has already approved that scope. Package source changes
must follow package-level test, documentation, and changelog rules.

Do not silently change package source when docs and source disagree. Keep package
documentation corrections scoped to the component being completed, and ask before
changing package source or public documentation when intended behavior is
uncertain.

Do not immediately patch uncertain behavior. Classify the issue first, identify
the evidence that supports the classification, and only edit the artifact owned
by that classification.

## 8. Generate Draft Manual Test Protocol

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

Before showing Step 0, audit the full draft protocol with the Protocol
Self-Review Gate from `component-testing.md`. Report pass or fail for each
criterion. Do not show Step 0 until every criterion passes.

## 9. Execute Manual Test Protocol

Run the Manual Test Protocol in the browser one step at a time.

Agent behavior:

1. Create or update the draft in `.manual-tests/`.
2. Show only Step 0 first.
3. Wait for tester confirmation.
4. When the tester says `next`, show only the next step.
5. If the tester reports an issue, classify it before deciding where to fix it:
   - `Atom package behavior`
   - `Playground implementation/composition`
   - `Evidence/inspection tooling`
   - `Protocol wording`
   - `Workbook model`
   - `Package documentation`
6. Do not continue until the current step passes or the issue is resolved or
   triaged.
7. Do not mark rows `Tested`, set final coverage to `covered`, or claim manual
   verification until every protocol step passes.
8. Promote to `manual-tests/<component>.md` only after the protocol is reviewed
   and considered stable.

## 10. Fix Discovered Issues

Fix playground implementation gaps inside the playground. Keep fixes scoped to
the failing behavior and preserve the component's public contract.

For package documentation gaps, workbook coverage gaps, or
documentation/process issues, update the relevant artifact only when the change
is clear for the component or reusable beyond it. Keep workbook cleanup separate
from manual testing execution.

## 11. Repeat Manual Testing Until Complete

After each fix, rerun the affected Manual Test Protocol step and any adjacent
steps that could regress. Do not update the workbook until every protocol step
has passed and the component is complete.

## 12. Update Workbook

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

## 13. Commit Component

Run verification before committing.

For playground-only changes, run:

```bash
npm run playground:build
```

When changes reveal or require package source fixes, follow the package-level
verification rules from the Atom package docs and changelogs.

Commit the component only after implementation, manual testing, workbook status,
and verification are complete.

## 14. Review Draft Protocol

Review the draft protocol after the completed component is committed. Keep the
review focused on whether the draft is stable regression coverage for future
component work.

## 15. Promote Reviewed Protocol

Move the reviewed draft from `.manual-tests/<component>.md` to
`manual-tests/<component>.md` only after successful manual testing, workbook
updates, component verification, and draft review.

## 16. Commit Reviewed Protocol

Commit the promoted protocol separately from the completed component.

## 17. Reusable Lessons Review

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
