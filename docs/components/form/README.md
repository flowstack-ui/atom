# Form

Native form rendering with lightweight submit, reset, validation, and state data
attributes.

## Features

- Renders a native `<form>`.
- Composes native `onSubmit` and `onReset` handlers.
- Supports optional default prevention on submit.
- Supports synchronous or asynchronous submit validation.
- Exposes submitting, submitted, and invalid state through data attributes.
- Does not duplicate Field, schema validation, or message rendering.

## Import

```tsx
import { Form } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Form.Root>
  <button type="submit">Submit</button>
</Form.Root>
```

## API Reference

### Root

Renders the native form element.

| Prop | Type | Default |
| --- | --- | --- |
| `preventDefaultOnSubmit` | `boolean` | `false` |
| `validateOnSubmit` | `(event) => boolean \| Promise<boolean>` | - |
| `onSubmit` | `FormEventHandler<HTMLFormElement>` | - |
| `onReset` | `FormEventHandler<HTMLFormElement>` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"form"` |
| `[data-submitting]` | Present while async submit is pending |
| `[data-submitted]` | Present after successful submit |
| `[data-invalid]` | Present after failed validation |

## Examples

### With Field And Input

```tsx
import { Field, Form, Input } from "@flowstack-ui/atom";

<Form.Root onSubmit={handleSubmit}>
  <Field.Root required invalid={emailInvalid}>
    <Field.Label>Email</Field.Label>
    <Input.Root name="email" type="email" />
    <Field.Description>Use a work email.</Field.Description>
    <Field.Error>Email is required.</Field.Error>
  </Field.Root>

  <button type="submit">Submit</button>
</Form.Root>
```

### Async Validation

```tsx
import { Form } from "@flowstack-ui/atom";

<Form.Root
  validateOnSubmit={async () => {
    return await validateForm();
  }}
  onSubmit={saveForm}
/>
```

## Accessibility

- Uses native form semantics.
- Labels, descriptions, and errors are owned by `Field`, `Fieldset`, and form
  controls.
- Async validation prevents native navigation before validation resolves.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
