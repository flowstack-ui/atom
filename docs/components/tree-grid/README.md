# TreeGrid

Headless hierarchical grid primitives combining tree expansion with grid cell navigation.

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

Contains the treegrid.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string \| string[] \| null` | - |
| `defaultValue` | `string \| string[] \| null` | depends on `selectionMode` |
| `onValueChange` | `(value) => void` | - |
| `expandedValue` | `string[]` | - |
| `defaultExpandedValue` | `string[]` | `[]` |
| `onExpandedValueChange` | `(value: string[]) => void` | - |
| `activeCell` | `{ rowIndex: number; columnIndex: number } \| null` | - |
| `defaultActiveCell` | `{ rowIndex: number; columnIndex: number } \| null` | `null` |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"none"` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `loop` | `boolean` | `false` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |
| `rowCount` | `number` | - |
| `columnCount` | `number` | - |

### Row

Renders a hierarchical row.

| Prop | Type | Default |
| --- | --- | --- |
| `rowIndex` | `number` | - |
| `index` | `number` | - |
| `value` | `string` | - |
| `parentValue` | `string` | - |
| `level` | `number` | inferred |
| `expandable` | `boolean` | `false` |
| `selectable` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |

### RowHeader, ColumnHeader, Cell

Render navigable cells.

| Part | Role | Data slot |
| --- | --- | --- |
| `RowHeader` | `rowheader` | `"tree-grid-row-header"` |
| `ColumnHeader` | `columnheader` | `"tree-grid-column-header"` |
| `Cell` | `gridcell` | `"tree-grid-cell"` |

| Data attribute | Values |
| --- | --- |
| `[data-active]` | Present when active and treegrid-focused |
| `[data-selected]` | Present when row is selected |
| `[data-disabled]` | Present when disabled |

## Examples

### Expandable Rows

```tsx
<TreeGrid.Root defaultExpandedValue={["platform"]}>
  <TreeGrid.Body>
    <TreeGrid.Row rowIndex={1} value="platform" expandable selectable={false}>
      <TreeGrid.RowHeader columnIndex={1}>Platform</TreeGrid.RowHeader>
    </TreeGrid.Row>
    <TreeGrid.Row rowIndex={2} value="api" parentValue="platform">
      <TreeGrid.RowHeader columnIndex={1}>API</TreeGrid.RowHeader>
    </TreeGrid.Row>
  </TreeGrid.Body>
</TreeGrid.Root>
```

## Accessibility

Implements the WAI-ARIA treegrid pattern with root focus and `aria-activedescendant`.

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
