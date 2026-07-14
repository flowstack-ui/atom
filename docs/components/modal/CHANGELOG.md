# Modal Changelog

## Unreleased

- No unreleased changes.

## 0.2.0

- Added shared dismissable layer Escape handling so nested overlays close
  before the parent modal closes.
- Added scoped modal focus containment so focus that moves outside an active
  modal scope is restored inside the modal while registered portalled
  descendants remain valid focus targets.
- Treat `ariaLabel` passed to modal content helpers as the fallback accessible name by omitting the generated title reference when it is provided.

## 0.1.0

- Initial Atom release.
