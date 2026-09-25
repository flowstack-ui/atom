# Reorder

## Drag feedback and activation

Root accepts `activation={{ distance: 6, touchDelay: 220, touchTolerance: 8 }}`
and `autoScroll` (default true). Values are finite non-negative CSS pixels or
milliseconds. Edge scrolling stays within eligible ancestors; list gaps resolve
to the nearest insertion target, while release outside the collection cancels.

Add `Reorder.Preview` inside Root, with passive children or a `(value) => ReactNode`
render function. It portals to the source document body by default; `container`
may select another same-document host. It is inert, aria-hidden and ignores
pointer events. The real Item remains mounted and retains keyboard focus.
Do not render a second Item/Handle tree in the preview. A preview inside a
modal/top-layer or transformed host requires qualified portal placement.

Reorder items expose measured `--atom-reorder-x`/`--atom-reorder-y` deltas;
the styled layer may apply these with CSS translate and its own motion policy.
`data-reorder-measuring` marks the non-animated measurement phase. Atom does not
choose animation duration, easing, colors or elevation. A source with an active
preview exposes `data-previewing`; keep its layout box and focus owner intact.

Headless primitives for manually arranging one controlled ordered collection.
`Reorder` composes `DragDrop` with ordered-list semantics, identity-array
updates, keyboard movement, and direct single-activation movement controls.

## When to Use

Use `Reorder` when a person decides and saves the order of items in one list.
Do not use it for automatic sorting by name, date, or status. Tables, trees,
Kanban boards, and movement between containers need component-specific APIs
that may reuse `DragDrop` internally.

## Features

- Controlled stable-identity order.
- Native ordered-list and list-item defaults.
- Mouse, pen, delayed-touch, and keyboard reordering.
- Direct move before, after, to start, and to end controls.
- Localizable instructions and live announcements.
- Disabled, read-only, per-item disabled, vertical, horizontal, and RTL modes.
- Drop-position state for styled layers without Atom-owned visuals.

## Import

```tsx
import { Reorder } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Reorder.Root>
  <Reorder.Item>
    <Reorder.Handle />
    <Reorder.MoveBefore />
    <Reorder.MoveAfter />
    <Reorder.MoveToStart />
    <Reorder.MoveToEnd />
    <Reorder.DropIndicator />
  </Reorder.Item>
</Reorder.Root>
```

## API Reference

### Root

Owns the controlled identity order and renders an `ol` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `items` | `string[]` | required |
| `onItemsChange` | `(items, details) => void` | required |
| `getItemLabel` | `(value) => string` | required |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `layout` | `"linear" \| "grid"` | `"linear"` |
| `displacement` | `"auto" \| "none"` | `"auto"` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `instructions` | `string` | English keyboard instructions |
| `messages` | `DragDropMessages` | English defaults |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"reorder"` |
| `[data-orientation]` | `"vertical"` or `"horizontal"` |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |

`onItemsChange` details include `activeValue`, `overValue`, `position`,
`previousIndex`, `nextIndex`, and `input` (`keyboard`, `pointer`, or `control`).

### Item

Registers one stable identity and renders an `li` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `disabled` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"reorder-item"` |
| `[data-value]` | Item identity |
| `[data-dragging]` | Present while active |
| `[data-drop-target]` | Present while targeted |
| `[data-drop-position]` | `"before"` or `"after"` while targeted |
| `[data-disabled]` | Present when disabled |

### Handle

Native button that starts and controls dragging. It must receive an accessible
name such as `Move Verify production`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-describedby` | Generated instruction ID |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"reorder-handle"` |
| `[data-dragging]` | Present while active |

### MoveBefore

Native button that immediately moves the Item one logical position earlier.
It disables at the first boundary.

### MoveAfter

Native button that immediately moves the Item one logical position later. It
disables at the last boundary.

### MoveToStart

Native button that immediately moves the Item to the first position.

### MoveToEnd

Native button that immediately moves the Item to the last position.

All movement buttons accept native button props, `asChild`, `render`, and
consumer content. They emit `[data-slot]` and `[data-move]`, and require an
authored accessible name.

### DropIndicator

Decorative `span` that exposes the proposed insertion position.

| Prop | Type | Default |
| --- | --- | --- |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"reorder-drop-indicator"` |
| `[data-state]` | `"active"` or `"inactive"` |
| `[data-position]` | `"before"` or `"after"` while active |

## Examples

```tsx
import { useState } from "react";
import { Reorder } from "@flowstack-ui/atom";

const labels: Record<string, string> = {
  verify: "Verify production",
  approve: "Request approval",
  deploy: "Deploy release",
};

export function ReorderExample() {
  const [items, setItems] = useState(["verify", "approve", "deploy"]);

  return (
    <Reorder.Root
      items={items}
      getItemLabel={(value) => labels[value] ?? value}
      onItemsChange={(nextItems) => setItems(nextItems)}
    >
      {items.map((value) => (
        <Reorder.Item key={value} value={value}>
          <Reorder.Handle aria-label={`Move ${labels[value]}`}>
            Move
          </Reorder.Handle>
          <span>{labels[value]}</span>
          <Reorder.MoveBefore aria-label={`Move ${labels[value]} up`}>Up</Reorder.MoveBefore>
          <Reorder.MoveAfter aria-label={`Move ${labels[value]} down`}>Down</Reorder.MoveAfter>
          <Reorder.DropIndicator />
        </Reorder.Item>
      ))}
    </Reorder.Root>
  );
}
```

## Accessibility

`Root` and `Item` use native ordered-list semantics. Handles and movement
operations are native buttons. The handle receives generated instructions and
Root announces movement with human labels and one-based positions. Keep
movement buttons visibly available: they are the simple-pointer alternative
required by [WCAG 2.2 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements).

| Key | Description |
| --- | --- |
| `Space` / `Enter` | Picks up from a Handle; commits while active. |
| `Arrow Up` / `Arrow Down` | Moves within a vertical list. |
| `Arrow Left` / `Arrow Right` | Moves within a horizontal list and mirrors in RTL. |
| `Home` / `End` | Moves to the first or last position. |
| `Escape` | Cancels without changing the identity order. |

Use stable record IDs as `value`, render Items in the exact order supplied to
Root, and preserve those keys after updates so focus remains on the moved
control. Applications own persistence, Undo, failures, and conflicts.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Wrapping layouts

Set `layout="grid"` for row-major CSS Grid or wrapping Flex layouts. `orientation` applies to linear layouts only. Grid pickup uses all four arrow keys spatially, with Home/End selecting the collection boundaries. The native ordered list semantics and controlled identity order remain unchanged.

Automatic displacement measures both axes without moving DOM nodes during hover. Item sizes must follow item identity, not nth-child or other index-dependent rules. Use `displacement="none"` for index-dependent sizing or unsupported layouts; the insertion indicator and committed order still work. Dense grids, spans, masonry, reverse/author CSS order, virtualized collections, scaled ancestors and vertical writing modes are outside automatic projection. Resize is remeasured; reduced motion is a presentation responsibility.

Active draggable items and handles expose `data-drag-input="pointer"` or `"keyboard"` alongside `data-dragging`; the input attribute is absent when idle. Styled owners can distinguish pointer-only feedback from keyboard movement without owning another drag lifecycle.
