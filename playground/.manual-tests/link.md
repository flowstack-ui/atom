# Link Manual Test Protocol (Draft)

Status: draft; do not mark workbook rows tested until this protocol is run in
the browser.

## Step 0: Playground Smoke Check

Setup

Open the Link scenario with Composition `Default`, Current Page off, Native
Props on, Prop Check off, and Root Slot off.

Action

Open Anatomy, Canvas, Source, and Inspector.

Verify

□ Canvas shows Primary contract, Native examples, Semantic comparison, and the same-page destination.
□ Anatomy contains only the public `Root` part.
□ Canvas toolbar contains Composition, Native state, and Props.
□ Inspector Selected, Focused, and Logs tabs respond.
□ Source shows one `Link.Root` example matching the active controls.

## Step 1: Feature-Wide Navigation

Setup

Default Link state. Canvas and Logs visible.

Action

Use Tab to focus `Native guide`, then press Enter.

Verify

□ Focus reaches the link in document order with a visible focus indicator.
□ The URL receives `#link-destination` and the destination becomes visible.
□ Logs adds `activated primary link` once.

Action

Return to the scenario and open the native link context menu.

Verify

□ Browser link actions such as opening in a new tab and copying the address are available.

Action

Activate `Run an action`.

Verify

□ Logs adds `activated comparison action` without changing the URL hash.

## Step 2: Root

Setup

Composition `Default`, Current Page off, Native Props on, Prop Check off, and
Root Slot off. Open Anatomy `Root`.

Action

Inspect Root Attributes, ARIA, and Data.

Verify

□ Attributes tag is `a`.
□ Attributes include `href="#link-destination"`, `title="Link playground destination"`, and `rel="help"`.
□ ARIA does not include `role`, `aria-disabled`, or `aria-current`.
□ Attributes do not include `tabindex`.
□ Data includes `data-slot="link"`.
□ Root rows show `Composition: default`, `Ref target: a`, and `Final href: #link-destination`.

Action

Turn Current Page on.

Verify

□ Root ARIA includes `aria-current="page"`.
□ Source includes `aria-current="page"`.

Action

Turn Native Props off.

Verify

□ Root Attributes no longer include `title` or `rel`.
□ The `href` and native link behavior remain.

Action

Turn Prop Check and Root Slot on.

Verify

□ Root Data includes `data-prop-check="root"` and `data-slot="link-custom"`.
□ Source includes both props.

Reset

Turn Current Page, Prop Check, and Root Slot off. Turn Native Props on.

## Step 3: Composition

Setup

Default Link state. Open Anatomy `Root` and Source.

Action

Set Composition to `As Child`.

Verify

□ Root remains one `a` with `href="#link-destination"`.
□ Root Data includes `data-router-adapter="playground"` and `data-slot="link"`.
□ Link text is `Router-composed guide`.
□ Source nests `RouterLink` inside `Link.Root asChild`.

Action

Set Composition to `Render`.

Verify

□ Root remains one `a` with `href="#link-destination"`.
□ Root Data still includes `data-router-adapter="playground"` and `data-slot="link"`.
□ Link text is `Render-composed guide`.
□ Source supplies the router adapter through `render`.

Action

Focus and press Enter on the composed link in each mode.

Verify

□ Each mode navigates once to `#link-destination` and logs one activation.

Reset

Set Composition to `Default`.

## Step 4: Native Examples

Setup

Default Link state. Canvas visible.

Action

Inspect `Current location`.

Verify

□ It is an `a` with `href="#link-destination"` and `aria-current="location"`.

Action

Inspect `External resource`, then open it with the browser context menu.

Verify

□ It is an `a` with `href="https://example.com"`, `target="_blank"`, and `rel="noopener"`.
□ Browser new-tab behavior remains available; Atom adds no external icon or spoken suffix.

## Step 5: Source

Setup

Cycle Default, As Child, and Render composition with Current Page and Native
Props both on.

Action

Inspect Source after each change.

Verify

□ Source reflects only the selected composition.
□ Source includes the active native/current props and no false-prop noise.
□ Every example resolves to navigation with a final destination.

## Step 6: Inspector / Logs

Setup

Default Link state. Clear Logs.

Action

Click the primary link, then inspect Selected, Focused, and Logs.

Verify

□ Selected shows the live anchor Attributes, ARIA, and Data.
□ Focused independently reports the active anchor when it has focus.
□ Logs reports one `activated primary link` entry per activation.

## Workbook Cleanup / Rewrite Notes

- Keep Link rows implemented but untested until every step passes.
- Do not add package-export or server-boundary checks to the workbook; package
  tests own those requirements.
- Promote this file to `manual-tests/link.md` only after browser execution and
  workbook completion.
