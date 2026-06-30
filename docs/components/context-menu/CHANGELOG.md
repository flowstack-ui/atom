# ContextMenu Changelog

## Unreleased

- Inherited the shared Menu typeahead behavior so a single-character search
  cycles from the current matching item while multi-character buffers still
  match exact prefixes.
- Added shared dismissable layer Escape handling so ContextMenu closes before
  parent overlays when nested inside Dialog, Drawer, Modal, or Popover.
- Registered shared Menu content with parent modal focus scopes so ContextMenu
  can remain a valid focus target inside Dialog, Drawer, and other modal
  primitives.
- Added shared menu item parts to the `ContextMenu` namespace object.

## 0.1.0

- Initial Atom release.
