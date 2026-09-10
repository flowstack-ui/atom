import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import {
  assert,
  test,
  React,
} from "../test-utils.mjs";

import { Dialog } from "../../dist/index.js";

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
    pretendToBeVisual: true,
    url: "https://example.test/",
  });
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    HTMLElement: globalThis.HTMLElement,
    Element: globalThis.Element,
    Node: globalThis.Node,
    MutationObserver: globalThis.MutationObserver,
    getComputedStyle: globalThis.getComputedStyle,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    cancelAnimationFrame: globalThis.cancelAnimationFrame,
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Element = dom.window.Element;
  globalThis.Node = dom.window.Node;
  globalThis.MutationObserver = dom.window.MutationObserver;
  globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  globalThis.requestAnimationFrame = (callback) =>
    globalThis.setTimeout(() => callback(Date.now()), 0);
  globalThis.cancelAnimationFrame = (handle) => globalThis.clearTimeout(handle);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.scrollTo = () => {};

  return {
    container: dom.window.document.getElementById("root"),
    cleanup() {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) {
          delete globalThis[key];
        } else {
          globalThis[key] = value;
        }
      }
      dom.window.close();
    },
  };
}

async function wait(milliseconds) {
  await React.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  });
}

function SearchDialog({ open, onExitComplete }) {
  return React.createElement(
    Dialog.Root,
    { open, onOpenChange: () => {}, onExitComplete },
    React.createElement(Dialog.Trigger, null, "Search"),
    React.createElement(
      Dialog.Portal,
      null,
      React.createElement(Dialog.Overlay, { className: "search-overlay" }),
      React.createElement(
        Dialog.Content,
        { className: "search-dialog" },
        React.createElement(Dialog.Title, null, "Search docs"),
        React.createElement(Dialog.Description, null, "Search documentation."),
        React.createElement("button", { type: "button" }, "Result"),
      ),
    ),
  );
}

test("presence exits when global transition CSS does not emit an end event", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    document.head.appendChild(document.createElement("style")).textContent =
      "* { transition-duration: 1ms; }";

    await React.act(async () => {
      root.render(React.createElement(SearchDialog, { open: true }));
    });

    assert.ok(document.querySelector('[data-slot="dialog-overlay"]'));
    assert.ok(document.querySelector('[data-slot="dialog-content"]'));

    await React.act(async () => {
      root.render(React.createElement(SearchDialog, { open: false }));
    });

    await wait(80);

    assert.equal(document.querySelector('[data-slot="dialog-overlay"]'), null);
    assert.equal(document.querySelector('[data-slot="dialog-content"]'), null);
  } finally {
    await React.act(async () => {
      root.unmount();
    });
    cleanup();
  }
});

test("one root exit waits for both surfaces and cancels stale reopening work", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  let completions = 0;
  const onExitComplete = () => { completions++; };
  const render = open => React.act(async () => root.render(React.createElement(SearchDialog, { open, onExitComplete })));
  try {
    document.head.appendChild(document.createElement("style")).textContent = `
      .search-overlay { transition-property: opacity; transition-duration: 80ms; }
      .search-dialog { transition-property: opacity; transition-duration: 5ms; }
    `;
    await render(true); await render(false);
    await wait(40); assert.equal(completions, 0);
    await render(true); await wait(150); assert.equal(completions, 0);
    await render(false); await wait(40); assert.equal(completions, 0);
    await wait(150); assert.equal(completions, 1);
    await wait(50); assert.equal(completions, 1);
  } finally { await React.act(async () => root.unmount()); cleanup(); }
});

test("root exit without animated parts completes exactly once", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  let completions = 0;
  const onExitComplete = () => { completions++; };
  try {
    await React.act(async () => root.render(React.createElement(Dialog.Root, { open: true, onExitComplete })));
    await React.act(async () => root.render(React.createElement(Dialog.Root, { open: false, onExitComplete })));
    await wait(50); assert.equal(completions, 1);
    await React.act(async () => root.render(React.createElement(Dialog.Root, { open: false, onExitComplete })));
    await wait(50); assert.equal(completions, 1);
  } finally { await React.act(async () => root.unmount()); cleanup(); }
});

test("presence respects repeated animation duration before using its fallback", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    document.head.appendChild(document.createElement("style")).textContent = `
      @keyframes presence-exit { from { opacity: 1; } to { opacity: 0; } }
      .search-overlay, .search-dialog {
        animation-name: presence-exit;
        animation-duration: 20ms;
        animation-iteration-count: 4;
      }
    `;

    await React.act(async () => {
      root.render(React.createElement(SearchDialog, { open: true }));
    });
    await React.act(async () => {
      root.render(React.createElement(SearchDialog, { open: false }));
    });

    await wait(70);
    assert.ok(document.querySelector('[data-slot="dialog-overlay"]'));
    assert.ok(document.querySelector('[data-slot="dialog-content"]'));

    await wait(90);
    assert.equal(document.querySelector('[data-slot="dialog-overlay"]'), null);
    assert.equal(document.querySelector('[data-slot="dialog-content"]'), null);
  } finally {
    await React.act(async () => {
      root.unmount();
    });
    cleanup();
  }
});

test("presence repeats transition timing lists and ignores descendant end events", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  try {
    document.head.appendChild(document.createElement("style")).textContent = `
      .search-overlay, .search-dialog {
        transition-property: opacity, transform;
        transition-duration: 1ms;
        transition-delay: 0ms, 80ms;
      }
    `;

    await React.act(async () => {
      root.render(React.createElement(SearchDialog, { open: true }));
    });
    await React.act(async () => {
      root.render(React.createElement(SearchDialog, { open: false }));
    });

    document.querySelector(".search-dialog button").dispatchEvent(
      new window.Event("transitionend", { bubbles: true }),
    );
    await wait(70);
    assert.ok(document.querySelector('[data-slot="dialog-overlay"]'));
    assert.ok(document.querySelector('[data-slot="dialog-content"]'));

    await wait(90);
    assert.equal(document.querySelector('[data-slot="dialog-overlay"]'), null);
    assert.equal(document.querySelector('[data-slot="dialog-content"]'), null);
  } finally {
    await React.act(async () => {
      root.unmount();
    });
    cleanup();
  }
});
