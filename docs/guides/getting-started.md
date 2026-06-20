# Getting Started

Atom UI is a headless React primitive package. It provides accessible behavior
and semantic structure without visual styling.

```bash
npm install @flowstack-ui/atom
```

React and React DOM are peer dependencies:

```bash
npm install react react-dom
```

## Usage

Prefer namespace imports:

```tsx
import { Dialog, Field, Input } from "@flowstack-ui/atom";

export function Example() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Profile</Dialog.Title>
          <Field.Root id="email" required>
            <Field.Label>Email</Field.Label>
            <Input.Root name="email" type="email" />
          </Field.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

Subpath imports are supported:

```tsx
import { Dialog } from "@flowstack-ui/atom/dialog";
import { Input } from "@flowstack-ui/atom/input";
```

## Styling

Atom does not ship CSS. Style primitives through native selectors,
`data-slot`, and behavior state attributes.

```css
[data-slot="button"][data-state="pressed"] {
  opacity: 0.85;
}
```

Styled packages should compose Atom primitives instead of reimplementing ARIA,
keyboard, focus, and state behavior.
