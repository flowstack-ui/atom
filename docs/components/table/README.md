# Table

Headless native table anatomy with caption, sections, rows, cells, and sortable header metadata.

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

Renders a native `table`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"table"` |

### Caption, Header, Body, Footer, Row, Cell

Render native table parts with `data-slot` attributes.

| Part | Element | Data slot |
| --- | --- | --- |
| `Caption` | `caption` | `"table-caption"` |
| `Header` | `thead` | `"table-header"` |
| `Body` | `tbody` | `"table-body"` |
| `Footer` | `tfoot` | `"table-footer"` |
| `Row` | `tr` | `"table-row"` |
| `Cell` | `td` | `"table-cell"` |

### Head

Renders a native `th`.

| Prop | Type | Default |
| --- | --- | --- |
| `scope` | native `scope` | `"col"` |
| `sortDirection` | `"ascending" \| "descending" \| "none" \| "other"` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"table-head"` |
| `[data-sort]` | `"ascending" \| "descending" \| "none" \| "other"` |

## Examples

### Sort Metadata

```tsx
<Table.Head sortDirection="ascending">
  Name
</Table.Head>
```

For interactive sorting, put a button or pressable control inside the header cell and keep `sortDirection` as the accessible state.

## Accessibility

Table uses native table semantics. Use `Table.Caption`, `aria-label`, or `aria-labelledby` when the table needs an accessible name.

| Key | Description |
| --- | --- |
| `Tab` | Moves through focusable descendants in document order |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
