# Menubar Changelog

## Unreleased

- Registered shared Menu content with parent modal focus scopes so Menubar
  menus can remain valid focus targets inside Dialog, Drawer, and other modal
  primitives.
- Added shared menu item parts to the `Menubar` namespace object.
- Refined `Menubar.Content` keyboard handler dependencies to avoid recreating callbacks from the full context objects.

## 0.1.0

- Initial Atom release.
