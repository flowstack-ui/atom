# Collapsible

Headless disclosure primitives for showing and hiding one section of content.

## When to Use

Use Collapsible when one control reveals one related block, such as advanced
settings, extra details, or a filter panel. Use Accordion when several named
sections belong together and users move between them. Use Dialog when the
content must interrupt the page in a separate modal layer.

## Features

- Supports controlled and uncontrolled open state.
- Connects Trigger and Content with generated ARIA IDs.
- Supports disabled triggers and custom trigger rendering.
- Keeps Content mounted on request for exit animations.
- Exposes open state and measured content height for consumer-owned animation.

## Import

```tsx
import { Collapsible } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Collapsible.Root>
  <Collapsible.Trigger />
  <Collapsible.Content />
</Collapsible.Root>
```

## API Reference

### Root

Owns the disclosure state and shares it with Trigger and Content. It renders a
`div` by default and accepts native div props.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"collapsible"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Trigger

Toggles Content. It renders a native `button` by default and preserves button
keyboard behavior; custom elements receive button semantics.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for a custom rendered element |
| `aria-expanded` | Current open state |
| `aria-controls` | Generated Content ID |
| `aria-disabled` | `"true"` when Root is disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"collapsible-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Content

Contains the disclosed region and identifies Trigger as its accessible label.
It unmounts after closing by default, while `keepMounted` leaves a hidden copy
available for consumer-owned exit animation.

| Prop | Type | Default |
| --- | --- | --- |
| `keepMounted` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"region"` |
| `aria-labelledby` | Generated Trigger ID |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"collapsible-content"` |
| `[data-state]` | `"open" \| "closed"` |

Content also sets `--content-height` to its measured height for optional
consumer-owned animation.

## Examples

### Basic Disclosure

```tsx
import { Collapsible } from "@flowstack-ui/atom";

export function AdvancedSettings() {
  return (
    <Collapsible.Root>
      <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
      <Collapsible.Content>
        These settings are only needed for custom configurations.
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
```

### Controlled State

```tsx
import { useState } from "react";
import { Collapsible } from "@flowstack-ui/atom";

export function ControlledDetails() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger>
        {open ? "Hide details" : "Show details"}
      </Collapsible.Trigger>
      <Collapsible.Content>Additional account information.</Collapsible.Content>
    </Collapsible.Root>
  );
}
```

## Accessibility

Collapsible follows the
[WAI-ARIA Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).
Trigger exposes whether Content is open and points to it with
`aria-controls`. Content is a named region. Give Trigger clear text that tells
the user what will be revealed.

| Key | Description |
| --- | --- |
| `Enter` | Toggles Content while the native or custom button has focus. |
| `Space` | Toggles Content while the native or custom button has focus. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
