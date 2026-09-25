# FloatingPanel Changelog

## Unreleased

- No unreleased changes.

## 0.27.0

- Forward shared handle props from ResizeTriggers; individual handles retain
  individual refs. Show restore only while minimized or maximized.
- Make Content keyboard-reachable and pointer resize handles named groups outside
  the default tab sequence, preserving explicit focus and keyboard composition.

- Preserve position, size and stage until the closing content is hidden; reset
  after exit or safely before an interrupted exit reopens.

- Add headless nonmodal panel anatomy, a real controller/provider, physical
  geometry, drag/resize controls, keyboard movement, constraints and stages.
- Add lifecycle policy and document-scoped activation integration.
