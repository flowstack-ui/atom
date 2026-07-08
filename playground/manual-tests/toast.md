# Toast Manual Test Protocol

## Step 0: Playground Smoke Check

Setup

Toast scenario selected. Default toolbar state.

Action

Load the playground and open Toast from the top menu.

Verify

□ Scenario title shows `Toast`  
□ Workbench order is `Anatomy`, `Canvas`, then `Inspector`  
□ Anatomy renders `Provider`, `Root`, `Title`, `Description`, `Action`, `Cancel`, `Close`, `Viewport`, announcers, and `Store` evidence  
□ Canvas toolbar shows `Rendering`, `State`, `Provider`, `Message`, `Position`, `Composition`, and `Props`  
□ Canvas renders `Show Toast`, `Dismiss All`, and the toast count  
□ Click `Show Toast`; a toast appears and the count changes to `1 toast`  
□ Canvas Source opens and shows `Toast.Provider` and `Toast.Viewport` JSX  
□ Inspector shows `Selected`, `Focused`, and `Logs` tabs  
□ `Collapse All`, `Focus Canvas`, and `Clear` controls respond without errors

Reset

Click `Dismiss All`.

## Step 1: Feature-Wide State

Setup

Default toolbar state. Props off. Rendering `Imperative`. Duration `Infinite`.

Action

Click `Show Toast` three times.

Verify

□ Store count increases  
□ Visible toasts render through `Toast.Viewport`  
□ Root Data includes `data-state` and `data-type`  
□ Logs include `toast default`

Action

Set `Max Visible: 1`, then click `Show Toast` twice.

Verify

□ Store count can exceed one  
□ Only one toast is visible in the viewport  
□ Root Data includes `data-index`

Action

Switch each `Type` value and click `Show Toast`.

Verify

□ Already visible toasts keep their original `data-type`  
□ Default, success, info, and loading roots use `role="status"` and `aria-live="polite"`  
□ Warning and error roots use `role="alert"` and `aria-live="assertive"`  
□ Root Data includes the matching `data-type`

Action

Set `Rendering: Declarative`.

Verify

□ Existing imperative toasts remain unchanged  
□ Canvas shows `Show Declarative` and `Hide Declarative`  
□ Declarative Root is not mounted until `Show Declarative` is clicked
□ Store count is not shown for declarative Root

Action

Click `Show Declarative`.

Verify

□ Root renders in the Canvas stage  
□ Title, Description, Action, Cancel, and Close render inside Root  
□ Declarative rendering does not create a store toast

Reset

Set `Rendering: Imperative`, `Max Visible: 3`, `Type: Default`, then click `Dismiss All`.

## Step 2: Provider

Setup

Default toolbar state. Rendering `Imperative`.

Action

Open Anatomy `Provider`.

Verify

□ `Max visible` is `3`  
□ `Close button` is `yes`  
□ `Expand on hover` is `yes`  
□ `Pause on hover` is `yes`  
□ `Pause on focus loss` is `yes`  
□ Provider is verified as state/context evidence, not as a DOM tag

Action

Toggle `Close button`, `Expand on hover`, `Pause on hover`, and `Pause on focus loss`.

Verify

□ Provider rows update to match each toolbar value  
□ Close button disappears when `Close button` is off  
□ Close button returns when `Close button` is on

Reset

Restore Provider defaults.

## Step 3: Root

Setup

Rendering `Imperative`. Click `Show Toast`. Root composition `Default`. Props off.

Action

Open Anatomy `Root`.

Verify

□ Attributes tag is `div`  
□ Data includes `data-slot="toast"`  
□ Data includes `data-state`  
□ Data includes `data-type="default"`  
□ ARIA includes `aria-atomic="true"`  
□ ARIA includes `role="status"` and `aria-live="polite"`  
□ Ref row is `div`

Action

Set `Composition > Root: As Child`, then click `Dismiss All` and `Show Toast`.

Verify

□ Attributes tag is `section`  
□ Data still includes `data-slot="toast"`  
□ Child content is not double nested

Action

Set `Composition > Root: Render`, then click `Dismiss All` and `Show Toast`.

Verify

□ Attributes tag is `section`  
□ Data still includes `data-slot="toast"`  
□ Toast dismiss behavior still works

Action

Turn on `Props > Prop Check` and `Props > Root`.

Verify

□ Root Data includes `data-prop-check="root"`  
□ Root Data includes `data-slot="toast-custom"`

Action

Set `State > Root > Dismissible` off, then click `Dismiss All` and `Show Toast`.

Verify

□ Close is not rendered  
□ Anatomy `Close` summary is `not rendered`  
□ Root still renders Title and Description

Action

Set `Message > Duration: Short`. Set `State > Root > Paused` on. Click `Dismiss All` and `Show Toast`, then wait longer than 3500ms.

Verify

□ Toast remains visible while `Paused` is on  
□ Turning `Paused` off lets the toast auto-close

Action

Set `Rendering: Declarative`. Click `Show Declarative`. Set `State > Root > Force mount` on, then click `Close`.

