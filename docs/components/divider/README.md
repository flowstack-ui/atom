# Divider

Headless primitive for separating nearby content visually or semantically.

## When to Use

Use Divider to show that two groups of content are separate. Keep it decorative
when the line only helps sighted users. Make it semantic when the separation is
important to understanding the page. Do not use Divider as a draggable resize
handle; an interactive splitter needs value state and keyboard controls that
Divider does not provide.

## Features

- Supports horizontal and vertical orientation.
- Defaults to decorative semantics.
- Uses `hr` by default when it has no children.
- Uses `div` by default when it contains a label or other children.
- Preserves native props and supports custom rendering.

## Import

```tsx
import { Divider } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Divider.Root />
```

## API Reference

### Root

Creates the dividing boundary. Set `decorative={false}` when assistive
technology should perceive it as a separator.

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `decorative` | `boolean` | `true` |
| `children` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"none"` when decorative; `"separator"` otherwise |
| `aria-orientation` | `"vertical"` for a semantic vertical separator; horizontal is the ARIA default |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"divider"` |

## Examples

### Decorative Divider

```tsx
import { Divider } from "@flowstack-ui/atom";

export function AccountSections() {
  return (
    <section>
      <p>Profile settings</p>
      <Divider.Root />
      <p>Security settings</p>
    </section>
  );
}
```

### Named Semantic Divider

```tsx
import { Divider } from "@flowstack-ui/atom";

export function ReportSections() {
  return (
    <section>
      <p>Current results</p>
      <Divider.Root decorative={false} aria-label="Archived results" />
      <p>Archived results</p>
    </section>
  );
}
```

## Accessibility

A semantic Divider uses the
[WAI-ARIA Separator pattern](https://www.w3.org/WAI/ARIA/apg/patterns/separator/).
Decorative dividers are removed from the accessibility tree with `role="none"`.
Semantic dividers are static separators, not focusable widgets, so Divider owns
no keyboard interaction.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
