# Contributing

Atom is a headless React primitive library. Repository work must preserve its
behavior, accessibility, semantic, and package boundaries.

## Start Here

1. Read `AGENTS.md` for the package boundary.
2. Read `docs/README.md` for documentation and verification routes.
3. Read the relevant component documentation before changing public behavior.

## Verification

Use the narrowest relevant check while developing. Before a release, follow
`docs/guides/release-checklist.md` and run the complete release gate.

```bash
npm run test
npm run build
npm run pack:check
```

The repository-only playground has its own guidance in
`playground/AGENTS.md`, changelog in `playground/CHANGELOG.md`, and versioning
policy in `playground/docs/versioning.md`.
