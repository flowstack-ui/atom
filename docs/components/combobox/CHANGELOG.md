# Combobox Changelog

## Unreleased

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
