# Collapsible

Headless disclosure primitives for showing and hiding one section of content.

## When to Use

Use Collapsible when one control reveals one related block, such as advanced
settings, extra details, or a filter panel. Use Accordion when several named
sections belong together and users move between them. Use Dialog when the
content must interrupt the page in a separate modal layer.

## Features

- Supports controlled and uncontrolled open state.
- Supports vertical and horizontal expansion intent.
- Connects Trigger and Content with generated ARIA IDs.
- Supports disabled triggers and custom trigger rendering.
- Separates lazy mounting, retention and exit presence.
- Supports partial previews, state/controller access and Activity hiding.
- Exposes open state and measured content size for consumer-owned animation.

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
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `ids` | `{ root?, trigger?, content? }` | generated |
| `lazyMount` | `boolean` | `true` |
| `unmountOnExit` | `boolean` | `true` |
| `collapsedHeight` / `collapsedWidth` | nonnegative number (px) or CSS length | none |
| `hideMode` | `"display-none" \| "activity"` | `"display-none"` |
| `onExitComplete` | `() => void` | none |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"collapsible"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |
| `[data-orientation]` | `"vertical" \| "horizontal"` |

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
| `[data-orientation]` | `"vertical" \| "horizontal"` |

### Content

Contains the disclosed region and identifies Trigger as its accessible label.
It unmounts after its owned exit completes by default. Set Root
`unmountOnExit={false}` to retain state after opening, and `lazyMount={false}`
for eager mounting. Unlike Chakra, Brick/Atom preserve lazy/unmount defaults.
Deprecated Content `keepMounted` overrides both options (true means eager and
retained). Do not mix legacy and Root policies; conflicting use warns.

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
| `[data-initial-open]` | Present while initially open Content has not transitioned |
| `[data-orientation]` | `"vertical" \| "horizontal"` |

Content sets `--content-height` and `--content-width` to its measured natural
size for optional consumer-owned animation. Both stay synchronized while
mounted when responsive reflow, fonts, images, or other intrinsic changes
alter the panel. `orientation` is behavior metadata for styled layers:
vertical motion uses height and horizontal motion uses width. Trigger keyboard
activation does not change.

### Controller and context

`useCollapsible(options)` returns `open`, exit-aware `visible`, `disabled`,
`setOpen(boolean)` and `measureSize()`. Pass it to
`<Collapsible.RootProvider value={controller}>`. `Collapsible.Context` accepts
a render callback; `useCollapsibleContext` reads the nearest owner. Existing
`isOpen`, `onOpen`, `onClose`, `onToggle` context aliases remain supported.
RootProvider host props do not configure the controller; pass options to the hook.

`Collapsible.Indicator` is a decorative span with its own state/disabled/axis
metadata. It supports render/asChild and supplies no artwork. All public parts
forward refs. `ids` owns trigger/content IDs; native part IDs cannot break ARIA.
Root `ids.root` overrides native Root id.

### Partial previews and hiding

Nonzero collapsed dimensions keep Content mounted regardless of lazy/unmount
settings. Closed previews are inert and aria-hidden; place Trigger outside
Content and keep essential instructions outside the preview. The entire closed
region, including its visible excerpt, is unavailable to assistive interaction.
Dimensions accept numeric pixels or nonnegative CSS unit lengths, not arbitrary
expressions. The settled preview is clamped to natural content size.
`--collapsed-height`, `--collapsed-width` and `data-has-collapsed-size` allow the
styled layer to animate to the preview size rather than zero.

Activity pauses hidden effects on React 19.2+. Older React falls back to
display-none, retaining state without pausing effects. Unmount takes precedence
over Activity; nonzero previews stay visible rather than Activity-hidden.
Activity pauses effects in retained closed content while retaining React state.
Exit completion excludes initial closed render and interrupted exits. Focus
inside closing content returns to Trigger; no focus is moved on ordinary open.

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
