# MultiSelect Manual Test Protocol (Draft)

Keep the MultiSelect scenario at its defaults unless a step says otherwise.
Do not mark workbook rows tested until every desktop check and the real-device
touch check pass.

## Step 0: Open and inspect defaults

1. Open the Atom playground and choose `Selection` > `MultiSelect`.
2. Expect the trigger to summarize `Design (+1 more)` and the footer to list
   `design, engineering` with a closed state.
3. Inspect Trigger. Expect a native `button` with `aria-haspopup="listbox"`,
   `aria-expanded="false"`, and `aria-controls` matching Content's id.

Pass: the route loads and its default ARIA relationships are intact.

## Step 1: Keyboard selection and focus

1. Focus the trigger and press `ArrowDown`.
2. Expect Content to open, focus to move to its listbox, and an enabled option
   to become active through `aria-activedescendant`.
3. Use Arrow keys and Home/End. Expect focus to skip disabled `Research` and
   wrap at either end.
4. Press Space on `Writing`. Expect it to become selected and Content to stay
   open. Press Enter again and expect it to become unselected.
5. Type `de`. Expect `Design` to become active.
6. Press Escape. Expect Content to close and focus to return to Trigger.

Pass: navigation changes the active option, activation toggles selection
without closing, typeahead uses labels, and Escape restores focus.

## Step 2: Pointer, state, and dismissal

1. Open Content and click an enabled unselected option. Expect its check mark
   and `aria-selected="true"` to appear while Content remains open.
2. Click the same option again. Expect it to be removed.
3. Click outside. Expect Content to close without blocking the outside target.
4. Enable `Read only`; activate the Trigger. Expect Content not to open and no
   value change.
5. Enable `Disabled`. Expect Trigger to be disabled and Content not to open.
6. Re-enable the component, turn off `Disable Research`, and expect Research to
   become navigable and selectable.

Pass: pointer toggling, dismissal, disabled items, Root disabled, and read-only
behavior match their states.

## Step 3: Controlled modes and summary

1. Toggle `Controlled value` off. Change two options and expect the summary,
   footer, Anatomy, and Logs to update.
2. Toggle `Controlled open` on. Use the `Open controlled` and
   `Close controlled` button, then the Trigger. Expect all three to update the
   same open state.
3. Enable `Custom summary`. Expect the trigger to say the number of selected
   skills rather than list their labels.

Pass: controlled and uncontrolled value state, controlled open state, and
custom summary rendering remain synchronized.

## Step 4: Forms, Field state, and aliases

1. Enable `Required`, clear all selections, and choose `Submit skills`.
2. Expect native validity to reject the empty multiple select and focus its
   visible Trigger. Select two options, submit again, and expect both labels in
   the adjacent output.
3. Enable `Invalid` and inspect Trigger. Expect invalid state evidence without
   changing selection behavior.
4. Enable `Listbox alias`. Expect the same popup anatomy and behavior.
5. Enable `Disable portal`. Expect Content inside the scenario canvas while
   keyboard and dismissal behavior remain intact.

Pass: multiple values submit, required validity redirects correctly, invalid
state is exposed, and the alias/portal options preserve behavior.

## Step 5: Props, slots, and anatomy

1. Enable `Prop check`. Inspect Trigger, Content, and every Item. Expect each
   enabled part to expose `data-prop-check`.
2. Enable each custom slot. Expect the corresponding Trigger, Content, and Item
   `data-slot` values to change to the documented custom values.
3. Compare Source, Anatomy, Inspector, and Logs with the live state.

Pass: deterministic evidence matches the rendered component and no provider is
presented as a DOM element.

## Step 6: Real touch dismissal

1. On a real touch device, open Content and tap an enabled option. Expect one
   toggle and Content to stay open.
2. Tap outside without dragging. Expect dismissal after release.
3. Open again, start an outside gesture, then drag or scroll before releasing.
   Expect no accidental tap activation.

Pass: touch toggling and touch-safe outside dismissal work on real hardware.
