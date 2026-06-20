# Tooltip

Supplemental text disclosure for hover, focus, and long-press interactions.

## Features

- Provider-level delay configuration.
- Controlled and uncontrolled open state.
- Opens on pointer hover, keyboard focus-visible, and touch long press.
- Floating UI positioning with side, align, side offset, collision shift, flip, and arrow coordinates.
- `aria-describedby` wiring between trigger and tooltip content.
- Portal and arrow parts.

## Import

```tsx
import { Tooltip } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
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
);
```

## API Reference

### Provider

Provides shared tooltip timing.

| Prop | Type | Default |
| --- | --- | --- |
| `openDelay` | `number` | `700` |
| `closeDelay` | `number` | `0` |
| `skipDelayDuration` | `number` | `300` |

### Root

Provides tooltip state.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `disabled` | `boolean` | `false` |

### Trigger

Reference element that describes itself with tooltip content while open.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"tooltip-trigger"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tooltip-trigger"` |

### Portal

Renders tooltip content into a portal.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element | DocumentFragment | null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Content

Positioned tooltip bubble.

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `"top" | "right" | "bottom" | "left"` | `"top"` |
| `align` | `"start" | "center" | "end"` | `"center"` |
| `sideOffset` | `number` | `4` |
| `ariaLabel` | `string` | - |
| `data-slot` | `string` | `"tooltip"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tooltip"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-side]` | `"top" | "right" | "bottom" | "left"` |
| `[data-positioned]` | Present after the first positioning frame |

### Arrow

Decorative SVG arrow positioned by content context.

| Prop | Type | Default |
| --- | --- | --- |
| `width` | `number` | `12` |
| `height` | `number` | `6` |
| `data-slot` | `string` | `"tooltip-arrow"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tooltip-arrow"` |
| `[data-side]` | `"top" | "right" | "bottom" | "left"` |

## Examples

### Basic Tooltip

```tsx
<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>Save</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content>Save changes</Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
```

### Custom Trigger

```tsx
<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <button type="button">?</button>
  </Tooltip.Trigger>
  <Tooltip.Content side="right">More information</Tooltip.Content>
</Tooltip.Root>
```

## Accessibility

Tooltip content uses `role="tooltip"` and is referenced by `aria-describedby` while open. Tooltip content should be descriptive only; use `Popover` for interactive content.

| Key | Description |
| --- | --- |
| `Tab` | Moving focus to a focus-visible trigger can open the tooltip. |
| `Shift+Tab` | Moving focus away closes the tooltip. |
| `Escape` | Dismissal can be handled by focus movement; interactive dismissal belongs in `Popover`. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
