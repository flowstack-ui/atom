# Tabs Changelog

## Unreleased

- No unreleased changes.

## 0.27.0

- Register dynamic triggers before indicator layout measurement to avoid
  resetting an already measured indicator when adding and selecting a tab.

- Add useTabs, RootProvider, Context, focus callbacks, custom IDs, navigation,
  deselection, loopFocus, and independent panel lifecycle options.
- Fix disabled composed anchors, safe generated IDREFs and missing keyboard entry.
- Measure indicators in list-local coordinates and expose refs/readiness.
- Make text-only panels keyboard reachable, with explicit opt-out.

- Reveal keyboard-focused triggers at the nearest scroll edge, including
  partially visible first/last tabs, without smooth-scroll delays.

- Added public Agent Knowledge for component selection, required composition,
  recurring mistakes, and validation.


## 0.2.0

- Added `dir` and `Direction.Provider` support so horizontal tab arrow-key
  navigation mirrors in RTL.

## 0.1.0

- Initial Atom release.
