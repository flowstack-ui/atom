# Tree

Headless hierarchical tree primitives for expandable one-dimensional navigation and selection.

## Features

- Implements WAI-ARIA `tree`, `treeitem`, and `group` roles.
- Supports controlled and uncontrolled selection.
- Supports controlled and uncontrolled expansion.
- Supports single and multiple selection.
- Supports typeahead, roving active item, disabled items, Field context, and form submission.
- Supports nested groups with automatic levels.
- Supports RTL-aware arrow-key navigation through `dir` and `Direction.Provider`.

## Import

```tsx
import { Tree } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Tree.Root>
  <Tree.Item>
    <Tree.ItemText />
    <Tree.Group>
      <Tree.Item />
    </Tree.Group>
  </Tree.Item>
</Tree.Root>
```

## API Reference

### Root

Contains tree items and owns selection/expansion state.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string \| string[] \| null` | - |
| `defaultValue` | `string \| string[] \| null` | `null` or `[]` |
| `onValueChange` | `(value) => void` | - |
| `expandedValue` | `string[]` | - |
| `defaultExpandedValue` | `string[]` | `[]` |
| `onExpandedValueChange` | `(value: string[]) => void` | - |
| `multiple` | `boolean` | `false` |
| `disabled` | `boolean` | Field value |
| `readOnly` | `boolean` | Field value |
| `required` | `boolean` | Field value |
| `invalid` | `boolean` | Field value |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |
| `loop` | `boolean` | `true` |

### Item

Renders one tree item.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `label` | `string` | - |
| `disabled` | `boolean` | `false` |
| `expandable` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-item"` |
| `[data-state]` | `"expanded" \| "collapsed"` |
| `[data-selected]` | Present when selected |
| `[data-active]` | Present when active |
| `[data-disabled]` | Present when disabled |

### ItemText

Labels a tree item and registers text for typeahead.

### Group

Contains child tree items.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMount` | `boolean` | `false` |

## Examples

### Expandable Branch

```tsx
<Tree.Root defaultExpandedValue={["components"]}>
  <Tree.Item value="components" expandable>
    <Tree.ItemText>Components</Tree.ItemText>
    <Tree.Group>
      <Tree.Item value="button">Button</Tree.Item>
    </Tree.Group>
  </Tree.Item>
</Tree.Root>
```

## Accessibility

Implements the WAI-ARIA tree pattern with root focus and `aria-activedescendant`.
Printable-character typeahead matches enabled visible item text; a
single-character search cycles forward from the current matching item, while
multi-character buffers match exact prefixes.

| Key | Description |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Moves between visible items in vertical orientation |
| `ArrowRight` / `ArrowLeft` | Moves between items in horizontal orientation, mirrored when `dir="rtl"` |
| Expand arrow | Expands a collapsed item or moves to its first child: `ArrowRight` in LTR, `ArrowLeft` in RTL |
| Collapse arrow | Collapses an expanded item or moves to its parent: `ArrowLeft` in LTR, `ArrowRight` in RTL |
| `Home` / `End` | Moves to first or last visible item |
| `Enter` / `Space` | Selects the item and toggles expansion when expandable |
| Printable character | Typeahead search |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
