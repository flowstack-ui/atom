# Carousel Changelog

## 0.22.3

- Replaced the focus/click timing workaround with explicit pointer-activation
  provenance so RotationControl toggles exactly once across browser engines
  while keyboard focus retains the required stop behavior.

## 0.22.1

- Fixed the focus-before-click race on RotationControl so activating a playing
  carousel reliably stops it while ordinary focus entry retains the required
  stop behavior.

## 0.22.0

- Added the one-active-slide Carousel family with controlled/uncontrolled
  selection and rotation, optional controls and picker, native scroll-derived
  touch selection, focus/hover/visibility pause policy, LTR/RTL support, and
  WAI-ARIA carousel and slide semantics.
