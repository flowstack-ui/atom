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

## What Does Not Belong

Do not add playground rows for:

- package export checks
- npm publish checks
- docs existence checks
- changelog checks
- implementation details that have no playground-visible result
- prop/slot checks for hooks or utilities that render no Atom DOM

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

The index should derive totals from each component sheet. If adding or removing
rows changes a sheet, the index should update automatically.

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

