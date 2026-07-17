# Tooltip Changelog

## Unreleased

- No unreleased changes.

## 0.3.1

- Fixed exit-presence cleanup so closed Tooltip Content unmounts after its CSS
  motion window even when no end event is emitted.

## 0.2.0

- Fixed Tooltip render trigger positioning by updating Floating UI after the
  trigger ref commits.
- Added `data-variant="plain|rich"` to Tooltip content and documented the
  `variant` Root prop.
- Added shared dismissable layer Escape handling so Tooltip participates in
  topmost-layer dismissal with other overlays.

## 0.1.0

- Initial Atom release.
