# Pagination Changelog

## Unreleased

- No unreleased changes.

## 0.23.0

- Added public Agent Knowledge for component selection, required composition,
  recurring mistakes, and validation.
- Added native URL-backed Item, Previous, and Next destinations through
  `Root.getPageHref` while preserving controlled button mode, current-page
  semantics, modified clicks, and inert boundary controls.

## 0.16.0

- Added the hostless `Items` part to render Root's calculated page and ellipsis
  range without consumer-owned mapping.
- Added Root-level Previous, Next, and generated Item label localization while
  preserving direct native `aria-label` precedence.

## 0.2.0

- Changed `Previous`, `Next`, `Item`, and `Ellipsis` to render their own
  structural `li` wrappers while keeping `asChild`, `render`, props, and refs
  targeted at the inner control or marker.
- Reduced pagination control callback churn by depending on specific context values instead of the full context object.

## 0.1.0

- Initial Atom release.
