# ContextMenu Changelog

## 0.20.5

- Inherited resolved direction on portalled Content and SubContent so logical
  row anatomy and submenu chevrons mirror with the trigger.
- Inherited block-axis submenu collision fallbacks and narrow-viewport
  containment when neither inline side fits.

## 0.20.3

- Inherited document-only overflow locking so sticky application chrome
  remains anchored while a modal ContextMenu is open.

## 0.12.0

- Added a cancel-safe 700 ms touch/pen long press with 10 px movement tolerance,
  native-contextmenu de-duplication, temporary pressed state, and full cleanup.
- Inherited real item focus, disabled-item navigation, owner-aware Tab exit,
  modal isolation, shared anatomy, mixed state, composition, and geometry.

## 0.3.4

- Inherited corrected modal Menu scroll-lock compensation for documents that
  preserve their scrollbar gutter.

## 0.3.1

- Inherited reliable Menu exit-presence cleanup for closed ContextMenu and
  submenu Content under global motion CSS.

## 0.2.0

- Fixed `Trigger` so custom `data-slot` values override the default
  `context-menu-trigger` slot.
- Inherited fixed submenu keyboard behavior under `Direction.Provider dir="rtl"`
  so ArrowLeft opens submenus, ArrowRight closes submenus, and submenu
  placement mirrors to the left side.
- Fixed `Trigger` so its documented `asChild` and `render` composition props
  are implemented while preserving context-menu behavior.
- Fixed `Content` so refs forward to the underlying shared menu content
  element.
- Fixed pointer-open behavior so right-click opens without pre-highlighting the
  first item; keyboard context-menu opens still seed the first highlight.
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
