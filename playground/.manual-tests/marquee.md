# Marquee manual protocol

Workbench: select Data → Marquee. Deterministic harness: /__tests/marquee.
Latest human run: not performed.

0. In the regular workbench, confirm default motion with optional modes off.
   Change State, Content, Composition and Props controls. Verify each control in
   rendered DOM, live Anatomy and Source: all four sides, reverse, speed, delay,
   finite loops, spacing, provider/local direction, controlled pause, original
   links, missing/unsafe replicas, asChild/render, native props and custom slots.
   Callback logs should describe only real lifecycle or pause requests and clear
   through the shared log action. Restore defaults before the following steps.

1. Start/stop using a named persistent button. Hover and leave after manual pause:
   the user choice must persist. Focus an original link: it stops and becomes
   visible in stationary native overflow. Tab away does not change user pause.
2. Enable reduced motion; originals remain accessible without copies. Check a
   screen reader does not repeat each partner/story or announce every iteration.
3. Check all four directions, RTL and reverse; inspect the wrap boundary for a
   continuous sequence, not a blank flash or backwards jump.
4. Complete/restart a finite run. Exactly three iterations per run are logged.
   Resize and update content; no stale geometry or duplicated completion callbacks.
5. Show Hidden, then resize it. Unsafe and missing replicas remain stationary.
6. Inspect actual 200/400% zoom, touch scrolling, document visibility, forced
   colors and browser motion preferences on physical devices.

Normal-motion automated browser tests are separate evidence, not manual passes.
