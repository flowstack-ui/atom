# Tooltip Changelog

## 0.6.9

- Preserved resolved Trigger or provider direction on portalled Content while
  retaining explicit Content `dir` precedence.

## 0.6.8

- Exposed measured available dimensions through headless floating properties
  for constrained styled surfaces.

## 0.6.3

- Prioritized every usable alignment on the requested side, followed by the
  opposite side, before allowing perpendicular-axis collision fallbacks.

## 0.6.2

- Added perpendicular-side collision fallbacks after the preferred and opposite
  sides so constrained tooltips can resolve onto the axis with available room.

## 0.6.1

- Added immediate outside-touch and scroll dismissal after a long-press Tooltip
  has opened and the initiating finger is released.

## 0.3.5

- Corrected touch long press to open once at the 700 ms threshold without also
  paying the hover delay.
- Added complete touch-session cancellation for early release, movement beyond
  10 CSS pixels, scrolling, a second touch, `touchcancel`, disabled changes,
  and Trigger unmount.
- Ignored touch-generated compatibility hover/focus events after release so a
  quick tap cannot enter the desktop opening path, and suppressed native text
  selection/callout only while a long press is actively being tracked.
- Moved touch auto-dismissal to release time, retaining 1500 ms for plain and
  adding a finite 3000 ms rich dismissal.
- Clarified that plain and rich Content are both non-interactive and that
  actionable floating content belongs in Popover.

## 0.3.1

- Fixed exit-presence cleanup so closed Tooltip Content unmounts after its CSS
  motion window even when no end event is emitted.

## 0.2.0

- Fixed Tooltip render trigger positioning by updating Floating UI after the
  trigger ref commits.
- Added `data-variant="plain|rich"` to Tooltip content and documented the
  `variant` Root prop.
- Added shared dismissable layer Escape handling so Tooltip participates in
  topmost-layer dismissal with other overlays.

## 0.1.0

- Initial Atom release.
