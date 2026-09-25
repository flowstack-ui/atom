# Menu Manual Test Protocol

Also run the [shared controller and policy workbench](../manual-tests/menu-policies.md) for this owner.
Its automated results do not mark this manual protocol complete.

## Added controller and lifecycle qualification (draft, manual execution pending)

Setup: use a public Menu.RootProvider fixture with external open/highlight controls,
two valued DropdownMenu triggers, retained Content, and a cancellable CheckboxItem.

- Action: pointer-open each trigger. Verify: the menu container receives focus,
  its label references the active trigger, and Escape restores that same trigger.
- Action: open with ArrowUp. Verify: the last item receives real focus without
  moving the surrounding page.
- Action: reject an onHighlightChange proposal in controlled mode. Verify:
  highlight and DOM focus both remain on the accepted value.
- Action: prevent the checkbox selection event. Verify: item then root callbacks
  run once, checked state is unchanged, and the menu remains open.
- Action: close retained Content, then reopen before the exit animation ends.
  Verify: closed content is inert, reopened content is usable, and no stale exit
  callback closes it.
- Action: activate ordinary and modified native links. Verify: the router hook
  handles only ordinary navigation; modified clicks preserve browser behavior.
- Action: open Sub with defaultOpen, then close/reopen with the keyboard.
  Verify: initialization emits no change event, and subsequent false/true
  requests each notify once.
- Action: scroll root/submenu with Arrow present. Verify: Arrow remains outside
  Content clipping, forwarded Content ref is the role=menu scroll owner, and
  explicit content custom-property overrides reach Arrow.

Physical touch, assistive technology, and actual browser zoom remain unperformed.

Use the Menu route with its default controls unless a step says otherwise. After each reset, close every submenu.

## 1. Open, focus, and close

At `/__tests/menu-scroll`, open Account near the bottom edge, navigate with
Home/End, open More, navigate its long submenu, and close/reopen. Repeat in RTL.
The page and surrounding panel must not move; only the owning menu scrolls.
Automated coverage: `test/browser/menu-scroll.spec.ts` (three desktop engines).

1. Place keyboard focus on the control before the Menu canvas, open Menu, and inspect the first row.
   - Expect: Content opens and the first item has real browser focus.
2. Press `End`, `Home`, type the first letter of another item, then use ArrowDown/ArrowUp.
   - Expect: focus moves to the last, first, matching, and adjacent rows; the focused row stays visible.
3. Press `Escape`.
   - Expect: Menu closes and focus returns to the element that opened it.
4. Reopen, press `Tab`; repeat with `Shift+Tab`.
   - Expect: Menu closes and focus lands after/before the complete Menu owner in document order.

## 2. Items and selection state

1. Enable the disabled item and move focus onto it with Arrow keys; press Enter and Space.
   - Expect: it receives focus and announces disabled, but never selects or closes Menu.
2. Toggle the unchecked and mixed checkbox rows.
   - Expect: `aria-checked` and ItemIndicator move through the rendered state; mixed reports `mixed`.
3. Select each radio row.
   - Expect: only one is checked and its ItemIndicator is visible.
4. Disable close-on-select and activate a normal item.
   - Expect: selection is logged and Menu remains open.

## 3. Labels, geometry, and composition

1. Open Anatomy for Portal, Arrow, Label, Group, and Item Indicator.
   - Expect: Content is under the selected portal container; Arrow reports resolved side/align; Group references its nested Label; Indicator reports checked state.
2. Change side, align, offset, direction, and anchor point near every canvas edge.
   - Expect: Content remains reachable, flips/shifts when needed, and reports `--atom-menu-*` available-size, trigger-size, and transform-origin values.
3. Test default, As Child, and Render for every offered DOM part, then enable each custom slot/ref check.
   - Expect: one element renders, behavior and ARIA remain intact, and the custom slot/ref is reported.

## 4. Submenus and layers

1. Open the first submenu with the direction-aware Arrow key, then its nested submenu.
   - Expect: each first child receives real focus; in RTL the open/close keys mirror.
2. Press Escape twice.
   - Expect: the deepest submenu closes first and focuses its SubTrigger; the next Escape returns to its owner.
3. Test mouse hover, touch/click, modal/non-modal, and the Dialog fixture.
   - Expect: mouse hover may open a submenu; touch contact alone does not run hover timers; nested portals remain usable; modal background is inert/locked while non-modal outside interaction preserves its clicked destination.

## 5. Reflow

Repeat keyboard flow at 200% and 400% zoom and on a narrow viewport.

- Expect: focused rows, Arrow, and content remain visible and scrollable; no sticky playground UI hides the active item.
