# Button

Action primitive for native buttons, links, and custom button-like elements.

## When to Use

Use Button when the user performs an action such as saving, submitting, or
opening a control. Provide `href` when the control navigates to another
location. Use `Toggle` when the pressed state must stay on or off, and use
`Pressable` for a custom interactive surface that needs press-state behavior
without Button's link and loading APIs.

## Features

- Renders a native `button` by default.
- Renders a native `a` when `href` is provided.
- Preserves link semantics when an anchor or inactive-safe link adapter is
  supplied through `asChild` or `render`.
- Supplies button role, focusability, and keyboard activation to non-native
  custom renders.
- Supports disabled and loading states.
- Calls `onPress` after `onClick` when the click is not canceled.
- Prevents inactive controls from firing consumer activation handlers.
- Adds `noopener noreferrer` to new-tab links while preserving other `rel`
  tokens.
- Supports `asChild` and `render`.

## Import

```tsx
import { Button } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Button.Root />
```

## API Reference

### Root

Renders the action element and owns its activation, inactive-state, and safe
link behavior. Native button props pass through by default; anchor-related props
apply when `href` is provided.

| Prop | Type | Default |
| --- | --- | --- |
| `href` | `string` | - |
| `target` | `AnchorHTMLAttributes<HTMLAnchorElement>["target"]` | - |
| `rel` | `AnchorHTMLAttributes<HTMLAnchorElement>["rel"]` | - |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` |
| `onPress` | `MouseEventHandler<HTMLElement>` | - |
| `onClick` | `MouseEventHandler<HTMLElement>` | - |
| `onKeyDown` | `KeyboardEventHandler<HTMLElement>` | - |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for non-native action renders; `"link"` for an inactive direct or composed link |
| `aria-disabled` | `"true"` when a non-native control is disabled or loading |
| `aria-busy` | `"true"` when loading |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"button"` |
| `[data-disabled]` | Present when disabled |
| `[data-loading]` | Present when loading |

A native button receives the native `disabled` attribute only when `disabled`
is true. A loading native button remains focusable, exposes `aria-busy`, and
blocks activation. Inactive direct and composed links omit `href`, `target`,
and `rel`, including when those props came from the `asChild` child or a
`render` element.

When composing a link, expose its destination through an `href` prop on
`Button.Root`, the `asChild` child, or the `render` element. Atom uses that prop
to preserve navigation semantics and replaces `href`, `target`, and `rel` with
`null` while disabled or loading. Native anchors and permissive adapters omit
those attributes from the rendered anchor. Link compositions keep native link
keyboard behavior: Enter is handled by the browser, and Space does not
synthesize a click.

Some router components require `href` to remain a string and will reject this
inactive prop shape. Do not compose those components directly for a Button
that can become disabled or loading. Use a render adapter that renders the
router component only while active and renders a destination-free anchor while
inactive. Atom intentionally does not add router-specific compatibility.

## Examples

### Action Button

```tsx
import { Button } from "@flowstack-ui/atom";

export function SaveButton() {
  return (
    <Button.Root onPress={() => console.log("Draft saved")}>
      Save draft
    </Button.Root>
  );
}
```

### Navigation Link

```tsx
import { Button } from "@flowstack-ui/atom";

export function SettingsLink() {
  return <Button.Root href="/settings">Settings</Button.Root>;
}
```

### Composed Link

```tsx
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Button } from "@flowstack-ui/atom";

const AppLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(function AppLink(props, ref) {
  return <a ref={ref} {...props} />;
});

export function ComposedSettingsLink() {
  return (
    <Button.Root asChild>
      <AppLink href="/settings">Settings</AppLink>
    </Button.Root>
  );
}
```

The example above is an inactive-safe adapter because it tolerates Atom's
removed destination at runtime. For a strict router component, adapt the
inactive render explicitly:

```tsx
import type { AnchorHTMLAttributes } from "react";
import { Button } from "@flowstack-ui/atom";

type StrictRouterLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string;
};

function StrictRouterLink({ href, ...props }: StrictRouterLinkProps) {
  return <a {...props} href={href} />;
}

export function StrictRouterButton({ disabled }: { disabled: boolean }) {
  const destination = "/settings";

  return (
    <Button.Root
      href={destination}
      disabled={disabled}
      render={(props) => {
        const { href: _inactiveHref, ...linkProps } = props;
        const anchorProps = linkProps as AnchorHTMLAttributes<HTMLAnchorElement>;

        if (anchorProps["aria-disabled"]) {
          return <a {...anchorProps} />;
        }

        return <StrictRouterLink {...anchorProps} href={destination} />;
      }}
    >
      Settings
    </Button.Root>
  );
}
```

In an application, `StrictRouterLink` is the router component and remains
application-owned; Atom does not import or wrap it.

### Loading Action

```tsx
import { Button } from "@flowstack-ui/atom";

export function SavingButton() {
  return (
    <Button.Root loading aria-label="Saving changes">
      Saving
    </Button.Root>
  );
}
```

### Custom Button Element

```tsx
import { Button } from "@flowstack-ui/atom";

export function CustomButton() {
  return (
    <Button.Root
      render="div"
      onPress={() => console.log("Command opened")}
    >
      Open command
    </Button.Root>
  );
}
```

## Accessibility

Button follows the
[WAI-ARIA Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).
Prefer the default native `button` because the browser supplies its semantics
and keyboard behavior. Every Button needs an accessible name from its text,
`aria-label`, or `aria-labelledby`.

Custom non-native action elements receive `role="button"`, `tabIndex={0}`, and
keyboard activation. Native anchors and inactive-safe composed links retain
link semantics instead of receiving button role or Space-key activation. Disabled
native buttons use the native `disabled` attribute. Disabled or loading
non-native controls expose `aria-disabled`, and loading controls expose
`aria-busy` while remaining focusable. Inactive links have no live `href`, so
clicks, keyboard activation, and alternate navigation methods cannot follow the
destination.

| Key | Description |
| --- | --- |
| `Enter` | Activates custom button-like renders; native controls keep browser behavior. |
| `Space` | Activates custom button-like renders; native controls keep browser behavior. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
