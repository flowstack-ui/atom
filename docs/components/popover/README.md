# Popover

Positioned disclosure content with optional anchor, modal behavior, focus guards, arrow geometry, and close controls.

## When to Use

Use `Popover` for a small interactive panel that belongs to a trigger, such as
quick actions or compact settings. Use `Tooltip` for short, non-interactive
help, `HoverCard` for preview content, and `Dialog` when the user must focus on
a larger task. A popover should add helpful choices without becoming a whole
page inside a floating box.

## Features

- Controlled and uncontrolled open state.
- Click or hover trigger mode with opening-reason tracking; pointer hover never
  moves focus.
- Visible Title and Description parts with generated accessible relationships.
- Configurable interaction-aware initial and final focus, including a
  touch-safe Content default and outside-dismissal focus preservation.
- Optional anchor separate from the trigger.
- Floating UI positioning that tries alternate alignments on the requested
  side, repeats them on the opposite side, and uses perpendicular sides only as
  final fallbacks; collision shift and Arrow coordinates follow the result.
- Modal mode with focus trap and scroll lock.
- Non-modal focus guards and outside interaction dismissal.
- Stack-aware Escape dismissal for nested overlays.
- Close button part and portal support.

## Import

```tsx
import { Popover } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Popover.Root>
  <Popover.Anchor />
  <Popover.Trigger />
  <Popover.Portal>
    <Popover.Content>
      <Popover.Title />
      <Popover.Description />
      <Popover.Close />
      <Popover.Arrow />
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

## API Reference

### Root

Owns open state, dismissal rules, trigger mode, and the references used to
position Content. Root renders no DOM element.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean, reason?: PopoverCloseReason) => void` | - |
| `modal` | `boolean` | `false` |
| `triggerMode` | `"click" \| "hover"` | `"click"` |
| `openDelay` | `number` | `200` |
| `closeDelay` | `number` | `300` |
| `closeOnEscape` | `boolean` | `true` |
| `closeOnInteractOutside` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |

**ARIA:** Root renders no element and adds no ARIA attributes.

**Data attributes:** Root renders no element and exposes no data attributes.

### Anchor

Optional positioning reference. Use it when content should be positioned relative to a different element than the trigger.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Anchor adds no roles or ARIA attributes.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-anchor"` |

### Trigger

Opens or toggles the popover and connects the button to Content. In hover mode,
it also starts the configured open and close delays.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for a custom rendered element |
| `aria-haspopup` | `"dialog"` |
| `aria-expanded` | Current open state |
| `aria-controls` | Content ID while open |
| `aria-disabled` | `true` when Root is disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-trigger-mode]` | `"click" \| "hover"` |
| `[data-disabled]` | Present when disabled |

### Portal

Moves Content to another DOM container so it can escape clipping and stacking
ancestors. It renders no wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `HTMLElement \| null` | `document.body` after mount |
| `disabled` | `boolean` | `false` |

**ARIA:** Portal adds no roles or ARIA attributes.

**Data attributes:** Portal renders no wrapper and exposes none.

### Content

Renders the positioned dialog, manages outside dismissal, and manages focus.
Modal Content traps focus and locks scrolling; non-modal Content closes when
focus leaves its trigger/content scope.
Non-Arrow children render inside `[data-slot="popover-viewport"]`; a direct
Arrow remains its sibling so styled layers can scroll the viewport without
clipping the pointer. Content exposes measured
`--atom-floating-available-width` and `--atom-floating-available-height`
properties.

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` |
| `align` | `"start" \| "center" \| "end"` | `"center"` |
| `sideOffset` | `number` | `8` |
| `initialFocus` | `PopoverFocusTarget<PopoverInitialFocusDetails>` | safe interaction-aware target |
| `finalFocus` | `PopoverFocusTarget<PopoverFinalFocusDetails>` | prior valid target, then Trigger |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"dialog"` |
| `aria-label` | Native explicit value |
| `aria-labelledby` | Native value or generated Title relationship |
| `aria-describedby` | Native value or generated Description relationship |
| `aria-modal` | `true` in modal mode |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | `"top" \| "right" \| "bottom" \| "left"` |
| `[data-positioned]` | Present after the first positioning frame |

Native `aria-label`, `aria-labelledby`, and `aria-describedby` pass through.
Explicitly passing
`aria-describedby={undefined}` suppresses the generated description
relationship. `initialFocus` and `finalFocus` accept an element ref, a callback
receiving interaction/reason details, or `false` to suppress that automatic
operation.

### Title

Renders the visible heading that names Content. It defaults to `h2`, accepts
`as="h1"` through `as="h6"`, forwards heading props/ref, and registers its
stable ID with Content.

| Prop | Type | Default |
| --- | --- | --- |
| `as` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h2"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-title"` |

