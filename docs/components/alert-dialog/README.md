# AlertDialog

Modal alert dialog behavior for urgent confirmations and decisions that require
an answer before the user can continue.

## When to Use

Use AlertDialog when the user must stop and make an important choice, such as
confirming a destructive action or acknowledging a serious consequence. Use
`Dialog` for ordinary forms, settings, and information that does not require an
urgent decision.

## Features

- Forces `role="alertdialog"` on Content.
- Prevents backdrop-click dismissal by design.
- Supports controlled and uncontrolled open state.
- Autofocuses Cancel by default so the safer choice receives initial focus.
- Reports action, cancel, and Escape close reasons.
- Traps focus, restores focus, handles Escape, and locks document scrolling.
- Uses stack-aware Escape dismissal so nested overlays close first.
- Supports optional portals and keep-mounted content.

## Import

```tsx
import { AlertDialog } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
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
```

## API Reference

### Root

Owns the alert dialog's open state and close policy. Root renders no DOM element;
it provides state and generated IDs to the other parts.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean, reason?: AlertDialogCloseReason) => void` | - |
| `closeOnEscape` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `keepMounted` | `boolean` | `false` |

Backdrop dismissal is always disabled and is not exposed as a Root prop.

### Trigger

Opens the alert dialog and stores the element used for focus restoration. It
renders a native `button` by default and accepts native button props.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for custom renders |
| `aria-haspopup` | `"dialog"` |
| `aria-expanded` | `"true" \| "false"` |
| `aria-controls` | Content ID while open |
| `aria-disabled` | `"true"` when Root is disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"alert-dialog-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when Root is disabled |

### Portal

Moves its children to `document.body` after mounting, or to a supplied
container. Set `disabled` to render the children in place.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element \| DocumentFragment \| null` | `document.body` |
| `disabled` | `boolean` | `false` |

Portal renders no wrapper element.

### Overlay

Renders the assistive-technology-hidden backdrop while the alert dialog is
present. Clicking it never closes an AlertDialog.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `"true"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"alert-dialog-overlay"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-positioned]` | Present after the first positioning frame |

### Content

Renders the modal alert dialog panel, traps focus while open, restores focus on
close, and supplies the generated title and description relationships.

| Prop | Type | Default |
| --- | --- | --- |
| `ariaLabel` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"alertdialog"` |
| `aria-modal` | `"true"` while visible |
| `aria-labelledby` | Generated Title ID when `ariaLabel` is not provided |
| `aria-label` | Value from `ariaLabel` when provided |
| `aria-describedby` | Generated Description ID |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"alert-dialog-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-positioned]` | Present after the first positioning frame |

### Title

Renders the visible heading that names Content. It receives the generated ID
referenced by `aria-labelledby` and renders an `h2` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `as` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h2"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"alert-dialog-title"` |

### Description

Renders a `p` that explains the consequence or decision. It receives the
generated ID referenced by Content's `aria-describedby`.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"alert-dialog-description"` |

### Cancel

Renders the safer control, closes with `reason: "cancelClick"`, and receives
initial focus by default. It renders a native `button` unless composed.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `autoFocus` | `boolean` | `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"alert-dialog-cancel"` |

### Action

Renders the confirmation control and closes with `reason: "actionClick"` after
its consumer click handler runs. It renders a native `button` unless composed.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"alert-dialog-action"` |

## Examples

### Destructive Confirmation

```tsx
import { AlertDialog } from "@flowstack-ui/atom";

export function DeleteProjectDialog() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>Delete project</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay />
        <AlertDialog.Content>
          <AlertDialog.Title>Delete project?</AlertDialog.Title>
          <AlertDialog.Description>
            This permanently removes the project and cannot be undone.
          </AlertDialog.Description>
          <AlertDialog.Cancel>Keep project</AlertDialog.Cancel>
          <AlertDialog.Action>Delete project</AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
```

### Track the Decision

```tsx
import { AlertDialog } from "@flowstack-ui/atom";

export function TrackedAlertDialog() {
  return (
    <AlertDialog.Root
      onOpenChange={(open, reason) => {
        if (!open) {
          console.log(`Alert dialog closed: ${reason ?? "unknown"}`);
        }
      }}
    >
      <AlertDialog.Trigger>Reset settings</AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Title>Reset every setting?</AlertDialog.Title>
        <AlertDialog.Description>
          Your preferences will return to their original values.
        </AlertDialog.Description>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action>Reset settings</AlertDialog.Action>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
```

## Accessibility

AlertDialog follows the
[WAI-ARIA Alert Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/).
Content has `role="alertdialog"` and `aria-modal="true"`. Provide a Title or an
`ariaLabel`, and always provide a Description that clearly explains the
consequence. Cancel receives initial focus by default so destructive dialogs do
not place focus on the destructive action.

Focus stays inside the open dialog and returns to the Trigger after closing.
Backdrop clicks do not dismiss the dialog.

| Key | Description |
| --- | --- |
| `Escape` | Closes the alert dialog when `closeOnEscape` is enabled. |
| `Tab` | Moves to the next focusable element, wrapping inside Content. |
| `Shift+Tab` | Moves to the previous focusable element, wrapping inside Content. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
