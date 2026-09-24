# ActionBar Changelog

## Unreleased

- Add an external useActionBar controller and controller-backed RootProvider,
  retaining legacy provider props; support Positioner host composition.
- Forward detached root outside-focus callbacks, honor deferred presence and
  construct focus notifications in their owning document.

- Add a headless Positioner host so fixed wrappers share Content's overlay order.

- Add detached contextual action anatomy, state, dismissal and mount policy.
- Reuse existing overlay focus/isolation mechanics without anchor coordinates.
