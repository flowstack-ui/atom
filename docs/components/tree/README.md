# Tree

Headless hierarchical tree primitives for expandable one-dimensional navigation and selection.

## When to Use

Use `Tree` for nested items that expand and collapse in one main column, such as
a file browser or category picker. Use `TreeGrid` when every row also has
several navigable columns, and use `Accordion` when sections contain general
content instead of selectable items.

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

Owns selection, expansion, visible-item navigation, typeahead, form values, and
the single focus target that points to the active Item.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `value` | `string \| string[] \| null` | - |
| `defaultValue` | `string \| string[] \| null` | `null` or `[]` |
| `onValueChange` | `(value) => void` | - |
| `expandedValue` | `string[]` | - |
| `defaultExpandedValue` | `string[]` | `[]` |
| `onExpandedValueChange` | `(value: string[]) => void` | - |
| `onBlur` | `FocusEventHandler<HTMLElement>` | - |
| `onFocus` | `FocusEventHandler<HTMLElement>` | - |
| `onKeyDown` | `KeyboardEventHandler<HTMLElement>` | - |
| `multiple` | `boolean` | `false` |
| `disabled` | `boolean` | Field value |
| `readOnly` | `boolean` | Field value |
| `required` | `boolean` | Field value |
| `invalid` | `boolean` | Field value |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |
| `loop` | `boolean` | `true` |
| `name` | `string` | - |
| `form` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"tree"` |
| `aria-activedescendant` | Active visible Item ID |
| `aria-describedby` | Explicit IDs or inherited Field description/error IDs |
| `aria-disabled` | `true` when disabled |
| `aria-invalid` | `true` when invalid |
| `aria-multiselectable` | `true` in multiple mode |
| `aria-orientation` | Current orientation |
| `aria-readonly` | `true` when read-only |
| `aria-required` | `true` when required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree"` |
| `[data-filled]` | Present when at least one Item is selected |
| `[data-active]` | Present while an Item is active |
| `[data-disabled]` | Present when disabled |
| `[data-readonly]` | Present when read-only |
| `[data-invalid]` | Present when invalid |
| `[data-multiple]` | Present in multiple mode |

### Item

Registers one selectable node, its parent and level, and optional expansion
state. It receives pointer selection while Root keeps DOM focus.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `label` | `string` | - |
| `disabled` | `boolean` | `false` |
| `expandable` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"treeitem"` |
| `aria-selected` | Current selected state |
| `aria-disabled` | `true` when Item or Root is disabled |
| `aria-expanded` | Expansion state when the Item has children |
| `aria-level` | Automatic nesting level |
| `aria-labelledby` | ItemText ID when ItemText is mounted |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-item"` |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-level]` | Automatic nesting level |
| `[data-selected]` | Present when selected |
| `[data-active]` | Present when active |
| `[data-expandable]` | Present when expandable |
| `[data-expanded]` | Present when expanded |
| `[data-disabled]` | Present when disabled |

### ItemText

Registers the visible label used for Item naming and printable-character
typeahead. It renders a `span` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** ItemText adds no ARIA attributes; Item references its generated ID.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-item-text"` |

### Group

Groups child Items, increments their automatic level, and follows its parent
Item's expansion state.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMount` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |
| `aria-hidden` | `true` when force-mounted but collapsed |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tree-group"` |
| `[data-state]` | `"open" \| "closed"` |

Advanced compound parts can use the public Tree, Item, and Branch context hooks
and providers.

## Examples

### Expandable Branch

```tsx
import { Tree } from "@flowstack-ui/atom";

export default function ComponentTree() {
  return (
    <Tree.Root defaultExpandedValue={["components"]} aria-label="Components">
      <Tree.Item value="components" expandable>
        <Tree.ItemText>Components</Tree.ItemText>
        <Tree.Group><Tree.Item value="button">Button</Tree.Item></Tree.Group>
      </Tree.Item>
    </Tree.Root>
  );
}
```

## Accessibility

Tree follows the [WAI-ARIA tree view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
with Root focus and `aria-activedescendant`. Provide an accessible name with a
visible Field label, `aria-label`, or `aria-labelledby`.
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
