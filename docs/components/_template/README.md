# Component Name

Short description of the primitive and what behavior Atom owns.

## Features

- List the behavior this primitive owns.
- Mention controlled/uncontrolled state when relevant.
- Mention keyboard, focus, direction, portal, geometry, or form behavior when relevant.
- Do not mention visual styling, colors, icons, variants, or layout presets.

## Import

```tsx
import { Component } from "@flowstack-ui/atom";
```

## Anatomy

Show every public part owned by the component, including optional parts.

```tsx
export default () => (
  <Component.Root>
    <Component.Part />
  </Component.Root>
);
```

## API Reference

### Root

Short description of the part.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"component"` |

### Part

Short description of the part.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"component-part"` |

## Examples

Examples can compose with other Atom primitives, application code, and CSS.

```tsx
import { Component } from "@flowstack-ui/atom";

export default () => (
  <Component.Root />
);
```

## Accessibility

- Native element or ARIA role.
- Required accessible names and descriptions.
- Keyboard interaction table when the pattern owns keyboard behavior.
- Important WAI-ARIA pattern notes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
