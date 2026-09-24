# Field Changelog

## Unreleased

- No unreleased changes.

## 0.27.0

- Root accepts ids.control, ids.label, ids.description and ids.error. Use ids.control when supplying an authored control ID, or match Label.htmlFor explicitly. For a compound entry, place each control in Field.Item with a unique value and set Root.target to the label's intended item. Give secondary controls accessible names. Context and useFieldContext expose the resolved state and relationships. Fieldset aggregate errors do not mark each independent Field invalid.

## 0.19.0

- Inherited containing Fieldset state and validation behavior and routed Field
  validity through Fieldset before Form.

## 0.6.13

- Added validation behavior inheritance, native-invalid aggregation, automatic
  Error presentation, and visible-control focus support.

## 0.5.2

- Added `markFieldPart` for styled Description and Error wrappers that must
  remain statically discoverable during server rendering.

## 0.5.1

- Made Root `asChild` inspect the composed wrapper's immediate children so
  Description and visible Error relationships remain present in server markup.

## 0.5.0

- Added server-stable Description/Error relationships with hydration-safe
  registration and removed the forced alert role from Error.
- Completed Field state, generated ID, and description integration across the
  supported single-value form controls.
## 0.1.0

- Initial Atom release.
