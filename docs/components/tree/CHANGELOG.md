# Tree Changelog

## Unreleased

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
