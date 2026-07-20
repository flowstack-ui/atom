# Fieldset

Native field group primitives for a shared legend, description, error, and
disabled/required/invalid state.

## When to Use

Use Fieldset when several controls answer one question, such as a set of radio
buttons or related checkboxes. Use Field when a label and messages belong to
one control. A Fieldset should have a Legend so users understand what the whole
group represents.

## Features

- Renders native `fieldset` and `legend` elements.
- Applies native fieldset disabled behavior to descendant form controls.
- Registers Description and visible Error for `aria-describedby`.
- Exposes required and invalid group state without invalid `aria-required` usage.
- Supports required and optional legend indicators.
- Exposes public optional and required context hooks.

## Import

```tsx
import { Fieldset } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Fieldset.Root>
  <Fieldset.Legend />
  <Fieldset.Description />
  <Fieldset.Error />
</Fieldset.Root>

useFieldsetContext()
useRequiredFieldsetContext()
```

## API Reference

### Root

Renders a native `fieldset`, owns shared state, and emits server-stable
relationships to its Description and currently visible Error.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-describedby` | Description and visible Error IDs unless explicitly provided |
| `aria-invalid` | `"true"` when invalid |

Root does not emit `aria-required`; required group state must be communicated
through Legend text and the descendant controls where appropriate.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"fieldset"` |
| `[data-disabled]` | Present when disabled |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

### Legend

Renders the native `legend` that names the fieldset and receives the stable ID
used by nested CheckboxGroup or RadioGroup widgets.

| Prop | Type | Default |
| --- | --- | --- |
| `requiredIndicator` | `ReactNode` | `" *"` |
| `optionalIndicator` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Plain required indicators are hidden from assistive technology; plain optional
indicators remain readable.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"fieldset-legend"` |
| `[data-disabled]` | Present when Root is disabled |
| `[data-required]` | Present when Root is required |
| `[data-slot="fieldset-required-indicator"]` | Plain required indicator wrapper |
| `[data-slot="fieldset-optional-indicator"]` | Plain optional indicator wrapper |

### Description

Renders a `p` with a server-stable generated ID for Root's description.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"fieldset-description"` |

### Error

Renders only when Root is invalid or `forceMatch` is true and participates in
Root's accessible description. It has no live role by default; pass native
`role="alert"` or `aria-live` for a newly inserted announcement.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMatch` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"fieldset-error"` |

### useFieldsetContext

Returns group state and generated relationships, or `null` outside Root.

### useRequiredFieldsetContext

Returns the same context but throws outside Root. Use it for custom parts that
require a Fieldset parent.

## Examples

### Shipping Method

```tsx
import { useState } from "react";
import { Fieldset, RadioGroup } from "@flowstack-ui/atom";

export function ShippingMethod() {
  const [method, setMethod] = useState("");
  const invalid = method === "";

  return (
    <Fieldset.Root id="shipping" required invalid={invalid}>
      <Fieldset.Legend>Shipping method</Fieldset.Legend>
      <Fieldset.Description>Choose how quickly the order should arrive.</Fieldset.Description>
      <RadioGroup.Root value={method} onValueChange={setMethod}>
        <RadioGroup.Radio value="standard">Standard</RadioGroup.Radio>
        <RadioGroup.Radio value="express">Express</RadioGroup.Radio>
      </RadioGroup.Root>
      <Fieldset.Error>Choose a shipping method.</Fieldset.Error>
    </Fieldset.Root>
  );
}
```

## Accessibility

Fieldset follows native
[WAI grouped-control guidance](https://www.w3.org/WAI/tutorials/forms/grouping/).
Legend supplies the group name, native `disabled` disables descendant controls,
and Root references its supporting messages. Required state is not valid on a
fieldset through `aria-required`, so communicate it in the Legend and apply
required semantics to the actual controls. Fieldset owns no keyboard behavior.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
