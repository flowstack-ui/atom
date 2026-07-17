# Popover Changelog

## Unreleased

- No unreleased changes.

## 0.3.1

- Fixed exit-presence cleanup so closed Popover Content unmounts after its CSS
  motion window even when no end event is emitted.

## 0.2.0

- Fixed Popover positioning when `Anchor` uses its default `display: contents`
  wrapper by resolving the usable child element as the Floating UI reference
  and refreshing the reference after refs commit.
- Fixed non-modal and modal Popover dismissal so clicks and focus movement
  inside nested portalled Popover layers do not close the parent Popover.
- Added shared dismissable layer Escape handling so nested overlays close
  before parent Popover layers.
- Added scoped modal focus containment for modal Popover and registered
  Popover content with parent modal focus scopes when nested inside another
  modal primitive.
- Removed redundant `role="button"` and `tabIndex={0}` from the default native button trigger path.

## 0.1.0

- Initial Atom release.
