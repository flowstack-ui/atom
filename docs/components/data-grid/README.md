# DataGrid

Headless ARIA grid primitives for two-dimensional cell navigation and optional
row selection.

## When to Use

Use DataGrid when users must move through rows and columns with the keyboard or
select rows in an interactive table. Use a native `table` when people only need
to read data; native tables are simpler and already accessible. Use TreeGrid
when rows expand into a hierarchy. DataGrid does not provide sorting logic,
editing, resizing, filtering, or virtualization—it exposes the states needed
to connect those application features.

## Features

- Implements grid, rowgroup, row, columnheader, and gridcell semantics.
- Keeps focus on Root and identifies the active cell with `aria-activedescendant`.
- Supports controlled active cell and none, single, or multiple row selection.
- Navigates in document order while skipping disabled cells.
- Supports row/column counts, looping, row wrapping, and row-click selection.
- Mirrors horizontal arrows in RTL.
- Supports native table rendering plus `asChild` and `render` composition.

## Import

```tsx
import { DataGrid } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<DataGrid.Root>
  <DataGrid.Caption />
  <DataGrid.Header>
    <DataGrid.Row>
      <DataGrid.ColumnHeader />
    </DataGrid.Row>
  </DataGrid.Header>
  <DataGrid.Body>
    <DataGrid.Row>
      <DataGrid.Cell />
    </DataGrid.Row>
  </DataGrid.Body>
  <DataGrid.Footer />
</DataGrid.Root>
```

## API Reference

All rendered parts accept the native props for their default table element and
support `asChild` and `render`.

### Root

Renders a focusable `table`, owns active-cell navigation and row selection,
and provides the grid context.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string \| string[] \| null` | - |
| `defaultValue` | `string \| string[] \| null` | `[]` for multiple; otherwise `null` |
| `onValueChange` | `(value: DataGridSelectionValue) => void` | - |
| `activeCell` | `{ rowIndex: number; columnIndex: number } \| null` | - |
| `defaultActiveCell` | `{ rowIndex: number; columnIndex: number } \| null` | `null` |
| `onActiveCellChange` | `(cell) => void` | - |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"none"` |
| `dir` | `"ltr" \| "rtl"` | Direction context |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `loop` | `boolean` | `false` |
| `wrapRows` | `boolean` | `false` |
| `rowCount` | `number` | - |
| `columnCount` | `number` | - |
| `selectOnRowClick` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Counts are truncated to positive integers. Missing or invalid counts are
announced as `-1`, meaning the total is unknown.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"grid"` |
| `aria-activedescendant` | Generated active Cell ID |
| `aria-colcount` | Normalized count or `-1` |
| `aria-rowcount` | Normalized count or `-1` |
| `aria-disabled` | `"true"` when disabled |
| `aria-readonly` | `"true"` when read only |
| `aria-multiselectable` | `"true"` in multiple mode |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"data-grid"` |
| `[data-active]` | Present when an active registered Cell exists |
| `[data-focused]` | Present while focus is within Root |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read only |
| `[data-column-count]` | Normalized supplied count |
| `[data-row-count]` | Normalized supplied count |
| `[data-selection-mode]` | `"single" \| "multiple"` |

### Caption

Renders the native `caption` that names or summarizes the grid for table users.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"data-grid-caption"` |

### Header

Renders a `thead` row group for heading rows.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"rowgroup"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"data-grid-header"` |

### Row

Renders a `tr`, supplies row metadata to its cells, and optionally participates
in selection. `rowIndex` is one-based; zero-based `index` is converted to one-based.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `rowIndex` | `number` | - |
| `index` | `number` | - |
| `selectable` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Rows need `value` to be selectable. `selectable={false}` keeps an identified
header, footer, or summary row out of selection without disabling its cells.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"row"` |
| `aria-rowindex` | Normalized one-based row index |
| `aria-selected` | Row selection state when selection is enabled |
| `aria-disabled` | `"true"` when Row or Root is disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"data-grid-row"` |
| `[data-selectable]` | Present for a selectable valued row |
| `[data-selection-disabled]` | Present when the row opts out of enabled selection |
| `[data-row-index]` | Normalized index |
| `[data-value]` | Row value |
| `[data-selected]` | Present when selected |
| `[data-disabled]` | Present when disabled |

### ColumnHeader

Renders a `th` registered as a navigable cell. It exposes sort state but does
not change sorting when clicked.

