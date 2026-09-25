# Input Changelog

## Unreleased

- No unreleased changes.

## 0.27.0

- Preserve native uncontrolled value ownership for ref-based registration and formatting integrations; mirror compound state without overwriting the DOM. Respect cancelled form resets.

## 0.6.16

- Explicitly scrolled inline validation-directed focus into view.

## 0.6.15

- Exposed inline validation-directed focus through `[data-focus-visible]`
  until blur.

## 0.6.13

- Mirrored attempted native validity to Input, Field, and Form under the new
  inline/native validation presentation contract.

## 0.5.0

- Synchronized uncontrolled Field-aware values with native form reset.

## 0.2.0

- Added `data-required` to `Input.Root` when required state is inherited from
  Field context or provided directly.

## 0.1.0

- Initial Atom release.
