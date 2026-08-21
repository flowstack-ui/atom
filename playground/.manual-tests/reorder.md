# Reorder Manual Test Protocol

Status: **Draft — automated browser evidence passes; physical touch and manual
browser review are not yet recorded**

Route: Controls > Reorder

Record browser, operating system, input method, direction, orientation, zoom,
forced-colors state, and assistive technology. Run one numbered step at a time.
Do not record physical-device or assistive-technology results from emulation.

## Step 0: Playground Smoke Check

1. Open Controls > Reorder. Confirm four deployment tasks render in an ordered
   list and the footer shows the same order.
2. Open Anatomy, Source, and Inspector. Confirm Anatomy lists Root, Item,
   Handle, and Movement controls; Source uses `Direction.Provider` and the
   `Reorder` namespace; Inspector switches between Selected, Focused, and Logs.

## Step 1: Feature-Wide State

1. Use Earlier and Later on different items. Confirm one activation changes the
   order, the footer updates, and focus remains on the same keyed control.
2. Enable Disabled. Confirm handles and movement controls cannot change order.
3. Disable it, enable Read only, and repeat. Confirm order stays unchanged and
   the root exposes read-only state.
4. Disable only Request approval. Confirm its Handle and movement controls are
   unavailable while other items still move around it.
5. Activate Reset order. Confirm the original stable identity order returns.

## Step 2: Root

1. Inspect Root. Confirm the default element is `ol`, `data-slot="reorder"`,
   and `data-orientation="vertical"`.
2. Switch Orientation to horizontal. Confirm the root reports horizontal and
   its items arrange on the inline axis without changing source order.
3. Switch Direction between LTR and RTL. Confirm `dir` changes on the scenario
   boundary and horizontal movement follows logical rather than physical order.

## Step 3: Item

1. Inspect each Item. Confirm it is an `li` with
   `data-slot="reorder-item"` and its stable `data-value` identity.
2. Begin keyboard movement on Verify production. Confirm the same Item exposes
   `data-dragging`; move once and confirm exactly one Item exposes
   `data-drop-target` plus a `data-drop-position`.
3. Press Escape. Confirm transient movement state clears and order is restored.

## Step 4: Handle

1. Focus the first Handle. Confirm it is a native button with an accessible
   `Move …` name and `aria-describedby` pointing to the hidden instructions.
2. Press Space, ArrowDown twice, and Space. Confirm the item commits in the
   announced position and focus remains on its Handle.
3. Repeat with Enter, Home, End, and Escape. Confirm Home/End choose the first/
   last valid position, Enter commits, and Escape cancels.
4. In horizontal LTR, verify Left/Right. Switch to RTL and confirm the logical
   direction mirrors.
5. With a mouse or pen, press and move less than the activation distance, then
   release. Confirm no movement begins. Drag beyond the threshold onto a valid
   target and release; confirm one commit. Release outside all targets and
   confirm cancellation.
6. On physical touch, begin ordinary scrolling outside the Handle. Confirm the
   page remains scrollable. Touch the Handle briefly and move before the hold
   delay; confirm movement cancels. Hold, drag, and release on a target; confirm
   one commit. Interrupt the gesture where the platform permits and confirm
   cancellation.

## Step 5: Movement Controls

1. Confirm every item exposes visible Earlier and Later operations with item-
   specific accessible names.
2. Confirm Earlier is disabled on the first movable position and Later is
   disabled on the last movable position.
3. Use only these controls with mouse, touch, keyboard, and a screen reader.
   Confirm the full reordering task can be completed without dragging.

## Step 6: Source

1. Change orientation, direction, disabled, read-only, and item-disabled
   controls one at a time. Confirm Source shows only the props required for the
   active state and retains stable values and keyed items.
2. Confirm Source contains no automatic data sorting and no application object
   mutation during pointer movement.

## Step 7: Inspector / Logs

1. Select an Item and focus its Handle. Confirm Selected and Focused describe
   different live elements and report current raw ARIA/data evidence.
2. Complete moves by keyboard, pointer, and visible movement control. Confirm
   Logs identifies the input and one-based previous/new positions.
3. Cancel a movement. Confirm no completed-order log is added.

## Step 8: Stress And Accessibility

1. At 320 CSS pixels, 200% text size, and 400% browser zoom, confirm controls,
   focus rings, labels, and the full ordered list remain reachable without
   page-level horizontal clipping in vertical mode.
2. Enable forced colors. Confirm handles, movement controls, active state, and
   target indication remain perceivable without color alone.
3. Enable reduced motion. Confirm all behavior remains complete; Atom itself
   introduces no visual motion requirement.
4. With VoiceOver and TalkBack, verify pickup, destination, drop, and
   cancellation announcements use human labels and one-based positions without
   moving virtual focus unexpectedly.

## Workbook Cleanup / Rewrite Notes

- Add playground-verifiable rows for Root, Item, Handle, DropIndicator, the
  four direct movement controls, controlled order, disabled/read-only state,
  keyboard/pointer/touch behavior, RTL, instructions/announcements, Source,
  Anatomy, Inspector, and Logs.
- Keep package exports, packed-consumer checks, and physical-device claims out
  of the coverage workbook.
- Do not mark rows tested or covered until this complete protocol has a named
  manual run.
