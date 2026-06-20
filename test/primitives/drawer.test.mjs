import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  ModalRoot,
} from "../../dist/index.js";

test("Drawer renders its own trigger, content, title, description, close, overlay, and portal parts", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalRoot,
      { defaultOpen: true },
      React.createElement(DrawerTrigger, null, "Open"),
      React.createElement(DrawerTitle, null, "Navigation"),
      React.createElement(DrawerDescription, null, "Primary app navigation"),
      React.createElement(
        DrawerContent,
        { placement: "left", ariaLabel: "Navigation drawer" },
        "Panel",
        React.createElement(DrawerClose, null, "Close"),
      ),
    ),
  );

  assert.equal(Drawer.Trigger, DrawerTrigger);
  assert.equal(Drawer.Portal, DrawerPortal);
  assert.equal(Drawer.Overlay, DrawerOverlay);
  assert.equal(Drawer.Content, DrawerContent);
  assert.equal(Drawer.Title, DrawerTitle);
  assert.equal(Drawer.Description, DrawerDescription);
  assert.equal(Drawer.Close, DrawerClose);
  assert.match(html, /data-slot="drawer-trigger"/);
  assert.match(html, /data-slot="drawer-title"/);
  assert.match(html, /data-slot="drawer-description"/);
  assert.match(html, /data-slot="drawer-content"/);
  assert.match(html, /data-slot="drawer-close"/);
  assert.match(html, /data-placement="left"/);
  assert.match(html, /aria-label="Navigation drawer"/);
  assert.doesNotMatch(html, /data-slot="modal-trigger"/);
  assert.doesNotMatch(html, /data-slot="modal-title"/);
  assert.doesNotMatch(html, /data-slot="modal-description"/);
  assert.doesNotMatch(html, /data-slot="modal-close"/);
});

test("DrawerContent keeps className when hidden with keepMounted", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalRoot,
      { keepMounted: true },
      React.createElement(
        DrawerContent,
        { className: "hidden-drawer", placement: "right" },
        "Panel",
      ),
    ),
  );

  assert.match(html, /hidden=""/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /data-slot="drawer-content"/);
  assert.match(html, /data-state="closed"/);
  assert.match(html, /data-placement="right"/);
  assert.match(html, /class="hidden-drawer"/);
});
