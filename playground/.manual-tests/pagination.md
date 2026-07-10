# Pagination Manual Test Protocol

Draft protocol for active Pagination playground work.

## Step 0: Playground Smoke Check

Setup

Pagination scenario selected. Default toolbar state:

- Controlled on
- Disabled off
- Localized Labels off
- Total Pages 10
- Sibling Count 1
- Boundary Count 1
- Controlled Page 4
- every Composition control set to Default
- every Props slot toggle off
- Prop Check off

Action

Open the Pagination scenario from the top menu. Expand Anatomy, select Root, open Source, and open Inspector tabs.

Verify

□ Scenario renders a pagination nav in the Canvas.
□ Anatomy lists Root, List, Previous, Item: Current, Ellipsis, and Next in that order.
□ Source shows `Pagination.Root`, `Pagination.List`, `Pagination.Previous`, `Pagination.Item`, `Pagination.Ellipsis`, and `Pagination.Next`.
□ Inspector tabs switch between Selected, Focused, and Logs.
□ Canvas footer reads `Page 4 | Total 10`.

## Step 1: Feature-Wide State

Setup

Default toolbar state. Logs cleared.

Action

Click Next, click Previous, click page 10, switch Controlled off, click page 1, switch Controlled on, set Controlled Page to 4, set Total Pages to 0, then restore Total Pages to 10.

Verify

□ Controlled mode updates the active page through `onPageChange`.
□ Uncontrolled mode starts from `defaultPage={4}` and updates from internal state.
□ The active item has `aria-current="page"` and `data-state="active"`.
□ Inactive items have `data-state="inactive"`.
□ Total Pages 0 renders no Pagination DOM.
□ Restoring Total Pages 10 renders the Pagination DOM again.
□ Logs show page-change entries for successful page changes.

Reset

Controlled on. Total Pages 10. Controlled Page 4. Logs cleared.

## Step 2: Root

Setup

Default toolbar state.

Action

Inspect Root in Anatomy and Inspector. Toggle Disabled. Toggle Root Slot. Toggle Prop Check. Change Root composition through Default, As Child, and Render.

Verify

Identity

□ Default tag is `nav`.
□ Default `data-slot="pagination-root"`.
□ Root Slot changes to `data-slot="pagination-root-custom"`.
□ Prop Check adds `data-prop-check="root"` only when enabled.
□ Disabled adds `data-disabled=""`.
□ Ref target reports `nav` in Default mode and `section` in As Child or Render mode.

ARIA

□ Default `aria-label="Pagination"`.
□ Localized Labels changes the Root label to `Paginacion demo`.

Composition

□ Default renders one Atom-owned `nav`.
□ As Child merges Root props onto one `section`.
□ Render renders one custom `section` and preserves Root behavior.

Reset

Disabled off. Root Slot off. Prop Check off. Root composition Default.

## Step 3: List

Setup

Default toolbar state.

Action

Inspect List in Anatomy and Inspector. Toggle List Slot. Toggle Prop Check. Change List composition through Default, As Child, and Render.

Verify

Identity

□ Default tag is `ol`.
□ Default `data-slot="pagination-list"`.
□ List Slot changes to `data-slot="pagination-list-custom"`.
□ Prop Check adds `data-prop-check="list"` only when enabled.
□ Ref target reports `ol`.
□ Pagination controls and items are wrapped in `li` elements inside the ordered list.

Composition

□ Default renders one Atom-owned `ol`.
□ As Child merges List props onto one `ol`.
□ Render renders one custom `ol` and preserves children.

Reset

List Slot off. Prop Check off. List composition Default.

## Step 4: Previous

Setup

Default toolbar state. Controlled Page 4.

Action

Inspect Previous. Click Previous. Set Controlled Page to 1. Toggle Disabled. Toggle Localized Labels. Toggle Previous Slot and Prop Check. Change Previous composition through Default, As Child, and Render.

Verify

Identity

□ Default tag is `button`.
□ `type="button"`.
□ Default `data-slot="pagination-previous"`.
□ Previous Slot changes to `data-slot="pagination-previous-custom"`.
□ `data-direction="previous"`.
□ Prop Check adds `data-prop-check="previous"` only when enabled.
□ Ref target reports `button`.

ARIA

□ Default `aria-label="Previous page"`.
□ Localized Labels changes the label to `Pagina anterior`.

Interaction

□ Clicking Previous from page 4 requests page 3.
□ On page 1, Previous is disabled and has `data-disabled=""`.
□ Root Disabled also disables Previous and adds `data-disabled=""`.

Composition

□ Default, As Child, and Render each preserve click behavior and disabled behavior.

Reset

Controlled Page 4. Disabled off. Localized Labels off. Previous Slot off. Prop Check off. Previous composition Default.

## Step 5: Item

Setup

Default toolbar state. Controlled Page 4.

Action

Inspect Item: Current. Click page 1, page 4, and page 10. Toggle Disabled. Toggle Localized Labels. Toggle Item Slot and Prop Check. Change Item composition through Default, As Child, and Render.

Verify

Identity

□ Default tag is `button`.
□ `type="button"`.
□ Default `data-slot="pagination-item"`.
□ Item Slot changes to `data-slot="pagination-item-custom"`.
□ `data-page` matches the page number.
□ Prop Check adds `data-prop-check="item"` only when enabled.
□ Ref target reports `button` for the active item.

ARIA

