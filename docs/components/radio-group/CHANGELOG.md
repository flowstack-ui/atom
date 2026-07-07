# RadioGroup Changelog

## Unreleased

- Added `Direction.Provider` support so horizontal arrow-key navigation mirrors
  in RTL.
- Added root `aria-disabled` when the group is disabled.
- Fixed roving focus so disabled radios are skipped correctly when `Radio`
  renders a non-native element through `asChild` or `render`.
- Added registry invalidation so the first enabled item becomes tabbable after item registration when no value is selected.
- Memoized the group context value.

## 0.1.0

- Initial Atom release with root, item, roving focus, keyboard navigation, and hidden form inputs.
