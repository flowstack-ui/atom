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
- Preserves native vertical panning with an axis-compatible touch policy.
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
Atom applies `touch-action: pan-y` so vertical document or scroll-container
panning remains native. An authored `style.touchAction` can override that
default deliberately. Arrow-key reveal runs only while Content itself is the
keyboard target; interactive descendants retain their own Arrow behavior.

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
special WAI-ARIA widget role. Content is keyboard focusable. Arrow keys reveal and close panels; they never execute a full-swipe command. `Escape` closes the
item. Hidden action panels are removed from the accessibility tree and made
inert until open.

Swipe must remain an enhancement. Provide an obvious tap/click path to every
command, such as a visible overflow-menu trigger or persistent action. Keyboard
support alone is not the required single-pointer alternative to dragging.

| Key | Description |
| --- | --- |
| `ArrowLeft` / `ArrowRight` | Opens a direction-aware action side. When a side is open, either Arrow closes it. Descendant controls retain their keys. |
| `Escape` | Closes an open item. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Controller and gesture policy

Use `useSwipeableItem(options)` with `SwipeableItem.RootProvider value={controller}`
for external controls. `SwipeableItem.Context` exposes the same controller.
`open(side)`, `close()` and `reset()` request state changes; controlled owners
must accept them. Reset interrupts animated travel. `onSettle({ openSide, offset })`
reports completion, separately from `onOpenSideChange` requests.

The controller's `offset` is the CSS destination during settling and the direct
position during dragging. `getOffset()` reads the current rendered position;
`getProgress()` reads normalized reveal progress without per-frame React renders.
`dragging`, `settling` and `armedSide` distinguish interaction phases.

| Root / controller option | Default | Meaning |
| --- | --- | --- |
| `thresholds` | shared `threshold` | Per-side reveal fractions |
| `activationDistance` | 8 | Horizontal intent distance in CSS px |
| `velocityThreshold` | 0.5 | Recent velocity in px/ms that influences reveal |
| `resistance` | 0 | Bounded overtravel, range 0–1 |
| `fullSwipeSides` | legacy callback opt-in | Explicit eligible logical sides; [] disables |
| `closeOnOutsideClick` | false | Dismiss outside without blocking the destination |
| `closeOnContentClick` | false | Consume a content click to close |
| `motion` | default | Use authored CSS transition, or none |
| `onSettle` | — | Accepted target completion; superseded motion is canceled |

Full swipe requires a deliberate release, an eligible measured side and at
least 32px of pointer travel. Lost capture, cancellation, keyboard and
programmatic open never execute it. Always provide the same named command in a
visible non-swipe path. The application owns pending state, confirmation and undo.

Inputs, selects, textareas, editable content and `data-swipeable-ignore`
descendants retain gesture ownership. Ordinary links/buttons retain taps;
a recognized swipe suppresses only its resulting pointer click. Vertical
intent rejects the session. Disabled Content is not in the tab order;
read-only Content remains focusable. Closing an action panel returns its owned
focus to Content; opening another popup must retain that popup's focus.

Action clicks close only when an actual button, link or action-role control
was activated. Padding clicks do not close. Use `closeOnClick={false}` or
prevent the action event for application-owned async work.

Author CSS transform from `--atom-swipeable-item-offset`, remove transitions
during `data-dragging`, and honor reduced motion. Atom observes the transform
transition; do not add a second numeric animation driver. Root also exposes
`data-settling`, `data-armed="start|end"` and `data-motion`.
