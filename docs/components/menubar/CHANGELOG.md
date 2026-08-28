# Menubar Changelog

## Unreleased

## 0.23.1

- Added public Agent Knowledge for component selection, required composition,
  recurring mistakes, and validation.

## 0.20.6

- Inherited movement-gated submenu hover intent so opening a top-level menu
  cannot also open a submenu that appears beneath a stationary pointer.

## 0.12.1

- Fixed Root and Content to preserve their behavior, refs, native props, and
  children through the documented `asChild` and `render` composition paths.
- Fixed Content composition to preserve consumer `onKeyDownCapture` handlers
  before Menubar-owned adjacent-menu navigation.

## 0.12.0

- Added horizontal/vertical orientation with matching ARIA/data state and
  orientation-aware top-level roving focus.
- Added Trigger ref, `asChild`, and `render` composition and made hover
  switching mouse-only while keeping click/tap universal.
- Inherited real menu-item focus, complete shared anatomy, mixed state,
  geometry variables, submenu corrections, and whole-Menubar Tab exit.

## 0.3.1

- Inherited reliable Menu exit-presence cleanup for closed Menubar and submenu
  Content under global motion CSS.

## 0.2.0

- Fixed local `Menubar.Root dir="rtl"` so shared nested submenu placement also
  mirrors to the left, matching `Direction.Provider dir="rtl"`.
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
