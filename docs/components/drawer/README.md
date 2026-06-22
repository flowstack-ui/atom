# Drawer

Modal side-sheet dialog behavior with drawer-specific slots and placement metadata.

## Features

- Controlled and uncontrolled open state.
- Trigger, portal, overlay, content, title, description, and close parts.
- Focus trap, focus restore, Escape dismissal, backdrop dismissal, and scroll lock.
- `placement` value exposed as `data-placement` for styling.
- Keep-mounted content support for exit animations.
- Headless only: placement does not apply visual positioning by itself.

## Import

```tsx
import { Drawer } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <Drawer.Root>
    <Drawer.Trigger />
    <Drawer.Portal>
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Title />
        <Drawer.Description />
        <Drawer.Close />
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
);
```

## API Reference

### Root

Provides drawer state.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean, reason?: ModalCloseReason) => void` | - |
| `closeOnEscape` | `boolean` | `true` |
| `closeOnBackdropClick` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `keepMounted` | `boolean` | `false` |

### Trigger

Opens the drawer.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"drawer-trigger"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"drawer-trigger"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-disabled]` | Present when disabled |

### Portal

Renders overlay and content into a portal.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element | DocumentFragment | null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Overlay

Backdrop layer.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `data-slot` | `string` | `"drawer-overlay"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"drawer-overlay"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-positioned]` | Present after the first positioning frame |

### Content

Drawer panel.

| Prop | Type | Default |
| --- | --- | --- |
| `placement` | `string` | - |
| `ariaLabel` | `string` | - |
| `data-slot` | `string` | `"drawer-content"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"drawer-content"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-placement]` | Consumer-provided placement |
| `[data-positioned]` | Present after the first positioning frame |

### Title

Accessible drawer title.

| Prop | Type | Default |
| --- | --- | --- |
| `as` | `"h1" | "h2" | "h3" | "h4" | "h5" | "h6"` | `"h2"` |
| `data-slot` | `string` | `"drawer-title"` |

### Description

Accessible drawer description.

| Prop | Type | Default |
| --- | --- | --- |
| `data-slot` | `string` | `"drawer-description"` |

### Close

Closes the drawer with `reason: "closeClick"`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"drawer-close"` |

## Examples

### Left Drawer

```tsx
<Drawer.Root>
  <Drawer.Trigger>Open navigation</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay />
    <Drawer.Content placement="left" ariaLabel="Navigation">
      <Drawer.Title>Navigation</Drawer.Title>
      <Drawer.Close>Close</Drawer.Close>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
```

### Keep Mounted for Transitions

```tsx
<Drawer.Root keepMounted>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Content placement="right">...</Drawer.Content>
</Drawer.Root>
```

## Accessibility

Drawer uses modal dialog behavior. It should have an accessible name from `Drawer.Title` or an `ariaLabel` on content.
Focus remains contained inside the drawer scope, including registered portalled
layers opened by descendants.

| Key | Description |
| --- | --- |
| `Escape` | Closes the drawer when `closeOnEscape` is enabled. |
| `Tab` | Moves focus to the next focusable element inside the drawer. |
| `Shift+Tab` | Moves focus to the previous focusable element inside the drawer. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
