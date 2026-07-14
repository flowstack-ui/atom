# DataGrid Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

- Start the playground and open Data Grid from the top menu.
- Leave every DataGrid toolbar control at its initial value.

Action

- Open and close Anatomy, State, Navigation, Composition, Props, Source, Selected, Focused, and Logs.

Verify

- The title is `Data Grid` and the Canvas renders one complete grid without an error overlay.
- The initial footer is `uncontrolled none | Selected none | Active none | default`.
- Every named panel and toolbar menu opens and closes without moving the Canvas component out of the stage.

## Step 1: Feature-Wide State

### Selection modes and uncontrolled defaults

Setup

- State mode `Uncontrolled`; Selection `None`; Initial Defaults off; State Flags off.

Action

- Change Selection to `Single`, then enable `Default selected row`.

Verify

- Alpha / Ready is visibly selected.
- The footer reports `Selected alpha`.
- Source contains `selectionMode="single"` and `defaultValue={"alpha"}`.

Action

- Change Selection to `Multiple`.

Verify

- Selection resets to none and Source contains `selectionMode="multiple"`.

### Controlled selection and active cell

Setup

- State mode `Controlled`; Selection `Multiple`; Controlled Values visible.

Action

- Set Selected row to `Alpha + Bravo`, then Active cell to `Alpha / Name`.

Verify

- Alpha / Ready and Bravo / Review are visibly selected.
- The footer reports `Selected alpha,bravo | Active 2:1`.
- Source contains the exact controlled `value`, `activeCell`, and both change callbacks.

### Read-only, disabled, and row-click selection

Setup

- State mode `Controlled`; Selection `Single`; selected row `None`; active cell `Alpha / Name`; `Select row on click` on.

Action

- Click the Alpha row, enable Read only, then click Bravo.

Verify

- Alpha becomes selected before Read only is enabled.
- Bravo does not replace Alpha while Read only is enabled.

Action

- Turn Read only off, enable Disabled, and press ArrowDown while the grid is focused.

Verify

- The active cell does not move while Disabled is enabled.

Reset

- Restore State mode `Uncontrolled`, Selection `None`, Initial Defaults off, and all State Flags off.

## Step 2: Root

Setup

- Default toolbar state; Root Anatomy group expanded.

Action

- Inspect Root Attributes, ARIA, and Data.

Verify

- Attributes show tag `table`, `role="grid"`, `dir="ltr"`, and `tabindex="0"`.
- ARIA shows `aria-label="Project data grid"`, `aria-colcount="-1"`, and `aria-rowcount="-1"`.
- Data shows `data-slot="data-grid"`; selection, active, focused, disabled, read-only, and count data are absent.
- Root Ref is `table`.

Action

- Enable Row and column counts, focus the grid, then enable Disabled and Read only one at a time.

Verify

- Counts show `aria-rowcount="5"`, `aria-colcount="2"`, `data-row-count="5"`, and `data-column-count="2"`.
- Focus adds `data-focused`; an active cell adds `aria-activedescendant` and `data-active`.
- Disabled adds `aria-disabled="true"` and `data-disabled`; Read only adds `aria-readonly="true"` and `data-readonly`.

Action

- Set Selection to Multiple.

Verify

- Root shows `aria-multiselectable="true"` and `data-selection-mode="multiple"`.

Action

- Test Root Default, As Child, and Render composition; then enable Prop Check and Root Slot.

Verify

- Every composition renders one `table` with the grid role and behavior intact.
- Root Data shows `data-prop-check="root"` and then `data-slot="data-grid-root-custom"`.

Reset

- Restore default Root composition, Prop Check off, Root Slot off, counts off, and Selection None.

## Step 3: Caption

Setup

- Default toolbar state; Caption Anatomy group expanded.

Action

- Inspect Caption, test its three composition modes, then enable Prop Check and Caption Slot.

Verify

- Caption is `caption`, direct text is `Project data`, default Data is `data-slot="data-grid-caption"`, and Ref is `caption`.
- Each composition renders one caption in the same public anatomy position.
- Data shows `data-prop-check="caption"` and then `data-slot="data-grid-caption-custom"`.

Reset

- Restore Caption composition and Props controls.

## Step 4: Header

Setup

- Default toolbar state; Header Anatomy group expanded.

Action

- Inspect Header, test its three composition modes, then enable Prop Check and Header Slot.

Verify

- Header is `thead`; Attributes show `role="rowgroup"`; default Data is `data-slot="data-grid-header"`; Ref is `thead`.
- The Name / Status row remains nested in Header for all compositions.
- Data shows `data-prop-check="header"` and then `data-slot="data-grid-header-custom"`.

Reset

- Restore Header composition and Props controls.

## Step 5: Row

### Name / Status — baseline Row contract

Setup

- Default toolbar state; Row: Name / Status expanded.

Action

- Inspect the row, test Row Default, As Child, and Render, then enable Prop Check and Row Slot.

