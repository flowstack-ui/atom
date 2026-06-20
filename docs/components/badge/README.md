# Badge

Small semantic wrapper for labels, counts, and status text.

## Features

- Renders a native `span`.
- Keeps text content in the accessibility tree.
- Supports native span props.
- Supports `asChild` and `render`.

## Import

```tsx
import { Badge } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Badge.Root />
```

## API Reference

### Root

Contains badge content.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"badge"` |

## Examples

### Count badge

```tsx
<Badge.Root>3</Badge.Root>
```

### Status badge

```tsx
<Badge.Root>Active</Badge.Root>
```

## Accessibility

Text badges are announced as normal inline content. For icon-only badges, add an
accessible label or include hidden text with `VisuallyHidden`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