□ Active item has `aria-current="page"`.
□ Active item default label is `Page N, current page`.
□ Inactive item default label is `Go to page N`.
□ Localized Labels changes item labels to `Pagina N`.

Interaction

□ Clicking a page item requests that page.
□ Clicking the already-active page does not add a new page-change log entry.
□ Root Disabled disables items and adds `data-disabled=""`.

Composition

□ Default, As Child, and Render each preserve click behavior, active state, and disabled behavior.

Reset

Controlled Page 4. Disabled off. Localized Labels off. Item Slot off. Prop Check off. Item composition Default.

## Step 6: Ellipsis

Setup

Default toolbar state. Total Pages 10. Sibling Count 1. Boundary Count 1.

Action

Inspect Ellipsis. Toggle Ellipsis Slot and Prop Check. Change Ellipsis composition through Default, As Child, and Render. Change Sibling Count and Boundary Count values.

Verify

Identity

□ Default tag is `span`.
□ Default `data-slot="pagination-ellipsis"`.
□ Ellipsis Slot changes to `data-slot="pagination-ellipsis-custom"`.
□ Prop Check adds `data-prop-check="ellipsis"` only when enabled.
□ Ref target reports `span`.

ARIA

□ Ellipsis has `aria-hidden="true"`.

Interaction

□ Ellipsis is decorative and not focusable as a button.
□ Range changes appear when sibling and boundary counts change.
□ Range count remains stable for the selected density where the package range algorithm supports it.

Composition

□ Default, As Child, and Render each preserve decorative `aria-hidden`.

Reset

Sibling Count 1. Boundary Count 1. Ellipsis Slot off. Prop Check off. Ellipsis composition Default.

## Step 7: Next

Setup

Default toolbar state. Controlled Page 4.

Action

Inspect Next. Click Next. Set Controlled Page to 10. Toggle Disabled. Toggle Localized Labels. Toggle Next Slot and Prop Check. Change Next composition through Default, As Child, and Render.

Verify

Identity

□ Default tag is `button`.
□ `type="button"`.
□ Default `data-slot="pagination-next"`.
□ Next Slot changes to `data-slot="pagination-next-custom"`.
□ `data-direction="next"`.
□ Prop Check adds `data-prop-check="next"` only when enabled.
□ Ref target reports `button`.

ARIA

□ Default `aria-label="Next page"`.
□ Localized Labels changes the label to `Pagina siguiente`.

Interaction

□ Clicking Next from page 4 requests page 5.
□ On the last page, Next is disabled and has `data-disabled=""`.
□ Root Disabled also disables Next and adds `data-disabled=""`.

Composition

□ Default, As Child, and Render each preserve click behavior and disabled behavior.

Reset

Controlled Page 4. Disabled off. Localized Labels off. Next Slot off. Prop Check off. Next composition Default.

## Step 8: Source

Setup

Default toolbar state.

Action

Change controlled/uncontrolled state, total pages, sibling count, boundary count, disabled, localized labels, each composition mode, Prop Check, and every slot toggle. Inspect Source after each group of changes.

Verify

□ Source updates for `page` versus `defaultPage`.
□ Source updates for `totalPages`, `siblingCount`, `boundaryCount`, and `disabled`.
□ Source includes localized `aria-label` props only when Localized Labels is on.
□ Source includes `data-prop-check` only when Prop Check is on.
□ Source includes custom `data-slot` values only when each slot toggle is on.
□ Source reflects Default, As Child, and Render for every public part.
□ Source shows `li` wrappers around list children.

Reset

Default toolbar state.

## Step 9: Inspector / Logs

Setup

Default toolbar state. Logs cleared.

Action

Click Root, List, Previous, the active Item, an inactive Item, Ellipsis, and Next. Use Tab to focus each focusable control. Click page-changing controls.

Verify

□ Selected tab shows live Attributes, ARIA, and Data for the clicked part.
□ Focused tab updates as focus moves through Previous, Item buttons, and Next.
□ Ellipsis can be selected but does not become focused through normal Tab order.
□ Logs record successful page changes.
□ Logs do not record blocked clicks on disabled controls.
□ Clear Logs empties the log list.

Reset

Logs cleared.

## Step 10: Nested / Portal / Focus Behavior

Setup

Default toolbar state.

Action

Tab through the Pagination controls. Activate focused controls with Enter and Space. Try ArrowLeft, ArrowRight, Home, End, and typing a page number while focus is inside Pagination.

Verify

□ Tab follows normal document order through enabled buttons.
□ Enter and Space activate focused buttons.
□ Disabled buttons are skipped by normal browser tab behavior.
□ ArrowLeft, ArrowRight, Home, End, and typeahead do not perform custom Pagination behavior.
□ No portal or nested layer behavior is present for Pagination.

## Step 11: Workbook Cleanup / Rewrite Notes

Setup

Manual testing complete.

Action

Review the Pagination workbook sheet against the verified public contract.

Verify

□ Do not mark workbook rows Tested until every protocol step passes.
□ Split generic Control rows into Previous and Next rows.
□ Remove or rewrite rows for arrow navigation, Home/End, typeahead, and roving focus because Pagination does not implement those behaviors.
□ Remove provider or non-DOM identity expectations for context and range utilities.
□ Keep `preventDefault` rows only if the package documents that escape hatch for Pagination.
□ Keep package-source helper checks out of playground coverage unless they have visible DOM behavior.
