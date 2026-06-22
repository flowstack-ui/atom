# Menubar

Headless horizontal menubar primitives for application-style menu systems.

## Features

- Renders `role="menubar"` with menu trigger and content behavior.
- Opens adjacent top-level menus with arrow keys.
- Uses the shared `Menu` item, checkbox, radio, group, separator, and submenu behavior.
- Supports controlled and uncontrolled active menu state.
- Supports configurable `closeOnSelect`, looping, and escape close per menu.

## Import

```tsx
import { Menubar } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Menubar.Root>
  <Menubar.Menu value="file">
    <Menubar.Trigger />
    <Menubar.Content>
      <Menubar.Item />
      <Menubar.CheckboxItem />
      <Menubar.RadioGroup>
        <Menubar.RadioItem />
      </Menubar.RadioGroup>
      <Menubar.Separator />
      <Menubar.Sub>
        <Menubar.SubTrigger />
        <Menubar.SubContent>
          <Menubar.Item />
        </Menubar.SubContent>
      </Menubar.Sub>
    </Menubar.Content>
  </Menubar.Menu>
</Menubar.Root>
```

## API Reference

### Root

Contains the top-level menus.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string \| null` | - |
| `defaultValue` | `string` | - |
| `onValueChange` | `(value: string \| null) => void` | - |
| `loop` | `boolean` | `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menubar"` |

### Menu

Provides one top-level menu scope.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `closeOnSelect` | `boolean` | `true` |
| `loop` | `boolean` | `true` |
| `closeOnEscape` | `boolean` | `true` |

### Trigger

Opens one top-level menu.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menubar-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Content and Items

`Content`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Group`, `Separator`, `Sub`, `SubTrigger`, and `SubContent` use the shared `Menu` APIs.

## Examples

### Application Menu

```tsx
<Menubar.Root>
  <Menubar.Menu value="file">
    <Menubar.Trigger>File</Menubar.Trigger>
    <Menubar.Content ariaLabel="File">
      <Menubar.Item onSelect={newFile}>New</Menubar.Item>
      <Menubar.Item onSelect={openFile}>Open</Menubar.Item>
    </Menubar.Content>
  </Menubar.Menu>
</Menubar.Root>
```

### View Menu With Checkboxes

```tsx
<Menubar.Menu value="view" closeOnSelect={false}>
  <Menubar.Trigger>View</Menubar.Trigger>
  <Menubar.Content ariaLabel="View">
    <Menubar.CheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>
      Status bar
    </Menubar.CheckboxItem>
  </Menubar.Content>
</Menubar.Menu>
```

## Accessibility

Implements a horizontal menubar pattern. Top-level triggers use roving focus and open menus with keyboard or pointer input.
Portalled menu content registers with a parent modal focus scope when opened
inside Dialog, Drawer, or another modal primitive.

| Key | Description |
| --- | --- |
| `ArrowRight` / `ArrowLeft` | Moves between top-level menus |
| `ArrowDown` | Opens a menu and highlights the first item |
| `ArrowUp` | Opens a menu and highlights the last item |
| `Enter` / `Space` | Opens a trigger or selects an item |
| `Escape` | Closes the active menu |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
