# Menu Changelog

## Unreleased

- Added shared dismissable layer Escape handling so Menu closes before parent
  overlays when nested inside Dialog, Drawer, Modal, or Popover.
- Fixed outside pointer dismissal so Menu and Menubar-backed menus close
  reliably when clicking outside portalled content during inspection-heavy
  renders.
- Registered portalled Menu content and submenu content with parent modal focus
  scopes so menus can remain valid focus targets inside Dialog, Drawer, and
  other modal primitives.
- Scoped `RadioItem` highlight identities to their parent `RadioGroup` so
  separate radio groups can reuse the same public item values in one menu.
- Fixed initial highlight behavior so pointer movement over non-item content or
  item gaps does not reset highlight back to the first item while a menu is
  already open.

## 0.1.0

- Initial Atom release.
