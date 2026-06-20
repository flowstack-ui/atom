# Divider

Decorative or semantic separator primitive.

## Features

- Renders `hr` when it has no children and `div` when it contains content.
- Defaults to decorative output.
- Supports horizontal and vertical semantic orientation.
- Supports `asChild` and `render`.

## Import

```tsx
import { Divider } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Divider.Root />
```

## API Reference

### Root

Separates content visually or semantically.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `decorative` | `boolean` | `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"divider"` |

## Examples

### Decorative divider

```tsx
<Divider.Root />
```

### Semantic vertical separator

```tsx
<Divider.Root decorative={false} orientation="vertical" />
```

### Labeled divider

```tsx
<Divider.Root>Section</Divider.Root>
```

## Accessibility

Decorative dividers render with `role="none"`. Set `decorative={false}` when
the separator communicates structure. Vertical semantic separators receive
`aria-orientation="vertical"`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
