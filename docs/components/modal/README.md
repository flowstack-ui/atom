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
- Shared layer ownership so only the topmost nested modal traps focus, dismisses,
  and owns scroll containment.
- Pre-paint layer activation, background isolation, focus containment, and body
  locking for an opening modal.
- Focus trap, focus restore, scroll lock, and initial focus management.
- Per-document wheel and touch scroll containment with exact body-style and
  scroll-position restoration.
- `Modal.Branch` registration for consumer-owned third-party portals.
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
  <Modal.Branch />
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

Custom containers are limited to an `HTMLElement` in the current document.
`ShadowRoot`, `DocumentFragment`, and cross-document containers are not
supported because Atom cannot guarantee modal focus, isolation, scroll
containment, and cleanup across those topologies. Use an ordinary same-document
element, render inline with `disabled`, or register consumer-owned portalled
content with `Modal.Branch`.

While a modal is open, Atom makes background subtrees inert. It preserves the
ancestor path to Content, Overlay, internal registered branches, and public
`Modal.Branch` nodes, including dynamically mounted branches. Separate body
portals, inline content, and nested same-document container portals are
supported. Global Toast and live-region containers are background unless they
are rendered within an owned path or wrapped by `Modal.Branch`; Atom does not
exempt `aria-live` globally.

Atom observes both topology and `inert` attribute changes while it owns the
background. If application code adds, changes, or removes author `inert` during
that interval, Atom keeps the subtree isolated while open and restores the
author's latest value when modal ownership ends.

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

### Branch

Registers a consumer-owned portalled subtree as part of the active modal. This
keeps focus inside the subtree valid and permits scrolling there while the
modal's background lock is active. Branch defaults to a `div`; use `asChild` to
register the third-party portal's existing top-level element without adding a
wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"modal-branch"` |

```tsx
<ThirdParty.Portal>
  <Modal.Branch asChild>
    <ThirdParty.Content />
  </Modal.Branch>
</ThirdParty.Portal>
```

If the portal library accepts a container, an alternative is to portal directly
into the Dialog/AlertDialog/Drawer Content element obtained through its ref. No
Branch is needed when the portalled DOM remains inside Content. A consumer-owned
body portal must use one of these two approaches; otherwise Atom treats it as
outside the modal for focus and scrolling.

Branch delegates Tab handling to the registered third-party primitive rather
than flattening its controls into the Content sequence. The primitive must keep
its documented keyboard contract (for example, close or move focus on Tab).
Atom still prevents focus from escaping the active modal. Use the Content
container alternative for ordinary DOM that should participate directly in the
dialog's Tab sequence.

Registrations are owner-counted. It is safe for the same element to be covered
by `Modal.Branch` and an Atom-owned descendant portal registration; cleanup of
either owner does not remove the surviving focus-scope registration.

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
| `aria-label` | `string` | - |
| `aria-labelledby` | `string` | - |
| `aria-describedby` | `string \| undefined` | generated when Description is registered |
| `ariaLabel` | `string` | compatibility fallback |
| `initialFocus` | `ModalFocusTarget<ModalInitialFocusDetails>` | interaction-aware default |
| `finalFocus` | `ModalFocusTarget<ModalFinalFocusDetails>` | prior focus, then mounted Trigger |

Prefer native ARIA options in new code. Explicit native values take precedence
over `ariaLabel` and generated relationships. `ariaLabel` remains supported for
backward compatibility; no additional camel-case ARIA aliases are provided.

`ModalInitialFocusDetails.interactionType` describes the opening interaction.
Pointer Trigger activation resolves to `"mouse"`, `"touch"`, or `"pen"`;
Enter/Space activation resolves to `"keyboard"`; controlled opening without a
current Atom activation transaction and synthetic `element.click()` resolve to
`"programmatic"`.

`ModalFinalFocusDetails.interactionType` describes the closing interaction and
its optional `reason` is the corresponding `ModalCloseReason`. Escape is
keyboard; Overlay dismissal retains its pointer type; Close, Action, and Cancel
retain their keyboard or pointer activation; an external controlled closure is
programmatic and has no reason.

Both focus options accept an element ref, a details callback returning an
element, or `false`. Returning `null`/`undefined`, or providing an unavailable
target, uses the default. `false` suppresses that automatic focus movement.

Important return values include `isPresent`, `isHidden`, `isPositioned`,
`dataState`, `presenceRef`, `contentProps`, `focusScope`, `onClose`, and
`closeOnBackdropClick`. Spread `contentProps` onto the element receiving
`presenceRef`; do not invent separate IDs or dialog relationships.

Modal ownership follows `open`, not animation presence. When `open` becomes
false, retained exit Content immediately loses `aria-modal`, receives
`aria-hidden="true"` and `inert`, releases background isolation and active focus,
and may remain in the DOM only until its visual exit finishes. Abrupt unmount
performs the same focus, isolation, and scroll cleanup.

## Examples

### Custom Modal Foundation

```tsx
import { useId } from "react";
import { Modal, useModalContent } from "@flowstack-ui/atom";

