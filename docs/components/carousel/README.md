# Carousel

Carousel is a headless one-active-slide content rotator. It coordinates
controlled or uncontrolled selection, optional automatic rotation, native
touch scrolling, accessible controls, and inactive-slide semantics while the
consumer or styled layer owns layout and appearance.

## When to Use

Use Carousel for a small sequence of interchangeable content that shares one
viewport, such as product campaigns, testimonials, announcements, or media
stories. Use Tabs when labeled controls switch document panels, SwipeableItem
when a row reveals actions, Pagination when navigating pages, and ordinary
layout or scrolling when all items should remain visible together.

## Features

- Controlled and uncontrolled active slide values.
- Optional controlled or uncontrolled automatic rotation.
- Previous, Next, direct picker, native touch, trackpad, and external
  selection paths.
- Focus, hover, interaction, and document-visibility rotation policies.
- Looping or bounded collection navigation.
- LTR and RTL nearest-slide resolution.
- Group/carousel and group/slide semantics with localizable labels.
- Live-region policy plus inert, accessibility-hidden inactive slides.
- `asChild` and `render` composition on every rendered part.

## Import

```tsx
import { Carousel } from "@flowstack-ui/atom";
```

## Anatomy

```tsx
<Carousel.Root>
  <Carousel.RotationControl />
  <Carousel.Viewport>
    <Carousel.Track>
      <Carousel.Slide value="one" />
      <Carousel.Slide value="two" />
    </Carousel.Track>
  </Carousel.Viewport>
  <Carousel.Previous />
  <Carousel.Next />
  <Carousel.Picker>
    <Carousel.PickerItem value="one" />
    <Carousel.PickerItem value="two" />
  </Carousel.Picker>
</Carousel.Root>
```

Root, Viewport, Track, and one or more Slides form the required structure.
Every control is optional for a manually selected carousel. When automatic
rotation is enabled, RotationControl, Previous, and Next are required; Picker
remains optional.

## API Reference

### Root

Root renders a `div`, owns selection and rotation state, registers Slides in
DOM order, and supplies the carousel's accessible container semantics.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | - |
| `defaultValue` | `string` | `""` |
| `onValueChange` | `(value, reason) => void` | - |
| `autoPlay` | `boolean` | - |
| `defaultAutoPlay` | `boolean` | `false` |
| `onAutoPlayChange` | `(autoPlay) => void` | - |
| `interval` | `number` in milliseconds | `7000`, minimum `1000` |
| `loop` | `boolean` | `true` |
| `dir` | `"ltr" \| "rtl"` | Direction context |
| `previousAriaLabel` | `string` | `"Previous slide"` |
| `nextAriaLabel` | `string` | `"Next slide"` |
| `startAriaLabel` | `string` | `"Start slide rotation"` |
| `stopAriaLabel` | `string` | `"Stop slide rotation"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

Root defaults to `role="group"`; consumers may pass `role="region"` only when
the carousel warrants a landmark in the page information architecture.

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | `"Featured content"` by default; describe the content without repeating “carousel” |
| `aria-roledescription` | `"carousel"` by default; may be localized |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"carousel-root"` |
| `[data-state]` | `"playing"`, `"paused"`, or `"stopped"` |
| `[data-direction]` | `"ltr"` or `"rtl"` |
| `[data-value]` | active slide value |

Root exposes `--atom-carousel-count` and `--atom-carousel-index` as headless
collection geometry for styled layers.

### Viewport

Viewport renders a keyboard-focusable `div`, observes native scrolling, selects the nearest Slide,
and stops automatic rotation on pointer or wheel interaction. A styled layer
must make it the overflow viewport.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-atomic` | `false` |
| `aria-live` | `off` while automatic rotation is requested; otherwise `polite` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"carousel-viewport"` |
| `[data-state]` | `"playing"`, `"paused"`, or `"stopped"` |
| `[data-direction]` | `"ltr"` or `"rtl"` |

### Track

Track renders a `div` around Slides. It exposes direction but adds no layout;
the styled layer supplies its one-row track geometry.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"carousel-track"` |
| `[data-direction]` | `"ltr"` or `"rtl"` |

### Slide

Slide renders a registered `div`. Values must be unique within Root. Provide a
short content label through `label` or `aria-label`; the fallback is `value`.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `label` | `string` | - |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `group` by default |
| `aria-label` | authored label or slide value |
| `aria-roledescription` | `slide` by default; may be localized |
| `aria-hidden` | `true` while inactive |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"carousel-slide"` |
| `[data-state]` | `"active"` or `"inactive"` |
| `[data-value]` | slide value |