Verify

□ Declarative Root remains mounted but appears visually dismissed after close  
□ Root Data changes to `data-state="exiting"` during dismissal  
□ Root remains inspectable while force-mounted

Reset

Props off. Root composition `Default`. `Dismissible` on. `Paused` off. `Force mount` off. `Duration: Infinite`. `Rendering: Imperative`. Click `Dismiss All`.

## Step 4: Title

Setup

Rendering `Imperative`. Action buttons on. Click `Show Toast`. Title composition `Default`. Props off.

Action

Open Anatomy `Title`.

Verify

□ Attributes tag is `p`  
□ Text is `Default toast`  
□ Data includes `data-slot="toast-title"`  
□ Ref row is `p`

Action

Set `Composition > Title: As Child`, then `Render`.

Verify

□ As Child tag is `h3` with `data-slot="toast-title"`  
□ Render tag is `h3` with `data-slot="toast-title"`  
□ Title text remains visible

Action

Turn on `Props > Prop Check` and `Props > Title`.

Verify

□ Title Data includes `data-prop-check="title"`  
□ Title Data includes `data-slot="toast-title-custom"`

Reset

Props off. Title composition `Default`.

## Step 5: Description

Setup

Toast visible. Description composition `Default`. Props off.

Action

Open Anatomy `Description`.

Verify

□ Attributes tag is `p`  
□ Text is `Playground notification body.`  
□ Data includes `data-slot="toast-description"`  
□ Ref row is `p`

Action

Set `Composition > Description: As Child`, then `Render`.

Verify

□ As Child tag is `p` with `data-slot="toast-description"`  
□ Render tag is `p` with `data-slot="toast-description"`  
□ Description text remains visible

Action

Turn on `Props > Prop Check` and `Props > Description`.

Verify

□ Description Data includes `data-prop-check="description"`  
□ Description Data includes `data-slot="toast-description-custom"`

Reset

Props off. Description composition `Default`.

## Step 6: Action

Setup

Toast visible. Action buttons on. Action composition `Default`. Props off.

Action

Open Anatomy `Action`.

Verify

□ Attributes tag is `button`  
□ Attributes include `type="button"`  
□ ARIA includes `aria-label="Undo change"`  
□ Data includes `data-slot="toast-action"`  
□ Ref row is `button`

Action

Click `Undo`.

Verify

□ Toast dismisses  
□ Logs include `toast action`

Action

Show a toast. Set `Composition > Action: As Child`, then `Render`.

Verify

□ Each mode keeps tag `button`  
□ Data still includes `data-slot="toast-action"`  
□ Clicking Action still dismisses the toast

Action

Turn on `Props > Prop Check` and `Props > Action`.

Verify

□ Action Data includes `data-prop-check="action"`  
□ Action Data includes `data-slot="toast-action-custom"`

Reset

Props off. Action composition `Default`. Show a toast.

## Step 7: Cancel

Setup

Toast visible. Action buttons on. Cancel composition `Default`. Props off.

Action

Open Anatomy `Cancel`.

Verify

□ Attributes tag is `button`  
□ Attributes include `type="button"`  
□ ARIA includes `aria-label="Dismiss undo"`  
□ Data includes `data-slot="toast-cancel"`  
□ Ref row is `button`

Action

Click `Dismiss`.

Verify

□ Toast dismisses  
□ Logs include `toast cancel`

Action

Show a toast. Set `Composition > Cancel: As Child`, then `Render`.

Verify

□ Each mode keeps tag `button`  
□ Data still includes `data-slot="toast-cancel"`  
□ Clicking Cancel still dismisses the toast

Action

Turn on `Props > Prop Check` and `Props > Cancel`.

Verify

□ Cancel Data includes `data-prop-check="cancel"`  
□ Cancel Data includes `data-slot="toast-cancel-custom"`

Reset

Props off. Cancel composition `Default`. Show a toast.

## Step 8: Close

Setup

Toast visible. Close button on. Close composition `Default`. Props off.

Action

Open Anatomy `Close`.

Verify

□ Attributes tag is `button`  
□ Attributes include `type="button"`  
□ ARIA includes `aria-label="Dismiss notification"`  
□ Data includes `data-slot="toast-close"`  
□ Ref row is `button`

Action

Click `Close`.

Verify

□ Toast dismisses  
□ Logs include `toast dismissed`

Action

Show a toast. Set `Composition > Close: As Child`, then `Render`.

Verify

□ Each mode keeps tag `button`  
□ Data still includes `data-slot="toast-close"`  
□ Clicking Close still dismisses the toast

Action

Turn on `Props > Prop Check` and `Props > Close`.

Verify

□ Close Data includes `data-prop-check="close"`  
□ Close Data includes `data-slot="toast-close-custom"`

Reset

Props off. Close composition `Default`. Show a toast.

## Step 9: Viewport

Setup

Toast visible. Viewport composition `Default`. Portal `Body`. Props off.

Action

