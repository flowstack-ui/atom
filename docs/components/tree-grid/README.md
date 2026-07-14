# TreeGrid

Headless hierarchical grid primitives combining tree expansion with grid cell navigation.

## When to Use

Use `TreeGrid` when hierarchical rows expand and each row also contains several
navigable columns, such as a file browser with size and modified-date columns.
Use `Tree` for one-column hierarchies and `DataGrid` when rows are flat rather
than parent and child nodes.

## Features

- Implements `role="treegrid"` with row, row header, column header, and gridcell parts.
- Supports controlled and uncontrolled expansion.
- Supports controlled and uncontrolled active cell state.
- Supports optional row selection with selectable parent rows.
- Hides descendant rows when parent rows are collapsed.
- Supports RTL-aware cell navigation and tree expand/collapse keys through `dir` and `Direction.Provider`.
- Keeps sorting, filtering, resizing, editing, and virtualization outside the primitive.

## Import

```tsx
import { TreeGrid } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<TreeGrid.Root>
  <TreeGrid.Caption />
  <TreeGrid.Header>
    <TreeGrid.Row>
      <TreeGrid.ColumnHeader />
    </TreeGrid.Row>
  </TreeGrid.Header>
  <TreeGrid.Body>
    <TreeGrid.Row>
      <TreeGrid.RowHeader />
      <TreeGrid.Cell />
    </TreeGrid.Row>
  </TreeGrid.Body>
  <TreeGrid.Footer />
</TreeGrid.Root>
```

## API Reference

### Root

Owns hierarchical visibility, active-cell navigation, optional row selection,
expansion, direction, and the single focus target for the entire grid.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `value` | `string \| string[] \| null` | - |
| `defaultValue` | `string \| string[] \| null` | depends on `selectionMode` |
| `onValueChange` | `(value) => void` | - |
| `onKeyDown` | `(event) => void` | - |
| `expandedValue` | `string[]` | - |
| `defaultExpandedValue` | `string[]` | `[]` |
| `onExpandedValueChange` | `(value: string[]) => void` | - |
| `activeCell` | `{ rowIndex: number; columnIndex: number } \| null` | - |
| `defaultActiveCell` | `{ rowIndex: number; columnIndex: number } \| null` | `null` |
| `onActiveCellChange` | `(cell: TreeGridCellCoordinates \| null) => void` | - |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"none"` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `loop` | `boolean` | `false` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |
| `rowCount` | `number` | - |
| `columnCount` | `number` | - |
| `selectOnRowClick` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"treegrid"` |
| `aria-activedescendant` | Active cell id when a cell is active |
| `aria-colcount` | `columnCount` or `-1` |
| `aria-disabled` | `"true"` when disabled |
| `aria-multiselectable` | `"true"` when `selectionMode="multiple"` |
| `aria-readonly` | `"true"` when read-only |
| `aria-rowcount` | `rowCount` or `-1` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-grid"` |
| `[data-active]` | Present when a cell is active |
| `[data-focused]` | Present while focus is inside the treegrid |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-column-count]` | Normalized positive `columnCount` |
| `[data-row-count]` | Normalized positive `rowCount` |
| `[data-selection-mode]` | `"single"` or `"multiple"` |

### Caption

Provides a visible accessible name or description for the treegrid.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-grid-caption"` |

### Header

Groups header Rows and ColumnHeader cells above the scrollable body.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"rowgroup"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-grid-header"` |

### Row

Registers one hierarchical row, its parent, visibility, expansion, selection,
and normalized row index for all cells inside it.

| Prop | Type | Default |
| --- | --- | --- |
| `rowIndex` | `number` | - |
| `index` | `number` | - |
| `value` | `string` | required |
| `parentValue` | `string \| null` | `null` |
| `level` | `number` | `1` |
| `expandable` | `boolean` | `false` |
| `selectable` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"row"` |
| `aria-disabled` | `"true"` when row or root is disabled |
| `aria-expanded` | `"true"` or `"false"` when expandable |
| `aria-hidden` | `"true"` when hidden by a collapsed parent row |
| `aria-level` | Hierarchical level |
| `aria-rowindex` | Normalized positive row index |
| `aria-selected` | `"true"` or `"false"` when selection is enabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-grid-row"` |
| `[data-expandable]` | Present when expandable |
| `[data-selectable]` | Present when selectable and selection is enabled |
| `[data-selection-disabled]` | Present when not selectable and selection is enabled |
| `[data-expanded]` | Present when expanded |
| `[data-hidden]` | Present when hidden by a collapsed parent row |
| `[data-disabled]` | Present when disabled |
| `[data-parent-value]` | Parent row value |
| `[data-level]` | Hierarchical level |
| `[data-row-index]` | Normalized positive row index |
| `[data-selected]` | Present when selected |
| `[data-value]` | Row value |

### ColumnHeader

