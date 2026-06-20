# Modal

Shared foundation for modal dialog behavior, focus management, portals, titles, descriptions, and close controls.

## Features

- Controlled and uncontrolled open state.
- Escape-key and backdrop dismissal controls.
- Focus trap, focus restore, scroll lock, and initial focus management.
- Optional keep-mounted content support through `useModalContent`.
- Close reasons for action, cancel, backdrop, Escape, and close-button flows.
- Headless only: no styles, classes, icons, or animation opinions.

## Import

```tsx
import { Modal } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <Modal.Root>
    <Modal.Trigger />
    <Modal.Portal>
      <Modal.Title />
      <Modal.Description />
      <Modal.Close />
    </Modal.Portal>
  </Modal.Root>
);
```

## API Reference

### Root

Provides modal state and shared IDs to compound parts.

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

Opens the modal.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"modal-trigger"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"modal-trigger"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-disabled]` | Present when disabled |

### Portal

Renders modal content into a portal.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element | DocumentFragment | null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Title

Provides the accessible title referenced by modal content.

| Prop | Type | Default |
| --- | --- | --- |
| `as` | `"h1" | "h2" | "h3" | "h4" | "h5" | "h6"` | `"h2"` |
| `data-slot` | `string` | `"modal-title"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"modal-title"` |

### Description

Provides the accessible description referenced by modal content.

| Prop | Type | Default |
| --- | --- | --- |
| `data-slot` | `string` | `"modal-description"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"modal-description"` |

### Close

Closes the modal with `reason: "closeClick"`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"modal-close"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"modal-close"` |

## Examples

### Controlled Open State

```tsx
<Modal.Root open={open} onOpenChange={setOpen}>
  <Modal.Trigger>Open</Modal.Trigger>
  <Modal.Portal>
    <Modal.Title>Settings</Modal.Title>
    <Modal.Description>Change account preferences.</Modal.Description>
    <Modal.Close>Close</Modal.Close>
  </Modal.Portal>
</Modal.Root>
```

### Close Reasons

```tsx
<Modal.Root
  onOpenChange={(open, reason) => {
    if (!open && reason === "escapeKeyDown") {
      console.log("Closed with Escape");
    }
  }}
>
  ...
</Modal.Root>
```

## Accessibility

- Modal behavior is intended to be consumed through `Dialog`, `AlertDialog`, or `Drawer` content parts.
- Focus is trapped while open and restored when the modal closes.
- Provide a visible title and description when possible. Use an accessible label on the content wrapper when a visible title is not appropriate.

| Key | Description |
| --- | --- |
| `Escape` | Closes the modal when `closeOnEscape` is enabled. |
| `Tab` | Moves focus to the next focusable element inside the modal. |
| `Shift+Tab` | Moves focus to the previous focusable element inside the modal. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
