# Toolbar

Headless ARIA toolbar primitives for grouped controls with roving keyboard navigation.

## When to Use

Use `Toolbar` for a compact row or column of related controls, such as editor
formatting tools. Use `NavigationMenu` or ordinary links for moving between
pages, and use separate Buttons when the commands are not one logical group.

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

Owns orientation, direction, item registration, and roving focus for the whole
control group.

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |
| `loop` | `boolean` | `true` |
| `ariaLabel` | `string` | - |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"toolbar"` |
| `aria-label` | Value from `ariaLabel` when provided |
| `aria-orientation` | Current orientation |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### Button

Renders a command button and registers it in the toolbar's roving focus order.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `ariaLabel` | `string` | - |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for a custom non-native element |
| `aria-label` | Value from `ariaLabel` when provided |
| `aria-disabled` | `true` for a disabled custom element |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar-button"` |
| `[data-disabled]` | Present when disabled |

### Link

Renders a navigation link that participates in roving focus. Disabled links
cannot navigate and are announced as disabled.

| Prop | Type | Default |
| --- | --- | --- |
| `href` | `string` | required |
| `target` | `string` | - |
| `rel` | `string` | - |
| `disabled` | `boolean` | `false` |
| `ariaLabel` | `string` | - |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Value from `ariaLabel` when provided |
| `aria-disabled` | `true` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar-link"` |
| `[data-disabled]` | Present when disabled |

### Separator

Renders a semantic separator between control groups. Its orientation describes
the separator line, not the Toolbar direction.

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"separator"` |
| `aria-orientation` | Separator orientation |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar-separator"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### ToggleGroup

Owns single or multiple pressed values for related ToggleItem parts without
creating another Tab stop outside the Toolbar's roving focus model.

| Prop | Type | Default |
| --- | --- | --- |
| `type` | `"single" \| "multiple"` | `"single"` |
| `value` | `string \| string[]` | - |
| `defaultValue` | `string \| string[]` | `[]` |
| `onValueChange` | `(value) => void` | - |
| `disabled` | `boolean` | `false` |
| `ariaLabel` | `string` | - |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |
| `aria-label` | Value from `ariaLabel` when provided |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar-toggle-group"` |
| `[data-disabled]` | Present when disabled |

### ToggleItem

Renders one pressed button, participates in Toolbar roving focus, and reads its
selection state from ToggleGroup.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `disabled` | `boolean` | `false` |
| `ariaLabel` | `string` | - |
| `render` | `RenderProp` | - |
| `asChild` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for a custom non-native element |
| `aria-pressed` | Current selected state |
| `aria-label` | Value from `ariaLabel` when provided |
| `aria-disabled` | `true` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"toolbar-toggle-item"` |
| `[data-state]` | `"on" \| "off"` |
| `[data-value]` | Item value |
| `[data-disabled]` | Present when disabled |

Advanced compound parts can use `useToolbarContext`, `useToolbarToggleContext`,
and `useToolbarItem` with their matching public providers.

## Examples

### Formatting Toolbar

```tsx
import { Toolbar } from "@flowstack-ui/atom";

export default function FormattingToolbar() {
  return (
<Toolbar.Root ariaLabel="Formatting">
  <Toolbar.Button ariaLabel="Undo">Undo</Toolbar.Button>
  <Toolbar.Button ariaLabel="Redo">Redo</Toolbar.Button>
  <Toolbar.Separator />
  <Toolbar.ToggleGroup type="multiple" ariaLabel="Text style">
    <Toolbar.ToggleItem value="bold">Bold</Toolbar.ToggleItem>
    <Toolbar.ToggleItem value="italic">Italic</Toolbar.ToggleItem>
  </Toolbar.ToggleGroup>
</Toolbar.Root>
  );
}
```

### Vertical Toolbar

```tsx
import { Toolbar } from "@flowstack-ui/atom";

export default function DrawingToolbar() {
  return (
<Toolbar.Root orientation="vertical" ariaLabel="Drawing tools">
  <Toolbar.Button>Move</Toolbar.Button>
  <Toolbar.Button>Pen</Toolbar.Button>
</Toolbar.Root>
  );
}
```

## Accessibility

Toolbar follows the [WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).
Use it for groups of controls, not page navigation. Local `dir` overrides
`Direction.Provider`.

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
