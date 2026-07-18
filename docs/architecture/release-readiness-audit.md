# Release Readiness Audit

Last published-release audit: 2026-07-18

The original `0.2.0` published-release audit remains below as a historical
baseline. The current release outcome records the Badge server-safety patch
published in `0.3.3`.

## 0.3.3 Release Outcome - 2026-07-18

Status: pass; `0.3.3` is published under npm `latest`.

This patch removes the unnecessary client boundary from the pure-render Badge
primitive and explicit `@flowstack-ui/atom/badge` subpath. The root package
entrypoint remains client-side. Badge count guidance now uses meaningful
surrounding or owning-control context, and the playground numeric scenario
shows that context visibly.

The candidate passes all 374 package tests, including focused source-boundary,
composition, native-prop, custom-slot, and render assertions. The Atom
playground production build passes with 542 transformed modules and the
existing non-blocking large-chunk warning. The exact archive contains 1,919
files, emits all 67 JavaScript and declaration export targets, and is 437,225
compressed bytes. Clean packed consumers pass with React and React DOM 18.3.1
and 19.2.7; the React 19 consumer additionally imports the Badge subpath under
the `react-server` condition. React 18 receives the ordinary packed server-
render check because its CommonJS package predates that condition.

The qualified archive has SHA-1
`5ec36fd507d65af7645311c01f704650285c490c`, SHA-256
`de58e992eb2d00749d68a0d67c42e3ce54d323acddf75d34f38f95b96d8d2453`, and
SHA-512 integrity
`sha512-uCIZ8uarV0y8idB2dKsmmUbyCil6qmdWgIxHprOQ4Umc7iOuMhZOPhZQLRA4l/ZT/+dob/mZ+5GSsEoX3Zu/Nw==`.
The npm registry reports version and `latest` as `0.3.3`, with the same SHA-1
and SHA-512 integrity as the qualified archive. Publication verification
passed; tag and remote-history verification follow this recorded outcome.

## 0.3.2 Release Outcome - 2026-07-17

Status: pass; `0.3.2` is published under npm `latest` and tagged `v0.3.2`.

The exact `0.3.2` release tarball passes all 372 package tests, emits all 67
JavaScript and declaration export targets, and passes clean consumer installs
with React and React DOM `18.3.1` and `19.2.7`. The archive contains 1,919
files, is 437,174 compressed bytes, and has SHA-1
`74cc11df993b3b07056f55e899557ae068f5625f` and SHA-256
`c99b6d64daf7de5029492c1d1e1a840fa1f15001b95b07537a265934bded50ad`.
The npm registry reports the same SHA-1 and integrity as the qualified archive.

This patch corrects modal isolation bookkeeping across rapid nested-layer
handoffs and animated exits. Closing a nested Dialog and then its parent now
restores the application root instead of leaving it permanently `inert` and
unclickable.

## 0.3.1 Release Outcome - 2026-07-17

Status: pass; `0.3.1` is published under npm `latest`.

The exact `0.3.1` release tarball passes all 371 package tests, emits all 67
JavaScript and declaration export targets, and passes clean consumer installs
with React and React DOM `18.3.1` and `19.2.7`. The archive contains 1,919
files, is 437,369 compressed bytes, and has SHA-1
`942b449db1f1ffc96e9f4f2034aa28bb10496a29` and SHA-256
`c8bc88cff32ef31a6b791af87e44e1e040e4ec4071ac697f4e174bd797e3b104`.
The npm registry reports the same SHA-1 as the qualified archive.

This patch fixes shared exit-presence cleanup when global transition or
animation CSS advertises motion but the browser emits no matching end event.
The bounded fallback accounts for repeated timing lists and animation
iterations and ignores end events bubbled from descendants, preventing closed
Dialog, Drawer, Menu, Popover, HoverCard, Tooltip, and inherited layers from
remaining above and blocking the page.

## 0.3.0 Release Outcome - 2026-07-17

Status: pass; `0.3.0` is published under npm `latest`.

The exact publication tarball passed all 368 package tests, emitted all 67
JavaScript and declaration export targets, and passed clean consumer installs
with React and React DOM `18.3.1` and `19.2.7`. The archive contains 1,919
files, is 436,217 compressed bytes, and has npm SHA-1
`02d7f747783b50ba778b3935bc6c1b76853d19e8`.

The minor version reflects new public Modal APIs and materially expanded
Modal-family capability, including `Modal.Branch`, explicit initial and final
focus targets, nested layer ownership, focus containment, scroll containment,
and background isolation.

## Modal Foundation Qualification - 2026-07-17

Status: implementation, correction-pass verification, focused desktop manual
qualification, macOS VoiceOver qualification, and iPhone Safari behavioral
qualification and iPhone VoiceOver qualification succeed. Android Chrome and
TalkBack qualification is explicitly deferred because no Android device is
available. Coverage-workbook qualification is complete for the approved focused
scope and available-device matrix. The change qualified for and was published
in the `0.3.0` minor release.

