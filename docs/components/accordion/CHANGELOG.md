# Accordion Changelog

## 0.22.6 - 2026-08-10

- Added public Agent Knowledge for grouped disclosure selection, complete
  anatomy, heading and landmark policy, state ownership, and validation.

## 0.20.9

- Expose initially open Content with `data-initial-open` until its first state
  transition so styled layers can suppress page-load entrance motion.

## 0.20.8

- Measure newly opened Content before its first painted animation frame so
  height and width transitions begin with stable intrinsic dimensions.

## 0.14.0

- Propagate `orientation` to Item, Header, Trigger, and Content and publish
  live `--content-width` alongside `--content-height`.
- Mark the open Trigger in non-collapsible single mode with
  `aria-disabled="true"` and `data-locked-open` while keeping it focusable.
- Add `Accordion.Content landmark={false}` to omit optional region landmarks.

## 0.13.1

- Keep each Content `--content-height` synchronized while mounted when
  responsive reflow, fonts, images, or other intrinsic resizing changes the
  panel height.

## 0.2.0

- Fixed horizontal arrow-key navigation so Accordion mirrors ArrowLeft and
  ArrowRight under `Direction.Provider dir="rtl"` or `Accordion.Root dir="rtl"`.

## 0.1.0

- Initial Atom release.
