# Tooltip

Supplemental text disclosure for hover, focus, and long-press interactions.

## When to Use

Use `Tooltip` for a short text hint that explains a control without requiring
interaction, especially an unfamiliar icon. Use visible text when the
information is important, `HoverCard` for a richer preview, and `Popover` when
the floating content contains buttons, links, or other controls.

## Features

- Provider-level delay configuration.
- Controlled and uncontrolled open state.
- Opens on pointer hover, keyboard focus-visible, and a stationary 700 ms touch
  long press.
- Cancels touch opening on early release, movement beyond 10 CSS pixels,
  scrolling, a second touch, `touchcancel`, disabling, or Trigger unmount.
- Starts finite touch dismissal after release: 1500 ms for plain and 3000 ms
  for rich.
- Floating UI positioning that tries alternate alignments on the requested
  side, repeats them on the opposite side, and uses perpendicular sides only as
  final fallbacks; collision shift and Arrow coordinates follow the result.
- `aria-describedby` wiring between trigger and tooltip content.
- Portal and arrow parts.

## Import

```tsx
import { Tooltip } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger />
    <Tooltip.Portal>
      <Tooltip.Content>
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
```

## API Reference

### Provider

Shares open, close, and skip-delay timing between descendant tooltips. Provider
renders no DOM element.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `openDelay` | `number` | `400` |
| `closeDelay` | `number` | `150` |
| `skipDelay` | `number` | `300` |

**ARIA:** Provider renders no element and adds no ARIA attributes.

**Data attributes:** Provider renders no element and exposes none.

### Root

Owns one tooltip's open state, timers, Escape dismissal, touch state, and plain
or rich hover behavior. Root renders no DOM element.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `openDelay` | `number` | Provider value or `400` |
| `closeDelay` | `number` | Provider value or `150` |
| `disabled` | `boolean` | `false` |
| `variant` | `"plain" \| "rich"` | `"plain"` |

**ARIA:** Root renders no element and adds no ARIA attributes.

**Data attributes:** Root renders no element and exposes none.

### Trigger

Reference element that describes itself with tooltip content while open.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-describedby` | Content ID while the tooltip is open |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tooltip-trigger"` |

### Portal

Moves Content to another DOM container without rendering a wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `HTMLElement \| null` | `document.body` after mount |
| `disabled` | `boolean` | `false` |

**ARIA:** Portal adds no ARIA attributes.

**Data attributes:** Portal renders no wrapper and exposes none.

### Content

Renders the positioned tooltip text and keeps Content available while the
pointer moves from Trigger into Content.
Content exposes measured `--atom-floating-available-width` and
`--atom-floating-available-height` properties.

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` |
| `align` | `"start" \| "center" \| "end"` | `"center"` |
| `sideOffset` | `number` | `4` |
| `ariaLabel` | `string` | - |
| `onMouseEnter` | `MouseEventHandler<HTMLDivElement>` | - |
| `onMouseLeave` | `MouseEventHandler<HTMLDivElement>` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"tooltip"` |
| `aria-label` | Value from `ariaLabel` when provided |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tooltip"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | `"top" \| "right" \| "bottom" \| "left"` |
| `[data-variant]` | `"plain" \| "rich"` |
| `[data-positioned]` | Present after the first positioning frame |

Plain Content is normally one short description. Rich Content may use a short
title, supporting description, and non-interactive inline formatting. Both
variants retain `role="tooltip"`; neither may contain links, buttons, inputs,
or other focusable controls. Use `HoverCard` for a larger non-interactive
preview and `Popover` for an interactive surface.

### Arrow

Renders a decorative SVG pointer using the final side chosen after collision
handling. `getTooltipArrowGeometry` exposes the same geometry for custom arrows.

| Prop | Type | Default |
| --- | --- | --- |
| `width` | `number` | `10` |
| `height` | `number` | `5` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Arrow is decorative and hidden from assistive technology.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tooltip-arrow"` |
| `[data-side]` | `"top" \| "right" \| "bottom" \| "left"` |

Advanced compound parts can read the Provider, Root, and Content contexts with
their public hooks and providers. `getTooltipArrowGeometry` returns the same SVG
geometry used by Arrow.

## Examples

### Basic Tooltip

```tsx
import { Tooltip } from "@flowstack-ui/atom";

export default function SaveTooltip() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button type="button">Save</button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content>Save changes</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
```

### Custom Trigger

```tsx
import { Tooltip } from "@flowstack-ui/atom";

export default function HelpTooltip() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button type="button">Help</button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content side="right">More information</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
```

### Rich, Non-Interactive Tooltip

```tsx
import { Tooltip } from "@flowstack-ui/atom";

export default function SearchTooltip() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root variant="rich">
        <Tooltip.Trigger asChild>
          <button type="button" aria-label="Search workspace">Search</button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content>
            <strong>Workspace search</strong>
            <span>Search projects, files, and commands.</span>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
```

## Accessibility

Tooltip follows the [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/).
Content is referenced by `aria-describedby` while open and must remain
non-interactive in both plain and rich variants. The Trigger needs a complete
accessible name independently; Tooltip provides only a supplemental
description.

| Key | Description |
| --- | --- |
| `Tab` | Moving focus to a focus-visible trigger can open the tooltip. |
| `Shift+Tab` | Moving focus away closes the tooltip. |
| `Escape` | Closes the topmost open tooltip immediately. |

On touch devices, a stationary 700 ms press opens Tooltip immediately without
adding the hover `openDelay`. Touch-generated compatibility hover/focus events
do not open Tooltip after a quick tap. Ordinary taps and scrolling are not
suppressed; native text selection and the context callout are suppressed only
while the Trigger is tracking the competing stationary long-press gesture.
An opened Tooltip remains visible while the initiating finger is down. After
release, plain dismisses after 1500 ms and rich after 3000 ms; an outside touch
or scroll dismisses either immediately. Moving more than 10 CSS pixels,
scrolling, adding a second touch, receiving `touchcancel`, disabling the
Trigger, or unmounting it cancels the touch session.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
