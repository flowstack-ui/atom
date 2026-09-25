# NativeSelect

Browser-native selection with Atom Field/Form integration. Import NativeSelect
from the root or `@flowstack-ui/atom/native-select`.

```tsx
<Field.Root id="region" required>
  <Field.Label>Region</Field.Label>
  <NativeSelect.Root name="region" defaultValue="">
    <option value="">Choose a region</option>
    <option value="north">North</option>
  </NativeSelect.Root>
</Field.Root>
```

## API Reference

Root renders a select and forwards HTMLSelectElement refs. It accepts native
select props, including value/defaultValue/onChange, multiple, numeric size,
name, form, required and disabled. Uncontrolled value and reset are native.
Optional invalid and validationBehavior integrate Atom validation; explicit
disabled/required/invalid override Field defaults. Field control ID and
description wiring are inherited unless explicitly supplied. Standalone controls
need a native label or accessible name. No readonly emulation or popup exists.

## Anatomy

NativeSelect.Root is the native select. Compose native option and optgroup
children; there is no separately controlled listbox or overlay.

## Data Attributes

Root exposes data-slot=native-select and disabled/required/invalid data states.
Native options/optgroups are intentional children. No asChild/render replacement
is supported because the select element is the public semantic contract.
NativeSelect, NativeSelectRoot and NativeSelectRootProps are public exports.
## Accessibility

Keep a visible native label or an equivalent accessible name. Native select
keyboard navigation, option announcements and platform picker behavior remain
browser-owned. Field supplies label and description associations and validation.
Browser-dependent option styling, application data and selection side effects
are outside Atom. Test actual mobile pickers separately from desktop automation.
