# Reorder Changelog

## Unreleased

- Added inert pointer preview and measured reorder layout deltas.
- Added activation configuration and ancestor edge scrolling; linear gaps
  resolve to insertion targets without mutating controlled order during drag.

- Added row-major grid targeting and spatial keyboard movement.
- Replaced fixed single-axis displacement with collection-level measured layout projection and committed FLIP.
- Added an indicator-only `displacement="none"` escape for unsupported CSS layouts.

- Expose active input type on draggable sources and handles for pointer-only presentation.

## 0.23.0

- Added the initial controlled linear reorder preset with drag, keyboard,
  direct movement controls, announcements, direction support, and drop state.
