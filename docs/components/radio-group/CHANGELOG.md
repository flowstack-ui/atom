# RadioGroup Changelog

## Unreleased

- Preserve inherited disabled state, child cancellation and React 19 callback
  ref cleanup in closed Radio composition.

- Add controller/provider and native open-item composition with text,
  descriptions, input refs and decorative control/indicator parts.
- Restore enabled keyboard entry for unavailable selections and require an
  eligible registered selection for required validity.

- Preserve Indicator geometry while measuring a new selection so styled sliding
  transitions do not reset or flicker.
- Add decorative Indicator geometry and readiness; preserve native named inputs,
  custom root slots and owner-document keyboard focus.

## 0.24.0

- Added public Agent Knowledge for component selection, required composition,
  recurring mistakes, and validation.

## 0.11.1

- Made Root `dir="rtl"` control horizontal arrow-key navigation directly,
  without requiring a matching Direction provider.

## 0.11.0

- Added group-level read-only semantics, state hooks, and interaction locking
  while preserving focus navigation and native form submission.

## 0.6.16

- Explicitly scrolled inline validation-directed focus into view.

## 0.6.15

- Exposed inline validation-directed focus through `[data-focus-visible]`
  until blur.

## 0.6.13

- Added one group-level inline/native validation state, Fieldset Error
  presentation, and first-enabled-radio focus for missing required selection.

## 0.6.12

- Added one group-level required proxy aligned with the first enabled Radio,
  preserving named radio submission and validation without a name.

## 0.5.0

- Added Fieldset naming/state/description integration, native-only ARIA naming,
  and uncontrolled native form reset behavior.

## 0.2.0

- Added `Direction.Provider` support so horizontal arrow-key navigation mirrors
  in RTL.
- Added root `aria-disabled` when the group is disabled.
- Fixed roving focus so disabled radios are skipped correctly when `Radio`
  renders a non-native element through `asChild` or `render`.
- Added registry invalidation so the first enabled item becomes tabbable after item registration when no value is selected.
- Memoized the group context value.

## 0.1.0

- Initial Atom release with root, item, roving focus, keyboard navigation, and hidden form inputs.
