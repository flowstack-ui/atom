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
| `ratioVariable` | CSS custom-property name, e.g. `--media-ratio` | - |

`ratioVariable` lets a styled layer provide CSS-responsive geometry without
moving breakpoint policy into Atom. Root emits `aspect-ratio: var(name, ratio)`;
the normalized numeric ratio is the missing-variable fallback. The variable
must contain a valid CSS aspect ratio. Invalid property names are ignored.
Without this prop the numeric inline output is unchanged. Child sizing and
media fitting remain the styled layer's responsibility.

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
