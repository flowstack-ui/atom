# Virtualizer

Headless virtual collection measurement helpers for rendering only the visible part of large lists.

## When to Use

Use `Virtualizer` when a very long list would create too many DOM elements and
slow the page down. Keep a normal semantic list when the collection is small;
virtualization adds measurement, positioning, focus, and accessibility work
that is unnecessary for ordinary lists.

## Features

- Computes visible virtual items from item count, scroll offset, viewport size, and overscan.
- Supports measured item sizes with `ResizeObserver`.
- Supports stable item keys.
- Provides `scrollToOffset` and `scrollToIndex` helpers.
- Keeps DOM structure, ARIA roles, keyboard behavior, and styling in the component that uses it.

## Import

```tsx
import {
  useVirtualizer,
  getVirtualItems,
  getVirtualOffsetForIndex,
  getVirtualScrollOffsetForIndex,
  getVirtualTotalSize,
} from "@flowstack-ui/atom";
```

## Anatomy

Virtualizer is a hook and utility set, not a rendered component.

```tsx
useVirtualizer({ count, estimateSize });
virtualizer.scrollToIndex(index, { align });
getVirtualItems(options);
getVirtualTotalSize(count, getItemSize);
getVirtualOffsetForIndex(count, index, getItemSize);
getVirtualScrollOffsetForIndex(options);
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

### scrollToIndex

Scrolls the registered element just enough to reveal an item, or aligns it to
the requested viewport position.

| Option | Type | Default |
| --- | --- | --- |
| `align` | `"start" \| "center" \| "end" \| "auto"` | `"auto"` |

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

### getVirtualTotalSize

Pure helper for computing the total scrollable size.

| Argument | Type |
| --- | --- |
| `count` | `number` |
| `getItemSize` | `(index: number) => number` |

### getVirtualOffsetForIndex

Pure helper for computing the starting offset of an item.

| Argument | Type |
| --- | --- |
| `count` | `number` |
| `index` | `number` |
| `getItemSize` | `(index: number) => number` |

### getVirtualScrollOffsetForIndex

Pure helper for computing the scroll offset needed to reveal an item.

| Option | Type | Default |
| --- | --- | --- |
| `count` | `number` | required |
| `index` | `number` | required |
| `align` | `"start" \| "center" \| "end" \| "auto"` | `"auto"` |
| `scrollOffset` | `number` | required |
| `viewportSize` | `number` | required |
| `getItemSize` | `(index: number) => number` | required |

### VirtualItem

Describes one rendered window item and its coordinates in the full collection.

| Property | Type |
| --- | --- |
| `index` | `number` |
| `key` | `string \| number` |
| `start` | `number` |
| `end` | `number` |
| `size` | `number` |

## Examples

### Basic List

The inline height, overflow, and positioning values are required geometry for
virtualization; they are not Atom component styles.

```tsx
import { useCallback } from "react";
import { useVirtualizer } from "@flowstack-ui/atom";

const items = Array.from({ length: 1_000 }, (_, index) => `Item ${index + 1}`);

export default function VirtualList() {
  const estimateSize = useCallback(() => 44, []);
  const virtualizer = useVirtualizer({
    count: items.length,
    estimateSize,
    overscan: 4,
  });

  return (
    <>
      <button type="button" onClick={() => virtualizer.scrollToIndex(500)}>
        Jump to item 501
      </button>
      <div
        ref={virtualizer.scrollRef}
        role="list"
        tabIndex={0}
        style={{ height: 320, overflow: "auto" }}
      >
        <div style={{ height: virtualizer.totalSize, position: "relative" }}>
          {virtualizer.items.map((virtualItem) => (
            <div
              key={virtualItem.key}
              ref={virtualizer.getItemRef(virtualItem.index)}
              role="listitem"
              aria-posinset={virtualItem.index + 1}
              aria-setsize={items.length}
              style={{
                position: "absolute",
                top: 0,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {items[virtualItem.index]}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
```

## Accessibility

Virtualizer does not create semantics by itself. The scroll container and rendered items must still use the correct semantic component for the UI being built.

- Add keyboard access to scroll containers when needed, such as `tabIndex={0}`.
- Preserve correct `aria-setsize`, `aria-posinset`, row indexes, or list semantics when virtualizing semantic collections.
- Keep focusable active items mounted, or move focus before removing an item from the DOM.
- Data attributes: Virtualizer renders no wrapper and adds no data attributes,
  roles, or ARIA attributes.
- Native scrolling supplies keyboard scrolling when the consumer makes the
  scroll container focusable.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
