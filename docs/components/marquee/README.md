# Marquee

Measured continuous motion with explicit visual replicas, compounded pause reasons
and accessible stationary content. Atom owns behavior and geometry, not keyframes
or visual layout.

## When to Use

Use for passive logos, news or testimonials with an accessible alternative to
motion. Use Carousel for selected slides and native scrolling when safe passive
replicas are not possible. Do not use the obsolete native marquee element.

## Features

- Logical horizontal/vertical movement, reverse, pixel speed, spacing and delay.
- Controlled/uncontrolled pause and independently tracked hover/focus/motion safety.
- Finite iteration callbacks and restart without remounting originals.
- Measured, bounded visual copies with inert and hidden semantics.
- SSR originals and static fallback for reduced motion, focus or unusable geometry.

## Import

```tsx
import { Marquee, useMarquee } from "@flowstack-ui/atom";
```

The same exports are available from `@flowstack-ui/atom/marquee`.

## Anatomy

```tsx
<Marquee.Root>
  <Marquee.Context />
  <Marquee.Viewport>
    <Marquee.Content><Marquee.Item /></Marquee.Content>
  </Marquee.Viewport>
</Marquee.Root>
```

Alternatively `useMarquee()` supplies `Marquee.RootProvider`. Context renders no
host. Root/RootProvider, Viewport, Content and Item default to div.

## API Reference

### Root

Owns a controller and native root props. All hosts support native attributes,
className/style, data-slot, HTMLDivElement refs, asChild and render projection.
Do not combine asChild and render. Projection must preserve owned props/refs.

| Prop | Type | Default |
| --- | --- | --- |
| side | start / end / top / bottom | start |
| dir | ltr / rtl | Direction context |
| reverse | boolean | false |
| speed | number, pixels per second | 50 |
| spacing | non-negative CSS length, not a percentage | 1rem |
| delay | number, seconds | 0 |
| loopCount | nonnegative integer, 0 infinite | 0 |
| autoFill | boolean | false |
| paused / defaultPaused | boolean | false uncontrolled |
| pauseOnInteraction | boolean, hover pause | false |
| onPauseChange | (paused: boolean) => void | — |
| onLoopComplete | ({ iteration: number }) => void | — |
| onComplete | ({ iterations: number }) => void | — |
| id / ids | string / { viewport?, content? } | generated |
| translations | { regionLabel?: string } | — |
| asChild / render | boolean / RenderProp | false / — |

Invalid speed/delay/count use 50/0/0. Invalid lengths or unmeasurable geometry
keep stationary originals. Accessible names can also use aria-label/labelledby.

| ARIA attribute | Values |
| --- | --- |
| role | region only when named, unless authored otherwise |
| aria-label | authored label or translations.regionLabel |
| aria-live | off |

| Data attribute | Values |
| --- | --- |
| [data-slot] | marquee |
| [data-state] | playing / paused / completed |
| [data-static] | present for stationary original-only presentation |
| [data-side] | start / end / top / bottom |
| [data-orientation] | horizontal / vertical |
| [data-reversed] | present for positive physical movement |
| [data-generation] | 0 / 1, alternate keyframe names for restart |

### Context

children(controller) renders without a host. Public controller includes
requestedPaused, paused, static, pauseReasons, side, dir, orientation, reversed,
duration, distance, copyCount, iteration, completed and pause/resume/togglePause/restart.
Pause reasons: user, hover, focus, reduced-motion, hidden-document, completed,
unavailable. Safety reasons do not emit onPauseChange or alter controlled state.

### Viewport

Native div containing Content and generated sibling copies. Supports shared host
props above; ID defaults to ids.viewport. Emits [data-slot]=marquee-viewport,
[data-orientation] and [data-static]. In static mode expose native scrolling,
not clipped frozen content. Focus scroll adjustment affects this viewport only.

### Content

