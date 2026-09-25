# NavigationMenu

### Shared viewport motion and anchoring

`Viewport anchor="trigger"` (default) aligns against the active trigger.
`anchor="navigation"` instead aligns against the Root rectangle, for a stable
shared navigation panel. Both honor `align` and `collisionPadding`; Indicator
continues to track the active trigger.

During a panel exchange, Content exposes `data-motion="from-start" | "from-end"`
on the incoming panel and `"to-start" | "to-end"` on the outgoing panel. The
styled layer should layer these panels, interpret start/end logically and
respect reduced motion. Closed content is inert during its exit. Viewport size
variables describe the measured content plus viewport borders; use border-box
sizing when consuming them. Atom does not supply animation CSS.

## Interaction, lifecycle and state access

`Root` accepts `openDelay` and `closeDelay` (200ms defaults). Each explicit
delay overrides the legacy `delayDuration` fallback independently.
`skipDelayDuration` remains 300ms. Negative delays clamp to zero; nonfinite
delays fall back to the default. Nested Sub scopes inherit these policies
unless locally overridden.

`disableClickTrigger`, `disableHoverTrigger` and `disablePointerLeaveClose`
default false. They govern pointer policy, not keyboard accessibility:
Enter/Space remain available. Pointer-leave persistence does not disable
Escape, focus-out or outside interaction.

Keyboard interaction with a trigger cancels pending pointer open/close timers,
so delayed pointer intent cannot dismiss a newly keyboard-entered panel.

`lazyMount` and `unmountOnExit` default true for compatibility. Persistent
closed content is hidden, inert and excluded from the accessibility tree.
Exit presence keeps geometry until completion. `hideMode="activity"` uses
React Activity and requires React 19.2+; `display-none` is the portable default.
Vertical viewports constrain content to the connected side and flip to the
opposite side when it offers more room. Viewport and Indicator expose the same
physical `data-side` (`left` or `right`), including RTL. Styled layers consume
the measured left/available-width variables and may set
`--atom-navigation-menu-viewport-side-offset` in px, rem or em (headless default 0).

Viewport `forceMount` retains the viewport shell, not interactive hidden content.
Explicit Root/Sub `lazyMount` or `unmountOnExit` takes precedence over this
compatibility option; omitted lifecycle settings preserve its behavior.

Existing shared-viewport composition remains the default. Set
`Root viewport={false}` and omit Viewport for inline disclosure panels. This
explicit choice preserves deterministic server output without inspecting
children or moving an already mounted host after hydration. Content forwards
its ref to the actual rendered panel in either mode.

`Viewport align="center|start|end"` defaults center. Logical alignment is
resolved against the active trigger before collision shifting; collisionPadding
remains available. Geometry uses the host's owner document.

Link retains `active` for current-page semantics and adds `closeOnClick`
(default true). `onSelect` receives a cancelable Event; preventing it stops
Atom's close action, not browser navigation. Prevent navigation through the
native onClick event. A prevented onClick skips selection and closure.

Native fields and nested widgets inside either panel mode keep their own
Home/End/arrow-key handling. Escape still dismisses the navigation layer.

Content exposes `onEscapeKeyDown`, `onPointerDownOutside`, `onFocusOutside`
and `onInteractOutside`; preventing the notification cancels dismissal.
Pointer callbacks use Atom OutsideInteractionEvent, while focus notification
is a cancelable FocusEvent rather than the noncancelable native focusin.

Use `useNavigationMenu(options)` with `RootProvider value={controller}` for
external state access. Controller exposes value/open/orientation/setValue,
getViewportNode, isViewportRendered and reposition. `Context` accepts a render
callback with the same public state/actions; no router or application store
is bundled. Set state in handlers/effects, not during render.

`ItemIndicator` is a decorative, state-aware slot scoped to Item. It supplies
no glyph or styling. It differs from the moving Indicator that exposes active
trigger geometry. Styled wrappers own their default artwork and replacement.

Headless navigation disclosure primitives with trigger-driven panels, indicator geometry, and a shared viewport.

## When to Use

Use NavigationMenu for website navigation where a top-level destination can
open a panel of related links. Use NavList for a simple visible list of links,
Menubar for application commands such as File and Edit, and Menu for a
temporary action list. NavigationMenu keeps normal link and Tab behavior; it is
not a menu-role widget.

## Features

- Supports root and nested navigation menu scopes.
- Supports mouse-hover delay, click/tap, and keyboard open. Touch/pen never start hover timers.
- Provides a shared viewport that adapts to the active content size.
- Centers horizontal viewport content on the active trigger and shifts it back
  inside the visible browser viewport when it would collide with an edge.
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
  <NavigationMenu.Sub>
    <NavigationMenu.List>
      <NavigationMenu.Item>
        <NavigationMenu.Trigger />
        <NavigationMenu.Content />
      </NavigationMenu.Item>
    </NavigationMenu.List>
    <NavigationMenu.Viewport />
  </NavigationMenu.Sub>
</NavigationMenu.Root>
```

## API Reference

Each part that renders DOM emits a default `[data-slot]`. Pass `data-slot`
to override that value for app-specific styling or test selectors.

### Root

Renders the `nav` landmark, owns the active panel, and coordinates opening
delays, direction, orientation, and top-level keyboard navigation.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string \| null` | - |
| `defaultValue` | `string` | - |
| `onValueChange` | `(value: string \| null) => void` | - |
| `delayDuration` | `number` | `200` |
| `openDelay` / `closeDelay` | `number` | `delayDuration` |
| `disableClickTrigger` / `disableHoverTrigger` / `disablePointerLeaveClose` | `boolean` | `false` |
| `lazyMount` / `unmountOnExit` | `boolean` | `true` |
| `hideMode` | `"display-none" \| "activity"` | `"display-none"` |
| `viewport` | `boolean` | `true` |
| `skipDelayDuration` | `number` | `300` |
| `loop` | `boolean` | `true` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | `"Main"` by default; native `aria-label` overrides it |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### List

