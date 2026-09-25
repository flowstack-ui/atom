# Switch

Headless boolean switch with a compatible standalone button and additive
compound composition, controller access, native form participation, and
decorative state artwork.

## When to Use

Use `Switch` for a setting that takes effect immediately, such as enabling
notifications. Use `Checkbox` for a choice applied with a later form action,
and use `Toggle` for a pressed command such as bold text.

## Features

For custom IDs that must associate in server-rendered HTML, set
`ids={{ control: "alerts-control", label: "alerts-label", input: "alerts-input" }}`
on Field or RootProvider. Local part `id` overrides are registered after mounting
and keep automatic associations synchronized when changed or removed. Prefer
owner `ids` for SSR; do not depend on descendant registration before hydration.
Explicit Control `aria-labelledby` and Label `htmlFor` remain caller-owned.

- Preserves the standalone `Root` button, boolean callback, ref target, and
  automatic native proxy.
- Adds `Field`, `Control`, `Label`, and explicit `HiddenInput` compound
  anatomy with one checked-state owner.
- Supports controlled, uncontrolled, and external-controller ownership.
- Supports disabled, read-only, required, invalid, native validation, external
  forms, checked-only submission, and form reset.
- Generates stable label, control, and input associations.
- Provides decorative track and thumb indicators with checked/fallback content.
- Supports `asChild`, `render`, composed handlers, and composed refs.

## Import

```tsx
import { Switch, useSwitch } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<>
  <Switch.Root>
    <Switch.Thumb />
  </Switch.Root>

  <Switch.Field>
    <Switch.Label>Setting</Switch.Label>
    <Switch.Control>
      <Switch.Indicator fallback="Off">On</Switch.Indicator>
      <Switch.Thumb>
        <Switch.ThumbIndicator fallback="Off">On</Switch.ThumbIndicator>
      </Switch.Thumb>
    </Switch.Control>
    <Switch.HiddenInput />
  </Switch.Field>

  <Switch.RootProvider value={controller}>
    <Switch.Label>Controlled setting</Switch.Label>
    <Switch.Control />
    <Switch.HiddenInput />
  </Switch.RootProvider>
</>
```

`useSwitch` creates the `controller` supplied to `RootProvider`.

## API Reference

### Root

The compatible standalone owner. It renders a button, targets that button with
its ref, owns boolean checked state, and creates one automatic native checkbox
when `name` or `required` needs form participation. Keep using an explicit
`Thumb`; do not place compound `HiddenInput` under Root.

