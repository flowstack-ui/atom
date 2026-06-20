# Collection

Headless DOM-ordered collection helpers for composite widgets.

## Features

- Registers items by stable value and DOM element.
- Sorts items by live document order.
- Tracks disabled state and custom item metadata.
- Provides first, last, next, previous, enabled, and raw item lookup helpers.
- Warns in development when duplicate values are registered.
- Keeps roles, keyboard behavior, and rendered structure in the component that uses the collection.

## Import

```tsx
import { useCollection, getNextCollectionItem } from "@flowstack-ui/atom";
```

## Anatomy

Collection is a hook and utility set, not a rendered component.

```tsx
const collection = useCollection<string, HTMLButtonElement>();

collection.registerItem("settings", buttonElement, {
  disabled: false,
});

const next = collection.getNextItem("settings", "next");
```

## API Reference

### useCollection

Creates a mutable collection registry with a version signal for React renders.

| Return value | Type |
| --- | --- |
| `version` | `number` |
| `registerItem` | `(value, element, options?) => void` |
| `unregisterItem` | `(value) => void` |
| `updateItem` | `(value, options) => void` |
| `getItem` | `(value) => CollectionItem \| null` |
| `getItems` | `() => CollectionItem[]` |
| `getValues` | `() => string[]` |
| `getEnabledItems` | `() => CollectionItem[]` |
| `getFirstItem` | `(includeDisabled?) => CollectionItem \| null` |
| `getLastItem` | `(includeDisabled?) => CollectionItem \| null` |
| `getNextItem` | `(value, direction, options?) => CollectionItem \| null` |
| `clearItems` | `() => void` |

### CollectionItem

| Property | Type |
| --- | --- |
| `value` | `string` |
| `element` | `HTMLElement` |
| `disabled` | `boolean` |
| `data` | `Record<string, unknown>` |

### getNextCollectionItem

Pure helper for moving through a collection.

| Option | Type | Default |
| --- | --- | --- |
| `loop` | `boolean` | `true` |
| `includeDisabled` | `boolean` | `false` |

## Examples

### Roving Focus

```tsx
function ToolbarItems() {
  const collection = useCollection<string, HTMLButtonElement>();
  const [activeValue, setActiveValue] = React.useState("bold");

  function move(direction: "next" | "previous") {
    const next = collection.getNextItem(activeValue, direction, { loop: true });
    if (!next) return;
    setActiveValue(next.value);
    next.element.focus();
  }

  return actions.map((action) => (
    <button
      key={action.value}
      ref={(element) => {
        if (element) {
          collection.registerItem(action.value, element, {
            disabled: action.disabled,
          });
        } else {
          collection.unregisterItem(action.value);
        }
      }}
      tabIndex={activeValue === action.value ? 0 : -1}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") move("next");
        if (event.key === "ArrowLeft") move("previous");
      }}
    >
      {action.label}
    </button>
  ));
}
```

### Custom Metadata

```tsx
const collection = useCollection<
  string,
  HTMLDivElement,
  { rowIndex: number; columnIndex: number }
>();
```

## Accessibility

Collection does not add ARIA. It is infrastructure for components that need DOM-ordered registration, roving focus, active descendant lookup, or keyboard navigation.

Use it with the WAI-ARIA pattern for the component you are building.

## Data Attributes

Collection does not render DOM and does not emit data attributes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
