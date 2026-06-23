# Drawer Changelog

## Unreleased

- Added shared dismissable layer Escape handling so nested overlays close
  before the parent drawer closes.
- Improved modal focus containment, including support for registered portalled
  layers owned by descendants inside the drawer.
- Added Drawer-specific Trigger, Title, Description, and Close wrappers so all public parts expose `drawer-*` data slots.
- Preserved `className` on keep-mounted hidden drawer content.

## 0.1.0

- Initial Atom release.
