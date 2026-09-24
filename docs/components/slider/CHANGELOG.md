# Slider Changelog

## Unreleased

- No unreleased changes.

## 0.27.0

- Keep Root and Control composed refs stable during value updates, preserving
  active pointer sessions and cancellation rollback.
- Distinguish real controlled-value replacements from focus-only rerenders and
  commit final pointer proposals only after the controlled owner accepts them.

- Fixed secondary-button value changes, track-to-thumb focus, off-center grab jumps, scalar boundary fill and owner-document focus/measurement.
- Stabilized thumb registration and observer cleanup; invalidate stale drags on reset, controller replacement and geometry changes.

- Added the shared `useSlider` controller, `RootProvider`, and public Context.
- Added Control, Label, ValueText, MarkerGroup, Marker, MarkerIndicator,
  MarkerLabel, DraggingIndicator, and explicit HiddenInput parts.
- Added scalar range origins, contained/centered thumb alignment with measured
  or explicit thumb dimensions, and none/push/swap pointer collision policies.
- Added Shift+Arrow large stepping, focused/dragging index state, stable part
  IDs, Root composition, and deterministic automatic/explicit form inputs.
- Fixed authored Thumb accessible names/descriptions and Root
  `aria-labelledby` propagation so range thumbs can have distinct names.

## 0.24.0

- Added public Agent Knowledge for component selection, required composition,
  recurring mistakes, and validation.

## 0.19.4

- Finalize the latest pointer value when capture is lost instead of restoring
  the pointer-down value; true `pointercancel` still rolls back without commit.

## 0.19.3

- Exposed effective adjacent-thumb bounds through each Thumb's ARIA range.
- Preserved non-slider-axis page scrolling and restored the pointer-down value
  without committing when a drag is cancelled or capture is lost.

## 0.5.0

- Added Field disabled/read-only/invalid/required, generated naming and
  description integration, native `aria-label`, and uncontrolled reset.

## 0.2.0

- Added `Direction.Provider` support for horizontal right-to-left pointer and
  keyboard behavior.
- Fixed percent geometry so `data-percent` and inline percent offsets do not
  expose floating-point artifacts such as `55.00000000000001`.

## 0.1.0

- Initial Atom release.
