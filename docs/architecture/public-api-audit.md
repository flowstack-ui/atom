# Public API Audit

Last audit: 2026-07-30
Audited release commit: `ab7a93838822bdfa1c1dcfa41c18d33f5601b938`

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

- `package.json` exposes 70 public subpaths plus the root package, for 71
  export targets in total.
- Every public subpath has a matching `src/<subpath>.ts` entrypoint.
- Public package exports are tested by `test/exports.test.mjs`.
- Root imports expose the namespace API. Component subpaths expose their
  namespace plus supported direct parts; direct parts are not promised from the
  root package.
- Package boundary and client boundary rules are tested by
  `test/package-boundary.test.mjs`.
- Primitive behavior is split across 79 `test/primitives/*.test.mjs` files,
  with hooks, collection, Portal, Virtualizer, and shared utilities covered by
  their package-level test files.
- Component docs and changelogs exist for every public component-style subpath.
- `hooks` are documented at the package level.
- `Portal` is public through the root export and `@flowstack-ui/atom/portal`.
- Slot and DOM helper utilities remain internal implementation details.
- The readiness-cleanup suite contains 515 passing tests. The complete local
  matrix also passes the playground build and Chromium/WebKit desktop and
  touch-profile suite, archive
  verification, and clean React 18 and React 19 consumers.

## Client And Server Boundaries

The root package is a client entrypoint because it exports the complete
interactive primitive surface. The current server-safe public subpaths are:

- `@flowstack-ui/atom/app-bar`
- `@flowstack-ui/atom/badge`
- `@flowstack-ui/atom/label`
- `@flowstack-ui/atom/link`
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
packages. Current component changelogs use package versions through `0.20.2`;
an `Unreleased` section either contains real pending changes or the explicit
`No unreleased changes` marker required by the documentation guide.

README expansion and other documentation maintenance that does not change or
correct the published component contract does not advance a component's
last-change release.

## Release Version

The audited public package is `0.20.2`, published from the audited release
commit with npm provenance and a matching GitHub release. Post-release
documentation and test-harness cleanup does not change the runtime package or
require another npm version.

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
