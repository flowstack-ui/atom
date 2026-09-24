# PinInput Changelog

## Unreleased

- Bind form reset after a late RootProvider mount and cancel queued resets when
  its form changes or the controller unmounts.

- Replace OTPField with PinInput and an opt-in OTP autocomplete mode; no alias.
- Preserve empty positions with array values/details callbacks. Add controller,
  RootProvider/Context/Label/Control, configurable selection, blur, sanitization,
  invalid callbacks and native password masking.
- Correct required completeness, nameless/prevented reset, native deletion,
  RTL/IME navigation and post-commit completion/submission.

## 0.24.0

- Added public Agent Knowledge for component selection, required composition,
  recurring mistakes, and validation.

## 0.19.2

- Removed unsupported `aria-required` from the `role="group"` root while
  preserving required semantics and native validity on the visible cells.

## 0.19.0

- Added `getInputLabel` for localizing generated cell position labels.

## 0.6.16

- Explicitly scrolled inline validation-directed focus into view.

## 0.6.15

- Exposed inline validation-directed focus through `[data-focus-visible]`
  until blur.

## 0.6.13

- Added logical-field inline/native validation presentation and synchronized
  invalid state across Root, visible cells, Field, and Form.

## 0.6.12

- Moved required validity to the first visible cell and made the combined
  named value submission-only.

## 0.5.0

- Removed `ariaLabel`/`ariaDescribedBy` in favor of native ARIA and added a
  required-capable native combined-value input with uncontrolled reset.
## 0.1.0

- Initial Atom release.
