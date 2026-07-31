import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";
import { Combobox, Menu, DropdownMenu, ContextMenu, Menubar } from "../../dist/index.js";

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
    pretendToBeVisual: true,
    url: "https://example.test/",
  });
  const keys = ["window", "document", "HTMLElement", "SVGElement", "Element", "Node", "Event", "MouseEvent", "KeyboardEvent", "PointerEvent", "MutationObserver", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "addEventListener", "removeEventListener", "ResizeObserver", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(keys.map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    SVGElement: dom.window.SVGElement,
    Element: dom.window.Element,
    Node: dom.window.Node,
    Event: dom.window.Event,
    MouseEvent: dom.window.MouseEvent,
    KeyboardEvent: dom.window.KeyboardEvent,
    PointerEvent: dom.window.PointerEvent ?? dom.window.MouseEvent,
    MutationObserver: dom.window.MutationObserver,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    addEventListener: dom.window.addEventListener.bind(dom.window),
    removeEventListener: dom.window.removeEventListener.bind(dom.window),
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  dom.window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
  return {
    container: dom.window.document.getElementById("root"),
    cleanup() {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
      dom.window.close();
    },
  };
}

async function wait(milliseconds = 40) {
  await React.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  });
}

async function dispatch(target, event) {
  await React.act(async () => target.dispatchEvent(event));
}

function key(target, value, shiftKey = false) {
  return dispatch(target, new window.KeyboardEvent("keydown", { key: value, shiftKey, bubbles: true, cancelable: true }));
}

function pointerEvent(target, type, {
  clientX = 0,
  clientY = 0,
  pointerId = 1,
  pointerType = "mouse",
} = {}) {
  const event = new window.MouseEvent(type, {
    bubbles: true,
    button: 0,
    clientX,
    clientY,
  });
  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerId: { value: pointerId },
    pointerType: { value: pointerType },
  });
  return dispatch(target, event);
}

async function pointerActivation(target, options) {
  await pointerEvent(target, "pointerdown", options);
  await pointerEvent(target, "pointerup", options);
  await dispatch(target, new window.MouseEvent("click", {
    bubbles: true,
    button: 0,
    detail: 1,
  }));
}

