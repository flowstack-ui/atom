# Pagination Changelog

## Unreleased

- No unreleased changes.

## 0.2.0

- Changed `Previous`, `Next`, `Item`, and `Ellipsis` to render their own
  structural `li` wrappers while keeping `asChild`, `render`, props, and refs
  targeted at the inner control or marker.
- Reduced pagination control callback churn by depending on specific context values instead of the full context object.

## 0.1.0

- Initial Atom release.
