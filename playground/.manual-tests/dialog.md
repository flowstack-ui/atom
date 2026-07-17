# Dialog Manual Test Protocol and Qualification Record

Status as of 2026-07-17: partial qualification. The maintainer approved and
passed a focused desktop protocol covering the changed Modal-family behavior,
followed by macOS VoiceOver, iPhone Safari behavioral checks, and iPhone
VoiceOver. Android Chrome and TalkBack are explicitly deferred because no
Android device is available. The coverage-workbook update remains pending. Do
not infer that unexecuted steps below passed, and do not mark workbook rows
tested until the workbook workflow is completed.

| Qualification surface | Result |
| --- | --- |
| Focused desktop behavior | Pass |
| macOS VoiceOver | Pass |
| iPhone Safari behavior | Pass |
| iPhone VoiceOver | Pass |
| Android Chrome and TalkBack | Deferred: no device available |
| Coverage workbook | Pending |

## Step 0: Playground Smoke Check

Setup: start the playground, select `Overlays > Dialog`, and leave every control
at its default.

Action: open Canvas, Source, Anatomy, Selected, Focused, and Logs once.

Verify: the scenario renders without an error; Anatomy lists the eight Dialog
parts plus the Modal Branch integration; Source uses only public Atom parts and
matches the default Title/Description scenario; workbench controls respond.

Reset: return to Canvas and collapse Anatomy.

## Step 1: Feature-Wide State

Setup: uncontrolled, enabled, not keep-mounted, Escape and backdrop dismissal
enabled, default focus, trigger restoration, infrastructure options off.

Action: open with pointer, close with Cancel, open with Enter, close with
Escape, open with Space, and close by Overlay.

Verify: every open moves focus inside; each close reason is logged; retained
Trigger receives final focus; only the open modal owns Escape, focus, scroll,
and background isolation.

Action: enable Controlled and use the external open/close buttons.

Verify: controlled opening and programmatic closing work without a Trigger
transaction; focus returns to the previously focused workflow control.

Action: enable Keep mounted, open, and close.

Verify: closed Content remains mounted in its hidden wrapper and background
inert/scroll-lock state is completely removed.

Reset: uncontrolled, closed, Keep mounted off.

## Step 2: Root and Trigger

Setup: default state, Trigger composition `default`, Props off.

Action: inspect Root and Trigger closed, open, disabled, `asChild`, and `render`.

Verify: Trigger remains the activation target; native button or composed button
semantics, `aria-haspopup`, `aria-expanded`, conditional `aria-controls`,
`data-state`, `data-disabled`, props, slots, and prevented consumer events match
the public contract. Root itself has no invented DOM identity.

Reset: enabled, closed, default Trigger.

## Step 3: Portal, Overlay, and Background Isolation

Setup: set Final focus to `workflow`, then open the body-portalled Dialog.

Action: inspect Portal, Overlay, Content, and the `Workflow target` behind it.

Verify: Overlay and Content are separate body children and remain interactive;
the background target reports effective inertness; pointer and keyboard focus
cannot reach it; body scroll is locked; Overlay dismissal respects its toggle
and consumer `preventDefault`.

Action: while open, mount and remove other background DOM through normal
playground navigation where available.

Verify: newly mounted background subtrees become inert; closing removes only
Atom-managed inert state.

Reset: close the Dialog.

## Step 4: Content Native ARIA and Optional Description

Setup: name mode `title`, Description on.

Action: open and inspect Content, Title, and Description.

Verify: Content has `role="dialog"`, `aria-modal="true"`, generated
`aria-labelledby` matching Title, and generated `aria-describedby` matching
Description.

Action: turn Description off and reopen.

Verify: Description is absent and Content has no dangling
`aria-describedby`.

Action: choose name mode `native` and reopen.

Verify: Content has `aria-label="Project settings"`, no generated
`aria-labelledby`, and Source uses native `aria-label`.

Action: choose `compatibility` and reopen.

