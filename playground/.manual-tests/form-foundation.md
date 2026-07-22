# Form Foundation Manual Test Protocol (Draft)

Status: draft — do not promote until owner testing and workbook review pass.

Use the Form, Field, Fieldset, Checkbox, CheckboxGroup, RadioGroup, Switch,
Input, Textarea, NumberInput, Slider, Rating, Combobox, Select, OTPField, and
FileUpload playground pages. Inspect the live DOM when a step names an ARIA or
native form attribute.

## 1. Field relationships

1. Open Field with the Atom control, Description visible, and Invalid off.
2. Confirm the control is named by the label and `aria-describedby` contains
   only the Description ID.
3. Turn Invalid on. Confirm the Error ID is added exactly once and the error
   has no implicit `role="alert"`.
4. Turn Invalid off. Confirm the Error ID is removed without removing the
   Description ID.
5. Repeat after a page reload and confirm no hydration warning appears.

## 2. Fieldset relationships

1. Open Fieldset with Atom RadioGroup controls.
2. Confirm the group inherits its accessible name from the Legend and its
   description from Fieldset.Description.
3. Toggle disabled, required, and invalid independently. Confirm the group and
   radios expose matching state and blocked interaction where applicable.
4. Show and hide the error. Confirm its ID enters and leaves the group's
   description without an implicit live-region role.

## 3. Native ARIA API

1. Open CheckboxGroup, RadioGroup, Switch, NumberInput, Slider, Select, and
   OTPField in turn.
2. Confirm Source uses native `aria-label`/`aria-describedby` and never
   `ariaLabel`/`ariaDescribedBy` for these controls.
3. Where a native label is enabled, confirm Inspector shows it on the semantic
   control or group.

## 4. Submission and validity

1. In Form Foundation with Validation presentation set to Automatic, uncheck
   the required Checkbox and clear the required CheckboxGroup, then submit.
   Confirm no browser validation bubble appears, each authored Error appears,
   Form/Field/Fieldset/visible controls expose invalid state, and focus lands
   on the first invalid visible control rather than a transparent proxy.
2. Correct only the Checkbox. Confirm its Field and visible checkbox clear
   invalid state while the CheckboxGroup, Fieldset, and Form remain invalid.
   Select one group item and confirm the remaining invalid state clears.
3. For Checkbox and Switch, confirm an unchecked control is absent from
   FormData and a checked control submits its configured value.
4. For CheckboxGroup, confirm every selected item submits under the group name
   and the required failure remains one group-level error rather than an error
   that requires the first option specifically.
5. For RadioGroup, enable required and confirm no selection is invalid; choose
   one radio and confirm one value submits.
6. For Select and OTPField, enable required and confirm the native associated
   control reports missing value until a value is supplied.
7. Repeat an available form-owner case with the control outside the form and
   confirm `form="…"` associates submission and validity with that form.

## 5. Validation presentation overrides

1. Repeat the missing required Checkbox in Form Foundation with presentation
   set to Native. Confirm the browser owns its validation indication and Atom
   still mirrors invalid state to the visible control, Field, Error, and Form.
2. Set presentation to Inline. Confirm the browser indication is suppressed
   while native submission blocking remains active.
3. Inspect Source and verify Automatic omits `validationBehavior`, while the
   other choices pass only `"inline"` or `"native"` to Form.

## 6. Native reset

1. In each uncontrolled control scenario, change the initial value or checked
   state, then activate the owning form's Reset button.
2. Confirm Checkbox, CheckboxGroup, RadioGroup, Switch, NumberInput, Slider,
   Rating, Combobox, Select, OTPField, Input, Textarea, and FileUpload restore
   their defaults and clear transient open/drag/rejection state where relevant.
3. Repeat a controlled scenario and confirm reset does not overwrite the
   consumer-controlled value.

## 7. Form behavior

1. In Form, verify passing, failing, and async Atom callback validation.
2. Confirm reset clears `data-submitting`, `data-submitted`, and `data-invalid`.
3. In React 19 consumer verification, submit a function action and confirm
   React's `useFormStatus` owns pending state.
4. Force an Atom async submit callback rejection and confirm the rejection is
   observable while pending state still settles.

## 8. Regression sweep

1. Check keyboard focus, Space/Enter selection, and Tab order for every custom
   control touched above.
2. Repeat the essential Field, Fieldset, required-validity, and reset paths on
   a phone or tablet using the LAN playground URL.
3. Confirm no console errors, hydration warnings, duplicate IDs, or stale ARIA
   references remain.
