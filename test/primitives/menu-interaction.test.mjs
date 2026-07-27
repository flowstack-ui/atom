import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";
import { Menu, DropdownMenu, ContextMenu, Menubar } from "../../dist/index.js";

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

test("Dropdown Menu submenu focus drills in and Escape restores each owner", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    await React.act(async () => root.render(
      React.createElement(DropdownMenu.Root, null,
        React.createElement(DropdownMenu.Trigger, null, "Actions"),
        React.createElement(DropdownMenu.Content, null,
          React.createElement(DropdownMenu.Sub, null,
            React.createElement(DropdownMenu.SubTrigger, { value: "share" }, "Share"),
            React.createElement(DropdownMenu.SubContent, { ariaLabel: "Share actions" },
              React.createElement(DropdownMenu.Item, { value: "copy" }, "Copy link"),
            ),
          ),
        ),
      ),
    ));
    const trigger = container.querySelector("[data-slot=dropdown-menu-trigger]");
    await dispatch(trigger, new window.MouseEvent("click", { bubbles: true }));
    await wait();
    assert.equal(document.activeElement?.textContent, "Share");
    await key(document.activeElement, "ArrowRight");
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
