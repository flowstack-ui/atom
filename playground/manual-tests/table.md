# Table Manual Test Protocol

## Step 0: Playground Smoke Check

Setup: open the playground and select `Table` from the top menu.

Action: expand and collapse `Anatomy`, click the table in Canvas, switch Inspector between `Selected`, `Focused`, and `Logs`, then open `Source`.

Expected result: the Canvas renders a native table with caption `Project metrics`, the workbench panels respond, `Selected` shows raw table DOM evidence after clicking, `Focused` remains separate, Logs can be empty, and Source shows the default Table JSX.

Reset: leave all controls at defaults.

## Step 1: Feature-Wide State

Setup: default Table scenario.

Action: open `State > Sort direction` and choose `Ascending`.

Expected result: `Head: Project` raw ARIA includes `aria-sort="ascending"` and raw Data includes `data-sort="ascending"`.

Action: choose `Descending`, `None`, and `Other`.

Expected result: `aria-sort` and `data-sort` update exactly to `descending`, `none`, and `other`.

Action: choose `Unset`.

Expected result: `Head: Project` no longer shows `aria-sort` or `data-sort`.

Action: turn `State > Footer` on, then off.

Expected result: Footer, Footer Row, and Footer Cell change from inactive `not rendered` to live `tfoot`, `tr`, and `td`, then return to inactive.

Reset: Sort direction `Unset`; Footer off.

## Step 2: Root

Setup: default Table scenario.

Action: expand `Root`.

Expected result: Attributes title shows `table`, raw Data includes `data-slot="table"`, and Ref target is `table`.

Action: open `Composition > Root` and choose `As Child`, then `Render`.

Expected result: the Canvas still has one table element, child content is not double nested, raw Data still includes `data-slot="table"`, and Ref target remains `table`.

Action: turn `Props > Prop Check` on and `Props > Root Slot` on.

Expected result: Root raw Data includes `data-prop-check="root"` and `data-slot="table-custom"`.

Reset: Root composition `Default`; Prop Check off; Root Slot off.

## Step 3: Caption

Setup: default Table scenario.

Action: expand `Caption`.

Expected result: Attributes title shows `caption`, Text is `Project metrics`, raw Data includes `data-slot="table-caption"`, and Ref target is `caption`.

Action: open `Composition > Caption` and choose `As Child`, then `Render`.

Expected result: Caption remains a single `caption` element with text `Project metrics`, raw Data remains present, and Ref target remains `caption`.

Action: turn `Props > Prop Check` on and `Props > Caption Slot` on.

Expected result: Caption raw Data includes `data-prop-check="caption"` and `data-slot="table-caption-custom"`.

Reset: Caption composition `Default`; Prop Check off; Caption Slot off.

## Step 4: Header

Setup: default Table scenario.

Action: expand `Header`, `Header Row`, `Head: Project`, `Head: Status`, and `Head: Owner`.

Expected result: Header is `thead`, Header Row is `tr`, each column header is `th`, `Head: Project` Attributes include `scope="col"`, and Head text values are `Project`, `Status`, and `Owner`.

Action: open `Composition > Header`, `Composition > Header Row`, and `Composition > Head`; choose `As Child`, then `Render` for each.

Expected result: each inspected part remains a single valid table element with raw Data present and matching Ref target. `Head: Project`, `Head: Status`, and `Head: Owner` all show the active Head composition mode.

Action: turn `Props > Prop Check` on and enable `Header Slot`, `Header Row Slot`, and `Head Slot`.

Expected result: inspected raw Data shows `data-prop-check` for `header`, `headerRow`, and `head`, with custom slots `table-header-custom`, `table-row-custom`, and `table-head-custom`.

Reset: Header, Header Row, and Head composition `Default`; Prop Check off; tested slots off; Sort direction `Unset`.

## Step 5: Body

Setup: default Table scenario.

Action: expand `Body`, `Row: Alpha`, `Row Header: Alpha`, and `Cell: Alpha Status`.

Expected result: Body is `tbody`, Row is `tr`, Row Header is `th` with `scope="row"` and text `Alpha`, Cell is `td` with text `Ready`, and each inspected part has its default `data-slot`.

Action: open `Composition > Body`, `Composition > Body Row`, `Composition > Row Head`, and `Composition > Cell`; choose `As Child`, then `Render` for each.

Expected result: each inspected part remains a single valid table element with raw Data present and matching Ref target.

Action: turn `Props > Prop Check` on and enable `Body Slot`, `Body Row Slot`, `Row Head Slot`, and `Cell Slot`.

Expected result: inspected raw Data shows matching `data-prop-check` values and custom slots `table-body-custom`, `table-row-custom`, `table-head-custom`, and `table-cell-custom`.

Reset: Body, Body Row, Row Head, and Cell composition `Default`; Prop Check off; tested slots off.

## Step 6: Footer

Setup: turn `State > Footer` on.

Action: expand `Footer`, `Footer Row`, and `Footer Cell`.

Expected result: Footer is `tfoot`, Footer Row is `tr`, Footer Cell is `td`, Footer Cell text is `3 projects`, and each inspected part has its default `data-slot`.

Action: open `Composition > Footer`, `Composition > Footer Row`, and `Composition > Footer Cell`; choose `As Child`, then `Render` for each.

Expected result: each inspected part remains a single valid table element with raw Data present and matching Ref target.

Action: turn `Props > Prop Check` on and enable `Footer Slot`, `Footer Row Slot`, and `Footer Cell Slot`.

Expected result: inspected raw Data shows matching `data-prop-check` values and custom slots `table-footer-custom`, `table-row-custom`, and `table-cell-custom`.

Reset: Footer composition controls `Default`; Footer off; Prop Check off; tested slots off.

## Source

Setup: all controls at default.

Action: inspect Source.

Expected result: Source omits `aria-label`, `sortDirection`, footer, `data-prop-check`, custom `data-slot`, `asChild`, and `render`, while showing the simplest valid `Table.Root`, `Caption`, `Header`, `Body`, row header `scope="row"`, and cells.

Action: change Sort direction, Footer, Root composition, Head composition, Prop Check, and one custom slot.

Expected result: Source updates to include only the selected non-default props and composition wrappers. `sortDirection` appears only on `Head: Project`.

Reset: all controls at default.

## Inspector / Logs

Setup: default Table scenario.

Action: click Root, Caption, Head: Project, Row Header: Alpha, and Cell: Alpha Status in Canvas.

Expected result: `Selected` updates to the clicked element and shows raw Attributes, ARIA, Data, and direct Text where applicable; `Focused` remains independent because table cells are not focusable by default; Logs remain empty unless a toolbar action records an event.

## Workbook Cleanup / Rewrite Notes

- Table coverage rows were updated after execution to remove non-playground rows for server-safe/no client boundary and `preventDefault` composition behavior.
- Coverage keeps explicit rows for optional `sortDirection` values, footer presence, native tags, default/custom `data-slot`, prop pass-through, refs, and per-part composition.
