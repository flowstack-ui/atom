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
- Preserves server relationships when Root composes one wrapper with
  `asChild`.

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
markFieldPart()
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
| `validationBehavior` | `"inline" \| "native"` | Form value, then automatic |
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

Renders a `p` with a generated ID. Statically visible parts are included in
server markup; committed registration keeps conditional client parts current.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"field-description"` |

### Error

Renders only when Field is invalid and `match` is not false, or when
`forceMatch` is true. A visible Error participates in `aria-describedby`.
Error does not announce by default; pass native `role="alert"` or `aria-live`
when a newly inserted message should be announced.

| Prop | Type | Default |
| --- | --- | --- |
| `match` | `boolean` | - |
| `forceMatch` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

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

### markFieldPart

Marks a styled public wrapper around `Field.Description` or `Field.Error` so
Root can include that wrapper in deterministic server-rendered relationships.
Call it once at module scope after creating the wrapper. The wrapper must
render the matching Atom part and forward its props and ref.

```tsx
const StyledDescription = markFieldPart(
  forwardRef<HTMLParagraphElement, FieldDescriptionProps>((props, ref) => (
    <Field.Description {...props} className="description" ref={ref} />
  )),
  "description",
);
```

Calling it again with the same kind is safe. Marking one component as two
different semantic kinds throws so server inspection cannot silently use the
wrong relationship.

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

### Composed Root

`asChild` composes Root state and props onto one wrapper. Put Label, the
Field-aware control, Description, and Error directly inside that wrapper so
their generated relationships are present in server markup.

```tsx
<Field.Root asChild id="email">
  <section>
    <Field.Label>Email</Field.Label>
    <Input.Root name="email" />
    <Field.Description>Use a work address.</Field.Description>
  </section>
</Field.Root>
```

## Accessibility

A native validation attempt from a Field-aware control marks Root and the
visible control invalid. A compatible Error part makes omitted behavior resolve
to `inline`; otherwise it resolves to `native`. Inline behavior reveals Error,
suppresses only the browser bubble, and focuses the first invalid visible
control. Correcting the value or resetting the form clears native-derived state
without clearing an explicit `invalid` source.

Field follows native form labeling and the
[WAI forms labeling guidance](https://www.w3.org/WAI/tutorials/forms/labels/).
Field-aware controls use Label's ID relationship and include mounted
Description and visible Error IDs in `aria-describedby`. Error uses
an explicit live-region role; do not use invalid state before there is a useful message for
the user. Field owns no keyboard behavior.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
