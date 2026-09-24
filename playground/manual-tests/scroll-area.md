# ScrollArea custom behavior manual protocol

Record package/archive identity, browser, OS, device, assistive technology,
reviewer and date. This protocol is not a completed manual run.

Open `/__tests/scroll-area-parity` and the native ScrollArea playground scenario.

1. Scroll both axes with native wheel, trackpad, keyboard and physical touch.
   Viewport focus is opt-in; unnamed areas are not announced as regions.
2. Drag a thumb, leave its bounds, release, cancel and switch windows. Capture
   and dragging state must clear. Track clicks must move without a double jump.
3. Change direction and use Left/Right. Physical edges and thumb position must
   agree in RTL. Nested page scrolling must remain native at area boundaries.
4. Hide/reveal content, shrink it, and remount. Geometry and overflow must recover.
5. Animate then interrupt with wheel, keyboard or touch. No later snap-back is
   allowed. Reduced motion must take the immediate path without stealing focus.
6. Repeat at real 200%/400% zoom and with a screen reader. Custom tracks must not
   become duplicate focus stops. Record unavailable physical/AT checks as blocked.

For each step record pass/fail/blocked, concrete observations and follow-ups.
