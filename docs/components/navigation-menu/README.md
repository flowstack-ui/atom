# NavigationMenu

Headless navigation disclosure primitives with trigger-driven panels, indicator geometry, and a shared viewport.

## Features

- Supports root and nested navigation menu scopes.
- Supports delayed open, skip delay, pointer open, click open, and keyboard open.
- Provides a shared viewport that adapts to the active content size.
- Provides indicator geometry CSS variables for styling arrows or active markers.
- Supports active links and `aria-current`.
- Supports horizontal and vertical orientation.

## Import

```tsx
import { NavigationMenu } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger />
      <NavigationMenu.Content />
    </NavigationMenu.Item>
    <NavigationMenu.Item>
      <NavigationMenu.Link />
    </NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.Indicator />
  <NavigationMenu.Viewport />
</NavigationMenu.Root>
```

## API Reference

### Root

Contains the navigation menu.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string \| null` | - |
| `defaultValue` | `string` | - |
| `onValueChange` | `(value: string \| null) => void` | - |
| `delayDuration` | `number` | `200` |
| `skipDelayDuration` | `number` | `300` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### List

Renders the item list.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-list"` |

### Item

Provides a value scope for a trigger/content pair or link.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-item"` |

### Trigger

Controls a content panel.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Content

Registers panel content for the shared viewport.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-content"` |
| `[data-state]` | `"open"` |
| `[data-motion]` | `"from-start" \| "from-end"` |

### Link

Renders a navigation link.

| Prop | Type | Default |
| --- | --- | --- |
| `active` | `boolean` | `false` |
| `onSelect` | `() => void` | - |
| `asChild` | `boolean` | `false` |

### Indicator

Renders an optional active trigger indicator.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMount` | `boolean` | `false` |

| CSS variable | Description |
| --- | --- |
| `--atom-navigation-menu-trigger-left` | Active trigger left offset |
| `--atom-navigation-menu-trigger-top` | Active trigger top offset |
| `--atom-navigation-menu-trigger-width` | Active trigger width |
| `--atom-navigation-menu-trigger-height` | Active trigger height |
| `--atom-navigation-menu-trigger-center-x` | Active trigger horizontal center |
| `--atom-navigation-menu-trigger-center-y` | Active trigger vertical center |

### Viewport

Renders the active content panel.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMount` | `boolean` | `false` |

| CSS variable | Description |
| --- | --- |
| `--atom-navigation-menu-viewport-width` | Active content width |
| `--atom-navigation-menu-viewport-height` | Active content height |

### Sub

Creates a nested navigation menu scope.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string \| null` | - |
| `defaultValue` | `string` | - |
| `onValueChange` | `(value: string \| null) => void` | - |

## Examples

### Shared Viewport

```tsx
<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="products">
      <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
      <NavigationMenu.Content>Product links</NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.Indicator />
  <NavigationMenu.Viewport />
</NavigationMenu.Root>
```

### Active Link

```tsx
<NavigationMenu.Item value="docs">
  <NavigationMenu.Link href="/docs" active>
    Docs
  </NavigationMenu.Link>
</NavigationMenu.Item>
```

## Accessibility

`Root` renders a `nav` landmark with an accessible name. Triggers expose expanded state and controlled content IDs. Links use native anchor semantics and `aria-current="page"` when active. Text direction can be set with `dir` on `Root` or inherited from `Direction.Provider`.
Horizontal triggers use roving keyboard navigation. When a panel is already
open, moving to another trigger opens that trigger's panel.

| Key | Description |
| --- | --- |
| `Enter` / `Space` | Opens or closes a trigger |
| `ArrowRight` / `ArrowLeft` | Moves between horizontal triggers, mirrored in RTL |
| `ArrowDown` | Opens content and moves focus to the first focusable element |
| `ArrowUp` | Opens content and moves focus to the last focusable element |
| `Home` / `End` | Moves to the first or last horizontal trigger |
| `Escape` | Closes the active panel and restores focus to its trigger |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
