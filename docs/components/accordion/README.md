# Accordion

Disclosure sections with linked triggers, panels, and keyboard navigation.

## Features

- Supports single and multiple expanded items.
- Supports controlled and uncontrolled state.
- Supports horizontal and vertical arrow-key navigation.
- Links each trigger to its content with stable ARIA IDs.
- Supports mounted and unmounted closed content.
- Supports `asChild` and `render` on every part.

## Import

```tsx
import { Accordion } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Accordion.Root>
  <Accordion.Item value="item-1">
    <Accordion.Header>
      <Accordion.Trigger />
    </Accordion.Header>
    <Accordion.Content />
  </Accordion.Item>
</Accordion.Root>
```

## API Reference

### Root

Contains all accordion items.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `type` | `"single" \| "multiple"` | `"single"` |
| `value` | `string \| string[]` | - |
| `defaultValue` | `string \| string[]` | `[]` |
| `onValueChange` | `(value: string \| string[]) => void` | - |
| `collapsible` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"accordion-root"` |
| `[data-orientation]` | `"vertical" \| "horizontal"` |
| `[data-disabled]` | Present when disabled |

### Item

Contains one collapsible section.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `value` | `string` | Required |
| `disabled` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"accordion-item"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Header

Heading wrapper for an accordion trigger.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `as` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h3"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"accordion-header"` |

### Trigger

Button that toggles its item content.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"accordion-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Content

Panel associated with a trigger.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `keepMounted` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"accordion-content"` |
| `[data-state]` | `"open" \| "closed"` |

| CSS variable | Description |
| --- | --- |
| `--content-height` | Measured content height for CSS animation |

## Examples

### Expanded by default

```tsx
<Accordion.Root defaultValue="item-2">
  <Accordion.Item value="item-1">...</Accordion.Item>
  <Accordion.Item value="item-2">...</Accordion.Item>
</Accordion.Root>
```

### Multiple sections

```tsx
<Accordion.Root type="multiple" defaultValue={["item-1", "item-2"]}>
  <Accordion.Item value="item-1">...</Accordion.Item>
  <Accordion.Item value="item-2">...</Accordion.Item>
</Accordion.Root>
```

### Non-collapsible single section

```tsx
<Accordion.Root type="single" collapsible={false} defaultValue="item-1">
  <Accordion.Item value="item-1">...</Accordion.Item>
  <Accordion.Item value="item-2">...</Accordion.Item>
</Accordion.Root>
```

## Accessibility

Accordion triggers are native buttons with `aria-expanded` and `aria-controls`.
Content panels render `role="region"` and `aria-labelledby`.

| Key | Description |
| --- | --- |
| `Space` / `Enter` | Toggles the focused trigger. |
| `ArrowDown` | Moves to the next trigger when vertical. |
| `ArrowUp` | Moves to the previous trigger when vertical. |
| `ArrowRight` | Moves to the next trigger when horizontal in LTR, or previous in RTL. |
| `ArrowLeft` | Moves to the previous trigger when horizontal in LTR, or next in RTL. |
| `Home` | Moves to the first enabled trigger. |
| `End` | Moves to the last enabled trigger. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