children is the sole semantic original. Optional renderReplica(index:number)
creates explicit visual-only copies, never implicitly re-renders children.
Its forwarded ref and native attributes target the original, not a copy. Shares
host projection props; ID defaults to ids.content. Emits [data-slot]=marquee-content
and [data-original]. Copies emit [data-slot]=marquee-replica, [data-replica], inert,
aria-hidden=true and role=presentation; original class/style applies to copies
for equivalent track geometry, but IDs, event handlers and native names do not.

Factories must be pure, ID-free and noninteractive, with no stateful widgets,
forms, portals, effects or embedded/autoplay media. Runtime rejects discoverable
IDs, names, links, form/focusable/editable controls and media in copy DOM; this
removes copies and falls back to originals. It cannot prove arbitrary React
purity or prevent side effects inside a caller's factory. This is an explicit
supported-content boundary, not a security sandbox. Original links use separate
non-link artwork and switch the entire viewport to static when focused.

### Item

Native div for one authored item. Shared host props and [data-slot]=marquee-item;
no focus, selection or live-region semantics. The styled layer owns its layout.

### RootProvider

Takes value returned by useMarquee, plus the same native root/projection props.
Do not construct a controller manually or supply a second configuration owner.
It emits the Root attributes and geometry variables described above.

### useMarquee

Accepts the Root behavior options and returns its controller for RootProvider.
restart clears completion/iteration and delay while retaining user pause. Viewport
coverage updates immediately; changes to measured travel distance restart the
current cycle without resetting completed iteration count or requested pause.
Content changes restart the run. Root/Viewport/Content use ownerDocument and its
window for observation, animation frames and motion preference listeners.

Unresolvable or percentage spacing leaves the original content stationary.
Animation lifecycle events are notifications: preventDefault does not cancel
loop accounting. After an invalid replica is detected, remount Content with a
correct, pure visual factory to retry; unsafe copies are never kept visible.

Geometry outputs: --atom-marquee-distance (px), --atom-marquee-duration (seconds),
--atom-marquee-delay, --atom-marquee-spacing, --atom-marquee-iterations. Treat as
readonly. Styled tracks need intrinsic nonshrinking extents, a shared gap, linear
translation over the measured distance, and generation-specific keyframe names.
Only original-track animation events count. Total tracks are bounded at 50;
insufficient coverage without autoFill or an over-budget count becomes static.

## Examples

```tsx
import { Marquee, useMarquee, Button } from "@flowstack-ui/atom";

export function Partners() {
  const marquee = useMarquee({ autoFill: true });
  return <>
    <Button.Root onPress={marquee.togglePause}>{marquee.requestedPaused ? "Resume partners" : "Pause partners"}</Button.Root>
    <Marquee.RootProvider value={marquee} aria-label="Partners">
      <Marquee.Viewport>
        <Marquee.Content renderReplica={() => <><Marquee.Item>Northstar</Marquee.Item><Marquee.Item>Acme</Marquee.Item></>}>
          <Marquee.Item>Northstar</Marquee.Item><Marquee.Item>Acme</Marquee.Item>
        </Marquee.Content>
      </Marquee.Viewport>
    </Marquee.RootProvider>
  </>;
}
```

This headless example remains stationary until consumer track/viewport layout
and keyframes are supplied. Use the finished Brick owner for styled applications.

## Accessibility

Supply a persistent named pause control for indefinite movement, following
[WCAG Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
Keyboard focus always stops moving content even when hover pause is disabled.
Reduced motion suppresses copies and exposes original content through stationary
native overflow. Leaving hover cannot clear manual/focus/safety reasons. Copies
are inert and hidden, not additional links, form values or announcements. There
is no invented arrow-key model or automatic focus movement.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
### Stationary keyboard access

Viewport defaults to tabIndex=0 while static so keyboard users can scroll all
original content. Explicit tabIndex overrides are preserved; authors who remove
the tab stop must provide equivalent access. Moving viewports add no tab stop.

## Responsive coverage updates

Viewport-only changes update copy counts immediately, even while paused. New
replicas synchronize their CSS animation phase to the original before paint.
Only track animations are synchronized, never descendants. If the animation API
is unavailable, use stationary originals. Measured travel-distance changes
restart the current cycle while preserving completed iterations and requested
pause; content replacement explicitly restarts the run.
