# Menubar Changelog

## Unreleased

- Fixed pointer-open behavior so clicking or hovering between top-level menus
  opens content without pre-highlighting the first item; keyboard ArrowDown and
  ArrowUp still seed first and last item highlight.
- Registered shared Menu content with parent modal focus scopes so Menubar
  menus can remain valid focus targets inside Dialog, Drawer, and other modal
  primitives.
- Fixed `Menubar.Trigger` semantics so top-level triggers expose `role="menuitem"`
  as valid children of the `role="menubar"` root.
- Inherited the shared Menu radio item fix so separate Menubar radio groups can
  reuse the same public values without sharing highlight state.
- Inherited the shared Menu highlight fix so pointer movement over non-item
  content or item gaps does not reset highlight back to the first item.
- Added shared menu item parts to the `Menubar` namespace object.
- Refined `Menubar.Content` keyboard handler dependencies to avoid recreating callbacks from the full context objects.

## 0.1.0

- Initial Atom release.
