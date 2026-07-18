# Atom Playground

Local browser workbench for testing Atom UI primitives from the current source
code. It is repo-only and is not included in the npm package.

## Read First

- [docs/README.md](docs/README.md) - complete playground documentation index.
- [CURRENT.md](CURRENT.md) - current playground status and conventions.
- [TODO.md](TODO.md) - active unfinished playground work.
- [CHANGELOG.md](CHANGELOG.md) - versioned playground release history.
- [docs/versioning.md](docs/versioning.md) - independent versioning, changelog,
  and release policy.
- [AGENTS.md](AGENTS.md) - AI-agent router for this folder.

The current playground release is `1.0.0`. Playground versions are independent
from `@flowstack-ui/atom` package versions and are never published to npm.

## Run

From `package/`:

```bash
npm run dev:playground
npm run dev:playground:network
npm run playground:build
```

From `package/playground/`:

```bash
npm run dev
npm run dev:network
npm run build
```

Local development uses `http://127.0.0.1:3000`. The network command binds the
same port to the LAN for real-phone and tablet review. Vite prints the current
Network URL when it starts. Port `4000` is reserved for a future automated
browser-test preview.

## Source Rule

Use public Atom import paths only:

```tsx
import { Dialog } from "@flowstack-ui/atom";
import { Select } from "@flowstack-ui/atom/select";
```

The Vite config maps those imports to the local package source, so the
playground exercises the current workspace code without installing the
published npm package.
