# HoverCard

Hover and focus disclosure card for preview content.

## Features

- Controlled and uncontrolled open state.
- Opens from hover and focus-visible trigger interactions.
- Configurable open and close delays.
- Floating UI positioning with side, align, side offset, collision shift, flip, and arrow coordinates.
- Portal and arrow parts.
- Headless only: no card styling, shadows, animation, or layout.

## Import

```tsx
import { HoverCard } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <HoverCard.Root>
    <HoverCard.Trigger />
    <HoverCard.Portal>
      <HoverCard.Content>
        <HoverCard.Arrow />
      </HoverCard.Content>
    </HoverCard.Portal>
  </HoverCard.Root>
);
```

## API Reference

### Root

Provides hover card state.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `openDelay` | `number` | `700` |
| `closeDelay` | `number` | `300` |
| `disabled` | `boolean` | `false` |

### Trigger

Reference element that opens the card.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"hover-card-trigger"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"hover-card-trigger"` |
| `[data-state]` | `"open" | "closed"` |

### Portal

Renders hover card content into a portal.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element | DocumentFragment | null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Content

Positioned hover card panel.

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `"top" | "right" | "bottom" | "left"` | `"bottom"` |
| `align` | `"start" | "center" | "end"` | `"center"` |
| `sideOffset` | `number` | `8` |
| `ariaLabel` | `string` | - |
| `data-slot` | `string` | `"hover-card-content"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"hover-card-content"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-side]` | `"top" | "right" | "bottom" | "left"` |
| `[data-positioned]` | Present after the first positioning frame |

### Arrow

Decorative SVG arrow positioned by content context.

| Prop | Type | Default |
| --- | --- | --- |
| `width` | `number` | `10` |
| `height` | `number` | `5` |
| `data-slot` | `string` | `"hover-card-arrow"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"hover-card-arrow"` |
| `[data-side]` | `"top" | "right" | "bottom" | "left"` |

## Examples

### Profile Preview

```tsx
<HoverCard.Root>
  <HoverCard.Trigger asChild>
    <a href="/people/ada">Ada Lovelace</a>
  </HoverCard.Trigger>
  <HoverCard.Portal>
    <HoverCard.Content ariaLabel="Ada Lovelace preview">
      <HoverCard.Arrow />
      Preview content
    </HoverCard.Content>
  </HoverCard.Portal>
</HoverCard.Root>
```

### Faster Open Delay

```tsx
<HoverCard.Root openDelay={150} closeDelay={100}>
  <HoverCard.Trigger>Preview</HoverCard.Trigger>
  <HoverCard.Content>Details</HoverCard.Content>
</HoverCard.Root>
```

## Accessibility

HoverCard is for supplemental preview content. Use `Popover` or `Dialog` when the disclosed content requires explicit keyboard interaction or persistent controls.

| Key | Description |
| --- | --- |
| `Tab` | Moving focus to a focus-visible trigger can open the hover card. |
| `Shift+Tab` | Moving focus away closes the hover card. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
