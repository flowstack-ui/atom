# Rating Changelog

## 0.6.15

- Exposed inline validation-directed focus through `[data-focus-visible]`
  until blur.

## 0.6.13

- Mirrored aligned required validity to Rating, Field, and Form under the
  shared inline/native validation contract.

## 0.6.12

- Added aligned native required validation that treats the minimum rating as
  empty and redirects browser focus to Root.

## 0.5.0

- Added Field state, generated ID, label, and description integration plus
  uncontrolled form reset behavior.

## 0.2.0

- Added direction-aware Rating pointer and keyboard behavior for RTL contexts.
- Improved fractional Rating pointer selection so pointer down can select half-step values directly.
- Reduced `Rating.Item` callback churn by destructuring context dependencies while preserving pointer and clear behavior.

## 0.1.0

- Initial Atom release.
