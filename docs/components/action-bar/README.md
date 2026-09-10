# ActionBar

Detached contextual actions using existing Atom overlay behavior. Import
`ActionBar` from `@flowstack-ui/atom/action-bar`.

```tsx
<ActionBar.Root open={selected.size > 0} closeOnInteractOutside={false}>
  <ActionBar.Portal>
    <ActionBar.Content aria-label="Selected files">
      <ActionBar.SelectionTrigger onClick={clearSelection}>
        Clear selection
      </ActionBar.SelectionTrigger>
      <button type="button" onClick={archiveSelected}>Archive</button>
    </ActionBar.Content>
  </ActionBar.Portal>
</ActionBar.Root>
```

## Anatomy

The compound parts are `Root`, `RootProvider`, `Portal`, `Positioner`, `Content`,
`SelectionTrigger`, `CloseTrigger`, `Title`, and `Description`.

## API Reference

Root/RootProvider: `open`, `defaultOpen=false`, `onOpenChange(open, reason)`,
`modal=false`, `disabled=false`, `closeOnEscape=true`,
`closeOnInteractOutside=true`, `lazyMount=true`, `unmountOnExit=true`,
`onExitComplete`, `onEscapeKeyDown(event)` and `persistentElements` (element getters).
Escape is preventable. A controlled parent may refuse a request.
RootProvider accepts Root props; it is not an external store instance API.

Content forwards div props/ref, owns dialog role and IDs, accepts native naming,
`initialFocus=false`, `finalFocus`, `onInteractOutside` and `onFocusOutside`.
Focus targets accept refs, resolver functions or false. Outside events support
preventDefault. No positioning props or invisible anchor are needed.

Context children receive `{open, setOpen}`. Portal accepts container/disabled.
Positioner is an optional unstyled div with native props/ref. Use it for a fixed
placement wrapper: it participates in the same layer as Content, receiving the
runtime `--atom-overlay-layer` index rather than establishing an unrelated stack.
Title/Description establish accessible relationships. SelectionTrigger and
CloseTrigger are non-submit buttons and accept native props, refs, asChild/render.
CloseTrigger changes disclosure only; selected records remain app-owned.

All named parts are exported individually with the ActionBar prefix. Types:
ActionBarRootProps, ActionBarContentProps, ActionBarPositionerProps, ActionBarContextValue,
ActionBarCloseTriggerProps and ActionBarSelectionTriggerProps.

## Accessibility

Opening preserves focus by default. Opt into initial focus for a task requiring
it; nonmodal mode never traps focus. Supply an accessible name. Keep selection
regions persistent or turn off outside dismissal when selecting further records.
Retained children are hidden after exit; lazyMount=false plus unmountOnExit=false
mounts them before first open. No React Activity effect suspension is implied.
Rendering is unstyled; position and paint belong to the consumer/Brick.

## Data Attributes

The root and content preserve the underlying popover data attributes, including
`data-state`, `data-part`, and `data-scope`, for inspection and integration.

React 18/19 are supported by existing package policy. SSR performs no interaction.
Use the component's browser protocol for nested modal and focus qualification.
