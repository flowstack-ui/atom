# Release Checklist

Use this checklist before publishing `@flowstack-ui/atom`.

## Post-Release Change Tracking

After a version has been published, do not bump `package.json` for every code
change. Track changes under `Unreleased` until the next publish is prepared.

- Update the root `CHANGELOG.md` for package-level behavior, API, or shared
  utility changes.
- Update every affected component `CHANGELOG.md`.
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

3. Check package contents.

   ```bash
   npm_config_cache=/tmp/atom-ui-npm-cache npm pack --dry-run
   ```

   Use a temporary npm cache if the local machine has a stale or root-owned
   `~/.npm` cache.

4. Verify public export targets.

   Each export in `package.json` must resolve to a built
   `.js` file and a `.d.ts` file.

5. Verify package boundaries.

   Atom source must not import styled, theme, icon, router, or application engine code.

6. Update component docs and component changelogs when behavior changes.

7. Smoke test root and subpath imports from the packed tarball.

## Last Dry Run

Last verified: 2026-06-21

- `npm run test`
- `npm run build`
- `git diff --check`
- export target check from `package.json`
- `npm_config_cache=/tmp/atom-ui-npm-cache npm pack --dry-run`
- packed tarball root, subpath, and TypeScript declaration smoke test
