# Menubar

Headless horizontal or vertical menubar primitives for application-style menu systems.

## When to Use

Use Menubar for desktop-like application commands grouped under headings such
as File, Edit, and View. Use Menu for one standalone command menu,
NavigationMenu for website navigation, and NavList for a normal list of links.
Menubar is usually unnecessary for a small set of buttons.

## Features

- Renders a `role="menubar"` root with roving top-level trigger focus.
- Supports horizontal and vertical orientation.
- Opens adjacent top-level menus with ArrowLeft and ArrowRight.
- Mirrors horizontal top-level navigation in RTL through `dir` or `Direction.Provider`.
- Provides menu items, checkbox items, radio items, groups, separators, and submenus through the `Menubar` namespace.
- Supports controlled and uncontrolled active top-level menu state.
- Preserves Root and Content behavior through `asChild` and `render`
  composition.
- Supports per-menu `closeOnSelect`, looping, and Escape close behavior.
- Exposes state and styling data attributes without shipping styles.

## Import

```tsx
import { Menubar } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Menubar.Root>
  <Menubar.Menu value="file">
    <Menubar.Trigger />
    <Menubar.Content>
      <Menubar.Arrow />
      <Menubar.Group>
        <Menubar.Label />
        <Menubar.Item />
        <Menubar.CheckboxItem />
        <Menubar.RadioGroup>
          <Menubar.RadioItem />
        </Menubar.RadioGroup>
      </Menubar.Group>
      <Menubar.Separator />
      <Menubar.Sub>
        <Menubar.SubTrigger />
        <Menubar.SubContent>
          <Menubar.Item />
        </Menubar.SubContent>
      </Menubar.Sub>
    </Menubar.Content>
  </Menubar.Menu>
</Menubar.Root>
```

## API Reference

Menubar top-level coordination is implemented by `Menubar.Root`, `Menubar.Menu`,
`Menubar.Trigger`, and `Menubar.Content`. The item, group, separator, and
submenu parts share the same behavior as `Menu`, but are exposed directly on the
`Menubar` namespace so consumers can build a complete menubar without importing
`Menu`.

All DOM-rendering parts also accept their underlying native DOM props except
for props Atom owns, such as managed roles and children.

### Root

Contains the top-level menus and manages the active top-level menu value.
Renders a `div` with `role="menubar"` and the resolved `dir` attribute.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `value` | `string \| null` | - |
| `defaultValue` | `string` | - |
| `onValueChange` | `(value: string \| null) => void` | - |
| `loop` | `boolean` | `true` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `className` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-orientation` | Root orientation |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menubar"` by default |
| `[data-orientation]` | `"horizontal" \| "vertical"` |

### Menu

Provides one top-level menu scope. Each `Menu` value must be unique within the
same `Root`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | required |
| `closeOnSelect` | `boolean` | `true` |
| `loop` | `boolean` | `true` |
| `closeOnEscape` | `boolean` | `true` |

`closeOnSelect` is the default selection behavior for normal menu items inside
that top-level menu. Checkbox and radio items default to staying open unless
their own `closeOnSelect` prop is set.

### Trigger

Opens and closes one top-level menu. `Trigger` renders a native `button` with
`role="menuitem"` so it is a valid child of the `menubar` root. It uses roving
`tabIndex` so only the active top-level trigger is tabbable.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `className` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-haspopup` | `"menu"` |
| `aria-expanded` | `true \| false` |
| `aria-controls` | Associated menu content id |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menubar-trigger"` by default |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |

### Content

Renders the positioned top-level menu surface for a `Menu` as a portalled `div`
with `role="menu"` and `tabIndex={-1}`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` |
| `align` | `"start" \| "center" \| "end"` | `"start"` |
| `sideOffset` | `number` | `4` |
| `loop` | `boolean` | menu value |
| `ariaLabel` | `string` | - |
| `className` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-orientation` | `"vertical"` |
| `aria-label` | From `ariaLabel` |
| `aria-labelledby` | Trigger id when `ariaLabel` is not provided |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-content"` by default |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | Resolved side |
| `[data-align]` | Resolved align |
| `[data-positioned]` | Present after positioning is ready |

