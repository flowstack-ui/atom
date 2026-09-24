# Progress Changelog

## Unreleased

- No unreleased changes.

## 0.27.0

- Preserve sequential uncontrolled controller requests and clear stale numeric
  attributes from indeterminate composed hosts.
- Added useProgress, RootProvider and render Context for shared controlled or
  uncontrolled progress, explicit IDs and application-driven updates.
- Added defaultValue and onValueChange while retaining an indeterminate default.
- Prevented NaN values, non-finite bounds and overflowing ranges from producing
  invalid progress state, ARIA values or percentages.

## 0.24.0

- Added source-led Agent Knowledge for determinate and indeterminate work,
  accessible naming and value text, normalized ranges, and Indicator
  presentation boundaries.

## 0.1.0

- Initial Atom release.
