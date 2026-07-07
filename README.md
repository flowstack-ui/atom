# Atom UI React

Headless accessible React primitives.

`@flowstack-ui/atom` owns behavior, semantic DOM, ARIA attributes, keyboard
interaction, focus management, controlled/uncontrolled state, compound context,
and portals. It does not ship CSS, visual themes, icons, app templates, routing
integrations, or product-specific data models.

## Developer Quick Start

For maintainer work inside this package, read these first:

1. `../AGENTS.md`
2. `../docs/README.md`
3. `AGENTS.md`
4. `docs/README.md`

## Boundary

Atom is the behavior layer for React interfaces. Applications and styled
component packages should compose Atom primitives instead of reimplementing
accessibility, state, and keyboard behavior.

Atom provides:

- React primitives
- ARIA and keyboard behavior
- controlled and uncontrolled state
- focus, stack-aware escape dismissal, presence, and scroll-lock hooks
- compound component context
- portal utilities
- data attributes for styling hooks

Atom does not provide:

- CSS classes or Tailwind utilities
- colors, spacing, typography, density, or elevation
- icons or visual indicators
- router components
- schema validation
- data-grid sorting/filtering frameworks
- application shell templates

## Dependencies

Atom intentionally keeps runtime dependencies narrow.

```json
{
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "dependencies": {
    "@floating-ui/react": "^0.27.19"
  }
}
```

`react-dom` is a peer dependency because Atom includes `Portal`.
`@floating-ui/react` is the approved headless positioning runtime for positioned
primitives such as menus, popovers, tooltips, hover cards, and select listboxes.

## Public API

The namespace exports are the stable API for new usage.

```tsx
import { Dialog, Select, Tabs } from "@flowstack-ui/atom";

export function Example() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open settings</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content ariaLabel="Settings">
          <Dialog.Title>Settings</Dialog.Title>
          <Dialog.Description>Update your preferences.</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

Subpath imports are also supported:

```tsx
import { Dialog } from "@flowstack-ui/atom/dialog";
import { Select } from "@flowstack-ui/atom/select";
import { Switch } from "@flowstack-ui/atom/switch";
```

Hooks and Portal have dedicated subpaths:

```ts
import { useControllableState } from "@flowstack-ui/atom/hooks";
import { Portal } from "@flowstack-ui/atom/portal";
```

Direct part exports mirror the namespace part names. Prefer namespaces for new
code, and use direct part exports when they improve local composition.

```tsx
import { DialogRoot, DialogContent } from "@flowstack-ui/atom/dialog";
```

## Native DOM Props

Atom primitives accept native DOM attributes for the element they render by
default. Application code and styled layers can pass props such as `id`, `style`,
`title`, `data-testid`, and additional `aria-*` attributes directly to the
primitive.

Atom-owned behavior remains authoritative. Required roles, state attributes,
disabled behavior, focus management, and built-in event handlers are applied
after consumer props. Consumer event handlers are composed with Atom handlers,
and handlers that call `event.preventDefault()` can cancel Atom behavior where
that escape hatch is supported.

## Styling

Atom does not ship styles. Use native selectors, `data-slot`, and behavior state
attributes in your own CSS.

```css
[data-slot="button"][data-disabled] {
  opacity: 0.5;
}

[data-slot="dialog-content"][data-state="open"] {
  opacity: 1;
}
```

Avoid depending on internal file paths. Public imports should come from the root
package or a documented subpath.

## Forms

`Field` owns label, description, error, and shared form-question state. `Input`
and `Textarea` own native text-control behavior and inherit `Field` state when
rendered inside `Field.Root`.

```tsx
import { Field } from "@flowstack-ui/atom/field";
import { Input } from "@flowstack-ui/atom/input";

<Field.Root id="email" required invalid={hasError}>
  <Field.Label>Email</Field.Label>
  <Input.Root name="email" type="email" />
  <Field.Description>Use a work email.</Field.Description>
  <Field.Error>Email is required.</Field.Error>
</Field.Root>;
```

`Form.Root` owns the native form element, submit/reset event flow, and coarse
form status data attributes. It intentionally does not duplicate `Field`.

```tsx
import { Form } from "@flowstack-ui/atom/form";

<Form.Root preventDefaultOnSubmit onSubmit={handleSubmit}>
  {/* fields */}
  <button type="submit">Submit</button>
</Form.Root>;
```

## Overlays And Positioned Content

Positioned primitives use headless Floating UI behavior. Atom owns state,
triggers, ARIA behavior, keyboard behavior, focus handling, and unstyled
positioning data. Applications own visual treatment, animation, dimensions,
scrims, shadows, and arrows.

```tsx
import { Popover } from "@flowstack-ui/atom/popover";

<Popover.Root>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Portal>
    <Popover.Content>
      Content
      <Popover.Arrow />
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>;
```

## Navigation

Use the primitive that matches the interaction model:

- `NavList` for native link navigation.
- `NavigationMenu` for navigation disclosure panels.
- `Tabs` for tab panels.
- `Menu`, `DropdownMenu`, `ContextMenu`, and `Menubar` for command menus.
- `Tree` for hierarchical one-dimensional navigation or selection.

```tsx
import { NavList } from "@flowstack-ui/atom/nav-list";

<NavList.Root aria-label="Docs">
  <NavList.List>
    <NavList.Item>
      <NavList.Link href="#dialog" active>
        Dialog
      </NavList.Link>
    </NavList.Item>
  </NavList.List>
</NavList.Root>;
```

## Data And Collections

Atom includes structural and interactive data primitives:

- `Table` for native semantic tables.
- `DataGrid` for ARIA grid keyboard behavior and cell focus.
- `TreeGrid` for hierarchical grid behavior.
- `List` for native list structure.
- `Listbox` for selectable option lists.
- `Feed` for WAI-ARIA feed navigation.
- `Virtualizer` helpers for large scrollable collections.
- `Collection` helpers for registry-backed composite widgets.

Higher-level sorting, filtering, editing, column models, and data fetching are
intentionally outside Atom.

## Documentation

- Public package docs live in `docs/`.
- Component docs live in `docs/components/`.
- Architecture docs live in `docs/architecture/`.
- Release checks live in `docs/guides/release-checklist.md`.

## Development

```bash
npm run test
npm run build
NPM_CONFIG_CACHE=/tmp/atom-ui-npm-cache npm pack --dry-run
```
