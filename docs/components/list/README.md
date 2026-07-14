# List

Server-safe native primitives for ordered and unordered static lists.

## When to Use

Use List when content is naturally a set of items or a sequence of steps. Use
NavList for application navigation, Menu or Listbox for keyboard-operated
choices, and Feed for a stream whose articles need feed navigation. List does
not manage focus, selection, activation, or item state.

## Features

- Renders native `ul`, `ol`, and `li` elements.
- Switches between unordered and ordered roots.
- Exposes consumer-owned disabled item metadata.
- Preserves native list props and supports custom composition.
- Adds no client boundary or keyboard handling.

## Import

```tsx
import { List } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<List.Root>
  <List.Item />
</List.Root>
```

## API Reference

### Root

Renders `ul` by default or `ol` when `ordered` is true. Native list props such
as `start` and `reversed` pass through when the rendered element supports them.

| Prop | Type | Default |
| --- | --- | --- |
| `ordered` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"list"` |
| `[data-ordered]` | Present when `ordered` |

### Item

Renders one native `li`. Disabled state is descriptive metadata only; Atom
does not suppress events or disable interactive descendants.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-disabled` | `"true"` when `disabled` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"list-item"` |
| `[data-disabled]` | Present when disabled |

## Examples

### Ordered Steps

```tsx
import { List } from "@flowstack-ui/atom";

export function SetupSteps() {
  return (
    <List.Root ordered>
      <List.Item>Create an account</List.Item>
      <List.Item>Verify your email</List.Item>
      <List.Item>Choose a workspace</List.Item>
    </List.Root>
  );
}
```

### Unavailable Static Item

```tsx
import { List } from "@flowstack-ui/atom";

export function FeatureList() {
  return (
    <List.Root>
      <List.Item>Reports</List.Item>
      <List.Item disabled>Exports are not available</List.Item>
    </List.Root>
  );
}
```

## Accessibility

List relies on native list semantics and owns no keyboard interaction. Preserve
`ul`/`ol` and `li` semantics when using composition. `aria-disabled` tells
assistive technology that an Item is unavailable, but consumers must separately
disable or remove any interactive descendants.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
