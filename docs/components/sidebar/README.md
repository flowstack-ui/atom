# Sidebar

Headless app-sidebar primitives for expanded, rail, and offcanvas layout states.

## When to Use

Use `Sidebar` for a persistent app area beside the main content, such as
workspace navigation or tools, that may collapse to icons or move off screen.
Use `Drawer` for temporary content that overlays the page and needs modal focus
management. Sidebar owns layout state and relationships, not visual sizing.

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

Owns the expanded, rail, or offcanvas state and shares generated Trigger/Panel
relationships with every part. It renders a `div` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `state` | `"expanded" \| "rail" \| "offcanvas"` | - |
| `defaultState` | `"expanded" \| "rail" \| "offcanvas"` | `"expanded"` |
| `onStateChange` | `(state) => void` | - |
| `collapsedState` | `"rail" \| "offcanvas"` | `"offcanvas"` |
| `side` | `"left" \| "right"` | `"left"` |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Root adds no role or ARIA attributes.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"sidebar"` |
| `[data-state]` | `"expanded" \| "rail" \| "offcanvas"` |
| `[data-side]` | `"left" \| "right"` |
| `[data-collapsed-state]` | `"rail" \| "offcanvas"` |
| `[data-disabled]` | Present when disabled |

When disabled, Root ignores state changes and descendant Trigger parts render
disabled state.

### Trigger

Toggles the sidebar between expanded and the configured collapsed state. Renders
a `button` with `type="button"` by default. Disabled state comes from
`Sidebar.Root disabled`; Trigger does not expose its own `disabled` prop.

| Prop | Type | Default |
| --- | --- | --- |
| `toState` | `"expanded" \| "rail" \| "offcanvas"` | toggles between `"expanded"` and `collapsedState` |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-controls` | Generated Panel id |
| `aria-expanded` | `true` when state is `"expanded"` |
| `aria-disabled` | `true` when Root is disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"sidebar-trigger"` |
| `[data-state]` | `"expanded" \| "rail" \| "offcanvas"` |
| `[data-side]` | `"left" \| "right"` |
| `[data-collapsed-state]` | `"rail" \| "offcanvas"` |
| `[data-target-state]` | State that activation will request |
| `[data-disabled]` | Present when disabled |

### Panel

Contains the sidebar's navigation or tools and renders an `aside` by default.
It becomes inert and leaves the accessibility tree only in offcanvas state.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `aria-label` | `string` | - |
| `aria-labelledby` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `true` when state is `"offcanvas"` |
| `inert` | Present when state is `"offcanvas"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"sidebar-panel"` |
| `[data-state]` | `"expanded" \| "rail" \| "offcanvas"` |
| `[data-side]` | `"left" \| "right"` |
| `[data-collapsed-state]` | `"rail" \| "offcanvas"` |
| `[data-disabled]` | Present when disabled |

### Main

Renders the main content region associated with the sidebar. Renders a `main` by
default. It receives the same state metadata as Panel so a consumer can
coordinate the surrounding layout.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

**ARIA:** Main uses the native `<main>` landmark by default and adds no ARIA
attributes.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"sidebar-main"` |
| `[data-state]` | `"expanded" \| "rail" \| "offcanvas"` |
| `[data-side]` | `"left" \| "right"` |
| `[data-collapsed-state]` | `"rail" \| "offcanvas"` |
| `[data-disabled]` | Present when disabled |

Advanced compound parts can read state and actions with `useSidebarContext`;
`SidebarContextProvider` and the context value type are also public for
low-level composition.

## Examples

### Responsive Sidebar

```tsx
import { Sidebar } from "@flowstack-ui/atom";

export default function ResponsiveSidebar() {
  return (
    <Sidebar.Root collapsedState="offcanvas">
      <Sidebar.Trigger>Menu</Sidebar.Trigger>
      <Sidebar.Panel aria-label="Primary navigation">
        <nav><a href="/projects">Projects</a></nav>
      </Sidebar.Panel>
      <Sidebar.Main>Main content</Sidebar.Main>
    </Sidebar.Root>
  );
}
```

### Rail Sidebar

```tsx
import { Sidebar } from "@flowstack-ui/atom";

export default function RailSidebar() {
  return (
    <Sidebar.Root collapsedState="rail" defaultState="rail">
      <Sidebar.Trigger>Toggle navigation</Sidebar.Trigger>
      <Sidebar.Panel aria-label="Primary navigation">Navigation</Sidebar.Panel>
      <Sidebar.Main>Content</Sidebar.Main>
    </Sidebar.Root>
  );
}
```

## Accessibility

`Sidebar` uses native button, complementary, and main landmarks rather than a
special WAI-ARIA widget pattern. Add a Panel name when a page has multiple
complementary landmarks. Trigger exposes `aria-expanded` and `aria-controls`;
offcanvas panels are `aria-hidden` and inert so their controls cannot be
reached.

| Key | Description |
| --- | --- |
| `Enter` / `Space` | Activates `Sidebar.Trigger` |
| `Tab` | Moves through focusable content in the visible sidebar and main content |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