Verify

- The row is `tr`; Attributes show `role="row"`; ARIA shows `aria-rowindex="1"`; default Data is `data-slot="data-grid-row"`; Ref is `tr`.
- Every composition keeps the two column headers in one row.
- Data shows `data-prop-check="row"` and then `data-slot="data-grid-row-custom"`.
- With selection enabled, Data shows `data-selection-disabled`; row click, `Enter`, and `Space` do not select the heading row.

### Alpha / Ready — index, value, and selection delta

Setup

- Restore Row composition and Props controls; Selection Single.

Action

- Inspect Alpha / Ready, enable Select row on click, and click Alpha.

Verify

- ARIA shows `aria-rowindex="2"` and `aria-selected="true"` after selection.
- Data shows `data-row-index="2"`, `data-value="alpha"`, `data-selectable`, and `data-selected`.
- The selected-row styling uses a blue-tinted surface and leading accent.

### Bravo / Review — explicit rowIndex delta

Setup

- Selection None.

Action

- Inspect Bravo / Review.

Verify

- ARIA shows `aria-rowindex="3"`; Data shows `data-row-index="3"` and `data-value="bravo"`.

### Blocked / Waiting — disabled delta

Setup

- Disable row off.

Action

- Enable Disable row and inspect Blocked / Waiting.

Verify

- ARIA shows `aria-rowindex="4"` and `aria-disabled="true"`.
- Data shows `data-row-index="4"`, `data-value="blocked"`, and `data-disabled`.
- Both row cells use the disabled visual treatment.

### Total / 3 Projects — footer row delta

Setup

- Disable row off.

Action

- Inspect Total / 3 Projects.

Verify

- Attributes show `role="row"`; ARIA shows `aria-rowindex="5"` and `aria-selected="false"`.
- Data shows `data-value="summary"` and `data-selection-disabled`; row click, `Enter`, and `Space` do not select the summary row.

Reset

- Restore Selection None, Select row on click off, and Disable row off.

## Step 6: Column Header

### Name — baseline ColumnHeader contract

Setup

- Default toolbar state; Column Header: Name expanded.

Action

- Inspect Name, test Column Header Default, As Child, and Render, then enable Prop Check and Column Header Slot.

Verify

- Name is `th`; Attributes show `scope="col"` and `role="columnheader"`; ARIA shows `aria-colindex="1"`.
- Default Data is `data-slot="data-grid-column-header"` with `data-column-index="1"`; Ref is `th`.
- Data shows `data-prop-check="columnHeader"` and then `data-slot="data-grid-columnHeader-custom"`.

### Status — index and sort delta

Setup

- Restore Column Header composition and Props controls; Status sort Unset.

Action

- Set Status sort to Ascending and inspect Status.

Verify

- ARIA shows `aria-colindex="2"` and `aria-sort="ascending"`.
- Data shows `data-column-index="2"` and `data-sort="ascending"`.
- The body row order remains Alpha, Bravo, Blocked because sorting is application-owned.

Reset

- Restore Status sort Unset.

## Step 7: Body

Setup

- Default toolbar state; Body expanded.

Action

- Inspect Body, test its three composition modes, then enable Prop Check and Body Slot.

Verify

- Body is `tbody`; Attributes show `role="rowgroup"`; default Data is `data-slot="data-grid-body"`; Ref is `tbody`.
- All three project rows remain nested in Body for every composition.
- Data shows `data-prop-check="body"` and then `data-slot="data-grid-body-custom"`.

Reset

- Restore Body composition and Props controls.

## Step 8: Cell

### Alpha — baseline Cell contract and index normalization

Setup

- Default toolbar state; Cell: Alpha expanded.

Action

- Inspect Alpha, test Cell Default, As Child, and Render, then enable Prop Check and Cell Slot.

Verify

- Alpha is `td`; Attributes show `role="gridcell"`; ARIA shows `aria-colindex="1"`.
- Default Data is `data-slot="data-grid-cell"` with `data-column-index="1"`; Ref is `td`.
- Data shows `data-prop-check="cell"` and then `data-slot="data-grid-cell-custom"`.

### Ready — explicit columnIndex delta

Setup

- Restore Cell composition and Props controls.

Action

- Inspect Ready.

Verify

- ARIA shows `aria-colindex="2"`; Data shows `data-column-index="2"`.

### Review — disabled-cell delta

Setup

- Disable cell off.

Action

- Enable Disable cell and inspect Review.

Verify

- ARIA shows `aria-disabled="true"`; Data shows `data-disabled`.
- Review uses the disabled visual treatment and keyboard navigation skips it.

### Selected and active cell deltas

Setup

- Disable cell off; Selection Single; Select row on click on.

Action

- Click Alpha, then click Ready.

Verify

- Both Alpha-row cells show `aria-selected="true"` and `data-selected`.
- Ready shows `data-active` while the focused grid exposes its id through `aria-activedescendant`.
- Active styling is a clear blue inset focus ring; selected plus active remains distinguishable.

