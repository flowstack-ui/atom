# Popover

Positioned disclosure content with optional anchor, modal behavior, focus guards, arrow geometry, and close controls.

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
export default () => (
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
);
```

## API Reference

### Root

Provides popover state and positioning refs.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `modal` | `boolean` | `false` |
| `triggerMode` | `"click" | "hover"` | `"click"` |
| `closeOnInteractOutside` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |

### Anchor

Optional positioning reference. Use it when content should be positioned relative to a different element than the trigger.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"popover-anchor"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-anchor"` |

### Trigger

Opens or toggles the popover.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"popover-trigger"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-trigger"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-trigger-mode]` | `"click" | "hover"` |
| `[data-disabled]` | Present when disabled |

### Portal

Renders popover content into a portal.

| Prop | Type | Default |
| --- | --- | --- |
| `container` | `Element | DocumentFragment | null` | `document.body` |
| `disabled` | `boolean` | `false` |

### Content

Positioned popover panel.

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `"top" | "right" | "bottom" | "left"` | `"bottom"` |
| `align` | `"start" | "center" | "end"` | `"center"` |
| `sideOffset` | `number` | `8` |
| `ariaLabel` | `string` | - |
| `data-slot` | `string` | `"popover-content"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-content"` |
| `[data-state]` | `"open" | "closed"` |
| `[data-side]` | `"top" | "right" | "bottom" | "left"` |
| `[data-positioned]` | Present after the first positioning frame |

### Arrow

Decorative SVG arrow positioned by content context.

| Prop | Type | Default |
| --- | --- | --- |
| `width` | `number` | `12` |
| `height` | `number` | `6` |
| `data-slot` | `string` | `"popover-arrow"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"popover-arrow"` |
| `[data-side]` | `"top" | "right" | "bottom" | "left"` |

### Close

Closes the popover.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `data-slot` | `string` | `"popover-close"` |

## Examples

### Basic Popover

```tsx
<Popover.Root>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Portal>
    <Popover.Content ariaLabel="Actions">
      <Popover.Close>Close</Popover.Close>
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

### Custom Anchor

```tsx
<Popover.Root>
  <Popover.Anchor asChild>
    <span id="avatar-anchor" />
  </Popover.Anchor>
  <Popover.Trigger aria-describedby="avatar-anchor">Open</Popover.Trigger>
  <Popover.Content side="right" align="start">...</Popover.Content>
</Popover.Root>
```

## Accessibility

Popover content renders with `role="dialog"`. Provide `ariaLabel` or labelled content when the popover contains interactive controls.
In modal mode, focus remains contained inside the popover scope, including
registered portalled layers opened by descendants.

| Key | Description |
| --- | --- |
| `Enter` | Toggles a non-native trigger. |
| `Space` | Toggles a non-native trigger. |
| `Escape` | Native focus movement and outside interaction can close the popover depending on configuration. |
| `Tab` | In modal mode, focus remains trapped inside content. In non-modal mode, focus guards close the popover when tabbing away. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
