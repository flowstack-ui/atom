# Toolbar Changelog

## 0.7.0

- Removed live native and composed destination attributes from disabled
  Toolbar links while preserving their disabled announcement and toolbar-owned
  roving-focus behavior.

## 0.2.0

- Added `render` and `asChild` composition support to all Toolbar parts.
- Fixed Toolbar parts so custom `data-slot` values override their default slot
  identifiers.
- Added `Direction.Provider` fallback for `Toolbar.Root dir` and rendered the
  resolved direction on the toolbar root.

## 0.1.0

- Initial Atom release.
