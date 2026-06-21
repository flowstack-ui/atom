# Architecture

Atom UI is a headless React primitive package.

It provides:

- semantic element choices
- WAI-ARIA wiring
- keyboard and focus behavior
- controlled and uncontrolled state
- compound component context
- portals and positioning primitives
- small utilities needed by headless components

It does not provide:

- CSS
- design tokens
- icons
- visual variants
- router bindings
- product data models

## Package Boundary

The package should be usable as a standalone dependency with React and React DOM
as peer dependencies. Runtime dependencies stay intentionally narrow.

## API Shape

The public API is namespace-first:

```tsx
import { Dialog } from "@flowstack-ui/atom";
```

Subpaths are supported:

```tsx
import { Dialog } from "@flowstack-ui/atom/dialog";
```

Direct part exports are also available for advanced composition and migration.

## Documentation Shape

- `README.md` explains package-level usage.
- `docs/guides/` explains public package behavior.
- `docs/components/` stores component-facing docs and changelogs.
