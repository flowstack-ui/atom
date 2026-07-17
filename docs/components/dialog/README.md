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
| `container` | `HTMLElement \| null` | `document.body` |
| `disabled` | `boolean` | `false` |

The container must be an `HTMLElement` in the current document. `ShadowRoot`,
`DocumentFragment`, and cross-document containers are unsupported. Atom keeps
the ancestor paths to separate Overlay and Content portals, inline Content,
nested same-document containers, and registered branches active while making
background subtrees inert.

### Overlay

Creates the backdrop and requests a `backdropClick` close when clicked. Its own
`disabled` prop suppresses that request without disabling the whole Dialog.
Overlay and Content must be siblings: Content nested beneath Overlay would be
inside an `aria-hidden` subtree and Atom rejects that composition. Clicks that
bubble from Overlay descendants do not dismiss the Dialog; only a click whose
target is Overlay itself is a backdrop click.
Separate portals are valid when the committed Content DOM is outside Overlay.

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

Renders the focus-trapped dialog panel as a `div`. Registered Title and
Description parts provide generated relationships unless explicit native ARIA
is supplied.

| Prop | Type | Default |
| --- | --- | --- |
| `aria-label` | `string` | - |
| `aria-labelledby` | `string` | generated from Title when present |
| `aria-describedby` | `string \| undefined` | generated from Description when present |
| `ariaLabel` | `string` | compatibility fallback |
| `initialFocus` | `ModalFocusTarget<ModalInitialFocusDetails>` | interaction-aware default |
| `finalFocus` | `ModalFocusTarget<ModalFinalFocusDetails>` | prior focus, then Trigger |
| `role` | `"dialog" \| "alertdialog"` | `"dialog"` |

| ARIA attribute | Values |
| --- | --- |
| `role` | Value from `role` |
| `aria-modal` | `"true"` while open |
| `aria-hidden` | `"true"` while retained only for exit presence |
| `inert` | Present while retained only for exit presence |
| `aria-label` | Explicit native value, otherwise `ariaLabel` compatibility value |
| `aria-labelledby` | Explicit native value, otherwise registered Title ID |
| `aria-describedby` | Explicit native value, otherwise registered Description ID |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dialog-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-positioned]` | Present after the opening frames |

With `keepMounted`, closed Content remains inside a hidden, `aria-hidden`
wrapper and does not expose `aria-modal`.

If an exit animation keeps Content present after `open` becomes false, Content
immediately becomes inert and accessibility-hidden and loses `aria-modal` while
the visual exit completes. Background isolation, active focus containment, and
scroll ownership end at close rather than at animation completion.

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

For consumer-owned third-party content portalled outside Content, wrap its
top-level element in `<Modal.Branch asChild>` or configure the third-party portal
to use the Content element as its container. Unregistered body portals are
outside the dialog's focus and scroll ownership.

Global Toast and live-region containers are treated as background while the
Dialog is open unless they are inside Content or registered with
`Modal.Branch`.

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
Always provide a clear Title or native `aria-label`; include Description when
users need context before acting. `ariaLabel` remains a compatibility fallback,
but native ARIA is preferred and takes precedence. Description is optional and
Atom omits `aria-describedby` when none is registered. If Title or Description
is hidden behind an opaque wrapper during server rendering, provide the native
relationship explicitly. Focus moves inside when opened, remains within the
dialog and its registered descendant portals, then returns to the prior focus
target after close.

Nested dialogs share the Modal layer stack. Only the topmost dialog traps focus,
handles Escape or Overlay dismissal, and owns active scroll containment.
Long Content and registered portalled controls remain scrollable; background
wheel and touch movement, including boundary chaining, is suppressed. Atom
restores the page's prior body styles and scroll position after close.

On touch opening, the default initial target is Content rather than the first
input, avoiding immediate virtual-keyboard activation. Native `autoFocus` and
explicit `initialFocus` take precedence. Use `finalFocus` when the next logical
workflow target differs from the opener; `false` suppresses either automatic
focus step. The initial callback receives the opening interaction, while the
final callback receives the closing interaction and close reason.

| Key | Description |
| --- | --- |
| `Escape` | Closes the topmost dialog when `closeOnEscape` is enabled. |
| `Tab` | Moves to the next focusable element in the dialog scope. |
| `Shift+Tab` | Moves to the previous focusable element in the dialog scope. |
| `Enter` / `Space` | Opens from Trigger and activates native button controls. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
