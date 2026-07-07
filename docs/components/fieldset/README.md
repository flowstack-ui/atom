# Fieldset

Native fieldset grouping for related controls, shared state, descriptions, and
errors.

## Features

- Renders native `<fieldset>` and `<legend>` semantics.
- Shares disabled, required, and invalid state across grouped controls.
- Wires description and visible error content with `aria-describedby`.
- Supports required and optional legend indicators.
- Keeps visual layout outside Atom.

## Import

```tsx
import { Fieldset } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
export default () => (
  <Fieldset.Root>
    <Fieldset.Legend />
    <Fieldset.Description />
    <Fieldset.Error />
  </Fieldset.Root>
);
```

## API Reference

### Root

Renders a native fieldset and provides group context.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"fieldset"` |
| `[data-disabled]` | Present when disabled |
| `[data-required]` | Present when required |
| `[data-invalid]` | Present when invalid |

Required state is exposed through Fieldset context and `[data-required]`.
`Fieldset.Root` does not emit `aria-required` because native fieldset/group
semantics do not support that ARIA state.

### Legend

Renders a native legend for the grouped controls.

| Prop | Type | Default |
| --- | --- | --- |
| `requiredIndicator` | `ReactNode` | `"*"` |
| `optionalIndicator` | `ReactNode` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"fieldset-legend"` |
| `[data-disabled]` | Present when disabled |
| `[data-required]` | Present when required |

### Description

Registers descriptive content for the fieldset.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"fieldset-description"` |

### Error

Registers visible error content for the fieldset.

| Prop | Type | Default |
| --- | --- | --- |
| `forceMatch` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"fieldset-error"` |

## Examples

### With RadioGroup

```tsx
import { Fieldset, RadioGroup } from "@flowstack-ui/atom";

export default () => (
  <Fieldset.Root required invalid={invalidShipping}>
    <Fieldset.Legend>Shipping method</Fieldset.Legend>
    <RadioGroup.Root name="shipping">
      <RadioGroup.Radio value="standard">Standard</RadioGroup.Radio>
      <RadioGroup.Radio value="express">Express</RadioGroup.Radio>
    </RadioGroup.Root>
    <Fieldset.Error>Choose a shipping method.</Fieldset.Error>
  </Fieldset.Root>
);
```

## Accessibility

- Use `Fieldset.Legend` to name the group.
- Use visible legend text or child controls to communicate required state;
  `Fieldset.Root` exposes `[data-required]` for styling but not
  `aria-required`.
- `Fieldset.Root` references mounted description and visible error content with
  `aria-describedby`.
- Native `disabled` on the fieldset is inherited by descendant form controls.
- `Fieldset.Error` uses `role="alert"` when rendered.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
