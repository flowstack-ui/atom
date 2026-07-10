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
<Pagination.Root>
  <Pagination.List>
    <Pagination.Previous />
    <Pagination.Item />
    <Pagination.Ellipsis />
    <Pagination.Next />
  </Pagination.List>
</Pagination.Root>
```

## API Reference

### Root

Contains pagination state. Renders a `nav` by default. If `totalPages` is `0`
or negative, `Root` returns `null` and no pagination DOM is rendered.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
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

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | `"Pagination"` by default |

When disabled, all pagination page changes are ignored and descendant controls
receive disabled state.

### List

Renders the ordered page list. Renders an `ol` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-list"` |

### Previous

Moves to the previous page. Renders an outer `li` and an inner `button` with
`type="button"` by default. `asChild`, `render`, native props, and refs target
the inner control.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-list-item"` on the outer `li`; `"pagination-previous"` on the inner control |
| `[data-direction]` | `"previous"` |
| `[data-disabled]` | Present when disabled or on first page |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | `"Previous page"` by default |

`Previous` is disabled when `Root disabled` is true or the current page is the
first page.

### Next

Moves to the next page. Renders an outer `li` and an inner `button` with
`type="button"` by default. `asChild`, `render`, native props, and refs target
the inner control.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-list-item"` on the outer `li`; `"pagination-next"` on the inner control |
| `[data-direction]` | `"next"` |
| `[data-disabled]` | Present when disabled or on last page |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | `"Next page"` by default |

`Next` is disabled when `Root disabled` is true or the current page is the last
page.

### Item

Renders a page item. Renders an outer `li` and an inner `button` with
`type="button"` by default. `asChild`, `render`, native props, and refs target
the inner control.

| Prop | Type | Default |
| --- | --- | --- |
| `page` | `number` | required |
| `children` | `ReactNode` | page number |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-list-item"` on the outer `li`; `"pagination-item"` on the inner control |
| `[data-state]` | `"active" \| "inactive"` |
| `[data-page]` | Page number |
| `[data-disabled]` | Present when disabled |

| ARIA attribute | Values |
| --- | --- |
| `aria-current` | `"page"` when the item is active |
| `aria-label` | `"Go to page N"` or `"Page N, current page"` |

Items are disabled when `Root disabled` is true. Page changes are clamped to
the valid range before state updates.

### Ellipsis

Renders a decorative collapsed-page marker. Renders an outer `li` and an inner
`span` by default. The inner marker is hidden from assistive technology.
`asChild`, `render`, native props, and refs target the inner marker.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | `"…"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-list-item"` on the outer `li`; `"pagination-ellipsis"` on the inner marker |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `true` |

## Examples

### Basic Pagination

```tsx
<Pagination.Root totalPages={10} defaultPage={1}>
  <Pagination.List>
    <Pagination.Previous>Previous</Pagination.Previous>
    <Pagination.Item page={1} />
    <Pagination.Item page={2} />
    <Pagination.Ellipsis />
    <Pagination.Item page={10} />
    <Pagination.Next>Next</Pagination.Next>
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

Root renders a navigation landmark. List renders an ordered list. Previous,
Next, Item, and Ellipsis each render their own list item wrapper. The active
item receives `aria-current="page"`.

| Key | Description |
| --- | --- |
| `Tab` | Moves through previous, page, and next buttons using normal document order. |
| `Enter` / `Space` | Activates the focused pagination button. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