Renders a navigable header cell, optional sort state, and the normalized column
coordinate used by Root navigation.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `columnIndex` | `number` | - |
| `index` | `number` | - |
| `disabled` | `boolean` | `false` |
| `sortDirection` | `"ascending" \| "descending" \| "none" \| "other"` | - |
| `scope` | native `scope` | `"col"` |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"columnheader"` |
| `aria-colindex` | Normalized positive column index |
| `aria-disabled` | `"true"` when column header, row, or root is disabled |
| `aria-selected` | `"true"` or `"false"` when selection is enabled |
| `aria-sort` | `sortDirection` value |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-grid-column-header"` |
| `[data-active]` | Present when active and treegrid-focused |
| `[data-disabled]` | Present when disabled |
| `[data-column-index]` | Normalized positive column index |
| `[data-selected]` | Present when row is selected |
| `[data-sort]` | `"ascending" \| "descending" \| "none" \| "other"` |

### Body

Groups the visible hierarchical data Rows below Header.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"rowgroup"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-grid-body"` |

### RowHeader

Renders the cell that names its Row. Clicking it focuses the cell and toggles
the row when expandable.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `columnIndex` | `number` | - |
| `index` | `number` | - |
| `disabled` | `boolean` | `false` |
| `scope` | native `scope` | `"row"` |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"rowheader"` |
| `aria-colindex` | Normalized positive column index |
| `aria-disabled` | `"true"` when row header, row, or root is disabled |
| `aria-selected` | `"true"` or `"false"` when selection is enabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-grid-row-header"` |
| `[data-active]` | Present when active and treegrid-focused |
| `[data-disabled]` | Present when disabled |
| `[data-column-index]` | Normalized positive column index |
| `[data-selected]` | Present when row is selected |

### Cell

Renders a navigable data cell and registers its normalized column coordinate
with the current Row.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `columnIndex` | `number` | - |
| `index` | `number` | - |
| `disabled` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"gridcell"` |
| `aria-colindex` | Normalized positive column index |
| `aria-disabled` | `"true"` when cell, row, or root is disabled |
| `aria-selected` | `"true"` or `"false"` when selection is enabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-grid-cell"` |
| `[data-active]` | Present when active and treegrid-focused |
| `[data-disabled]` | Present when disabled |
| `[data-column-index]` | Normalized positive column index |
| `[data-selected]` | Present when row is selected |

### Footer

Groups optional summary Rows after Body.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"rowgroup"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-grid-footer"` |

Advanced compound parts can use `useTreeGridContext` and
`useTreeGridRowContext` with their matching public providers.

## Examples

### Expandable Rows

```tsx
import { TreeGrid } from "@flowstack-ui/atom";

export default function PlatformTreeGrid() {
  return (
    <TreeGrid.Root
      defaultExpandedValue={["platform"]}
      aria-label="Platform files"
      columnCount={2}
    >
      <TreeGrid.Header>
        <TreeGrid.Row value="headers">
          <TreeGrid.ColumnHeader columnIndex={1}>Name</TreeGrid.ColumnHeader>
          <TreeGrid.ColumnHeader columnIndex={2}>Type</TreeGrid.ColumnHeader>
        </TreeGrid.Row>
      </TreeGrid.Header>
      <TreeGrid.Body>
        <TreeGrid.Row rowIndex={1} value="platform" expandable selectable={false}>
          <TreeGrid.RowHeader columnIndex={1}>Platform</TreeGrid.RowHeader>
          <TreeGrid.Cell columnIndex={2}>Folder</TreeGrid.Cell>
        </TreeGrid.Row>
        <TreeGrid.Row rowIndex={2} value="api" parentValue="platform">
          <TreeGrid.RowHeader columnIndex={1}>API</TreeGrid.RowHeader>
          <TreeGrid.Cell columnIndex={2}>Folder</TreeGrid.Cell>
        </TreeGrid.Row>
      </TreeGrid.Body>
    </TreeGrid.Root>
  );
}
```

## Accessibility

TreeGrid follows the [WAI-ARIA treegrid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/)
with Root focus and `aria-activedescendant`. Provide an accessible name with
Caption, `aria-label`, or `aria-labelledby`.

| Key | Description |
| --- | --- |
| Expand / next-cell arrow | Expands a collapsed expandable row, or moves to the next cell: `ArrowRight` in LTR, `ArrowLeft` in RTL |
| Collapse / previous-cell arrow | Collapses an expanded row, moves to parent, or moves to the previous cell: `ArrowLeft` in LTR, `ArrowRight` in RTL |
| `ArrowDown` / `ArrowUp` | Moves between visible rows |
| `Home` / `End` | Moves within a row |
| `Ctrl+Home` / `Ctrl+End` | Moves to first or last visible cell |
| `Enter` / `Space` | Selects the active row when selection is enabled |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
