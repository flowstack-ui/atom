# SwipeableItem

Headless swipe actions for list-like items.

## When to Use

Use `SwipeableItem` when a list row has a few quick actions that touch users
can reveal by swiping, while keyboard users can reveal the same actions with
Arrow keys. Keep an obvious non-swipe path to important actions. Use a `Menu`
when there are many actions or when a hidden swipe gesture would be surprising.

## Features

- Supports start and end action panels.
- Supports pointer dragging and keyboard opening.
- Supports controlled and uncontrolled open side state.
- Supports left-to-right and right-to-left direction.
- Supports optional full-swipe actions.
- Closes open action panels after action clicks by default.
- Supports `asChild` and `render` on every part.

## Import

```tsx
import { SwipeableItem } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<SwipeableItem.Root>
  <SwipeableItem.Actions side="start" />
  <SwipeableItem.Content />
  <SwipeableItem.Actions side="end" />
</SwipeableItem.Root>
```

## API Reference

### Root

Owns the open side, drag offset, direction, thresholds, and measured action
widths shared by Content and Actions.

**ARIA:** Root adds no role or ARIA attributes.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `openSide` | `"start" \| "end" \| null` | - |
| `defaultOpenSide` | `"start" \| "end" \| null` | `null` |
| `onOpenSideChange` | `(side: "start" \| "end" \| null) => void` | - |
| `onFullSwipe` | `(side: "start" \| "end") => void` | - |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `threshold` | `number` | `0.35` |
| `fullSwipeThreshold` | `number` | `0.6` |
| `dir` | `"ltr" \| "rtl"` | Direction context |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"swipeable-item"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | `"start" \| "end"` when open |
| `[data-dragging]` | Present while dragging |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |

| CSS variable | Description |
| --- | --- |
| `--atom-swipeable-item-offset` | Current content offset |
| `--atom-swipeable-item-start-size` | Measured start action width |
| `--atom-swipeable-item-end-size` | Measured end action width |

### Content

Renders the focusable row surface that interprets horizontal pointer movement
and keyboard commands. It mirrors Root state and remains focusable when read-only.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `tabIndex` | `number` | `0` |

| ARIA attribute | Values |
| --- | --- |
| `aria-disabled` | `true` when Root is disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"swipeable-item-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | `"start" \| "end"` when open |
| `[data-dragging]` | Present while dragging |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |

### Actions

Groups the controls revealed on one logical side. Closed panels are both
`aria-hidden` and inert, so their controls cannot be reached accidentally.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `side` | `"start" \| "end"` | Required |
| `aria-label` | `string` | `"<side> actions"` |
| `closeOnClick` | `boolean` | `true` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |
| `aria-label` | Explicit label or `"start actions"` / `"end actions"` |
| `aria-hidden` | `true` while the panel is closed |
| `inert` | Present while the panel is closed |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"swipeable-item-actions"` |
| `[data-side]` | `"start" \| "end"` |
| `[data-state]` | `"open" \| "closed"` |

Advanced parts can use `useSwipeableItemContext` and its public provider. The
exported side, size, offset, clamping, and direction helpers expose Root's
direction-aware calculations.

## Examples

### Two-sided actions

```tsx
import { SwipeableItem } from "@flowstack-ui/atom";

export default function MessageActions() {
  return (
<SwipeableItem.Root>
  <SwipeableItem.Actions side="start">
    <button type="button">Archive</button>
  </SwipeableItem.Actions>
  <SwipeableItem.Content>Email from Alex</SwipeableItem.Content>
  <SwipeableItem.Actions side="end">
    <button type="button">Delete</button>
  </SwipeableItem.Actions>
</SwipeableItem.Root>
  );
}
```

### Full-swipe action

```tsx
import { SwipeableItem } from "@flowstack-ui/atom";

export default function FullSwipeAction() {
  return (
<SwipeableItem.Root onFullSwipe={(side) => window.alert(`Full swipe: ${side}`)}>
  <SwipeableItem.Actions side="end">
    <button type="button">Delete</button>
  </SwipeableItem.Actions>
  <SwipeableItem.Content>Message</SwipeableItem.Content>
</SwipeableItem.Root>
  );
}
```

## Accessibility

SwipeableItem provides equivalent pointer and keyboard operation rather than a
special WAI-ARIA widget role. Content is keyboard focusable. Arrow keys open, close, and can
full-swipe action panels when `onFullSwipe` is provided. `Escape` closes the
item. Hidden action panels are removed from the accessibility tree and made
inert until open.

| Key | Description |
| --- | --- |
| `ArrowLeft` / `ArrowRight` | Opens a direction-aware action side. When a side is open, the opposite arrow closes it. Pressing the same arrow again triggers `onFullSwipe` when available. |
| `Escape` | Closes an open item. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
