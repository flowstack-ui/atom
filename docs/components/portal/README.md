# Portal

Utility for rendering children into another DOM container.

## When to Use

Use `Portal` when content must escape an ancestor that clips or stacks it, such
as an overlay rendered outside an `overflow: hidden` container. Prefer a
component's own `Portal` part for Select, Popover, Dialog, and similar
primitives because those parts keep the component API together. `Portal` only
moves DOM placement; it is not an accessible overlay by itself.

## Features

- Portals to `document.body` after mount by default.
- Accepts a custom container element.
- Can be disabled to render children in place.
- Returns `null` before a client-side target exists.

## Import

```tsx
import { Portal } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Portal />
```

## API Reference

### Portal

Moves its children to a DOM container without rendering a wrapper. It preserves
React context and event propagation while changing where the DOM nodes live.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `container` | `HTMLElement \| null` | `document.body` after mount |
| `disabled` | `boolean` | `false` |

**ARIA:** Portal adds no roles or ARIA attributes. Semantics come from its
children.

**Data attributes:** Portal renders no wrapper, so it exposes no data
attributes.

## Examples

### Default container

```tsx
import { Portal } from "@flowstack-ui/atom";

export default function DefaultPortal() {
  return (
    <Portal>
      <div>Portaled content</div>
    </Portal>
  );
}
```

### Custom container

```tsx
import { useState } from "react";
import { Portal } from "@flowstack-ui/atom";

export default function CustomPortal() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <div ref={setContainer} />
      <Portal container={container}>
        <div>Portaled content</div>
      </Portal>
    </>
  );
}
```

## Accessibility

`Portal` does not add semantics, focus management, or dismissal behavior. The
portaled content remains in the React tree but moves in the DOM, so overlays
should compose primitives that own focus and ARIA behavior.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
