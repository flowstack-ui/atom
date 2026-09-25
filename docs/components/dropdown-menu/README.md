# DropdownMenu

Headless button-triggered menu primitives for actions and compact choices.

## When to Use

Use DropdownMenu when a visible button opens a short set of commands or menu
choices. Use ContextMenu when actions belong to a right-clicked target, Select
when one value is chosen for a form, and Menubar for persistent application
commands. Do not use a menu as ordinary site navigation when native links in a
NavList are sufficient.

Submenus use an explicit cascade that is operable by tap/click and keyboard.
Atom does not infer a drill-in presentation from screen size or pointer type.
Applications that need a mobile drill-in flow should compose a separate panel,
Dialog, Drawer, or grouped list with explicit depth and back controls.

## Features

- Supports controlled state, modal behavior, looping, and dismissal options.
- Pointer opening focuses Content; keyboard opening focuses the first/last item.
- Includes actions, checkbox/radio choices, groups, separators, and submenus.
- Provides typeahead, focus restoration, collision-aware positioning, and RTL submenus.
- Registers portalled content with parent modal focus scopes.

## Import

```tsx
import { DropdownMenu } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger />
  <DropdownMenu.Portal>
  <DropdownMenu.Content>
    <DropdownMenu.Arrow />
    <DropdownMenu.Group>
      <DropdownMenu.Label />
      <DropdownMenu.Item />
      <DropdownMenu.CheckboxItem><DropdownMenu.ItemIndicator /></DropdownMenu.CheckboxItem>
      <DropdownMenu.RadioGroup>
        <DropdownMenu.RadioItem />
      </DropdownMenu.RadioGroup>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger />
      <DropdownMenu.SubContent>
        <DropdownMenu.Item />
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

## API Reference

### Root

Owns shared menu state and renders no wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |
| `modal` | `boolean` | `true` |
| `closeOnSelect` | `boolean` | `true` |
| `loop` | `boolean` | `true` |
| `closeOnEscape` | `boolean` | `true` |

### Trigger

Renders a native button by default. Click/tap, Enter, Space, and ArrowDown open
with focus on the first item; ArrowUp opens with focus on the last.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for custom elements |
| `aria-haspopup` | `"menu"` |
| `aria-expanded` | Open state |
| `aria-controls` | Generated Content ID |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"dropdown-menu-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Content

Renders the portalled vertical menu, positions it against Trigger, manages real
item focus/typeahead, and applies reason-aware final focus.
The resolved explicit, Trigger, or provider direction is preserved on the
portalled Content and nested SubContent DOM.

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` |
| `align` | `"start" \| "center" \| "end"` | `"start"` |
| `sideOffset` | `number` | `4` |
| `loop` | `boolean` | Root `loop` |
| `ariaLabel` | `string` | - |
| `onKeyDownCapture` | `KeyboardEventHandler` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menu"` |
| `aria-orientation` | `"vertical"` |
| `aria-label` | Value from `ariaLabel` |
| `aria-labelledby` | Trigger ID when `ariaLabel` is absent |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | Resolved side |
| `[data-align]` | Resolved alignment |
| `[data-positioned]` | Present after positioning |

### Group

Renders a semantic group for related entries.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-group"` |

### Item

Represents one command. `textValue` supplies typeahead text when children are
not a plain string.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `textValue` | `string` | Text child or value |
| `onSelect` | `(event: MenuSelectionEvent) => void` | - |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | Root setting |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menuitem"` |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-value]` | Item value |

### CheckboxItem

Represents an independent menu choice and stays open by default.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `textValue` | `string` | Text child or value |
| `checked` | `boolean \| "indeterminate"` | `false` |
| `onCheckedChange` | `(checked: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menuitemcheckbox"` |
| `aria-checked` | Checked state |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-checkbox-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-checked]` | Present when checked |
| `[data-value]` | Item value |

### RadioGroup

Provides one controlled value to nested RadioItems.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `onValueChange` | `(value: string) => void` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-radio-group"` |

### RadioItem

Represents one mutually exclusive choice and stays open by default.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `textValue` | `string` | Text child or value |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menuitemradio"` |
| `aria-checked` | Whether its value matches RadioGroup |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-radio-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-checked]` | Present when selected |
| `[data-value]` | Item value |

### Separator

Creates a semantic horizontal boundary between entry groups.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"separator"` |
| `aria-orientation` | `"horizontal"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-separator"` |

