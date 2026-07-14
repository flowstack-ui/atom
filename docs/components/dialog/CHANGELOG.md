# Dialog Changelog

## Unreleased

- Expanded the documentation with usage comparisons, complete inherited Modal
  APIs, ARIA and data contracts, focus behavior, and copy-ready examples.

- Added shared dismissable layer Escape handling so nested overlays close
  before the parent dialog closes.
- Improved modal focus containment, including support for registered portalled
  layers owned by descendants inside the dialog.
- Added Dialog-specific Trigger, Title, Description, and Close wrappers so all public parts expose `dialog-*` data slots.

## 0.1.0

- Initial Atom release.