| Check | Result |
| --- | --- |
| Package TypeScript | Pass |
| Package build, tests, and package boundaries | Pass: 368 tests, 0 failures |
| SSR/hydration and modal browser-DOM regression suite | Pass: 28 focused tests |
| Public export targets | Pass: all 67 targets emit JavaScript and declarations |
| Playground TypeScript and production build | Pass: 542 modules; existing large-bundle warning only |
| Packed artifact | Pass: 1,919 entries, 436,221 compressed bytes |
| Tarball hygiene | Pass: no source, playground, dependencies, conflict copies, or stale internal paths |
| React 18 consumer | Pass: install, declarations, imports, and server render |
| React 19 consumer | Pass: install, declarations, imports, and server render |
| Focused desktop manual protocol | Pass: native ARIA and optional Description, initial/final focus, portalled Select, consumer Branch, nested modal ownership, cleanup, and Inspector/Logs consistency |
| Desktop assistive technology | Pass: macOS VoiceOver accessible naming, optional Description, and modal background isolation |
| iPhone Safari | Pass: touch initial focus, virtual keyboard, allowed-region scrolling, background lock, rotation, nested ownership, dismissal, and cleanup |
| iPhone VoiceOver | Pass: accessible naming, optional Description relationships, and modal background isolation |
| Android Chrome and TalkBack | Deferred: no Android device is available; not represented as a pass or failure |
| Coverage workbook | Pass: Dialog has 104 covered rows, Modal has 112 covered rows, seven physical-iPhone evidence records are passed/ready, formulas recalculate without errors, and the affected sheets passed visual verification |

The playground TypeScript check exposed and verified a cross-environment timer
handle declaration correction in the Modal development-warning scheduler. The
production build is approximately 1.43 MB minified and 326 kB gzip, consistent
with the existing non-blocking playground bundle-size note.

### Modal correction pass

| Review item | Resolution |
| --- | --- |
| Opening timing | Layer subscription and activation, focus trapping, isolation, and scroll locking use layout-safe registration. A later layout-effect probe observes an active `aria-modal`, inert background, and locked body in the opening commit. |
| Author `inert` changes | Isolation observes `inert` attributes as well as topology. Atom identifies its own writes by old/new transition, preserves the latest author value, reasserts required isolation synchronously, and restores author intent at cleanup. The unused generation field was removed. |
| Closing presence | Modal ownership follows `open`. Exit-present closed Content loses `aria-modal`, receives `aria-hidden` and `inert`, releases background and scroll ownership, and restores focus before its visual exit completes. Animated close and abrupt unmount are covered. |
| Overlay topology | Dialog-family Content committed beneath an `aria-hidden` Dialog or Drawer Overlay is rejected. Separate/sibling portals remain valid. Backdrop dismissal requires `event.target === event.currentTarget`, so descendant or React-portal bubbling does not close. |
| Nested scroll handoff | Every open modal retains a document-lock registration; only the top registration supplies active allowed regions. Parent/child handoff never reaches zero registrations, restores body styles, calls `scrollTo`, or exposes an unlocked page. |
| Overlapping registrations | Focus-scope and modal-branch registrations are owner-tokenized and metadata is conservatively merged. Cleanup order and React StrictMode cannot delete another owner's registration. |
| Tab filtering | Forward and reverse modal traversal excludes disconnected, hidden, inert, accessibility-hidden, disabled, negative-tab-index, and CSS-unavailable candidates, including candidates beneath hidden ancestors. |
| Dependency metadata | `jsdom` remains a development-only dependency for SSR, hydration, focus, DOM, observer, and scroll regression tests. The temporary exact React pins and Floating UI/tabbable overrides were removed; React retains its prior caret ranges and the pre-audit Floating UI/tabbable lock resolution is unchanged. |

## 0.2.0 Published-Release Baseline

### Result

Status: pass; `0.2.0` is published.

The package version and qualifying changelogs were released as `0.2.0`. The
exact publication tarball passed the final artifact and consumer verification,
npm `latest` points to `0.2.0`, and remote tag `v0.2.0` points to the release
commit.

### Verification

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

### Public API Clarification

Root imports expose the namespace API. Component subpaths expose their
namespace and supported direct parts. Direct parts are not independently
versioned and are not promised from the root import.

Direct names usually follow the namespace and part names, but shared primitives
retain shared direct names. For example, `Dialog.Root` composes the directly
exported `ModalRoot`. The package README and public API guide now document this
instead of referring to the nonexistent `DialogRoot` export.

### Packaging Notes

- The audit packed a clean isolated build rather than reusing the working
  repository's ignored `dist/` directory.
- The verified tarball SHA-256 is
  `4db6d1529ed8aff62647f55353cce3bd7e109de655ebd644905029cdba847bab`.
- A temporary npm cache was used because the machine's default cache contains
  root-owned entries.
- The playground build reports a large-bundle warning at approximately 1.40 MB
  minified and 318 KiB gzip. It does not block the Atom library release, but it
  remains a playground optimization opportunity.

### Release Metadata

- Published Atom version: `0.2.0`
- npm distribution tag: `latest`
- Remote Atom tag: annotated `v0.2.0` at
  `4a0629d1689b77a21a26f9b0bf832ba772797fcf`
- Reason: the unreleased surface includes new public composition and direction
  capabilities, not only compatible corrections.
- Local playground tag: annotated `playground-v1.0.0` at
  `64bac26e719e790afab75e961bb426c51dc94f27`
- Remote playground tag: absent at audit time; this pass did not push it.

### Publication Outcome

The release was installed from the public npm registry in a fresh React 19
consumer after publication. Root imports, subpath imports, and server rendering
passed. `main`, npm `latest`, and remote tag `v0.2.0` agree on the release.