function ModalContent() {
  const titleId = useId();
  const descriptionId = useId();
  const modal = useModalContent({
    "aria-labelledby": titleId,
    "aria-describedby": descriptionId,
  });

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
        <h2 id={titleId}>Settings</h2>
        <p id={descriptionId}>Change account preferences.</p>
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
- Opening ownership, isolation, focus containment, and scroll locking are
  committed in layout effects before a later layout effect or browser paint can
  observe the open modal.
- Initial focus honors explicit `initialFocus`, then native `autoFocus`. Alert
  dialogs therefore keep their safe Cancel default. Touch opening otherwise
  focuses Content so the first input does not summon the virtual keyboard;
  keyboard, mouse, pen, and programmatic opening focus the first tabbable
  descendant, with Content as the fallback.
- Final focus honors explicit `finalFocus`, then restores the connected,
  focusable pre-open element, then a mounted Trigger. This supports triggerless
  controlled workflows, removed triggers, and an explicit next workflow target.
- Focus containment includes registered portalled layers owned by descendants,
  such as Select, Menu, and Popover content opened from inside the modal.
- Nested Modal roots form a shared layer stack. Only the top layer responds to
  Escape, traps focus, or owns the active scroll lock; closing it resumes its
  parent without re-running the parent's initial-focus policy.
- Focus branches carry internal containment and Tab-participation metadata.
  Menu delegates and closes on Tab, Select closes from its trigger before the
  modal advances, non-modal Popover keeps its focus-guard contract, and nested
  Dialog remains an independent top layer. Atom does not create one generic
  flattened sequence across these different primitives.
- Modal Tab traversal excludes disconnected, hidden, inert, accessibility-hidden,
  disabled, negative-tab-index, and CSS-unavailable candidates in both
  directions.
- Scroll locking permits the active Content and registered owned branches,
  including portalled Menu, Select, Popover, nested modal, and `Modal.Branch`
  content. It blocks wheel/touch movement on the background and at an owned
  region's scroll boundary so scrolling cannot chain into the page. Author
  inline body overflow, padding, position, offsets, width, and page scroll
  position are restored exactly after the final lock closes.
- Every open layer retains a document lock registration while only the top layer
  supplies active scroll regions. Parent-to-child and child-to-parent handoff
  therefore never restores body styles, calls `scrollTo`, or exposes an unlocked
  page between layers.
- A registered Title supplies `aria-labelledby`. A registered Description
  supplies `aria-describedby`; omitting Description leaves no dangling
  relationship.
- Advanced `useModalContent` wrappers should pass explicit native ARIA when the
  relationship must exist in server markup. Atom does not execute opaque wrapper
  components to predict whether they will render a Title or Description.
- Use native `aria-label` on the content wrapper when a visible title is not
  appropriate. `ariaLabel` is a compatibility fallback only.

| Key | Description |
| --- | --- |
| `Escape` | Closes the modal when `closeOnEscape` is enabled. |
| `Tab` | Moves focus to the next focusable element inside the modal. |
| `Shift+Tab` | Moves focus to the previous focusable element inside the modal. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
