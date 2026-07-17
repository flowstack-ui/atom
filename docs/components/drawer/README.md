# Drawer

Headless modal side-sheet primitives with drawer-specific parts and placement
metadata.

## When to Use

Use Drawer when a modal task or navigation panel should enter from an edge of
the screen. Use Dialog when the panel belongs in the center or has no edge
meaning. Use an ordinary inline panel when the page should remain fully usable
while it is open. Drawer provides behavior and placement metadata, but your
application owns its visual position and motion.

## Features

- Supports controlled and uncontrolled open state with close reasons.
- Traps and restores focus, locks scrolling, and contains descendant portals.
- Supports independent Escape, backdrop, and Overlay dismissal controls.
- Exposes consumer-provided placement through `[data-placement]`.
- Supports keep-mounted content for consumer-owned transitions.
- Provides generated title and description relationships.
- Remains headless: placement does not apply layout or animation.

## Import

```tsx
import { Drawer } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
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
```

## API Reference

### Root

Owns drawer state, dismissal settings, generated IDs, and focus restoration.
It renders no wrapper.

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

Opens the drawer. It renders a native `button` by default and supplies button
semantics when composed onto a custom element.

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
| `[data-slot]` | `"drawer-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Portal

Moves Overlay and Content to `document.body` by default without creating a
wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `HTMLElement \| null` | `document.body` |
| `disabled` | `boolean` | `false` |

The container must be an `HTMLElement` in the current document. `ShadowRoot`,
`DocumentFragment`, and cross-document containers are unsupported. Atom keeps
the ancestor paths to separate Overlay and Content portals, inline Content,
nested same-document containers, and registered branches active while making
background subtrees inert. Global Toast/live-region containers are background
unless they are within an owned path or registered with `Modal.Branch`.

### Overlay

Renders the accessibility-hidden backdrop. Clicking it closes with reason
`"backdropClick"` unless Root or this Overlay disables backdrop dismissal.
Overlay and Content must be siblings; Atom rejects Content nested beneath the
Overlay's `aria-hidden` subtree. Bubbled clicks from Overlay descendants are not
backdrop clicks and do not dismiss the Drawer.
Separate portals are valid when the committed Content DOM is outside Overlay.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `"true"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"drawer-overlay"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-positioned]` | Present after the opening frames |

### Content

Renders the focus-trapped panel as a `div`. `placement` is copied to a data
attribute only; it does not apply positioning.

| Prop | Type | Default |
| --- | --- | --- |
| `placement` | `string` | - |
| `aria-label` | `string` | - |
| `aria-labelledby` | `string` | generated from Title when present |
| `aria-describedby` | `string \| undefined` | generated from Description when present |
| `ariaLabel` | `string` | compatibility fallback |
| `initialFocus` | `ModalFocusTarget<ModalInitialFocusDetails>` | interaction-aware default |
| `finalFocus` | `ModalFocusTarget<ModalFinalFocusDetails>` | prior focus, then Trigger |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"dialog"` |
| `aria-modal` | `"true"` while open |
| `aria-hidden` | `"true"` while retained only for exit presence |
| `inert` | Present while retained only for exit presence |
| `aria-label` | Explicit native value, otherwise `ariaLabel` compatibility value |
| `aria-labelledby` | Explicit native value, otherwise registered Title ID |
| `aria-describedby` | Explicit native value, otherwise registered Description ID |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"drawer-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-placement]` | Consumer-provided placement string |
| `[data-positioned]` | Present after the opening frames |

With `keepMounted`, closed Content remains inside a hidden, `aria-hidden`
wrapper and preserves its class name and placement metadata.

Exit-animated Content retained after close immediately loses `aria-modal` and
becomes inert and accessibility-hidden. Background isolation, focus ownership,
and active scroll containment end when `open` becomes false, not when the visual
exit ends.

### Title

Provides the heading referenced by Content. It renders an `h2` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `as` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h2"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"drawer-title"` |

### Description

Provides supporting text referenced by Content. It renders a native `p`.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"drawer-description"` |

### Close

Closes Root with reason `"closeClick"`. It renders a native `button` by
default and supports custom composition.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"drawer-close"` |

The Drawer entry point also exports `useModalContext` and `useModalContent` for
advanced custom modal parts. The namespaced parts are preferred for ordinary
drawers because they provide the complete contract above.

For a consumer-owned third-party portal outside Content, use
`<Modal.Branch asChild>` around its top-level element or configure the portal to
target the Drawer Content element. Nested modal layers suspend the parent
Drawer's trap, dismissal, and scroll ownership while the child is topmost.
Long Drawer Content and registered portalled controls remain scrollable while
background wheel/touch movement and scroll chaining are blocked.

## Examples

### Navigation Drawer

```tsx
import { Drawer } from "@flowstack-ui/atom";

export function NavigationDrawer() {
  return (
    <Drawer.Root>
      <Drawer.Trigger>Open navigation</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content placement="left">
          <Drawer.Title>Navigation</Drawer.Title>
          <Drawer.Description>Choose an area of the application.</Drawer.Description>
          <nav aria-label="Primary">
            <a href="/projects">Projects</a>
            <a href="/settings">Settings</a>
          </nav>
          <Drawer.Close>Close navigation</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

### Controlled Drawer

```tsx
import { useState } from "react";
import { Drawer } from "@flowstack-ui/atom";

export function ControlledDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger>Show filters</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content placement="right">
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.Description>Narrow the visible results.</Drawer.Description>
          <Drawer.Close>Apply filters</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

## Accessibility

Drawer uses the
[WAI-ARIA Modal Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
Give every drawer a Title or native `aria-label`, and add Description when the
purpose needs more explanation. `ariaLabel` remains a compatibility fallback;
native ARIA is preferred and takes precedence. Atom omits `aria-describedby`
when no Description is registered. Focus moves inside on open, stays within the drawer and
its registered descendant portals, and restores after close. Touch opening
focuses Content by default instead of immediately focusing an input; native
`autoFocus` and explicit `initialFocus` take precedence. Use `finalFocus` for a
different next workflow target or `false` to suppress automatic restoration.
its registered descendant portals, and returns after close.

| Key | Description |
| --- | --- |
| `Escape` | Closes the topmost drawer when `closeOnEscape` is enabled. |
| `Tab` | Moves to the next focusable element in the drawer scope. |
| `Shift+Tab` | Moves to the previous focusable element in the drawer scope. |
| `Enter` / `Space` | Opens from Trigger and activates native button controls. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