### Description

Renders a visible paragraph that describes Content and registers its stable ID
for the generated `aria-describedby` relationship.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-description"` |

### Close

Renders a button that requests Root to close after any consumer click handler
runs without preventing the event. Close records keyboard, mouse, pen, or touch
activation so final-focus callbacks receive accurate details.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Close uses native button semantics. Give icon-only controls an
`aria-label`.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-close"` |

### Arrow

Renders a decorative SVG pointer using the actual side chosen after collision
handling. `getPopoverArrowGeometry` exposes the same geometry for custom arrows.

| Prop | Type | Default |
| --- | --- | --- |
| `width` | `number` | `10` |
| `height` | `number` | `5` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Arrow is decorative and hidden from assistive technology.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-arrow"` |
| `[data-side]` | `"top" \| "right" \| "bottom" \| "left"` |

Advanced compound parts can read `usePopoverContext` or
`usePopoverContentContext`. Their matching context providers are also public
for low-level composition. `getPopoverArrowGeometry` returns the SVG geometry
used by Arrow for a given side, width, and height.

## Examples

### Basic Popover

```tsx
import { Popover } from "@flowstack-ui/atom";

export default function ActionsPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger>Actions</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content>
          <Popover.Title>Project actions</Popover.Title>
          <Popover.Description>
            Choose one compact action for this project.
          </Popover.Description>
          <button type="button">Duplicate</button>
          <Popover.Close>Done</Popover.Close>
          <Popover.Arrow />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

### Custom Anchor

```tsx
import { Popover } from "@flowstack-ui/atom";

export default function AnchoredPopover() {
  return (
    <Popover.Root>
      <Popover.Anchor asChild>
        <span>Account</span>
      </Popover.Anchor>
      <Popover.Trigger>Open account actions</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="right" align="start">
          <Popover.Title>Account actions</Popover.Title>
          <button type="button">View profile</button>
          <Popover.Close>Close</Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

## Accessibility

Popover uses the [WAI-ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
for Content and an
`aria-haspopup="dialog"` trigger. Render one visible `Popover.Title` or provide
native `aria-label`/`aria-labelledby`. Description connects automatically when
rendered. Popover intentionally exposes no camel-case `ariaLabel` alias.

Intentional keyboard, mouse, and pen openings focus an explicit
`initialFocus`, native `autoFocus`, the first available descendant, or Content.
Touch defaults to Content so opening does not unexpectedly raise a virtual
keyboard. Pointer-hover opening never moves focus. Escape and Close restore a
valid explicit `finalFocus`, the prior element, or Trigger; outside pointer and
focus dismissal preserve the destination. In modal mode, focus remains
contained inside the popover scope, including registered portalled layers
opened by descendants.

| Key | Description |
| --- | --- |
| `Enter` | Toggles a non-native trigger. |
| `Space` | Toggles a non-native trigger. |
| `Escape` | Closes the topmost popover when `closeOnEscape` is enabled. |
| `Tab` | In modal mode, focus remains trapped inside content. In non-modal mode, focus guards close the popover when tabbing away. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
