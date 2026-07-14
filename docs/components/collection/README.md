# Collection

Headless utilities for registering elements by value and navigating them in
document order.

## When to Use

Use Collection when building another headless component whose items mount,
unmount, reorder, or become disabled and you need one reliable registry for
keyboard navigation. Do not use it just to render an ordinary list; React and
native list elements are simpler when no composite behavior is required.

## Features

- Registers, updates, looks up, and removes value-keyed elements.
- Returns items in current document order rather than registration order.
- Tracks disabled state and arbitrary typed item data.
- Provides first, last, next, and previous navigation helpers.
- Handles looping and optional inclusion of disabled items.
- Renders no DOM and assigns no accessibility semantics.

## Import

```tsx
import {
  getNextCollectionItem,
  sortCollectionItemsByDocumentOrder,
  useCollection,
} from "@flowstack-ui/atom";
```

## Anatomy

```tsx
useCollection()
getNextCollectionItem()
sortCollectionItemsByDocumentOrder()
```

## API Reference

### useCollection

Creates a stable registry whose returned items are sorted by connected DOM
position. The hook is generic over string values, element type, and item data.

```ts
useCollection<
  Value extends string,
  Element extends HTMLElement,
  Data extends Record<string, unknown>
>(): UseCollectionReturn<Value, Element, Data>
```

| Method | Signature | Description |
| --- | --- | --- |
| `registerItem` | `(value, element, options?) => void` | Adds or replaces an item. Options accept `disabled` and `data`. |
| `unregisterItem` | `(value) => void` | Removes an item by value. |
| `updateItem` | `(value, options) => void` | Updates disabled state or data for an existing item. |
| `getItem` | `(value) => CollectionItem \| undefined` | Returns one registered item. |
| `getItems` | `() => CollectionItem[]` | Returns all items in document order. |
| `getValues` | `() => Value[]` | Returns ordered values. |
| `getEnabledItems` | `() => CollectionItem[]` | Returns ordered items that are not disabled. |
| `getFirstItem` | `(options?) => CollectionItem \| null` | Returns the first eligible item. |
| `getLastItem` | `(options?) => CollectionItem \| null` | Returns the last eligible item. |
| `getNextItem` | `(value, direction?, options?) => CollectionItem \| null` | Moves forward or backward from a value. |
| `clearItems` | `() => void` | Removes every item. |

`registerItem` defaults `disabled` to `false` and `data` to an empty object.
Connected elements sort before disconnected elements. In development, a
duplicate connected value produces a warning because values must be unique.

### getNextCollectionItem

Finds the next or previous eligible item in an already ordered item array.

```ts
getNextCollectionItem(items, value, direction?, options?)
```

| Parameter | Type | Default |
| --- | --- | --- |
| `items` | `CollectionItem[]` | required |
| `value` | `string` | required |
| `direction` | `"next" \| "previous"` | `"next"` |
| `options.loop` | `boolean` | `true` |
| `options.includeDisabled` | `boolean` | `false` |

When `value` is missing, looping starts at the first or last eligible item;
without looping it returns `null`.

### sortCollectionItemsByDocumentOrder

Returns a new array sorted by each element's current document position. The
input array is not mutated. Connected elements appear before disconnected
elements, whose relative order remains stable.

```ts
sortCollectionItemsByDocumentOrder(items): CollectionItem[]
```

## Examples

### Register a Navigable List

```tsx
import { useEffect, useRef } from "react";
import { useCollection } from "@flowstack-ui/atom";

const actions = ["copy", "paste", "delete"] as const;

function Action({
  value,
  registerItem,
  unregisterItem,
}: {
  value: string;
  registerItem: (value: string, element: HTMLButtonElement) => void;
  unregisterItem: (value: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    registerItem(value, element);
    return () => unregisterItem(value);
  }, [registerItem, unregisterItem, value]);

  return <button ref={ref}>{value}</button>;
}

export function ActionList() {
  const collection = useCollection<string, HTMLButtonElement>();

  function focusNext(value: string) {
    collection.getNextItem(value)?.element.focus();
  }

  return (
    <div>
      {actions.map((action) => (
        <Action
          key={action}
          value={action}
          registerItem={collection.registerItem}
          unregisterItem={collection.unregisterItem}
        />
      ))}
      <button onClick={() => focusNext("copy")}>Focus after Copy</button>
    </div>
  );
}
```

## Accessibility

Collection renders nothing, supplies no roles or labels, and owns no keyboard
events. The component built with it must implement the correct native or
WAI-ARIA pattern, focus model, and keys. Disabled filtering in Collection is a
navigation tool; it does not expose `aria-disabled` on the registered element.
Collection emits no Data attributes because it never creates an element.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
