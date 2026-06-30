# DropdownMenu

Headless trigger-driven menu primitives for button dropdowns.

## Features

- Uses the shared `Menu` item, checkbox, radio, group, separator, and submenu behavior.
- Provides a keyboard-accessible trigger with `aria-haspopup`, `aria-expanded`, and stable `aria-controls`.
- Supports controlled and uncontrolled open state through `Root`.
- Supports initial highlight direction for `ArrowDown` and `ArrowUp`.
- Inherits shared Menu typeahead behavior for printable-character searches.
- Supports `asChild` and `render` trigger composition.

## Import

```tsx
import { DropdownMenu } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger />
  <DropdownMenu.Content>
    <DropdownMenu.Item />
    <DropdownMenu.CheckboxItem />
    <DropdownMenu.RadioGroup>
      <DropdownMenu.RadioItem />
    </DropdownMenu.RadioGroup>
    <DropdownMenu.Separator />
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger />
      <DropdownMenu.SubContent>
        <DropdownMenu.Item />
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## API Reference

### Root

See `Menu.Root`. DropdownMenu uses the same root state API.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `closeOnSelect` | `boolean` | `true` |
| `loop` | `boolean` | `true` |
| `closeOnEscape` | `boolean` | `true` |

### Trigger

Opens and closes the dropdown menu.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dropdown-menu-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Content and Items

`Content`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Group`, `Separator`, `Sub`, `SubTrigger`, and `SubContent` use the shared `Menu` APIs.

## Examples

### Actions

```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
  <DropdownMenu.Content ariaLabel="Actions">
    <DropdownMenu.Item onSelect={duplicate}>Duplicate</DropdownMenu.Item>
    <DropdownMenu.Item onSelect={archive}>Archive</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

### Selection Menu

```tsx
<DropdownMenu.Root closeOnSelect={false}>
  <DropdownMenu.Trigger>View</DropdownMenu.Trigger>
  <DropdownMenu.Content ariaLabel="View">
    <DropdownMenu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
      Show grid
    </DropdownMenu.CheckboxItem>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## Accessibility

The trigger is a button-like control and the content follows the WAI-ARIA menu pattern inherited from `Menu`.
Portalled menu content registers with a parent modal focus scope when opened
inside Dialog, Drawer, or another modal primitive.
Pointer clicks open the menu without pre-highlighting an item. Keyboard opening
seeds the expected item highlight for immediate arrow-key interaction.

| Key | Description |
| --- | --- |
| `Enter` / `Space` | Opens the menu and highlights the first item |
| `ArrowDown` | Opens and highlights the first item |
| `ArrowUp` | Opens and highlights the last item |
| `Escape` | Closes the topmost submenu first, then the dropdown |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
