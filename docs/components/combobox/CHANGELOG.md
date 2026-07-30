# Combobox Changelog

## Unreleased

- No unreleased changes.

## 0.18.2

- Added Control and Trigger parts, anchored Content to the full Control, and
  exposed inherited form state on the Control styling surface.
- Made authored Items filter themselves from Root options and initialized
  display text from `defaultValue` when `defaultInputValue` is omitted.

## 0.18.1

- Made touch and pen outside dismissal wait for a completed tap and cancel on
  movement, scrolling, or pointer cancellation.

## 0.6.16

- Explicitly scrolled inline validation-directed focus into view.

## 0.6.15

- Exposed inline validation-directed focus through `[data-focus-visible]`
  until blur.

## 0.6.13

- Mirrored committed-value proxy validity to the visible Combobox, Field, and
  Form under the shared inline/native validation contract.

## 0.6.12

- Moved native required validity to an aligned proxy holding the committed
  logical value, so display text alone no longer satisfies selection validity.

## 0.5.0

- Added Field state, generated input ID, label, and description integration plus
  external-form and uncontrolled reset behavior.

## 0.2.0

- Fixed option selection so pointer clicks, including already-selected options,
  close the listbox consistently, and `clearOnSelect` also applies to
  free-solo Enter commits.
- Fixed `openOnFocus` so empty states can open on focus when
  `Combobox.Empty` is mounted.
- Added shared dismissable layer Escape handling so Combobox closes before
  parent overlays when nested inside Dialog, Drawer, Modal, or Popover.
- Fixed outside pointer dismissal so Combobox closes reliably when clicking
  outside the input or content during inspection-heavy renders.

## 0.1.0

- Initial Atom release.
