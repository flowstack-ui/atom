# Swipeable Item Manual Test Protocol

Status: **Open — no run recorded**

Route: Controls > Swipeable Item

Record the browser, operating system, device, input method, direction, zoom,
and assistive technology used. Run one numbered step at a time. Do not mark a
physical-device or assistive-technology result from emulation.

1. With the default closed item, drag horizontally a short distance and
   release before the threshold. Confirm Content returns closed and no action
   runs.
2. Drag far enough toward logical start, then end. Confirm only the matching
   panel opens, Content settles to the panel width, and the opposite panel
   remains unavailable.
3. Begin a vertical and then a diagonal touch movement inside Content. Confirm
   the page or containing vertical scroller moves normally and the item does
   not steal the gesture.
4. Interrupt a horizontal drag by leaving/cancelling the gesture where the
   platform permits. Confirm the item returns to its pointer-down state and no
   action runs.
5. Repeat horizontal reveal with mouse/trackpad and physical touch. Confirm the
   foreground follows the pointer without lag and settles once without jumping
   backward.
6. Focus Content. Use ArrowLeft/ArrowRight to reveal and close logical panels,
   then Escape to close. Confirm focus stays predictable and the focus ring is
   visible.
7. Focus a nested text input, Slider, Rating, or other Arrow-key control in
   Content. Use its Arrow keys and confirm Swipeable Item does not open or
   close.
8. Open a panel and Tab through its controls. Confirm the closed panel is not
   reachable, every revealed action has an accessible name and adequate target,
   and clicking an action closes according to `closeOnClick`.
9. Switch to RTL and repeat pointer and keyboard reveal. Confirm logical start
   and end mirror while labels and content direction remain understandable.
10. Enable disabled and read-only separately. Confirm gestures and reveal keys
    do not change state; read-only remains focusable and descendant controls
    keep their own explicit state.
11. On physical iOS Safari, test a drag beginning near each screen edge,
    vertical page scrolling, browser back gestures, rotation, 200% zoom, and
    VoiceOver discovery. Confirm the component does not promise ownership over
    protected browser or screen-reader gestures.
12. On physical Android Chrome, repeat edge, vertical, diagonal, rotation,
    200% zoom, and TalkBack checks. Record any browser navigation or pointer
    cancellation difference.
13. At 400% zoom and narrow width, confirm Content and action labels remain
    reachable without page-level horizontal scrolling.
14. Enable reduced motion and forced colors. Confirm settling becomes immediate
    or restrained, focus and panel boundaries remain visible, and state does
    not depend on color alone.

## Latest run

Not run. Physical iOS Safari, Android Chrome, VoiceOver, and TalkBack remain
open until a named device/environment is recorded.
