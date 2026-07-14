# Menubar Changelog

## Unreleased

- Added Menubar usage guidance, self-contained application and selection
  examples, and an authoritative WAI-ARIA menubar pattern reference.
- Fixed local `Menubar.Root dir="rtl"` so shared nested submenu placement also
  mirrors to the left, matching `Direction.Provider dir="rtl"`.
- Expanded the Menubar README to document every namespaced part, including
  shared menu item props and Atom attributes.
- Fixed adjacent top-level menu handoff so the active trigger keeps focus for
  `Enter`, `Space`, and `Escape` after ArrowLeft or ArrowRight navigation.
- Fixed custom `data-slot` overrides on `Menubar.Root` and `Menubar.Trigger`.
- Added `Direction.Provider` and `dir` support to mirror Menubar top-level
  ArrowLeft and ArrowRight navigation in RTL.
- Inherited the shared Menu typeahead behavior so a single-character search
  cycles from the current matching item while multi-character buffers still
  match exact prefixes.
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
