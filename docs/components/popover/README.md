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
- Click or hover trigger mode.
- Optional anchor separate from the trigger.
- Floating UI positioning with side, align, side offset, collision shift, flip, and arrow coordinates.
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
      <Popover.Arrow />
      <Popover.Close />
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
| `onOpenChange` | `(open: boolean) => void` | - |
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

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` |
| `align` | `"start" \| "center" \| "end"` | `"center"` |
| `sideOffset` | `number` | `8` |
| `ariaLabel` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"dialog"` |
| `aria-label` | Value from `ariaLabel` when provided |
| `aria-modal` | `true` in modal mode |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | `"top" \| "right" \| "bottom" \| "left"` |
| `[data-positioned]` | Present after the first positioning frame |

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

### Close

Renders a button that requests Root to close after any consumer click handler
runs without preventing the event.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Close uses native button semantics. Give icon-only controls an
`aria-label`.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-close"` |

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
        <Popover.Content ariaLabel="Project actions">
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
        <Popover.Content side="right" align="start" ariaLabel="Account actions">
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
`aria-haspopup="dialog"` trigger. Provide `ariaLabel` when Content does not have
another accessible name. In modal mode, focus remains contained inside the
popover scope, including registered portalled layers opened by descendants.

| Key | Description |
| --- | --- |
| `Enter` | Toggles a non-native trigger. |
| `Space` | Toggles a non-native trigger. |
| `Escape` | Closes the topmost popover when `closeOnEscape` is enabled. |
| `Tab` | In modal mode, focus remains trapped inside content. In non-modal mode, focus guards close the popover when tabbing away. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
