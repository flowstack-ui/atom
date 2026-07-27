# Dropdown Menu Manual Test Protocol

Use the Dropdown Menu route with default controls unless a step says otherwise.

## 1. Trigger and focus lifecycle

1. Focus Actions. Open with click/tap, Enter, Space, ArrowDown, then ArrowUp.
   - Expect: click/tap, Enter, Space, and ArrowDown focus the first item; ArrowUp focuses the last.
2. Press Escape.
   - Expect: Content closes and focus returns to Actions.
3. Reopen and press `Tab`; repeat with `Shift+Tab`.
   - Expect: Content closes and focus lands on the next/previous control outside the Dropdown Menu owner.

## 2. Menu behavior

1. Use Arrow keys, Home, End, and typeahead through normal and disabled rows.
   - Expect: every row, including disabled rows, can receive focus; disabled rows never activate.
2. Toggle unchecked and mixed checkboxes, then select both radio choices.
   - Expect: ARIA state and ItemIndicator match; radio selection stays exclusive.
3. Turn close-on-select off and select a normal item.
   - Expect: the action logs once and Content remains open.

## 3. Shared anatomy and submenus

1. Inspect Portal, Content, Arrow, Label, Group, Item Indicator, Separator, SubTrigger, and SubContent.
   - Expect: each rendered DOM part has its documented slot/ref; Group is labelled by Label; Arrow and Content report resolved geometry.
2. Open both submenu levels with keyboard, close each with Escape, then repeat in RTL.
   - Expect: child focus enters correctly; Escape restores the immediate SubTrigger; RTL mirrors open/close keys.
3. Repeat with mouse hover and touch tap.
   - Expect: mouse hover can switch/open; touch contact cannot start hover timers, while tap remains usable.

## 4. Placement, composition, and layers

1. Test all sides/alignments/offsets near viewport edges and inspect `--atom-menu-*` values.
   - Expect: surfaces stay reachable and variables match resolved geometry.
2. Test every offered Default, As Child, Render, custom slot, and ref control.
   - Expect: one composed element retains all semantics and behavior.
3. Test modal/non-modal and the Dialog fixture.
   - Expect: modal background is inert/locked; nested portals remain interactive; non-modal outside click keeps focus on its destination.

## 5. Reflow

Repeat the keyboard flow at 200% and 400% zoom and on a narrow viewport.

- Expect: focused rows and content remain visible/scrollable without clipping.
