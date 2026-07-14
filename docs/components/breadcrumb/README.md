# Breadcrumb

Navigation landmark that shows the current page's place in a hierarchy.

## When to Use

Use Breadcrumb when people may need to move from the current page back through
its parent pages, such as from a product to its category. Use `Pagination` to
move between numbered result pages, and use `NavList` for a general set of
destinations that does not describe the current page's ancestry.

## Features

- Renders a named breadcrumb `nav` landmark.
- Uses an ordered list for page hierarchy.
- Uses native anchors for ancestor links.
- Marks the current page with `aria-current="page"`.
- Hides Separator content from assistive technology.
- Provides an Ellipsis that can remain text or compose an interactive control.
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
      <Breadcrumb.Ellipsis />
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page />
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
```

## API Reference

### Root

Renders the `nav` landmark that contains the complete breadcrumb trail. It
supplies a default accessible name and accepts native nav props.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `ariaLabel` | `string` | `"Breadcrumb"` |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Value from `ariaLabel` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb"` |

### List

Renders the ordered `ol` that communicates the hierarchy of breadcrumb Items.
Place Items and decorative Separators inside it.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-list"` |

### Item

Renders an `li` for one level in the page hierarchy. It can contain an ancestor
Link, the current Page, or an Ellipsis control.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-item"` |

### Link

Renders a native `a` for an ancestor page. Native anchor props such as `href`,
`target`, and `rel` pass through.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-link"` |

### Separator

Renders a decorative `li` between hierarchy levels. Its content defaults to
`/` and is always removed from the accessibility tree.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | `"/"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"presentation"` |
| `aria-hidden` | `"true"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-separator"` |

### Ellipsis

Renders a `span` containing `…` by default to represent collapsed hierarchy
levels. Use `asChild` with a real button when it opens hidden pages or a menu.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | `"…"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-ellipsis"` |

### Page

Renders a non-link `span` for the current page and marks it as the current
location. A breadcrumb trail should contain only one Page.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-current` | `"page"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"breadcrumb-page"` |

## Examples

### Basic Breadcrumb

```tsx
import { Breadcrumb } from "@flowstack-ui/atom";

export function SettingsBreadcrumb() {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/settings">Settings</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>Notifications</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
```

### Expand Collapsed Pages

```tsx
import { useState } from "react";
import { Breadcrumb } from "@flowstack-ui/atom";

export function ExpandableBreadcrumb() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />

        {expanded ? (
          <Breadcrumb.Item>
            <Breadcrumb.Link href="/projects">Projects</Breadcrumb.Link>
          </Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item>
            <Breadcrumb.Ellipsis asChild>
              <button
                type="button"
                aria-label="Show collapsed pages"
                onClick={() => setExpanded(true)}
              >
                …
              </button>
            </Breadcrumb.Ellipsis>
          </Breadcrumb.Item>
        )}

        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>Quarterly report</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
```

## Accessibility

Breadcrumb follows the
[WAI-ARIA Breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/).
Root provides a named navigation landmark, List communicates hierarchy, and
Page exposes `aria-current="page"`. Ancestor Links keep normal browser link
keyboard behavior; Breadcrumb adds no custom keyboard interaction.

Separators are presentational and hidden from assistive technology. If an
Ellipsis is interactive, compose it with a native button and give that button a
label that explains what it reveals.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
