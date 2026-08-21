# DragDrop

Headless same-document drag-and-drop primitives that own pointer and keyboard
input, source and target registration, cancellation, and accessible
announcements. `DragDrop` is a behavioral foundation for component authors; it
does not choose an application's movement rules or visual presentation.

## When to Use

Use `DragDrop` when building a collection-specific movement component such as
a Kanban board or another interface whose rules do not fit a linear list. Use
[`Reorder`](../reorder/README.md) when a user only arranges one ordered list.
Do not use this primitive for automatic data sorting, native file transfer, or
freeform canvas coordinates.

## Features

- Mouse and pen movement after a distance threshold.
- Touch movement after a short hold with movement cancellation. The explicit
  Handle owns the gesture; the rest of the item and page remain scrollable.
- Keyboard pickup, movement, commit, and cancellation.
- Before/after linear targets and generic on-target drops.
- Release-based pointer completion and cancellation on invalid release.
- Localizable instructions and live announcements.
- Vertical and horizontal behavior with RTL-aware horizontal movement.
- Controlled lifecycle callbacks and stable behavior data attributes.

## Import

```tsx
import { DragDrop } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<DragDrop.Root>
  <DragDrop.DropTarget>
    <DragDrop.Draggable>
      <DragDrop.Handle />
    </DragDrop.Draggable>
  </DragDrop.DropTarget>
</DragDrop.Root>
```

## API Reference

### Root

Provides drag state, registries, input handling, instructions, and an assertive
live announcer. It renders no wrapping element; its children and two visually
hidden support nodes are siblings.

| Prop | Type | Default |
| --- | --- | --- |
| `instructions` | `string` | required |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `messages` | `DragDropMessages` | English defaults |
| `onDragStart` | `(details) => void` | - |
| `onDragMove` | `(details) => void` | - |
| `onDragEnd` | `(details) => void` | - |
| `onDragCancel` | `(details) => void` | - |

The generated announcer has `aria-live="assertive"` and `aria-atomic="true"`.

### DropTarget

Registers an element as a valid destination. It renders a `div` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `label` | `string` | required |
| `mode` | `"on" \| "before-after"` | `"on"` |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"drag-drop-drop-target"` |
| `[data-value]` | Target identity |
| `[data-drop-target]` | Present while targeted |
| `[data-drop-position]` | `"on"`, `"before"`, or `"after"` while targeted |
| `[data-disabled]` | Present when disabled |

### Draggable

Registers a labelled movement source and provides item context to its Handle.
It renders a `div` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `label` | `string` | required |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"drag-drop-draggable"` |
| `[data-value]` | Source identity |
| `[data-dragging]` | Present on the active source |
| `[data-disabled]` | Present when disabled |

During pointer movement, `--atom-drag-drop-x` and
`--atom-drag-drop-y` contain the source displacement in CSS pixels. Atom does
not apply a transform.

### Handle

Starts and controls movement. It renders a native `button` and must receive an
accessible name describing the item it moves.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-describedby` | Generated Root instruction ID |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"drag-drop-handle"` |
| `[data-value]` | Source identity |
| `[data-dragging]` | Present while controlling the active source |

## Examples

This generic example moves a source onto a destination. A finished interface
must also provide a visible simple-pointer alternative appropriate to its job.

```tsx
import { DragDrop } from "@flowstack-ui/atom";

export function DestinationExample() {
  return (
    <DragDrop.Root
      instructions="Press Space or Enter to pick up. Use the arrow keys to choose a target, then press Space or Enter to drop."
      onDragEnd={(details) => console.log(details)}
    >
      <DragDrop.DropTarget label="Review queue" value="review">
        Review queue
      </DragDrop.DropTarget>
      <DragDrop.Draggable label="Approval request" value="approval-request">
        Approval request
        <DragDrop.Handle aria-label="Move Approval request" />
      </DragDrop.Draggable>
    </DragDrop.Root>
  );
}
```

## Accessibility

There is no single WAI-ARIA drag-and-drop widget pattern. Atom keeps the handle
a native button, associates it with authored instructions, and announces
pickup, destination changes, drops, and cancellation. Consumers must provide
human labels, localize the instruction/message copy, preserve keyed focus, and
provide a visible operation that does not require a dragging movement, as
required by [WCAG 2.2 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements).

| Key | Description |
| --- | --- |
| `Space` / `Enter` | Picks up the source; commits while movement is active. |
| `Arrow Up` / `Arrow Down` | Moves among vertical targets. |
| `Arrow Left` / `Arrow Right` | Moves among horizontal targets and mirrors in RTL. |
| `Home` / `End` | Moves to the first or last target. |
| `Escape` | Cancels without committing. |

Pointer changes commit on release. `pointercancel` and release without a valid
target cancel the movement.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
