# Public API Audit

Last audit: 2026-07-14
Audited commit: `64bac26e719e790afab75e961bb426c51dc94f27`

## Scope

This audit covers the public `@flowstack-ui/atom` surface:

- root namespace exports
- direct part exports
- subpath exports
- docs coverage
- client/server boundaries
- package dependency boundary
- headless source constraints

## Rules

Every public primitive should have:

- namespace export from the root package
- subpath export when it is independently importable
- direct part exports from component subpaths where advanced composition needs
  them; shared primitives may retain shared direct names
- stable `data-slot` values on public rendered parts
- native prop pass-through unless Atom owns the attribute
- `asChild` and `render` support when composition needs it
- matching tests in `test/primitives/<primitive>.test.mjs`
- component docs under `docs/components/<primitive>/README.md`
- component changelog under `docs/components/<primitive>/CHANGELOG.md`

Every public subpath in `package.json` should have:

- `src/<subpath>.ts`
- `dist/<subpath>.js`
- `dist/<subpath>.d.ts`
- matching package export metadata

## Current Result

Status: pass

- `package.json` exposes 66 public subpaths plus the root package, for 67
  export targets in total.
- Every public subpath has a matching `src/<subpath>.ts` entrypoint.
- Public package exports are tested by `test/exports.test.mjs`.
- Root imports expose the namespace API. Component subpaths expose their
  namespace plus supported direct parts; direct parts are not promised from the
  root package.
- Package boundary and client boundary rules are tested by
  `test/package-boundary.test.mjs`.
- Primitive behavior is split across 62 `test/primitives/*.test.mjs` files,
  with hooks, collection, Portal, Virtualizer, and shared utilities covered by
  their package-level test files.
- Component docs and changelogs exist for every public component-style subpath.
- `hooks` are documented at the package level.
- `Portal` is public through the root export and `@flowstack-ui/atom/portal`.
- Slot and DOM helper utilities remain internal implementation details.
- The package test suite contains 334 passing tests at the audited commit.

## Client And Server Boundaries

The root package is a client entrypoint because it exports the complete
interactive primitive surface. The current server-safe public subpaths are:

- `@flowstack-ui/atom/app-bar`
- `@flowstack-ui/atom/badge`
- `@flowstack-ui/atom/label`
- `@flowstack-ui/atom/list`
- `@flowstack-ui/atom/table`

Other public subpaths intentionally retain their current client boundaries for
this audit. Badge joined the server-safe set after a focused React Server
Component compatibility review confirmed that its structural wrapper has no
client behavior. Further expansion requires the same review rather than a
documentation-only change.

## Changelog Classification

Component changelogs identify the Atom package releases in which that
component's public contract changed; they are not independently versioned npm
packages. The `0.2.0` release audit found:

- 38 components with supported behavior, API, type, semantic, or shared-runtime
  changes included in `0.2.0`
- 28 components with no qualifying change since `0.1.0`
- 142 retained component-level `Unreleased` entries

README expansion and other documentation maintenance that does not change or
correct the published component contract does not advance a component's
last-change release.

## Release Version

The audited changes are prepared as `0.2.0`. The changes since
`0.1.0` include new public composition and direction capabilities in addition
to compatible behavior and accessibility corrections.

## Known Design Scope

The following are intentional non-goals for the current Atom primitive layer:

- data sorting and filtering models
- cell editing frameworks
- column resizing and reordering frameworks
- automatic virtualization inside every collection component
- router-specific link components
- visual variants, styles, icons, themes, and layout presets

These may be built as separate utilities or higher-level packages later, but
they should not be silently added to primitive components.

## Next Audit Trigger

Run this audit again when:

- a public subpath is added or removed
- a namespace anatomy changes
- a primitive gains or loses `asChild` / `render`
- a client boundary changes
- package dependencies change
- a component docs page is added or removed
