# Tree Manual Test Protocol

## Step 0: Playground Smoke Check

Setup: open the playground and select `Tree` from the top menu.

Action: expand and collapse `Anatomy`, click the tree in Canvas, switch Inspector between `Selected`, `Focused`, and `Logs`, then open `Source`.

Expected result:

- Canvas renders a Documentation tree.
- Workbench panels respond.
- `Selected` shows raw Tree DOM evidence after clicking.
- `Focused` remains separate.
- Logs can be empty.
- Source shows uncontrolled Tree JSX with no controlled value props.

Reset: leave all controls at defaults.

## Step 1: Feature-Wide State

Setup: default Tree scenario.

Action: focus the tree and press `ArrowDown`.

Expected result:

- Root ARIA includes `aria-activedescendant` matching the active item id.
- Active item Data includes `data-active`.
- Canvas footer still reports uncontrolled mode.

Action: press `Enter` or `Space`.

Expected result:

- Active item becomes selected.
- Active item ARIA includes `aria-selected="true"`.
- Active item Data includes `data-selected`.
- Root Data includes `data-filled`.
- Logs include one `selected ...` entry.

Action: choose `State > Mode > Controlled`, then choose `State > Value > Docs`.

Expected result:

- Docs becomes selected from the controlled toolbar value.
- Source includes `value={value}`.
- Source includes `onValueChange={setValue}`.
- Controlled value controls are visible.

Action: choose `State > Mode > Uncontrolled`, turn `Default Selected` on, then turn `Default Expanded` on.

Expected result:

- Source includes `defaultValue="docs"`.
- Source includes `defaultExpandedValue={["docs"]}`.
- Docs starts selected and expanded.
- Controlled value props are absent.

Action: turn `Tree > Form Name` on.

Expected result:

- `Hidden Input` becomes live.
- State shows `Value docs`.
- Input has `type="hidden"`.
- Input has `name="tree-selection"`.
- Input has `aria-hidden="true"`.
- Input has `tabindex="-1"`.

Reset: Mode `Uncontrolled`; Default Selected off; Default Expanded off; Form Name off.

## Step 2: Root

Setup: default Tree scenario.

Action: expand `Root` in Anatomy.

Expected result:

- Attributes title shows `div`.
- Attributes include a generated `id`.
- Attributes include `dir="ltr"`.
- Attributes include `tabindex="0"`.
- ARIA includes `aria-label="Documentation tree"`.
- ARIA includes `aria-orientation="vertical"`.
- Attributes or ARIA show `role="tree"`.
- Data includes `data-slot="tree"`.
- Ref is `div`.
- No active, selected, disabled, readonly, required, or invalid state is shown.

Action: turn on `State > Disabled`, `Read only`, `Required`, and `Invalid`.

Expected result:

- Default Root attributes remain present.
- ARIA includes `aria-disabled="true"`.
- ARIA includes `aria-readonly="true"`.
- ARIA includes `aria-required="true"`.
- ARIA includes `aria-invalid="true"`.
- Data includes `data-disabled`.
- Data includes `data-readonly`.
- Data includes `data-invalid`.

Action: choose `Tree > Orientation > Horizontal`.

Expected result:

- Root ARIA changes to `aria-orientation="horizontal"`.
- Canvas tree changes to a horizontal top-level branch layout.
- Source includes `orientation="horizontal"`.
- Other default Root attributes remain unchanged.

Action: choose `Tree > Direction > Provider RTL`, `Local LTR`, then `Local RTL`.

Expected result:

- Provider RTL wraps Source in `Direction.Provider dir="rtl"`.
- Provider RTL Root raw `dir` is `rtl`.
- Local LTR shows provider RTL plus Root `dir="ltr"`.
- Local RTL shows Root `dir="rtl"` without a provider wrapper.
- Other default Root attributes remain unchanged.

Action: open `Composition > Root` and choose `As Child`, then `Render`.

Expected result:

- Root remains one `section` element.
- Root still has Tree role and behavior props.
- Child content is not double nested.
- Ref is `section`.

