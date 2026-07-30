# Mobile Readiness Candidate Protocol

Use this protocol only for the final physical-device and assistive-technology
lane. The automated browser lane is recorded separately by the Playwright files
listed below. Do not mark a workbook device record passed from emulation.

## Candidate freeze

Record these values before testing:

- Atom version: `0.20.1`
- Atom commit: record the final tagged commit
- Playground commit: same repository commit as the Atom candidate
- Test date and tester: record with each platform result

## Required devices

| Platform | Device and OS | Browser | Assistive technology |
| --- | --- | --- | --- |
| iOS | Named supported iPhone and exact iOS version | System Safari and exact build | VoiceOver and exact version/build when exposed |
| Android | Named supported Android phone and exact OS version | Current Chrome and exact build | TalkBack and exact version/build |

For every failed or blocked step, record the scenario, orientation, zoom,
keyboard state, reproduction sequence, and whether the same result occurs after
a clean reload.

## Journey 1 — overlays, keyboard, and viewport

Run in portrait and landscape at 100% and 200% page zoom where supported.

1. Open Dialog and modal Popover. Confirm background content cannot be tapped,
   focused, scrolled, or reached by touch exploration while owned modal content
   remains usable.
2. Scroll long modal Dropdown Menu and modal Popover content to both boundaries.
   Confirm the page behind them does not begin scrolling and that closing the
   last modal restores normal page scrolling.
3. Open Combobox, Select, Dropdown Menu, Menu, Popover, Tooltip, Hover Card, and
   a submenu from triggers near each viewport edge. Rotate while open. Confirm
   the trigger or a documented dismissal route remains reachable and content
   does not become stranded outside the visual viewport.
4. Focus editable Combobox and Popover fields so the software keyboard is
   visible. Scroll the page when needed and confirm the active field, options,
   and dismissal route remain reachable. Record any list flip caused by reduced
   space as a pass when the list remains usable.
5. Show an actionable Toast while a lower-page input and the software keyboard
   are active. Apply the documented safe-area/application offset recipe and
   confirm the Toast action remains visible, tappable, and unobscured by browser
   chrome or navigation insets.

## Journey 2 — touch gestures and cancellation

Run inside a vertically scrollable page and repeat after rotation.

1. Tooltip: a quick tap stays closed; a stationary 700 ms long press opens once;
   movement, cancellation, and release never produce a delayed duplicate open.
2. Context Menu: a stationary long press opens once; movement and browser
   cancellation abandon the pending open; ordinary item, checkbox, radio, and
   submenu taps activate exactly once.
3. Slider and Rating: tap and drag across both axes, interrupt with an incoming
   page scroll or browser cancellation, and confirm the value either commits or
   restores according to the component contract without snapping back later.
   Repeat range Slider in LTR and RTL.
4. Swipeable Item: vertical motion scrolls the page; intentional horizontal
   motion reveals the logical action side; cancellation clears dragging and
   restores the pre-gesture state; Escape and action activation close cleanly.

## Journey 3 — focus and assistive technology

Run once with VoiceOver and once with TalkBack.

1. Explore Dialog, modal Popover, Select, Combobox, Menu, Dropdown Menu, and
   Context Menu by touch. Confirm names, roles, states, and current selection are
   announced and modal background content is unavailable where promised.
2. Open, select, dismiss, and reopen each overlay. Confirm focus enters a useful
   target, stays within modal ownership, returns to the expected trigger or
   destination, and never disappears behind the keyboard.
3. Operate Tooltip, Slider, Rating, and Swipeable Item through the platform
   screen-reader gestures. Confirm every value/action is reachable without
   requiring an unannounced raw drag.
4. With the keyboard visible, activate a Toast action and confirm the action is
   announced, reachable, and does not move focus unexpectedly.

## Automated evidence already required

- `test/browser/modal-containment.spec.ts`
- `test/browser/modal-containment.mobile.spec.ts`
- `test/browser/outside-interaction.spec.ts`
- `test/browser/outside-interaction.mobile.spec.ts`
- `test/browser/positioned-overlays.spec.ts`
- `test/browser/positioned-overlays.mobile.spec.ts`
- `test/browser/toast-placement.mobile.spec.ts`
- `test/browser/mobile-gesture-consolidation.mobile.spec.ts`
- `test/browser/swipeable-item.spec.ts`

The candidate is ready for release only when the complete package/browser/
archive/consumer gates pass. The project is fully mobile-qualified only after
both required physical-device rows are recorded; an unavailable device remains
`not run`, never an automated pass.
