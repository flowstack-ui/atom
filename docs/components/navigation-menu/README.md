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

Each part that renders DOM emits a default `[data-slot]`. Pass `data-slot`
to override that value for app-specific styling or test selectors.

### Root

Contains the navigation menu.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string \| null` | - |
| `defaultValue` | `string` | - |
| `onValueChange` | `(value: string \| null) => void` | - |
| `delayDuration` | `number` | `200` |
| `skipDelayDuration` | `number` | `300` |
| `loop` | `boolean` | `true` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### List

Renders the item list.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-list"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### Item

Provides a value scope for a trigger/content pair or link.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

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

`Content` does not render at its declaration site. Its `asChild` and `render`
customize the content wrapper rendered by `Viewport`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

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
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-link"` |
| `[data-active]` | Present when active |

| ARIA attribute | Values |
| --- | --- |
| `aria-current` | `"page"` when active |

### Indicator

Renders an optional active trigger indicator.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMount` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-indicator"` |
| `[data-state]` | `"visible" \| "hidden"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `true` |

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

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-viewport"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

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
| `orientation` | `"horizontal" \| "vertical"` | Parent menu orientation |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-sub"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

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

NavigationMenu follows a disclosure navigation pattern for site navigation. It
does not use `menu`, `menubar`, or `menuitem` roles, and it does not trap focus.
Tab and Shift+Tab remain the primary way to move through visible buttons and
links. Arrow keys supplement normal tab navigation.

### Trigger Keys

| Key | Description |
| --- | --- |
| `Enter` / `Space` | Opens or closes a trigger and keeps focus on the trigger |
| `ArrowDown` / `ArrowUp` | In horizontal orientation, opens content and moves focus to the first or last focusable content element |
| `ArrowRight` / `ArrowLeft` | In horizontal orientation, moves between top-level controls, mirrored in RTL |
| `ArrowDown` / `ArrowUp` | In vertical orientation, moves between top-level controls |
| `ArrowRight` | In vertical LTR, opens content and moves focus to the first focusable content element |
| `ArrowLeft` | In vertical RTL, opens content and moves focus to the first focusable content element |
| `Home` / `End` | Moves to the first or last top-level control |
| `Escape` | Closes the active panel and restores focus to its trigger |

Top-level arrow navigation includes both disclosure triggers and direct
top-level links. When a panel is open, moving to another trigger switches the
open panel. Moving to a direct link closes the open panel without activating the
link.

### Content Keys

| Key | Description |
| --- | --- |
| `Tab` / `Shift+Tab` | Moves through visible focusable content and then returns to the top-level navigation order |
| `ArrowDown` / `ArrowUp` | Moves to the next or previous focusable content element in DOM order |
| `Home` / `End` | Moves to the first or last focusable content element |
| `Escape` | Closes the active panel and restores focus to its trigger |

Content arrow navigation loops by default. Set `loop={false}` on `Root` to stop
ArrowUp and ArrowDown at the first or last focusable content element.

When focus leaves the navigation region, the active panel closes. Nested
navigation menu scopes close from the inside out: Escape first closes the
innermost sub menu and restores focus to its trigger; a later Escape can close
the parent panel.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