### Sub

Owns controlled or uncontrolled state for one nested menu and renders no DOM.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |

### SubTrigger

Renders a menu item that opens SubContent after intentional mouse movement and
a hover delay, by click, or with the direction-aware submenu key. Merely
positioning a menu beneath a stationary pointer does not open the submenu.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `textValue` | `string` | Text child or value |
| `disabled` | `boolean` | `false` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menuitem"` |
| `aria-haspopup` | `"menu"` |
| `aria-expanded` | Sub open state |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-sub-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-value]` | Trigger value |

### SubContent

Renders a separately portalled nested menu and mirrors placement and open/close
keys in RTL.

| Prop | Type | Default |
| --- | --- | --- |
| `sideOffset` | `number` | `4` |
| `loop` | `boolean` | `true` |
| `ariaLabel` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"menu"` |
| `aria-orientation` | `"vertical"` |
| `aria-label` | Value from `ariaLabel` |
| `aria-labelledby` | SubTrigger ID when unlabeled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-sub-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | Resolved side |
| `[data-positioned]` | Present after positioning |

The entry point also exports shared Menu context hooks for advanced custom
parts. Prefer the namespaced parts for the complete behavior above.

`Portal`, `Arrow`, `Label`, and `ItemIndicator` use the shared Menu contract.
All retained DOM parts accept refs, native props, `asChild`, and `render`.
Content and SubContent expose the `--atom-menu-available-*`,
`--atom-menu-trigger-*`, and `--atom-menu-transform-origin` variables.

### RootProvider

Use `useDropdownMenu(options)` with
`DropdownMenu.RootProvider value={controller}`.
Pass the unchanged controller; do not spread or recreate it. Hook options
match Root behavior options without children. The controller exposes
`open`, `highlightedValue`, `triggerValue`, `setOpen`,
`setHighlightedValue`, `setTriggerValue`, `setAnchorPoint` and
`reposition`. Root and RootProvider are alternative state owners.

### Context

The namespaced `Context` accepts a render-function child receiving public
menu state; `useMenuState()` reads the same state beneath the root.
DropdownMenu and ContextMenu Trigger accept `value` (default
`"default"`); assign unique values when one menu serves multiple targets.
The active trigger supplies the anchor, accessible relationship and focus
return. Pointer invocation focuses the container; keyboard invocation enters
the first/last item. An explicitly supplied highlight remains authoritative.

### Shared menu state and events

Root (Menubar: the Menu part) accepts these additional behavior options.
Menubar remains non-modal; its Root coordinates the active top-level menu.

| Prop | Type | Default |
| --- | --- | --- |
| `highlightedValue` | `MenuHighlightTarget` | uncontrolled |
| `defaultHighlightedValue` | `MenuHighlightTarget` | `null` |
| `onHighlightChange` | `({ highlightedValue }) => void` | - |
| `typeahead` | `boolean` | `true` |
| `onSelect` | `(event: MenuSelectionEvent) => void` | - |
| `navigate` | `(details: MenuNavigateDetails) => void` | native navigation |
| `positioning` | `MenuPositioningOptions` | inherited geometry defaults |
| `triggerValue` | `string` | uncontrolled |
| `defaultTriggerValue` | `string` | - |
| `onTriggerValueChange` | `(value: string \| undefined) => void` | - |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | - |
| `onPointerDownOutside` | `(event: OutsideInteractionEvent) => void` | - |
| `onFocusOutside` | `(event: FocusEvent) => void` | - |
| `onInteractOutside` | `(event: OutsideInteractionEvent \| FocusEvent) => void` | - |
| `onRequestDismiss` | `(event: Event) => void` | - |
| `persistentElements` | `Array<() => HTMLElement \| null>` | - |

A highlight target is a unique string, `null`, or
`{ value, groupId }`. For repeated radio values, assign a stable native
`id` to RadioGroup and use that ID as `groupId`. Controlled highlight is
authoritative: declining an update does not independently move item focus.

Item, CheckboxItem and RadioItem accept `onSelect(event)`. The event exposes
`value`, optional `groupId`, `node`, `originalEvent`,
`defaultPrevented` and `preventDefault()`. Item then root callbacks observe
one transaction before checked/radio state and closing are applied.
Cancelling it prevents those changes. Native `asChild` links preserve
modified clicks, downloads and alternate targets; `navigate` handles only
ordinary router navigation.

