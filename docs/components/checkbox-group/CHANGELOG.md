# CheckboxGroup Changelog

## 0.6.0

- Added deterministic `allValues` plus Parent/select-all behavior with
  unchecked, mixed, and checked aggregate state.
- Added server-stable ItemLabel and ItemDescription relationships, native ARIA
  precedence, conditional hydration registration, and public semantic wrapper
  marking for styled layers.

## 0.5.3

- Removed `aria-required` from Root because `role="group"` does not support
  that property; required items, data state, and native validity remain intact.

## 0.5.0

- Added Fieldset naming/state/description integration and native one-or-more
  required validity; removed Root/Item `ariaLabel` props and synchronized
  uncontrolled state with native form reset.
## 0.1.0

- Initial Atom release with root, item, multi-value state, and hidden form inputs.
