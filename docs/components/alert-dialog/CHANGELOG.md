# AlertDialog Changelog

## Unreleased

- No unreleased changes.

## 0.3.2

- Inherited corrected nested-modal isolation handoff and final `inert`
  restoration from the shared Modal foundation.

## 0.3.1

- Inherited reliable exit-presence cleanup so closed AlertDialog Content and
  Overlay cannot remain above the page when CSS emits no end event.

## 0.3.0

- Fixed native Content ARIA precedence and registered Title/Description
  relationships across SSR and hydration.
- Added a settled development warning when an alert dialog lacks its required
  accessible description.
- Added Content-level `initialFocus` and `finalFocus` while preserving Cancel's
  native safe autofocus default.
- Added shared top-layer ownership and `Modal.Branch` support for third-party
  alert-dialog portals.
- Preserved descendant composite and nested-modal keyboard contracts through
  metadata-aware focus containment.
- Added registered-portal scroll allowances and per-document wheel/touch
  background containment with exact cleanup.
- Added stack-aware background isolation and same-document `HTMLElement`
  portal-container enforcement through the shared Modal foundation.
- Established shared modal ownership before paint and made exit-present Content
  inert and accessibility-hidden with uninterrupted nested lock handoff.
- Rejected Content nested beneath the accessibility-hidden Overlay.

## 0.2.0

- Added shared dismissable layer Escape handling so nested overlays close
  before the parent alert dialog closes.
- Improved modal focus containment, including support for registered portalled
  layers owned by descendants inside the alert dialog.

## 0.1.0

- Initial Atom release.
