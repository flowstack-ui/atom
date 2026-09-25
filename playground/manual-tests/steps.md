# Steps manual protocol

Route: /__tests/steps. Automated owner: test/browser/steps.spec.ts.

1. Inspect ol/li, unique title IDs, named panels and one aria-current=step.
2. Try forward before validation; no transition. Allow and retry; input survives back.
3. Tab and activate with Enter/Space; disabled controls are skipped.
4. Reach completion once, reset and repeat. No completion on mount.
5. Use controlled next and external reset; preventDefault blocks its fixture.
6. Activate Next inside panel; focus reaches the new panel.
7. Inspect at real 200%/400% zoom and on touch devices.
8. VoiceOver/Safari and NVDA/Firefox: verify list, current stage, panel names and
   hidden content. Test localized completed-state text in a consuming application.

Manual physical-device, browser zoom and assistive-technology results: not run.