Action: turn `Props > Prop Check` on and `Props > Root Slot` on.

Expected result:

- Root Data includes `data-prop-check="root"`.
- Root Data includes `data-slot="tree-custom"`.

Reset: Root composition `Default`; Prop Check off; Root Slot off; state and direction controls at defaults.

## Step 3: Item: Docs

Setup: default Tree scenario.

Action: expand `Item: Docs` in Anatomy.

Expected result:

- Attributes title shows `div`.
- ARIA includes `role="treeitem"`.
- ARIA includes `aria-level="1"`.
- ARIA includes `aria-selected="false"`.
- ARIA includes `aria-expanded="false"`.
- Data includes `data-slot="tree-item"`.
- Data includes `data-value="docs"`.
- Data includes `data-state="unchecked"`.
- Data includes `data-level="1"`.
- Data includes `data-expandable`.
- Composition shows `default`.
- Ref is `div`.

Action: click Docs.

Expected result:

- Docs toggles selected.
- Docs toggles expanded.
- ARIA changes to `aria-selected="true"`.
- ARIA changes to `aria-expanded="true"`.
- Data includes `data-selected`.
- Data includes `data-expanded`.
- Group: Docs becomes live.
- Logs include selection and expansion entries.

Action: inspect `Item: Guide`.

Expected result:

- Guide ARIA includes `aria-level="2"`.
- Guide Data includes `data-level="2"`.
- Guide Composition shows `default`.

Action: turn `Tree > Disable Item` on, expand Docs if needed, and inspect `Item: API`.

Expected result:

- API Composition shows `default`.
- API ARIA includes `aria-level="2"`.
- API ARIA includes `aria-disabled="true"`.
- API Data includes `data-level="2"`.
- API Data includes `data-disabled`.

Action: open `Composition > Item` and choose `As Child`, then `Render`.

Expected result:

- Each inspected item remains a single `div` treeitem.
- Item composition mode updates on Docs, Guide, API, and Components.
- Data remains present.
- Ref for Docs remains `div`.

Action: turn `Props > Prop Check` on and `Props > Item Slot` on.

Expected result:

- Item Data includes `data-prop-check="item"`.
- Item Data includes `data-slot="tree-item-custom"`.

Reset: Item composition `Default`; Prop Check off; Item Slot off; Disable Item off; collapse Docs.

## Step 4: Item Text: Docs

Setup: default Tree scenario.

Action: expand `Item Text: Docs` in Anatomy.

Expected result:

- Attributes title shows `span`.
- Text is `Docs`.
- Data includes `data-slot="tree-item-text"`.
- Composition shows `default`.
- Ref is `span`.

Action: open `Composition > Item Text` and choose `As Child`, then `Render`.

Expected result:

- Item Text remains one `span`.
- Item Text composition mode updates.
- Ref is `span`.

Action: turn `Props > Prop Check` on and `Props > Item Text Slot` on.

Expected result:

- Item Text Data includes `data-prop-check="itemText"`.
- Item Text Data includes `data-slot="tree-item-text-custom"`.

Reset: Item Text composition `Default`; Prop Check off; Item Text Slot off.

## Step 5: Group: Docs

Setup: default Tree scenario with Docs expanded.

Action: expand `Group: Docs` in Anatomy.

Expected result:

- Attributes title shows `div`.
- ARIA includes `role="group"`.
- Data includes `data-slot="tree-group"`.
- Data includes `data-state="open"`.

Action: collapse Docs.

Expected result:

- Group: Docs changes to inactive `not rendered`.

Action: turn `Tree > Force mount group` on while Docs is collapsed.

Expected result:

- Group: Docs is mounted.
- Attributes include `hidden`.
- ARIA includes `aria-hidden="true"`.
- Data includes `data-state="closed"`.

Action: open `Composition > Group` and choose `As Child`, then `Render`.

Expected result:

- Group remains a single `div`.
- Group has `role="group"`.
- Child items remain nested.
- Ref is `div` when mounted.

