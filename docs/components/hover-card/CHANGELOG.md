# HoverCard Changelog

## 0.6.9

- Preserved resolved Trigger or provider direction on portalled Content while
  retaining explicit Content `dir` precedence.

## 0.6.8

- Exposed measured available dimensions through headless floating properties
  for constrained styled surfaces.

## 0.6.6

- Disabled hover interaction when the browser reports no hover-capable input
  and captured touch pointer entry before native compatibility mouse events on
  hybrid devices.

## 0.6.5

- Added a short post-touch compatibility-event guard so intermittent Safari
  mouse and focus synthesis cannot open HoverCard after touch activation.

## 0.6.4

- Limited hover disclosure to mouse-capable pointers so touch keeps the
  Trigger's native tap and long-press behavior.
- Added a safe geometric corridor from Trigger to Content and prevented
  exit-retained Content from reopening itself during its closing motion.

## 0.6.3

- Prioritized every usable alignment on the requested side, followed by the
  opposite side, before allowing perpendicular-axis collision fallbacks.

## 0.6.2

- Added perpendicular-side collision fallbacks after the preferred and opposite
  sides, preventing wide previews from remaining cropped on a constrained axis.

## 0.3.1

- Fixed exit-presence cleanup so closed HoverCard Content unmounts after its
  CSS motion window even when no end event is emitted.

## 0.2.0

- Fixed HoverCard render/default trigger positioning by updating Floating UI
  after the trigger ref commits.
- Made default and `render` HoverCard triggers keyboard focusable while keeping
  opening scoped to hover and focus-visible interactions.
- Added shared dismissable layer Escape handling so HoverCard participates in
  topmost-layer dismissal with other overlays.

## 0.1.0

- Initial Atom release.
