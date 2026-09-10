# TableOfContents

Headless same-document navigation. Import `TableOfContents` and
`useTableOfContents` from `@flowstack-ui/atom/table-of-contents` or the root.

```tsx
<TableOfContents.Root items={[{ id: "usage", depth: 2 }]}>
  <TableOfContents.Nav aria-label="On this page">
    <TableOfContents.List>
      <TableOfContents.Item value="usage">
        <TableOfContents.Link>Usage</TableOfContents.Link>
      </TableOfContents.Item>
    </TableOfContents.List>
  </TableOfContents.Nav>
</TableOfContents.Root>
<section id="usage">...</section>
```

## Anatomy

Root renders div. Nav renders a named nav. Optional Title renders p and labels
Nav. List renders ul; nested lists belong inside Item (li). Link renders a with
an encoded fragment href and at most one `aria-current="location"` per Nav.
Indicator is an aria-hidden span placed beside List, not inside it. RootProvider
accepts the controller as value and adds no DOM. Context calls its child with
public state/actions. DOM parts forward refs, native props, asChild, render,
className, style and data-slot. Preserve native semantics when adapting.

## API Reference

| Option | Default | Purpose |
| --- | --- | --- |
| items | required | Explicit `{id, depth}` targets; depth integer 1–6 |
| activeId | uncontrolled | One controlled current ID; empty string means none |
| defaultActiveId | empty string | Initial/fallback current ID |
| onActiveIdChange | none | `(id, {reason})`; scroll, navigation, hash or items |
| enabled | true | Attach tracking/navigation enhancement |
| getTargetRoot | document | Document, ShadowRoot or content HTMLElement getter |
| getScrollElement | document scrolling | Content viewport getter |
| scrollOffset | CSS padding + margin | Number/getter overriding activation/managed offset |
| scrollBehavior | smooth | Managed navigation: instant or smooth |
| navigation | native document; managed element/shadow root | Browser navigation versus owned scrolling |
| history | push | Managed mode: push, replace or none; passive scroll never writes history |
| focusTarget | true | Focus destination on managed activation |

The hook returns activeId, visibleIds, pendingId, getItemState, navigateTo and
refresh. Item state has current, visible, pending, depth, level and
targetAvailable. navigateTo reports whether navigation could start, not whether
it finished. RootProvider shares one controller among multiple Navs.

Nav separately accepts autoScroll (true) and getScrollElement for its optional
rail viewport. Without it, Nav never scrolls ancestors. Every Nav needs Title,
aria-label or aria-labelledby. Link owns href/aria-current; Item supplies value.
For a custom Title ID, supply the same Nav aria-labelledby when its naming
relationship must exist in server HTML; default generated IDs already match.

## Accessibility and navigation

Native mode keeps browser hash/history and host CSS scrolling; it can move
ancestors. Use managed mode for a bounded content viewport or shadow targets.
Managed navigation respects reduced motion and only intercepts unmodified valid
activation. Copy link, modifiers, download and non-self targets remain native.
Consumer preventDefault wins. Managed history preserves history.state but does
not promise CSS :target updates or synthetic hashchange. Use history=none when
the application router owns history. Passive scrolling never writes history
or moves focus. Controlled parents may reject current-state requests.

Clicking requests the destination immediately, retaining it during scrolling.
User scroll input cancels pending work. Native links work without JavaScript.
Missing targets remain links and become tracked when mounted; invalid or
duplicate item records are skipped with a diagnostic. Use refresh for external
layout changes that do not cause resize/load or target mutations.

## Data Attributes and geometry

Atom ships no visual styles. Item exposes data-depth/data-level,
`--atom-table-of-contents-level`, and current/visible/pending state. Link exposes
current/pending. Nav exposes data-indicator-ready and
`--atom-table-of-contents-indicator-block-start` and
`--atom-table-of-contents-indicator-block-size`. Hide the marker until ready.

Exports: TableOfContents; TableOfContentsRoot, TableOfContentsRootProvider,
TableOfContentsContext, TableOfContentsNav, TableOfContentsTitle,
TableOfContentsList, TableOfContentsItem, TableOfContentsLink,
TableOfContentsIndicator; useTableOfContents. Each part exports its Props type.
Controller types: TableOfContentsOptions, TableOfContentsApi,
TableOfContentsController, TableOfContentsItemData, TableOfContentsItemState and
TableOfContentsChangeDetails. Controller activateLink is internal part wiring;
use navigateTo for imperative composition.

## Evidence

Owner tests: test/primitives/table-of-contents.test.mjs and
test/browser/table-of-contents.spec.ts. Headless fixture:
playground/src/TableOfContentsHarness.tsx. Manual results are separate;
automated tests do not certify assistive technology.