Verify: rendered DOM still has `aria-label="Project settings"`; Source shows
the backward-compatible `ariaLabel` prop and labels it as compatibility mode.

Reset: name mode `title`, Description on, closed.

## Step 5: Initial and Final Focus

Setup: normal pointer device, focus modes at defaults.

Action: open with mouse/trackpad.

Verify: the first eligible control receives focus.

Action: test Initial focus values `content`, `name`, and `autoFocus` separately.

Verify: Content, the Name input, and the native-autofocus Name input receive
focus respectively, without scrolling the page unexpectedly.

Action: test Final focus `workflow`, then close through Close, Escape, Overlay,
and controlled closure.

Verify: `Workflow target` receives focus for every route and closing interaction
reasons remain correct.

Action: test Final focus `none`.

Verify: Atom performs no automatic restoration.

Reset: Initial focus `default`, Final focus `trigger`.

## Step 6: Portalled Select and Modal Tab Containment

Setup: open Dialog and then open its Select listbox.

Action: use Arrow keys, Enter/Escape, Tab, and Shift+Tab according to Select's
documented contract.

Verify: the portalled listbox is not inert or scroll-blocked; Select owns its
keyboard behavior; after it closes, Dialog sequencing continues; focus never
escapes to the background.

Reset: close Select and Dialog.

## Step 7: Consumer-Owned Modal Branch

Setup: enable `Third-party branch`, then open Dialog.

Action: inspect and focus `Third-party action`, Tab according to the branch's
delegated contract, and scroll the branch panel.

Verify: Modal Branch is outside Content but not effectively inert; its control
is a valid focus target; scrolling is allowed; background scrolling remains
blocked; unmounting the branch makes its former host/background path inert
again without leaving stale ownership.

Reset: close Dialog and disable Third-party branch.

## Step 8: Nested Modal Ownership and Cleanup

Setup: enable `Nested dialog`, open the parent, then open the child.

Action: press Escape once, test parent Overlay while child is open, close/reopen
the child, then close the parent.

Verify: child is the only active layer; parent is effectively inert and cannot
dismiss; first Escape closes child only; parent regains focus, scroll,
isolation, and dismissal ownership; final close restores background and author
state with no stale inert nodes or listeners.

Reset: both closed, Nested dialog off.

## Step 9: Mobile Device Qualification

Run on current iOS Safari and Android Chrome, in portrait and landscape.

Action: with VoiceOver on iOS and TalkBack on Android, open the Title plus
Description case, the Title-only case, and the native-label case.

Verify: the accessible name is announced once; Description is announced only
when rendered/explicitly related; the Title-only case has no missing-target or
stale-description announcement.

Action: open the default Dialog by touch when Name is the first input.

Verify: Content receives default touch focus and the virtual keyboard does not
open immediately.

Action: choose Initial focus `name` and `autoFocus` separately and open by
touch; rotate while open; show/hide the keyboard; scroll long Content and the
Select/Branch portals; dismiss by touch Overlay and Close.

Verify: explicit input focus opens the keyboard; focus remains contained;
allowed regions scroll without body chaining; viewport/keyboard/orientation
changes do not corrupt focus or scroll restoration; tap dismissal and final
focus work; nested modal cleanup leaves no frozen body or inert background.

Reset: close every layer and confirm the page scroll position and body inline
styles are restored.

## Step 10: Source, Inspector, Logs, and Workbook Notes

Setup: repeat representative native ARIA, focus, branch, and nested states.

Action: compare Canvas, Source, Anatomy, Selected, Focused, and Logs for each.

Verify: Source describes the active consumer JSX; raw ARIA/Data show actual DOM
without fake evidence attributes; Logs contain only real callbacks; the protocol
covers every playground-verifiable Dialog workbook row.

Workbook cleanup notes: add or reopen rows for native label precedence,
optional Description removal, initial/final focus modes, background inertness,
portalled Select behavior, public Modal Branch focus/scroll/isolation, and
nested modal cleanup. Keep every new row untested/partial until Steps 0–9 pass.
