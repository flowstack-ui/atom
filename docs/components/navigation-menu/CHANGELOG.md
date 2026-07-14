# NavigationMenu Changelog

## Unreleased

- Completed disclosure-navigation keyboard behavior for `NavigationMenu`,
  including direct top-level links, vertical orientation, content arrow
  navigation, focus-out closing, and nested Escape focus restoration.
- Added `loop` to control content arrow-key wrapping and made content arrows
  follow focusable DOM order.
- Added standard `asChild`/`render` customization support to the remaining
  `NavigationMenu` parts, including viewport-rendered content.
- Fixed `data-slot` override support across `NavigationMenu` parts,
  including viewport-rendered content.
- Added horizontal trigger roving keyboard navigation for `NavigationMenu`,
  including RTL-mirrored ArrowLeft and ArrowRight handling.
- Added `Direction.Provider` fallback for `NavigationMenu.Root` direction.
- Added shared dismissable layer Escape handling so NavigationMenu panels close
  as the topmost active layer when nested with other overlays.
- Refined trigger, indicator, and viewport callback dependencies to avoid recreating callbacks from the full context object.

## 0.1.0

- Initial Atom release.