Action: turn `Props > Prop Check` on and `Props > Group Slot` on.

Expected result:

- Group Data includes `data-prop-check="group"`.
- Group Data includes `data-slot="tree-group-custom"`.

Reset: Group composition `Default`; Force mount group off; Prop Check off; Group Slot off.

## Step 6: Keyboard And Focus Behavior

Setup: default Tree scenario.

Action: focus the tree, press `Home`, `End`, `ArrowUp`, and `ArrowDown`.

Expected result:

- Active descendant moves only among visible enabled items.
- `Home` moves to the first visible item.
- `End` moves to the last visible item.

Action: type `d` while the tree is focused away from Docs.

Expected result:

- Typeahead moves active descendant to Docs.
- Root `aria-activedescendant` matches the Docs item id.

Action: focus Docs, press `ArrowRight`, then press `ArrowRight` again.

Expected result:

- First press expands Docs.
- Second press moves active descendant to Guide.

Action: press `ArrowLeft` on Guide, then press `ArrowLeft` on Docs.

Expected result:

- First press moves active descendant to Docs.
- Second press collapses Docs.

Action: choose `Tree > Direction > Local RTL`, focus Docs, press `ArrowLeft`, then press `ArrowRight`.

Expected result:

- RTL mirrors expand/collapse keys.
- `ArrowLeft` expands or moves to child.
- `ArrowRight` collapses or moves to parent.

Action: choose `Tree > Orientation > Horizontal`, press `ArrowRight`, then choose `Tree > Direction > Local RTL` and press `ArrowRight` again.

Expected result:

- Horizontal LTR `ArrowRight` moves next.
- Horizontal RTL `ArrowRight` moves previous.

Reset: Direction `Default`; Orientation `Vertical`; Docs collapsed.

## Source

Setup: all controls at default.

Action: inspect Source.

Expected result:

- Source shows uncontrolled Tree JSX.
- Source includes `aria-label="Documentation tree"`.
- Source omits `value`.
- Source omits `expandedValue`.
- Source omits `defaultValue`.
- Source omits `defaultExpandedValue`.
- Source omits `multiple`.
- Source omits `disabled`.
- Source omits `readOnly`.
- Source omits `required`.
- Source omits `invalid`.
- Source omits `orientation`.
- Source omits `dir`.
- Source omits `name`.
- Source omits `data-prop-check`.
- Source omits custom `data-slot`.
- Source omits `asChild`.
- Source omits `render`.

Action: enable Controlled mode, Multiple selection, Horizontal orientation, Local RTL direction, Form Name, Prop Check, Root Slot, Item composition `As Child`, Item Text composition `Render`, and Group `forceMount`.

Expected result:

- Source includes only the selected non-default props.
- Source includes provider/local direction markup when applicable.
- Source includes per-part composition output.
- Source includes prop-check markers.
- Source includes custom slot values.
- Source includes `forceMount`.

Reset: all controls at default.

## Inspector / Logs

Setup: default Tree scenario.

Action: click Root, Docs, Item Text: Docs, and Group: Docs after expanding Docs.

Expected result:

- `Selected` updates to the clicked element.
- `Selected` shows raw Attributes, ARIA, Data, and Text where applicable.
- `Focused` remains the tree root when keyboard focus is on the root.
- Logs show selection and expansion changes only after interactions.

Action: clear Logs, then click Docs once.

Expected result:

- Logs contain compact timestamped rows for the selection callback.
- Logs contain compact timestamped rows for the expansion callback.

## Workbook Cleanup / Rewrite Notes

- Tree package docs currently document Item `data-state` as `expanded | collapsed`; source and tests render Item `data-state="checked" | "unchecked"` and Group `data-state="open" | "closed"`. This is classified as a package documentation gap.
- The workbook row for `asChild lets preventDefault block Atom behavior where supported` is classified as a workbook model issue for Tree because no explicit Tree preventDefault behavior is documented.
- Workbook statuses remain untested until this draft protocol is executed completely in the browser.
