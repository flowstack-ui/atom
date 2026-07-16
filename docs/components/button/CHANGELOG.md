# Button Changelog

## Unreleased

- No unreleased changes.

## 0.2.1

- Fixed direct and composed Button links so `asChild` and `render` anchors or
  inactive-safe link adapters retain link semantics and native keyboard
  behavior.
- Removed `href`, `target`, and `rel` from disabled or loading composed links
  and blocked their composed activation handlers so inactive links cannot
  navigate.
- Documented the required render-adapter contract for router components that
  reject a removed `href`.

## 0.2.0

- Fixed `Button.Root` `asChild` composition so non-native child elements
  receive button semantics and keyboard focus behavior.

## 0.1.0

- Initial Atom release.