### Item

Renders an actionable menu item with `role="menuitem"` and `tabIndex={-1}`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | required |
| `textValue` | `string` | children text or `value` |
| `onSelect` | `(event: MenuSelectionEvent) => void` | - |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | menu value |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `className` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-disabled` | Present when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-item"` by default |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-value]` | Item value |

### CheckboxItem

Renders a `menuitemcheckbox` with `tabIndex={-1}`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | required |
| `textValue` | `string` | children text or `value` |
| `checked` | `boolean \| "indeterminate"` | `false` |
| `onCheckedChange` | `(checked: boolean) => void` | - |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | `false` |
| `className` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-checked` | `true \| false` |
| `aria-disabled` | Present when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-checkbox-item"` by default |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-checked]` | Present when checked |
| `[data-value]` | Item value |

### RadioGroup

Provides radio selection state for `RadioItem`. Renders a `div` with
`role="group"`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | - |
| `onValueChange` | `(value: string) => void` | - |
| `className` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-radio-group"` by default |

Radio item values are scoped to their parent radio group for highlighting and
keyboard movement, so separate groups can reuse values such as `"default"`
inside the same menubar menu.

### RadioItem

Renders a `menuitemradio` with `tabIndex={-1}`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | required |
| `textValue` | `string` | children text or `value` |
| `disabled` | `boolean` | `false` |
| `closeOnSelect` | `boolean` | `false` |
| `className` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-checked` | `true \| false` |
| `aria-disabled` | Present when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-radio-item"` by default |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-checked]` | Present when checked |
| `[data-value]` | Public radio value |

### Group

Groups related menu items. Renders a `div` with `role="group"`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `className` | `string` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-group"` by default |

### Separator

Renders a decorative separator with `role="separator"`.

| Prop | Type | Default |
| --- | --- | --- |
| `className` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-orientation` | `"horizontal"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-separator"` by default |

### Sub

Provides nested submenu state.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |

### SubTrigger

Renders the item that opens a nested submenu with `role="menuitem"` and
`tabIndex={-1}`. Mouse hover opening starts only after the pointer actually
moves over the item, so newly positioned content beneath a stationary pointer
does not open it.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `value` | `string` | required |
| `textValue` | `string` | children text or `value` |
| `disabled` | `boolean` | `false` |
| `className` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-haspopup` | `"menu"` |
| `aria-expanded` | `true \| false` |
| `aria-disabled` | Present when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-sub-trigger"` by default |
| `[data-state]` | `"open" \| "closed"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-value]` | Trigger value |

### SubContent

Renders the positioned nested submenu surface as a portalled `div` with
`role="menu"` and `tabIndex={-1}`.

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | required |
| `sideOffset` | `number` | `4` |
| `loop` | `boolean` | `true` |
| `ariaLabel` | `string` | - |
| `className` | `string` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-orientation` | `"vertical"` |
| `aria-label` | From `ariaLabel` |
| `aria-labelledby` | SubTrigger id when `ariaLabel` is not provided |

| Data attribute | Values |
| --- | --- |
| `[data-menu-sub-content]` | Present |
| `[data-slot]` | `"menu-sub-content"` by default |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | Resolved side |
| `[data-positioned]` | Present after positioning is ready |

Advanced top-level parts can use `useMenubarContext` and
`useMenubarMenuContext`; the matching providers and context value types are
also public exports. Shared item parts use the Menu contexts documented above.

### RootProvider

Use `useMenubar({ value?, defaultValue?, onValueChange? })` with
`Menubar.RootProvider value={controller}`. The controller exposes
`value` and `setValue(value | null)`; the provider retains Root host,
ref, naming and orientation props. It coordinates the bar rather than
creating independent dropdown controllers.

### Context

`Menubar.Context` accepts a render-function child receiving that public
state. `useMenubarState()` reads it beneath the root.

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

### Application Menu

```tsx
import { Menubar } from "@flowstack-ui/atom";

