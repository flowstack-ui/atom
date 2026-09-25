# Tabs

Headless tab primitives for switching between related panels.

## When to Use

Use `Tabs` to switch between a small set of related views without leaving the
current page. Use normal links when each choice is a separate destination, and
use `Accordion` when people should be able to see several sections open at once.

## Features

- Implements linked tab and tabpanel ARIA.
- Supports controlled and uncontrolled selected value.
- Supports horizontal and vertical orientation.
- Supports RTL-aware horizontal arrow-key navigation.
- Supports automatic or manual activation.
- Supports disabled tabs, keep-mounted panels, focusable panels, and an optional indicator.

## Import

```tsx
import { Tabs } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Tabs.Root>
  <Tabs.List>
    <Tabs.Trigger />
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Content />
</Tabs.Root>
```

## API Reference

### Root

Owns selection, orientation, direction, activation mode, and the trigger
registry used for roving focus.

**ARIA:** Root adds no role or ARIA attributes.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `defaultValue` | `string` | - |
| `onValueChange` | `(value: string) => void` | - |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |
| `activationMode` | `"automatic" \| "manual"` | `"automatic"` |
| `loop` | `boolean` | `true` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tabs-root"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### List

Provides the `tablist` container and owns Arrow, Home, and End navigation among
enabled Trigger parts.

| Prop | Type | Default |
| --- | --- | --- |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"tablist"` |
| `aria-label` | Value from `ariaLabel` when provided |
| `aria-orientation` | Root orientation |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tabs-list"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### Trigger

Renders one roving-focus tab and connects it to Content with generated IDs.
Automatic mode selects during keyboard navigation; manual mode waits for activation.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"tab"` |
| `aria-selected` | `true` when active |
| `aria-controls` | Matching Content ID |
| `aria-disabled` | `true` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tabs-trigger"` |
| `[data-state]` | `"active" \| "inactive"` |
| `[data-disabled]` | Present when disabled |
| `[data-orientation]` | Root orientation |
| `[data-value]` | Trigger value |

### Content

Renders the panel linked to its Trigger. Inactive panels unmount unless
`keepMounted` is enabled. Text-only active panels enter the Tab order automatically;
`focusable={false}` opts out and an explicit `tabIndex` takes precedence.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `keepMounted` | `boolean` | `false` |
| `focusable` | `boolean` | automatic |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"tabpanel"` |
| `aria-labelledby` | Matching Trigger ID |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tabs-content"` |
| `[data-state]` | `"active" \| "inactive"` |
| `[data-orientation]` | Root orientation |

### Indicator

Measures the active Trigger and exposes its position through CSS variables. It
is hidden until an active Trigger can be measured.

**ARIA:** Indicator is decorative and adds no role or ARIA attributes.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tabs-indicator"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

Indicator is hidden until it can measure the active trigger. It exposes the
active trigger position through `--tabs-indicator-left`,
`--tabs-indicator-top`, `--tabs-indicator-width`, and
`--tabs-indicator-height`.

Advanced compound parts can read `useTabsContext` or use the public
`TabsContextProvider`.

## Controller, lifecycle, and composition

`useTabs(options)` supplies the same controller as Root. Pass it to
`Tabs.RootProvider value={controller}`; `Tabs.Context` accepts a render function
and `useTabsContext()` reads the nearest controller. `setValue`, `clearValue`,
and `focus` support external controls. `onValueChange` remains a string callback.

Root/controller options also include `loopFocus` (takes precedence over `loop`),
`deselectable` (activation of the selected tab clears to `""`),
`onFocusChange({ focusedValue })`, `composite` (default true), `id`, and `ids`.
`ids` accepts root/list/indicator strings and trigger/content value functions.
Custom IDs must be unique, nonempty, and whitespace-free. Generated IDs safely
encode arbitrary nonempty values. Avoid duplicate or empty Trigger values.

Compose an anchor with `Trigger asChild` for URL-backed peer panels. `navigate`
receives `{ value, node, href }` for router integration. Modified clicks retain
native link behavior. Disabled links lose their href and cannot select. Ordinary
site navigation still belongs to links, not tab semantics. When removing the
selected item, update application-owned selection; Atom restores keyboard entry
without silently overriding controlled state.

`lazyMount` and `unmountOnExit` are independent Root/Content options. When either
is explicit, the other defaults to false. Without either, the legacy default
unmounts inactive panels; `keepMounted` retains them eagerly. Content overrides
Root lifecycle options. `onExitComplete` runs after the owned exit. Inactive
panels are inert during exit and hidden afterward. `hideMode="activity"` uses
React Activity when available and falls back to display-none retention on React
versions without Activity. Retained panels can keep form state; unmounted ones
cannot. `composite={false}` is an advanced integration option that leaves focus
ownership to the surrounding composite.

Indicator supports refs, `render`, and `asChild`. It is hidden before measurement
and exposes `data-ready`, `data-animate`, and List's `data-indicator-ready` so
styled layers can replace the server-selected fallback without double painting.
Its coordinates are list-local, including overflow scrolling and scaled hosts.

## Examples

### Manual Activation

```tsx
import { Tabs } from "@flowstack-ui/atom";

export default function ManualTabs() {
  return (
<Tabs.Root defaultValue="preview" activationMode="manual">
  <Tabs.List>
    <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
    <Tabs.Trigger value="code">Code</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="preview">Preview panel</Tabs.Content>
  <Tabs.Content value="code">Code panel</Tabs.Content>
</Tabs.Root>
  );
}
```

### Keep Panels Mounted

```tsx
import { Tabs } from "@flowstack-ui/atom";

export default function MountedTabs() {
  return (
    <Tabs.Root defaultValue="profile">
      <Tabs.List><Tabs.Trigger value="profile">Profile</Tabs.Trigger><Tabs.Trigger value="settings">Settings</Tabs.Trigger></Tabs.List>
      <Tabs.Content value="profile" keepMounted>Profile</Tabs.Content>
      <Tabs.Content value="settings" keepMounted>Settings</Tabs.Content>
    </Tabs.Root>
  );
}
```

## Accessibility

Arrow, Home and End navigation reveals the focused trigger using nearest-edge
scrolling. Selection mode does not change this focus visibility behavior.

Tabs follows the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
Triggers and panels have stable ID relationships. Horizontal navigation mirrors
in RTL; vertical navigation does not change with text direction.

| Key | Description |
| --- | --- |
| `ArrowRight` / `ArrowLeft` | Moves between horizontal tabs; mirrored when `dir="rtl"` |
| `ArrowDown` / `ArrowUp` | Moves between vertical tabs |
| `Home` / `End` | Moves to first or last tab |
| `Enter` / `Space` | Activates a tab in manual mode |
| `Tab` | Moves focus into the active panel or next focusable element |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
