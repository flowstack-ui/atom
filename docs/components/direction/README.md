# Direction

Headless direction context for mirroring Atom behavior in left-to-right and
right-to-left interfaces.

## When to Use

Use Direction when a group of Atom components should understand that controls
move from right to left, such as in Arabic or Hebrew interfaces. It changes
Atom keyboard and placement behavior. It does not change the browser's text
direction, so also put `dir="rtl"` on the appropriate HTML element.

## Features

- Provides `"ltr"` or `"rtl"` to descendant Atom primitives.
- Lets a component-specific `dir` prop override the shared value.
- Renders no wrapper element.
- Exposes the resolved value through `useDirection`.
- Defaults to `"ltr"` through `defaultDirection`.

## Import

```tsx
import { Direction } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Direction.Provider />

useDirection()
defaultDirection
```

## API Reference

### Provider

Places a direction value in React context without adding an element to the
DOM. Descendant Atom primitives use it when they do not have a local `dir`.

| Prop | Type | Default |
| --- | --- | --- |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` |
| `children` | `ReactNode` | - |

Provider emits no ARIA or data attributes.
It also emits no Data attributes because it does not create a DOM element.

### useDirection

Returns the nearest Provider value, or `defaultDirection` when no Provider is
present. Use it when building a headless compound that must mirror behavior.

```ts
function useDirection(): "ltr" | "rtl"
```

### defaultDirection

The fallback direction used outside a Provider.

```ts
const defaultDirection: "ltr" = "ltr";
```

## Examples

### Right-to-Left Interface

```tsx
import { Direction, useDirection } from "@flowstack-ui/atom";

function ResolvedDirection() {
  const direction = useDirection();
  return <p>Atom direction: {direction}</p>;
}

export function ArabicSettings() {
  return (
    <section dir="rtl" lang="ar">
      <Direction.Provider dir="rtl">
        <h2>الإعدادات</h2>
        <ResolvedDirection />
      </Direction.Provider>
    </section>
  );
}
```

## Accessibility

Direction does not create an accessible element or implement a standalone
WAI-ARIA pattern. Follow
[W3C guidance for HTML text direction](https://www.w3.org/International/questions/qa-html-dir)
and set the native `dir` attribute so text, punctuation, browser behavior, and
assistive technology receive the correct direction. Provider handles only the
direction-aware behavior owned by Atom components.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
