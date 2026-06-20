# ContextMenu

Headless context menu primitives for right-click and keyboard context actions.

## Features

- Opens from pointer coordinates for right-click positioning.
- Supports keyboard open with `Shift+F10` and the Context Menu key.
- Uses the shared `Menu` item, checkbox, radio, group, separator, and submenu behavior.
- Prevents accidental backdrop-close behavior from being required by consumers.
- Supports controlled and uncontrolled open state through `Root`.

## Import

```tsx
import { ContextMenu } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger />
  <ContextMenu.Content>
    <ContextMenu.Item />
    <ContextMenu.CheckboxItem />
    <ContextMenu.RadioGroup>
      <ContextMenu.RadioItem />
    </ContextMenu.RadioGroup>
    <ContextMenu.Separator />
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger />
      <ContextMenu.SubContent>
        <ContextMenu.Item />
      </ContextMenu.SubContent>
    </ContextMenu.Sub>
  </ContextMenu.Content>
</ContextMenu.Root>
```

## API Reference

### Root

Provides context-menu state and right-click anchor coordinates.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `closeOnSelect` | `boolean` | `true` |
| `loop` | `boolean` | `true` |
| `closeOnEscape` | `boolean` | `true` |

### Trigger

Wraps the area that owns the context menu.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"context-menu-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Content and Items

`Content`, `Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `Group`, `Separator`, `Sub`, `SubTrigger`, and `SubContent` use the shared `Menu` APIs. `Content` automatically receives the right-click anchor point from `Root`.

## Examples

### Basic Context Menu

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger>Right click this area</ContextMenu.Trigger>
  <ContextMenu.Content ariaLabel="Canvas actions">
    <ContextMenu.Item onSelect={copy}>Copy</ContextMenu.Item>
    <ContextMenu.Item onSelect={paste}>Paste</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
```

### Persistent View Options

```tsx
<ContextMenu.Root closeOnSelect={false}>
  <ContextMenu.Trigger>Canvas</ContextMenu.Trigger>
  <ContextMenu.Content ariaLabel="View options">
    <ContextMenu.CheckboxItem checked={snap} onCheckedChange={setSnap}>
      Snap to grid
    </ContextMenu.CheckboxItem>
  </ContextMenu.Content>
</ContextMenu.Root>
```

## Accessibility

The trigger supports mouse and keyboard context menu opening. The content follows the WAI-ARIA menu pattern inherited from `Menu`.

| Key | Description |
| --- | --- |
| `Shift+F10` | Opens the context menu |
| `ContextMenu` | Opens the context menu |
| `ArrowDown` / `ArrowUp` | Moves through menu items |
| `Escape` | Closes the menu |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
