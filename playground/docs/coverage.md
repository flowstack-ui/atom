# Coverage Workbook

`component-coverage.xlsx` tracks playground-verifiable coverage. It is not a
release checklist and should not include rows that cannot be tested in the
playground.

## What Belongs

Rows should cover behavior visible through the playground:

- rendered anatomy parts
- keyboard and pointer interactions
- controlled and uncontrolled state
- disabled, required, read-only, and invalid behavior
- form participation
- Field integration
- direction behavior when relevant
- composition through default, `asChild`, and `render`
- prop pass-through through `data-prop-check`
- custom `data-slot` override when supported
- Source, Anatomy, Inspector, and Logs evidence

Composition rows should cover each public part that supports composition. Do
not treat a root/default composition check as complete coverage when Trigger,
Close, Item, or another public part also supports `asChild` or `render`.

Rows for stable DOM evidence should name exact expected values whenever useful:
default rendered tag, `data-slot`, `data-state`, role, `aria-*` attributes,
`data-prop-check`, and custom `data-slot` values. For generated ids or dynamic
browser values, describe the expected relationship instead of inventing a
literal value.

## What Does Not Belong

Do not add playground rows for:

- package export checks
- npm publish checks
- docs existence checks
- changelog checks
- implementation details that have no playground-visible result
- prop/slot checks for hooks or utilities that render no Atom DOM
- generated DOM as a fake top-level anatomy part
- fake evidence attributes added only to make a workbook row pass

Those can be tracked elsewhere, but not in this workbook.

## Status Rules

Use consistent status values:

- `covered` when implemented and manually tested
- `partial` when some behavior exists but coverage is incomplete
- `missing` when the playground does not yet expose the test

Completed rows should have:

- `Implemented` = `yes`
- `Tested` = `yes`
- `Coverage Status` = `covered`
- a short result note, such as `passed manual test`

When the expected result is stable, include it in the note or checklist used to
verify the row. Stable values include default tag, `data-slot`, role,
`data-state`, and ARIA attributes. For dynamic values, describe the relationship
instead of inventing a literal value, such as an ARIA relationship matching the
rendered generated id.

The index should derive totals from each component sheet. If adding or removing
rows changes a sheet, the index should update automatically.

## Column Semantics

The workbook is the manual coverage source of truth. Component sheets should
keep these concepts clear even if the exact column labels evolve:

- **Category or Area**: the behavior group, such as Public API, Anatomy,
  Keyboard, Pointer, Source, Props, or Slots.
- **Part**: the public Atom part being tested, such as Root, Trigger, Item, or
  Hidden Input. Use the real component part, not a playground-only helper.
- **Test**: the specific behavior or evidence being checked.
- **Implemented**: whether the playground exposes the scenario needed to test
  the row.
- **Tested**: whether the row was manually verified in the browser.
- **Coverage Status**: `covered`, `partial`, or `missing`.
- **Notes or Evidence**: a short result, open issue, or pointer to where the
  behavior is visible.

Do not mark a row complete unless both implementation and manual testing are
complete. If a component gets new behavior later, add or reopen rows so the
index drops below 100% until the new work is tested.

## Index And Formatting Expectations

The exact formulas and conditional-formatting rules must be verified in the
workbook before changing them. The maintenance expectation is:

- each component row in the index derives totals from its component sheet
- completion is based on tested covered rows, not only implemented rows
- `missing`, `partial`, and untested rows keep a component below 100%
- `Open` is zero only when no rows remain missing, partial, or untested
- rows and index status colors match the calculated state
- adding or removing rows from a component sheet updates the index totals

If Excel reports formula or circular-reference problems, repair the workbook
before trusting the index.

## Workbook Maintenance

- Keep tabs organized and readable.
- Keep index formulas and conditional formatting accurate.
- When a component is marked 100%, confirm there are no `missing`, `partial`,
  or untested rows on its sheet.
- If a real gap is found later, add or reopen the row and let the index drop
  below 100%.

## Prop And Slot Rows

Prop pass-through and custom slot rows are valid only for public parts that
render Atom DOM and accept those props.

Examples:

- `Input.Root` prop check
- `Input.Clear` custom slot
- `Select.Item` prop check
- `Dialog.Content` custom slot

Do not add these rows to `Collection`, `Virtualizer`, or other APIs that do not
render Atom DOM parts.

## Automation Candidates

Author workbook rows and playground scenarios so stable evidence can eventually
move from manual verification into automated tests. The scenario should expose
deterministic evidence whenever possible for:

- default rendered tags
- `data-slot` values
- `data-state` values
- ARIA attributes and relationships
- prop pass-through
- custom slot overrides
- Source output
- Anatomy order where practical
- provider and non-DOM parts not receiving fake DOM identity

Manual workbook coverage should remain focused on evidence available in the
playground today. Do not add fake anatomy parts, fake attributes, or provider
DOM wrappers only to make a future automated check easier.
