# ContextMenu

Headless menu primitives that open at a pointer location or from the keyboard
to present actions for a specific area.

## When to Use

Use ContextMenu when actions belong to the exact thing a user right-clicked,
such as a file, canvas object, or table row. Do not make it the only way to
reach important actions because context menus are easy to miss. Use Menu or
DropdownMenu when a visible button should open the actions, and Menubar for a
persistent application command bar.

## Features

- Opens at right-click coordinates or the keyboard trigger location.
- Re-invokes at the latest right-click point and transfers an open menu directly
  between registered ContextMenu targets without exposing the browser menu.
- Opens from a cancel-safe 700 ms touch/pen long press with a 10 px tolerance.
- Supports controlled state, modal behavior, looping, and dismissal settings.
- Includes actions, checkbox choices, radio choices, groups, separators, and nested menus.
- Positions and collision-adjusts Content with Floating UI.
- Supports pointer highlight, keyboard navigation, typeahead, and RTL submenus.
- Keeps nested portalled menus inside parent modal focus scopes.

## Import

```tsx
import { ContextMenu } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger />
  <ContextMenu.Portal>
  <ContextMenu.Content>
    <ContextMenu.Arrow />
    <ContextMenu.Group>
      <ContextMenu.Label />
      <ContextMenu.Item />
      <ContextMenu.CheckboxItem><ContextMenu.ItemIndicator /></ContextMenu.CheckboxItem>
      <ContextMenu.RadioGroup>
        <ContextMenu.RadioItem />
      </ContextMenu.RadioGroup>
    </ContextMenu.Group>
    <ContextMenu.Separator />
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger />
      <ContextMenu.SubContent>
        <ContextMenu.Item />
      </ContextMenu.SubContent>
    </ContextMenu.Sub>
  </ContextMenu.Content>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

## API Reference

### Root

Owns Menu state and the point used to position Content. It renders no wrapper.

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

Wraps the area that owns the menu. It renders a `span` with `display: contents`
by default, opens on the context-menu gesture, and does not add button
semantics to the wrapped area.

Touch and pen track one primary long press. Movement beyond 10 px, scrolling,
early release, cancellation, a second pointer, disabled state, unmount, or a
native `contextmenu` event cancels the fallback.

While a ContextMenu is open, another secondary click inside its Trigger updates
the point anchor and keeps the custom menu active. A secondary click on another
ContextMenu Trigger closes the previous root and opens the new one. Consumer
`onContextMenu` handlers still run for the new invocation and may prevent Atom's
open or reposition behavior.

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"context-menu-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when disabled |
| `[data-pressed]` | Present only while a long press is pending |

### Content

Renders the portalled menu at Trigger's pointer or keyboard anchor, manages
focus and highlight, locks scrolling when modal, and closes on outside click.
The resolved explicit, Trigger, or provider direction is preserved on the
portalled Content and nested SubContent DOM.

With a submenu open, an activation inside an ancestor menu but outside that
submenu closes only the submenu. An activation outside every menu surface
closes the complete ContextMenu tree in one activation.

| Prop | Type | Default |
| --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` |
| `align` | `"start" \| "center" \| "end"` | `"start"` |
| `sideOffset` | `number` | `4` |
| `loop` | `boolean` | Root `loop` |
| `ariaLabel` | `string` | - |
| `onKeyDownCapture` | `KeyboardEventHandler` | - |

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
| `[data-side]` | Resolved placement side |
| `[data-align]` | Resolved placement alignment |
| `[data-positioned]` | Present after positioning |

### Group

Groups related menu entries as a `div`. Provide a native accessible label when
the grouping needs to be announced.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"group"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-group"` |

### Item

Represents one command. Its unique value supports highlight and typeahead;
`textValue` supplies searchable text when children are not plain text.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `textValue` | `string` | Text child or value |
| `onSelect` | `() => void` | - |
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

Represents an independently toggleable menu choice. It stays open by default
so several choices can be changed in one visit.

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
| `aria-checked` | Current checked state |
| `aria-disabled` | `"true"` when disabled |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-checkbox-item"` |
| `[data-highlighted]` | Present when highlighted |
| `[data-disabled]` | Present when disabled |
| `[data-checked]` | Present when checked |
| `[data-value]` | Item value |

