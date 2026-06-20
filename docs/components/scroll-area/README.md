# ScrollArea

Headless structure for scrollable content.

## Features

- Provides root and viewport parts.
- Supports vertical, horizontal, and both-axis orientation metadata.
- Keeps the viewport out of the Tab order by default.
- Adds `role="region"` only when the viewport has an accessible name.
- Supports `asChild` and `render` on every part.

## Import

```tsx
import { ScrollArea } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<ScrollArea.Root>
  <ScrollArea.Viewport />
</ScrollArea.Root>
```

## API Reference

### Root

Contains scroll area state metadata.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `orientation` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"scroll-area"` |
| `[data-orientation]` | `"vertical" \| "horizontal" \| "both"` |

### Viewport

Scrollable viewport element.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `focusable` | `boolean` | `false` |
| `role` | `string` | `"region"` when named |
| `aria-label` | `string` | - |
| `aria-labelledby` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"scroll-area-viewport"` |
| `[data-orientation]` | `"vertical" \| "horizontal" \| "both"` |

## Examples

### Named scroll region

```tsx
<ScrollArea.Root>
  <ScrollArea.Viewport aria-label="Notifications" focusable>
    ...
  </ScrollArea.Viewport>
</ScrollArea.Root>
```

### Decorative scroll area

Omit a name when the scroll area should not create a landmark region.

```tsx
<ScrollArea.Root>
  <ScrollArea.Viewport>...</ScrollArea.Viewport>
</ScrollArea.Root>
```

## Accessibility

Scrollable regions that need keyboard scrolling should be focusable. When a
viewport is named with `aria-label` or `aria-labelledby`, Atom assigns
`role="region"`. If a consumer passes `role="region"` without a name, Atom
removes the role to avoid an unnamed landmark.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
