# Dialog

Headless modal dialog primitives with focus containment, dismissal, accessible
naming, and compound state management.

## When to Use

Use Dialog when a task or piece of information must appear above the page and
the user should finish or dismiss it before returning. Use AlertDialog for a
short, urgent decision such as confirming deletion. Use Drawer when the same
modal behavior should be identified as a side sheet, and Popover for a small
non-modal layer attached to a control.

## Features

- Supports controlled and uncontrolled open state with close reasons.
- Traps focus while open, restores focus after close, and locks page scrolling.
- Supports Escape and backdrop dismissal independently.
- Closes nested dismissable layers before their parent dialog.
- Registers portalled descendant layers in the dialog focus scope.
- Supports keep-mounted content for consumer-owned exit animation.
- Provides generated title and description relationships.

## Import

```tsx
import { Dialog } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
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
```

## API Reference

### Root

Owns open state, generated IDs, dismissal options, and the trigger reference.
It renders no wrapper element.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean, reason?: ModalCloseReason) => void` | - |
| `closeOnEscape` | `boolean` | `true` |
| `closeOnBackdropClick` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `keepMounted` | `boolean` | `false` |

Close reasons include `"backdropClick"`, `"closeClick"`, and
`"escapeKeyDown"` for Dialog interactions.

### Trigger

Opens the dialog and receives the generated relationship to Content. It is a
native `button` by default; custom elements receive button semantics.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for custom elements |
| `aria-haspopup` | `"dialog"` |
| `aria-expanded` | Current open state |
| `aria-controls` | Content ID while open |
| `aria-disabled` | `"true"` when Root is disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dialog-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Portal

Moves its children to `document.body` by default without adding a wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element \| DocumentFragment \| null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Overlay

Creates the backdrop and requests a `backdropClick` close when clicked. Its own
`disabled` prop suppresses that request without disabling the whole Dialog.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `"true"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dialog-overlay"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-positioned]` | Present after the opening frames |

### Content

Renders the focus-trapped dialog panel as a `div`. Title and Description
provide its generated accessible name and description unless `ariaLabel`
supplies a fallback name.

| Prop | Type | Default |
| --- | --- | --- |
| `ariaLabel` | `string` | - |
| `role` | `"dialog" \| "alertdialog"` | `"dialog"` |

| ARIA attribute | Values |
| --- | --- |
| `role` | Value from `role` |
| `aria-modal` | `"true"` while visible |
| `aria-label` | Value from `ariaLabel` |
| `aria-labelledby` | Generated Title ID when `ariaLabel` is absent |
| `aria-describedby` | Generated Description ID |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dialog-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-positioned]` | Present after the opening frames |

With `keepMounted`, closed Content remains inside a hidden, `aria-hidden`
wrapper and does not expose `aria-modal`.

### Title

Supplies the heading referenced by Content. It renders an `h2` by default and
accepts native heading props.

| Prop | Type | Default |
| --- | --- | --- |
| `as` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h2"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dialog-title"` |

### Description

Supplies the explanatory text referenced by Content. It renders a `p` and
accepts native paragraph props.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dialog-description"` |

### Close

Closes Root with reason `"closeClick"`. It renders a native `button` by
default and supports custom composition.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dialog-close"` |

The Dialog entry point also exports `useModalContext` and `useModalContent` for
advanced custom modal parts. Prefer the namespaced parts above for ordinary
dialogs because they supply the complete focus and ARIA contract.

## Examples

### Edit Profile

```tsx
import { Dialog } from "@flowstack-ui/atom";

export function EditProfileDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Edit profile</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>Update your public account details.</Dialog.Description>
          <label>
            Display name
            <input name="displayName" />
          </label>
          <Dialog.Close>Done</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Controlled Close Reasons

```tsx
import { useState } from "react";
import { Dialog, type ModalCloseReason } from "@flowstack-ui/atom";

export function ControlledDialog() {
  const [open, setOpen] = useState(false);

  function handleOpenChange(nextOpen: boolean, reason?: ModalCloseReason) {
    setOpen(nextOpen);
    if (!nextOpen && reason) console.log(`Closed by ${reason}`);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger>Show details</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Account details</Dialog.Title>
          <Dialog.Description>Your current account information.</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## Accessibility

Dialog follows the
[WAI-ARIA Modal Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
Always provide a clear Title or `ariaLabel`; include Description when users
need context before acting. Focus moves inside when opened, remains within the
dialog and its registered descendant portals, then returns to the prior focus
target after close.

| Key | Description |
| --- | --- |
| `Escape` | Closes the topmost dialog when `closeOnEscape` is enabled. |
| `Tab` | Moves to the next focusable element in the dialog scope. |
| `Shift+Tab` | Moves to the previous focusable element in the dialog scope. |
| `Enter` / `Space` | Opens from Trigger and activates native button controls. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
