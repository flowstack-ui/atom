# Switch Changelog

## Unreleased

- Preserve disabled custom Control hosts instead of re-enabling them during
  composition; disabled hosts cannot activate through click or keyboard.

- Respect the nearest independent Field's validity instead of marking its
  compound Switch invalid because another field invalidated the Fieldset.

- Fixed compound label and accessible-name associations after local part ID
  overrides or changes. Added owner `ids` for server-rendered custom part IDs.

- Added the compound Field, Control, Label, HiddenInput, Indicator,
  ThumbIndicator, RootProvider, and controller APIs while preserving the
  standalone button Root, boolean callback, root ref, and automatic legacy form
  proxy.
- Compound Switch now owns one shared state controller and requires exactly one
  explicit native input, with stable label/control/input IDs, native
  validation focus, checked-only submission, controlled/uncontrolled reset,
  external-form support, and composed input handlers and refs.
- Preserved authored host cancellation and cross-document custom-host keyboard
  activation without relying on the global `HTMLButtonElement` realm.

## 0.24.0

- Added public Agent Knowledge for component selection, required composition,
  recurring mistakes, and validation.

## 0.6.16

- Explicitly scrolled inline validation-directed focus into view.

## 0.6.15

- Exposed inline validation-directed focus through `[data-focus-visible]`
  until blur.

## 0.6.13

- Mirrored aligned-proxy validity to the visible Switch, Field, and Form under
  the shared inline/native validation contract.

## 0.6.12

- Restored native required validity by removing `readonly` from the aligned
  proxy, including required Switches without a submission name.

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
