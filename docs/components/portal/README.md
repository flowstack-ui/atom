# Portal

Utility for rendering children into another DOM container.

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

Moves children to a DOM container.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `container` | `HTMLElement \| null` | `document.body` after mount |
| `disabled` | `boolean` | `false` |

## Examples

### Default container

```tsx
<Portal>
  <div>Portaled content</div>
</Portal>
```

### Custom container

```tsx
<Portal container={containerElement}>
  <div>Portaled content</div>
</Portal>
```

## Accessibility

`Portal` does not add semantics, focus management, or dismissal behavior. The
portaled content remains in the React tree but moves in the DOM, so overlays
should compose primitives that own focus and ARIA behavior.

## Data Attributes

Portal renders no wrapper and therefore exposes no data attributes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
