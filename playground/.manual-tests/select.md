# Select Manual Test Protocol (Draft)

Run this protocol one step at a time. Keep the Select playground scenario at
its defaults unless a step says otherwise. Do not mark the workbook rows tested
until the desktop checks and real touch-hardware checks pass.

## Step 0: Open Select

1. Open the Atom playground and choose `Forms` > `Select`.
2. Expect the page title to be `Select` and the workbench to show Anatomy,
   Canvas, Inspector, and Logs evidence.
3. Open the Select once and confirm the listbox is visible and usable.

Pass condition: the scenario loads without an error and Select opens.

## Step 1: Resolved placement

1. Open Select and inspect `Content/Listbox`.
2. Expect `data-side` and `data-align` to be present in Inspector.
3. Inspect `Arrow`.
4. Expect Arrow's `data-side` and `data-align` to match Content/Listbox.
5. Resize the window enough to make collision handling choose another valid
   placement when space requires it.
6. Expect Content/Listbox and Arrow to stay attached to the trigger, and their
   side/alignment values to remain equal after repositioning.

Pass condition: popup and Arrow use the same resolved placement without a
detached or incorrectly oriented Arrow.

## Step 2: Desktop dismissal regression

1. Open Select with a mouse or trackpad.
2. Click a Select item and expect its value to be selected and Select to close.
3. Open Select again, then click the outside focus target.
4. Expect Select to close and the outside target to remain usable.
5. Open Select again and press `Escape`.
6. Expect Select to close and focus to return to its trigger.

Pass condition: the new placement work does not regress selection, outside
dismissal, or Escape dismissal.

## Step 3: Real touch or pen tap

1. On real touch or pen hardware, open Select.
2. Tap the outside focus target without dragging.
3. Expect Select to remain open while contact is held.
4. Release without moving.
5. Expect Select to close after release.

Pass condition: a plain outside tap dismisses only after the gesture resolves.

## Step 4: Real touch or pen cancellation

1. Open Select and begin an outside touch or pen contact.
2. Move enough to create a drag before releasing.
3. Expect Select to remain open.
4. Repeat by beginning outside contact and scrolling the page.
5. Expect Select to remain open.
6. Repeat with a platform gesture that cancels the pointer interaction, when
   the device exposes one.
7. Expect Select to remain open.

Pass condition: movement, scrolling, and cancellation do not become accidental
outside taps.

