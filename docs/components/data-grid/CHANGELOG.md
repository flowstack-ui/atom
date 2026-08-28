# DataGrid Changelog

## Unreleased

## 0.24.0

- Added source-led Agent Knowledge for grid selection, indexed semantics,
  active-descendant focus, row selection, header actions, and virtualization
  boundaries.

## 0.17.0

- Added `ColumnHeader.onAction` with `data-actionable` and equivalent pointer
  and active-header Enter dispatch for application-controlled sorting.

## 0.2.0

- Fixed vertical keyboard navigation to preserve the active column while
  skipping disabled cells in intervening rows.
- Added `DataGrid.Row selectable` behavior with `data-selectable` and
  `data-selection-disabled` attributes so rows can opt out of selection without
  being disabled.
- Added `dir` and `Direction.Provider` support so horizontal cell navigation
  mirrors in RTL.

## 0.1.0

- Initial Atom release.
