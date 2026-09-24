# Toolbar Changelog

## Unreleased

- Add named Group and native Input parts, root disabled state, discoverable
  disabled buttons, typed selection modes and forwarded part refs.
- Preserve native labels, owner-document keyboard navigation and composed-child
  cancellation; prevent disabled custom-host activation.

- Added public Agent Knowledge for component selection, required composition,
  recurring mistakes, and validation.

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
