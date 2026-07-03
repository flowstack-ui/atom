# DropdownMenu Changelog

## Unreleased

- Inherited fixed submenu keyboard behavior under `Direction.Provider dir="rtl"`
  so ArrowLeft opens submenus, ArrowRight closes submenus, and submenu
  placement mirrors to the left side.
- Inherited the shared Menu typeahead behavior so a single-character search
  cycles from the current matching item while multi-character buffers still
  match exact prefixes.
- Fixed pointer-open behavior so clicking the trigger opens without
  pre-highlighting the first item; keyboard opening still seeds first/last
  highlight.
- Fixed pointer reopen behavior so closing presence frames cannot leave a stale
  first-item highlight for the next trigger click.
- Inherited fixed submenu Escape handling so nested DropdownMenu submenus close
  before the root dropdown or parent Dialog/Modal layer.
- Added shared dismissable layer Escape handling so DropdownMenu closes before
  parent overlays when nested inside Dialog, Drawer, Modal, or Popover.
- Registered shared Menu content with parent modal focus scopes so DropdownMenu
  can remain a valid focus target inside Dialog, Drawer, and other modal
  primitives.

## 0.1.0

- Initial Atom release.
