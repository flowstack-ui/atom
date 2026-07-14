# Table

Headless native table anatomy with caption, sections, rows, cells, and sortable header metadata.

## When to Use

Use `Table` for information arranged in rows and columns where the column
relationships help people compare values. Use `DataGrid` when cells themselves
need selection or spreadsheet-like keyboard navigation, and use `List` when
there is no meaningful column structure.

## Features

- Renders native table semantics.
- Provides all standard table structural parts.
- Supports `aria-sort` and `data-sort` on header cells.
- Leaves sorting, filtering, selection, and keyboard grid behavior to higher-level primitives.
- Stays server-safe with no client boundary.

## Import

```tsx
import { Table } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Table.Root>
  <Table.Caption />
  <Table.Header>
    <Table.Row>
      <Table.Head />
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell />
    </Table.Row>
  </Table.Body>
  <Table.Footer />
</Table.Root>
```

## API Reference

### Root

Renders the native `table` that establishes relationships between all nested
headers and cells. Native table props pass through.

**ARIA:** Root relies on native table semantics and adds no ARIA attributes.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"table"` |

### Caption

Provides the table's visible accessible name and renders `caption`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Caption uses native caption semantics.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"table-caption"` |

### Header

Groups the header rows and renders `thead`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Header uses native table-section semantics.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"table-header"` |

### Row

Groups Head or Cell parts and renders `tr`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Row uses native table-row semantics.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"table-row"` |

### Head

Renders a native `th`.

| Prop | Type | Default |
| --- | --- | --- |
| `scope` | native `scope` | `"col"` |
| `sortDirection` | `"ascending" \| "descending" \| "none" \| "other"` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-sort` | Value from `sortDirection` when provided |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"table-head"` |
| `[data-sort]` | `"ascending" \| "descending" \| "none" \| "other"` |

### Body

Groups the primary data rows and renders `tbody`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Body uses native table-section semantics.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"table-body"` |

### Cell

Renders a native `td` associated with its row and applicable headers.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Cell uses native table-cell semantics.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"table-cell"` |

### Footer

Groups summary rows and renders `tfoot`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Footer uses native table-section semantics.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"table-footer"` |

## Examples

### Sort Metadata

```tsx
import { Table } from "@flowstack-ui/atom";

export default function SortableTable() {
  return (
    <Table.Root>
      <Table.Caption>Team members</Table.Caption>
      <Table.Header><Table.Row><Table.Head sortDirection="ascending"><button type="button">Name</button></Table.Head></Table.Row></Table.Header>
      <Table.Body><Table.Row><Table.Cell>Ada</Table.Cell></Table.Row></Table.Body>
    </Table.Root>
  );
}
```

For interactive sorting, put a button or pressable control inside the header cell and keep `sortDirection` as the accessible state.

## Accessibility

Table uses native HTML table semantics rather than an interactive WAI-ARIA grid
pattern. Use Caption, `aria-label`, or `aria-labelledby` for an accessible name.
Table adds no keyboard behavior; only interactive descendants enter the Tab order.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
