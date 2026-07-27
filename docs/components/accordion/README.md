# Accordion

Disclosure sections with linked triggers, panels, and keyboard navigation.

## When to Use

Use Accordion when a page has several related sections and readers should open
only the sections they need. It works well for settings, product details, and
frequently asked questions. Use `Collapsible` instead when there is only one
independent section to show or hide.

## Features

- Supports single and multiple expanded items.
- Supports controlled and uncontrolled state.
- Supports horizontal and vertical arrow-key navigation.
- Exposes orientation consistently on every behavioral part.
- Links each trigger to its content with stable ARIA IDs.
- Supports mounted and unmounted closed content.
- Supports RTL-aware horizontal navigation through `dir` and
  `Direction.Provider`.
- Supports `asChild` and `render` on every part.

## Import

```tsx
import { Accordion } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Accordion.Root>
  <Accordion.Item value="item-1">
    <Accordion.Header>
      <Accordion.Trigger />
    </Accordion.Header>
    <Accordion.Content />
  </Accordion.Item>
</Accordion.Root>
```

## API Reference

### Root

Owns the expanded-item state and keyboard-navigation settings for every item.
It renders a `div` by default and accepts native div props.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `type` | `"single" \| "multiple"` | `"single"` |
| `value` | `string \| string[]` | - |
| `defaultValue` | `string \| string[]` | `""` or `[]`, based on `type` |
| `onValueChange` | `(value: string \| string[]) => void` | - |
| `collapsible` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` |
| `dir` | `"ltr" \| "rtl"` | `Direction.Provider` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"accordion-root"` |
| `[data-orientation]` | `"vertical" \| "horizontal"` |
| `[data-disabled]` | Present when the whole accordion is disabled |

### Item

Provides one item value and its open, closed, and disabled state to the nested
Header, Trigger, and Content. It renders a `div` by default.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `value` | `string` | Required |
| `disabled` | `boolean` | `false` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"accordion-item"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when the item or Root is disabled |
| `[data-orientation]` | `"vertical" \| "horizontal"` |

### Header

Renders the semantic heading that contains a Trigger. Choose an `as` level that
fits the surrounding page heading structure.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `as` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h3"` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"accordion-header"` |
| `[data-orientation]` | `"vertical" \| "horizontal"` |

### Trigger

Renders the control that toggles its Item and moves focus between sibling
triggers. It renders a native `button` by default and supplies button semantics
to custom renders.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"button"` for non-native renders |
| `aria-expanded` | `"true"` when open, otherwise `"false"` |
| `aria-controls` | ID of the associated Content |
| `aria-disabled` | `"true"` when disabled or open and not collapsible |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"accordion-trigger"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-disabled]` | Present when the Item or Root is disabled |
| `[data-locked-open]` | Present when an open single Item cannot collapse |
| `[data-orientation]` | `"vertical" \| "horizontal"` |

### Content

Renders the region controlled and labelled by its Trigger. Closed content
unmounts by default; `keepMounted` keeps it available in the DOM and hides it
after any closing animation finishes.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |
| `keepMounted` | `boolean` | `false` |
| `landmark` | `boolean` | `true` |

| ARIA attribute | Values |
| --- | --- |
| `role` | `"region"` |
| `aria-labelledby` | ID of the associated Trigger |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"accordion-content"` |
| `[data-state]` | `"open" \| "closed"` |
| `[data-orientation]` | `"vertical" \| "horizontal"` |

| CSS variable | Description |
| --- | --- |
| `--content-height` | Measured content height for consumer-owned animation |
| `--content-width` | Measured content width for consumer-owned animation |

The measured height and width stay synchronized while Content is mounted when
responsive reflow, fonts, images, or other intrinsic content changes alter the
panel size. Set `landmark={false}` when a large or multiple-open Accordion
would otherwise create excessive region landmarks.

## Examples

### Single Accordion

```tsx
import { Accordion } from "@flowstack-ui/atom";

export function SingleAccordion() {
  return (
    <Accordion.Root defaultValue="shipping">
      <Accordion.Item value="shipping">
        <Accordion.Header>
          <Accordion.Trigger>Shipping</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Orders usually ship within two days.</Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="returns">
        <Accordion.Header>
          <Accordion.Trigger>Returns</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Unused items can be returned within 30 days.</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
```

### Multiple Expanded Sections

```tsx
import { Accordion } from "@flowstack-ui/atom";

export function MultipleAccordion() {
  return (
    <Accordion.Root
      type="multiple"
      defaultValue={["account", "security"]}
    >
      <Accordion.Item value="account">
        <Accordion.Header>
          <Accordion.Trigger>Account</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Update your account details.</Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="security">
        <Accordion.Header>
          <Accordion.Trigger>Security</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Review your security settings.</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
```

## Accessibility

Accordion follows the
[WAI-ARIA Accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).
Triggers are buttons with `aria-expanded` and `aria-controls`. Each Content is
a labelled region, and each Header should use a heading level that fits the
page. Keep the Trigger as the only interactive control inside its Header.
When a single non-collapsible Item is open, its Trigger remains focusable and
uses `aria-disabled="true"` to announce that it cannot close. Horizontal
orientation is an Atom extension over the same heading/button/panel semantics;
the current APG documents the vertically stacked presentation.

| Key | Description |
| --- | --- |
| `Space` / `Enter` | Toggles the focused Trigger. |
| `ArrowDown` | Moves to the next Trigger when orientation is vertical. |
| `ArrowUp` | Moves to the previous Trigger when orientation is vertical. |
| `ArrowRight` | Moves next in horizontal LTR, or previous in horizontal RTL. |
| `ArrowLeft` | Moves previous in horizontal LTR, or next in horizontal RTL. |
| `Home` | Moves to the first enabled Trigger. |
| `End` | Moves to the last enabled Trigger. |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
