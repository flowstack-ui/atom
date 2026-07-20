# Fieldset Changelog

## 0.5.2

- Added `markFieldsetPart` for styled Legend, Description, and Error wrappers
  that must remain statically discoverable during server rendering.

## 0.5.1

- Made Root `asChild` inspect the composed fieldset's immediate children so
  Legend, Description, and visible Error relationships remain present in
  server markup.

## 0.5.0

- Added a stable Legend ID plus server-stable Description/Error relationships.
- Added native naming and state integration for CheckboxGroup and RadioGroup,
  and removed the forced alert role from Error.

## 0.2.0

- Removed invalid `aria-required` output from `Fieldset.Root`; required state
  remains available through Fieldset context and `[data-required]`.

## 0.1.0

- Initial Atom release.
