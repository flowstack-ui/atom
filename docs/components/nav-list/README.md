# NavList

Headless navigation list primitives for sidebars, page navigation, and grouped route lists.

## Features

- Renders native navigation and list semantics.
- Supports active/current link state.
- Supports collapsible sections.
- Supports vertical and horizontal orientation metadata.
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
    <NavList.Section>
      <NavList.SectionLabel />
      <NavList.SectionTrigger />
      <NavList.SectionContent>
        <NavList.Item>
          <NavList.Link />
        </NavList.Item>
      </NavList.SectionContent>
    </NavList.Section>
  </NavList.List>
</NavList.Root>
```

## API Reference

### Root

Contains the navigation list.

| Prop | Type | Default |
| --- | --- | --- |
| `currentValue` | `string \| string[]` | - |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list"` |
| `[data-orientation]` | `"vertical" \| "horizontal"` |

### List

Renders a native list.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-list"` |

### Item

Wraps one navigation item.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-item"` |

### Link

Renders a native link or composed route link.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `active` | `boolean` | derived from `currentValue` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-link"` |
| `[data-current]` | Present when current |

### Section

Provides grouped navigation state.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |

### SectionLabel

Labels a section.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-section-label"` |

### SectionTrigger

Toggles a collapsible section.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"nav-list-section-trigger"` |
| `[data-state]` | `"open" \| "closed"` |

### SectionContent

Contains collapsible section links.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMount` | `boolean` | `false` |

## Examples

### Sidebar Navigation

```tsx
<NavList.Root currentValue="inputs">
  <NavList.List>
    <NavList.Section value="components" defaultOpen>
      <NavList.SectionLabel>Components</NavList.SectionLabel>
      <NavList.SectionContent>
        <NavList.Item>
          <NavList.Link value="inputs" href="/components/input">
            Input
          </NavList.Link>
        </NavList.Item>
      </NavList.SectionContent>
    </NavList.Section>
  </NavList.List>
</NavList.Root>
```

## Accessibility

NavList uses native `nav`, list, and anchor behavior. It does not implement roving focus because route navigation should remain normal Tab navigation.

| Key | Description |
| --- | --- |
| `Tab` | Moves through links and section triggers in document order |
| `Enter` | Activates a focused link or section trigger |
| `Space` | Toggles a focused section trigger |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
