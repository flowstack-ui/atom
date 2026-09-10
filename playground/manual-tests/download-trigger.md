# DownloadTrigger manual protocol

Route: `/__tests/download-trigger`. Public part: `Root`.

Environment: browser, operating system, physical device, viewport, zoom and
assistive technology not yet recorded. Overall result: blocked, not performed.

1. Activate text and binary buttons with Enter, Space and pointer. Verify the
   filenames and bytes; focus stays on the trigger and no navigation occurs.
2. Activate Prepare download repeatedly. Observe one producer call and
   `aria-busy="true"` while pending, followed by one browser handoff.
3. Activate Fail download twice. Observe recoverable `data-state="error"` and
   two error callbacks. Prevent download must not create a download.
4. Reload, prepare, then unmount. Repeat with Disable producer. Neither may
   hand off the pending result. Disabled remains unavailable.
5. Inspect native `button`, `type="button"`, `data-slot="download-trigger"`,
   accessible name and focus. Check localized names at actual 200%/400% zoom.
6. Qualify custom render host, custom data-slot and data-prop-check in a local
   scenario before marking those workbook rows covered.
7. Test physical Safari/iOS save policy and assistive-technology announcements.
   A callback reports browser handoff, never proof of a completed disk save.

Workbook rows remain partial until the complete independent manual run passes.
