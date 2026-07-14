# AppBar

Semantic application header structure for top-level app content and controls.

## When to Use

Use AppBar to organize the header area of an application or page into start,
center, and end sections. AppBar only provides structure and state metadata. If
a group of controls also needs arrow-key navigation, place a `Toolbar` inside
the AppBar. Use navigation primitives such as `NavList` for the links themselves.

## Features

- Renders a native `header` root.
- Provides Toolbar, Start, Center, and End structural parts.
- Exposes positioning intent and density through data attributes.
- Does not add ARIA toolbar behavior to its structural Toolbar part.
- Passes native props to each part's default element.
- Supports `asChild` and `render` on every part.
- Remains server-safe with no client behavior.

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

Renders the outer `header` landmark and exposes positioning intent for the
consumer-owned layout. Native header props, including accessible names, pass
through.

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

Renders a `div` that groups the AppBar sections and exposes density intent. It
does not render `role="toolbar"` or provide toolbar keyboard behavior.

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

Renders a `div` for content at the logical start of the AppBar, such as a menu
control, back control, or product identity.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"appbar-start"` |

### Center

Renders a `div` for central AppBar content, such as the current page or product
name. It supplies structure only.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"appbar-center"` |

### End

Renders a `div` for content at the logical end of the AppBar, such as account
or application actions.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"appbar-end"` |

## Examples

### Application Header

```tsx
import { AppBar } from "@flowstack-ui/atom";

export function ApplicationHeader() {
  return (
    <AppBar.Root position="sticky" aria-label="Application header">
      <AppBar.Toolbar>
        <AppBar.Start>Menu</AppBar.Start>
        <AppBar.Center>Projects</AppBar.Center>
        <AppBar.End>Account</AppBar.End>
      </AppBar.Toolbar>
    </AppBar.Root>
  );
}
```

### AppBar With Keyboard Toolbar

```tsx
import { AppBar, Toolbar } from "@flowstack-ui/atom";

export function EditorHeader() {
  return (
    <AppBar.Root>
      <AppBar.Toolbar density="compact">
        <AppBar.Start>Document</AppBar.Start>
        <AppBar.End>
          <Toolbar.Root aria-label="Document actions">
            <Toolbar.Button>Save</Toolbar.Button>
            <Toolbar.Button>Share</Toolbar.Button>
          </Toolbar.Root>
        </AppBar.End>
      </AppBar.Toolbar>
    </AppBar.Root>
  );
}
```

## Accessibility

There is no WAI-ARIA AppBar pattern. Root uses a native `header`, which can be a
banner landmark in the appropriate page context. Follow
[WAI-ARIA landmark guidance](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)
and add `aria-label` or `aria-labelledby` when multiple header landmarks need
distinct names.

AppBar.Toolbar is a structural `div`. Compose the `Toolbar` primitive when its
controls need `role="toolbar"` and arrow-key navigation.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