Open Anatomy `Viewport`.

Verify

□ Attributes tag is `div`  
□ Data includes `data-slot="toast-viewport"`  
□ Data includes `data-position="bottom-right"`  
□ Ref row is `div`

Action

Set each `Position > Viewport` value.

Verify

□ Viewport Data updates to the matching `data-position`  
□ Toast stack remains visible

Action

Set `Composition > Viewport: As Child`.

Verify

□ Attributes tag is `section`  
□ Data still includes `data-slot="toast-viewport"`  
□ Generated toasts still render inside the cloned child viewport element

Action

Set `Composition > Viewport: Render`.

Verify

□ Attributes tag is `section`  
□ Data still includes `data-slot="toast-viewport"`  
□ Toasts still render inside Viewport

Action

Turn on `Props > Prop Check` and `Props > Viewport`.

Verify

□ Viewport Data includes `data-prop-check="viewport"`  
□ Viewport Data includes `data-slot="toast-viewport-custom"`

Reset

Props off. Viewport composition `Default`. Position `bottom-right`.

## Step 10: Source

Setup

Default toolbar state. Canvas Source tab open.

Action

Change Rendering, Type, Position, Provider, Composition, and Props controls one at a time.

Verify

□ Source updates when `Rendering` changes between imperative and declarative  
□ Source omits default props when toolbar values are default  
□ Source shows `Toast.Provider` props only when provider values differ from defaults or close button is enabled  
□ Source shows Root props for `dismissible={false}`, `paused`, `closeButton`, `forceMount`, duration, and type when those toggles apply  
□ Source shows toast options for type, duration, action, cancel, and dismissible when imperative toasts are created  
□ Source keeps toast options in `handleShowToast`, not as button props  
□ Source shows `Toast.Viewport` position and portal props only when they differ from defaults  
□ Source shows Action and Cancel only when action buttons are enabled  
□ Source shows active `data-prop-check` values only when Prop Check is on  
□ Source shows active custom `data-slot` values only when slot toggles are on  
□ Source omits playground-only selectors, refs, logs, and CSS classes

Reset

Return to default toolbar state.

## Step 11: Inspector / Logs

Setup

Canvas tab open. Default toolbar state. Click `Dismiss All`, then `Show Toast`.

Action

Click Root, Title, Description, Action, Cancel, Close, and Viewport.

Verify

□ Selected Inspector updates for each clicked part  
□ Selected Inspector shows Attributes, ARIA, and Data groups where applicable  
□ Focused Inspector updates when buttons receive focus  
□ Logs include toast creation, action, cancel, dismiss, and auto-close events as applicable  
□ `Clear` clears log rows without changing component state

Reset

Click `Dismiss All`.

## Step 12: Nested / Portal / Focus Behavior

Setup

Rendering `Imperative`. Duration `Short`. Portal `Body`.

Action

Click `Show Toast`, then set Portal to `Local`, then `Disabled`.

Verify

□ Body portal renders outside the Canvas stage  
□ Local portal renders inside the stage container  
□ Disabled portal renders in place  
□ Viewport remains inspectable in each portal mode

Action

Show a toast. Keyboard Tab to Action, Cancel, and Close.

Verify

□ Focused Inspector tracks the focused button  
□ Enter or Space activates the focused button  
□ Dismissal does not trap focus or leave an unusable focused element

Action

Click `Show Toast` three times so multiple toasts are visible. Hover the visible toast/viewport area while `Expand on hover` is on.

Verify

□ Toast stack changes from a compact card deck to an open spaced stack while hovered  
□ Anatomy `Viewport` shows `Expanded: yes` while hovered  
□ Anatomy `Root` shows `Expanded: yes` for visible roots while hovered

Action

With `Duration: Short` and `Pause on hover` on, show a toast and hover the visible toast/viewport area.

Verify

□ Store evidence shows `Paused` greater than `0` while hovered  
□ Toast remains visible while paused  
□ Toast auto-closes after pointer leaves  
□ Logs include auto-close evidence

Action

Show a short-duration toast. Before it times out, switch focus away from the browser/playground window, wait longer than 3500ms, then return focus.

Verify

□ Toast remains visible while browser focus is away  
□ Toast resumes and auto-closes after focus returns  
□ Turning `Pause on focus loss` off lets short-duration toasts auto-close without waiting for focus return

Reset

Duration `Infinite`. Portal `Body`. Ensure `Expand on hover`, `Pause on hover`, and `Pause on focus loss` are on. Click `Dismiss All`.

## Step 13: Workbook Cleanup / Rewrite Notes

□ Do not update `component-coverage.xlsx` until every protocol step passes  
□ Provider DOM identity, prop pass-through, and ref rows appear stale because Provider renders context only  
□ Viewport `asChild` is now playground-verifiable because package commit `920829c` fixed generated content preservation  
□ Overlay-style rows for Escape, outside click dismissal, nested overlays, and focus return appear stale for Toast  
□ Mobile/touch behavior may need a separate browser-device pass before workbook completion
