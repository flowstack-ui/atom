# DataGrid Changelog

## Unreleased

- Split all eight parts into complete APIs and corrected active-cell, index,
  selection, count, ARIA, data, RTL, and example guidance.

- Fixed vertical keyboard navigation to preserve the active column while
  skipping disabled cells in intervening rows.
- Added `DataGrid.Row selectable` behavior with `data-selectable` and
  `data-selection-disabled` attributes so rows can opt out of selection without
  being disabled.
- Added `dir` and `Direction.Provider` support so horizontal cell navigation
  mirrors in RTL.

## 0.1.0

- Initial Atom release.
