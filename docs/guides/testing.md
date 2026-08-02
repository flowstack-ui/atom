# Testing

Atom uses three verification tiers:

- `npm run check:focused -- <subpath>` runs the component-owned primitive test
  and its explicit browser mapping when one exists;
- `npm run check:repository` validates the repository contract, builds Atom,
  and runs the complete package suite;
- `npm run check:release` adds the complete desktop/mobile browser matrix, the
  packed archive, and clean React 18 and React 19 consumers.

Use focused checks during implementation and the repository tier when a batch
is ready to merge. Changes to shared exports, utilities, package/build
configuration, browser infrastructure, or an unmapped interaction seam require
the broader repository or release tier.

## Browser lifecycle

The playground uses development port `3000` and automated-test port `4000`.
`npm run test:browser` builds the playground, confirms port `4000` is free,
starts its own preview, runs Playwright, and stops the preview on exit. It does
not reuse an existing listener. `npm run test:processes` is the read-only port
preflight.

Installed Playwright browser binaries may remain cached. Preview servers,
browser processes, workers, and one-shot test commands must not remain running.
Use `npm run dev:playground`, `npm run dev:playground:network`, or
`npm run dev:test` only when an intentional long-running session is wanted.

CI runs each desktop and mobile browser profile on a clean parallel runner.
The nightly workflow repeats complete release qualification. Physical-device
and human accessibility review remain manual evidence.
