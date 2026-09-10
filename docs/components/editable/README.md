# Editable

Headless inline editing with a captured cancellation baseline. Use Input or
Textarea instead when a form field should stay visible permanently.

```tsx
import { Editable } from "@flowstack-ui/atom/editable";

<Editable.Root defaultValue="Project notes">
  <Editable.Label>Document name</Editable.Label>
  <Editable.Area><Editable.Preview /><Editable.Input /></Editable.Area>
  <Editable.Control>
    <Editable.EditTrigger>Edit</Editable.EditTrigger>
    <Editable.SubmitTrigger>Save</Editable.SubmitTrigger>
    <Editable.CancelTrigger>Cancel</Editable.CancelTrigger>
  </Editable.Control>
</Editable.Root>
```

## Accessibility

Use a visible Label or an equivalent accessible input name. Preview retains
keyboard activation; editing focus belongs to the native input or textarea.
Escape cancels editing before an ancestor overlay dismisses. Preserve the
configured submit mode, disabled/readOnly state and post-edit focus target.
Expose authored validation messages through Field, not through visual paint alone.

## Behavior

value/defaultValue and edit/defaultEdit are independent controlled/uncontrolled
axes. onValueChange({value}) reports draft changes. onEditChange({edit}) requests
a mode change; controlled parents must apply it. onValueCommit/onValueRevert
fire when the requested exit is accepted. Cancel restores the value captured
at entry, including empty values and defaultEdit. An external controlled value
is authoritative; cancellation requests the captured baseline, not a mutation
of the parent's data. Persistence and async rejection stay application-owned.

useEditable(options) returns editing, empty, value, valueText, setValue,
clearValue, edit, submit, cancel. Share it with RootProvider value and Context
render props. Do not construct or clone a controller manually.

## Interaction

activationMode: focus (default), click, dblclick, none. Click and dblclick retain
Enter/Space activation. submitMode: both (default), enter, blur, none. Outside
interaction commits only for blur/both; otherwise it cancels. Escape cancels.
Single-line Enter commits; textarea requires Ctrl/Meta+Enter so ordinary Enter
remains a newline. IME composition does not commit.

onFocusOutside, onPointerDownOutside, onInteractOutside receive a cancellable
event with originalEvent, target, defaultPrevented and preventDefault(). Explicit
controls are internal interactions. Explicit completion restores finalFocusEl
or EditTrigger/Preview without reopening on focus. Outside focus is not stolen.

## Anatomy

selectOnFocus defaults true; autoResize false; maxLength optional. placeholder
is a string or {edit,preview}. disabled/readOnly/required/invalid inherit Field
unless explicitly set at Root. name/form go on the actual input. id/ids customize
root, area, label, preview, input, control and three trigger IDs. dir follows
Direction; getRootNode scopes outside listeners for shadow/document ownership.
translations input/edit/submit/cancel customize accessible labels.

Root/RootProvider are divs, Area/Control divs, Label label, Preview span,
Input input, Textarea textarea, and triggers buttons. Triggers support asChild
and render with the shared event/ref composition. Input/textarea keep native
hosts and accept native attributes/ref except controlled value/defaultValue.
Render exactly one Input or Textarea and supply an accessible name. No default
visual styles or application save engine.

## Data Attributes

Data slots use editable-*; root
data-state is editing or preview with disabled/readonly/invalid/autoresize flags.

## Forms and accessibility

One real named native control submits its current draft value. Use the commit
callback for transactional application persistence. Required validation enters
editing before focusing the invalid control. Uncontrolled native reset restores
the original default and ends editing; prevented reset is respected. Controlled
parents own reset policy. Field label, description and invalid state integrate
through the existing Atom mechanisms. Autoresize geometry is functional, not a
visual recipe. Screen-reader, actual zoom and physical-device review are manual.
