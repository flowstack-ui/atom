# Modal

Shared foundation for modal dialog behavior, focus management, portals, titles, descriptions, and close controls.

## When to Use

Use Modal when building another primitive that must keep attention inside an
overlay until it closes. Most applications should use Dialog, AlertDialog, or
Drawer instead because those components already provide a complete content
surface. Use Popover when people must still interact with the page behind the
floating content.

## Features

- Controlled and uncontrolled open state.
- Escape-key and backdrop dismissal controls.
- Stack-aware Escape dismissal so nested overlays close before the parent modal.
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
<Modal.Root>
  <Modal.Trigger />
  <Modal.Portal>
    <Modal.Title />
    <Modal.Description />
    <Modal.Close />
  </Modal.Portal>
</Modal.Root>

useModalContent()
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

Renders the control that opens the modal and connects it to the generated modal
content ID.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-haspopup` | `"dialog"` |
| `aria-expanded` | Modal open state |
| `aria-controls` | Modal ID while open |
| `aria-disabled` | Present when the root is disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"modal-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Portal

Moves modal content to `document.body` or a supplied container. Set `disabled`
to leave the children in their original DOM location.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `container` | `HTMLElement \| null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Title

Provides the accessible title referenced by modal content.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `as` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h2"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"modal-title"` |

### Description

Provides the accessible description referenced by modal content.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"modal-description"` |

### Close

Closes the modal with `reason: "closeClick"`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"modal-close"` |

### useModalContent

Builds the modal content wrapper used by higher-level primitives. It supplies
presence state, dialog ARIA relationships, focus containment, scroll locking,
Escape dismissal, and a focus scope for descendant portals.

| Option | Type | Default |
| --- | --- | --- |
| `role` | `"dialog" \| "alertdialog"` | `"dialog"` |
| `ariaLabel` | `string` | - |

Important return values include `isPresent`, `isHidden`, `isPositioned`,
`dataState`, `presenceRef`, `contentProps`, `focusScope`, `onClose`, and
`closeOnBackdropClick`. Spread `contentProps` onto the element receiving
`presenceRef`; do not invent separate IDs or dialog relationships.

## Examples

### Custom Modal Foundation

```tsx
import { Modal, useModalContent } from "@flowstack-ui/atom";

function ModalContent() {
  const modal = useModalContent();

  if (!modal.isPresent) return null;

  return (
    <Modal.Portal>
      <div
        {...modal.contentProps}
        ref={modal.presenceRef}
        hidden={modal.isHidden}
        data-state={modal.dataState}
        data-positioned={modal.isPositioned ? "" : undefined}
      >
        <Modal.Title>Settings</Modal.Title>
        <Modal.Description>Change account preferences.</Modal.Description>
        <Modal.Close>Close</Modal.Close>
      </div>
    </Modal.Portal>
  );
}

export function SettingsModal() {
  return (
    <Modal.Root>
      <Modal.Trigger>Open settings</Modal.Trigger>
      <ModalContent />
    </Modal.Root>
  );
}
```

`onOpenChange` receives a `ModalCloseReason` when the modal closes, allowing a
higher-level primitive to distinguish Escape, backdrop, action, cancel, and
close-control dismissal.

## Accessibility

Modal supplies the foundation for the [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
It is normally consumed through `Dialog`, `AlertDialog`, or `Drawer` content
parts.

- Focus is trapped while open and restored when the modal closes.
- Focus containment includes registered portalled layers owned by descendants,
  such as Select, Menu, and Popover content opened from inside the modal.
- Provide a visible title and description when possible. Use an accessible label on the content wrapper when a visible title is not appropriate.

| Key | Description |
| --- | --- |
| `Escape` | Closes the modal when `closeOnEscape` is enabled. |
| `Tab` | Moves focus to the next focusable element inside the modal. |
| `Shift+Tab` | Moves focus to the previous focusable element inside the modal. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
