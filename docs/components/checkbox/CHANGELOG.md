# Checkbox Changelog

## 0.6.15

- Exposed inline validation-directed focus on the visible Root through
  `[data-focus-visible]` until blur.

## 0.6.14

- Revealed required invalid state after the visible checkbox loses focus or an
  interacted checkbox becomes unchecked, while preserving neutral initial and
  reset states.

## 0.6.13

- Mirrored aligned-proxy validity to the visible Checkbox, Field, and Form with
  inline Error presentation or opt-in native browser UI.

## 0.6.12

- Aligned the native validation proxy with Root, redirected validation focus,
  and supported required validity without a submission name.

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
