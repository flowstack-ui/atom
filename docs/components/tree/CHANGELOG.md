# Tree Changelog

## Unreleased

- Corrected Tree data attribute documentation for item selection state and group
  expansion state.
- Fixed pointer targeting so whitespace inside nested groups does not
  reactivate or select the parent item.
- Added `Direction.Provider` and `dir` support to mirror horizontal Tree
  navigation and expand/collapse arrow behavior in RTL.
- Standardized Tree typeahead so a single-character search cycles from the
  current matching item while multi-character buffers still match exact
  prefixes.

## 0.1.0

- Initial Atom release.
