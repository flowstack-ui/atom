# Color Picker Manual Test Protocol

Use the `/__tests/color-picker` browser harness after the automated focused
tests pass. Record browser, engine/version, operating system, input method,
viewport, zoom, appearance, direction, and assistive technology before claiming
manual evidence.

## Area and channels

1. Drag and tap several points in the area. Confirm both announced channels,
   visible thumb position, hex input, value text, and swatch stay synchronized.
2. Use every arrow key and Page Up/Down on the area thumb. Confirm movement is
   bounded, announced, and mirrored in RTL.
3. Test Hue and Alpha by pointer/touch plus Arrow, Page, Home, and End keys.
   Confirm `onValueChangeEnd` increments after completed pointer interactions;
   area and slider keyboard steps remain ordinary value changes.
4. Enter valid and invalid hex, numeric, alpha, and CSS values. Confirm valid
   values convert and invalid drafts restore without corrupting form state.

## Formats, presets, popup, and form

1. Cycle and select RGBA, HSLA, and HSBA. Confirm channels and serialized value
   stay equivalent instead of changing the represented color.
2. Select every preset, including the translucent preset. Confirm selection
   state and indicator are exposed without relying on color alone.
3. Open the popup, choose a preset, press Escape, and interact outside. Confirm
   close-on-select, dismissal, and trigger-focus restoration.
4. Submit and reset the hidden input inside a form and through an external
   `form` association. Confirm exactly one named successful control.

## Platform and accessibility

1. Test the native opaque chooser without claiming its platform-owned UI is the
   full Atom picker or preserves alpha.
2. On a supported secure Chromium context, test EyeDropper success and cancel.
   On unsupported engines, confirm the action is a safe no-op.
3. Inspect labels, roles, 2D-slider description, values, orientation, checked
   presets, disabled/read-only states, and focus order with the accessibility
   tree and a named screen reader.
4. Repeat at 320 CSS px, 200% and 400% zoom, light/dark application styling,
   forced colors, LTR, and RTL. Record physical touch and screen-reader results
   separately from Playwright emulation.
