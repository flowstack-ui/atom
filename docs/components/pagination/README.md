# Pagination

Headless pagination primitives with stable page range calculation.

## Features

- Renders a navigation landmark and ordered page list.
- Supports controlled and uncontrolled current page.
- Generates stable-length page ranges to reduce layout shift.
- Supports sibling and boundary page counts.
- Supports previous, next, page item, and decorative ellipsis parts.
- Allows localized page labels through native `aria-label`.

## Import

```tsx
import { Pagination } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Pagination.Root totalPages={10}>
  <Pagination.List>
    <li>
      <Pagination.Previous />
    </li>
    <li>
      <Pagination.Item page={1} />
    </li>
    <li>
      <Pagination.Ellipsis />
    </li>
    <li>
      <Pagination.Next />
    </li>
  </Pagination.List>
</Pagination.Root>
```

## API Reference

### Root

Contains pagination state.

| Prop | Type | Default |
| --- | --- | --- |
| `totalPages` | `number` | required |
| `page` | `number` | - |
| `defaultPage` | `number` | `1` |
| `onPageChange` | `(page: number) => void` | - |
| `siblingCount` | `number` | `1` |
| `boundaryCount` | `number` | `1` |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-root"` |
| `[data-disabled]` | Present when disabled |

### List

Renders the ordered page list.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-list"` |

### Previous

Moves to the previous page.

| Prop | Type | Default |
| --- | --- | --- |
| `aria-label` | `string` | `"Previous page"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-previous"` |
| `[data-direction]` | `"previous"` |
| `[data-disabled]` | Present when disabled or on first page |

### Next

Moves to the next page.

| Prop | Type | Default |
| --- | --- | --- |
| `aria-label` | `string` | `"Next page"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-next"` |
| `[data-direction]` | `"next"` |
| `[data-disabled]` | Present when disabled or on last page |

### Item

Renders a page button.

| Prop | Type | Default |
| --- | --- | --- |
| `page` | `number` | required |
| `aria-label` | `string` | `"Go to page N"` or `"Page N, current page"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-item"` |
| `[data-state]` | `"active" \| "inactive"` |
| `[data-page]` | Page number |
| `[data-disabled]` | Present when disabled |

### Ellipsis

Renders a decorative collapsed-page marker.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-ellipsis"` |

## Examples

### Basic Pagination

```tsx
<Pagination.Root totalPages={10} defaultPage={1}>
  <Pagination.List>
    <li><Pagination.Previous>Previous</Pagination.Previous></li>
    <li><Pagination.Item page={1} /></li>
    <li><Pagination.Item page={2} /></li>
    <li><Pagination.Ellipsis /></li>
    <li><Pagination.Item page={10} /></li>
    <li><Pagination.Next>Next</Pagination.Next></li>
  </Pagination.List>
</Pagination.Root>
```

### Use Generated Range

```tsx
import { Pagination, getPaginationRange } from "@flowstack-ui/atom";

const range = getPaginationRange({
  totalPages: 20,
  currentPage: 10,
});
```

### Localized Labels

```tsx
<Pagination.Item page={5} aria-label="Pagina 5" />
```

## Accessibility

Root renders a navigation landmark. List renders an ordered list. The active item receives `aria-current="page"`.

| Key | Description |
| --- | --- |
| `Tab` | Moves through previous, page, and next buttons using normal document order. |
| `Enter` / `Space` | Activates the focused pagination button. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