Renders the item list.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
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
| `children` | `ReactNode` | required |
| `value` | `string` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-item"` |

### Trigger

Renders the button that controls its item's panel and participates in roving
top-level keyboard navigation.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-expanded` | Whether this item's content is open |
| `aria-controls` | Generated content ID |
| `aria-disabled` | Present when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Content

Registers panel content for the shared viewport.

By default, `Content` does not render at its declaration site. Its `asChild`,
`render`, and forwarded ref target the real panel inside `Viewport`. With
`Root viewport={false}`, the same panel renders at its declaration site instead.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `asChild` | `boolean` | `false` |
| `loop` | `boolean` | Root value |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | - |
| `onPointerDownOutside` | `(event: OutsideInteractionEvent) => void` | - |
| `onFocusOutside` | `(event: FocusEvent) => void` | - |
| `onInteractOutside` | `(event: OutsideInteractionEvent \| FocusEvent) => void` | - |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-motion]` | `"from-start" \| "from-end"` |

### Link

Renders a navigation link.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `active` | `boolean` | `false` |
| `href` | `string` | - |
| `onSelect` | `(event: Event) => void` | - |
| `closeOnClick` | `boolean` | `true` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-current` | `"page"` when active |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-link"` |
| `[data-active]` | Present when active |

### Indicator

The indicator retains its last geometry through CSS exit motion. `forceMount`
keeps the host after exit, hidden until the next opening. Its motion duration
is authored by the styled layer; coordinate it with Viewport's exit duration.

Renders an optional active trigger indicator.

Indicator also exposes `--atom-navigation-menu-viewport-start` and
`--atom-navigation-menu-viewport-end` as physical horizontal layout edges of the
shared viewport in its positioning coordinate space. Styled arrow artwork can
clamp its base inside these bounds. Layout edges exclude animated transforms
and update with viewport sizing/position changes.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `forceMount` | `boolean` | `false` |
| `collisionPadding` | `number` | `8` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `true` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-indicator"` |
| `[data-state]` | `"visible" \| "hidden"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

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
| `children` | `ReactNode` | - |
| `forceMount` | `boolean` | `false` |
| `align` | `"start" \| "center" \| "end"` | `"center"` |
| `collisionPadding` | `number` | `8` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"navigation-menu-viewport"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

| CSS variable | Description |
| --- | --- |
| `--atom-navigation-menu-viewport-width` | Active content width |
| `--atom-navigation-menu-viewport-height` | Active content height |
| `--atom-navigation-menu-viewport-left` | Collision-resolved Root-relative left offset |
| `--atom-navigation-menu-viewport-available-width` | Width available inside the visible viewport and collision padding |
| `--atom-navigation-menu-trigger-left` | Active trigger left offset |
| `--atom-navigation-menu-trigger-top` | Active trigger top offset |
| `--atom-navigation-menu-trigger-width` | Active trigger width |
| `--atom-navigation-menu-trigger-height` | Active trigger height |
| `--atom-navigation-menu-trigger-center-x` | Active trigger horizontal center |
| `--atom-navigation-menu-trigger-center-y` | Active trigger vertical center |

### Sub

Creates a nested navigation menu scope.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
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

`useNavigationMenuContext` returns the same `NavigationMenuApi` state and
actions as `NavigationMenu.Context`, without internal collection registries.
Advanced compound integrations retain the separate item context hook and
legacy provider/type exports; ordinary applications should use RootProvider.

## Examples

### Shared Viewport

```tsx
import { NavigationMenu } from "@flowstack-ui/atom";

export function PrimaryNavigation() {
  return (
    <NavigationMenu.Root aria-label="Primary navigation">
      <NavigationMenu.List>
        <NavigationMenu.Item value="products">
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/products/analytics">
              Analytics
            </NavigationMenu.Link>
            <NavigationMenu.Link href="/products/reports">
              Reports
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Indicator />
      <NavigationMenu.Viewport />
    </NavigationMenu.Root>
  );
}
```

### Active Link

```tsx
import { NavigationMenu } from "@flowstack-ui/atom";

export function DocumentationNavigation() {
  return (
    <NavigationMenu.Root aria-label="Documentation">
      <NavigationMenu.List>
        <NavigationMenu.Item value="docs">
          <NavigationMenu.Link href="/docs" active>
            Docs
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
```

The package also exports `getNavigationMenuGeometry`,
`getNavigationMenuGeometryStyle`, and `getNavigationMenuViewportSizeStyle` for
consumers that need the same indicator or viewport measurements outside the
default parts.

## Accessibility

`Root` renders a `nav` landmark with an accessible name. Triggers expose expanded state and controlled content IDs. Links use native anchor semantics and `aria-current="page"` when active. Text direction can be set with `dir` on `Root` or inherited from `Direction.Provider`.

Pointer hover timing is restricted to mouse input. Touch and pen use the same
click disclosure path as other directly activated controls. Responsive
replacement with a Drawer is an application/styled-layer decision; Atom does
not change this native disclosure navigation into command-menu semantics.

NavigationMenu follows the WAI-ARIA APG
[disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)
for site navigation. It
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

Content arrow navigation uses `Root` `loop` by default. Set `loop={false}` on
`Content` to stop ArrowUp and ArrowDown at the first or last focusable content
element without changing top-level Trigger/Link wrapping.

When focus leaves the navigation region, the active panel closes. Nested
navigation menu scopes close from the inside out: Escape first closes the
innermost sub menu and restores focus to its trigger; a later Escape can close
the parent panel.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