| Prop | Type | Default |
| --- | --- | --- |
| `columnIndex` | `number` | - |
| `index` | `number` | - |
| `disabled` | `boolean` | `false` |
| `sortDirection` | `"ascending" \| "descending" \| "none" \| "other"` | - |
| `scope` | native `th` scope | `"col"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"columnheader"` |
| `aria-colindex` | Normalized one-based column index |
| `aria-sort` | Value from `sortDirection` |
| `aria-selected` | Parent Row selection state when enabled |
| `aria-disabled` | `"true"` when explicitly, row, or grid disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"data-grid-column-header"` |
| `[data-column-index]` | Normalized index |
| `[data-sort]` | Sort direction when supplied |
| `[data-active]` | Present when active and Root is focused |
| `[data-selected]` | Present when its Row is selected |
| `[data-disabled]` | Present when explicitly, row, or grid disabled |

### Body

Renders a `tbody` row group for the main data rows.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"rowgroup"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"data-grid-body"` |

### Cell

Renders a registered `td`. Clicking an enabled indexed Cell makes it active
and focuses Root; missing indexes make it non-navigable without announcing it
as disabled.

| Prop | Type | Default |
| --- | --- | --- |
| `columnIndex` | `number` | - |
| `index` | `number` | - |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"gridcell"` |
| `aria-colindex` | Normalized one-based column index |
| `aria-selected` | Parent Row selection state when enabled |
| `aria-disabled` | `"true"` when explicitly, row, or grid disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"data-grid-cell"` |
| `[data-column-index]` | Normalized index |
| `[data-active]` | Present when active and Root is focused |
| `[data-selected]` | Present when its Row is selected |
| `[data-disabled]` | Present when explicitly, row, or grid disabled |

### Footer

Renders a `tfoot` row group for totals and summary rows.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"rowgroup"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"data-grid-footer"` |

Advanced custom parts can use the public `useDataGridContext` and
`useDataGridRowContext` hooks. The row hook returns `null` outside Row; the main
hook must be used inside Root. Prefer the namespaced parts for standard grids.

## Examples

### Selectable Project Grid

```tsx
import { DataGrid } from "@flowstack-ui/atom";

const projects = [
  { id: "alpha", name: "Alpha", status: "Ready" },
  { id: "bravo", name: "Bravo", status: "Review" },
];

export function ProjectGrid() {
  return (
    <DataGrid.Root
      aria-label="Projects"
      rowCount={projects.length + 1}
      columnCount={2}
      selectionMode="multiple"
      defaultValue={["alpha"]}
      selectOnRowClick
    >
      <DataGrid.Caption>Current projects</DataGrid.Caption>
      <DataGrid.Header>
        <DataGrid.Row rowIndex={1} selectable={false}>
          <DataGrid.ColumnHeader columnIndex={1}>Name</DataGrid.ColumnHeader>
          <DataGrid.ColumnHeader columnIndex={2}>Status</DataGrid.ColumnHeader>
        </DataGrid.Row>
      </DataGrid.Header>
      <DataGrid.Body>
        {projects.map((project, index) => (
          <DataGrid.Row key={project.id} rowIndex={index + 2} value={project.id}>
            <DataGrid.Cell columnIndex={1}>{project.name}</DataGrid.Cell>
            <DataGrid.Cell columnIndex={2}>{project.status}</DataGrid.Cell>
          </DataGrid.Row>
        ))}
      </DataGrid.Body>
    </DataGrid.Root>
  );
}
```

### Controlled Sort Metadata

```tsx
import { useState } from "react";
import { DataGrid, type DataGridSortDirection } from "@flowstack-ui/atom";

export function SortableHeader() {
  const [direction, setDirection] = useState<DataGridSortDirection>("ascending");

  return (
    <DataGrid.Root aria-label="People" rowCount={1} columnCount={1}>
      <DataGrid.Header>
        <DataGrid.Row rowIndex={1} selectable={false}>
          <DataGrid.ColumnHeader columnIndex={1} sortDirection={direction}>
            <button
              type="button"
              onClick={() => setDirection(
                direction === "ascending" ? "descending" : "ascending",
              )}
            >
              Name
            </button>
          </DataGrid.ColumnHeader>
        </DataGrid.Row>
      </DataGrid.Header>
    </DataGrid.Root>
  );
}
```

## Accessibility

DataGrid follows the
[WAI-ARIA Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/).
Provide an accessible name with Caption, `aria-label`, or `aria-labelledby`.
Every navigable row and cell needs a valid one-based index. Root receives DOM
focus while `aria-activedescendant` identifies the active Cell.

| Key | Description |
| --- | --- |
| `ArrowRight` / `ArrowLeft` | Moves within a row; directions mirror in RTL. |
| `ArrowDown` / `ArrowUp` | Moves by row, preferring the same column and skipping disabled cells. |
| `Home` / `End` | Moves to the first or last enabled cell in the current row. |
| `Ctrl+Home` / `Cmd+Home` | Moves to the first enabled grid cell. |
| `Ctrl+End` / `Cmd+End` | Moves to the last enabled grid cell. |
| `Enter` / `Space` | Toggles/selects the active Cell's Row when selection is enabled. |

`readOnly` prevents selection changes but still permits navigation. `disabled`
prevents Root keyboard handling. Rows with `selectable={false}` ignore row
selection from click, Enter, and Space.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
