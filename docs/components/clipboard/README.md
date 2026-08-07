# Clipboard

Headless text-copy behavior with coordinated value, native controls, truthful
asynchronous status, and accessible authored feedback.

## When to Use

Use `Clipboard` when a user needs to copy a known text value, such as a command,
URL, token, or code sample. Applications provide all styling, icons, and status
wording. Clipboard does not read, paste, cut, or copy binary data.

## Features

- Coordinates controlled and uncontrolled text values across Label, Input,
  ValueText, and Trigger parts.
- Reports truthful `idle`, `copying`, `copied`, and `error` states for
  asynchronous clipboard writes.
- Keeps the newest copy attempt authoritative when earlier writes resolve or
  reject later.
- Supports disabled state, configurable status reset timing, an explicit write
  adapter, authored live feedback, and public composition APIs.

## Import

```tsx
import { Clipboard } from "@flowstack-ui/atom";
// or: import { Clipboard } from "@flowstack-ui/atom/clipboard";
```

## Anatomy

```tsx
<Clipboard.Root defaultValue="npm install @flowstack-ui/atom">
  <Clipboard.Label>Install command</Clipboard.Label>
  <Clipboard.Control>
    <Clipboard.Input readOnly />
    <Clipboard.Trigger>Copy</Clipboard.Trigger>
  </Clipboard.Control>
  <Clipboard.Status>
    <Clipboard.Indicator when="copying">Copying…</Clipboard.Indicator>
    <Clipboard.Indicator when="copied">Copied</Clipboard.Indicator>
    <Clipboard.Indicator when="error">Copy failed</Clipboard.Indicator>
  </Clipboard.Status>
</Clipboard.Root>
```

## Behavior

Trigger writes Root's current value with `navigator.clipboard.writeText`. State
moves through `idle`, `copying`, and either `copied` or `error`; copied and error
reset to idle after `timeout`. A newer attempt always wins over an older pending
attempt. Atom does not claim success when the browser rejects or lacks the API,
and it does not use the deprecated `execCommand` fallback.

## API Reference

### Root

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `defaultValue` | `string` | `""` |
| `onValueChange` | `(value: string) => void` | - |
| `disabled` | `boolean` | `false` |
| `timeout` | `number` | `3000` |
| `onStatusChange` | `(details: { status; error? }) => void` | - |
| `writeValue` | `(value: string) => void \| Promise<void>` | Clipboard API |
| `render` / `asChild` | `RenderProp` / `boolean` | - / `false` |

`writeValue` is an explicit adapter for controlled environments and tests. Its
resolution or rejection remains authoritative.

### Parts

- `Label` renders `label` and associates itself with `Input`.
- `Control` renders a structural `div`.
- `Input` renders an editable native text input coordinated with Root value.
- `ValueText` renders Root value when children are omitted.
- `Trigger` renders `button type="button"`; `render` and `asChild` are supported.
- `Indicator` renders only while its required `when` state matches.
- `Status` renders a polite, atomic `role="status"` live region.

Native props and refs pass through. Consumer Trigger handlers run first;
`preventDefault()` cancels the copy attempt.

## Data Attributes

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | Part-specific default or consumer override |
| `[data-state]` | `idle`, `copying`, `copied`, `error` |
| `[data-disabled]` | Present while disabled |

## Accessibility

- Give Trigger a stable accessible name such as “Copy install command.”
- Put short authored feedback inside Status; Atom supplies no English strings.
- Use Label with Input whenever the editable or read-only value is exposed.
- Keep keyboard focus on Trigger after success or failure.
- Clipboard writes require a secure context and may require user activation or
  browser permission. Preserve the error presentation instead of implying the
  write succeeded.

## Server Rendering

Clipboard is a client primitive because it owns state, event handlers, timers,
and a browser API. Initial markup is deterministic in the idle state; copying
only begins from Trigger activation after hydration.

## Related Components

- `Button` supplies headless activation without clipboard state.
- `Input` supplies general form input behavior.
- Styled libraries may compose Clipboard into a Code Block copy control.
