# Checkbox Changelog

## 0.6.11

- Restored native required validation by keeping the controlled hidden form
  input eligible for browser constraint validation.

## 0.6.0

- Exposed `aria-disabled="true"` consistently on disabled Root composition,
  including non-button `asChild` and `render` targets.

## 0.5.0

- Added Field state, generated control ID, and description integration; removed
  `ariaLabel` in favor of native ARIA; uncontrolled state now follows native
  form reset while submission and required validity remain native.
## 0.1.0

- Initial Atom release with root, indicator, indeterminate state, and optional form input.