| Prop | Type | Default |
| --- | --- | --- |
| `checked` | `boolean` | - |
| `defaultChecked` | `boolean` | `false` |
| `onCheckedChange` | `(checked: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `validationBehavior` | `"inline" \| "native"` | Field/Form value or `"native"` |
| `name` | `string` | - |
| `value` | `string` | `"on"` |
| `form` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Root owns `role="switch"`, `aria-checked`, availability and validity ARIA,
and `data-state`, `data-disabled`, `data-readonly`, `data-required`, and
`data-invalid`. Its default `data-slot` is `switch`.

### Field

The noninteractive compound wrapper and single state owner. Its ref targets the
rendered div. Author exactly one Control and one HiddenInput.

| Prop | Type | Default |
| --- | --- | --- |
| `checked` | `boolean` | - |
| `defaultChecked` | `boolean` | `false` |
| `onCheckedChange` | `(checked: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `validationBehavior` | `"inline" \| "native"` | inherited or `"native"` |
| `name` | `string` | - |
| `value` | `string` | `"on"` |
| `form` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Field emits compound state and availability data with default slot
`switch-field`. Development builds warn when Control or HiddenInput is
missing or duplicated; markup is never removed after hydration.
An enclosing independent Field owns inherited invalid state; an invalid
Fieldset does not override that Field's valid state. Without an enclosing
Field, compound Switch inherits Fieldset invalidity.

### Label

Renders a label associated with Control. Its ref targets the label. Clicking its
text activates Control once; interactive descendants such as help links keep
their own action.

| Prop | Type | Default |
| --- | --- | --- |
| `htmlFor` | `string` | Generated Control ID |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Label mirrors state and availability data and defaults to slot `switch-label`.

### Control

Renders the one focusable button switch inside Field or RootProvider. It owns
activation, ARIA state, validation focus, and the target ref. Checked state
belongs to its owner, not to Control.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Control owns `role="switch"`, `aria-checked`, generated label/description
relationships, availability and validity ARIA, and the matching state data.
Its default slot is `switch-control`.
Disabled custom hosts stay unavailable. Set `disabled` on Field or RootProvider
when the whole switch, including its submitted input, should be disabled.

### HiddenInput

Renders the one explicit native checkbox in compound mode. Its ref targets the
input. Native event handlers and refs compose with Atom behavior; Atom keeps
`type`, checked state, name/value/form ownership, disabled/required state,
proxy geometry, and tab exclusion authoritative.

| Prop | Type | Default |
| --- | --- | --- |
| Native input props except owned state/form/geometry props | native | - |

The input uses `type="checkbox"`, `aria-hidden="true"`, `tabIndex={-1}`,
and slot `switch-input`. It submits only while checked and enabled.

### Thumb

Decorative state-aware thumb usable under Root or Control. Its ref targets the
rendered span.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Thumb is always `aria-hidden`, mirrors state data, and defaults to slot
`switch-thumb`.

### Indicator

Decorative track content selected by checked state.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | - |
| `fallback` | `ReactNode` | - |
| `forceMount` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Indicator is `aria-hidden` and defaults to slot `switch-indicator`.

### ThumbIndicator

Decorative checked/fallback content inside Thumb. It has the same props as
Indicator and defaults to slot `switch-thumb-indicator`.

### RootProvider

The compound wrapper for an external controller. It has Field's wrapper, form,
state, validation, and composition props except checked ownership.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `SwitchController` | required |
| `inputValue` | `string` | `"on"` |

`value` is the controller. `inputValue` is the submitted string value.

### useSwitch

Creates a controller with `checked`, `setChecked`, `toggle`, `reset`,
`controlled`, `disabled`, and `readOnly`.

| Option | Type | Default |
| --- | --- | --- |
| `checked` | `boolean` | - |
| `defaultChecked` | `boolean` | `false` |
| `onCheckedChange` | `(checked: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |

### useSwitchContext

Reads the nearest owner state and supported operations: `checked`,
`setChecked`, `toggle`, availability, validity, requirement, and compound
part IDs when present. Reading outside a Switch owner throws.

## Examples

### Compound setting

```tsx
import { Switch } from "@flowstack-ui/atom";

export default function WeeklyReports() {
  return (
    <Switch.Field name="weeklyReports" value="enabled">
      <Switch.Label>Weekly reports</Switch.Label>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.HiddenInput />
    </Switch.Field>
  );
}
```

### Controller and provider

```tsx
import { Switch, useSwitch } from "@flowstack-ui/atom";

export default function ControlledReports() {
  const controller = useSwitch({ defaultChecked: true });
  return (
    <Switch.RootProvider value={controller} name="reports">
      <Switch.Label>Reports</Switch.Label>
      <Switch.Control />
      <Switch.HiddenInput />
    </Switch.RootProvider>
  );
}
```

### Compatible standalone Root

```tsx
import { Switch } from "@flowstack-ui/atom";

export default function LegacyCompatibleSetting() {
  return (
    <Switch.Root name="notifications" aria-label="Notifications">
      <Switch.Thumb />
    </Switch.Root>
  );
}
```

## Accessibility

Switch follows the [WAI-ARIA switch
pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/). Root and Control own
the switch role and boolean checked state. Provide a stable setting name; do not
change it from “Enable” to “Disable” as state changes. Thumb and indicators are
decorative.

| Key | Description |
| --- | --- |
| `Enter` | Toggles checked state. |
| `Space` | Toggles checked state. |

Read-only remains focusable but cannot toggle. Disabled is not focusable and its
native input does not submit. Required native validation redirects focus to the
visible Root or Control. Compound mode has one tab stop and one explicit native
input. Keep actions outside Control; interactive content inside Label remains a
separate action.

## Data Attributes

State-bearing parts expose `data-state="checked|unchecked"` and `data-slot`.
Disabled and read-only states expose `data-disabled` and `data-readonly`.
Preserve the control's native/ARIA state alongside these presentation hooks.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
