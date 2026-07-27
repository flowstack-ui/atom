# Menu

Headless menu primitives for command menus, selection menus, groups, separators, and nested submenus.

## When to Use

Use Menu for a temporary list of commands or settings, such as Duplicate,
Archive, or Show grid. Use Select or Listbox when the main job is choosing a
form value, NavigationMenu for links that move around a website, and Menubar
when several top-level application menus must sit in one horizontal row.

## Features

- Full keyboard navigation for menu items and submenus.
- Real DOM focus on the active item, including disabled items that remain non-activatable.
- Supports controlled and uncontrolled open state.
- Supports checkbox and radio menu items.
- Supports grouped items, separators, and nested submenus.
- Supports configurable `closeOnSelect`, looping, escape close, side, align, and offsets.
- Stack-aware Escape dismissal when nested inside parent overlays.
- Exposes state data attributes for styling without shipping styles.

## Import

```tsx
import { Menu } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Menu.Root>
  <Menu.Portal>
  <Menu.Content>
    <Menu.Arrow />
    <Menu.Group>
      <Menu.Label />
      <Menu.Item />
      <Menu.CheckboxItem><Menu.ItemIndicator /></Menu.CheckboxItem>
      <Menu.RadioGroup>
        <Menu.RadioItem />
      </Menu.RadioGroup>
    </Menu.Group>
    <Menu.Separator />
    <Menu.Sub>
      <Menu.SubTrigger />
      <Menu.SubContent>
        <Menu.Item />
      </Menu.SubContent>
    </Menu.Sub>
  </Menu.Content>
  </Menu.Portal>
</Menu.Root>
```

## API Reference

### Root

Provides open state, selection defaults, item registration, and modal behavior.
It does not render a DOM element; trigger primitives such as DropdownMenu and
ContextMenu control it, while standalone examples can open it directly.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `modal` | `boolean` | `true` |
| `closeOnSelect` | `boolean` | `true` |
| `loop` | `boolean` | `true` |
| `closeOnEscape` | `boolean` | `true` |

### Content

Portals and positions the focus-managed `menu` surface. Focus moves to real
`menuitem*` elements. Modal mode uses Atom's stacked isolation and scroll lock;
non-modal outside interaction keeps its destination.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` |
| `align` | `"start" \| "center" \| "end"` | `"start"` |
| `sideOffset` | `number` | `4` |
| `loop` | `boolean` | root value |
| `ariaLabel` | `string` | - |
| `anchorPoint` | `{ x: number; y: number }` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-orientation` | `"vertical"` |
| `aria-label` | Value from `ariaLabel` |
| `aria-labelledby` | Trigger ID when a trigger exists and `ariaLabel` is absent |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | Resolved Floating UI side |
| `[data-align]` | Resolved Floating UI alignment |
| `[data-positioned]` | Present after positioning completes |

| CSS variable | Description |
| --- | --- |
| `--atom-menu-available-width` | Collision-aware available width |
| `--atom-menu-available-height` | Collision-aware available height |
| `--atom-menu-trigger-width` | Anchor width; `0px` for a point anchor |
| `--atom-menu-trigger-height` | Anchor height; `0px` for a point anchor |
| `--atom-menu-transform-origin` | Resolved animation origin |

### Portal and Arrow

`Portal` accepts `container` and `disabled`. `Arrow` renders geometry attached
to the resolved Content side and accepts `width`, `height`, `asChild`, and
`render`. Both are optional.

| Portal prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `container` | `HTMLElement \| null` | document body |
| `disabled` | `boolean` | `false` |

| Arrow prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `width` | `number` | `10` |
| `height` | `number` | `5` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Arrow exposes `[data-slot="menu-arrow"]`, `[data-side]`, and `[data-align]`.

### Item

Renders an actionable menu item.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | required |
| `textValue` | `string` | Text child or `value` |
| `onSelect` | `() => void` | - |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | root value |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-disabled` | Present when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-value]` | Item value |

### CheckboxItem

Renders a `menuitemcheckbox`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `checked` | `boolean \| "indeterminate"` | `false` |
| `onCheckedChange` | `(checked: boolean) => void` | - |
| `value` | `string` | required |
| `textValue` | `string` | Text child or `value` |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-checked` | `true`, `false`, or `"mixed"` |
| `aria-disabled` | Present when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-checkbox-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-checked]` | Present when checked |
| `[data-indeterminate]` | Present when indeterminate |
| `[data-state]` | `"checked" \| "unchecked" \| "indeterminate"` |
| `[data-value]` | Item value |

### RadioGroup

Provides radio selection state for `RadioItem`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | - |
| `onValueChange` | `(value: string) => void` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-radio-group"` |

Radio item values are scoped to their parent radio group for menu highlighting
and keyboard movement, so separate groups can reuse values such as `"default"`
inside the same menu.

