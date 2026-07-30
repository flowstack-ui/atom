# Toast Changelog

## Unreleased

- Documented a consumer-owned safe-area and application-chrome offset recipe,
  while explicitly avoiding an unverified automatic software-keyboard
  guarantee.

## 0.15.0

### Added

- Added logical start/end viewport positions, labelled `F8` notification-region
  access, focus-within pause, focused Escape dismissal with restoration, and
  optional directional swipe state and geometry.

### Changed

- Made persistent Viewport announcers the sole live path so each create or
  meaningful update is announced exactly once.
- Normalized maximum-visible, duration, and swipe-threshold inputs; preserved
  toast IDs across updates; and made omitted per-toast close policy inherit the
  Provider value.

## 0.2.0

- Fixed `Viewport asChild` so the cloned viewport element receives generated
  queued toast content.

## 0.1.0

- Initial Atom release.
