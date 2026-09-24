# RadioCard

Native rich radio options sharing RadioGroup's single-selection behavior.

Import `RadioCard` and `useRadioCard` from `@flowstack-ui/atom/radio-card`.

## Anatomy

Compose Root, optional Label, and uniquely valued Items. Each Item is a label
and requires exactly one HiddenInput. Compose Control, Title, Description and
Indicator inside it. All supporting content must be noninteractive.

## API Reference

Root accepts RadioGroup's controlled/uncontrolled, form, validation, disabled,
readOnly, orientation, direction and loop props. HiddenInput receives input
events and ARIA overrides; Root name/form and Item value remain authoritative.
Root ref is a div, Item ref a label and HiddenInput ref a native input.

RootProvider accepts the controller returned by useRadioCard. Controlled owners
handle reset explicitly. Context exposes group state; ItemContext exposes checked,
disabled, readOnly, invalid and focus state. Title and Description automatically
provide input relationships. A supplied input aria-label overrides Title.

## Accessibility

Do not put links, buttons or other inputs inside an Item. A record with actions
needs separate radio and content composition. Do not replace native activation
with card click handlers. Existing RadioGroup button composition is unchanged.

## Data Attributes

Parts expose `data-slot`; item state includes `data-state="checked|unchecked"`,
`data-disabled`, `data-readonly`, and `data-invalid`. The hidden native input
exposes `data-value`. Preserve native radio semantics and the group relationship;
these styling hooks are not independent state owners.
