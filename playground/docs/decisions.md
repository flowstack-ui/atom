# Playground Architecture Decisions

This file records long-lived architecture decisions already reflected in the
playground documentation.

## Repo-Only Browser Workbench

The playground is a local Vite app for manually testing Atom UI primitives in a
real browser. It is not product documentation and is not published to npm. This
keeps it free to expose debugging surfaces, logs, and coverage-specific controls
without changing the public package. The alternative would be mixing this
material into package docs, which would make the public docs too noisy.

## Public Imports With Local Source Resolution

Scenarios import Atom through public package paths, while Vite maps those paths
to local source. This makes the playground exercise the same API shape that
consumers use while still testing unreleased local code. The rejected
alternative is importing directly from package internals, which would hide
public API problems.

## Desktop Workbench Layout

The app uses a desktop-style structure: top app bar, Anatomy, Canvas, and
Inspector. This gives every component page the same mental model and keeps
manual testing fast. A persistent sidebar was rejected because the top menu
already carries category navigation and the page should stay focused on one
scenario at a time.

## One Interactive Scenario Per Component Surface

Component pages prefer one strong interactive scenario over many tiny examples.
Controls, Anatomy, Inspector, Logs, and Source let a single page cover many
states. This avoids duplicating nearly identical examples and makes it easier
to understand how props interact. Tiny examples are still useful in docs, but
the playground is optimized for behavior testing.

## Anatomy Mirrors Public Component Parts

Anatomy is organized around public Atom component parts, in public anatomy
order. Extra test variants are placed under the real part, such as multiple
items or multiple actions. This prevents fake playground concepts from being
confused with Atom API. The alternative, arbitrary example DOM groups, made
coverage harder to trust.

## Live DOM Evidence Is Shared Across Inspection Surfaces

Anatomy and Inspector should show raw live DOM evidence for `Attributes`,
`ARIA`, and `Data`. Curated rows explain behavior, while raw groups prove what
is actually rendered. This exists because manually copied attributes became
stale during testing. The long-term direction is one shared live inspection
path for both Anatomy and Inspector.

## Canvas Toolbar Owns Scenario Controls

Controls that affect the live component live in the Canvas toolbar, not in
Anatomy or inside the stage. The toolbar uses consistent groups such as
`State`, `Field`, `Content`, `Items`, `Popup`, `Dismiss`, `Composition`, and
`Props`. This keeps Anatomy observational and keeps the Canvas stage focused on
the component being tested.

## Props And Slots Are Verified Through Raw Data

Native prop passthrough and custom slot overrides are real Atom API tests. They
are exposed through an optional `Props` toolbar and verified by raw `Data`
attributes such as `data-prop-check` or custom `data-slot` values. Curated rows
like `Prop check true` were rejected because they can pass without proving the
DOM received the prop.

## Source Shows Consumer-Facing Atom JSX

The Source view shows the Atom JSX that creates the current Canvas scenario. It
includes meaningful state, composition, Field/native variants, direction, and
prop/slot controls, but omits playground-only layout and inspection plumbing.
This helps developers understand usage without reading scenario implementation
details.

## Coverage Tracks Only Playground-Verifiable Behavior

`component-coverage.xlsx` tracks behavior that can be verified in the
playground. Package export checks, npm publishing, changelogs, and docs
existence are intentionally excluded. This keeps the workbook useful as a
manual test plan instead of turning it into a release checklist.

## Workbook Is The Manual Coverage Source Of Truth

The workbook is the authoritative status view for playground manual coverage.
Scenario files show how behavior is exercised, but completion status lives in
`component-coverage.xlsx` so each component can be reviewed from one index.
Keeping coverage status outside source code avoids scattering manual test state
through scenario implementations. The alternative is relying on TODO lists or
comments, which become stale and do not give a component-by-component summary.

## Shared Workbench Primitives Grow From Repetition

Shared workbench UI lives in `src/WorkbenchPrimitives.tsx`, but scenario files
still own component state, anatomy data, Source snippets, and live Atom JSX.
This prevents a premature global registry while allowing repeated toolbar,
panel, and log patterns to become consistent once they prove stable.

## Direction Coverage Is Behavioral

Direction coverage is added only when `ltr` versus `rtl` changes component
behavior, such as keyboard movement, start/end placement, swipe direction,
slider/rating math, or grid navigation. Direction that only changes consumer
text layout belongs outside Atom behavior testing. The preferred Atom order is
direct `dir` prop, then `Direction.Provider`, then default direction.

## Hooks And Utilities Use Consumer DOM

Public hooks and utilities can have playground pages even when they do not
render Atom DOM parts themselves. Those pages show return values and the
minimum consumer DOM needed to exercise the API. Prop-check and slot-override
coverage does not apply unless a real Atom DOM part exists.

## Native Variants Are Compatibility Tests

Scenarios prefer Atom components, but may expose native HTML variants when they
test meaningful compatibility paths, such as Field wiring with native inputs.
This keeps the playground dogfooding Atom while still proving that public APIs
work with native browser elements when that compatibility matters.

## Decisions Needing Better Documentation

- The exact threshold for extracting a repeated pattern into
  `WorkbenchPrimitives` exists in practice, but is still mostly judgment-based.
- The expected relationship between axe scans and playground scenarios is used
  during testing, but not captured as an architecture decision.
- Mobile testing is part of the workflow for relevant components, but the docs
  do not define which component categories require it.
