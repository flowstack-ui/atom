# Field Changelog

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
