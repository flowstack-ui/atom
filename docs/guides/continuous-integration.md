# Continuous Integration

GitHub Actions checks every pull request to `main`, every push to `main`, and
every manual CI run. CI verifies changes; it does not publish Atom or create
release tags. The separate tag-only publishing workflow is described below.

## Required Checks

The primary workflow is `.github/workflows/ci.yml` and contains these jobs:

- `package (node-22)` builds Atom and runs the package test suite on Node 22.
- `package (node-24)` repeats the package checks on Node 24.
- `playground` type-checks and builds the browser workbench on Node 24.
- `packed package` creates the real npm archive, verifies its paths, and checks
  every JavaScript and declaration export target.
- `consumer (react-18)` installs that archive in a clean React 18 project.
- `consumer (react-19)` installs that archive in a clean React 19 project.

The consumer checks compile strict TypeScript imports and perform a small React
server render. This verifies the package consumers install, rather than only
the source tree used to create it.

## Local Commands

Run the package checks:

```bash
npm ci
npm run ci:package
```

Run the playground check:

```bash
npm ci
npm ci --prefix playground
npm run ci:playground
```

Create and inspect a real archive:

```bash
npm run build
mkdir -p /tmp/atom-ui-ci-package
npm pack --pack-destination /tmp/atom-ui-ci-package
npm run verify:pack -- /tmp/atom-ui-ci-package
```

Smoke test the archive with both supported React lines:

```bash
npm run verify:consumer -- /tmp/atom-ui-ci-package 18
npm run verify:consumer -- /tmp/atom-ui-ci-package 19
```

The consumer script uses pinned React, React DOM, type, and TypeScript versions
so an unrelated upstream release cannot unpredictably change existing CI runs.

## Dependency Audit

`.github/workflows/dependency-audit.yml` runs every Monday and can also be run
manually. It audits the package and playground lockfiles for high-severity
vulnerabilities. It is intentionally separate from required pull-request CI so
a registry or advisory-service outage does not block an unrelated change.

Dependabot checks the pinned GitHub Action revisions weekly. npm dependency
updates remain a deliberate maintainer task.

## Trusted Publishing

`.github/workflows/publish.yml` runs only when a semantic version tag such as
`v0.6.3` is pushed. It repeats the package, archive, and React consumer checks,
then publishes the verified archive through npm trusted publishing and GitHub
OIDC. It has no manual-dispatch or branch-push trigger and stores no npm write
token.

The job rejects mismatched tag/package versions, tagged commits outside
`main`, incorrect repository metadata, and versions already present on npm.
The `npm` GitHub environment is the deployment boundary and should require
maintainer approval. npm must trust organization `flowstack-ui`, repository
`atom`, workflow `publish.yml`, environment `npm`, with publish-only access.

## Security And Publishing Boundary

CI has read-only repository permissions and checkout does not preserve write
credentials. Only the tag-gated publishing job receives `id-token: write`, and
that short-lived OIDC identity is restricted by npm to the exact repository,
workflow, and environment. Version changes, Git tags, and GitHub releases remain
deliberate maintainer actions.

## Updating Matrices

Update Node versions when an audited line becomes end-of-life. Update React
consumer versions intentionally when qualifying a newer supported peer line.
Keep required job names stable unless branch protection is updated at the same
time.
