# ColorPicker Changelog

## 0.26.0

- Expanded the initial opaque hexadecimal picker into a complete headless color
  system with RGBA/HSLA/HSBA conversion, alpha, a keyboard/pointer/touch 2D
  area, channel sliders and inputs, format controls, value/preset swatches,
  selection indicators, inline or positioned content, drag-end events, RTL,
  progressive EyeDropper behavior, form reset, and the native chooser fallback.
- `onValueChange`, `onOpenChange`, and the new completion/format callbacks now
  use structured details. This is the intentional pre-1.0 migration boundary
  for consumers upgrading from the initial `0.24` hexadecimal-only API.

## 0.24.0

- Added headless hexadecimal color selection, native and editable inputs, preset triggers, optional Popover composition, and hidden form submission.
