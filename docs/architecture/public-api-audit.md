# Public API Audit

Last audit: 2026-06-20

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
- direct part type exports where advanced composition needs them
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

- `package.json` exposes 66 public subpaths plus the root package.
- Every public subpath has a matching `src/<subpath>.ts` entrypoint.
- Public package exports are tested by `test/exports.test.mjs`.
- Package boundary and client boundary rules are tested by
  `test/package-boundary.test.mjs`.
- Primitive behavior is split across `test/primitives/*.test.mjs`.
- Component docs and changelogs exist for every public component-style subpath.
- `hooks` are documented at the package level.
- `Portal` is public through the root export and `@flowstack-ui/atom/portal`.
- Slot and DOM helper utilities remain internal implementation details.

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
