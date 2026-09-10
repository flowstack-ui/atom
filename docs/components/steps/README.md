# Steps

Headless ordered workflow progression with optional native step buttons.

## When to Use

Use for checkout or setup with a known number of stages and one current stage.
Use List for static instructions, Tabs for independent panels and Progress for
numeric work completion. Steps does not submit, save or validate business data.

## Features

- Controlled/uncontrolled progression and completion content.
- Synchronous forward validation in linear mode.
- Native ordered list and buttons, direction inheritance and composition.
- Preserved hidden panels by default; deterministic server output.

## Import

```tsx
import { Steps } from "@flowstack-ui/atom";
// Also available from @flowstack-ui/atom/steps.
```

## Anatomy

```tsx
<Steps.Root count={2}>
  <Steps.List>
    <Steps.Item index={0}>
      <Steps.Trigger>
        <Steps.Indicator />
        <Steps.Title />
        <Steps.Description />
      </Steps.Trigger>
      <Steps.Separator />
      <Steps.ItemContext>{state => null}</Steps.ItemContext>
    </Steps.Item>
  </Steps.List>
  <Steps.Content index={0} />
  <Steps.CompletedContent />
  <Steps.PrevTrigger />
  <Steps.NextTrigger />
  <Steps.Context>{state => null}</Steps.Context>
</Steps.Root>
```

## API Reference

All DOM parts forward refs and native props and support `asChild` and `render`.
Default hosts below define ref types; custom render targets must preserve their
semantics. `data-slot` is customizable. No CSS or icon is shipped by Atom.

### Root

Renders div. Native onChange is replaced by onStepChange.

| Prop | Type | Default |
| --- | --- | --- |
| count | number | required |
| step | number | uncontrolled |
| defaultStep | number | 0 |
| onStepChange | (step: number) => void | — |
| onStepComplete | () => void | — |
| linear | boolean | false |
| disabled | boolean | false |
| isStepValid | (index: number) => boolean | all valid |
| onStepInvalid | ({step, targetStep}) => void | — |
| orientation | horizontal \| vertical | horizontal |
| dir | ltr \| rtl | Direction provider |
| asChild | boolean | false |
| render | RenderProp | div |

Count is a nonnegative finite integer (fractions floor; nonfinite becomes zero).
Step clamps to 0..count. `step=count` is positional completion. Zero count starts
complete without firing a callback. Completion callback fires on an observed
transition into completion, not initial mount or an unaccepted controlled request.
No-op navigation emits nothing. Disabled blocks all internal requests.

Linear mode checks every crossed index before forward navigation; first failure
reports onStepInvalid without changing state. Back/reset do not validate.
External controlled updates bypass guards. Async validation, skipped/optional
stages and branching require controlled application policy.

| Data attribute | Values |
| --- | --- |
| [data-slot] | steps-root |
| [data-state] | active, complete |
| [data-orientation] | horizontal, vertical |
| [data-disabled] | present when disabled |

### List

Renders ol; provide an accessible name when useful. Contains direct Item children.
Native ol props, asChild and render are supported. Emits `[data-slot]=steps-list`
and `[data-orientation]`. No tablist role or arrow-key behavior is added.

### Item

Renders li. Required `index:number` must be unique, zero-based and within count.
Native li props, asChild and render pass through. Emits `aria-current=step` when
current; `[data-slot]=steps-item`, `[data-index]`, `[data-orientation]`,
`[data-state]=current|complete|incomplete` and the corresponding presence attribute
`[data-current]`, `[data-complete]` or `[data-incomplete]`.

### Trigger

Optional button to request this item's index. Native disabled combines with Root
disabled; native onClick runs first and preventDefault cancels navigation. It is
always type=button. Compose only onto another button. Native button props, asChild
and render pass through. Emits `[data-slot]=steps-trigger`, item state attributes
and `[data-disabled]`. No nested controls are allowed; give icon-only buttons a name.

### Indicator

Decorative span, `aria-hidden=true`. Defaults to index+1, not an icon. Children can
replace the ordinal (including localized formatting in a styled layer). Native
span props, asChild and render pass through. Emits `[data-slot]=steps-indicator`
and item state attributes.