Inactive Slides are also inert so their descendants cannot remain in the focus
order while visually outside the viewport.

### Previous

Previous renders a native button and selects the prior Slide. With
`loop={false}`, it is disabled at the first Slide.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Root's previous label unless supplied directly |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"carousel-previous"` |
| `[data-direction]` | `"previous"` |
| `[data-disabled]` | present when unavailable |

### Next

Next renders a native button and selects the following Slide. With
`loop={false}`, it is disabled at the last Slide.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Root's next label unless supplied directly |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"carousel-next"` |
| `[data-direction]` | `"next"` |
| `[data-disabled]` | present when unavailable |

### Picker

Picker renders a named group of optional direct-selection buttons.

| Prop | Type | Default |
| --- | --- | --- |
| `ariaLabel` | `string` | `"Choose slide to display"` |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `role` | `group` |
| `aria-label` | `ariaLabel` |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"carousel-picker"` |
| `[data-state]` | `"playing"`, `"paused"`, or `"stopped"` |

### PickerItem

PickerItem renders a native button associated with one Slide. The active item
uses `aria-disabled` rather than native `disabled` so it remains discoverable
in the tab sequence.

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | required |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | authored label, registered Slide label, or `Show <value>` |
| `aria-controls` | associated Slide ID |
| `aria-disabled` | `true` for the active item |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"carousel-picker-item"` |
| `[data-state]` | `"active"` or `"inactive"` |
| `[data-value]` | target slide value |
| `[data-disabled]` | present when the target Slide is unavailable |

### RotationControl

RotationControl renders a native button that explicitly starts or stops
automatic rotation. Its accessible label describes the action it will perform,
so it does not use `aria-pressed`.

| Prop | Type | Default |
| --- | --- | --- |
| `asChild` | `boolean` | `false` |
| `render` | `RenderProp` | - |

| ARIA attribute | Values |
| --- | --- |
| `aria-label` | Root's start or stop action label |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"carousel-rotation-control"` |
| `[data-state]` | `"playing"` or `"stopped"` |

## Examples

### Manually controlled content

```tsx
import { Carousel } from "@flowstack-ui/atom";

export function ProductStories() {
  return (
    <Carousel.Root defaultValue="company" aria-label="Product stories">
      <Carousel.Viewport>
        <Carousel.Track>
          <Carousel.Slide value="company" label="Company services">
            Company services
          </Carousel.Slide>
          <Carousel.Slide value="hosting" label="Managed hosting">
            Managed hosting
          </Carousel.Slide>
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Previous />
      <Carousel.Next />
      <Carousel.Picker>
        <Carousel.PickerItem value="company" />
        <Carousel.PickerItem value="hosting" />
      </Carousel.Picker>
    </Carousel.Root>
  );
}
```

### Automatic rotation

```tsx
import { Carousel } from "@flowstack-ui/atom";

export function Announcements() {
  return (
    <Carousel.Root
      defaultValue="launch"
      defaultAutoPlay
      interval={8000}
      aria-label="Featured announcements"
    >
      <Carousel.RotationControl />
      <Carousel.Viewport>
        <Carousel.Track>
          <Carousel.Slide value="launch" label="New product launch">
            New product launch
          </Carousel.Slide>
          <Carousel.Slide value="service" label="Managed website service">
            Managed website service
          </Carousel.Slide>
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Previous />
      <Carousel.Next />
    </Carousel.Root>
  );
}
```

Atom intentionally adds no layout CSS. The styled layer must make Viewport a
horizontal overflow container, Track a row, and each Slide one viewport wide
for touch scrolling and nearest-slide selection to operate as intended.

## Accessibility

Carousel follows the
[WAI-ARIA Carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)
using grouped picker buttons rather than the optional tabbed variant.

Automatic rotation pauses while the pointer hovers the carousel or the
document is hidden. It stops when focus enters, a control is activated, or the
viewport receives pointer or wheel interaction, and does not restart until the
user activates RotationControl. Control activation does not move focus.

All controls use native button keyboard behavior; Atom does not intercept Tab
or Arrow keys for the Carousel itself. PickerItem adds one tab stop per Slide,
so use it for a small set and omit it when direct selection is unnecessary.

Do not place essential information only in an automatically rotating Slide.
Users must be able to stop rotation and reach every Slide without waiting.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
