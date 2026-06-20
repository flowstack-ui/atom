# Menu

Headless menu primitives for command menus, selection menus, groups, separators, and nested submenus.

## Features

- Full keyboard navigation for menu items and submenus.
- Supports controlled and uncontrolled open state.
- Supports checkbox and radio menu items.
- Supports grouped items, separators, and nested submenus.
- Supports configurable `closeOnSelect`, looping, escape close, side, align, and offsets.
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

Provides menu state and item registration.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `modal` | `boolean` | `true` |
| `closeOnSelect` | `boolean` | `true` |
| `loop` | `boolean` | `true` |
| `closeOnEscape` | `boolean` | `true` |

### Content

Renders the positioned `menu` surface.

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` |
| `align` | `"start" \| "center" \| "end"` | `"start"` |
| `sideOffset` | `number` | `4` |
| `loop` | `boolean` | root value |
| `ariaLabel` | `string` | - |
| `anchorPoint` | `{ x: number; y: number }` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-content"` |
| `[data-state]` | `"open"` |

### Item

Renders an actionable menu item.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | generated |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | root value |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |

### CheckboxItem

Renders a `menuitemcheckbox`.

| Prop | Type | Default |
| --- | --- | --- |
| `checked` | `boolean` | `false` |
| `onCheckedChange` | `(checked: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | root value |

### RadioGroup

Provides radio selection state for `RadioItem`.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `onValueChange` | `(value: string) => void` | - |

### RadioItem

Renders a `menuitemradio`.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | root value |

### Group

Groups related menu items.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-group"` |

### Separator

Renders a decorative separator.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-separator"` |

### Sub, SubTrigger, SubContent

Provide nested submenu behavior.

| Part | Purpose |
| --- | --- |
| `Sub` | Provides submenu state |
| `SubTrigger` | Opens the nested submenu |
| `SubContent` | Renders the nested menu surface |

## Examples

### Keep Selection Menus Open

```tsx
<Menu.Root closeOnSelect={false}>
  <Menu.Content ariaLabel="View">
    <Menu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
      Show grid
    </Menu.CheckboxItem>
    <Menu.CheckboxItem checked={rulers} onCheckedChange={setRulers}>
      Show rulers
    </Menu.CheckboxItem>
  </Menu.Content>
</Menu.Root>
```

### Close Action Items

```tsx
<Menu.Root>
  <Menu.Content ariaLabel="Actions">
    <Menu.Item onSelect={duplicate}>Duplicate</Menu.Item>
    <Menu.Item onSelect={archive}>Archive</Menu.Item>
  </Menu.Content>
</Menu.Root>
```

## Accessibility

Implements the WAI-ARIA menu pattern. `Content` renders `role="menu"`, items render the correct menu item roles, disabled items expose disabled semantics, and keyboard focus is managed inside the open menu.

| Key | Description |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Moves highlight between enabled items |
| `Home` / `End` | Moves highlight to first or last enabled item |
| `Enter` / `Space` | Selects the highlighted item |
| `Escape` | Closes the menu when enabled |
| `ArrowRight` / `ArrowLeft` | Opens or closes submenus based on direction |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
