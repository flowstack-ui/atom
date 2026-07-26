# Clipboard Manual Test Protocol

Status: draft — not yet executed

## Step 0: Playground Smoke Check

Open Utilities > Clipboard. Confirm Canvas, Source, Anatomy, Selected, Focused,
and Logs respond. Expect one labeled input, “Copy command,” current value, and
“Ready to copy.”

## Step 1: Feature-Wide State

Edit the command, activate Copy, and watch Logs. Expect `copying`, then
`copied`, then `idle` after about 1.5 seconds; the requested write must equal
the edited value. Select Failure and retry. Expect `error` and “Copy failed,”
never “Copied.” Enable Disabled; input and Trigger must stop interaction.
Enable Controlled value, edit, and repeat success.

## Step 2: Root

Open Root Anatomy. Expect a `div`, `data-slot="clipboard"`, and live
`data-state`. Enable Prop Check and expect `data-prop-check="root"`.

## Step 3: Label

Open Label Anatomy. Expect a `label` whose `for` equals Input's generated `id`.
Click it; focus must move to Input.

## Step 4: Control

Open Control Anatomy. Expect a structural `div` with
`data-slot="clipboard-control"` and the current state.

## Step 5: Input

Open Input Anatomy. Expect an editable `input`, current Root value,
`data-slot="clipboard-input"`, and native `disabled` when Root is disabled.

## Step 6: Value Text

Edit Input. Expect Value Text to update to exactly the same string and expose
`data-slot="clipboard-value-text"`.

## Step 7: Trigger

Expect `button type="button"`, `data-slot="clipboard-trigger"`, and a stable
accessible name. Tab to it and press Space, then Enter. Each must start one
write without moving focus. Disabled must block both.

## Step 8: Indicator and Status

Inspect each operation state. Exactly one Indicator must render for idle,
copying, copied, or error. Status must expose `role="status"`,
`aria-live="polite"`, and `aria-atomic="true"`.

## Step 9: Source

Open Source. Expect Root, Label, Control, Input, Trigger, Status, and all three
operation Indicators. Controlled and disabled selections must update the JSX.

## Step 10: Inspector / Logs

Click each rendered part and tab through Input and Trigger. Selected and
Focused must show the correct element. Logs must record one write request and
truthful status order per attempt; Clear must empty Logs.

## Workbook Cleanup / Rewrite Notes

After execution, map every passing check to Clipboard worksheet rows. Keep all
rows untested until this complete protocol passes.
