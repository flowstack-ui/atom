# Form

Native form primitive with lightweight submit validation and observable submit
state.

## When to Use

Use Form when you want native form submission plus Atom-owned submitting,
submitted, and validation state. A plain `form` is enough when those states are
not needed. Form does not provide a schema, field messages, or server
validation; combine it with Field and your application validation.

React function actions keep React's native action contract. Read their pending
state with `useFormStatus`; Atom's `data-submitting` describes only the optional
Atom callback/validation path. Rejected callbacks remain observable and are
rethrown after Atom clears its callback submission state.

## Features

- Renders a native `form` and preserves native attributes.
- Supports synchronous or asynchronous pre-submit validation.
- Optionally prevents the browser's default submit navigation.
- Tracks submitting, submitted, and failed-validation state.
- Resets Atom state after an uncancelled native reset.
- Lets descendant uncontrolled Atom controls restore their defaults through the
  same native reset event.
- Exposes state through `useFormContext` and data attributes.

## Import

```tsx
import { Form } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Form.Root />

useFormContext()
```

## API Reference

### Root

Renders the native form, runs optional validation before `onSubmit`, and
provides submission state to descendants.

| Prop | Type | Default |
| --- | --- | --- |
| `onSubmit` | `(event) => void \| Promise<void>` | - |
| `onReset` | `(event) => void` | - |
| `preventDefaultOnSubmit` | `boolean` | `false` |
| `validateOnSubmit` | `(event) => boolean \| Promise<boolean>` | - |
| `validationBehavior` | `"inline" \| "native"` | Automatic |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Async validation always prevents default navigation so validation can finish.
A synchronous `false` result also prevents submission and marks the Form
invalid. For an async `onSubmit` without async validation, set
`preventDefaultOnSubmit` when browser navigation is not wanted. Rejected submit
handlers leave submitted state false and rethrow the error so the application
or framework can observe it.

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"form"` |
| `[data-submitting]` | Present while validation or async submission is pending |
| `[data-submitted]` | Present after the handler completes successfully |
| `[data-invalid]` | Present after callback validation fails or a descendant reports invalid |

### useFormContext

Returns submission state, derived invalid state, inherited validation behavior,
and the validity reporter used by custom Atom-aware controls. It must be called
below Root.

## Examples

### Native Submission State

```tsx
import type { FormEvent } from "react";
import { Form, useFormContext } from "@flowstack-ui/atom";

function SubmitButton() {
  const { submitting } = useFormContext();
  return <button type="submit" disabled={submitting}>Save profile</button>;
}

export function ProfileForm() {
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    await fetch("/api/profile", { method: "POST", body: data });
  }

  return (
    <Form.Root preventDefaultOnSubmit onSubmit={saveProfile}>
      <label>
        Display name
        <input name="displayName" required />
      </label>
      <SubmitButton />
    </Form.Root>
  );
}
```

### Async Validation

```tsx
import type { FormEvent } from "react";
import { Form } from "@flowstack-ui/atom";

export function InvitationForm() {
  async function emailIsAvailable(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const response = await fetch(`/api/email/${String(data.get("email"))}`);
    return response.ok;
  }

  return (
    <Form.Root validateOnSubmit={emailIsAvailable} onSubmit={() => console.log("Valid")}>
      <label>Email <input name="email" type="email" required /></label>
      <button type="submit">Invite</button>
      <button type="reset">Reset</button>
    </Form.Root>
  );
}
```

## Accessibility

`validationBehavior="inline"` keeps HTML constraints and invalid submission
blocking active while suppressing the browser validation bubble. Descendant
Atom controls expose the failure through `aria-invalid` and `data-invalid`.
`"native"` keeps the browser bubble. An explicit control value overrides Field,
Fieldset, and Form inheritance.

Form preserves native form semantics and owns no special keyboard model.
Consumers must label controls, provide error content, and announce asynchronous
results. Inline constraint validation moves focus to the first invalid visible
control, explicitly scrolls it into view, and marks it with
`[data-focus-visible]` until focus leaves, so styled layers can render the same
focus indicator after pointer and keyboard submission. Use Field and Fieldset
for accessible names, descriptions, and visible validation messages.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
