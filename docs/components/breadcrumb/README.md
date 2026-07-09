# Breadcrumb

Breadcrumb navigation landmark with ordered list semantics.

## Features

- Renders a named breadcrumb `nav` landmark.
- Uses an ordered list for page hierarchy.
- Marks the current page with `aria-current="page"`.
- Provides separator and ellipsis parts.
- Supports `asChild` and `render` on every part.

## Import

```tsx
import { Breadcrumb } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link />
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page />
    </Breadcrumb.Item>
    <Breadcrumb.Ellipsis />
  </Breadcrumb.List>
</Breadcrumb.Root>
```

## API Reference

### Root

Contains the breadcrumb landmark.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `ariaLabel` | `string` | `"Breadcrumb"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb"` |

### List

Ordered list of breadcrumb items.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-list"` |

### Item

List item wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-item"` |

### Link

Navigable breadcrumb link.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-link"` |

### Page

Current page indicator.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-page"` |

### Separator

Decorative separator between crumbs.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-separator"` |

### Ellipsis

Collapsed breadcrumb indicator or trigger wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-ellipsis"` |

## Examples

### Basic breadcrumb

```tsx
<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page>Settings</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
```

### Interactive ellipsis

Use `asChild` when the ellipsis opens a collapsed crumb menu.

```tsx
<Breadcrumb.Ellipsis asChild>
  <button type="button" aria-label="Show collapsed pages">...</button>
</Breadcrumb.Ellipsis>
```

## Accessibility

Breadcrumbs should contain one current page item. Separators are hidden from
assistive technology. If `Breadcrumb.Ellipsis` is interactive, render it as a
real control with an accessible label.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
