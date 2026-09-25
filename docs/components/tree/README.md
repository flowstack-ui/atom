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
- Supports optional selection, controlled focus, independent disclosure and checking,
  immutable logical collections, lazy loading and opt-in interactive item controls.

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
| `selectionMode` | `"none" \| "single" \| "multiple"` | derived from `multiple` |
| `focusedValue` / `defaultFocusedValue` | `string \| null` | first eligible item |
| `onFocusedValueChange` | `(value: string \| null) => void` | - |
| `expandOnClick` | `boolean` | `true` |
| `collection` | `TreeCollection` | mounted items only |
| `checkable` | `boolean` | `false` |
| `checkedValue` / `defaultCheckedValue` | `string[]` | `[]` |
| `onCheckedValueChange` | `(values: string[]) => void` | - |
| `checkPropagation` | `"none" \| "descendants"` | `"none"` |
| `loadChildren` | `(value, { signal }) => Promise<void>` | - |
| `onLoadError` | `(value, error) => void` | - |
| `disabled` | `boolean` | Field value |
| `readOnly` | `boolean` | Field value |
| `required` | `boolean` | Field value |
| `invalid` | `boolean` | Field value |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |
| `loop` | `boolean` | `false` |
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
| `interactive` | `boolean` | `false` |
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
| `animate` | `boolean` | `false` |
| `onExitComplete` | `() => void` | - |
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

### Trigger and Checkbox

`Tree.Trigger` is an independent disclosure button inside an expandable Item.
Set Root `expandOnClick={false}` when only this control should expand on pointer
activation. It does not select or check the item. Native button props, `asChild`
and `render` are supported; supply a localized accessible label when needed.

`Tree.Checkbox` is a button with checkbox semantics inside an Item. Enable Root
`checkable`. Checking uses `checkedValue`, not selection `value`. With
`checkPropagation="descendants"`, checked values contain enabled leaf identities
and parents derive mixed state. Supply the complete logical `collection` to
include descendants that are not mounted. Disabled branches are excluded.
The Root `name` submits selection only; submit checked values explicitly if needed.

### Collection, controller and loading

`createTreeCollection(nodes)` validates unique nonempty values and provides
preorder `entries`, `find`, `visible(expandedValues)`, ancestor-preserving
`filter(predicate)`, and immutable `remove(value)` / `update(value, updater)`.
Nodes have `value`, `label`, optional `disabled`, `expandable` and `children`.
`children: undefined` on an expandable node means it may be loaded;
`children: []` means loaded and empty. Render the collection yourself: it does
not create DOM or virtualize items.

`useTreeController({ collection, ...rootOptions })` returns controlled Root
props, selection/expansion/focus values and setters, plus `expandAll()` and
`collapseAll()`. Spread `controller.rootProps` onto Root. Expand-all operates on
known enabled branches, not an unbounded remote hierarchy.

Root deduplicates `loadChildren` requests, supplies an AbortSignal, and exposes
`loadingValues`, `loadErrors` and `retryLoad(value)` through `useTreeContext`.
The application loads and inserts children into its collection; honor the signal
before publishing results. Requests abort on unmount or logical node removal.
Errors do not automatically retry. Render busy, error and retry UI explicitly.

### Interactive content and motion

Use Item `interactive` for links, rename inputs and actions. Enter/F2 enters an
eligible child control; Escape returns to Root. Controls retain their own keys,
and native controls do not trigger row selection or expansion. Keep ItemText
separate from action labels for predictable naming and typeahead.

Group `animate` retains exiting content for authored CSS motion; closing content
becomes inert and hidden from accessibility immediately. Use `data-state` and
the measured `--content-height` variable for motion and honor reduced motion.
No appearance or duration is supplied by Atom.

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
When focus first enters, the first enabled visible selected Item becomes
active; if there is no such selection, the first enabled visible Item becomes
active. Arrow navigation stops at the first and last visible Item by default;
set `loop` to opt into wrapping.
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
| `Ctrl/Cmd+A` | Toggles all enabled visible items in multiple-selection mode |
| `Shift+click` / `Shift+Space` / `Shift+navigation` | Extends selection from the selection anchor in multiple mode |
| `F2` / `Escape` | Enters interactive item controls / returns to Root |

In multiple mode, ordinary click replaces selection; Ctrl/Command-click toggles
one item without clearing the others. Space toggles the active item. Shift with
the movement arrows or Home/End selects the eligible visible range.
When checking is enabled, Space checks the active item instead of selecting it.
In `selectionMode="none"`, items omit `aria-selected`. Pointer hover never moves
the active keyboard item. Home/End skip disabled nodes; removing, disabling or
collapsing the active item requests recovery to an eligible visible item.

### Controller composition

`useTreeController({ collection, ...props })` returns controlled `rootProps`,
`value`, `expandedValue`, `focusedValue`, `checkedValue`, their setters,
`getNodeState(value)`, and `expandAll`/`collapseAll`. Render
`<Tree.RootProvider value={controller}>` or spread `controller.rootProps` on
`Tree.Root`. Node-state queries report explicit checked values; aggregated mixed
state is available from `useTreeContext().getCheckedState` inside the tree.
`Item.selectable={false}` keeps a node navigable and expandable while excluding
it from pointer, keyboard, range and select-all selection.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
