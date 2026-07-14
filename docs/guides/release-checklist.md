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

   Each export in `package.json` must resolve to a built
   `.js` file and a `.d.ts` file.

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

## Last Dry Run

Last verified: 2026-07-14

- `npm run test`
- `npm run build`
- `git diff --check`
- export target check from `package.json`
- `npm_config_cache=/tmp/atom-ui-npm-cache npm pack --dry-run`
- `npm run verify:pack -- <archive-or-directory>`
- `npm run verify:consumer -- <archive-or-directory> 18`
- `npm run verify:consumer -- <archive-or-directory> 19`

The detailed result is recorded in
[`../architecture/release-readiness-audit.md`](../architecture/release-readiness-audit.md).
