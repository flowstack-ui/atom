# Collapsible Changelog

## Unreleased

## 0.24.0

- Added source-led Agent Knowledge for single-disclosure selection, trigger
  and region relationships, conditional persistence, orientation metadata,
  and motion measurement boundaries.

## 0.20.9

- Expose initially open Content with `data-initial-open` until its first state
  transition so styled layers can suppress page-load entrance motion.

## 0.20.8

- Measure newly opened Content before its first painted animation frame so
  height and width transitions begin with stable intrinsic dimensions.

## 0.14.0

- Add `orientation="vertical" | "horizontal"` with vertical default and
  consistent Root, Trigger, and Content attributes.
- Publish live `--content-width` alongside `--content-height` for two-axis
  styled disclosure motion.

## 0.13.1

- Keep `--content-height` synchronized while mounted when responsive reflow,
  fonts, images, or other intrinsic resizing changes the panel height.

## 0.1.0

- Initial Atom release.
