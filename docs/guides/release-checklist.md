# Release Checklist

Use this checklist before publishing `@flowstack-ui/atom`.

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

Last verified: 2026-06-20

- `npm run test`
- `npm run build`
- `git diff --check`
- `node test/exports.test.mjs`
- `npm_config_cache=/private/tmp/atom-ui-npm-cache npm pack --dry-run`
