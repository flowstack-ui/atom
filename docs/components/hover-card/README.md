# HoverCard

Headless hover-and-focus preview primitives with delayed disclosure and floating
positioning.

## When to Use

Use HoverCard for supplemental, nonessential preview content such as a short
profile summary. Use Tooltip for a brief label, Popover for content with
buttons or other interaction, and Dialog for a task that must hold focus.
HoverCard closes when focus leaves and does not create a dialog or popover
accessibility relationship, so never put required actions inside it.

## Features

- Supports controlled and uncontrolled open state.
- Opens from pointer hover and focus-visible Trigger interaction.
- Uses configurable open and close delays and keeps open while Content is hovered.
- Positions Content with flip, shift, offset, and Arrow coordinates.
- Supports inline or custom-container portals.
- Participates in topmost-layer Escape dismissal.

## Import

```tsx
import { HoverCard } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<HoverCard.Root>
  <HoverCard.Trigger />
  <HoverCard.Portal>
    <HoverCard.Content>
      <HoverCard.Arrow />
    </HoverCard.Content>
  </HoverCard.Portal>
</HoverCard.Root>

getHoverCardArrowGeometry()
```

## API Reference

### Root

Owns delayed open state and renders no wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `openDelay` | `number` | `700` |
| `closeDelay` | `number` | `300` |
| `disabled` | `boolean` | `false` |

### Trigger

Provides the positioning reference and hover/focus events. It renders a
focusable `span` by default. With `asChild`, the child keeps its own tab order.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"hover-card-trigger"` |
| `[data-state]` | `"open" \| "closed"` |

Trigger emits no `aria-expanded`, `aria-controls`, or dialog/popover role.
Disabled Root prevents opening and removes the default Trigger from the Tab
order, but Trigger emits no disabled ARIA or data attribute.

### Portal

Moves Content to `document.body` by default without a wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element \| DocumentFragment \| null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Content

Renders a positioned generic `div`. It has no owned landmark or popup role;
`ariaLabel` is passed as `aria-label` but does not create a Trigger relationship.

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` |
| `align` | `"start" \| "center" \| "end"` | `"center"` |
| `sideOffset` | `number` | `8` |
| `ariaLabel` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Value from `ariaLabel` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"hover-card-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | Resolved side after collision handling |
| `[data-positioned]` | Present after positioning |

### Arrow

Renders a decorative SVG aligned to Content's resolved side. Custom children
replace its default polygon.

| Prop | Type | Default |
| --- | --- | --- |
| `width` | `number` | `10` |
| `height` | `number` | `5` |
| `children` | `ReactNode` | Default polygon |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `"true"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"hover-card-arrow"` |
| `[data-side]` | Resolved Content side |

### getHoverCardArrowGeometry

Returns SVG dimensions, outward size, and polygon points for a side, width,
and height. This is useful when building a compatible custom Arrow.

The entry point also exports `useHoverCardContext` and
`useHoverCardContentContext` for advanced custom parts. Both throw outside
their required Root or Content provider.

## Examples

### Profile Preview

```tsx
import { HoverCard } from "@flowstack-ui/atom";

export function ProfilePreview() {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <a href="/people/ada">Ada Lovelace</a>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content>
          <HoverCard.Arrow />
          <h2>Ada Lovelace</h2>
          <p>Mathematician and early computing author.</p>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
```

## Accessibility

HoverCard has no standalone WAI-ARIA popup pattern. Trigger remains the
semantic element supplied by the consumer, Content is supplemental document
content, and Arrow is hidden from assistive technology. The preview must not be
the only place important information or actions are available.

| Key | Description |
| --- | --- |
| `Tab` / `Shift+Tab` | Focus-visible entry can open Trigger; leaving closes after `closeDelay`. |
| `Escape` | Closes the topmost open HoverCard immediately. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
