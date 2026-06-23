# AlertDialog

Modal alert dialog behavior for destructive actions, confirmations, and decisions that require immediate attention.

## Features

- Forces `role="alertdialog"` on content.
- Prevents backdrop-click dismissal by design.
- Trigger, portal, overlay, content, title, description, cancel, and action parts.
- Cancel button autofocus by default.
- Close reasons for action and cancel flows.
- Focus trap, focus restore, Escape dismissal, and scroll lock inherited from Modal.
- Stack-aware Escape dismissal so nested overlays close before the parent alert dialog.

## Import

```tsx
import { AlertDialog } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <AlertDialog.Root>
    <AlertDialog.Trigger />
    <AlertDialog.Portal>
      <AlertDialog.Overlay />
      <AlertDialog.Content>
        <AlertDialog.Title />
        <AlertDialog.Description />
        <AlertDialog.Cancel />
        <AlertDialog.Action />
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
```

## API Reference

### Root

Provides alert dialog state. Backdrop-click dismissal is intentionally not exposed.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean, reason?: AlertDialogCloseReason) => void` | - |
| `closeOnEscape` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `keepMounted` | `boolean` | `false` |

### Trigger

Opens the alert dialog.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"alert-dialog-trigger"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"alert-dialog-trigger"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-disabled]` | Present when disabled |

### Portal

Renders overlay and content into a portal.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element | DocumentFragment | null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Overlay

Backdrop layer. It does not close the alert dialog.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `data-slot` | `string` | `"alert-dialog-overlay"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"alert-dialog-overlay"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-positioned]` | Present after the first positioning frame |

### Content

Alert dialog panel.

| Prop | Type | Default |
| --- | --- | --- |
| `ariaLabel` | `string` | - |
| `data-slot` | `string` | `"alert-dialog-content"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"alert-dialog-content"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-positioned]` | Present after the first positioning frame |

### Title

Accessible alert dialog title.

| Prop | Type | Default |
| --- | --- | --- |
| `as` | `"h1" | "h2" | "h3" | "h4" | "h5" | "h6"` | `"h2"` |
| `data-slot` | `string` | `"alert-dialog-title"` |

### Description

Accessible alert dialog description.

| Prop | Type | Default |
| --- | --- | --- |
| `data-slot` | `string` | `"alert-dialog-description"` |

### Cancel

Cancels the action and closes with `reason: "cancelClick"`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `autoFocus` | `boolean` | `true` |
| `data-slot` | `string` | `"alert-dialog-cancel"` |

### Action

Confirms the action and closes with `reason: "actionClick"`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"alert-dialog-action"` |

## Examples

### Destructive Confirmation

```tsx
<AlertDialog.Root>
  <AlertDialog.Trigger>Delete project</AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Overlay />
    <AlertDialog.Content>
      <AlertDialog.Title>Delete project?</AlertDialog.Title>
      <AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action>Delete</AlertDialog.Action>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

### Track Confirm and Cancel

```tsx
<AlertDialog.Root
  onOpenChange={(open, reason) => {
    if (!open && reason === "actionClick") {
      confirmDelete();
    }
  }}
>
  ...
</AlertDialog.Root>
```

## Accessibility

Use AlertDialog only when the user must acknowledge or decide before continuing. For ordinary dialogs, use `Dialog`.

| Key | Description |
| --- | --- |
| `Escape` | Closes the alert dialog when `closeOnEscape` is enabled. |
| `Tab` | Moves focus to the next focusable element inside the alert dialog. |
| `Shift+Tab` | Moves focus to the previous focusable element inside the alert dialog. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
