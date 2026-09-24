# NumberInput Changelog

## Unreleased

- Expose Scrubber active drag state and clean interrupted pointer sessions without leaving capture active.

- Add opt-in localized string editing, controller/provider composition, Label,
  ValueText, Context and Scrubber parts, modifier stepping, optional wheel
  stepping, press-and-hold, and commit/focus/range callbacks.
- Preserve hidden numeric submission with root composition and fractional
  display when stepping by smaller increments.

## 0.24.0

- Added public Agent Knowledge for component selection, required composition,
  recurring mistakes, and validation.

## 0.19.0

- Added compound Input, Increment, and Decrement parts while preserving the
  no-children and render-callback Root APIs.

## 0.6.16

- Explicitly scrolled inline validation-directed focus into view.

## 0.6.15

- Exposed inline validation-directed focus through `[data-focus-visible]`
  until blur.

## 0.6.13

- Added inline/native validation presentation and native numeric-invalid
  reporting to the visible spinbutton, Field, and Form.

## 0.5.0

- Added complete Field integration, native ARIA prop names, external-form
  validity association, and uncontrolled reset behavior.
## 0.1.0

- Initial Atom release with spinbutton semantics, keyboard stepping, formatting, parsing, and hidden form input.
