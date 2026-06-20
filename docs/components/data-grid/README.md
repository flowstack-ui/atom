# DataGrid

Headless ARIA grid primitives for cell navigation and optional row selection.

## Features

- Implements `role="grid"` with row, column header, and gridcell parts.
- Uses collection registration for DOM-ordered keyboard navigation.
- Supports controlled and uncontrolled active cell state.
- Supports none, single, and multiple row selection modes.
- Supports row click selection, disabled/read-only state, row and column counts, and optional row wrapping.
- Keeps sorting models, filtering, resizing, editing, and virtualization outside the primitive.

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

### Root

Contains the grid and owns focus/selection state.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string \| string[] \| null` | - |
| `defaultValue` | `string \| string[] \| null` | depends on `selectionMode` |
| `onValueChange` | `(value) => void` | - |
| `activeCell` | `{ rowIndex: number; columnIndex: number } \| null` | - |
| `defaultActiveCell` | `{ rowIndex: number; columnIndex: number } \| null` | `null` |
| `onActiveCellChange` | `(cell) => void` | - |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"none"` |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `loop` | `boolean` | `false` |
| `wrapRows` | `boolean` | `false` |
| `rowCount` | `number` | - |
| `columnCount` | `number` | - |
| `selectOnRowClick` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"data-grid"` |
| `[data-focused]` | Present when focus is inside the grid |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read only |
| `[data-selection-mode]` | `"none" \| "single" \| "multiple"` |

### Header, Body, Footer, Caption

Render grid sections.

| Part | Role | Data slot |
| --- | --- | --- |
| `Header` | `rowgroup` | `"data-grid-header"` |
| `Body` | `rowgroup` | `"data-grid-body"` |
| `Footer` | `rowgroup` | `"data-grid-footer"` |
| `Caption` | native caption | `"data-grid-caption"` |

### Row

Renders a grid row.

| Prop | Type | Default |
| --- | --- | --- |
| `rowIndex` | `number` | - |
| `index` | `number` | - |
| `value` | `string` | - |
| `disabled` | `boolean` | `false` |
| `selectable` | `boolean` | `true` |

### ColumnHeader

Renders a column header cell.

| Prop | Type | Default |
| --- | --- | --- |
| `columnIndex` | `number` | - |
| `index` | `number` | - |
| `sortDirection` | `"ascending" \| "descending" \| "none" \| "other"` | - |
| `disabled` | `boolean` | `false` |

### Cell

Renders a grid cell.

| Prop | Type | Default |
| --- | --- | --- |
| `columnIndex` | `number` | - |
| `index` | `number` | - |
| `disabled` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-active]` | Present when active and grid-focused |
| `[data-selected]` | Present when row is selected |
| `[data-disabled]` | Present when disabled |

## Examples

### Row Selection

```tsx
<DataGrid.Root selectionMode="multiple" defaultValue={["row-1"]}>
  <DataGrid.Body>
    <DataGrid.Row rowIndex={1} value="row-1">
      <DataGrid.Cell columnIndex={1}>Ada</DataGrid.Cell>
    </DataGrid.Row>
  </DataGrid.Body>
</DataGrid.Root>
```

### Sort State Metadata

```tsx
<DataGrid.ColumnHeader columnIndex={1} sortDirection="ascending">
  Name
</DataGrid.ColumnHeader>
```

## Accessibility

Implements the WAI-ARIA grid pattern with root focus and `aria-activedescendant`.

| Key | Description |
| --- | --- |
| `ArrowRight` / `ArrowLeft` | Moves between cells in a row |
| `ArrowDown` / `ArrowUp` | Moves between rows |
| `Home` / `End` | Moves within a row |
| `Ctrl+Home` / `Ctrl+End` | Moves to first or last cell |
| `Enter` / `Space` | Selects the active row when selection is enabled |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
