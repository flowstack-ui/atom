# NavList

Headless navigation list primitives for sidebars, page navigation, and grouped route lists.

## When to Use

Use NavList for an ordinary list of destinations, such as sidebar links,
settings pages, or grouped documentation routes. Use NavigationMenu when a
top-level link opens a panel of more links, Menubar for application commands,
and Listbox when the rows select values instead of navigating.

## Features

- Renders native navigation, list, list item, link, section, heading, and button semantics.
- Supports vertical and horizontal orientation metadata for styled layers.
- Supports active/current link state with configurable `aria-current` tokens.
- Supports disabled links and disabled section interaction.
- Supports collapsible sections with controlled and uncontrolled open state.
- Supports `asChild` and `render` composition across every rendered part.
- Keeps route behavior in consumer links while Atom owns ARIA and data attributes.

## Import

```tsx
import { NavList } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<NavList.Root>
  <NavList.List>
    <NavList.Item>
      <NavList.Link />
    </NavList.Item>
  </NavList.List>
  <NavList.Section>
    <NavList.SectionLabel />
    <NavList.SectionTrigger />
    <NavList.SectionContent>
      <NavList.List>
        <NavList.Item>
          <NavList.Link />
        </NavList.Item>
      </NavList.List>
    </NavList.SectionContent>
  </NavList.Section>
</NavList.Root>
```

## API Reference

All DOM-rendering parts accept native props for their default element, except
for props Atom owns for behavior or accessibility. `data-slot` can be overridden
as a native `data-*` prop, but it is documented under data attributes because it
is primarily a styling hook.

### Root

Contains the navigation list and provides orientation metadata to descendants.
Renders a `nav` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list"` by default |
| `[data-orientation]` | `"vertical" \| "horizontal"` |

### List

Renders the item list as `ul` by default, or `ol` when `ordered` is true.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `ordered` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-list"` by default |
| `[data-orientation]` | `"vertical" \| "horizontal"` |
| `[data-ordered]` | Present when `ordered` is true |

### Item

Wraps one navigation item. Renders an `li` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-item"` by default |
| `[data-orientation]` | `"vertical" \| "horizontal"` |
| `[data-disabled]` | Present when disabled |

`Item disabled` is a styling hook only. Pass `disabled` to `NavList.Link` to
prevent navigation.

### Link

Renders a native link or composed route link. Renders an `a` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `href` | `string` | - |
| `active` | `boolean` | `false` |
| `current` | `boolean \| "page" \| "step" \| "location" \| "date" \| "time"` | `"page"` |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `aria-current` | `boolean \| "page" \| "step" \| "location" \| "date" \| "time"` | active `current` value |

| ARIA attribute | Values |
| --- | --- |
| `aria-current` | From `aria-current`, or from `current` when active |
| `aria-disabled` | Present when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-link"` by default |
| `[data-orientation]` | `"vertical" \| "horizontal"` |
| `[data-active]` | Present when active |
| `[data-current]` | Present when active |
| `[data-disabled]` | Present when disabled |

When `disabled` is true, `href` is omitted, clicks are prevented, and
`tabIndex={-1}` is rendered. `aria-current` overrides the value derived from
`active` and `current`.

### Section

Provides grouped navigation state. Renders a `section` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `collapsible` | `boolean` | `false` |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `true` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-section"` by default |
| `[data-orientation]` | `"vertical" \| "horizontal"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-collapsible]` | Present when collapsible |
| `[data-disabled]` | Present when disabled |

Non-collapsible sections are always open. `disabled` prevents collapsible
sections from changing open state.

### SectionLabel

Labels a section. Renders `h2` by default and registers itself so section
content can reference the label.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `as` | `"h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "div"` | `"h2"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-section-label"` by default |
| `[data-orientation]` | `"vertical" \| "horizontal"` |

### SectionTrigger

Toggles a collapsible section. Renders a `button` by default. When composed with
a non-button element, Atom adds button semantics and keyboard activation.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `onClick` | `MouseEventHandler<HTMLElement>` | - |
| `onKeyDown` | `KeyboardEventHandler<HTMLElement>` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-expanded` | Section open state when collapsible |
| `aria-controls` | Section content id when collapsible |
| `aria-disabled` | Present for disabled non-native composed triggers |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-section-trigger"` by default |
| `[data-orientation]` | `"vertical" \| "horizontal"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-collapsible]` | Present when the section is collapsible |
| `[data-disabled]` | Present when the section is disabled |

For non-collapsible sections, the trigger remains rendered but does not expose
expanded state or toggle behavior.

### SectionContent

Contains section links. Renders a `div` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `forceMount` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-labelledby` | Section label id, or trigger id for collapsible sections without a label |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-section-content"` by default |
| `[data-orientation]` | `"vertical" \| "horizontal"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-collapsible]` | Present when the section is collapsible |

When closed, content unmounts unless `forceMount` is true. Forced closed content
renders `hidden`.

Advanced compound components can use `useNavListContext` and
`useNavListSectionContext`; the matching providers and context value types are
also public exports.

## Examples

### Sidebar Navigation

```tsx
import { NavList } from "@flowstack-ui/atom";

export function ComponentsNavigation() {
  return (
    <NavList.Root aria-label="Components">
      <NavList.Section collapsible defaultOpen>
          <NavList.SectionLabel>Components</NavList.SectionLabel>
          <NavList.SectionTrigger>Show or hide components</NavList.SectionTrigger>
          <NavList.SectionContent>
            <NavList.List>
              <NavList.Item>
                <NavList.Link active current="page" href="/components/input">
                  Input
                </NavList.Link>
              </NavList.Item>
              <NavList.Item>
                <NavList.Link href="/components/select">Select</NavList.Link>
              </NavList.Item>
            </NavList.List>
          </NavList.SectionContent>
      </NavList.Section>
    </NavList.Root>
  );
}
```

### Ordered Steps

```tsx
import { NavList } from "@flowstack-ui/atom";

export function SetupSteps() {
  return (
    <NavList.Root orientation="horizontal" aria-label="Setup steps">
      <NavList.List ordered>
        <NavList.Item>
          <NavList.Link active current="step" href="/setup/account">
            Account
          </NavList.Link>
        </NavList.Item>
        <NavList.Item>
          <NavList.Link href="/setup/profile">Profile</NavList.Link>
        </NavList.Item>
      </NavList.List>
    </NavList.Root>
  );
}
```

## Accessibility

NavList uses native [`nav`](https://html.spec.whatwg.org/multipage/sections.html#the-nav-element),
list, list item, heading, button, and anchor
behavior. It does not implement roving focus because route navigation should
remain normal Tab navigation.

Active links expose `aria-current` using the `current` token, defaulting to
`"page"`. Use `current="step"`, `"location"`, `"date"`, or `"time"` when the
current item represents that ARIA current state instead of a page.

| Key | Description |
| --- | --- |
| `Tab` | Moves through links and section triggers in document order |
| `Enter` | Activates a focused link or section trigger |
| `Space` | Toggles a focused section trigger |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
