# Atom Playground

Local browser workbench for testing Atom UI primitives from the current source
code. It is repo-only and is not included in the npm package.

## Read First

- [docs/README.md](docs/README.md) - complete playground documentation index.
- [CURRENT.md](CURRENT.md) - current playground status and conventions.
- [TODO.md](TODO.md) - active unfinished playground work.
- [AGENTS.md](AGENTS.md) - AI-agent router for this folder.

## Run

From `package/`:

```bash
npm run playground:dev
npm run playground:build
```

From `package/playground/`:

```bash
npm run dev
npm run build
```

## Source Rule

Use public Atom import paths only:

```tsx
import { Dialog } from "@flowstack-ui/atom";
import { Select } from "@flowstack-ui/atom/select";
```

The Vite config maps those imports to the local package source, so the
playground exercises the current workspace code without installing the
published npm package.
