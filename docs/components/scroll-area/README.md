# ScrollArea

Headless structure for scrollable content.

## When to Use

Use `ScrollArea` when a section needs native scrolling plus predictable parts
for attaching layout and overflow behavior. Use the page's normal scrolling
when the whole document can grow naturally. This primitive does not draw
custom scrollbars; it keeps the browser's scrolling behavior intact.

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

Shares the intended scroll direction with the Viewport and provides the outer
layout boundary. Consumer CSS still decides dimensions and overflow.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `orientation` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` |

**ARIA:** Root adds no role or ARIA attributes.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"scroll-area"` |
| `[data-orientation]` | `"vertical" \| "horizontal" \| "both"` |

### Viewport

Holds the scrollable content. It can become a named region and an explicit Tab
stop when keyboard users need to focus it for native scrolling.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `focusable` | `boolean` | `false` |
| `role` | `string` | `"region"` when named |
| `aria-label` | `string` | - |
| `aria-labelledby` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"region"` when an accessible name is present |
| `aria-label` | Direct accessible name |
| `aria-labelledby` | ID of the element that names the region |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"scroll-area-viewport"` |
| `[data-orientation]` | `"vertical" \| "horizontal" \| "both"` |

Advanced compound parts can read the orientation with
`useScrollAreaContext`; `ScrollAreaContextProvider` and the context value type
are also public for low-level composition.

## Examples

### Named scroll region

```tsx
import { ScrollArea } from "@flowstack-ui/atom";

export default function Notifications() {
  return (
    <ScrollArea.Root>
      <ScrollArea.Viewport aria-label="Notifications" focusable>
        <ul>
          <li>Build completed</li>
          <li>Review requested</li>
        </ul>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  );
}
```

### Decorative scroll area

Omit a name when the scroll area should not create a landmark region.

```tsx
import { ScrollArea } from "@flowstack-ui/atom";

export default function Terms() {
  return (
    <ScrollArea.Root>
      <ScrollArea.Viewport>
        <p>Terms and conditions</p>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  );
}
```

## Accessibility

Scrollable regions that need keyboard scrolling should be focusable. When a
viewport is named with `aria-label` or `aria-labelledby`, Atom assigns
`role="region"`. If a consumer passes `role="region"` without a name, Atom
removes the role to avoid an unnamed landmark.

The viewport uses native browser scrolling, so Arrow keys, Page Up, Page Down,
Home, End, and assistive scrolling commands work when the viewport is focused.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
