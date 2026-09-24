# Image Changelog

## Unreleased

### Added

- Image Root accepts SSR-known `srcSet` candidates while retaining Content overrides.

### Fixed

- Image returns to idle when the last source is cleared and detects cached broken images even when `currentSrc` is empty. Custom native source changes synchronize without detached requests.

- Preserve native Image content in SSR and during loading; observe real image events instead of eagerly preloading a second image. Preserve request hints and responsive source selection. Default fallback now covers idle/error; loading is opt-in.

- Added public Agent Knowledge for component selection, required composition,
  recurring mistakes, and validation.

## 0.9.0

- Added headless Root, Content, and Fallback parts with generic source loading
  status, source-change safety, native image props, and composition.
