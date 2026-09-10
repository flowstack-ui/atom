# FloatingPanel

Headless movable/resizable nonmodal tools. Import `FloatingPanel` and
`useFloatingPanel` from `@flowstack-ui/atom/floating-panel`.

```tsx
<FloatingPanel.Root defaultSize={{ width: 320, height: 240 }}>
  <FloatingPanel.Trigger>Open inspector</FloatingPanel.Trigger>
  <FloatingPanel.Portal>
    <FloatingPanel.Positioner>
      <FloatingPanel.Content>
        <FloatingPanel.Header>
          <FloatingPanel.DragTrigger><FloatingPanel.Title>Inspector</FloatingPanel.Title></FloatingPanel.DragTrigger>
          <FloatingPanel.Control><FloatingPanel.CloseTrigger>Close</FloatingPanel.CloseTrigger></FloatingPanel.Control>
        </FloatingPanel.Header>
        <FloatingPanel.Body>Tool content</FloatingPanel.Body>
        <FloatingPanel.ResizeTriggers />
      </FloatingPanel.Content>
    </FloatingPanel.Positioner>
  </FloatingPanel.Portal>
</FloatingPanel.Root>
```

## Anatomy

Positioner owns runtime border-box geometry. Atom supplies no paint. Use public
data attributes and your design system for surfaces, handles and controls.
Keep handles outside any inner clipped paint surface. No backdrop or focus trap
is added. RootProvider accepts the controller returned by useFloatingPanel,
not an independent configuration object.

## Accessibility

Arrow keys on the focused panel/drag host move by gridSize (default 1); Shift
multiplies by ten. Control/Command plus arrows resizes. Physical resize handles
support arrows. Pointer Shift locks aspect ratio and Alt resizes about center.
Escape cancels a manipulation before optional closeOnEscape. Provide buttons
and numeric fields calling setPosition/setSize as non-drag alternatives.

## API Reference

Root and `useFloatingPanel` accept the same options. `RootProvider` accepts
`value={controller}`; `Context` and `useFloatingPanelContext` read that controller.

| Options | Default / meaning |
| --- | --- |
| `open`, `defaultOpen`, `onOpenChange` | Uncontrolled closed; controlled state is authoritative. |
| `position`, `defaultPosition` | Physical x/y CSS pixels; otherwise initially centered. |
| `size`, `defaultSize` | Border box, 320 × 240 CSS pixels. |
| `minSize`, `maxSize` | Optional positive width/height constraints; no visual minima in Atom. |
| `draggable`, `resizable`, `disabled` | true, true, false. |
| `gridSize`, `scale`, `lockAspectRatio` | 1, 1, false. |
| `strategy`, `allowOverflow`, `persistRect` | fixed, true, false. |
| `getBoundaryEl`, `getAnchorPosition` | Optional element boundary and initial physical position resolver. |
| `closeOnEscape`, `restoreFocus` | false, true. |
| `initialFocus`, `finalFocus` | Element ref, resolver or false; panel/opener fallback. |
| `lazyMount`, `unmountOnExit` | Both true; set unmountOnExit=false to retain state or suspend using Activity. |
| `present`, `immediate`, `skipAnimationOnMount` | Optional presentation override, false, false. |
| `hideMode`, `onExitComplete` | display-none; optional completion after presentation exits. |
| `id`, `ids`, `dir`, `translations` | Optional stable anatomy identifiers, direction and action labels. |

`onPositionChange`, `onPositionChangeEnd`, `onSizeChange`, and `onSizeChangeEnd`
receive geometry plus `{reason}`. `onStageChange` receives default, minimized or
maximized. The controller exposes open/position/size/stage/dragging/resizing/topmost
and setOpen/setPosition/setSize/minimize/maximize/restore/bringToFront.
StageTrigger requires stage; ResizeTrigger requires a physical axis; ResizeTriggers
accepts an optional axes list. All rendered parts support native props, ref,
asChild/render and data-slot. Portal accepts container/disabled. No CSS ships.

## Geometry and lifetime

Minimize hides Body and measures Header; maximize fills the boundary; restore
returns to the constrained saved normal rectangle. Controlled position/size
emit proposals; completion reports accepted values. persistRect is opt-in.
Closing preserves the rendered rectangle and stage throughout the exit. Reset
occurs after content becomes hidden, or before a close interrupted by reopening
is displayed again; retained presentation does not jump to its initial position.
getBoundaryEl constrains resize; allowOverflow=false also constrains movement.
Absolute strategy subtracts containing-block border/offset and includes scroll;
scale supports positive uniform scaling only. Coordinates are physical in RTL.

Lifecycle supports lazyMount, unmountOnExit and onExitComplete. Activity hiding
requires a runtime exposing React Activity (19.2+); earlier versions must use
display-none. See generated exact-version API metadata for all native part props.

## Data Attributes

Parts expose data-slot, data-state, data-stage, data-topmost, data-disabled,
data-dragging and data-resizing. ResizeTrigger exposes data-axis. Positioner
reports data-constrained when the available boundary is smaller than minima.
Content data-presence describes presentation independently from disclosure.
