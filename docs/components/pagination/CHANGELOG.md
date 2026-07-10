# Pagination Changelog

## Unreleased

- Changed `Previous`, `Next`, `Item`, and `Ellipsis` to render their own
  structural `li` wrappers while keeping `asChild`, `render`, props, and refs
  targeted at the inner control or marker.
- Documented default rendered elements, default labels, disabled behavior,
  ellipsis hiding, and the no-DOM case for non-positive page counts.
- Reduced pagination control callback churn by depending on specific context values instead of the full context object.

## 0.1.0

- Initial Atom release.
