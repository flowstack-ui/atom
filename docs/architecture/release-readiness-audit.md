# Release Readiness Audit

Last audit: 2026-07-14

Audited commit: `64bac26e719e790afab75e961bb426c51dc94f27`, plus the
documentation and changelog corrections in this audit pass.

## Result

Status: pass for release preparation.

The package is ready for a separately approved `0.2.0` release-preparation
pass. This audit intentionally did not change `package.json`, convert
`Unreleased` sections, publish to npm, or create an Atom package release tag.

## Verification

| Check | Result |
| --- | --- |
| Isolated package build and tests | Pass: 334 tests, 0 failures |
| Primitive test coverage files | 62 `test/primitives/*.test.mjs` files |
| Public export targets | Pass: all 67 targets emit JavaScript and declarations |
| Playground production build | Pass |
| Packed artifact | Pass: 1,895 entries, approximately 402 KiB compressed |
| Tarball hygiene | Pass: no source, playground, dependency, conflict-copy, or stale `_internal` paths |
| React 18 consumer | Pass: runtime imports and TypeScript declarations |
| React 19 consumer | Pass: runtime imports and TypeScript declarations |
| Package dependency audit | Pass: 0 known vulnerabilities |
| Playground dependency audit | Pass: 0 known vulnerabilities |
| Changelog classification | Pass: 38 changed components, 28 unchanged components, 142 retained entries |

The consumer checks installed the packed tarball into clean temporary projects
with React and React DOM `18.3.1` and `19.2.7`. They verified root namespaces,
component subpaths, representative direct parts, Portal identity, and emitted
TypeScript declarations.

## Public API Clarification

Root imports expose the namespace API. Component subpaths expose their
namespace and supported direct parts. Direct parts are not independently
versioned and are not promised from the root import.

Direct names usually follow the namespace and part names, but shared primitives
retain shared direct names. For example, `Dialog.Root` composes the directly
exported `ModalRoot`. The package README and public API guide now document this
instead of referring to the nonexistent `DialogRoot` export.

## Packaging Notes

- The audit packed a clean isolated build rather than reusing the working
  repository's ignored `dist/` directory.
- A temporary npm cache was used because the machine's default cache contains
  root-owned entries.
- The playground build reports a large-bundle warning at approximately 1.40 MB
  minified and 318 KiB gzip. It does not block the Atom library release, but it
  remains a playground optimization opportunity.

## Release Metadata

- Current Atom version: `0.1.0`
- Recommended next Atom version: `0.2.0`
- Reason: the unreleased surface includes new public composition and direction
  capabilities, not only compatible corrections.
- Local playground tag: annotated `playground-v1.0.0` at
  `64bac26e719e790afab75e961bb426c51dc94f27`
- Remote playground tag: absent at audit time; this pass did not push it.

## Next Release Pass

When the `0.2.0` release is approved:

1. Re-run this verification against the final release commit.
2. Convert the root `Unreleased` section to `0.2.0`.
3. Convert `Unreleased` only in the 38 changed component changelogs; leave the
   28 unchanged components at their previous last-change release.
4. Bump `package.json` and `package-lock.json` together.
5. Pack and repeat both consumer checks before publishing and tagging.
