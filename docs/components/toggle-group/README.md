# ToggleGroup

Headless group of toggle buttons with roving focus and single or multiple selection.

## Features

- Supports single and multiple selection.
- Can be controlled or uncontrolled.
- Supports horizontal and vertical arrow-key navigation.
- Supports optional looping focus.
- Registers items in DOM order.
- Exposes selected, disabled, orientation, and value data attributes.

## Import

```tsx
import { ToggleGroup } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<ToggleGroup.Root>
  <ToggleGroup.Item value="bold" />
  <ToggleGroup.Item value="italic" />
</ToggleGroup.Root>
```

## API Reference

### Root

Contains all toggle group items.

| Prop | Type | Default |
| --- | --- | --- |
| `type` | `"single" \| "multiple"` | `"single"` |
| `value` | `string \| string[]` | - |
| `defaultValue` | `string \| string[]` | `[]` |
| `onValueChange` | `(value: string \| string[]) => void` | - |
| `disabled` | `boolean` | `false` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `loop` | `boolean` | `true` |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toggle-group"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |
| `[data-disabled]` | Present when disabled |

### Item

Renders one toggle group item.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `disabled` | `boolean` | `false` |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toggle-group-item"` |
| `[data-state]` | `"on" \| "off"` |
| `[data-value]` | Item value |
| `[data-disabled]` | Present when disabled |

## Examples

### Single Selection

```tsx
<ToggleGroup.Root type="single" defaultValue="center" ariaLabel="Text align">
  <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
  <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
  <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
</ToggleGroup.Root>
```

### Multiple Selection

```tsx
<ToggleGroup.Root type="multiple" defaultValue={["bold"]}>
  <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
  <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
  <ToggleGroup.Item value="underline">Underline</ToggleGroup.Item>
</ToggleGroup.Root>
```

## Accessibility

Root renders `role="group"`. Items expose `aria-pressed`.

| Key | Description |
| --- | --- |
| `ArrowRight` | Moves focus to the next item when horizontal. |
| `ArrowLeft` | Moves focus to the previous item when horizontal. |
| `ArrowDown` | Moves focus to the next item when vertical. |
| `ArrowUp` | Moves focus to the previous item when vertical. |
| `Home` | Moves focus to the first enabled item. |
| `End` | Moves focus to the last enabled item. |
| `Enter` / `Space` | Toggles the focused item. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