### RadioGroup

Shares one controlled value with nested RadioItems and renders a semantic
group.

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

Represents one mutually exclusive value inside RadioGroup. Selection does not
close the menu unless `closeOnSelect` is enabled.

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

Marks a horizontal boundary between related groups of commands.

| ARIA attribute | Values |
| --- | --- |
| `role` | `"separator"` |
| `aria-orientation` | `"horizontal"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-separator"` |

### Sub

Owns controlled or uncontrolled state for one nested menu and renders no
wrapper.

| Prop | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | - |

### SubTrigger

Registers a menu item that opens SubContent after intentional mouse movement
and a hover delay, by click, or with the direction-aware submenu key. Merely
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

Renders a separately portalled nested menu, positions it beside SubTrigger,
and mirrors its side and open/close keys in RTL.

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
| `aria-labelledby` | SubTrigger ID when `ariaLabel` is absent |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"menu-sub-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-side]` | Resolved placement side |
| `[data-positioned]` | Present after positioning |

The package also exports `useContextMenuContext` for advanced custom parts. It
returns the current anchor point and its setter and must be used within Root.

`Portal`, `Arrow`, `Label`, and `ItemIndicator` use the shared Menu contract.
CheckboxItem supports `"indeterminate"`; retained DOM parts accept refs,
native props, `asChild`, and `render`; Content/SubContent expose the shared
`--atom-menu-*` geometry variables.

## Examples

### File Actions

```tsx
import { ContextMenu } from "@flowstack-ui/atom";

export function FileContextMenu() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <article tabIndex={0}>Quarterly report.pdf</article>
      </ContextMenu.Trigger>
      <ContextMenu.Content ariaLabel="File actions">
        <ContextMenu.Item value="open" onSelect={() => console.log("Open")}>
          Open
        </ContextMenu.Item>
        <ContextMenu.Item value="rename" onSelect={() => console.log("Rename")}>
          Rename
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item value="delete" onSelect={() => console.log("Delete")}>
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
```

### Persistent View Choices

```tsx
import { useState } from "react";
import { ContextMenu } from "@flowstack-ui/atom";

export function CanvasContextMenu() {
  const [snap, setSnap] = useState(true);
  const [density, setDensity] = useState("comfortable");

  return (
    <ContextMenu.Root closeOnSelect={false}>
      <ContextMenu.Trigger>
        <section tabIndex={0}>Canvas</section>
      </ContextMenu.Trigger>
      <ContextMenu.Content ariaLabel="View options">
        <ContextMenu.CheckboxItem
          value="snap"
          checked={snap}
          onCheckedChange={setSnap}
        >
          Snap to grid
        </ContextMenu.CheckboxItem>
        <ContextMenu.RadioGroup value={density} onValueChange={setDensity}>
          <ContextMenu.RadioItem value="compact">Compact</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value="comfortable">Comfortable</ContextMenu.RadioItem>
        </ContextMenu.RadioGroup>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
```

## Accessibility

ContextMenu follows the
[WAI-ARIA Menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).
Trigger supports right click, keyboard invocation, and deliberate touch/pen
long press. Content moves real item focus. Keep important actions available
through a visible control as well.

| Key | Description |
| --- | --- |
| `Shift+F10` / `ContextMenu` | Opens at the keyboard anchor and highlights the first item. |
| `ArrowDown` / `ArrowUp` | Moves through items, including disabled items, following `loop`. |
| `Home` / `End` | Moves to the first or last item. |
| `Enter` / `Space` | Activates the focused item unless disabled. |
| Printable character | Moves by typeahead label. |
| `ArrowRight` | Opens a submenu in LTR; closes it in RTL. |
| `ArrowLeft` | Closes a submenu in LTR; opens it in RTL. |
| `Escape` | Closes the topmost submenu or menu. |
| `Tab` / `Shift+Tab` | Closes and exits after/before the invoking context. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