test("Dropdown Menu moves real focus through disabled items and exits its owner with Tab", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const selected = [];
  try {
    await React.act(async () => root.render(
      React.createElement(React.Fragment, null,
        React.createElement("button", { id: "before" }, "Before"),
        React.createElement(DropdownMenu.Root, null,
          React.createElement(DropdownMenu.Trigger, { id: "trigger" }, "Actions"),
          React.createElement(DropdownMenu.Content, null,
            React.createElement(DropdownMenu.Item, { value: "first", onSelect: () => selected.push("first") }, "First"),
            React.createElement(DropdownMenu.Item, { value: "disabled", disabled: true, onSelect: () => selected.push("disabled") }, "Disabled"),
            React.createElement(DropdownMenu.Item, { value: "last", onSelect: () => selected.push("last") }, "Last"),
          ),
        ),
        React.createElement("button", { id: "after" }, "After"),
      ),
    ));
    const trigger = container.querySelector("[data-slot=dropdown-menu-trigger]");
    await dispatch(trigger, new window.MouseEvent("click", { bubbles: true }));
    await wait();
    assert.equal(document.activeElement?.textContent, "First");
    await key(document.activeElement, "End");
    assert.equal(document.activeElement?.textContent, "Last");
    await key(document.activeElement, "Home");
    assert.equal(document.activeElement?.textContent, "First");
    await key(document.activeElement, "l");
    assert.equal(document.activeElement?.textContent, "Last");
    await key(document.activeElement, "ArrowDown");
    assert.equal(document.activeElement?.textContent, "First");
    await key(document.activeElement, "ArrowDown");
    assert.equal(document.activeElement?.textContent, "Disabled");
    await key(document.activeElement, "Enter");
    assert.deepEqual(selected, []);
    assert.ok(document.querySelector("[role=menu]"));
    await key(document.activeElement, "ArrowDown");
    await key(document.activeElement, "Enter");
    await wait();
    assert.deepEqual(selected, ["last"]);
    assert.equal(document.activeElement, trigger);

    await dispatch(trigger, new window.MouseEvent("click", { bubbles: true }));
    await wait();
    await key(document.activeElement, "Tab");
    await wait();
    assert.equal(document.activeElement?.id, "after");

    await dispatch(trigger, new window.MouseEvent("click", { bubbles: true }));
    await wait();
    await key(document.activeElement, "Tab", true);
    await wait();
    assert.equal(document.activeElement?.id, "before");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Dropdown Menu commits only a completed outside activation and keeps it preventable", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const interactions = [];
  let preventOutside = false;
  let outsideClicks = 0;

  function Example() {
    return React.createElement(React.Fragment, null,
      React.createElement(DropdownMenu.Root, null,
        React.createElement(DropdownMenu.Trigger, { id: "outside-trigger" }, "Actions"),
        React.createElement(DropdownMenu.Content, {
          onInteractOutside: (event) => {
            interactions.push(event.pointerType);
            if (preventOutside) event.preventDefault();
          },
        },
        React.createElement(DropdownMenu.Item, { value: "one" }, "One"),
        ),
      ),
      React.createElement("button", {
        id: "outside-target",
        onClick: () => { outsideClicks += 1; },
      }, "Outside"),
    );
  }

  try {
    await React.act(async () => root.render(React.createElement(Example)));
    const trigger = container.querySelector("[data-slot=dropdown-menu-trigger]");
    const outside = container.querySelector("#outside-target");
    await dispatch(trigger, new window.MouseEvent("click", { bubbles: true }));
    await wait();

    await pointerEvent(outside, "pointerdown");
    assert.ok(document.querySelector("[role=menu]"));
    await pointerEvent(outside, "pointerup");
    assert.ok(document.querySelector("[role=menu]"));
    await dispatch(outside, new window.MouseEvent("click", { bubbles: true, detail: 1 }));
    await wait();
    assert.equal(document.querySelector("[role=menu]"), null);
    assert.deepEqual(interactions, ["mouse"]);
    assert.equal(outsideClicks, 1);

    await dispatch(trigger, new window.MouseEvent("click", { bubbles: true }));
    await wait();
    preventOutside = true;
    await pointerActivation(outside, { pointerType: "touch", pointerId: 4 });
    await wait();
    assert.ok(document.querySelector("[role=menu]"));
    assert.deepEqual(interactions, ["mouse", "touch"]);
    assert.equal(outsideClicks, 2);

    preventOutside = false;
    await pointerEvent(outside, "pointerdown", { clientX: 0, clientY: 0, pointerId: 5 });
    await pointerEvent(outside, "pointermove", { clientX: 20, clientY: 0, pointerId: 5 });
    await pointerEvent(outside, "pointerup", { clientX: 20, clientY: 0, pointerId: 5 });
    await dispatch(outside, new window.MouseEvent("click", { bubbles: true, detail: 1 }));
    await wait();
    assert.ok(document.querySelector("[role=menu]"));
    assert.deepEqual(interactions, ["mouse", "touch"]);
    assert.equal(outsideClicks, 3);

    const menu = document.querySelector("[role=menu]");
    await pointerEvent(menu, "pointerdown", { pointerId: 6 });
    await pointerEvent(outside, "pointerup", { pointerId: 6 });
    await dispatch(outside, new window.MouseEvent("click", { bubbles: true, detail: 1 }));
    await wait();
    assert.ok(document.querySelector("[role=menu]"));
    assert.deepEqual(interactions, ["mouse", "touch"]);
    assert.equal(outsideClicks, 4);

    await pointerEvent(outside, "pointerdown", { pointerId: 8, pointerType: "touch" });
    await pointerEvent(outside, "pointerdown", { pointerId: 9, pointerType: "touch" });
    await pointerEvent(outside, "pointerup", { pointerId: 8, pointerType: "touch" });
    await dispatch(outside, new window.MouseEvent("click", { bubbles: true, detail: 1 }));
    await wait();
    assert.ok(document.querySelector("[role=menu]"));
    assert.deepEqual(interactions, ["mouse", "touch"]);
    assert.equal(outsideClicks, 5);

    await dispatch(outside, new window.MouseEvent("click", { bubbles: true, detail: 0 }));
    await wait();
    assert.equal(document.querySelector("[role=menu]"), null);
    assert.deepEqual(interactions, ["mouse", "touch", "virtual"]);
    assert.equal(outsideClicks, 6);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Combobox supports preventable virtual and touch outside activation", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const interactions = [];
  let preventOutside = true;
  let outsideClicks = 0;

  function Example() {
    return React.createElement(React.Fragment, null,
      React.createElement(Combobox.Root, {
        defaultOpen: true,
        options: [{ value: "one", label: "One" }],
      },
      React.createElement(Combobox.Input, { "aria-label": "Choice" }),
      React.createElement(Combobox.Content, {
        onInteractOutside: (event) => {
          interactions.push(event.pointerType);
          if (preventOutside) event.preventDefault();
        },
      },
      React.createElement(Combobox.Listbox, null,
        React.createElement(Combobox.Item, {
          label: "One",
          value: "one",
        }, "One"),
      ),
      ),
      ),
      React.createElement("button", {
        id: "combobox-outside",
        onClick: () => { outsideClicks += 1; },
      }, "Outside"),
    );
  }

  try {
    await React.act(async () => root.render(React.createElement(Example)));
    await wait();
    const outside = container.querySelector("#combobox-outside");
    assert.ok(document.querySelector("[role=listbox]"));

    await dispatch(outside, new window.MouseEvent("click", {
      bubbles: true,
      button: 0,
      detail: 0,
    }));
    await wait();
    assert.ok(document.querySelector("[role=listbox]"));
    assert.deepEqual(interactions, ["virtual"]);
    assert.equal(outsideClicks, 1);

    preventOutside = false;
    await pointerActivation(outside, { pointerType: "touch", pointerId: 7 });
    await wait();
    assert.equal(document.querySelector("[role=listbox]"), null);
    assert.deepEqual(interactions, ["virtual", "touch"]);
    assert.equal(outsideClicks, 2);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("standalone Menu exits from its focus origin in either Tab direction", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  function Example() {
    const [open, setOpen] = React.useState(false);
    return React.createElement(React.Fragment, null,
      React.createElement("button", { id: "before" }, "Before"),
      React.createElement("button", { id: "origin", onClick: () => setOpen(true) }, "Open"),
      React.createElement(Menu.Root, { open, onOpenChange: setOpen },
        React.createElement(Menu.Content, { ariaLabel: "Actions" },
          React.createElement(Menu.Item, { value: "one" }, "One"),
        ),
      ),
      React.createElement("button", { id: "after" }, "After"),
    );
  }
  try {
    await React.act(async () => root.render(React.createElement(Example)));
    const origin = container.querySelector("#origin");
    await React.act(async () => origin.focus());
    await dispatch(origin, new window.MouseEvent("click", { bubbles: true }));
    await wait();
    assert.equal(document.activeElement?.textContent, "One");
    await key(document.activeElement, "Tab");
    await wait();
    assert.equal(document.activeElement?.id, "after");

    await React.act(async () => origin.focus());
    await dispatch(origin, new window.MouseEvent("click", { bubbles: true }));
    await wait();
    await key(document.activeElement, "Tab", true);
    await wait();
    assert.equal(document.activeElement?.id, "before");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Dropdown Menu submenu focus drills in and dismisses at the correct tree boundary", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
    const parentOutside = [];
    const submenuOutside = [];
    try {
      await React.act(async () => root.render(
        React.createElement(React.Fragment, null,
          React.createElement(DropdownMenu.Root, null,
            React.createElement(DropdownMenu.Trigger, null, "Actions"),
            React.createElement(DropdownMenu.Content, {
              onInteractOutside: (event) => parentOutside.push(event.pointerType),
            },
              React.createElement(DropdownMenu.Label, null, "Project commands"),
              React.createElement(DropdownMenu.Sub, null,
                React.createElement(DropdownMenu.SubTrigger, { value: "share" }, "Share"),
                React.createElement(DropdownMenu.SubContent, {
                  ariaLabel: "Share actions",
                  onInteractOutside: (event) => submenuOutside.push(event.pointerType),
                },
                  React.createElement(DropdownMenu.Item, { value: "copy" }, "Copy link"),
                ),
              ),
            ),
          ),
          React.createElement("button", { id: "submenu-outside" }, "Outside menus"),
        ),
    ));
    const trigger = container.querySelector("[data-slot=dropdown-menu-trigger]");
    await dispatch(trigger, new window.MouseEvent("click", { bubbles: true }));
    await wait();
    const subTrigger = document.querySelector("[data-slot=menu-sub-trigger]");
    assert.equal(document.activeElement?.textContent, "Share");
    await key(document.activeElement, "ArrowRight");
    await wait();
    assert.equal(document.activeElement?.textContent, "Copy link");
    assert.equal(document.querySelectorAll("[role=menu]").length, 2);

    await pointerActivation(document.querySelector("[data-slot=menu-label]"), { pointerId: 20 });
    await wait();
    assert.equal(document.querySelectorAll("[role=menu]").length, 1);
    assert.deepEqual(submenuOutside, ["mouse"]);
    assert.deepEqual(parentOutside, []);

    await React.act(async () => subTrigger.focus());
    await key(subTrigger, "ArrowRight");
    await wait();
    assert.equal(document.querySelectorAll("[role=menu][data-state=open]").length, 2);
    await pointerActivation(container.querySelector("#submenu-outside"), { pointerId: 21 });
    await wait();
    assert.equal(document.querySelectorAll("[role=menu][data-state=open]").length, 0);
    assert.deepEqual(submenuOutside, ["mouse", "mouse"]);
    assert.deepEqual(parentOutside, []);

    await dispatch(trigger, new window.MouseEvent("click", { bubbles: true }));
    await wait();

    const reopenedSubTrigger = document.querySelector("[data-slot=menu-sub-trigger]");
    await React.act(async () => reopenedSubTrigger.focus());
    await key(reopenedSubTrigger, "ArrowRight");
    await wait();
    assert.equal(document.activeElement?.textContent, "Copy link");
    await key(document.activeElement, "Escape");
    await wait();
    assert.equal(document.activeElement?.textContent, "Share");
    assert.equal(document.querySelectorAll("[role=menu]").length, 1);
    await key(document.activeElement, "Escape");
    await wait();
    assert.equal(document.activeElement, trigger);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Context Menu re-invokes through modal isolation and replaces the active target", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const firstChanges = [];
  const secondChanges = [];
  const consumerInvocations = [];
  let preventFirstInvocation = false;
  try {
    await React.act(async () => root.render(
      React.createElement(React.Fragment, null,
        React.createElement(ContextMenu.Root, { onOpenChange: (open) => firstChanges.push(open) },
          React.createElement(ContextMenu.Trigger, {
            asChild: true,
            onContextMenu: (event) => {
              consumerInvocations.push("first");
              if (preventFirstInvocation) event.preventDefault();
            },
          }, React.createElement("button", { "data-test-context": "first" }, "First target")),
          React.createElement(ContextMenu.Content, { ariaLabel: "First actions" },
            React.createElement(ContextMenu.Item, { value: "first" }, "First command"),
          ),
        ),
        React.createElement(ContextMenu.Root, { onOpenChange: (open) => secondChanges.push(open) },
          React.createElement(ContextMenu.Trigger, {
            asChild: true,
            onContextMenu: () => consumerInvocations.push("second"),
          }, React.createElement("button", { "data-test-context": "second" }, "Second target")),
          React.createElement(ContextMenu.Content, { ariaLabel: "Second actions" },
            React.createElement(ContextMenu.Item, { value: "second" }, "Second command"),
          ),
        ),
      ),
    ));
    const first = container.querySelector("[data-test-context=first]");
    const second = container.querySelector("[data-test-context=second]");
    first.getBoundingClientRect = () => ({ x: 10, y: 10, left: 10, top: 10, right: 110, bottom: 60, width: 100, height: 50, toJSON() {} });
    second.getBoundingClientRect = () => ({ x: 120, y: 10, left: 120, top: 10, right: 220, bottom: 60, width: 100, height: 50, toJSON() {} });

    await dispatch(first, new window.MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 20,
      clientY: 20,
    }));
    await wait();
    assert.equal(first.getAttribute("data-state"), "open");

    preventFirstInvocation = true;
    const cancelledRepeat = new window.MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 30,
      clientY: 30,
    });
    await dispatch(document.body, cancelledRepeat);
    await wait();
    assert.equal(cancelledRepeat.defaultPrevented, true);
    assert.equal(first.getAttribute("data-state"), "open");
    assert.deepEqual(firstChanges, [true]);

    preventFirstInvocation = false;
    const repeated = new window.MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 40,
      clientY: 40,
    });
    await dispatch(document.body, repeated);
    await wait();
    assert.equal(repeated.defaultPrevented, true);
    assert.equal(first.getAttribute("data-state"), "open");

    const switched = new window.MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 130,
      clientY: 20,
    });
    await dispatch(document.body, switched);
    await wait();
    assert.equal(switched.defaultPrevented, true);
    assert.equal(first.getAttribute("data-state"), "closed");
    assert.equal(second.getAttribute("data-state"), "open");
    assert.deepEqual(consumerInvocations, ["first", "first", "first", "second"]);
    assert.deepEqual(firstChanges, [true, true, false]);
    assert.deepEqual(secondChanges, [true]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Dropdown Menu requires mouse movement before hover-opening a newly mounted submenu trigger", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => root.render(
      React.createElement(DropdownMenu.Root, { defaultOpen: true },
        React.createElement(DropdownMenu.Trigger, null, "Actions"),
        React.createElement(DropdownMenu.Content, null,
          React.createElement(DropdownMenu.Item, { value: "rename" }, "Rename"),
          React.createElement(DropdownMenu.Sub, null,
            React.createElement(DropdownMenu.SubTrigger, { value: "move" }, "Move"),
            React.createElement(DropdownMenu.SubContent, null,
              React.createElement(DropdownMenu.Item, { value: "archive" }, "Archive"),
            ),
          ),
        ),
      ),
    ));
    await wait();
    const subTrigger = document.querySelector("[data-slot=menu-sub-trigger]");

    await pointerEvent(subTrigger, "pointerover", { clientX: 40, clientY: 50 });
    await wait(140);
    assert.equal(document.querySelectorAll("[role=menu]").length, 1);

    await pointerEvent(subTrigger, "pointermove", { clientX: 40, clientY: 50 });
    await wait(140);
    assert.equal(document.querySelectorAll("[role=menu]").length, 1);

    await pointerEvent(subTrigger, "pointermove", { clientX: 42, clientY: 50 });
    await wait(140);
    assert.equal(document.querySelectorAll("[role=menu]").length, 2);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Menu checkbox mixed state and indicators expose stable semantics", async () => {
  const html = await import("react-dom/server").then(({ renderToStaticMarkup }) => renderToStaticMarkup(
    React.createElement(DropdownMenu.Root, { defaultOpen: true },
      React.createElement(DropdownMenu.CheckboxItem, { value: "mixed", checked: "indeterminate" },
        "Mixed",
        React.createElement(DropdownMenu.ItemIndicator, null, "–"),
      ),
    ),
  ));
  assert.match(html, /aria-checked="mixed"/);
  assert.match(html, /data-state="indeterminate"/);
  assert.match(html, /data-slot="menu-item-indicator"/);
});

