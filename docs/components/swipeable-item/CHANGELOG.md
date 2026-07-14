# SwipeableItem Changelog

## Unreleased

- Expanded SwipeableItem documentation with usage guidance, complete ARIA/data
  contracts, public helpers, and runnable pointer/keyboard examples.
- Added `closeOnClick` to `SwipeableItem.Actions`, defaulting to closing the open item after an action click.
- Updated keyboard handling so the opposite arrow closes an open side and the same arrow can trigger `onFullSwipe`.
- Allowed drag travel to full content width even when no full-swipe callback is configured; release still settles using the configured threshold.

## 0.1.0

- Initial Atom release.
