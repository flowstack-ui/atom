# Virtualizer

Headless virtual collection measurement helpers for rendering only the visible part of large lists.

## Features

- Computes visible virtual items from item count, scroll offset, viewport size, and overscan.
- Supports measured item sizes with `ResizeObserver`.
- Supports stable item keys.
- Provides `scrollToOffset` and `scrollToIndex` helpers.
- Keeps DOM structure, ARIA roles, keyboard behavior, and styling in the component that uses it.

## Import

```tsx
import { useVirtualizer, getVirtualItems } from "@flowstack-ui/atom";
```

## Anatomy

Virtualizer is a hook and utility set, not a rendered component.

```tsx
const virtualizer = useVirtualizer({
  count: items.length,
  estimateSize: () => 40,
});

return (
  <div ref={virtualizer.scrollRef}>
    <div style={{ height: virtualizer.totalSize }}>
      {virtualizer.items.map((virtualItem) => (
        <div
          key={virtualItem.key}
          ref={virtualizer.getItemRef(virtualItem.index)}
        >
          {items[virtualItem.index]}
        </div>
      ))}
    </div>
  </div>
);
```

## API Reference

### useVirtualizer

Measures a scroll container and returns the visible item range.

| Option | Type | Default |
| --- | --- | --- |
| `count` | `number` | required |
| `estimateSize` | `(index: number) => number` | required |
| `overscan` | `number` | `1` |
| `getItemKey` | `(index: number) => string \| number` | item index |

| Return value | Type |
| --- | --- |
| `scrollRef` | `RefCallback<HTMLElement>` |
| `scrollElement` | `HTMLElement \| null` |
| `items` | `VirtualItem[]` |
| `totalSize` | `number` |
| `scrollOffset` | `number` |
| `viewportSize` | `number` |
| `measureElement` | `(index, element) => void` |
| `getItemRef` | `(index) => RefCallback<HTMLElement>` |
| `getItemSize` | `(index) => number` |
| `scrollToOffset` | `(offset) => void` |
| `scrollToIndex` | `(index, options?) => void` |

### getVirtualItems

Pure helper for computing visible virtual items.

| Option | Type | Default |
| --- | --- | --- |
| `count` | `number` | required |
| `scrollOffset` | `number` | required |
| `viewportSize` | `number` | required |
| `overscan` | `number` | `1` |
| `getItemSize` | `(index: number) => number` | required |
| `getItemKey` | `(index: number) => string \| number` | item index |

### VirtualItem

| Property | Type |
| --- | --- |
| `index` | `number` |
| `key` | `string \| number` |
| `start` | `number` |
| `end` | `number` |
| `size` | `number` |

## Examples

### Basic List

```tsx
function VirtualList({ items }: { items: string[] }) {
  const virtualizer = useVirtualizer({
    count: items.length,
    estimateSize: () => 44,
    overscan: 4,
  });

  return (
    <div ref={virtualizer.scrollRef} tabIndex={0}>
      <div style={{ height: virtualizer.totalSize, position: "relative" }}>
        {virtualizer.items.map((virtualItem) => (
          <div
            key={virtualItem.key}
            ref={virtualizer.getItemRef(virtualItem.index)}
            style={{
              position: "absolute",
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Scroll To Index

```tsx
<button type="button" onClick={() => virtualizer.scrollToIndex(50)}>
  Jump to item 51
</button>
```

## Accessibility

Virtualizer does not create semantics by itself. The scroll container and rendered items must still use the correct semantic component for the UI being built.

- Add keyboard access to scroll containers when needed, such as `tabIndex={0}`.
- Preserve correct `aria-setsize`, `aria-posinset`, row indexes, or list semantics when virtualizing semantic collections.
- Keep focusable active items mounted, or move focus before removing an item from the DOM.

## Data Attributes

Virtualizer does not render DOM and does not emit data attributes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
