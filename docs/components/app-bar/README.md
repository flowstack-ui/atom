# AppBar

Semantic application header structure for top-level app chrome.

## Features

- Renders a native `header` root.
- Provides toolbar, start, center, and end structural slots.
- Exposes root position and toolbar density through data attributes.
- Does not add ARIA toolbar behavior unless consumers compose a real `Toolbar`.
- Supports `asChild` and `render` on every part.

## Import

```tsx
import { AppBar } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<AppBar.Root>
  <AppBar.Toolbar>
    <AppBar.Start />
    <AppBar.Center />
    <AppBar.End />
  </AppBar.Toolbar>
</AppBar.Root>
```

## API Reference

### Root

Contains the app bar landmark.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `position` | `"static" \| "absolute" \| "sticky" \| "fixed"` | `"static"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"appbar"` |
| `[data-position]` | `"static" \| "absolute" \| "sticky" \| "fixed"` |

### Toolbar

Groups app bar content. This is not an ARIA toolbar.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `density` | `"compact" \| "comfortable"` | `"comfortable"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"appbar-toolbar"` |
| `[data-density]` | `"compact" \| "comfortable"` |

### Start

Start-aligned structural section.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"appbar-start"` |

### Center

Center structural section.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"appbar-center"` |

### End

End-aligned structural section.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"appbar-end"` |

## Examples

### Sticky header

Use `position` to expose the intended placement mode to the styled layer.

```tsx
<AppBar.Root position="sticky">
  <AppBar.Toolbar>
    <AppBar.Start>Menu</AppBar.Start>
    <AppBar.Center>Project</AppBar.Center>
    <AppBar.End>Account</AppBar.End>
  </AppBar.Toolbar>
</AppBar.Root>
```

### Compact toolbar

Use `density` to expose compact spacing intent without coupling Atom to CSS.

```tsx
<AppBar.Root>
  <AppBar.Toolbar density="compact">
    <AppBar.Start>Back</AppBar.Start>
    <AppBar.Center>Details</AppBar.Center>
  </AppBar.Toolbar>
</AppBar.Root>
```

## Accessibility

`AppBar.Root` renders a native `header`. Add `aria-label` or `aria-labelledby`
when a page has more than one header/app bar landmark.

`AppBar.Toolbar` intentionally renders a plain `div`. If the content needs
toolbar keyboard navigation, compose the `Toolbar` primitive inside the app bar.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
