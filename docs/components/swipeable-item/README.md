# SwipeableItem

Headless swipe actions for list-like items.

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

Contains swipe state and action measurements.

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

Focusable swipe surface.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `tabIndex` | `number` | `0` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"swipeable-item-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | `"start" \| "end"` when open |
| `[data-dragging]` | Present while dragging |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |

### Actions

Action panel revealed from one side.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `side` | `"start" \| "end"` | Required |
| `aria-label` | `string` | `"<side> actions"` |
| `closeOnClick` | `boolean` | `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"swipeable-item-actions"` |
| `[data-side]` | `"start" \| "end"` |
| `[data-state]` | `"open" \| "closed"` |

## Examples

### Two-sided actions

```tsx
<SwipeableItem.Root>
  <SwipeableItem.Actions side="start">
    <button type="button">Archive</button>
  </SwipeableItem.Actions>
  <SwipeableItem.Content>Email from Alex</SwipeableItem.Content>
  <SwipeableItem.Actions side="end">
    <button type="button">Delete</button>
  </SwipeableItem.Actions>
</SwipeableItem.Root>
```

### Full-swipe action

```tsx
<SwipeableItem.Root onFullSwipe={(side) => console.log(side)}>
  <SwipeableItem.Actions side="end">
    <button type="button">Delete</button>
  </SwipeableItem.Actions>
  <SwipeableItem.Content>Message</SwipeableItem.Content>
</SwipeableItem.Root>
```

## Accessibility

`SwipeableItem.Content` is keyboard focusable. Arrow keys open, close, and can
full-swipe action panels when `onFullSwipe` is provided. `Escape` closes the
item. Hidden action panels are removed from the accessibility tree and made
inert until open.

| Key | Description |
| --- | --- |
| `ArrowLeft` / `ArrowRight` | Opens a direction-aware action side. When a side is open, the opposite arrow closes it. Pressing the same arrow again triggers `onFullSwipe` when available. |
| `Escape` | Closes an open item. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
