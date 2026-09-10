# Floating overlays manual qualification

Status: unperformed. Automated results are separate evidence, not a human pass.

Record browser/version, OS, viewport, real zoom, input device and assistive
technology. Use pass/fail/blocked/not applicable per check and explain failures.
Routes: `/__tests/floating-panel` and `/__tests/overlay-manager`.

## FloatingPanel

1. Open Inspector. Verify its accessible name and description, initial focus,
   nonmodal tab traversal and trigger focus return.
2. Move using arrows, Shift+arrows and drag. Resize every edge/corner; Ctrl/Meta
   arrows resize without dragging. Confirm completion values match the rectangle.
3. Cancel a gesture with Escape, lost capture and window blur. Toggle disabled
   and controlled rejection during manipulation. No stuck pointer or lost draft.
4. Minimize from the body. Focus must remain reachable and hidden body controls
   leave tab order. Maximize and restore must recover the normal rectangle.
5. Inspect native-composition refs and hosts. Exercise the real button children,
   custom sections, consumer data attributes and authored action labels.
6. Retained and Activity cases keep drafts; Activity records effect cleanup and
   restart. The unmounted case resets draft. Presentation suppression must not
   change logical open. Delayed position waits for parent acceptance.
7. Resize the small boundary and scaled boundary; impossible minima must not
   hide controls. Scroll their surrounding region. Check ratio/grid and Alt
   centered resizing, including minimum/maximum constraints.
8. Open the iframe and shadow cases. Keyboard, focus, pointer ownership and
   portal geometry must use their rendering environment.
9. Open nested Popover/Dialog, then test multiple instances and removing an
   opener. Escape and focus follow the eligible top layer, not visual DOM order.
10. Repeat with RTL, forced colors, reduced motion, 200/400% actual zoom, narrow
    and short viewports, physical touch and a virtual keyboard.

## OverlayManager

1. Open managed confirmation; accept and cancel. Result and completed exit
   represent separate events. Close without motion must still finish.
2. Open primary, edit its draft, update props and reopen the same open ID.
   State is preserved; an exiting generation must not remove its replacement.
3. Open primary/secondary, close and await exit, remove one, then remove all.
   Every pending result settles once without leaking instances.
4. Dispose and remount the local host; no pending promises or stale state remain.
5. Confirm the local provider value appears in the authored overlay and run the
   managed Drawer and FloatingPanel examples without changing their semantics.
6. Verify screen-reader naming, initial/return focus, Escape, long content,
   reduced motion and multiple documents; record unavailable cases explicitly.

## Completion

Overall result: unperformed.
Follow-up issues: none recorded by a manual operator yet.
Workbook updated: no manual pass recorded.