Reset

- Restore Selection None, Select row on click off, and Disable cell off.

## Step 9: Footer

Setup

- Default toolbar state; Footer expanded.

Action

- Inspect Footer, test its three composition modes, then enable Prop Check and Footer Slot.

Verify

- Footer is `tfoot`; Attributes show `role="rowgroup"`; default Data is `data-slot="data-grid-footer"`; Ref is `tfoot`.
- The Total / 3 Projects row remains nested in Footer for every composition.
- Data shows `data-prop-check="footer"` and then `data-slot="data-grid-footer-custom"`.

Reset

- Restore Footer composition and Props controls.

## Step 10: Keyboard Navigation

Setup

- Default toolbar state; focus the grid; Disable row and Disable cell off.

Action

- Press ArrowRight, ArrowDown, ArrowLeft, and ArrowUp one at a time.

Verify

- The active descendant moves one enabled cell in the documented direction and focus remains on the grid root.

Action

- Press Home, End, Ctrl+Home, and Ctrl+End one at a time.

Verify

- Home and End move to the first and last cell in the current row.
- Ctrl+Home and Ctrl+End move to the first and last registered cell in the grid.

Action

- Enable Disable cell. From Ready, press ArrowDown, then ArrowUp.

Verify

- ArrowDown skips Review, preserves column 2, and lands on Waiting.
- ArrowUp skips Review, preserves column 2, and returns to Ready.

Action

- Enable Disable row and navigate through the Blocked row.

Verify

- Both Blocked-row cells are skipped without changing columns when the same column exists in the following row.

Action

- Turn disabled controls off; enable Wrap rows; move from a row-end cell with ArrowRight; then enable Loop and move beyond the final row.

Verify

- Wrap rows moves to the first enabled cell of the next row.
- Loop permits navigation from the last registered row back to the first.

Action

- Set Selection Single and press Enter, then Space, on a project-row cell.

Verify

- Each key selects the active row and produces one value-change log entry.

Reset

- Restore default toolbar state.

## Step 11: Direction

Setup

- Default toolbar state; focus Alpha / Name.

Action

- Test Direction `Default`, `Provider RTL`, `Local LTR`, and `Local RTL` one at a time.

Verify

- Root Attributes show exact `dir="ltr"`, `dir="rtl"`, `dir="ltr"`, and `dir="rtl"` respectively.
- Local LTR overrides the RTL provider.

Action

- In Provider RTL and Local RTL, press ArrowRight and ArrowLeft from Alpha / Status.

Verify

- ArrowRight moves visually/logically to the previous registered column and ArrowLeft moves to the next.
- ArrowUp, ArrowDown, Home, End, Ctrl+Home, and Ctrl+End retain their documented behavior.

Reset

- Restore Direction Default.

## Step 12: Source

Setup

- Restore every toolbar control to its initial value and open Source.

Action

- Read the default Source, then toggle state, navigation, direction, composition, Prop Check, each slot override, Disable row, Disable cell, counts, and sort one at a time.

Verify

- Default Source shows the full public anatomy, accessible label, required row/cell index and value props, and explicit `selectable={false}` intent for the heading and summary rows.
- Default Source omits selection mode, state props, callbacks, direction provider, counts, sorting, disabled flags, composition escapes, prop checks, and custom slots.
- Each control changes only its matching public consumer JSX and Source contains no playground classes, refs, ids, inspection markers, logs, or layout wrappers.
- Controlled props and callbacks appear only in Controlled mode; uncontrolled default props appear only when their Initial Default control is on.

## Step 13: Inspector / Logs

Setup

- Default toolbar state; clear Logs.

Action

- Click Alpha, then focus the grid and navigate to Ready.

Verify

- Selected describes the last clicked DOM part and Focused separately describes the grid root.
- Selected and Focused use the same Attributes, ARIA, and Data syntax as Anatomy.

Action

- Set Selection Single, select Alpha, and move the active cell twice.

Verify

- Logs contain only real `value changed ...` and `active cell ...` callbacks with compact timestamps.
- Each callback appears once; Clear Logs empties the list and adds no fake event.

## Workbook Cleanup / Rewrite Notes

- Remove duplicate alias-part rows for `GridBody`, `GridCaption`, `GridCell`, `GridColumnHeader`, `GridFooter`, `GridHeader`, and `GridRow`; the public parts are already covered by their canonical names.
- Restore Row `selectable`, `data-selectable`, and `data-selection-disabled` coverage now that the package implements the documented selection opt-out contract.
- Replace stale `data-grid`, `data-grid-`, and per-slot pseudo-attribute rows with the canonical `data-slot` evidence owned by each public part.
- Replace the incorrect RTL row-start/row-end expectation with local-direction override coverage; Home and End remain documented row-edge navigation independent of text direction.
