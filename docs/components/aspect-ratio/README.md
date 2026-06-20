# AspectRatio

Aspect-ratio preserving structural wrapper.

## Features

- Applies an authoritative `aspect-ratio` inline style.
- Normalizes invalid ratios back to `16 / 9`.
- Preserves native DOM props and consumer styles outside the owned ratio style.
- Supports `asChild` and `render`.

## Import

```tsx
import { AspectRatio } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<AspectRatio.Root />
```

## API Reference

### Root

Constrains its content to a width/height ratio.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `ratio` | `number` | `16 / 9` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"aspect-ratio"` |

## Examples

### Square media

```tsx
<AspectRatio.Root ratio={1}>
  <img src="/avatar.png" alt="" />
</AspectRatio.Root>
```

### Video frame

```tsx
<AspectRatio.Root ratio={16 / 9}>
  <iframe title="Demo" src="https://example.com" />
</AspectRatio.Root>
```

## Accessibility

`AspectRatio` adds no ARIA by itself. Accessible names and semantics belong to
the content rendered inside the wrapper.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
