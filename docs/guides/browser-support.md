# Browser support

Atom declares the pinned Browserslist query `baseline 2023 with downstream`.
Its published JavaScript is compiled to ES2020 syntax, which remains within
that floor.

Portable primitive behavior is release-qualified in current Chromium,
Firefox, and Playwright WebKit. Mobile emulation supplements that evidence but
does not prove physical iOS Safari or Android Chrome. Browser chrome, virtual
keyboards, touch, permissions, assistive technology, and other operating-system
integrations are claimed only when the relevant component records separate
device evidence.

Consumers may target a broader audience only after verifying that their own
transpilation, polyfills, fallbacks, application code, and complete journeys
support it. Atom's package floor is not an application-wide compatibility
guarantee.
