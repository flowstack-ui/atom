# Menu

Headless menu primitives for command menus, selection menus, groups, separators, and nested submenus.

## When to Use

Use Menu for a temporary list of commands or settings, such as Duplicate,
Archive, or Show grid. Use Select or Listbox when the main job is choosing a
form value, NavigationMenu for links that move around a website, and Menubar
when several top-level application menus must sit in one horizontal row.

## Features

- Full keyboard navigation for menu items and submenus.
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
  <Menu.Content>
    <Menu.Group>
      <Menu.Item />
      <Menu.CheckboxItem />
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

Portals and positions the focus-managed `menu` surface. It restores focus when
closed and locks document scrolling while a modal menu is open.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` |
| `align` | `"start" \| "center" \| "end"` | `"start"` |
| `sideOffset` | `number` | `4` |
| `loop` | `boolean` | root value |
| `ariaLabel` | `string` | - |
| `anchorPoint` | `{ x: number; y: number }` | - |

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
| `checked` | `boolean` | `false` |
| `onCheckedChange` | `(checked: boolean) => void` | - |
| `value` | `string` | required |
| `textValue` | `string` | Text child or `value` |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `aria-checked` | Current checked state |
| `aria-disabled` | Present when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-checkbox-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-checked]` | Present when checked |
| `[data-value]` | Item value |

### RadioGroup

Provides radio selection state for `RadioItem`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | - |
| `onValueChange` | `(value: string) => void` | - |

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
| `[data-value]` | Public radio value |

### Group

Groups related menu items with `role="group"`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-group"` |

### Separator

Renders a horizontal separator between groups of related commands.

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
disabled items expose disabled semantics, and keyboard focus is managed inside
the open menu.
Portalled Menu content and submenu content register with a parent modal focus
scope when opened inside Dialog, Drawer, or another modal primitive.
Printable-character typeahead matches enabled item text; a single-character
search cycles forward from the current matching item, while multi-character
buffers match exact prefixes.

| Key | Description |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Moves highlight between enabled items |
| `Home` / `End` | Moves highlight to first or last enabled item |
| `Enter` / `Space` | Selects the highlighted item |
| `Escape` | Closes the topmost submenu first, then the root menu when enabled |
| `ArrowRight` / `ArrowLeft` | Opens or closes submenus based on direction |
| Printable character | Typeahead search |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
