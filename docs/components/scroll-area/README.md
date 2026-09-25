# ScrollArea

Headless structure for scrollable content.

## When to Use

Use `ScrollArea` when a section needs native scrolling plus predictable parts
for attaching layout and overflow behavior. Use the page's normal scrolling
when the whole document can grow naturally. This primitive does not draw
custom scrollbars; it keeps the browser's scrolling behavior intact.

## Features

- Provides Root, Viewport, Content, Scrollbar, Thumb, Corner, RootProvider and Context parts.
- Measures custom thumb geometry, both-axis overflow and physical edge state.
- Supports pointer capture for thumb dragging and track clicks without replacing native input.
- Exposes `useScrollArea` for scroll commands, logical progress and state.
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

### Custom anatomy

```tsx
<ScrollArea.Root orientation="both">
  <ScrollArea.Viewport focusable aria-label="Records">
    <ScrollArea.Content>{records}</ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar><ScrollArea.Thumb /></ScrollArea.Scrollbar>
  <ScrollArea.Scrollbar orientation="horizontal"><ScrollArea.Thumb /></ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollArea.Root>
```

Supply one viewport, one content and one track/thumb pair per enabled axis. Atom
owns measurement and pointer behavior; consumer CSS owns overflow, size, positioning,
visibility, colors and minimum thumb length. Never hide native scrollbars until
`data-custom-ready` is present, and restore native bars in forced colors.
Content, Scrollbar, Thumb and Corner support native div props, refs, `asChild` and
`render`. Scrollbar orientation defaults to vertical; Thumb inherits its track.
Scrollbar/Thumb IDs provided through `ids` receive an axis suffix to stay unique.
These pointer affordances are not sliders or extra Tab stops: the viewport remains
the keyboard scrolling target. Do not add interactive children to a thumb.

### Controller

`useScrollArea({ orientation?, ids? })` returns a stable controller. Pass it to
`<ScrollArea.RootProvider value={controller}>` instead of Root. The hook and
`<ScrollArea.Context>{controller => ...}</ScrollArea.Context>` subscribe to state.
The legacy orientation context is not a replacement for RootProvider.

- `hasOverflowX`, `hasOverflowY`, `isAtTop`, `isAtBottom`, `isAtLeft`, `isAtRight`:
  measured booleans. Left/right always mean physical edges.
- `getScrollProgress()`: clamped `{ x, y }` fractions; x starts at inline-start
  even in RTL. No overflow returns zero progress.
- `scrollTo({ top?, left?, behavior?, duration?, easing? })`: native coordinates
  (negative left in RTL); optional duration in milliseconds and easing from 0–1.
- `scrollToEdge({ edge, ...options })`: top/right/bottom/left physical edge.
- `getScrollbarState({ orientation? })`: hidden, hovering, scrolling and dragging.
- `viewportRef` and `contentRef`: callbacks for advanced single-owner composition.
  The standard parts already register these; do not register duplicate owners.

Calls before mounting safely do nothing. Reduced motion makes commands instant.
New commands, wheel, touch, keyboard input and unmount cancel programmatic motion.
Observers update for resizes, content changes, image loads and fonts. Geometry is
clamped during rubber-band overscroll. Data overflow, scrolling, dragging, hover,
edge and readiness attributes support presentation without React event loops.
Native-only Root does not install observers unless measured parts are composed;
the explicit controller opts into measurement. SSR performs no DOM measurement.
Virtualization, data loading and sticky-bottom policy belong to the application.

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