### Positioning options

Root geometry is overridden by Content or SubContent `positioning`, then
existing explicit Content `side`, `align` and `sideOffset` shorthand.
Sub may own independent `positioning`. Available fields are:

| Option | Type / responsibility |
| --- | --- |
| `placement` | Floating UI physical side with optional logical start/end |
| `strategy` | `absolute \| fixed` |
| `gutter`, `shift` | Main-axis and cross-axis offsets |
| `offset` | `{ mainAxis?, crossAxis? }` |
| `flip` | Boolean or fallback placement list |
| `slide`, `overlap` | Collision shift policy |
| `boundary` | Element boundary or callback |
| `overflowPadding` | Collision padding |
| `sameWidth`, `fitViewport` | Anchor width and available viewport containment |
| `hideWhenDetached` | Hide when the reference is clipped |
| `listeners` | Boolean or Floating UI auto-update options |
| `animationFrame` | Animation-frame geometry updates |
| `sizeMiddleware` | Available-size middleware policy |
| `arrowPadding` | Arrow collision inset |
| `getAnchorRect`, `getAnchorElement` | Virtual or element anchor |
| `onPositioned` | `({ placed: boolean }) => void` |

Content still owns the native menu element, scrolling, event handlers and
forwarded ref. A non-semantic positioner hosts it and an optional Arrow
outside the scroll clipping region. Preserve the emitted geometry styles.
Portal supports `container` and `disabled` (default false).

### Presence options

Root and Sub accept these fields. Sub inherits the root policy except that
its exit callback is independent.

| Prop | Type | Default |
| --- | --- | --- |
| `lazyMount` | `boolean` | `true` |
| `unmountOnExit` | `boolean` | `true` |
| `present` | `boolean` | follows open |
| `immediate` | `boolean` | `true` |
| `skipAnimationOnMount` | `boolean` | `false` |
| `hideMode` | `display-none \| activity` | `display-none` |
| `onExitComplete` | `() => void` | - |

Closed retained parts are inert and cannot reclaim focus. Activity mode uses
React Activity where available and a hidden retained fallback otherwise.
Default open state is not a change event; Sub initializes `defaultOpen`
after commit and notifies uncontrolled `onOpenChange` for open/close requests.




## Examples

### Project Actions

```tsx
import { DropdownMenu } from "@flowstack-ui/atom";

export function ProjectActions() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
      <DropdownMenu.Content ariaLabel="Project actions">
        <DropdownMenu.Item value="duplicate" onSelect={() => console.log("Duplicate")}>
          Duplicate
        </DropdownMenu.Item>
        <DropdownMenu.Item value="archive" onSelect={() => console.log("Archive")}>
          Archive
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
```

### Persistent View Options

```tsx
import { useState } from "react";
import { DropdownMenu } from "@flowstack-ui/atom";

export function ViewOptions() {
  const [grid, setGrid] = useState(true);
  return (
    <DropdownMenu.Root closeOnSelect={false}>
      <DropdownMenu.Trigger>View</DropdownMenu.Trigger>
      <DropdownMenu.Content ariaLabel="View options">
        <DropdownMenu.CheckboxItem value="grid" checked={grid} onCheckedChange={setGrid}>
          Show grid
        </DropdownMenu.CheckboxItem>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
```

## Accessibility

DropdownMenu follows the
[WAI-ARIA Menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).
Trigger provides the menu popup relationship. Content moves real focus among
all entries; disabled entries are announced but cannot activate. Use visible
Trigger text that describes the menu.

| Key | Description |
| --- | --- |
| `Enter` / `Space` / `ArrowDown` | Opens and focuses the first entry. |
| `ArrowUp` | Opens and focuses the last entry. |
| `ArrowDown` / `ArrowUp` | Moves through entries while open. |
| `Home` / `End` | Moves to the first or last entry. |
| Printable character | Moves by typeahead label. |
| `ArrowRight` | Opens a submenu in LTR; closes it in RTL. |
| `ArrowLeft` | Closes a submenu in LTR; opens it in RTL. |
| `Enter` / `Space` | Activates the highlighted entry. |
| `Escape` | Closes the topmost submenu or menu. |
| `Tab` / `Shift+Tab` | Closes and moves after/before Trigger in document order. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
