# DropdownMenu

Headless button-triggered menu primitives for actions and compact choices.

## When to Use

Use DropdownMenu when a visible button opens a short set of commands or menu
choices. Use ContextMenu when actions belong to a right-clicked target, Select
when one value is chosen for a form, and Menubar for persistent application
commands. Do not use a menu as ordinary site navigation when native links in a
NavList are sufficient.

## Features

- Supports controlled state, modal behavior, looping, and dismissal options.
- Opens from pointer or keyboard with the expected initial highlight.
- Includes actions, checkbox/radio choices, groups, separators, and submenus.
- Provides typeahead, focus restoration, collision-aware positioning, and RTL submenus.
- Registers portalled content with parent modal focus scopes.

## Import

```tsx
import { DropdownMenu } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger />
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Item />
      <DropdownMenu.CheckboxItem />
      <DropdownMenu.RadioGroup>
        <DropdownMenu.RadioItem />
      </DropdownMenu.RadioGroup>
    </DropdownMenu.Group>
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

Owns shared menu state and renders no wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `modal` | `boolean` | `true` |
| `closeOnSelect` | `boolean` | `true` |
| `loop` | `boolean` | `true` |
| `closeOnEscape` | `boolean` | `true` |

### Trigger

Renders a native button by default. Pointer clicks toggle without an initial
highlight; Enter, Space, and ArrowDown start at the first item, while ArrowUp
starts at the last.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for custom elements |
| `aria-haspopup` | `"menu"` |
| `aria-expanded` | Open state |
| `aria-controls` | Generated Content ID |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dropdown-menu-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Content

Renders the portalled vertical menu, positions it against Trigger, manages
highlight/typeahead, and restores focus on close.

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` |
| `align` | `"start" \| "center" \| "end"` | `"start"` |
| `sideOffset` | `number` | `4` |
| `loop` | `boolean` | Root `loop` |
| `ariaLabel` | `string` | - |
| `onKeyDownCapture` | `KeyboardEventHandler` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menu"` |
| `aria-orientation` | `"vertical"` |
| `aria-label` | Value from `ariaLabel` |
| `aria-labelledby` | Trigger ID when `ariaLabel` is absent |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | Resolved side |
| `[data-align]` | Resolved alignment |
| `[data-positioned]` | Present after positioning |

### Group

Renders a semantic group for related entries.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-group"` |

### Item

Represents one command. `textValue` supplies typeahead text when children are
not a plain string.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `textValue` | `string` | Text child or value |
| `onSelect` | `() => void` | - |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | Root setting |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menuitem"` |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-value]` | Item value |

### CheckboxItem

Represents an independent menu choice and stays open by default.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `textValue` | `string` | Text child or value |
| `checked` | `boolean` | `false` |
| `onCheckedChange` | `(checked: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menuitemcheckbox"` |
| `aria-checked` | Checked state |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-checkbox-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-checked]` | Present when checked |
| `[data-value]` | Item value |

### RadioGroup

Provides one controlled value to nested RadioItems.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `onValueChange` | `(value: string) => void` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-radio-group"` |

### RadioItem

Represents one mutually exclusive choice and stays open by default.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `textValue` | `string` | Text child or value |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menuitemradio"` |
| `aria-checked` | Whether its value matches RadioGroup |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-radio-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-checked]` | Present when selected |
| `[data-value]` | Item value |

### Separator

Creates a semantic horizontal boundary between entry groups.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"separator"` |
| `aria-orientation` | `"horizontal"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-separator"` |

### Sub

Owns controlled or uncontrolled state for one nested menu and renders no DOM.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |

### SubTrigger

Renders a menu item that opens SubContent by hover delay, click, or the
direction-aware submenu key.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `textValue` | `string` | Text child or value |
| `disabled` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menuitem"` |
| `aria-haspopup` | `"menu"` |
| `aria-expanded` | Sub open state |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-sub-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-value]` | Trigger value |

### SubContent

Renders a separately portalled nested menu and mirrors placement and open/close
keys in RTL.

| Prop | Type | Default |
| --- | --- | --- |
| `sideOffset` | `number` | `4` |
| `loop` | `boolean` | `true` |
| `ariaLabel` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menu"` |
| `aria-orientation` | `"vertical"` |
| `aria-label` | Value from `ariaLabel` |
| `aria-labelledby` | SubTrigger ID when unlabeled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-sub-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | Resolved side |
| `[data-positioned]` | Present after positioning |

The entry point also exports shared Menu context hooks for advanced custom
parts. Prefer the namespaced parts for the complete behavior above.

## Examples

### Project Actions

```tsx
import { DropdownMenu } from "@flowstack-ui/atom";

export function ProjectActions() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
      <DropdownMenu.Content ariaLabel="Project actions">
        <DropdownMenu.Item value="duplicate" onSelect={() => console.log("Duplicate")}>
          Duplicate
        </DropdownMenu.Item>
        <DropdownMenu.Item value="archive" onSelect={() => console.log("Archive")}>
          Archive
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
```

### Persistent View Options

```tsx
import { useState } from "react";
import { DropdownMenu } from "@flowstack-ui/atom";

export function ViewOptions() {
  const [grid, setGrid] = useState(true);
  return (
    <DropdownMenu.Root closeOnSelect={false}>
      <DropdownMenu.Trigger>View</DropdownMenu.Trigger>
      <DropdownMenu.Content ariaLabel="View options">
        <DropdownMenu.CheckboxItem value="grid" checked={grid} onCheckedChange={setGrid}>
          Show grid
        </DropdownMenu.CheckboxItem>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
```

## Accessibility

DropdownMenu follows the
[WAI-ARIA Menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).
Trigger provides the menu popup relationship, Content owns focus, and disabled
entries are skipped. Use visible Trigger text that describes the menu.

| Key | Description |
| --- | --- |
| `Enter` / `Space` / `ArrowDown` | Opens and highlights the first enabled entry. |
| `ArrowUp` | Opens and highlights the last enabled entry. |
| `ArrowDown` / `ArrowUp` | Moves through entries while open. |
| `Home` / `End` | Moves to the first or last entry. |
| Printable character | Moves by typeahead label. |
| `ArrowRight` | Opens a submenu in LTR; closes it in RTL. |
| `ArrowLeft` | Closes a submenu in LTR; opens it in RTL. |
| `Enter` / `Space` | Activates the highlighted entry. |
| `Escape` | Closes the topmost submenu or menu. |
| `Tab` | Closes and restores focus to Trigger. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
