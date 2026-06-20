# Collapsible

Single disclosure trigger and collapsible content region.

## Features

- Supports controlled and uncontrolled open state.
- Links trigger and content with stable ARIA IDs.
- Supports mounted and unmounted closed content.
- Exposes measured content height for CSS animation.
- Supports `asChild` and `render` on every part.

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

Contains the disclosure state.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `disabled` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"collapsible-root"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Trigger

Button that toggles content visibility.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"collapsible-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Content

Content region controlled by the trigger.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `keepMounted` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"collapsible-content"` |
| `[data-state]` | `"open" \| "closed"` |

| CSS variable | Description |
| --- | --- |
| `--content-height` | Measured content height for CSS animation |

## Examples

### Default open

```tsx
<Collapsible.Root defaultOpen>
  <Collapsible.Trigger>Details</Collapsible.Trigger>
  <Collapsible.Content>More information</Collapsible.Content>
</Collapsible.Root>
```

### Controlled state

```tsx
<Collapsible.Root open={open} onOpenChange={setOpen}>
  <Collapsible.Trigger>Filters</Collapsible.Trigger>
  <Collapsible.Content>...</Collapsible.Content>
</Collapsible.Root>
```

## Accessibility

`Collapsible.Trigger` is a native button with `aria-expanded` and
`aria-controls`. `Collapsible.Content` renders `role="region"` and
`aria-labelledby`.

| Key | Description |
| --- | --- |
| `Space` / `Enter` | Toggles the focused trigger. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
