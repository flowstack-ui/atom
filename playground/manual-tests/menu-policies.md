# Shared menu policy workbench

Status: implemented fixture; automated checks do not constitute a manual pass.
Run these steps for Menu, DropdownMenu, ContextMenu and Menubar. Then run the
Navigation section. The owning anatomy page links to `/__tests/menu-policies`;
the Owner selector switches between the five public contracts.

## Controllers, highlight and triggering

1. Controller open/close must update the live state output and menu visibility.
2. Enable Controlled highlight and Reject highlight, open, then press ArrowDown.
   Beta remains accepted; proposed changes appear in Event log. Disable rejection
   and repeat: accepted value and real focus change together.
3. Toggle Typeahead and Loop. Printable keys only search when enabled; boundary
   arrows wrap only when Loop is enabled. Disabled items remain non-activating.
4. DropdownMenu: invoke First actions and Second actions separately. The output
   reports the invoking value, Escape returns focus there, and the state-derived
   plus/minus decoration updates without adding a second trigger.
5. ContextMenu: right-click each target, then a different point while open.
   Target identity and position update; default Beta highlight remains honored.
   On physical touch, long press opens once; movement/cancel suppresses opening.
   Long-press delay is not a configurable public prop.
6. Menubar: Controller open selects File; arrow-key roving reaches Edit. Closed
   bars only move focus; Down opens the focused menu. Bar state and File's
   internal highlighted state are independent. Menubar remains non-modal.

## Selection and navigation

1. Enable Reject selection and activate Notifications. Log order is item then
   root; checked state remains false and content remains open. Disable rejection
   and repeat: state changes once. Repeat with Compact/Comfortable radio choices.
2. Activate Local guide link normally: the Navigate hook logs the destination.
   Modified click must retain browser-native new-tab behavior. Router adapters
   use the same preserved native anchor contract, not a nested button.
3. Enable Reject outside and activate outside the content. It stays open. Disable
   and repeat: it closes. Enable Reject Escape and verify Escape remains logged
   but does not close; disabling restores dismissal. Verify real focus return.

## Presence, composition and positioning

1. Enable Retain content, check Notifications, close/reopen: choice persists.
   Closed content is hidden, not tabbable and absent to screen readers. Disable
   retention, close/reopen: internal content state resets after unmount.
2. Toggle Lazy mount before opening; inspect whether inactive content exists.
   Closing logs exit completion. Reopening must never be closed by an old exit.
3. Placement changes move content between bottom-start, right-start and top-end.
   Same width follows the reference; Fit viewport constrains available geometry.
   Without sizing requests, content keeps its authored intrinsic width. Reposition
   requests a new measurement. Test near viewport edges and with zoom.
4. Inline portal retains the caller's host. Default portal uses owner document.
   Enable Default open submenu, open the menu, then close/reopen More: default
   initialization does not notify; user changes each notify once.
5. Follow the scroll geometry fixture link. Scroll root and submenu: arrows stay
   connected outside the clipping scroll owner. Verify explicit color/custom
   properties and real forwarded content refs through the Inspector/devtools.
6. Enable Iframe qualification and repeat controller, keyboard, submenu and return
   focus inside that frame. Content must not escape into the outer document.

## NavigationMenu policies

1. Set independent Open delay/Close delay. Hover opens and Leave closes each use
   their own timer; disable them independently without losing keyboard control.
   Disable Click opens: keyboard activation still works.
2. Controller open/close and Context output agree. ItemIndicator appears only for
   its open item. Reposition remeasures the active viewport.
3. Disable Shared viewport for inline content. Enable Retain content, edit Retained
   draft, close and reopen: value persists and closed content is inaccessible.
4. Toggle Close on link, then activate Guide. It only dismisses when enabled.
   Reject selection/outside prevents select dismissal and focus-out/Escape close
   while retaining native link behavior; the event log identifies the event.
5. Repeat with Iframe qualification, RTL and narrow viewport. Use the main
   NavigationMenu anatomy fixture for nested disclosure, logical alignment,
   ShadowRoot host qualification, every offered ref/asChild/render part, and
   shared viewport collision geometry.

## Human qualification remaining

### Automated retained-exit regression

DropdownMenu's independent Exit actions fixture uses default modal behavior.
With consumer-authored exit motion, open by pointer and press Escape. Focus
must return to Exit actions while the retained closed content remains inert.
This is automated browser evidence, not a screen-reader or device pass.

Run the owning protocol with a screen reader, physical touch/pen devices, and
actual 200%/400% browser zoom. Record real results before marking Tested=yes.
