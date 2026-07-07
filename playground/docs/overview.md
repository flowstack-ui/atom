# Playground Overview

The Atom playground is a local Vite app for manually testing headless Atom UI
primitives in a real browser. It is not product documentation and is not
published to npm.

## Purpose

Use the playground to catch behavior that is hard to understand from unit tests
alone:

- focus movement and focus restoration
- Escape, arrow key, Enter, Space, and Tab behavior
- portal, overlay, and outside-interaction behavior
- controlled and uncontrolled state
- form participation
- live `aria-*`, native, and `data-*` attributes
- pointer and keyboard interaction together

Package tests remain the release gate for exact contracts. The playground gives
manual browser confidence and helps discover gaps in the primitives.

## App Shape

Build the playground like a compact desktop tool:

- top app bar with component categories
- no persistent sidebar
- one selected scenario at a time
- Anatomy on the left
- Canvas in the middle
- Inspector on the right
- compact panel footers for state summaries

Canvas controls belong in the Canvas toolbar, not in the Anatomy panel.

## Public Imports

Use public Atom import paths only:

```tsx
import { Dialog } from "@flowstack-ui/atom";
import { Select } from "@flowstack-ui/atom/select";
```

Do not import from `../src/primitives`, `../src/utils`, or other package
internals. The Vite alias already maps public imports to local source.