export function ApplicationMenubar() {
  return (
    <Menubar.Root aria-label="Application commands">
      <Menubar.Menu value="file">
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Content ariaLabel="File">
          <Menubar.Item value="new" onSelect={() => console.log("New file")}>
            New
          </Menubar.Item>
          <Menubar.Sub>
            <Menubar.SubTrigger value="export">Export</Menubar.SubTrigger>
            <Menubar.SubContent ariaLabel="Export">
              <Menubar.Item value="pdf">PDF</Menubar.Item>
              <Menubar.Item value="csv">CSV</Menubar.Item>
            </Menubar.SubContent>
          </Menubar.Sub>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu value="edit">
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Content ariaLabel="Edit">
          <Menubar.Item value="undo">Undo</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
```

### Selection Menu

```tsx
import { useState } from "react";
import { Menubar } from "@flowstack-ui/atom";

export function ViewMenubar() {
  const [statusBar, setStatusBar] = useState(true);
  const [density, setDensity] = useState("comfortable");

  return (
    <Menubar.Root aria-label="View commands">
      <Menubar.Menu value="view">
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Content ariaLabel="View">
          <Menubar.CheckboxItem
            value="status-bar"
            checked={statusBar}
            onCheckedChange={setStatusBar}
          >
            Status bar
          </Menubar.CheckboxItem>
          <Menubar.RadioGroup value={density} onValueChange={setDensity}>
            <Menubar.RadioItem value="compact">Compact</Menubar.RadioItem>
            <Menubar.RadioItem value="comfortable">Comfortable</Menubar.RadioItem>
          </Menubar.RadioGroup>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>
  );
}
```

`Portal`, `Arrow`, `Label`, and `ItemIndicator` use the shared Menu contract.
CheckboxItem supports mixed state and all retained DOM parts accept refs,
native props, `asChild`, and `render`. Hover switching is mouse-only; touch and
pen use click/tap.

## Accessibility

Follows the [WAI-ARIA menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).
Top-level triggers use roving focus and
open menus with keyboard or pointer input. Top-level triggers expose
`role="menuitem"` so the `role="menubar"` root has valid menuitem children.

Horizontal ArrowLeft and ArrowRight navigation and nested submenu placement
mirror in RTL when `dir="rtl"` is set on `Menubar.Root` or inherited from
`Direction.Provider`. When an open menubar moves between top-level triggers,
focus remains owned by the active trigger so `Enter`, `Space`, and `Escape`
target the active menu.

The owning strip remains inside each popup's interaction boundary, so moving
focus to an adjacent trigger does not dismiss the newly requested menu.
Consumer `persistentElements` are preserved alongside that boundary.

Pointer/tap-opened menus and adjacent pointer handoffs focus the content without
automatically highlighting an item. Keyboard/assistive activation enters the
first item; ArrowDown and ArrowUp seed the
first and last item for keyboard opening. Portalled menu
content registers with a parent modal focus scope when opened inside Dialog,
Drawer, or another modal primitive. Menubar menu content inherits Menu
typeahead behavior for printable-character searches.

| Key | Description |
| --- | --- |
| `ArrowRight` / `ArrowLeft` | Moves horizontal top-level focus, mirrored in RTL |
| `ArrowDown` / `ArrowUp` | Moves vertical top-level focus; in horizontal mode opens first/last item |
| `Home` / `End` | Moves to the first or last top-level trigger, or item inside open content |
| `Enter` / `Space` on trigger | Opens or closes the top-level menu |
| `Enter` / `Space` on item | Selects the focused item unless disabled |
| `Escape` | Closes the topmost submenu first, then the active top-level menu |
| Printable character | Typeahead search inside open menu content |
| `Tab` / `Shift+Tab` | Closes and exits after/before the complete Menubar Root |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
