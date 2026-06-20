# List

Headless native list primitives for ordered and unordered content.

## Features

- Renders native `ul`, `ol`, and `li` semantics.
- Supports ordered and unordered list roots.
- Supports disabled item metadata through `aria-disabled` and `data-disabled`.
- Supports `asChild` and `render` composition.
- Stays server-safe with no client boundary.

## Import

```tsx
import { List } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<List.Root>
  <List.Item />
</List.Root>
```

## API Reference

### Root

Contains list items.

| Prop | Type | Default |
| --- | --- | --- |
| `ordered` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"list"` |
| `[data-ordered]` | Present when ordered |

### Item

Renders one list item.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"list-item"` |
| `[data-disabled]` | Present when disabled |

## Examples

### Ordered List

```tsx
<List.Root ordered>
  <List.Item>First</List.Item>
  <List.Item>Second</List.Item>
</List.Root>
```

### Disabled Item Metadata

```tsx
<List.Item disabled>Unavailable item</List.Item>
```

## Accessibility

List uses native list semantics. It does not add keyboard behavior because static lists should follow normal document navigation.

| Key | Description |
| --- | --- |
| `Tab` | Moves to focusable descendants in document order |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
