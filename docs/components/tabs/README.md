# Tabs

Headless tab primitives for switching between related panels.

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

Provides selected tab state.

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

Contains tab triggers.

| Prop | Type | Default |
| --- | --- | --- |
| `ariaLabel` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tabs-list"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### Trigger

Selects a tab panel.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tabs-trigger"` |
| `[data-state]` | `"active" \| "inactive"` |
| `[data-disabled]` | Present when disabled |

### Content

Renders the selected panel.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `keepMounted` | `boolean` | `false` |
| `focusable` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tabs-content"` |
| `[data-state]` | `"active" \| "inactive"` |

### Indicator

Renders an optional active-tab indicator.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"tabs-indicator"` |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

Indicator renders only when it can measure the active trigger. It exposes the
active trigger position through `--tabs-indicator-left`,
`--tabs-indicator-top`, `--tabs-indicator-width`, and
`--tabs-indicator-height`.

## Examples

### Manual Activation

```tsx
<Tabs.Root defaultValue="preview" activationMode="manual">
  <Tabs.List>
    <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
    <Tabs.Trigger value="code">Code</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="preview">Preview panel</Tabs.Content>
  <Tabs.Content value="code">Code panel</Tabs.Content>
</Tabs.Root>
```

### Keep Panels Mounted

```tsx
<Tabs.Content value="settings" keepMounted>
  Settings
</Tabs.Content>
```

## Accessibility

Implements the WAI-ARIA tabs pattern. Triggers render `role="tab"` and panels render `role="tabpanel"` with stable ID relationships. Horizontal arrow-key navigation mirrors in RTL; vertical navigation does not change with text direction.

| Key | Description |
| --- | --- |
| `ArrowRight` / `ArrowLeft` | Moves between horizontal tabs; mirrored when `dir="rtl"` |
| `ArrowDown` / `ArrowUp` | Moves between vertical tabs |
| `Home` / `End` | Moves to first or last tab |
| `Enter` / `Space` | Activates a tab in manual mode |
| `Tab` | Moves focus into the active panel or next focusable element |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
