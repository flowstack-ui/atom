# DropdownMenu Changelog

## Unreleased

- Added shared dismissable layer Escape handling so DropdownMenu closes before
  parent overlays when nested inside Dialog, Drawer, Modal, or Popover.
- Registered shared Menu content with parent modal focus scopes so DropdownMenu
  can remain a valid focus target inside Dialog, Drawer, and other modal
  primitives.

## 0.1.0

- Initial Atom release.
