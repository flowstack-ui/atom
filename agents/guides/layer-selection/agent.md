# Atom layer selection

## Purpose

Decide whether reusable headless behavior belongs in Atom, an existing native element, Brick, a higher composition layer, or the application before composing a primitive.

## Decision order

1. Start from the semantic and interaction job, not the desired appearance.
2. Use an existing native element when it already provides the complete reusable behavior contract.
3. Use an Atom primitive when reusable semantics, state, focus, keyboard, pointer, touch, portal, positioning, or compound composition are required.
4. Use Brick instead when the consumer needs a finished visual component; ordinary Brick applications should not import Atom directly.
5. Keep product workflows, page layout, content, routing, persistence, and analytics in higher layers.

## Selection map

- **native action:** use Button. Choose Link for ordinary navigation and Pressable only for custom interactive surfaces.
- **application header structure:** use AppBar. Compose Toolbar only when grouped controls require toolbar keyboard behavior.
- **site or application navigation:** use NavList, NavigationMenu, Breadcrumb, BottomNavigation, Tabs, or Pagination. Select by the navigation relationship, not by visual resemblance.
- **temporary modal side panel:** use Drawer. Do not recreate dialog focus, dismissal, portal, or labeling behavior.
- **scrollable viewport with owned scrollbar behavior:** use ScrollArea. Keep ordinary document scrolling native.
- **resilient media loading:** use Image. Use a native img when loading state and fallback composition are unnecessary.
- **grouped disclosure sections:** use Accordion. Choose Collapsible for one independent disclosure and Tabs for one shared switching panel.
- **static ordered or unordered content:** use List. Choose NavList or an interactive collection primitive when items navigate, select, or activate.

## Rules

- **MUST:** Keep Atom guidance and compositions headless; do not add visual recipes, color, theme, product copy, or application layout policy.
- **MUST:** Preserve native semantics and behavior unless Atom explicitly owns the added reusable contract.
- **MUST:** Do not rebuild focus, keyboard, pointer, touch, portal, positioning, or controlled-state behavior already owned by an Atom primitive.
- **SHOULD:** When building with Brick, consume Brick public components and let Brick consume Atom rather than importing both layers directly.

## Native fallback

1. Search Atom's manifest, public exports, and related component guides for the required behavior before using a native fallback.
2. Use the narrowest semantic native element only when no Atom primitive owns the behavior and no reusable state or interaction contract is being recreated.
3. Record the missing primitive or intentional native choice so repeated gaps can be evaluated by Atom maintainers.

## Validation checklist

- Name the selected semantic and interaction job and its owning layer.
- Confirm no visual or application policy entered the Atom composition.
- Confirm the rendered elements, accessible names, state, focus, keyboard, pointer, touch, and RTL behavior that apply.
- Record any native fallback and the Atom capability searched first.

## Related guidance

- `behavior-composition`
- `button`
- `link`
- `pressable`
- `app-bar`
- `navigation-menu`
- `drawer`
- `accordion`
- `list`
