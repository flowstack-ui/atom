# MultiSelect Changelog

## Unreleased

- Added explicit option records, external controller/provider composition and IDs.
- Added retained-content lifecycle, exit completion and cancellable dismissal.
- Preserved selected form values before popup mount and owner-document portals.

- Add configurable close policy, keyboard looping, controlled highlight, native
  autocomplete and popup positioning.
- Add ClearTrigger with disabled/read-only protection and focus return.
- Reveal highlighted options only within the positioned popup.

## 0.24.0

- Added public Agent Knowledge for component selection, required composition,
  recurring mistakes, and validation.

## 0.20.0

- Added preventable `Content`/`Listbox.onInteractOutside` and moved outside
  dismissal to the shared layer-aware completed-activation contract.

## 0.10.1

- Move required and read-only ARIA states from the native button trigger to
  the multiple-selection listbox that supports them.

## 0.10.0

- Add the complete compact multi-value selection primitive with button-owned
  popup listbox semantics, array state, summary rendering, positioning,
  dismissal, Field/Form participation, validation, reset, and full anatomy.
