# Switch Changelog

## 0.5.0

- Added Field state, generated control ID, and description integration; removed
  `ariaLabel` in favor of native ARIA; uncontrolled state now follows native
  form reset.

## 0.2.0

- Added `readOnly` support.
- Added `aria-required`, `data-required`, `data-readonly`, and mirrored thumb data attributes.
- Added keyboard activation for non-native `asChild` and `render` switch roots.
- Memoized the compound context value.
- Changed toggling to use functional controllable-state updates.

## 0.1.0

- Initial Atom release with root, thumb, checked state, and optional form input.
