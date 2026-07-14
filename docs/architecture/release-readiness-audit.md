# Release Readiness Audit

Last audit: 2026-07-14

Audited commit: `64bac26e719e790afab75e961bb426c51dc94f27`, plus the
documentation and changelog corrections in this audit pass.

## Result

Status: pass; `0.2.0` is published.

The package version and qualifying changelogs were released as `0.2.0`. The
exact publication tarball passed the final artifact and consumer verification,
npm `latest` points to `0.2.0`, and remote tag `v0.2.0` points to the release
commit.

## Verification

| Check | Result |
| --- | --- |
| Isolated package build and tests | Pass: 334 tests, 0 failures |
| Primitive test coverage files | 62 `test/primitives/*.test.mjs` files |
| Public export targets | Pass: all 67 targets emit JavaScript and declarations |
| Playground production build | Pass |
| Packed artifact | Pass: 1,895 entries, 411.4 kB compressed, 2.5 MB unpacked |
| Tarball hygiene | Pass: no source, playground, dependency, conflict-copy, or stale `_internal` paths |
| React 18 consumer | Pass: runtime imports and TypeScript declarations |
| React 19 consumer | Pass: runtime imports and TypeScript declarations |
| Package dependency audit | Pass: 0 known vulnerabilities |
| Playground dependency audit | Pass: 0 known vulnerabilities |
| Changelog classification | Pass: 38 changed components, 28 unchanged components, 142 retained entries |

The consumer checks installed the final `0.2.0` tarball into clean temporary
projects with React and React DOM `18.3.1` and `19.2.7`. They verified root
namespaces, component subpaths, representative direct parts, Portal identity,
and emitted TypeScript declarations.

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
- The verified tarball SHA-256 is
  `4db6d1529ed8aff62647f55353cce3bd7e109de655ebd644905029cdba847bab`.
- A temporary npm cache was used because the machine's default cache contains
  root-owned entries.
- The playground build reports a large-bundle warning at approximately 1.40 MB
  minified and 318 KiB gzip. It does not block the Atom library release, but it
  remains a playground optimization opportunity.

## Release Metadata

- Published Atom version: `0.2.0`
- npm distribution tag: `latest`
- Remote Atom tag: annotated `v0.2.0` at
  `4a0629d1689b77a21a26f9b0bf832ba772797fcf`
- Reason: the unreleased surface includes new public composition and direction
  capabilities, not only compatible corrections.
- Local playground tag: annotated `playground-v1.0.0` at
  `64bac26e719e790afab75e961bb426c51dc94f27`
- Remote playground tag: absent at audit time; this pass did not push it.

## Publication Outcome

The release was installed from the public npm registry in a fresh React 19
consumer after publication. Root imports, subpath imports, and server rendering
passed. `main`, npm `latest`, and remote tag `v0.2.0` agree on the release.
