# TreeGrid Manual Test Protocol

## Step 0: Playground Smoke Check

Verify the page, Canvas, Anatomy, all toolbar menus, Source, Selected, Focused, and Logs load without errors.

## Step 1: Feature-Wide State

Verify uncontrolled and controlled state; none, single, and multiple selection; controlled value clearing; expansion; read-only; disabled; callback logs; visible active-cell styling; and visible selected-row styling. In Controlled Single, use Controlled Values → Clear Selection; direct Row interaction does not toggle Single selection off.

## Step 2: Root

Use Root for complete tag, role, direction, tabindex, count, selection-mode, active-descendant, state, ref, composition, prop, and slot evidence. Without count props, verify `aria-rowcount="-1"` and `aria-colcount="-1"`; with positive counts, verify matching ARIA and Data count values.

## Step 3: Caption

Use Caption for complete tag, text, slot, ref, composition, prop, and slot-override evidence.

## Step 4: Header

Use Header for complete tag, rowgroup role, slot, ref, composition, prop, and slot-override evidence.

## Step 5: Row

Test Row instances in this order. Finish one instance before moving to the next.

### Task / Owner — baseline Row contract

Verify tag `tr`; `role="row"`; row index 1; level 1; value `heading`; default slot; ref; As Child; Render; prop pass-through; and slot override. With selection enabled, verify `data-selection-disabled`.

### Project / Team — expandable and selectable variation

Verify row index 2, level 1, value `project`, `data-expandable`, `data-selectable`, collapsed/expanded evidence, selected evidence, and visible selection styling.

### Design Review / Ava — descendant visibility variation

With Project collapsed, verify `hidden`, `aria-hidden="true"`, `data-hidden`, parent value `project`, level 2, row index 3, and value `design`. Expand Project and verify the row becomes visible.

### Blocked Task / Noah — disabled variation

With Project expanded, verify parent value `project`, level 2, row index 4, and value `blocked`. Enable Disabled Child Row and verify `aria-disabled="true"`, `data-disabled`, and disabled styling.

### Total / 3 Tasks — non-selectable summary variation

With selection enabled, verify row index 5, level 1, value `summary`, `aria-selected="false"`, and `data-selection-disabled`.

## Step 6: Column Header

Test Column Header instances in this order.

### Task — baseline Column Header contract

Verify tag `th`; `scope="col"`; `role="columnheader"`; column index 1; default slot; ref; As Child; Render; prop pass-through; and slot override.

### Owner — sorting variation

Verify column index 2. Set Owner Sort to Ascending and verify `aria-sort="ascending"` and `data-sort="ascending"`; row order remains unchanged because sorting is application-owned.

## Step 7: Body

Use Body for complete tag, rowgroup role, slot, ref, As Child, Render, prop pass-through, slot override, and child-row nesting evidence.

## Step 8: Row Header

Test Row Header instances in this order.

### Project — baseline Row Header contract

Verify tag `th`; `scope="row"`; `role="rowheader"`; column index 1; selection evidence; default slot; ref; As Child; Render; prop pass-through; and slot override.

### Design Review — descendant integration

With Project expanded, verify the same semantic identity and column index. No shared contract checks are repeated.

### Blocked Task — disabled variation

Enable Disabled Child Row and verify `aria-disabled="true"` and `data-disabled`.

### Total — summary integration

Verify the same semantic identity and column index. No shared contract checks are repeated.

## Step 9: Cell

Test Cell instances in this order.

### Team — baseline Cell contract

Verify tag `td`; `role="gridcell"`; column index 2; selection evidence; default slot; ref; active styling; As Child; Render; prop pass-through; and slot override.

### Ava — descendant integration

With Project expanded, verify the same semantic identity and column index. No shared contract checks are repeated.

### Noah — disabled variation

Enable Disabled Child Row and verify `aria-disabled="true"` and `data-disabled`.

### 3 Tasks — summary integration

Verify the same semantic identity, column index, and direct text `3 tasks`. No shared contract checks are repeated.

## Step 10: Footer

Use Footer for complete tag, rowgroup role, slot, ref, As Child, Render, prop pass-through, slot override, and summary-row nesting evidence.

## Step 11: Keyboard Navigation

Verify expand/collapse arrows, horizontal and vertical cell navigation, Home, End, Ctrl+Home, Ctrl+End, collapsed descendants, disabled-cell skipping, selection keys, and loop behavior.

## Step 12: Direction

Verify Default, Provider RTL, Local LTR, and Local RTL; exact raw `dir`; mirrored horizontal behavior; local override; and unchanged vertical/Home/End behavior.

## Step 13: Source

Verify default Source contains the simplest valid public anatomy and omits optional props. Verify state, direction, composition, prop, slot, disabled, count, and sort changes update Source without playground plumbing.

## Step 14: Inspector / Logs

Verify Selected and Focused stay distinct and match Anatomy raw evidence. Verify Logs contain only real value, expansion, and active-cell callbacks with compact timestamps and Clear Logs adds no fake event.

## Workbook Cleanup / Rewrite Notes

- All TreeGrid workbook rows passed this reviewed protocol.
- Repeated instances use baseline-plus-delta coverage rather than repeating the shared public-part contract.
- Direction rows reflect implemented provider and local direction behavior.
- Unsupported typeahead coverage was replaced with the verified local-direction override requirement.
