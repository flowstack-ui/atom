# AspectRatio

Structural wrapper that keeps its content at a stable width-to-height ratio.

## When to Use

Use AspectRatio when an image, video, iframe, or placeholder should reserve a
predictable shape before its content finishes loading. It controls geometry
only. The child element still owns its image, media, or interactive semantics.

## Features

- Applies an authoritative `aspect-ratio` inline style.
- Defaults to a `16 / 9` ratio.
- Normalizes non-positive and non-finite ratios back to `16 / 9`.
- Preserves native div props and consumer styles outside the owned ratio value.
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

Renders a `div` by default and constrains its content with an inline
`aspect-ratio`. Consumer styles are preserved, but the resolved ratio remains
authoritative.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `ratio` | `number` | `16 / 9` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"aspect-ratio"` |

## Examples

### Square Image

```tsx
import { AspectRatio } from "@flowstack-ui/atom";

export function SquareImage() {
  return (
    <AspectRatio.Root ratio={1}>
      <img src="/profile.png" alt="Alex Morgan" />
    </AspectRatio.Root>
  );
}
```

### Video Frame

```tsx
import { AspectRatio } from "@flowstack-ui/atom";

export function VideoFrame() {
  return (
    <AspectRatio.Root ratio={16 / 9}>
      <iframe src="/product-tour" title="Product tour" />
    </AspectRatio.Root>
  );
}
```

## Accessibility

WAI-ARIA defines no AspectRatio widget because aspect ratio is layout behavior,
not an interactive pattern. Root adds no role or ARIA attributes. Give the child
its appropriate semantics: images need suitable alternative text, and iframes
need a descriptive title.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
