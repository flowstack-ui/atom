# CheckboxGroup Changelog

## 0.5.3

- Removed `aria-required` from Root because `role="group"` does not support
  that property; required items, data state, and native validity remain intact.

## 0.5.0

- Added Fieldset naming/state/description integration and native one-or-more
  required validity; removed Root/Item `ariaLabel` props and synchronized
  uncontrolled state with native form reset.
## 0.1.0

- Initial Atom release with root, item, multi-value state, and hidden form inputs.
