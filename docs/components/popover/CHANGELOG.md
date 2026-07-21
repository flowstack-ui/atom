# Popover Changelog

## 0.6.2

- Added perpendicular-side collision fallbacks after the preferred and opposite
  sides so constrained popovers can resolve onto the axis with available room.

## 0.4.0

- Added visible `Title` and `Description` parts with generated,
  hydration-stable `aria-labelledby` and `aria-describedby` relationships.
- Standardized naming on native `aria-label`, `aria-labelledby`, and
  `aria-describedby`; removed the custom `ariaLabel` alias.
- Added interaction-aware `initialFocus` and `finalFocus` targets, touch-safe
  Content focus, hover-without-focus-steal, dismissal reasons, and
  outside-destination preservation.

## 0.3.4

- Fixed modal Popover scroll locking to avoid duplicate body-padding
  compensation when the document already preserves its scrollbar gutter.

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
