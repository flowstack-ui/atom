import {
  assert,
  test,
  React,
} from "../test-utils.mjs";
import ReactDOMClient from "react-dom/client";
import ReactDOMServer from "react-dom/server";
import jsdom from "jsdom";

import { DropdownMenu, Popover, usePopover } from "../../dist/index.js";

const { act, useRef, useState } = React;
const { hydrateRoot } = ReactDOMClient;
const { renderToString } = ReactDOMServer;
const { JSDOM } = jsdom;

async function withHydratedDom(element, run) {
  const markup = renderToString(element);
  const dom = new JSDOM(
    `<!doctype html><html><body><button id="outside">Outside</button><div id="root">${markup}</div></body></html>`,
    { url: "https://atom.test/" },
  );
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  dom.window.HTMLElement.prototype.attachEvent = () => {};
  dom.window.HTMLElement.prototype.detachEvent = () => {};
  dom.window.scrollTo = () => {};
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  const saved = new Map();
  const globals = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    Event: dom.window.Event,
    KeyboardEvent: dom.window.KeyboardEvent,
    MouseEvent: dom.window.MouseEvent,
    FocusEvent: dom.window.FocusEvent,
    MutationObserver: dom.window.MutationObserver,
    ResizeObserver,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: (callback) => setTimeout(() => callback(Date.now()), 0),
    cancelAnimationFrame: (handle) => clearTimeout(handle),
    IS_REACT_ACT_ENVIRONMENT: true,
  };

  for (const [key, value] of Object.entries(globals)) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  }

  let root;
  try {
    await act(async () => {
      root = hydrateRoot(dom.window.document.getElementById("root"), element);
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    await run(dom);
  } finally {
    if (root) await act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

function dispatchPointerActivation(element, pointerType) {
  const pointerDown = new element.ownerDocument.defaultView.MouseEvent(
    "pointerdown",
    { bubbles: true, button: 0 },
  );
  Object.defineProperty(pointerDown, "pointerType", { value: pointerType });
  element.dispatchEvent(pointerDown);
  element.dispatchEvent(new element.ownerDocument.defaultView.MouseEvent(
    "click",
    { bubbles: true, button: 0 },
  ));
}

test("Popover switches shared triggers without closing and restores the active trigger", async () => {
  const events = [];
  await withHydratedDom(React.createElement(Popover.Root, { onOpenChange: open => events.push(open) },
    React.createElement(Popover.Trigger, { value: "a" }, "A"),
    React.createElement(Popover.Trigger, { value: "b" }, "B"),
    React.createElement(Popover.Content, { "aria-label": "Shared" }, React.createElement(Popover.Close, null, "Done"))), async dom => {
    const [a, b] = dom.window.document.querySelectorAll("[data-slot=popover-trigger]");
    await act(async () => { a.focus(); dispatchPointerActivation(a, "mouse"); });
    await act(async () => { b.focus(); dispatchPointerActivation(b, "mouse"); });
    assert.equal(a.getAttribute("aria-expanded"), "false");
    assert.equal(b.getAttribute("aria-expanded"), "true");
    assert.deepEqual(events, [true]);
    await act(async () => { dom.window.document.querySelector("[data-slot=popover-close]").click(); });
    assert.equal(dom.window.document.activeElement, b);
  });
});

test("Popover outside focus is observable but does not close when disabled by policy", async () => {
  const events = [];
  await withHydratedDom(React.createElement(Popover.Root, { defaultOpen: true, closeOnInteractOutside: false, onFocusOutside: () => events.push("focus") },
    React.createElement(Popover.Trigger, null, "Open"),
    React.createElement(Popover.Content, { "aria-label": "Policy" }, React.createElement("input"))), async dom => {
    await act(async () => { dom.window.document.getElementById("outside").focus(); });
    assert.ok(dom.window.document.querySelector("[data-state=open][role=dialog]"));
    assert.deepEqual(events, ["focus"]);
  });
});

test("Popover external controller retains form state while hidden", async () => {
  function Fixture() {
    const api = usePopover({ lazyMount: false, unmountOnExit: false });
    return React.createElement(Popover.RootProvider, { value: api },
      React.createElement("button", { onClick: () => api.setOpen(!api.open), id: "external" }, "Toggle"),
      React.createElement(Popover.Content, { "aria-label": "Retained" }, React.createElement("input", { defaultValue: "Keep" })));
  }
  await withHydratedDom(React.createElement(Fixture), async dom => {
    const panel = dom.window.document.querySelector("[role=dialog]");
    assert.equal(panel.hidden, true);
    await act(async () => dom.window.document.getElementById("external").click());
    assert.equal(panel.hidden, false);
    panel.querySelector("input").value = "Edited";
    await act(async () => dom.window.document.getElementById("external").click());
    await act(async () => new Promise(resolve => setTimeout(resolve, 40)));
    assert.equal(panel.hidden, true);
    assert.equal(panel.querySelector("input").value, "Edited");
    assert.equal(dom.window.document.querySelectorAll("[data-slot=popover-focus-guard]").length, 0);
  });
});

test("Popover outside pointer listeners belong to the iframe document", async () => {
  await withHydratedDom(React.createElement("div"), async dom => {
    const frame = dom.window.document.createElement("iframe");
    dom.window.document.body.append(frame);
    const doc = frame.contentDocument;
    const root = ReactDOMClient.createRoot(doc.body);
    try {
      await act(async () => root.render(React.createElement(React.Fragment, null,
        React.createElement("button", { id: "frame-outside" }, "Outside frame panel"),
        React.createElement(Popover.Root, null,
          React.createElement(Popover.Trigger, null, "Frame trigger"),
          React.createElement(Popover.Content, { "aria-label": "Frame panel", initialFocus: false }, "Frame content")))));
      await act(async () => dispatchPointerActivation(doc.querySelector("[data-slot=popover-trigger]"), "mouse"));
      assert.ok(doc.querySelector("[role=dialog][data-state=open]"));
      await act(async () => dispatchPointerActivation(doc.getElementById("frame-outside"), "mouse"));
      await act(async () => new Promise(resolve => setTimeout(resolve, 40)));
      assert.equal(doc.querySelector("[role=dialog]"), null);
    } finally {
      await act(async () => root.unmount());
      frame.remove();
    }
  });
});
test("Popover pointer-down callback can veto completed outside dismissal", async () => {
  await withHydratedDom(React.createElement(Popover.Root, { defaultOpen: true, onPointerDownOutside: event => event.preventDefault() },
    React.createElement(Popover.Trigger, null, "Open"),
    React.createElement(Popover.Content, { "aria-label": "Veto", initialFocus: false }, "Content")), async dom => {
    const outside = dom.window.document.getElementById("outside");
    await act(async () => {
      dispatchPointerEvent(outside, "pointerdown");
      dispatchPointerEvent(outside, "pointerup");
      outside.click();
    });
    assert.ok(dom.window.document.querySelector("[role=dialog][data-state=open]"));
  });
});

function dispatchPointerDown(element, pointerType = "mouse") {
  dispatchPointerEvent(element, "pointerdown", pointerType);
}

test("Popover requests dismissal when a retained ancestor closes", async () => {
  let closeParent;
  const notifications = [];
  function Fixture() {
    const [open, setOpen] = useState(true);
    closeParent = () => setOpen(false);
    return React.createElement(Popover.Root, { open, onOpenChange: setOpen, unmountOnExit: false },
      React.createElement(Popover.Trigger, null, "Parent"),
      React.createElement(Popover.Content, { "aria-label": "Parent", initialFocus: false },
        React.createElement(Popover.Root, { defaultOpen: true, onRequestDismiss: event => notifications.push(event.type) },
          React.createElement(Popover.Trigger, null, "Child"),
          React.createElement(Popover.Content, { "aria-label": "Child", initialFocus: false }, "Retained child"))));
  }
  await withHydratedDom(React.createElement(Fixture), async dom => {
    await act(async () => { closeParent(); });
    await act(async () => new Promise(resolve => setTimeout(resolve, 40)));
    assert.deepEqual(notifications, ["ancestor-dismiss"]);
    assert.equal(dom.window.document.querySelector('[aria-label="Child"][data-state="open"]'), null);
  });
});

test("Popover closes when its active trigger is removed without focusing a detached node", async () => {
  let remove;
  function Fixture() {
    const [shown, setShown] = useState(true);
    remove = () => setShown(false);
    return React.createElement(Popover.Root, null,
      shown && React.createElement(Popover.Trigger, { value: "active" }, "Active"),
      React.createElement(Popover.Content, { "aria-label": "Removable" }, "Content"));
  }
  await withHydratedDom(React.createElement(Fixture), async dom => {
    await act(async () => dispatchPointerActivation(dom.window.document.querySelector('[data-slot="popover-trigger"]'), "mouse"));
    await act(async () => remove());
    await act(async () => new Promise(resolve => setTimeout(resolve, 40)));
    assert.equal(dom.window.document.querySelector('[aria-label="Removable"][data-state="open"]'), null);
  });
});

function dispatchPointerEvent(
  element,
  type,
  pointerType = "mouse",
  { pointerId = 1, clientX = 0, clientY = 0 } = {},
) {
  const event = new element.ownerDocument.defaultView.MouseEvent(
    type,
    { bubbles: true, button: 0, clientX, clientY },
  );
  Object.defineProperty(event, "pointerType", { value: pointerType });
  Object.defineProperty(event, "pointerId", { value: pointerId });
  Object.defineProperty(event, "isPrimary", { value: true });
  element.dispatchEvent(event);
}

function FocusFixture({
  triggerMode = "click",
  openDelay = 0,
  closeDelay = 0,
  initialFocus,
  finalFocus,
  details,
  onOpenChange,
}) {
  const inputRef = useRef(null);
  return React.createElement(
    Popover.Root,
    { triggerMode, openDelay, closeDelay, onOpenChange },
    React.createElement(Popover.Trigger, null, "Open popover"),
    React.createElement(
      Popover.Content,
      {
        initialFocus: initialFocus === "input"
          ? (value) => {
              details?.push(value);
              return inputRef.current;
            }
          : initialFocus,
        finalFocus,
      },
      React.createElement(Popover.Title, null, "Project settings"),
      React.createElement(Popover.Description, null, "Compact options"),
      React.createElement("input", { ref: inputRef, "data-testid": "first-input" }),
      React.createElement(Popover.Close, null, "Done"),
    ),
  );
}

function NestedMenuFixture() {
  const [portalContainer, setPortalContainer] = useState(null);

  return React.createElement(
    "div",
    { ref: setPortalContainer },
    React.createElement(
      Popover.Root,
      null,
      React.createElement(Popover.Trigger, null, "Open notifications"),
      React.createElement(
        Popover.Portal,
        { container: portalContainer },
        React.createElement(
          Popover.Content,
          null,
          React.createElement(Popover.Title, null, "Notifications"),
          React.createElement(
            DropdownMenu.Root,
            null,
            React.createElement(DropdownMenu.Trigger, null, "Filter notifications"),
            React.createElement(
              DropdownMenu.Portal,
              { container: portalContainer },
              React.createElement(
                DropdownMenu.Content,
                null,
                React.createElement(
                  DropdownMenu.RadioGroup,
                  { value: "all" },
                  React.createElement(DropdownMenu.RadioItem, { value: "all" }, "All"),
                  React.createElement(DropdownMenu.RadioItem, { value: "unread" }, "Unread"),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

test("Popover mouse and touch opening use interaction-aware initial focus", async () => {
  for (const [pointerType, expectedSelector] of [
    ["mouse", "[data-testid=first-input]"],
    ["pen", "[data-testid=first-input]"],
    ["touch", "[data-slot=popover-content]"],
  ]) {
    const details = [];
    await withHydratedDom(
      React.createElement(FocusFixture, {
        initialFocus: pointerType === "touch" ? undefined : "input",
        details,
      }),
      async (dom) => {
        const trigger = dom.window.document.querySelector("[data-slot=popover-trigger]");
        await act(async () => {
          dispatchPointerActivation(trigger, pointerType);
          await new Promise((resolve) => setTimeout(resolve, 20));
        });
        assert.equal(
          dom.window.document.activeElement,
          dom.window.document.querySelector(expectedSelector),
        );
        if (pointerType !== "touch") {
          assert.deepEqual(details[0], {
            interactionType: pointerType,
            reason: "triggerClick",
          });
        }
      },
    );
  }
});

test("Popover hover opening never steals focus", async () => {
  const details = [];
  await withHydratedDom(
    React.createElement(FocusFixture, {
      triggerMode: "hover",
      initialFocus: "input",
      details,
    }),
    async (dom) => {
      const trigger = dom.window.document.querySelector("[data-slot=popover-trigger]");
      trigger.focus();
      await act(async () => {
        trigger.dispatchEvent(new dom.window.MouseEvent("mouseover", { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.ok(dom.window.document.querySelector("[data-slot=popover-content]"));
      assert.equal(dom.window.document.activeElement, trigger);
      assert.deepEqual(details, []);
    },
  );
});

test("Popover remains open while focus moves into a portalled descendant menu", async () => {
  await withHydratedDom(
    React.createElement(NestedMenuFixture),
    async (dom) => {
      const popoverTrigger = dom.window.document.querySelector(
        "[data-slot=popover-trigger]",
      );
      await act(async () => {
        dispatchPointerActivation(popoverTrigger, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      const menuTrigger = dom.window.document.querySelector(
        "[data-slot=dropdown-menu-trigger]",
      );
      await act(async () => {
        dispatchPointerActivation(menuTrigger, "mouse");
        menuTrigger.blur();
        await new Promise((resolve) => setTimeout(resolve, 45));
      });

      assert.ok(dom.window.document.querySelector("[data-slot=popover-content]"));
      const menuContent = dom.window.document.querySelector("[data-slot=menu-content]");
      const menuItem = dom.window.document.querySelector("[data-slot=menu-radio-item]");
      assert.ok(menuContent);
      assert.ok(menuItem);

      await act(async () => {
        menuItem.focus();
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      assert.equal(
        menuContent.contains(dom.window.document.activeElement),
        true,
        `Focus destination: ${dom.window.document.activeElement?.outerHTML}; menu connected: ${menuContent.isConnected}`,
      );
      assert.ok(dom.window.document.querySelector("[data-slot=popover-content]"));
    },
  );
});

test("Popover Close restores focus while outside activation preserves its target", async () => {
  await withHydratedDom(
    React.createElement(FocusFixture),
    async (dom) => {
      const trigger = dom.window.document.querySelector("[data-slot=popover-trigger]");
      await act(async () => {
        dispatchPointerActivation(trigger, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      const close = dom.window.document.querySelector("[data-slot=popover-close]");
      await act(async () => {
        dispatchPointerActivation(close, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.equal(dom.window.document.activeElement, trigger);

      await act(async () => {
        dispatchPointerActivation(trigger, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      const outside = dom.window.document.getElementById("outside");
      await act(async () => {
        dispatchPointerDown(outside);
        outside.focus();
        dispatchPointerEvent(outside, "pointerup");
        outside.dispatchEvent(new dom.window.MouseEvent("click", {
          bubbles: true,
          button: 0,
        }));
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.equal(dom.window.document.activeElement, outside);
      assert.equal(dom.window.document.querySelector("[data-slot=popover-content]"), null);
    },
  );
});

test("Popover distinguishes an outside touch tap from a scroll gesture", async () => {
  await withHydratedDom(
    React.createElement(FocusFixture),
    async (dom) => {
      const trigger = dom.window.document.querySelector("[data-slot=popover-trigger]");
      const outside = dom.window.document.getElementById("outside");
      await act(async () => {
        dispatchPointerActivation(trigger, "touch");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      await act(async () => {
        dispatchPointerEvent(outside, "pointerdown", "touch", {
          pointerId: 7,
          clientX: 20,
          clientY: 20,
        });
        dom.window.document.dispatchEvent(new dom.window.Event("scroll"));
        dispatchPointerEvent(outside, "pointerup", "touch", {
          pointerId: 7,
          clientX: 20,
          clientY: 20,
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.ok(dom.window.document.querySelector("[data-slot=popover-content]"));

      await act(async () => {
        dispatchPointerEvent(outside, "pointerdown", "touch", {
          pointerId: 8,
          clientX: 20,
          clientY: 20,
        });
        dispatchPointerEvent(outside, "pointermove", "touch", {
          pointerId: 8,
          clientX: 20,
          clientY: 40,
        });
        dispatchPointerEvent(outside, "pointerup", "touch", {
          pointerId: 8,
          clientX: 20,
          clientY: 40,
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.ok(dom.window.document.querySelector("[data-slot=popover-content]"));

      await act(async () => {
        dispatchPointerEvent(outside, "pointerdown", "touch", {
          pointerId: 9,
          clientX: 20,
          clientY: 20,
        });
        dispatchPointerEvent(outside, "pointerup", "touch", {
          pointerId: 9,
          clientX: 22,
          clientY: 22,
        });
        outside.dispatchEvent(new dom.window.MouseEvent("click", {
          bubbles: true,
          button: 0,
        }));
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.equal(dom.window.document.querySelector("[data-slot=popover-content]"), null);
    },
  );
});

test("Popover Escape reports its reason and restores the intentional session", async () => {
  const changes = [];
  await withHydratedDom(
    React.createElement(FocusFixture, {
      onOpenChange: (open, reason) => changes.push({ open, reason }),
    }),
    async (dom) => {
      const trigger = dom.window.document.querySelector("[data-slot=popover-trigger]");
      await act(async () => {
        dispatchPointerActivation(trigger, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      await act(async () => {
        dom.window.document.dispatchEvent(new dom.window.KeyboardEvent(
          "keydown",
          { bubbles: true, key: "Escape" },
        ));
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.equal(dom.window.document.activeElement, trigger);
      assert.deepEqual(changes, [
        { open: true, reason: undefined },
        { open: false, reason: "escapeKeyDown" },
      ]);
    },
  );
});

test("Popover explicit false targets suppress automatic focus operations", async () => {
  await withHydratedDom(
    React.createElement(FocusFixture, { initialFocus: false, finalFocus: false }),
    async (dom) => {
      const trigger = dom.window.document.querySelector("[data-slot=popover-trigger]");
      trigger.focus();
      await act(async () => {
        dispatchPointerActivation(trigger, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.equal(dom.window.document.activeElement, trigger);
      const close = dom.window.document.querySelector("[data-slot=popover-close]");
      close.focus();
      await act(async () => {
        dispatchPointerActivation(close, "mouse");
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      assert.notEqual(dom.window.document.activeElement, trigger);
    },
  );
});
