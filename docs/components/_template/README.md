# Component Name

Short description of what the primitive is and what behavior Atom owns.

## When to Use

Explain in simple, professional language what problem this component solves and
when a developer should choose it. Distinguish it from similar Atom primitives
when that choice may be confusing.

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

Show every public part owned by the component, including optional parts and
public aliases. Show only the parts and their nesting—no imports, exports,
component functions, state, handlers, application values, or styling.

```tsx
<Component.Root>
  <Component.Part />
</Component.Root>
```

## API Reference

### Root

Explain the part's responsibility, its relationship to other parts, and any
important default element or behavior it owns.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Value from `ariaLabel` when the part owns an accessible name |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"component"` |
| `[data-state]` | Component-owned state when relevant |

### Part

Explain what this part contributes to the component and where it belongs in the
anatomy.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-expanded` | Component-owned relationship state when relevant |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"component-part"` |
| `[data-disabled]` | Present when disabled, if supported |

## Examples

Each example must be valid, copy-paste-ready TSX. Include all imports and define
every state value, handler, and sample value used by the example. Do not include
CSS, Tailwind classes, visual tokens, icons, or decorative styling.

```tsx
import { Component } from "@flowstack-ui/atom";

export function Example() {
  return <Component.Root />;
}
```

## Accessibility

Describe the native semantic or WAI-ARIA pattern, with an authoritative link
when applicable. Explain the roles, names, relationships, focus behavior, and
consumer responsibilities required to use the component correctly.

Include a keyboard table when Atom owns keyboard interaction:

| Key | Description |
| --- | --- |
| `Key` | Describe the behavior. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
