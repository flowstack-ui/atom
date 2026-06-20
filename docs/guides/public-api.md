# Public API

Atom UI exposes three public API layers.

## Namespace Exports

Namespace exports are the stable API for application and styled-layer usage.

```tsx
import { Select } from "@flowstack-ui/atom";

<Select.Root>
  <Select.Trigger />
  <Select.Content />
</Select.Root>;
```

## Subpath Exports

Subpaths are stable focused entrypoints.

```tsx
import { Select } from "@flowstack-ui/atom/select";
import { useControllableState } from "@flowstack-ui/atom/hooks";
```

Every subpath must be listed in `package.json` and emit JavaScript plus
declaration files.

## Direct Part Exports

Direct exports mirror namespace part names for migration and advanced
composition.

```tsx
import { SelectRoot, SelectTrigger } from "@flowstack-ui/atom/select";
```

Prefer namespace usage for new code unless a direct part export improves local
readability.

## Non-API Files

The following are not public package API:

- files under `src/primitives/**`
- files under `src/utils/**`, except `Portal` through `@flowstack-ui/atom/portal`
- files under `.dev-notes/**`
- tests
- internal helper functions that are not exported from a public subpath

Changing non-API files can still be a behavior change if public output changes.
