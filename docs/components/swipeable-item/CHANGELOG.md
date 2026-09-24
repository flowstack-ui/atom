# SwipeableItem Changelog

## Unreleased

- Added a shared controller, RootProvider and Context, side thresholds,
  bounded resistance, recent-velocity reveal, dismissal and settlement hooks.
- Restricted full swipe to deliberate pointer release. Repeated Arrow keys
  and lost pointer capture no longer execute commands.
- Clamped reveal-only travel, preserved nested input/vertical gesture ownership,
  suppressed post-drag clicks, and invalidated disabled/read-only gestures.
- Added presentation-aware interruption, owner-document measurement and
  focus return when action panels close.

## 0.24.0

- Added source-led Agent Knowledge for gesture-enhanced row actions, required
  non-swipe fallbacks, pointer and scroll behavior, keyboard isolation,
  logical direction, and action accessibility.

## 0.19.9

- Preserved native vertical panning with an axis-compatible Content touch
  policy and stopped bubbled Arrow keys from nested controls from revealing
  action panels.
- Added real-browser and numbered manual evidence for gesture settlement,
  cancellation, keyboard isolation, logical direction, and scrolling.

## 0.2.0

- Added `closeOnClick` to `SwipeableItem.Actions`, defaulting to closing the open item after an action click.
- Updated keyboard handling so the opposite arrow closes an open side and the same arrow can trigger `onFullSwipe`.
- Allowed drag travel to full content width even when no full-swipe callback is configured; release still settles using the configured threshold.

## 0.1.0

- Initial Atom release.
