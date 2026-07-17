# Dialog Changelog

## Unreleased

- No unreleased changes.

## 0.3.0

- Fixed native Content ARIA precedence and optional Description relationships.
- Added SSR-safe, hydration-stable Title and Description registration.
- Added Content-level `initialFocus` and `finalFocus`, touch-safe default focus,
  and opening/closing interaction details.
- Added shared top-layer ownership and `Modal.Branch` support for third-party
  dialog portals.
- Preserved Menu, Select, Popover, and nested-dialog keyboard contracts through
  metadata-aware modal focus containment.
- Added long-content and registered-portal scroll allowances with background
  wheel/touch boundary containment and exact body restoration.
- Added stack-aware background isolation and same-document `HTMLElement`
  portal-container enforcement through the shared Modal foundation.
- Established shared modal ownership before paint; exit-present Content is inert
  and accessibility-hidden, nested lock handoff is uninterrupted, and unavailable
  Tab candidates are skipped.
- Rejected Content nested beneath Overlay and prevented bubbled descendant clicks
  from being treated as backdrop dismissal.

## 0.2.0

- Added shared dismissable layer Escape handling so nested overlays close
  before the parent dialog closes.
- Improved modal focus containment, including support for registered portalled
  layers owned by descendants inside the dialog.

## 0.1.0

- Initial Atom release.
