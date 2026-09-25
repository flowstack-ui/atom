# Carousel

For custom headless CSS, apply `translate: var(--atom-carousel-shift, 0px) 0`
to horizontal slides (swap axes for vertical). Disable viewport scroll snapping
while `[data-programmatic]` or `[data-dragging]` is present. Atom removes the
programmatic marker after measured movement/rebasing settles; this prevents
native snap from redirecting a loop command to an item's previous position.

Carousel coordinates measured snap pages, stable slide values, native scrolling,
optional mouse dragging and user-controlled automatic rotation. It does not own
paint, layout tokens or icons.

## Usage

```tsx
import { Carousel } from '@flowstack-ui/atom/carousel'
<Carousel.Root defaultValue="one" loop={false}>
  <Carousel.Viewport><Carousel.Track>
    <Carousel.Slide value="one" label="First story">One</Carousel.Slide>
    <Carousel.Slide value="two" label="Second story">Two</Carousel.Slide>
  </Carousel.Track></Carousel.Viewport>
  <Carousel.Previous />
  <Carousel.Picker><Carousel.PickerItem value="one" /><Carousel.PickerItem value="two" /></Carousel.Picker>
  <Carousel.Next />
</Carousel.Root>
```

## Behavior

Choose `value/defaultValue/onValueChange` or `page/defaultPage/onPageChange`.
These modes are mutually exclusive. Pages are unique reachable snap positions;
several visible items can share one terminal page. Values remain stable across
reordering. Removing an uncontrolled selected item recovers to its next neighbor,
or the previous item when removing the final item. Controlled state remains
parent-owned. Change reasons include `next`, `previous`, `picker`, `scroll`,
`autoplay` and `collection`.

`useCarousel(options)` creates the same controller as Root. Pass it as `value`
to `Carousel.RootProvider`. `useCarouselContext()` reads the current controller.
Public commands include `selectPage`, `selectValue`, `goNext`, `goPrevious`,
`play`, `pause`, and `refresh`. Read `pageSnapPoints`, `page`, `activeValue`,
`visibleValues`, `inViewValues`, `canGoNext`, `canGoPrevious`, `isPlaying` and
`isDragging`. Registration and settling members are for compound parts, not
application replacement engines. Use PickerItem `page` for page indicators.

## Geometry

`orientation` defaults to horizontal. `slidesPerPage` defaults to 1 and supports
positive fractional counts. `slidesPerMove` defaults to auto (the visible count
rounded down to at least 1); explicit movement is a positive integer after
normalization. `autoSize` keeps authored dimensions. `snapType` is mandatory or
proximity; Slide `snapAlign` is start, center or end. Supply matching CSS in the
styled layer. Vertical geometry requires a definite viewport height.

Provide optional `slideCount` for SSR page estimates and Slide `index` for
server-known page visibility. Registration and measured geometry supersede the
estimate. IDs can be customized with `ids.root`, `ids.viewport`, `ids.item(value)`
or native IDs. Root/Viewport/Track/Slide and actions support native props,
refs, `render` and `asChild` single-host composition.

Looping defaults to true and never clones authored slides, controls, IDs or
media. The styled layer places noninteractive leading/trailing boundary spans
and applies each slide's `--atom-carousel-shift`. It must not reproduce the old
viewport-count translation. Short-content loops that cannot recycle a slide
without showing it twice move instantly at the boundary; normal navigation is
still available. Native smooth-scroll timing belongs to the browser.

## Accessibility

Mouse drag is opt-in through `allowMouseDrag`. Native touch/trackpad scrolling
remains available. Dragging excludes nested editing/action targets, suppresses
clicks only after a real drag and handles cancellation. Viewport arrow keys
follow orientation/direction; Home/End navigate endpoints without intercepting
keys from nested controls.

Visible slides remain interactive. Fully offscreen slides are inert and hidden
from assistive technology. `inViewThreshold` defaults to 0.6; it controls the
separate in-view state, not whether visible peer controls are usable.

`autoPlay/defaultAutoPlay`, `interval` (7000ms default, 1000ms minimum) and
`onAutoPlayChange` preserve the playback API. Always render RotationControl
before the viewport when playback is available. Focus stops rotation until
explicit restart; hover/document visibility temporarily pause it. Use
`onAutoplayStatusChange` and `onDragStatusChange` for effective status.
`translations` customizes actions, indicator and progress text; legacy action
label props take precedence. The styled layer must honor reduced motion.

## Data Attributes

Parts expose `data-slot`. Viewport exposes `data-orientation`, `data-direction`,
`data-dragging`, `data-mouse-drag`, and effective playback `data-state`.
Previous/Next expose their `data-direction` and `data-disabled` availability.
RotationControl exposes requested playback `data-state`; requested playback can
remain enabled while effective playback is temporarily paused.

## Verification

- `test/primitives/carousel.test.mjs`
- `test/primitives/carousel-interaction.test.mjs`
- `test/browser/carousel.spec.ts`

Automated coverage does not substitute for physical touch, assistive technology
or visual motion approval.
