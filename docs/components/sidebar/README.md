# Sidebar

Headless app-sidebar primitives for expanded, rail, and offcanvas layout states.

## Features

- Supports controlled and uncontrolled sidebar state.
- Supports `expanded`, `rail`, and `offcanvas` states.
- Supports left and right sidebars.
- Provides trigger, panel, and main content relationships.
- Keeps layout and visual sizing in consumer styles.
- Removes offcanvas panels from the accessibility tree.

## Import

```tsx
import { Sidebar } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Sidebar.Root>
  <Sidebar.Trigger />
  <Sidebar.Panel />
  <Sidebar.Main />
</Sidebar.Root>
```

## API Reference

### Root

Provides sidebar state.

| Prop | Type | Default |
| --- | --- | --- |
| `state` | `"expanded" \| "rail" \| "offcanvas"` | - |
| `defaultState` | `"expanded" \| "rail" \| "offcanvas"` | `"expanded"` |
| `onStateChange` | `(state) => void` | - |
| `collapsedState` | `"rail" \| "offcanvas"` | `"offcanvas"` |
| `side` | `"left" \| "right"` | `"left"` |
| `disabled` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"sidebar"` |
| `[data-state]` | `"expanded" \| "rail" \| "offcanvas"` |
| `[data-side]` | `"left" \| "right"` |
| `[data-collapsed-state]` | `"rail" \| "offcanvas"` |

### Trigger

Toggles the sidebar between expanded and the configured collapsed state.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | root value |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"sidebar-trigger"` |
| `[data-state]` | `"expanded" \| "rail" \| "offcanvas"` |
| `[data-side]` | `"left" \| "right"` |
| `[data-disabled]` | Present when disabled |

### Panel

Renders the sidebar panel.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"sidebar-panel"` |
| `[data-state]` | `"expanded" \| "rail" \| "offcanvas"` |
| `[data-side]` | `"left" \| "right"` |

### Main

Renders the main content region associated with the sidebar.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"sidebar-main"` |
| `[data-state]` | `"expanded" \| "rail" \| "offcanvas"` |
| `[data-side]` | `"left" \| "right"` |

## Examples

### Responsive Sidebar

```tsx
<Sidebar.Root collapsedState="offcanvas">
  <Sidebar.Trigger>Menu</Sidebar.Trigger>
  <Sidebar.Panel aria-label="Primary navigation">
    Navigation
  </Sidebar.Panel>
  <Sidebar.Main>Main content</Sidebar.Main>
</Sidebar.Root>
```

### Rail Sidebar

```tsx
<Sidebar.Root collapsedState="rail" defaultState="rail">
  <Sidebar.Panel aria-label="Primary navigation">
    Icon navigation
  </Sidebar.Panel>
  <Sidebar.Main>Content</Sidebar.Main>
</Sidebar.Root>
```

## Accessibility

`Panel` renders an `aside` by default. Add an accessible name when a page has multiple complementary landmarks. The trigger exposes `aria-expanded` and `aria-controls`; offcanvas panels are hidden and inert.

| Key | Description |
| --- | --- |
| `Enter` / `Space` | Activates `Sidebar.Trigger` |
| `Tab` | Moves through focusable content in the visible sidebar and main content |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
