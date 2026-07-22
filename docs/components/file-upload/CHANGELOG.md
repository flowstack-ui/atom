# FileUpload Changelog

## 0.6.16

- Explicitly scrolled inline validation-directed focus into view.

## 0.6.15

- Exposed inline validation-directed focus through `[data-focus-visible]`
  until blur.

## 0.6.13

- Mirrored HiddenInput constraints to the visible upload surface, Field, and
  Form under the shared inline/native validation contract.

## 0.6.12

- Aligned the native file input with Trigger for required feedback and
  synchronized accepted files after picker and drag/drop updates.

## 0.5.0

- Synchronized uncontrolled files, rejection state, and the native picker with
  native form reset while preserving Field state and relationships.

## 0.2.0

- Fixed read-only Trigger, Dropzone, and ItemDeleteTrigger parts so they expose
  `data-readonly` instead of only reporting disabled state.

## 0.1.0

- Initial Atom release.
