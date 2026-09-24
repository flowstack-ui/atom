# Tree Changelog

## Unreleased

- Change multiple-selection pointer behavior: ordinary click replaces selection,
  Ctrl/Command-click toggles, and Shift-click extends the visible range. This
  changes the previous additive ordinary-click behavior.

- Keep controller root props typed against the public contract without embedding React-version-specific event declarations.

- Added controlled focus, optional selection, independent Trigger and Checkbox,
  logical collections/controller, range/select-all, lazy loading state/retry,
  interactive item entry/return and presence-aware Group motion.
- Corrected disabled endpoint navigation, active-item recovery and pointer hover
  interference with keyboard focus. Selection and checking remain independent.

## 0.24.0

- Added source-led Agent Knowledge for one-dimensional hierarchy selection,
  nested relationships, expansion and selection state, focus, typeahead,
  forms, direction, and virtualization boundaries.

## 0.17.1

- Corrected initial focus so the first enabled visible selected Item becomes
  active before falling back to the first enabled visible Item.
- Changed the default `loop` value to `false` so arrow navigation stops at the
  first and last visible Item; wrapping remains available with `loop`.

## 0.2.0

- Fixed pointer targeting so whitespace inside nested groups does not
  reactivate or select the parent item.
- Added `Direction.Provider` and `dir` support to mirror horizontal Tree
  navigation and expand/collapse arrow behavior in RTL.
- Standardized Tree typeahead so a single-character search cycles from the
  current matching item while multi-character buffers still match exact
  prefixes.

## 0.1.0

- Initial Atom release.
