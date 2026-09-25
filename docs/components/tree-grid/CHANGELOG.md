# TreeGrid Changelog

## Unreleased

- No unreleased changes.

## 0.27.0

- Added independent Trigger, shared ColumnResizeHandle interaction, page movement,
  range/select-all and opt-in interactive cell/header controls with F2/Escape.
- Establish an eligible cell on focus and recover disabled or removed active
  cells without repeatedly requesting declined controlled state changes.

- Added optional native `ColumnGroup` and `Column` parts for table-layout
  sizing hints without changing indexed treegrid semantics or hierarchy.

## 0.24.0

- Added source-led Agent Knowledge for hierarchical grid selection, indexed
  relationships, expansion, active-cell focus, row selection, header actions,
  and virtualization boundaries.

## 0.18.0

- Added `ColumnHeader.onAction` with equivalent enabled pointer and active-cell
  Enter activation.
- Relocate active state to a collapsed ancestor's tree-column cell when a
  controlled or uncontrolled collapse hides the active descendant.

## 0.2.0

- Added `Direction.Provider` and `dir` support to mirror TreeGrid horizontal
  cell navigation and expand/collapse arrow behavior in RTL.

## 0.1.0

- Initial Atom release.
