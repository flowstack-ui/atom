# Pagination

Headless pagination primitives with stable page range calculation.

## When to Use

Use Pagination when a large result set is divided into numbered pages and
people may move directly to a known page. Use a “Load more” action or infinite
list when page numbers do not help the task. Pagination controls navigation; it
does not fetch, sort, or filter the data for you.

## Features

- Renders a navigation landmark and ordered page list.
- Supports controlled and uncontrolled current page.
- Generates stable-length page ranges to reduce layout shift.
- Supports sibling and boundary page counts.
- Renders the calculated range through an optional `Items` shortcut.
- Supports previous, next, page item, and decorative ellipsis parts.
- Supports native URL-backed pagination through `getPageHref` without losing
  reload, sharing, Back/Forward, or modified-click behavior.
- Localizes generated page and direction labels from Root while preserving
  direct native `aria-label` overrides.

## Import

```tsx
import { Pagination } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Pagination.Root>
  <Pagination.List>
    <Pagination.Previous />
    <Pagination.Items />
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
| `previousAriaLabel` | `string` | `"Previous page"` |
| `nextAriaLabel` | `string` | `"Next page"` |
| `getItemAriaLabel` | `(details: PaginationItemLabelDetails) => string` | generated English label |
| `getPageHref` | `(details: PaginationPageHrefDetails) => string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | `"Pagination"` by default |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-root"` |
| `[data-disabled]` | Present when disabled |

When disabled, all pagination page changes are ignored and descendant controls
receive disabled state.

`getItemAriaLabel` receives `page`, `currentPage`, `totalPages`, and
`isCurrent`. It supplies labels to explicit and generated Items unless an Item
has its own native `aria-label`. `previousAriaLabel` and `nextAriaLabel` follow
the same precedence rule for their controls.

When `getPageHref` is present, Item, Previous, and Next render native anchors
instead of buttons. The callback receives the same page details as
`getItemAriaLabel`. Control `page` from the current route in this mode. Anchor
activation does not call `onPageChange`; the browser or router owns the route.
An application may progressively enhance ordinary clicks through each part's
`onClick`, but it must preserve modified clicks and the generated `href`.

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
`type="button"` by default, or an anchor when Root provides `getPageHref`.
`asChild`, `render`, native props, and refs target the inner control.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `target` | native anchor target | - |
| `rel` | native anchor relationship | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | `"Previous page"` by default |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-list-item"` on the outer `li`; `"pagination-previous"` on the inner control |
| `[data-direction]` | `"previous"` |
| `[data-disabled]` | Present when disabled or on first page |

`Previous` is disabled when `Root disabled` is true or the current page is the
first page. In link mode, a disabled Previous has no `href`, is removed from
sequential focus, and exposes `aria-disabled="true"`.

### Items

Renders the complete page and ellipsis range calculated by Root. It has no host
element. Each emitted Item or Ellipsis retains its own structural `li`.

| Prop | Type | Default |
| --- | --- | --- |
| `itemProps` | shared Item props except `page`, `children`, and `aria-label` | - |
| `ellipsisProps` | shared Ellipsis props | - |

Use `itemProps` and `ellipsisProps` for shared native attributes, composition,
slots, or classes. Root owns generated accessible labels so one shared Item
label cannot accidentally name every page identically.

### Item

Renders a page item. Renders an outer `li` and an inner `button` with
`type="button"` by default, or an anchor when Root provides `getPageHref`.
`asChild`, `render`, native props, and refs target the inner control.

| Prop | Type | Default |
| --- | --- | --- |
| `page` | `number` | required |
| `children` | `ReactNode` | page number |
| `target` | native anchor target | - |
| `rel` | native anchor relationship | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-current` | `"page"` when the item is active |
| `aria-label` | `"Go to page N"` or `"Page N, current page"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-list-item"` on the outer `li`; `"pagination-item"` on the inner control |
| `[data-state]` | `"active" \| "inactive"` |
| `[data-page]` | Page number |
| `[data-disabled]` | Present when disabled |

Items are disabled when `Root disabled` is true. In button mode, page changes
are clamped before state updates. In link mode, disabled Items have no `href`
and are removed from sequential focus.

### Ellipsis

Renders a decorative collapsed-page marker. Renders an outer `li` and an inner
`span` by default. The inner marker is hidden from assistive technology.
`asChild`, `render`, native props, and refs target the inner marker.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | `"…"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-list-item"` on the outer `li`; `"pagination-ellipsis"` on the inner marker |

### Next

Moves to the next page. Renders an outer `li` and an inner `button` with
`type="button"` by default, or an anchor when Root provides `getPageHref`.
`asChild`, `render`, native props, and refs target the inner control.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `target` | native anchor target | - |
| `rel` | native anchor relationship | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | `"Next page"` by default |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-list-item"` on the outer `li`; `"pagination-next"` on the inner control |
| `[data-direction]` | `"next"` |
| `[data-disabled]` | Present when disabled or on last page |

`Next` is disabled when `Root disabled` is true or the current page is the last
page. Link-mode boundary behavior matches Previous.

## Examples

### Basic Pagination

```tsx
import { Pagination } from "@flowstack-ui/atom";

export function BasicPagination() {
  return (
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
  );
}
```

### Use Generated Range

```tsx
import { useState } from "react";
import { Pagination } from "@flowstack-ui/atom";

export function ResultsPagination() {
  const [page, setPage] = useState(10);

  return (
    <Pagination.Root totalPages={20} page={page} onPageChange={setPage}>
      <Pagination.List>
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination.List>
    </Pagination.Root>
  );
}
```

### URL-Backed Results

```tsx
import { Pagination } from "@flowstack-ui/atom";

export function SearchPagination({ page, totalPages }) {
  return (
    <Pagination.Root
      page={page}
      totalPages={totalPages}
      getPageHref={({ page: destination }) =>
        `/search?q=payments&page=${destination}`
      }
    >
      <Pagination.List>
        <Pagination.Previous>Previous</Pagination.Previous>
        <Pagination.Items />
        <Pagination.Next>Next</Pagination.Next>
      </Pagination.List>
    </Pagination.Root>
  );
}
```

This mode renders real anchors. Do not compose anchors through `asChild` while
Root remains in button mode; that leaves button behavior on an anchor instead
of selecting the URL-backed contract.

### Localize Generated Labels

```tsx
import { Pagination } from "@flowstack-ui/atom";

export function LocalizedPagination() {
  return (
    <Pagination.Root
      totalPages={8}
      previousAriaLabel="Página anterior"
      nextAriaLabel="Página siguiente"
      getItemAriaLabel={({ page, isCurrent }) =>
        isCurrent ? `Página ${page}, página actual` : `Ir a la página ${page}`
      }
    >
      <Pagination.List>
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination.List>
    </Pagination.Root>
  );
}
```

## Accessibility

Pagination uses a named navigation landmark and native buttons. List renders
an ordered list. Previous, Next, Item, and Ellipsis each render their own list
item wrapper. The active item receives `aria-current="page"`.

Use `Items` for the standard generated range. Use `getPaginationRange` or
`usePaginationRange` for advanced rendering from the same algorithm. Advanced
compound parts can use `usePaginationContext`; its provider and context value
type are also public exports.

| Key | Description |
| --- | --- |
| `Tab` | Moves through previous, page, and next buttons using normal document order. |
| `Enter` / `Space` | Activates the focused pagination button. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