test("Context Menu long press opens once and movement cancels the fallback", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(
      React.createElement(ContextMenu.Root, { onOpenChange: (open) => changes.push(open) },
        React.createElement(ContextMenu.Trigger, { asChild: true }, React.createElement("button", null, "Canvas")),
        React.createElement(ContextMenu.Content, null, React.createElement(ContextMenu.Item, { value: "copy" }, "Copy")),
      ),
    ));
    const trigger = container.querySelector("button");
    const pointer = (type, init) => {
      const event = new window.Event(type, { bubbles: true, cancelable: true });
      Object.defineProperties(event, Object.fromEntries(Object.entries(init).map(([keyName, value]) => [keyName, { value }])));
      return event;
    };
    await dispatch(trigger, pointer("pointerdown", { pointerId: 1, pointerType: "touch", isPrimary: true, clientX: 20, clientY: 30 }));
    assert.equal(trigger.hasAttribute("data-pressed"), true);
    await wait(740);
    assert.deepEqual(changes, [true]);
    assert.equal(trigger.hasAttribute("data-pressed"), false);
    await dispatch(trigger, new window.MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 20, clientY: 30 }));
    assert.deepEqual(changes, [true]);

    await key(document.activeElement, "Escape");
    await wait();
    await dispatch(trigger, pointer("pointerdown", { pointerId: 2, pointerType: "pen", isPrimary: true, clientX: 10, clientY: 10 }));
    await dispatch(trigger, pointer("pointermove", { pointerId: 2, pointerType: "pen", isPrimary: true, clientX: 30, clientY: 10 }));
    await wait(740);
    assert.deepEqual(changes, [true, false]);

    await dispatch(trigger, pointer("pointerdown", { pointerId: 3, pointerType: "touch", isPrimary: true, clientX: 10, clientY: 10 }));
    await dispatch(trigger, pointer("pointerup", { pointerId: 3, pointerType: "touch", isPrimary: true, clientX: 10, clientY: 10 }));
    await wait(740);
    assert.deepEqual(changes, [true, false]);
    assert.equal(trigger.hasAttribute("data-pressed"), false);

    await dispatch(trigger, pointer("pointerdown", { pointerId: 4, pointerType: "touch", isPrimary: true, clientX: 10, clientY: 10 }));
    await dispatch(trigger, pointer("pointerdown", { pointerId: 5, pointerType: "touch", isPrimary: true, clientX: 11, clientY: 11 }));
    await wait(740);
    assert.deepEqual(changes, [true, false]);

    await dispatch(trigger, pointer("pointerdown", { pointerId: 6, pointerType: "touch", isPrimary: true, clientX: 10, clientY: 10 }));
    await dispatch(window, new window.Event("scroll", { bubbles: false }));
    await wait(740);
    assert.deepEqual(changes, [true, false]);

    await dispatch(trigger, pointer("pointerdown", { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: 10, clientY: 10 }));
    await dispatch(trigger, pointer("pointercancel", { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: 10, clientY: 10 }));
    await wait(740);
    assert.deepEqual(changes, [true, false]);

    await dispatch(trigger, pointer("pointerdown", { pointerId: 8, pointerType: "touch", isPrimary: true, clientX: 40, clientY: 50 }));
    await dispatch(trigger, new window.MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 40, clientY: 50 }));
    await wait(740);
    assert.deepEqual(changes, [true, false, true]);
    await key(document.activeElement, "Escape");
    await wait();

    await dispatch(trigger, pointer("pointerdown", { pointerId: 9, pointerType: "pen", isPrimary: true, clientX: 60, clientY: 70 }));
    await wait(740);
    assert.deepEqual(changes, [true, false, true, false, true]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Context Menu and Menubar Tab from their complete owner boundaries", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => root.render(
      React.createElement(React.Fragment, null,
        React.createElement("button", { id: "before" }, "Before"),
        React.createElement(ContextMenu.Root, null,
          React.createElement(ContextMenu.Trigger, { asChild: true }, React.createElement("button", { id: "context" }, "Canvas")),
          React.createElement(ContextMenu.Content, null, React.createElement(ContextMenu.Item, { value: "copy" }, "Copy")),
        ),
        React.createElement(Menubar.Root, null,
          React.createElement(Menubar.Menu, { value: "file" },
            React.createElement(Menubar.Trigger, null, "File"),
            React.createElement(Menubar.Content, null, React.createElement(Menubar.Item, { value: "new" }, "New")),
          ),
          React.createElement(Menubar.Menu, { value: "edit" }, React.createElement(Menubar.Trigger, null, "Edit")),
        ),
        React.createElement("button", { id: "after" }, "After"),
      ),
    ));
    const contextTrigger = container.querySelector("[data-slot=context-menu-trigger]");
    await dispatch(contextTrigger, new window.MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
    await wait();
    await key(document.activeElement, "Tab", true);
    await wait();
    assert.equal(document.activeElement?.id, "before");

    const fileTrigger = [...container.querySelectorAll("[data-slot=menubar-trigger]")].find((element) => element.textContent === "File");
    await dispatch(fileTrigger, new window.MouseEvent("click", { bubbles: true }));
    await wait();
    assert.equal(document.activeElement?.textContent, "New");
    await key(document.activeElement, "Tab");
    await wait();
    assert.equal(document.activeElement?.id, "after");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("vertical Menubar declares orientation and uses up/down roving focus", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => root.render(
      React.createElement(Menubar.Root, { orientation: "vertical" },
        React.createElement(Menubar.Menu, { value: "file" }, React.createElement(Menubar.Trigger, null, "File")),
        React.createElement(Menubar.Menu, { value: "edit" }, React.createElement(Menubar.Trigger, null, "Edit")),
      ),
    ));
    const bar = container.querySelector("[role=menubar]");
    const triggers = container.querySelectorAll("[role=menuitem]");
    assert.equal(bar.getAttribute("aria-orientation"), "vertical");
    await React.act(async () => triggers[0].focus());
    await key(triggers[0], "ArrowDown");
    assert.equal(document.activeElement, triggers[1]);
    await key(triggers[1], "ArrowUp");
    assert.equal(document.activeElement, triggers[0]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});
