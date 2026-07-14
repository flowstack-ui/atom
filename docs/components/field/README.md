# Field

Headless single-control field wiring for labels, descriptions, errors, and
shared form-control state.

## When to Use

Use Field when one control needs a label and may also need help text, an error,
or shared required/disabled state. Use Fieldset when several related controls
need one group label, such as radio choices. Use standalone Label when no shared
state or description/error wiring is needed.

## Features

- Generates stable control, label, description, and error IDs.
- Shares disabled, required, read-only, and invalid state with Field-aware controls.
- Registers mounted Description and visible Error IDs for `aria-describedby`.
- Supports built-in or separately composed required/optional indicators.
- Exposes layout orientation as metadata without applying layout.
- Supports custom parts through public context hooks.

## Import

```tsx
import { Field } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Field.Root>
  <Field.Label />
  <Field.Description />
  <Field.Error />
  <Field.RequiredIndicator />
</Field.Root>

useFieldContext()
useRequiredFieldContext()
```

## API Reference

### Root

Renders a `div` by default and provides generated relationships and shared
state. It does not render the actual form control.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Supplying `id` creates `${id}-control`, `${id}-label`, `${id}-description`,
and `${id}-error`; otherwise the base ID is generated.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"field"` |
| `[data-orientation]` | `"vertical" \| "horizontal"` |
| `[data-disabled]` | Present when disabled |
| `[data-required]` | Present when required |
| `[data-readonly]` | Present when read only |
| `[data-invalid]` | Present when invalid |

### Label

Renders a native `label` whose `htmlFor` targets the generated control ID.
State props can override Field state for this Label's metadata only.

| Prop | Type | Default |
| --- | --- | --- |
| `required` | `boolean` | Field state |
| `disabled` | `boolean` | Field state |
| `invalid` | `boolean` | Field state |
| `readOnly` | `boolean` | Field state |
| `requiredIndicator` | `ReactNode` | `" *"` |
| `optionalIndicator` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Plain-text required indicators are wrapped with `aria-hidden`. Plain optional
indicators remain available to assistive technology. A React element is used
as provided.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"field-label"` |
| `[data-disabled]` | Present when resolved disabled |
| `[data-required]` | Present when resolved required |
| `[data-readonly]` | Present when resolved read only |
| `[data-invalid]` | Present when resolved invalid |

### Description

Renders a `p` and registers its generated ID while mounted so Field-aware
controls can include it in `aria-describedby`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"field-description"` |

### Error

Renders a live alert only when Field is invalid and `match` is not false, or
when `forceMatch` is true. A visible Error registers for `aria-describedby`.

| Prop | Type | Default |
| --- | --- | --- |
| `match` | `boolean` | - |
| `forceMatch` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"alert"` while rendered |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"field-error"` |

### RequiredIndicator

Renders `children` for a required Field or `fallback` otherwise. Use it when
the indicator should be a separate part; set Label's `requiredIndicator={null}`
to avoid showing two required markers.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | `" *"` |
| `fallback` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-hidden` | `"true"` for required content |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"field-required-indicator" \| "field-optional-indicator"` |

### useFieldContext

Returns Field state and generated relationships, or `null` outside Root.

### useRequiredFieldContext

Returns the same context but throws when used outside Root. Use it for a custom
part that cannot function without Field.

## Examples

### Email With Help and Error

```tsx
import { useState } from "react";
import { Field, Input } from "@flowstack-ui/atom";

export function EmailField() {
  const [email, setEmail] = useState("");
  const invalid = email.length > 0 && !email.includes("@");

  return (
    <Field.Root id="email" required invalid={invalid}>
      <Field.Label>Email</Field.Label>
      <Input.Root name="email" value={email} onValueChange={setEmail} />
      <Field.Description>Use an address you check regularly.</Field.Description>
      <Field.Error>Enter a valid email address.</Field.Error>
    </Field.Root>
  );
}
```

### Explicit Optional Indicator

```tsx
import { Field, Input } from "@flowstack-ui/atom";

export function NicknameField() {
  return (
    <Field.Root id="nickname">
      <Field.Label requiredIndicator={null}>
        Nickname <Field.RequiredIndicator fallback="(optional)" />
      </Field.Label>
      <Input.Root name="nickname" />
    </Field.Root>
  );
}
```

## Accessibility

Field follows native form labeling and the
[WAI forms labeling guidance](https://www.w3.org/WAI/tutorials/forms/labels/).
Field-aware controls use Label's ID relationship and include mounted
Description and visible Error IDs in `aria-describedby`. Error uses
`role="alert"`; do not use invalid state before there is a useful message for
the user. Field owns no keyboard behavior.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
