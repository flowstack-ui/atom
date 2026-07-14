# ToggleGroup Changelog

## Unreleased

- Fixed disabled native `ToggleGroup.Item` buttons so they rely on the native
  `disabled` attribute without adding redundant `aria-disabled`; non-native
  composed items still receive `aria-disabled`.
- Fixed disabled `ToggleGroup.Root` semantics so the group exposes
  `aria-disabled` alongside `data-disabled`.
- Fixed `ToggleGroup.Root` single mode so changing from multiple selected
  values exposes only one pressed item.
- Fixed `ToggleGroup.Item` roving focus for composed non-native items so
  disabled items are skipped consistently in `asChild` and `render` paths.
- Fixed `ToggleGroup.Item` collection registration so changing `asChild` or
  `render` composition refreshes the DOM node used for arrow navigation.
- Fixed `ToggleGroup.Root` horizontal arrow navigation so it mirrors
  ArrowLeft/ArrowRight when used under `Direction.Provider dir="rtl"`.
## 0.1.0

- Initial Atom release.
