# Slider Changelog

## Unreleased

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
