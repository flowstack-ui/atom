# Direction

Context provider for left-to-right and right-to-left behavior.

## Features

- Provides `ltr` or `rtl` direction to Atom primitives.
- Supports nested providers.
- Exports `useDirection` for custom headless compositions.
- Does not render a DOM wrapper.

## Import

```tsx
import { Direction } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Direction.Provider>
  {/* direction-aware primitives */}
</Direction.Provider>
```

## API Reference

### Provider

Provides direction context to descendants.

| Prop | Type | Default |
| --- | --- | --- |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` |
| `children` | `ReactNode` | - |

## Examples

### Right-to-left region

```tsx
<Direction.Provider dir="rtl">
  <div dir="rtl">{/* content */}</div>
</Direction.Provider>
```

## Accessibility

`Direction.Provider` only provides React context. It does not set a DOM `dir`
attribute because it does not render an element. Add `dir` to the relevant DOM
root when text direction should be exposed to the browser and assistive
technology.

## Data Attributes

Direction has no rendered element and therefore no data attributes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
