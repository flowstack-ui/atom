# Dialog

Accessible dialog anatomy built on Modal behavior.

## Features

- Controlled and uncontrolled open state.
- Trigger, portal, overlay, content, title, description, and close parts.
- Focus trap, focus restore, Escape dismissal, backdrop dismissal, and scroll lock.
- Stack-aware Escape dismissal so nested overlays close before the parent dialog.
- Keep-mounted content support for exit animations.
- Dialog-specific `data-slot` values for every public part.

## Import

```tsx
import { Dialog } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <Dialog.Root>
    <Dialog.Trigger />
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Title />
        <Dialog.Description />
        <Dialog.Close />
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

## API Reference

### Root

Provides dialog state.

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

Opens the dialog.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"dialog-trigger"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dialog-trigger"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-disabled]` | Present when disabled |

### Portal

Renders overlay and content into a portal.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element | DocumentFragment | null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Overlay

Backdrop layer. Clicking it closes the dialog when backdrop dismissal is enabled.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `data-slot` | `string` | `"dialog-overlay"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dialog-overlay"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-positioned]` | Present after the first positioning frame |

### Content

Dialog panel.

| Prop | Type | Default |
| --- | --- | --- |
| `ariaLabel` | `string` | - |
| `role` | `"dialog" | "alertdialog"` | `"dialog"` |
| `data-slot` | `string` | `"dialog-content"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dialog-content"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-positioned]` | Present after the first positioning frame |

### Title

Accessible dialog title.

| Prop | Type | Default |
| --- | --- | --- |
| `as` | `"h1" | "h2" | "h3" | "h4" | "h5" | "h6"` | `"h2"` |
| `data-slot` | `string` | `"dialog-title"` |

### Description

Accessible dialog description.

| Prop | Type | Default |
| --- | --- | --- |
| `data-slot` | `string` | `"dialog-description"` |

### Close

Closes the dialog with `reason: "closeClick"`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"dialog-close"` |

## Examples

### Basic Dialog

```tsx
<Dialog.Root>
  <Dialog.Trigger>Edit profile</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Update account details.</Dialog.Description>
      <Dialog.Close>Done</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Keep Mounted for Exit Animation

```tsx
<Dialog.Root keepMounted>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>...</Dialog.Content>
</Dialog.Root>
```

## Accessibility

Adheres to the modal dialog behavior expected by the WAI-ARIA dialog pattern.
Focus remains contained inside the dialog scope, including registered portalled
layers opened by descendants.

| Key | Description |
| --- | --- |
| `Escape` | Closes the dialog when `closeOnEscape` is enabled. |
| `Tab` | Moves focus to the next focusable element inside the dialog. |
| `Shift+Tab` | Moves focus to the previous focusable element inside the dialog. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
