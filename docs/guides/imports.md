# Imports

Atom docs use the main namespace import in component anatomy and examples:

```tsx
import { Input, Dialog } from "@flowstack-ui/atom";
```

Subpath imports are also public and stable:

```tsx
import { Input } from "@flowstack-ui/atom/input";
import { Dialog } from "@flowstack-ui/atom/dialog";
```

Use the main package import when teaching component anatomy. Use subpaths when a
project wants explicit package boundaries per primitive or when a bundler policy
requires focused entrypoints.
