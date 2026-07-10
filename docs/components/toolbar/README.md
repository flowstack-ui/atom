# Toolbar

Headless ARIA toolbar primitives for grouped controls with roving keyboard navigation.

## Features

- Renders `role="toolbar"` with orientation.
- Supports horizontal and vertical arrow-key navigation.
- Supports left-to-right and right-to-left direction.
- Supports buttons, links, separators, and toggle groups.
- Registers toolbar items in DOM order.
- Keeps styling, icons, and visual grouping outside the primitive.

## Import

```tsx
import { Toolbar } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Toolbar.Root>
  <Toolbar.Button />
  <Toolbar.Link href="/" />
  <Toolbar.Separator />
  <Toolbar.ToggleGroup>
    <Toolbar.ToggleItem value="bold" />
  </Toolbar.ToggleGroup>
</Toolbar.Root>
```

## API Reference

### Root

Contains toolbar items.

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |
| `loop` | `boolean` | `true` |
| `ariaLabel` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### Button

Renders a toolbar button.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `ariaLabel` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar-button"` |
| `[data-disabled]` | Present when disabled |

### Link

Renders a toolbar link.

| Prop | Type | Default |
| --- | --- | --- |
| `href` | `string` | required |
| `target` | `string` | - |
| `rel` | `string` | - |
| `disabled` | `boolean` | `false` |
| `ariaLabel` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar-link"` |
| `[data-disabled]` | Present when disabled |

### Separator

Renders a toolbar separator.

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar-separator"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### ToggleGroup

Groups toolbar toggle items.

| Prop | Type | Default |
| --- | --- | --- |
| `type` | `"single" \| "multiple"` | `"single"` |
| `value` | `string \| string[]` | - |
| `defaultValue` | `string \| string[]` | `[]` |
| `onValueChange` | `(value) => void` | - |
| `disabled` | `boolean` | `false` |
| `ariaLabel` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar-toggle-group"` |
| `[data-disabled]` | Present when disabled |

### ToggleItem

Renders a toolbar toggle item.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `disabled` | `boolean` | `false` |
| `ariaLabel` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar-toggle-item"` |
| `[data-state]` | `"on" \| "off"` |
| `[data-value]` | Item value |
| `[data-disabled]` | Present when disabled |

## Examples

### Formatting Toolbar

```tsx
<Toolbar.Root ariaLabel="Formatting">
  <Toolbar.Button ariaLabel="Undo">Undo</Toolbar.Button>
  <Toolbar.Button ariaLabel="Redo">Redo</Toolbar.Button>
  <Toolbar.Separator />
  <Toolbar.ToggleGroup type="multiple" ariaLabel="Text style">
    <Toolbar.ToggleItem value="bold">Bold</Toolbar.ToggleItem>
    <Toolbar.ToggleItem value="italic">Italic</Toolbar.ToggleItem>
  </Toolbar.ToggleGroup>
</Toolbar.Root>
```

### Vertical Toolbar

```tsx
<Toolbar.Root orientation="vertical" ariaLabel="Drawing tools">
  <Toolbar.Button>Move</Toolbar.Button>
  <Toolbar.Button>Pen</Toolbar.Button>
</Toolbar.Root>
```

## Accessibility

Toolbar follows the ARIA toolbar pattern. Use it for groups of controls, not page navigation. Local `dir` overrides `Direction.Provider`.

| Key | Description |
| --- | --- |
| `ArrowRight` | Moves focus to the next item when horizontal LTR, previous in RTL. |
| `ArrowLeft` | Moves focus to the previous item when horizontal LTR, next in RTL. |
| `ArrowDown` | Moves focus to the next item when vertical. |
| `ArrowUp` | Moves focus to the previous item when vertical. |
| `Home` | Moves focus to the first enabled item. |
| `End` | Moves focus to the last enabled item. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