### Title

Span that owns the generated title ID used by Content. Native span props, asChild
and render pass through, except id is owned for relationships. Emits
`[data-slot]=steps-title` and item state attributes. Choose headings only when
the host document outline calls for them; never nest a heading inside a button.

### Description

Passive span for supporting instructions. Native span props, asChild and render
pass through. Emits `[data-slot]=steps-description` and item state attributes.

### Separator

Decorative span, aria-hidden=true; last item separator is hidden. Native span props,
asChild and render pass through. Emits `[data-slot]=steps-separator`,
`[data-orientation]` and item state attributes. Styled layers own its geometry.

### ItemContext

No DOM. Required children callback receives index/current/completed/incomplete.
Use for custom indicators or application-localized state descriptions.

### Content

Div with required index and `keepMounted=true`. Inactive content is hidden; false
unmounts it and discards child state. role=group, generated id and aria-labelledby
pointing at the item's Title; provide aria-label or aria-labelledby for an explicit
name. tabIndex defaults -1. Native div props, asChild and render pass through.
Emits `[data-slot]=steps-content`, `[data-state]=active|inactive` and
`[data-steps-panel]`. Root recovers focus from hidden mounted content into the new
panel only when the previous focus was inside the root. Keep navigation outside
panels; applications own custom/unmounted or asynchronous focus handoff.

### CompletedContent

Div active only at step=count. keepMounted defaults true. Native div props,
asChild and render pass through; tabIndex defaults -1. Author the visible completion
message and optional accessible name. No automatic live announcement. Emits
`[data-slot]=steps-completed-content`, `[data-state]`, `[data-steps-panel]` and hidden.

### PrevTrigger

Button requesting step-1. Disabled at zero or Root disabled; consumer disabled is
also respected. Native button props, asChild and render pass through, type=button
is owned. onClick preventDefault cancels navigation. Emits
`[data-slot]=steps-prev-trigger` and `[data-disabled]`. Supply visible text.

### NextTrigger

Button requesting step+1, including completion from the last stage. Same composition
and event rules as PrevTrigger; disabled at count. Emits
`[data-slot]=steps-next-trigger` and `[data-disabled]`. Supply visible text.

### Context

No DOM. Required children callback receives step, count, isCompleted, hasNextStep,
hasPrevStep, disabled, orientation, dir, idPrefix and setStep/nextStep/prevStep/resetStep.
The public useStepsContext/useStepsItemContext hooks expose the same values within
their respective providers. Do not use idPrefix to infer application identity.

## Examples

```tsx
import { Steps } from "@flowstack-ui/atom";
export function Setup() {
  return <Steps.Root count={2}>
    <Steps.List aria-label="Setup progress">
      <Steps.Item index={0}><Steps.Trigger><Steps.Indicator /><Steps.Title>Account</Steps.Title></Steps.Trigger><Steps.Separator /></Steps.Item>
      <Steps.Item index={1}><Steps.Trigger><Steps.Indicator /><Steps.Title>Review</Steps.Title></Steps.Trigger><Steps.Separator /></Steps.Item>
    </Steps.List>
    <Steps.Content index={0}><label>Name<input name="name" /></label></Steps.Content>
    <Steps.Content index={1}>Review your details before submitting.</Steps.Content>
    <Steps.CompletedContent>All stages visited.</Steps.CompletedContent>
    <Steps.PrevTrigger>Previous</Steps.PrevTrigger><Steps.NextTrigger>Next</Steps.NextTrigger>
  </Steps.Root>;
}
```

## Accessibility

Uses the native ordered-list approach described in
[WAI multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/), not a
tab composite. Current has aria-current=step. Add localized completed-state text
through ItemContext when that information is necessary beyond visual styling.

| Key | Description |
| --- | --- |
| Tab / Shift+Tab | Native order through enabled buttons and active panel controls. |
| Enter / Space | Native button activation. |

Arrows are not intercepted. Names, instructions, form errors, saved data and async
focus are application-owned. Hidden panels are excluded from keyboard navigation.

## Changelog

[Changelog](./CHANGELOG.md)
