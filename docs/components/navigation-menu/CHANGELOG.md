# NavigationMenu Changelog

## Unreleased

- Added `Direction.Provider` fallback for `NavigationMenu.Root` direction.
- Added shared dismissable layer Escape handling so NavigationMenu panels close
  as the topmost active layer when nested with other overlays.
- Refined trigger, indicator, and viewport callback dependencies to avoid recreating callbacks from the full context object.

## 0.1.0

- Initial Atom release.
