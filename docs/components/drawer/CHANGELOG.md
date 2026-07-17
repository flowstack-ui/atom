# Drawer Changelog

## Unreleased

- No unreleased changes.

## 0.3.1

- Fixed exit-presence cleanup so closed Drawer Content and Overlay unmount
  after their CSS motion window even when no end event is emitted.

## 0.3.0

- Fixed native Content ARIA precedence and optional Description relationships.
- Added SSR-safe, hydration-stable Title and Description registration.
- Added Content-level `initialFocus` and `finalFocus`, including touch-safe
  Content focus and explicit post-close workflow targets.
- Added shared top-layer ownership and `Modal.Branch` support for third-party
  drawer portals.
- Preserved descendant composite and nested-modal keyboard contracts through
  metadata-aware focus containment.
- Added long-content and registered-portal scroll allowances with background
  wheel/touch containment and exact cleanup.
- Added stack-aware background isolation and same-document `HTMLElement`
  portal-container enforcement through the shared Modal foundation.
- Established shared modal ownership before paint; exit-present Content is inert
  and accessibility-hidden, nested lock handoff is uninterrupted, and unavailable
  Tab candidates are skipped.
- Rejected Content nested beneath Overlay and prevented bubbled descendant clicks
  from being treated as backdrop dismissal.

## 0.2.0

- Added shared dismissable layer Escape handling so nested overlays close
  before the parent drawer closes.
- Improved modal focus containment, including support for registered portalled
  layers owned by descendants inside the drawer.
- Preserved `className` on keep-mounted hidden drawer content.

## 0.1.0

- Initial Atom release.
