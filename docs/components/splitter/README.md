# Splitter

Headless resizing for adjacent panels. Import `{ Splitter }` from
`@flowstack-ui/atom/splitter` or the package root. Requires client interaction;
percentage defaults render deterministically on the server.

```tsx
<Splitter.Root panels={[{ id: "files", minSize: 15 }, { id: "editor", minSize: 30 }]}
  defaultSizes={{ files: 25, editor: 75 }}>
  <Splitter.Panel panelId="files">Files</Splitter.Panel>
  <Splitter.ResizeTrigger before="files" after="editor" aria-label="Files width" />
  <Splitter.Panel panelId="editor">Editor</Splitter.Panel>
</Splitter.Root>
```

## Anatomy

Root contains Panel and ResizeTrigger siblings. Root and Panel are divs; the
trigger is a focusable separator div. Match declared IDs and DOM order.

## API Reference

Root accepts ordered `panels`, `sizes`/`defaultSizes`, `orientation` (horizontal),
`dir` (Direction context), `disabled` (false), `keyboardStep` (10 CSS pixels),
`onResizeStart`, `onResize`, `onResizeEnd`, `onCollapseChange` and native div props.
Native `onResize` is replaced with component resize details. Details contain
percentage `sizes`, measured `pixels` (null before measurement), `source` and
`cancelled`. No resize callbacks on initial mount.

Descriptors contain unique `id`, `minSize` (0), `maxSize` (100), `collapsible`
(false), `collapsedSize` (0), `resizeBehavior` (proportional or preserve-pixels).
Numbers mean percentages; strings explicitly use `%` or `px`. Pixel sizes may
shift after hydration. Uncontrolled preserve-pixels needs a proportional sibling;
controlled applications own adjustments to controlled sizes when the host changes.
Impossible host minima overflow rather than silently compress; Root exposes
`data-insufficient-space`. Applications own scroll/reflow.

Panel requires `panelId`. Its generated ID is owned for separator relationships.
Fully collapsed panels remain mounted but inert and hidden from assistive tech.
Root, Panel and ResizeTrigger support native div refs, `asChild` and `render`;
custom hosts must preserve semantic attributes, styles, events and children.

## Accessibility

ResizeTrigger requires adjacent `before`/`after` IDs and an accessible name.
`disabled` disables that boundary. `valueText(percent, pixels)` supplies localized
ARIA text. Keep children decorative. Arrow keys resize physically (RTL aware),
Shift accelerates, Home/End reach bounds, Enter collapses/restores a collapsible
primary pane. Escape, pointer cancellation, lost capture and window blur cancel
the active drag. Pointer up ends it. Controlled parents may reject any request.

Context's render function exposes `sizes`, `setSizes`, `resetSizes`,
`collapsePanel`, `expandPanel`, `isPanelCollapsed`. App controls are the non-drag
alternative. Storage, panel content, scrolling and visual styling are not owned.
## Data Attributes

Use `data-slot`, `data-state`, `data-orientation` and `data-disabled` for styling.

## Verification

Primary tests: `test/primitives/splitter.test.mjs`. Browser/manual qualification
is tracked separately; rendering ARIA does not certify assistive-technology use.
