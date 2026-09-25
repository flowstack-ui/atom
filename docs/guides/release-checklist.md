# Release Checklist

Use this checklist before publishing `@flowstack-ui/atom`.

## Post-Release Change Tracking

After a version has been published, do not bump `package.json` for every code
change. Track changes under `Unreleased` until the next publish is prepared.

- Update the root `CHANGELOG.md` for package-level behavior, API, or shared
  utility changes.
- Update every affected component `CHANGELOG.md`.
- Component changelog versions refer to the Atom package release in which the
  component last changed. Components are not independently versioned packages.
- Give a component a target-version section only when it has a behavior, API,
  type, semantic, accessibility, anatomy, or inherited shared-runtime change.
  README expansion and documentation maintenance alone do not advance the
  component's last-change release.
- Update public docs when behavior, accessibility, anatomy, or semantics change.
- Update playground coverage when the playground exposes or verifies the change.
- Do not create a playground release solely because Atom is being published.
  Playground changes follow their independent changelog and release policy in
  [`../../playground/docs/versioning.md`](../../playground/docs/versioning.md).
- When ready to publish, convert `Unreleased` entries into the target version,
  then bump `package.json` and `package-lock.json` in the release commit.

Use patch versions for compatible bug fixes and behavior corrections. Use minor
versions for new public APIs or materially expanded component capability.

## Complete qualification command

Run `npm run check:release` against an unchanged working tree. It performs the
repository build/tests and Agent Knowledge checks, one playground build, the
full browser matrix, package verification and clean React 18/19 consumers.
Retain its `test-results/release-*/summary.json`, phase logs, browser report and
verified archive. Do not infer readiness from an interrupted or failed report.

For 0.27.0, review the [public API migration notes](public-api.md#migrating-from-0261-to-0270).
A source version is not proof of publication or archive identity. Qualify the
release commit and its exact archive; never republish an existing version or
silently install a different same-version candidate.

## Individual diagnostic checks

These commands are useful to investigate a failed phase. They do not replace
the complete release command, and do not need to be repeated after a successful
unchanged complete run.

1. Run tests.

   ```bash
   npm run test
   ```

2. Build declarations and JavaScript.

   ```bash
   npm run build
   ```

3. Produce a clean build, then check package contents.

   ```bash
   npm_config_cache=/tmp/atom-ui-npm-cache npm pack --dry-run
   ```

   Use a temporary npm cache if the local machine has a stale or root-owned
   `~/.npm` cache.

   Do not pack an existing ignored `dist/` tree without running the clean build
   first. Review the listing for conflict-copy or stale paths such as
   `_internal 2`, duplicated chunks, or files outside the intended generated
   tree.

4. Verify public export targets.

   Run `npm run verify:pack -- <archive-or-directory>`. It verifies conditional
   JavaScript/declaration exports and Agent Knowledge JSON/Markdown wildcards;
   not every export is a JavaScript entrypoint.

5. Verify package boundaries.

   Atom source must not import styled, theme, icon, router, or application engine code.

6. Update component docs and component changelogs when behavior changes.

7. Create the tarball in a temporary directory and smoke test it as a consumer.

   ```bash
   release_dir=$(mktemp -d)
   npm pack --pack-destination "$release_dir"
   npm run verify:pack -- "$release_dir"
   npm run verify:consumer -- "$release_dir" 18
   npm run verify:consumer -- "$release_dir" 19
   ```

   Verify root imports, representative subpaths, direct part exports, and
   TypeScript declarations from the tarball rather than source self-reference.
   Verify the supported React peer range, including React 18 and the current
   React 19 line, before publishing.

## Historical Dry Run

Historical baseline: 2026-07-30. These counts do not describe the unreleased
candidate. Use that candidate's retained release report for current evidence.

- `npm run test`
- `npm run build`
- `git diff --check`
- export target check from `package.json`
- `npm_config_cache=/tmp/atom-ui-npm-cache npm pack --dry-run`
- `npm run verify:pack -- <archive-or-directory>`
- `npm run verify:consumer -- <archive-or-directory> 18`
- `npm run verify:consumer -- <archive-or-directory> 19`
- `npm run test:browser`

The latest browser-harness pass verifies 54 browser tests across desktop
Chromium, desktop WebKit, Android-Chromium touch emulation, and iPhone-WebKit
touch emulation. The latest complete release pass also verifies 516 package
tests, 71 export targets, a 2,199-file archive, and clean React 18 and React 19
consumers.

The detailed result is recorded in
[`../architecture/release-readiness-audit.md`](../architecture/release-readiness-audit.md).