### RadioItem

Renders a `menuitemradio`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | required |
| `textValue` | `string` | Text child or `value` |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-checked` | Whether this value is selected by `RadioGroup` |
| `aria-disabled` | Present when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-radio-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-checked]` | Present when selected |
| `[data-state]` | `"checked" \| "unchecked"` |
| `[data-value]` | Public radio value |

### Group

Groups related menu items with `role="group"`.

A nested `Label` automatically supplies `aria-labelledby`. Explicit
`aria-label` or `aria-labelledby` remains authoritative. A Group without a
Label does not receive a generated relationship.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-group"` |

### Label

`Label` renders non-focusable group text. Inside Group or RadioGroup, its
generated ID supplies the owning group's `aria-labelledby` unless the consumer
provides an explicit accessible name.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Label exposes `[data-slot="menu-label"]`.

### ItemIndicator

`ItemIndicator` belongs inside CheckboxItem or RadioItem and renders only for
checked/mixed state unless `forceMount` is true.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `forceMount` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

It is hidden from assistive technology and exposes
`[data-slot="menu-item-indicator"]` plus `[data-state]` as `checked`,
`unchecked`, or `indeterminate`.

### Separator

Renders a horizontal separator between groups of related commands.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-orientation` | `"horizontal"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-separator"` |

### Sub

Provides controlled or uncontrolled open state for one nested submenu. It does
not render a DOM element.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |

### SubTrigger

Renders the parent `menuitem` that opens, closes, and labels its `SubContent`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | required |
| `textValue` | `string` | Text child or `value` |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-haspopup` | `"menu"` |
| `aria-expanded` | Submenu open state |
| `aria-disabled` | Present when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-sub-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-value]` | Trigger value |

### SubContent

Portals and positions the nested `menu` beside `SubTrigger`, with its own item
registry, highlight state, typeahead, and nested submenu support.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `sideOffset` | `number` | `4` |
| `loop` | `boolean` | `true` |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-orientation` | `"vertical"` |
| `aria-label` | Value from `ariaLabel` |
| `aria-labelledby` | `SubTrigger` ID when `ariaLabel` is absent |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-sub-content"` |
| `[data-menu-sub-content]` | Present on nested menu surfaces |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | Resolved side, mirrored in RTL |
| `[data-align]` | Resolved alignment |
| `[data-positioned]` | Present after positioning completes |

Advanced compound components can use `useMenuContext`,
`useMenuRadioGroupContext`, and `useMenuSubContext`. Their matching providers
and context value types are also public exports.

## Examples

### Selection Menu

```tsx
import { useState } from "react";
import { Menu } from "@flowstack-ui/atom";

export function ViewMenu() {
  const [grid, setGrid] = useState(true);
  const [density, setDensity] = useState("comfortable");

  return (
    <Menu.Root defaultOpen>
      <Menu.Content ariaLabel="View settings">
        <Menu.CheckboxItem
          value="grid"
          checked={grid}
          onCheckedChange={setGrid}
        >
          Show grid
        </Menu.CheckboxItem>
        <Menu.RadioGroup value={density} onValueChange={setDensity}>
          <Menu.RadioItem value="comfortable">Comfortable</Menu.RadioItem>
          <Menu.RadioItem value="compact">Compact</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}
```

### Nested Action Menu

```tsx
import { Menu } from "@flowstack-ui/atom";

export function ActionsMenu() {
  return (
    <Menu.Root defaultOpen>
      <Menu.Content ariaLabel="Actions">
        <Menu.Item value="duplicate" onSelect={() => console.log("Duplicate")}>
          Duplicate
        </Menu.Item>
        <Menu.Sub>
          <Menu.SubTrigger value="move">Move to</Menu.SubTrigger>
          <Menu.SubContent>
            <Menu.Item value="archive">Archive</Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
      </Menu.Content>
    </Menu.Root>
  );
}
```

## Accessibility

Follows the [WAI-ARIA menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).
`Content` renders `role="menu"`, items render the correct menu item roles,
disabled items expose disabled semantics, and keyboard focus moves on the real
item elements. Disabled items remain in navigation and typeahead but cannot
activate.
Portalled Menu content and submenu content register with a parent modal focus
scope when opened inside Dialog, Drawer, or another modal primitive.
Printable-character typeahead matches item text; a single-character
search cycles forward from the current matching item, while multi-character
buffers match exact prefixes.

| Key | Description |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Moves focus between items, including disabled items |
| `Home` / `End` | Moves focus to first or last item |
| `Enter` / `Space` | Selects the focused item unless disabled |
| `Escape` | Closes the topmost submenu first, then the root menu when enabled |
| `ArrowRight` / `ArrowLeft` | Opens or closes submenus based on direction |
| Printable character | Typeahead search |
| `Tab` / `Shift+Tab` | Closes all levels and moves after/before the owning composite |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
