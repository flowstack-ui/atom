# Marquee Changelog

## Unreleased

- Refresh viewport coverage immediately, including while paused. New visual
  replicas synchronize with the original track's CSS animation phase.
- Restart the current cycle when measured travel distance changes, retaining
  completed iterations and requested pause instead of leaving stale seams.

- Add measured continuous motion, explicit inert visual replicas, controlled pause,
  independent safety reasons, finite iteration lifecycle and stationary fallbacks.
### Fixed

- Make stationary viewports keyboard-focusable and guard detached document focus checks.
