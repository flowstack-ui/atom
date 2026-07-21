import {
  assert,
  test,
  React,
  renderToStaticMarkup,
} from "../test-utils.mjs";
import ReactDOMClient from "react-dom/client";
import ReactDOMServer from "react-dom/server";
import ReactDOM from "react-dom";
import jsdom from "jsdom";

import {
  AlertDialog,
  Dialog,
  Drawer,
  Modal,
  ModalBranch,
  Menu,
  Popover,
  Select,
} from "../../dist/index.js";
import { assertSupportedModalPortalContainer } from "../../dist/_internal/primitives/modal/ModalPortal.js";
import { useCreateFocusScope } from "../../dist/_internal/hooks/focus.js";

const {
  act,
  Fragment,
  StrictMode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} = React;
const { hydrateRoot } = ReactDOMClient;
const { renderToString } = ReactDOMServer;
const { createPortal } = ReactDOM;
const { JSDOM } = jsdom;

function contentAttributes(html) {
  const match = html.match(/<div ([^>]*role="(?:dialog|alertdialog)"[^>]*)>/);
  assert.ok(match, `Expected modal content in: ${html}`);
  return match[1];
}

function renderDialog(contentProps, children) {
  return renderToStaticMarkup(
    React.createElement(
      Dialog.Root,
      { defaultOpen: true },
      React.createElement(Dialog.Content, contentProps, children),
    ),
  );
}

test("Modal-family Content prefers native ARIA and retains ariaLabel compatibility", () => {
  const native = renderDialog(
    {
      "aria-label": "Native label",
      "aria-labelledby": "external-title",
      "aria-describedby": "external-description",
      ariaLabel: "Compatibility label",
    },
    React.createElement(Dialog.Title, null, "Generated title"),
  );
  const attributes = contentAttributes(native);

  assert.match(attributes, /aria-label="Native label"/);
  assert.match(attributes, /aria-labelledby="external-title"/);
  assert.match(attributes, /aria-describedby="external-description"/);
  assert.doesNotMatch(attributes, /Compatibility label/);

  const compatibility = contentAttributes(
    renderDialog({ ariaLabel: "Compatibility label" }, "Body"),
  );
  assert.match(compatibility, /aria-label="Compatibility label"/);
  assert.doesNotMatch(compatibility, /aria-labelledby=/);

  for (const Family of [AlertDialog, Drawer]) {
    const html = renderToStaticMarkup(
      React.createElement(
        Family.Root,
        { defaultOpen: true },
        React.createElement(
          Family.Content,
          { "aria-label": "Native family label" },
          "Body",
        ),
      ),
    );
    assert.match(contentAttributes(html), /aria-label="Native family label"/);
  }
});

test("server markup emits generated relationships only for visible registered parts", () => {
  const withParts = renderDialog(
    null,
    React.createElement(
      Fragment,
      null,
      [React.createElement(Dialog.Title, { key: "title" }, "Title")],
      React.createElement(Dialog.Description, null, "Description"),
    ),
  );
  const attributes = contentAttributes(withParts);
  const titleId = withParts.match(/<h2 id="([^"]+)"/)?.[1];
  const descriptionId = withParts.match(/<p id="([^"]+)"/)?.[1];
  assert.ok(titleId);
  assert.ok(descriptionId);
  assert.match(attributes, new RegExp(`aria-labelledby="${titleId}"`));
  assert.match(attributes, new RegExp(`aria-describedby="${descriptionId}"`));

  const titleOnly = contentAttributes(
    renderDialog(null, React.createElement(Dialog.Title, null, "Title")),
  );
  assert.match(titleOnly, /aria-labelledby=/);
  assert.doesNotMatch(titleOnly, /aria-describedby=/);

  const explicitUndefined = contentAttributes(
    renderDialog(
      { "aria-label": "Named", "aria-describedby": undefined },
      React.createElement(Dialog.Description, null, "Description"),
    ),
  );
  assert.doesNotMatch(explicitUndefined, /aria-describedby=/);
});

test("opaque wrappers need an explicit native server relationship", () => {
  function OpaqueWrapper({ children }) {
    return children;
  }

  const inferred = renderDialog(
    null,
    React.createElement(
      OpaqueWrapper,
      null,
      React.createElement(Dialog.Title, null, "Wrapped title"),
    ),
  );
  assert.match(inferred, /data-slot="dialog-title"/);
  assert.doesNotMatch(contentAttributes(inferred), /aria-labelledby=/);

  const explicit = renderDialog(
    { "aria-labelledby": "wrapped-title" },
    React.createElement(
      OpaqueWrapper,
      null,
      React.createElement("h2", { id: "wrapped-title" }, "Wrapped title"),
    ),
  );
  assert.match(contentAttributes(explicit), /aria-labelledby="wrapped-title"/);
});

async function withHydratedDom(element, run) {
  const markup = renderToString(element);
  const dom = new JSDOM(`<!doctype html><html><body><div id="root">${markup}</div></body></html>`, {
    url: "https://atom.test/",
  });
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  dom.window.scrollTo = () => {};
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

  const hydrationErrors = [];
  const originalError = console.error;
  console.error = (...args) => {
    hydrationErrors.push(args.map(String).join(" "));
  };

  let root;
  try {
    await act(async () => {
      root = hydrateRoot(dom.window.document.getElementById("root"), element);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    await run({ dom, hydrationErrors, markup });
  } finally {
    if (root) {
      await act(async () => root.unmount());
    }
    console.error = originalError;
    dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

async function waitForCondition(condition, message, timeout = 1000) {
  const deadline = Date.now() + timeout;

  while (!condition()) {
    if (Date.now() >= deadline) {
      assert.fail(message);
    }

    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
  }
}

test("registered relationships hydrate without mismatch and track conditional mount/unmount", async () => {
  let setDescription;
  function Fixture() {
    const [showDescription, updateDescription] = useState(true);
    setDescription = updateDescription;
    return React.createElement(
      Dialog.Root,
      { defaultOpen: true },
      React.createElement(
        Dialog.Content,
        null,
        React.createElement(Dialog.Title, null, "Title"),
        showDescription
          ? React.createElement(Dialog.Description, null, "Description")
          : null,
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom, hydrationErrors, markup }) => {
    assert.match(contentAttributes(markup), /aria-describedby=/);
    assert.deepEqual(hydrationErrors, []);
    const content = dom.window.document.querySelector("[role=dialog]");
    assert.ok(content?.getAttribute("aria-describedby"));

    await act(async () => setDescription(false));
    assert.equal(content?.hasAttribute("aria-describedby"), false);

    await act(async () => setDescription(true));
    const description = dom.window.document.querySelector("[data-slot=dialog-description]");
    assert.equal(content?.getAttribute("aria-describedby"), description?.id);
    assert.deepEqual(hydrationErrors, []);
  });
});

test("StrictMode registration is ref-counted and keepMounted relationships remain stable", async () => {
  let setOpen;
  function Fixture() {
    const [open, updateOpen] = useState(false);
    setOpen = updateOpen;
    return React.createElement(
      StrictMode,
      null,
      React.createElement(
        Dialog.Root,
        { open, keepMounted: true, onOpenChange: updateOpen },
        React.createElement(
          Dialog.Content,
          null,
          React.createElement(Dialog.Title, null, "Title"),
          React.createElement(Dialog.Description, null, "Description"),
        ),
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom, hydrationErrors }) => {
    const content = dom.window.document.querySelector("[role=dialog]");
    assert.ok(content?.getAttribute("aria-labelledby"));
    assert.ok(content?.getAttribute("aria-describedby"));
    assert.equal(content?.closest("[hidden]")?.getAttribute("aria-hidden"), "true");
    assert.deepEqual(hydrationErrors, []);

    await act(async () => {
      setOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.equal(content?.closest("[hidden]"), null);
    assert.ok(content?.getAttribute("aria-labelledby"));
    assert.ok(content?.getAttribute("aria-describedby"));
  });
});

test("development warnings wait for registration to settle and revalidate", async () => {
  function SettlingFixture() {
    const [showTitle, setShowTitle] = useState(false);
    useEffect(() => setShowTitle(true), []);
    return React.createElement(
      Dialog.Root,
      { defaultOpen: true },
      React.createElement(
        Dialog.Content,
        null,
        showTitle ? React.createElement(Dialog.Title, null, "Late title") : null,
      ),
    );
  }

  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => warnings.push(args.map(String).join(" "));
  try {
    await withHydratedDom(React.createElement(SettlingFixture), async () => {
      await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
      assert.deepEqual(warnings, []);
    });

    await withHydratedDom(
      React.createElement(
        AlertDialog.Root,
        { defaultOpen: true },
        React.createElement(
          AlertDialog.Content,
          null,
          React.createElement(AlertDialog.Title, null, "Confirm"),
        ),
      ),
      async () => {
        await act(async () => new Promise((resolve) => setTimeout(resolve, 70)));
        assert.equal(warnings.length, 1);
        assert.match(warnings[0], /requires an accessible description/);
      },
    );
  } finally {
    console.warn = originalWarn;
  }
});

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

function dispatchKeyboardActivation(element, key = "Enter") {
  element.dispatchEvent(new element.ownerDocument.defaultView.KeyboardEvent(
    "keydown",
    { bubbles: true, key },
  ));
  element.dispatchEvent(new element.ownerDocument.defaultView.MouseEvent(
    "click",
    { bubbles: true, detail: 0 },
  ));
}

function isEffectivelyInert(element) {
  return Boolean(element?.closest("[inert]"));
}

test("modal ownership and isolation are established before a later layout effect", async () => {
  const observations = [];

  function LayoutProbe() {
    useLayoutEffect(() => {
      const content = document.querySelector("[role=dialog]");
      const background = document.querySelector("[data-testid=timing-background]");
      observations.push({
        ariaModal: content?.getAttribute("aria-modal"),
        backgroundInert: isEffectivelyInert(background),
        bodyLocked: document.body.style.overflow === "hidden"
          && document.documentElement.style.overflow === "hidden",
      });
    }, []);
    return null;
  }

  function Fixture() {
    return React.createElement(
      Fragment,
      null,
      React.createElement("div", { "data-testid": "timing-background" }, "Background"),
      React.createElement(
        Dialog.Root,
        { defaultOpen: true },
        React.createElement(
          Dialog.Content,
          { "aria-label": "Timing dialog", initialFocus: false },
          "Body",
        ),
      ),
      React.createElement(LayoutProbe),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async () => {
    assert.deepEqual(observations[0], {
      ariaModal: "true",
      backgroundInert: true,
      bodyLocked: true,
    });
  });
});

test("initial focus resolves opening interaction and avoids touch keyboard activation", async () => {
  for (const [pointerType, expectedTarget] of [
    ["mouse", "first-input"],
    ["touch", "dialog-content"],
    ["pen", "first-input"],
  ]) {
    const details = [];
    function Fixture() {
      return React.createElement(
        Dialog.Root,
        null,
        React.createElement(Dialog.Trigger, null, "Open"),
        React.createElement(
          Dialog.Content,
          {
            "aria-label": "Focus fixture",
            initialFocus: (value) => {
              details.push(value);
              return undefined;
            },
          },
          React.createElement("input", { "data-testid": "first-input" }),
          React.createElement(Dialog.Close, null, "Close"),
        ),
      );
    }

    await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
      const trigger = dom.window.document.querySelector("[data-slot=dialog-trigger]");
      trigger.focus();
      await act(async () => {
        dispatchPointerActivation(trigger, pointerType);
        await new Promise((resolve) => setTimeout(resolve, 5));
      });
      const active = dom.window.document.activeElement;
      if (expectedTarget === "dialog-content") {
        assert.equal(active?.getAttribute("data-slot"), expectedTarget);
      } else {
        assert.equal(active?.getAttribute("data-testid"), expectedTarget);
      }
      assert.equal(details.at(-1)?.interactionType, pointerType);
    });
  }

  const keyboardDetails = [];
  function KeyboardFixture() {
    return React.createElement(
      Dialog.Root,
      null,
      React.createElement(Dialog.Trigger, null, "Open"),
      React.createElement(
        Dialog.Content,
        {
          "aria-label": "Keyboard fixture",
          initialFocus: (details) => {
            keyboardDetails.push(details);
            return undefined;
          },
        },
        React.createElement("input", { "data-testid": "keyboard-input" }),
      ),
    );
  }
  await withHydratedDom(React.createElement(KeyboardFixture), async ({ dom }) => {
    const trigger = dom.window.document.querySelector("[data-slot=dialog-trigger]");
    trigger.focus();
    await act(async () => {
      dispatchKeyboardActivation(trigger);
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.equal(
      dom.window.document.activeElement?.getAttribute("data-testid"),
      "keyboard-input",
    );
    assert.equal(keyboardDetails.at(-1)?.interactionType, "keyboard");
  });

  const syntheticDetails = [];
  function SyntheticFixture() {
    return React.createElement(
      Dialog.Root,
      null,
      React.createElement(Dialog.Trigger, null, "Open"),
      React.createElement(
        Dialog.Content,
        {
          "aria-label": "Synthetic fixture",
          initialFocus: (value) => {
            syntheticDetails.push(value);
            return false;
          },
        },
        "Body",
      ),
    );
  }
  await withHydratedDom(React.createElement(SyntheticFixture), async ({ dom }) => {
    await act(async () => {
      dom.window.document.querySelector("[data-slot=dialog-trigger]").click();
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.equal(syntheticDetails.at(-1)?.interactionType, "programmatic");
  });
});

test("initialFocus supports explicit refs, false, invalid fallback, native autoFocus, and AlertDialog Cancel", async (context) => {
  const unexpectedWarnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => unexpectedWarnings.push(args.map(String).join(" "));
  context.after(() => {
    console.warn = originalWarn;
  });
  function ExplicitFixture({ mode }) {
    const secondRef = useRef(null);
    const outsideRef = useRef(null);
    const initialFocus = mode === "explicit"
      ? secondRef
      : mode === "false"
        ? false
        : mode === "invalid"
          ? outsideRef
          : undefined;
    return React.createElement(
      React.Fragment,
      null,
      React.createElement("button", { ref: outsideRef, "data-testid": "outside" }, "Outside"),
      React.createElement(
        Dialog.Root,
        null,
        React.createElement(Dialog.Trigger, null, "Open"),
        React.createElement(
          Dialog.Content,
          { "aria-label": "Explicit focus", initialFocus },
          React.createElement("input", {
            "data-testid": "first",
            autoFocus: mode === "autofocus",
          }),
          React.createElement("button", { ref: secondRef, "data-testid": "second" }, "Second"),
        ),
      ),
    );
  }

  for (const [mode, expected] of [
    ["explicit", "second"],
    ["invalid", "first"],
    ["autofocus", "first"],
    ["false", null],
  ]) {
    await withHydratedDom(
      React.createElement(ExplicitFixture, { mode }),
      async ({ dom }) => {
        const trigger = dom.window.document.querySelector("[data-slot=dialog-trigger]");
        trigger.focus();
        await act(async () => {
          dispatchPointerActivation(trigger, "mouse");
          await new Promise((resolve) => setTimeout(resolve, 5));
        });
        if (expected) {
          assert.equal(
            dom.window.document.activeElement?.getAttribute("data-testid"),
            expected,
          );
        } else {
          assert.equal(dom.window.document.activeElement, trigger);
        }
      },
    );
  }

  function AlertFixture() {
    return React.createElement(
      AlertDialog.Root,
      null,
      React.createElement(AlertDialog.Trigger, null, "Open alert"),
      React.createElement(
        AlertDialog.Content,
        null,
        React.createElement(AlertDialog.Title, null, "Confirm"),
        React.createElement(AlertDialog.Description, null, "Choose safely"),
        React.createElement("input", { "data-testid": "alert-input" }),
        React.createElement(AlertDialog.Cancel, null, "Cancel"),
        React.createElement(AlertDialog.Action, null, "Continue"),
      ),
    );
  }
  await withHydratedDom(React.createElement(AlertFixture), async ({ dom }) => {
    const trigger = dom.window.document.querySelector("[data-slot=alert-dialog-trigger]");
    await act(async () => {
      dispatchPointerActivation(trigger, "touch");
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.equal(
      dom.window.document.activeElement?.getAttribute("data-slot"),
      "alert-dialog-cancel",
    );
    const content = dom.window.document.querySelector("[role=alertdialog]");
    assert.ok(content?.getAttribute("aria-labelledby"));
    assert.ok(content?.getAttribute("aria-describedby"));
  });
  assert.deepEqual(unexpectedWarnings, []);
});

test("finalFocus receives closing interaction and can select the next workflow target", async () => {
  const details = [];
  function Fixture() {
    const nextRef = useRef(null);
    return React.createElement(
      React.Fragment,
      null,
      React.createElement("button", { ref: nextRef, "data-testid": "next" }, "Next"),
      React.createElement(
        Dialog.Root,
        null,
        React.createElement(Dialog.Trigger, null, "Open"),
        React.createElement(
          Dialog.Content,
          {
            "aria-label": "Final focus",
            finalFocus: (value) => {
              details.push(value);
              return nextRef.current;
            },
          },
          React.createElement(Dialog.Close, null, "Close"),
        ),
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    const trigger = dom.window.document.querySelector("[data-slot=dialog-trigger]");
    trigger.focus();
    await act(async () => {
      dispatchPointerActivation(trigger, "mouse");
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    const close = dom.window.document.querySelector("[data-slot=dialog-close]");
    await act(async () => {
      dispatchPointerActivation(close, "touch");
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.deepEqual(details.at(-1), {
      interactionType: "touch",
      reason: "closeClick",
    });
    assert.equal(
      dom.window.document.activeElement?.getAttribute("data-testid"),
      "next",
    );
  });

  function InvalidFinalFixture() {
    const disabledRef = useRef(null);
    return React.createElement(
      React.Fragment,
      null,
      React.createElement("button", { ref: disabledRef, disabled: true }, "Unavailable"),
      React.createElement(
        Dialog.Root,
        null,
        React.createElement(Dialog.Trigger, null, "Open"),
        React.createElement(
          Dialog.Content,
          { "aria-label": "Invalid final", finalFocus: disabledRef },
          React.createElement(Dialog.Close, null, "Close"),
        ),
      ),
    );
  }
  await withHydratedDom(React.createElement(InvalidFinalFixture), async ({ dom }) => {
    const trigger = dom.window.document.querySelector("[data-slot=dialog-trigger]");
    trigger.focus();
    await act(async () => {
      dispatchPointerActivation(trigger, "mouse");
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    await act(async () => {
      dom.window.document.querySelector("[data-slot=dialog-close]").click();
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.equal(dom.window.document.activeElement, trigger);
  });
});

test("final focus defaults cover retained trigger, removed trigger, triggerless control, and false", async () => {
  function RetainedTrigger() {
    return React.createElement(
      Dialog.Root,
      null,
      React.createElement(Dialog.Trigger, null, "Open"),
      React.createElement(
        Dialog.Content,
        { "aria-label": "Retained" },
        React.createElement(Dialog.Close, null, "Close"),
      ),
    );
  }
  await withHydratedDom(React.createElement(RetainedTrigger), async ({ dom }) => {
    const trigger = dom.window.document.querySelector("[data-slot=dialog-trigger]");
    trigger.focus();
    await act(async () => {
      dispatchPointerActivation(trigger, "mouse");
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    const close = dom.window.document.querySelector("[data-slot=dialog-close]");
    await act(async () => {
      close.click();
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.equal(dom.window.document.activeElement, trigger);
  });

  function RemovedTrigger() {
    const [open, setOpen] = useState(false);
    const [triggerUsed, setTriggerUsed] = useState(false);
    const handleOpenChange = (nextOpen) => {
      setOpen(nextOpen);
      if (nextOpen) setTriggerUsed(true);
    };
    return React.createElement(
      Dialog.Root,
      { open, onOpenChange: handleOpenChange },
      !triggerUsed ? React.createElement(Dialog.Trigger, null, "Open") : null,
      React.createElement(
        Dialog.Content,
        { "aria-label": "Removed" },
        React.createElement(Dialog.Close, null, "Close"),
      ),
    );
  }
  await withHydratedDom(React.createElement(RemovedTrigger), async ({ dom }) => {
    const trigger = dom.window.document.querySelector("[data-slot=dialog-trigger]");
    trigger.focus();
    await act(async () => {
      dispatchPointerActivation(trigger, "mouse");
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    await act(async () => {
      dom.window.document.querySelector("[data-slot=dialog-close]").click();
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.equal(trigger.isConnected, false);
    assert.equal(dom.window.document.activeElement, dom.window.document.body);
  });

  let setTriggerlessOpen;
  function Triggerless() {
    const [open, setOpen] = useState(false);
    setTriggerlessOpen = setOpen;
    return React.createElement(
      React.Fragment,
      null,
      React.createElement("button", { "data-testid": "workflow" }, "Workflow"),
      React.createElement(
        Dialog.Root,
        { open, onOpenChange: setOpen },
        React.createElement(
          Dialog.Content,
          { "aria-label": "Triggerless" },
          React.createElement("button", null, "Inside"),
        ),
      ),
    );
  }
  await withHydratedDom(React.createElement(Triggerless), async ({ dom }) => {
    const workflow = dom.window.document.querySelector("[data-testid=workflow]");
    workflow.focus();
    await act(async () => {
      setTriggerlessOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    await act(async () => {
      setTriggerlessOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.equal(dom.window.document.activeElement, workflow);
  });

  function NoRestore() {
    return React.createElement(
      Dialog.Root,
      null,
      React.createElement(Dialog.Trigger, null, "Open"),
      React.createElement(
        Dialog.Content,
        { "aria-label": "No restore", finalFocus: false },
        React.createElement(Dialog.Close, null, "Close"),
      ),
    );
  }
  await withHydratedDom(React.createElement(NoRestore), async ({ dom }) => {
    const trigger = dom.window.document.querySelector("[data-slot=dialog-trigger]");
    trigger.focus();
    await act(async () => {
      dispatchPointerActivation(trigger, "mouse");
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    await act(async () => {
      dom.window.document.querySelector("[data-slot=dialog-close]").click();
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.notEqual(dom.window.document.activeElement, trigger);
  });
});

test("closing interaction resolution covers Escape, overlay, action, cancel, and controlled closure", async () => {
  const cases = [
    ["escape", "keyboard", "escapeKeyDown"],
    ["overlay", "touch", "backdropClick"],
    ["action", "mouse", "actionClick"],
    ["cancel", "keyboard", "cancelClick"],
  ];

  for (const [closeKind, expectedInteraction, expectedReason] of cases) {
    const details = [];
    function Fixture() {
      const targetRef = useRef(null);
      const Family = closeKind === "action" || closeKind === "cancel"
        ? AlertDialog
        : Dialog;
      const controls = Family === AlertDialog
        ? React.createElement(
            React.Fragment,
            null,
            React.createElement(AlertDialog.Description, null, "Description"),
            React.createElement(AlertDialog.Cancel, null, "Cancel"),
            React.createElement(AlertDialog.Action, null, "Action"),
          )
        : React.createElement(Dialog.Close, null, "Close");
      return React.createElement(
        React.Fragment,
        null,
        React.createElement("button", { ref: targetRef }, "After"),
        React.createElement(
          Family.Root,
          { defaultOpen: true },
          closeKind === "overlay" ? React.createElement(Family.Overlay) : null,
          React.createElement(
            Family.Content,
            {
              "aria-label": "Close details",
              finalFocus: (value) => {
                details.push(value);
                return targetRef.current;
              },
            },
            controls,
          ),
        ),
      );
    }

    await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
      await act(async () => {
        if (closeKind === "escape") {
          dom.window.document.dispatchEvent(new dom.window.KeyboardEvent(
            "keydown",
            { bubbles: true, key: "Escape" },
          ));
        } else if (closeKind === "overlay") {
          dispatchPointerActivation(
            dom.window.document.querySelector("[data-slot=dialog-overlay]"),
            "touch",
          );
        } else if (closeKind === "action") {
          dispatchPointerActivation(
            dom.window.document.querySelector("[data-slot=alert-dialog-action]"),
            "mouse",
          );
        } else {
          dispatchKeyboardActivation(
            dom.window.document.querySelector("[data-slot=alert-dialog-cancel]"),
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 5));
      });
      assert.deepEqual(details.at(-1), {
        interactionType: expectedInteraction,
        reason: expectedReason,
      });
    });
  }

  const programmaticDetails = [];
  let closeProgrammatically;
  function ControlledFixture() {
    const [open, setOpen] = useState(true);
    closeProgrammatically = () => setOpen(false);
    return React.createElement(
      Dialog.Root,
      { open, onOpenChange: setOpen },
      React.createElement(
        Dialog.Content,
        {
          "aria-label": "Controlled",
          finalFocus: (value) => {
            programmaticDetails.push(value);
            return false;
          },
        },
        React.createElement("button", null, "Inside"),
      ),
    );
  }
  await withHydratedDom(React.createElement(ControlledFixture), async () => {
    await act(async () => {
      closeProgrammatically();
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.deepEqual(programmaticDetails.at(-1), {
      interactionType: "programmatic",
    });
  });
});

test("the shared modal layer stack gives nested portalled dialogs exclusive control", async () => {
  let parentOpen = true;
  let childOpen = true;
  function Fixture() {
    const [isParentOpen, setParentOpen] = useState(true);
    const [isChildOpen, setChildOpen] = useState(true);
    parentOpen = isParentOpen;
    childOpen = isChildOpen;
    return React.createElement(
      Dialog.Root,
      { open: isParentOpen, onOpenChange: setParentOpen },
      React.createElement(Dialog.Overlay, { "data-testid": "parent-overlay" }),
      React.createElement(
        Dialog.Content,
        { "aria-label": "Parent dialog" },
        React.createElement("button", { "data-testid": "parent-button" }, "Parent"),
        React.createElement(
          Dialog.Root,
          { open: isChildOpen, onOpenChange: setChildOpen },
          React.createElement(
            Dialog.Portal,
            null,
            React.createElement(
              Dialog.Content,
              { "aria-label": "Child dialog" },
              React.createElement("button", { "data-testid": "child-button" }, "Child"),
            ),
          ),
        ),
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    assert.equal(
      dom.window.document.activeElement?.getAttribute("data-testid"),
      "child-button",
    );
    assert.equal(
      isEffectivelyInert(dom.window.document.querySelector("[aria-label='Parent dialog']")),
      true,
    );
    assert.equal(
      isEffectivelyInert(dom.window.document.querySelector("[aria-label='Child dialog']")),
      false,
    );
    assert.equal(dom.window.document.body.style.overflow, "hidden");

    await act(async () => {
      dom.window.document.querySelector("[data-testid=parent-overlay]").click();
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.equal(parentOpen, true);
    assert.equal(childOpen, true);

    await act(async () => {
      dom.window.document.dispatchEvent(new dom.window.KeyboardEvent(
        "keydown",
        { bubbles: true, key: "Escape" },
      ));
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    assert.equal(childOpen, false);
    assert.equal(parentOpen, true);
    assert.equal(
      dom.window.document.activeElement?.getAttribute("data-testid"),
      "parent-button",
    );
    assert.equal(
      isEffectivelyInert(dom.window.document.querySelector("[aria-label='Parent dialog']")),
      false,
    );
    assert.equal(dom.window.document.body.style.overflow, "hidden");

    await act(async () => {
      dom.window.document.dispatchEvent(new dom.window.KeyboardEvent(
        "keydown",
        { bubbles: true, key: "Escape" },
      ));
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    assert.equal(parentOpen, false);
    assert.equal(dom.window.document.body.style.overflow, "");
  });
});

test("nested modal isolation restores the application after sequential close", async () => {
  let setParentOpen;
  let setChildOpen;

  function Fixture() {
    const [parentOpen, updateParentOpen] = useState(false);
    const [childOpen, updateChildOpen] = useState(false);
    setParentOpen = updateParentOpen;
    setChildOpen = updateChildOpen;
    return React.createElement(
      Fragment,
      null,
      React.createElement(
        "button",
        { "data-testid": "application-action" },
        "Application action",
      ),
      React.createElement(
        Dialog.Root,
        { open: parentOpen, onOpenChange: updateParentOpen },
        React.createElement(Dialog.Overlay, {
          style: {
            transitionDuration: "150ms",
            transitionProperty: "opacity",
          },
        }),
        React.createElement(
          Dialog.Content,
          {
            "aria-label": "Parent dialog",
            style: {
              transitionDuration: "150ms",
              transitionProperty: "opacity",
            },
          },
          React.createElement("button", null, "Parent action"),
          React.createElement(
            Dialog.Root,
            { open: childOpen, onOpenChange: updateChildOpen },
            React.createElement(
              Dialog.Portal,
              null,
              React.createElement(Dialog.Overlay, {
                style: {
                  transitionDuration: "150ms",
                  transitionProperty: "opacity",
                },
              }),
              React.createElement(
                Dialog.Content,
                {
                  "aria-label": "Child dialog",
                  style: {
                    transitionDuration: "150ms",
                    transitionProperty: "opacity",
                  },
                },
                React.createElement("button", null, "Child action"),
              ),
            ),
          ),
        ),
      ),
    );
  }

  await withHydratedDom(
    React.createElement(StrictMode, null, React.createElement(Fixture)),
    async ({ dom }) => {
      const application = dom.window.document.querySelector(
        "[data-testid=application-action]",
      );
      await act(async () => setParentOpen(true));
      await act(async () => setChildOpen(true));
      await act(async () => setChildOpen(false));
      await act(async () => new Promise((resolve) => setTimeout(resolve, 100)));
      await act(async () => setParentOpen(false));
      await act(async () => new Promise((resolve) => setTimeout(resolve, 250)));

      assert.equal(isEffectivelyInert(application), false);
      assert.equal(dom.window.document.body.querySelector("[inert]"), null);
    },
  );
});

test("Modal.Branch keeps a consumer-owned third-party portal focusable and scroll-allowed", async () => {
  let hideBranch;
  function ThirdPartyPortal({ children }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return createPortal(children, document.body);
  }

  function Fixture() {
    const [showBranch, setShowBranch] = useState(true);
    hideBranch = () => setShowBranch(false);
    return React.createElement(
      React.Fragment,
      null,
      React.createElement("button", { "data-testid": "background" }, "Background"),
      React.createElement(
        Dialog.Root,
        { defaultOpen: true },
        React.createElement(
          Dialog.Content,
          { "aria-label": "Third-party portal", initialFocus: false },
          React.createElement("button", { "data-testid": "inside" }, "Inside"),
          showBranch
            ? React.createElement(
                ThirdPartyPortal,
                null,
                React.createElement(
                  Modal.Branch,
                  { asChild: true },
                  React.createElement(
                    "div",
                    { "data-testid": "third-party-portal" },
                    React.createElement("button", { "data-testid": "portal-button" }, "Portal control"),
                  ),
                ),
              )
            : null,
        ),
      ),
    );
  }

  assert.equal(Modal.Branch, ModalBranch);
  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    const portal = dom.window.document.querySelector("[data-testid=third-party-portal]");
    const portalButton = dom.window.document.querySelector("[data-testid=portal-button]");
    assert.equal(portal?.getAttribute("data-slot"), "modal-branch");
    assert.equal(portal?.hasAttribute("inert"), false);

    portalButton.focus();
    await act(async () => new Promise((resolve) => setTimeout(resolve, 5)));
    assert.equal(dom.window.document.activeElement, portalButton);

    const branchWheel = new dom.window.WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 10,
    });
    portal.style.overflowY = "auto";
    Object.defineProperty(portal, "clientHeight", { configurable: true, value: 100 });
    Object.defineProperty(portal, "scrollHeight", { configurable: true, value: 300 });
    portal.scrollTop = 50;
    portal.dispatchEvent(branchWheel);
    assert.equal(branchWheel.defaultPrevented, false);

    const backgroundWheel = new dom.window.WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
    });
    dom.window.document.querySelector("[data-testid=background]").dispatchEvent(backgroundWheel);
    assert.equal(backgroundWheel.defaultPrevented, true);

    await act(async () => {
      hideBranch();
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    assert.equal(portal.isConnected, false);
  });
});

test("modal containment preserves Menu Tab delegation", async () => {
  let menuOpen = true;
  function Fixture() {
    const [open, setOpen] = useState(true);
    menuOpen = open;
    return React.createElement(
      Dialog.Root,
      { defaultOpen: true },
      React.createElement(
        Dialog.Content,
        { "aria-label": "Menu dialog" },
        React.createElement("button", { "data-testid": "before-menu" }, "Before"),
        React.createElement(
          Menu.Root,
          { open, onOpenChange: setOpen, modal: false },
          React.createElement(
            Menu.Content,
            { "aria-label": "Actions" },
            React.createElement(Menu.Item, { value: "edit" }, "Edit"),
          ),
        ),
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    const menu = dom.window.document.querySelector("[role=menu]");
    menu.style.overflowY = "auto";
    Object.defineProperty(menu, "clientHeight", { configurable: true, value: 100 });
    Object.defineProperty(menu, "scrollHeight", { configurable: true, value: 300 });
    menu.scrollTop = 50;
    const menuWheel = new dom.window.WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 10,
    });
    menu.dispatchEvent(menuWheel);
    assert.equal(menuWheel.defaultPrevented, false);
    menu.focus();
    const tabEvent = new dom.window.KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Tab",
    });
    await act(async () => {
      menu.dispatchEvent(tabEvent);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    assert.equal(tabEvent.defaultPrevented, true);
    assert.equal(menuOpen, false);
    assert.equal(dom.window.document.querySelector("[role=dialog]")?.isConnected, true);
  });
});

test("modal sequencing lets Select close on Tab before moving to the next dialog control", async () => {
  function Fixture() {
    return React.createElement(
      Dialog.Root,
      { defaultOpen: true },
      React.createElement(
        Dialog.Content,
        { "aria-label": "Select dialog" },
        React.createElement(
          Select.Root,
          { defaultOpen: true },
          React.createElement(Select.Trigger, { "aria-label": "Plan" }, "Plan"),
          React.createElement(
            Select.Content,
            null,
            React.createElement(Select.Item, { value: "pro" }, "Pro"),
          ),
        ),
        React.createElement("button", { "data-testid": "after-select" }, "After"),
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    const trigger = dom.window.document.querySelector("[data-slot=select-trigger]");
    const listbox = dom.window.document.querySelector("[role=listbox]");
    listbox.style.overflowY = "auto";
    Object.defineProperty(listbox, "clientHeight", { configurable: true, value: 100 });
    Object.defineProperty(listbox, "scrollHeight", { configurable: true, value: 300 });
    listbox.scrollTop = 50;
    const listboxWheel = new dom.window.WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 10,
    });
    listbox.dispatchEvent(listboxWheel);
    assert.equal(listboxWheel.defaultPrevented, false);
    trigger.focus();
    await act(async () => {
      trigger.dispatchEvent(new dom.window.KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Tab",
      }));
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    assert.equal(dom.window.document.querySelector("[role=listbox]"), null);
    assert.equal(
      dom.window.document.activeElement?.getAttribute("data-testid"),
      "after-select",
    );
  });
});

test("modal containment allows non-modal Popover focus guards to keep their Tab contract", async () => {
  function Fixture() {
    return React.createElement(
      Dialog.Root,
      { defaultOpen: true },
      React.createElement(
        Dialog.Content,
        { "aria-label": "Popover dialog" },
        React.createElement(
          Popover.Root,
          { defaultOpen: true, modal: false },
          React.createElement(Popover.Trigger, null, "Details"),
          React.createElement(
            Popover.Content,
            { "aria-label": "Details" },
            React.createElement("button", { "data-testid": "popover-button" }, "Inside"),
          ),
        ),
        React.createElement("button", { "data-testid": "after-popover" }, "After"),
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    const guards = dom.window.document.querySelectorAll("[data-slot=popover-focus-guard]");
    assert.equal(guards.length, 2);
    const popover = dom.window.document.querySelector("[data-slot=popover-content]");
    popover.style.overflowY = "auto";
    Object.defineProperty(popover, "clientHeight", { configurable: true, value: 100 });
    Object.defineProperty(popover, "scrollHeight", { configurable: true, value: 300 });
    popover.scrollTop = 50;
    const popoverWheel = new dom.window.WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 10,
    });
    popover.dispatchEvent(popoverWheel);
    assert.equal(popoverWheel.defaultPrevented, false);
    await act(async () => {
      guards[1].focus();
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    assert.equal(dom.window.document.querySelector("[data-slot=popover-content]"), null);
    assert.equal(
      dom.window.document.activeElement?.getAttribute("data-testid"),
      "after-popover",
    );
  });
});

test("scroll containment allows owned regions, blocks boundaries and touch background, and restores body styles", async () => {
  let setOpen;
  function Fixture() {
    const [open, updateOpen] = useState(false);
    setOpen = updateOpen;
    return React.createElement(
      React.Fragment,
      null,
      React.createElement("div", { "data-testid": "scroll-background" }, "Background"),
      React.createElement(
        Dialog.Root,
        { open, onOpenChange: updateOpen },
        React.createElement(
          Dialog.Content,
          { "aria-label": "Scroll fixture", initialFocus: false },
          React.createElement(
            "div",
            {
              "data-testid": "long-content",
              style: { overflowY: "auto" },
            },
            "Long content",
          ),
        ),
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    const body = dom.window.document.body;
    const documentElement = dom.window.document.documentElement;
    documentElement.style.overflow = "scroll";
    body.style.overflow = "clip";
    body.style.paddingRight = "7px";
    body.style.position = "relative";
    body.style.top = "3px";
    body.style.left = "4px";
    body.style.right = "5px";
    body.style.width = "80%";
    Object.defineProperty(dom.window, "scrollX", { configurable: true, value: 12 });
    Object.defineProperty(dom.window, "scrollY", { configurable: true, value: 34 });
    const scrollRestores = [];
    dom.window.scrollTo = (x, y) => scrollRestores.push([x, y]);

    await act(async () => {
      setOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    assert.equal(documentElement.style.overflow, "hidden");
    assert.equal(body.style.overflow, "hidden");
    assert.equal(body.style.position, "relative");
    assert.equal(body.style.top, "3px");
    assert.equal(body.style.left, "4px");
    assert.equal(body.style.right, "5px");
    assert.equal(body.style.width, "80%");

    const longContent = dom.window.document.querySelector("[data-testid=long-content]");
    Object.defineProperty(longContent, "clientHeight", { configurable: true, value: 100 });
    Object.defineProperty(longContent, "scrollHeight", { configurable: true, value: 300 });
    longContent.scrollTop = 50;

    const middleWheel = new dom.window.WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 20,
    });
    longContent.dispatchEvent(middleWheel);
    assert.equal(middleWheel.defaultPrevented, false);

    longContent.scrollTop = 200;
    const boundaryWheel = new dom.window.WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 20,
    });
    longContent.dispatchEvent(boundaryWheel);
    assert.equal(boundaryWheel.defaultPrevented, true);

    const backgroundWheel = new dom.window.WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 20,
    });
    dom.window.document.querySelector("[data-testid=scroll-background]").dispatchEvent(backgroundWheel);
    assert.equal(backgroundWheel.defaultPrevented, true);

    function touchList(y) {
      const touch = { identifier: 1, clientX: 0, clientY: y };
      return { item: (index) => index === 0 ? touch : null };
    }
    longContent.scrollTop = 50;
    const touchStart = new dom.window.Event("touchstart", { bubbles: true, cancelable: true });
    Object.defineProperty(touchStart, "touches", { value: touchList(100) });
    Object.defineProperty(touchStart, "changedTouches", { value: touchList(100) });
    longContent.dispatchEvent(touchStart);
    const touchMove = new dom.window.Event("touchmove", { bubbles: true, cancelable: true });
    Object.defineProperty(touchMove, "touches", { value: touchList(80) });
    Object.defineProperty(touchMove, "changedTouches", { value: touchList(80) });
    longContent.dispatchEvent(touchMove);
    assert.equal(touchMove.defaultPrevented, false);

    longContent.scrollTop = 200;
    const boundaryStart = new dom.window.Event("touchstart", { bubbles: true, cancelable: true });
    Object.defineProperty(boundaryStart, "touches", { value: touchList(100) });
    Object.defineProperty(boundaryStart, "changedTouches", { value: touchList(100) });
    longContent.dispatchEvent(boundaryStart);
    const boundaryMove = new dom.window.Event("touchmove", { bubbles: true, cancelable: true });
    Object.defineProperty(boundaryMove, "touches", { value: touchList(80) });
    Object.defineProperty(boundaryMove, "changedTouches", { value: touchList(80) });
    longContent.dispatchEvent(boundaryMove);
    assert.equal(boundaryMove.defaultPrevented, true);

    await act(async () => {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    assert.equal(documentElement.style.overflow, "scroll");
    assert.equal(body.style.overflow, "clip");
    assert.equal(body.style.paddingRight, "7px");
    assert.equal(body.style.position, "relative");
    assert.equal(body.style.top, "3px");
    assert.equal(body.style.left, "4px");
    assert.equal(body.style.right, "5px");
    assert.equal(body.style.width, "80%");
    assert.deepEqual(scrollRestores, []);
  });
});

test("scroll lock compensates only for viewport width released by locking", async () => {
  for (const scenario of [
    {
      name: "classic scrollbar",
      lockedClientWidth: 1200,
      expectedPadding: "22px",
    },
    {
      name: "stable scrollbar gutter",
      lockedClientWidth: 1185,
      expectedPadding: "7px",
    },
  ]) {
    let setOpen;
    function Fixture() {
      const [open, updateOpen] = useState(false);
      setOpen = updateOpen;
      return React.createElement(
        Dialog.Root,
        { open, onOpenChange: updateOpen },
        React.createElement(
          Dialog.Content,
          { "aria-label": scenario.name, initialFocus: false },
          "Content",
        ),
      );
    }

    await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
      const { body, documentElement } = dom.window.document;
      body.style.paddingRight = "7px";
      Object.defineProperty(dom.window, "innerWidth", {
        configurable: true,
        value: 1200,
      });
      Object.defineProperty(documentElement, "clientWidth", {
        configurable: true,
        get: () =>
          body.style.overflow === "hidden" ? scenario.lockedClientWidth : 1185,
      });

      await act(async () => {
        setOpen(true);
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      assert.equal(
        body.style.paddingRight,
        scenario.expectedPadding,
        scenario.name,
      );

      await act(async () => {
        setOpen(false);
        await new Promise((resolve) => setTimeout(resolve, 30));
      });
      assert.equal(body.style.paddingRight, "7px", `${scenario.name} restoration`);
    });
  }
});

test("modal Popover locks root overflow without fixing or repositioning the body", async () => {
  let setOpen;
  function Fixture() {
    const [open, updateOpen] = useState(false);
    setOpen = updateOpen;
    return React.createElement(
      Popover.Root,
      { modal: true, open, onOpenChange: updateOpen },
      React.createElement(Popover.Trigger, null, "Open"),
      React.createElement(
        Popover.Content,
        { "aria-label": "Modal settings", initialFocus: false },
        "Settings",
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    const { body, documentElement } = dom.window.document;
    body.style.position = "relative";
    body.style.top = "5px";
    Object.defineProperty(dom.window, "scrollX", { configurable: true, value: 8 });
    Object.defineProperty(dom.window, "scrollY", { configurable: true, value: 144 });
    const restores = [];
    dom.window.scrollTo = (...coordinates) => restores.push(coordinates);

    await act(async () => {
      setOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    assert.equal(documentElement.style.overflow, "hidden");
    assert.equal(body.style.overflow, "hidden");
    assert.equal(body.style.position, "relative");
    assert.equal(body.style.top, "5px");
    assert.equal(dom.window.scrollX, 8);
    assert.equal(dom.window.scrollY, 144);

    await act(async () => {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    assert.equal(documentElement.style.overflow, "");
    assert.equal(body.style.overflow, "");
    assert.equal(body.style.position, "relative");
    assert.equal(body.style.top, "5px");
    assert.deepEqual(restores, []);
  });
});

test("modal isolation preserves separate body portals and nested custom-container paths", async () => {
  function Fixture() {
    const [container, setContainer] = useState(null);
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        "main",
        { "data-testid": "application" },
        React.createElement("div", { "data-testid": "path-sibling" }, "Background sibling"),
        React.createElement(
          "section",
          { "data-testid": "custom-path" },
          React.createElement("div", { ref: setContainer, "data-testid": "custom-container" }),
          React.createElement("div", { "data-testid": "container-sibling" }, "Container sibling"),
        ),
        React.createElement(
          Dialog.Root,
          { defaultOpen: true },
          React.createElement(
            Dialog.Portal,
            null,
            React.createElement(Dialog.Overlay, { "data-testid": "separate-overlay" }),
          ),
          container
            ? React.createElement(
                Dialog.Portal,
                { container },
                React.createElement(
                  Dialog.Content,
                  { "aria-label": "Custom container dialog", initialFocus: false },
                  React.createElement("div", { "aria-live": "polite", "data-testid": "owned-live" }, "Owned update"),
                ),
              )
            : null,
        ),
      ),
      React.createElement("aside", { "aria-live": "polite", "data-testid": "global-live" }, "Global update"),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    const query = (value) => dom.window.document.querySelector(`[data-testid=${value}]`);
    assert.equal(query("application")?.hasAttribute("inert"), false);
    assert.equal(query("custom-path")?.hasAttribute("inert"), false);
    assert.equal(query("custom-container")?.hasAttribute("inert"), false);
    assert.equal(query("separate-overlay")?.hasAttribute("inert"), false);
    assert.equal(query("owned-live")?.hasAttribute("inert"), false);
    assert.equal(query("path-sibling")?.hasAttribute("inert"), true);
    assert.equal(query("container-sibling")?.hasAttribute("inert"), true);
    assert.equal(query("global-live")?.hasAttribute("inert"), true);
  });
});

test("modal isolation supports inline Content without inerting its ancestor path", async () => {
  function Fixture() {
    return React.createElement(
      "main",
      { "data-testid": "inline-app" },
      React.createElement("div", { "data-testid": "inline-background" }, "Background"),
      React.createElement(
        Dialog.Root,
        { defaultOpen: true },
        React.createElement(
          "section",
          { "data-testid": "inline-owner" },
          React.createElement(
            Dialog.Content,
            { "aria-label": "Inline dialog", initialFocus: false },
            "Body",
          ),
        ),
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    assert.equal(dom.window.document.querySelector("[data-testid=inline-app]")?.hasAttribute("inert"), false);
    assert.equal(dom.window.document.querySelector("[data-testid=inline-owner]")?.hasAttribute("inert"), false);
    assert.equal(dom.window.document.querySelector("[data-testid=inline-background]")?.hasAttribute("inert"), true);
  });
});

test("dynamic Modal.Branch registration removes inherited inert synchronously and restores it on cleanup", async () => {
  let setBranchVisible;
  function Fixture() {
    const [host, setHost] = useState(null);
    const [showBranch, setShowBranch] = useState(false);
    setBranchVisible = setShowBranch;
    return React.createElement(
      React.Fragment,
      null,
      React.createElement("div", { ref: setHost, "data-testid": "dynamic-host" }),
      React.createElement(
        Dialog.Root,
        { defaultOpen: true },
        React.createElement(
          Dialog.Portal,
          null,
          React.createElement(
            Dialog.Content,
            { "aria-label": "Dynamic branch", initialFocus: false },
            "Body",
          ),
        ),
        showBranch && host
          ? createPortal(
              React.createElement(
                Modal.Branch,
                { asChild: true },
                React.createElement("div", { "data-testid": "dynamic-branch" }, "Portal"),
              ),
              host,
            )
          : null,
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    const host = dom.window.document.querySelector("[data-testid=dynamic-host]");
    assert.equal(isEffectivelyInert(host), true);

    await act(async () => setBranchVisible(true));
    assert.equal(isEffectivelyInert(host), false);
    assert.equal(isEffectivelyInert(dom.window.document.querySelector("[data-testid=dynamic-branch]")), false);

    await act(async () => setBranchVisible(false));
    assert.equal(isEffectivelyInert(host), true);
  });
});

test("modal isolation observes new background nodes and restores managed versus author inert state", async () => {
  let setOpen;
  function Fixture() {
    const [open, updateOpen] = useState(false);
    setOpen = updateOpen;
    return React.createElement(
      React.Fragment,
      null,
      React.createElement("div", { "data-testid": "managed-background" }, "Background"),
      React.createElement("div", { "data-testid": "removed-author-inert" }, "Background two"),
      React.createElement(
        Dialog.Root,
        { open, keepMounted: true, onOpenChange: updateOpen },
        React.createElement(Dialog.Content, { "aria-label": "Cleanup dialog", initialFocus: false }, "Body"),
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    const author = dom.window.document.createElement("div");
    author.dataset.testid = "author-inert";
    author.setAttribute("inert", "author");
    dom.window.document.body.append(author);
    await act(async () => {
      setOpen(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    const managed = dom.window.document.querySelector("[data-testid=managed-background]");
    const removedAuthorInert = dom.window.document.querySelector("[data-testid=removed-author-inert]");
    assert.equal(author.getAttribute("inert"), "author");
    assert.equal(isEffectivelyInert(managed), true);
    assert.equal(isEffectivelyInert(removedAuthorInert), true);

    managed.setAttribute("inert", "author-during-modal");
    removedAuthorInert.removeAttribute("inert");
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    assert.equal(managed.getAttribute("inert"), "author-during-modal");
    assert.equal(removedAuthorInert.hasAttribute("inert"), true);

    const lateBackground = dom.window.document.createElement("div");
    lateBackground.dataset.testid = "late-background";
    dom.window.document.body.append(lateBackground);
    await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    assert.equal(lateBackground.hasAttribute("inert"), true);

    await act(async () => {
      setOpen(false);
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    assert.equal(author.getAttribute("inert"), "author");
    assert.equal(managed?.getAttribute("inert"), "author-during-modal");
    assert.equal(removedAuthorInert.hasAttribute("inert"), false);
    assert.equal(lateBackground.hasAttribute("inert"), false);
    assert.equal(
      dom.window.document.querySelector("[data-slot=dialog-content]")?.getAttribute("data-state"),
      "closed",
    );
  });
});

test("closing Content is inaccessible during exit presence and abrupt unmount restores ownership", async () => {
  let setOpen;
  let setMounted;

  function Fixture() {
    const [open, updateOpen] = useState(true);
    const [mounted, updateMounted] = useState(true);
    const finalRef = useRef(null);
    setOpen = updateOpen;
    setMounted = updateMounted;
    return React.createElement(
      Fragment,
      null,
      React.createElement("button", { ref: finalRef, "data-testid": "exit-final" }, "After"),
      React.createElement("div", { "data-testid": "exit-background" }, "Background"),
      mounted
        ? React.createElement(
            Dialog.Root,
            { open, onOpenChange: updateOpen },
            React.createElement(
              Dialog.Content,
              {
                "aria-label": "Animated close",
                finalFocus: finalRef,
                initialFocus: false,
                style: { animationDuration: "1s" },
              },
              React.createElement("button", { "data-testid": "exit-inside" }, "Inside"),
            ),
          )
        : null,
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    const query = (value) => dom.window.document.querySelector(`[data-testid=${value}]`);
    await waitForCondition(
      () => isEffectivelyInert(query("exit-background")),
      "expected the open dialog to isolate the background",
    );
    query("exit-inside").focus();
    assert.equal(isEffectivelyInert(query("exit-background")), true);

    const originalGetComputedStyle = globalThis.getComputedStyle;
    globalThis.getComputedStyle = (element) => {
      const styles = originalGetComputedStyle(element);
      if (!element.matches?.("[data-slot=dialog-content]")) return styles;

      return new Proxy(styles, {
        get(target, property) {
          if (property === "animationName") return "exit-test";
          if (property === "animationDuration") return "1s";
          if (property === "animationDelay") return "0s";
          if (property === "animationIterationCount") return "1";
          return Reflect.get(target, property, target);
        },
      });
    };

    await act(async () => {
      setOpen(false);
      await Promise.resolve();
    });
    await waitForCondition(
      () => {
        const content = dom.window.document.querySelector("[role=dialog]");
        return content?.getAttribute("aria-hidden") === "true"
          && content.hasAttribute("inert");
      },
      "expected closing dialog content to become inaccessible during exit animation",
    );
    await waitForCondition(
      () => !isEffectivelyInert(query("exit-background"))
        && dom.window.document.body.style.overflow === ""
        && dom.window.document.documentElement.style.overflow === ""
        && dom.window.document.activeElement === query("exit-final"),
      "expected closing dialog ownership and focus to be restored",
    );
    const exitingContent = dom.window.document.querySelector("[role=dialog]");
    assert.equal(exitingContent?.isConnected, true);
    assert.equal(exitingContent?.hasAttribute("aria-modal"), false);
    assert.equal(exitingContent?.getAttribute("aria-hidden"), "true");
    assert.equal(exitingContent?.hasAttribute("inert"), true);
    assert.equal(isEffectivelyInert(query("exit-background")), false);
    assert.equal(dom.window.document.body.style.overflow, "");
    assert.equal(dom.window.document.documentElement.style.overflow, "");
    assert.equal(dom.window.document.activeElement, query("exit-final"));

    await act(async () => {
      exitingContent.dispatchEvent(new dom.window.Event("animationend", { bubbles: true }));
      await Promise.resolve();
    });
    await waitForCondition(
      () => dom.window.document.querySelector("[role=dialog]") === null,
      "expected exit animation completion to remove dialog content",
    );
    assert.equal(dom.window.document.querySelector("[role=dialog]"), null);

    await act(async () => setOpen(true));
    await waitForCondition(
      () => query("exit-inside") !== null
        && isEffectivelyInert(query("exit-background")),
      "expected the reopened dialog to restore modal ownership",
    );
    query("exit-inside").focus();
    await act(async () => {
      setMounted(false);
      await Promise.resolve();
    });
    await waitForCondition(
      () => dom.window.document.querySelector("[role=dialog]") === null
        && !isEffectivelyInert(query("exit-background"))
        && dom.window.document.activeElement === query("exit-final"),
      "expected abrupt unmount to restore modal ownership and focus",
    );
    assert.equal(dom.window.document.querySelector("[role=dialog]"), null);
    assert.equal(isEffectivelyInert(query("exit-background")), false);
    assert.equal(dom.window.document.body.style.overflow, "");
    assert.equal(dom.window.document.documentElement.style.overflow, "");
    assert.equal(dom.window.document.activeElement, query("exit-final"));
    globalThis.getComputedStyle = originalGetComputedStyle;
  });
});

test("Overlay rejects nested Content and ignores bubbled descendant clicks", async () => {
  for (const Family of [Dialog, Drawer]) {
    await assert.rejects(
      () => withHydratedDom(
        React.createElement(
          Family.Root,
          { defaultOpen: true },
          React.createElement(
            Family.Overlay,
            null,
            React.createElement(
              Family.Content,
              { "aria-label": "Invalid nesting" },
              "Body",
            ),
          ),
        ),
        async () => {},
      ),
      /Content must not be nested inside an aria-hidden Overlay/,
    );

    await withHydratedDom(
      React.createElement(
        Family.Root,
        { defaultOpen: true },
        React.createElement(
          Family.Overlay,
          { "data-testid": "portal-parent-overlay" },
          React.createElement(
            Family.Portal,
            null,
            React.createElement(
              Family.Content,
              { "aria-label": "Portalled outside Overlay", initialFocus: false },
              "Body",
            ),
          ),
        ),
      ),
      async ({ dom }) => {
        const overlay = dom.window.document.querySelector("[data-testid=portal-parent-overlay]");
        const content = dom.window.document.querySelector("[role=dialog]");
        assert.equal(overlay.contains(content), false);
      },
    );

    let open = true;
    function Fixture() {
      const [isOpen, setOpen] = useState(true);
      open = isOpen;
      return React.createElement(
        Family.Root,
        { open: isOpen, onOpenChange: setOpen },
        React.createElement(
          Family.Overlay,
          { "data-testid": "click-overlay" },
          React.createElement("span", { "data-testid": "overlay-decoration" }, "Decoration"),
        ),
        React.createElement(Family.Content, { "aria-label": "Valid siblings" }, "Body"),
      );
    }

    await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
      await act(async () => {
        dom.window.document.querySelector("[data-testid=overlay-decoration]").click();
        await Promise.resolve();
      });
      assert.equal(open, true);

      await act(async () => {
        dom.window.document.querySelector("[data-testid=click-overlay]").click();
        await Promise.resolve();
      });
      assert.equal(open, false);
    });
  }
});

test("nested modal scroll-lock handoff never unlocks or restores scroll between layers", async () => {
  let setChildOpen;
  let setParentOpen;

  function Fixture() {
    const [parentOpen, updateParentOpen] = useState(true);
    const [childOpen, updateChildOpen] = useState(false);
    setParentOpen = updateParentOpen;
    setChildOpen = updateChildOpen;
    return React.createElement(
      Dialog.Root,
      { open: parentOpen, onOpenChange: updateParentOpen },
      React.createElement(
        Dialog.Content,
        { "aria-label": "Parent", initialFocus: false },
        React.createElement(
          Dialog.Root,
          { open: childOpen, onOpenChange: updateChildOpen },
          React.createElement(
            Dialog.Portal,
            null,
            React.createElement(
              Dialog.Content,
              { "aria-label": "Child", initialFocus: false },
              "Child",
            ),
          ),
        ),
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    const restores = [];
    dom.window.scrollTo = (...coordinates) => restores.push(coordinates);
    const lockedStyle = dom.window.document.body.style.cssText;
    assert.equal(dom.window.document.body.style.overflow, "hidden");
    assert.equal(dom.window.document.documentElement.style.overflow, "hidden");

    await act(async () => setChildOpen(true));
    assert.equal(dom.window.document.body.style.cssText, lockedStyle);
    assert.deepEqual(restores, []);

    await act(async () => setChildOpen(false));
    assert.equal(dom.window.document.body.style.cssText, lockedStyle);
    assert.deepEqual(restores, []);

    await act(async () => setParentOpen(false));
    assert.equal(dom.window.document.body.style.overflow, "");
    assert.equal(dom.window.document.documentElement.style.overflow, "");
    assert.equal(restores.length, 0);
  });
});

test("modal Tab traversal skips unavailable candidates forward and backward", async () => {
  function Fixture() {
    return React.createElement(
      Dialog.Root,
      { defaultOpen: true },
      React.createElement(
        Dialog.Content,
        { "aria-label": "Tab filtering", initialFocus: false },
        React.createElement("button", { "data-testid": "tab-first" }, "First"),
        React.createElement("button", { hidden: true, "data-testid": "tab-hidden" }, "Hidden"),
        React.createElement("div", { inert: true }, React.createElement("button", null, "Inert")),
        React.createElement("button", { disabled: true }, "Disabled"),
        React.createElement("button", { "aria-disabled": "true" }, "ARIA disabled"),
        React.createElement("button", { style: { display: "none" } }, "Display none"),
        React.createElement(
          "div",
          { style: { display: "none" } },
          React.createElement("button", null, "Hidden ancestor"),
        ),
        React.createElement("button", { style: { visibility: "hidden" } }, "Visibility hidden"),
        React.createElement("button", { "data-testid": "tab-last" }, "Last"),
      ),
    );
  }

  await withHydratedDom(React.createElement(Fixture), async ({ dom }) => {
    const first = dom.window.document.querySelector("[data-testid=tab-first]");
    const last = dom.window.document.querySelector("[data-testid=tab-last]");
    const pressTab = async (target, shiftKey = false) => {
      const event = new dom.window.KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Tab",
        shiftKey,
      });
      await act(async () => target.dispatchEvent(event));
      assert.equal(event.defaultPrevented, true);
    };

    first.focus();
    await pressTab(first);
    assert.equal(dom.window.document.activeElement, last);

    await pressTab(last, true);
    assert.equal(dom.window.document.activeElement, first);

    last.remove();
    await pressTab(first);
    assert.equal(dom.window.document.activeElement, first);
    dom.window.document.querySelector("[role=dialog]").append(last);
  });
});

test("focus-scope registrations are owner-safe across cleanup order and StrictMode", async () => {
  let setFirstOwner;
  let setSecondOwner;
  let observedScope;

  const firstMetadata = {
    focusContainment: "owned",
    tabParticipation: "modal-sequence",
    scrollParticipation: "allowed",
    isolation: "owned",
  };
  const secondMetadata = {
    focusContainment: "owned",
    tabParticipation: "delegate",
    scrollParticipation: "blocked",
    isolation: "background",
  };

  function Registrations() {
    const scope = useCreateFocusScope();
    const ref = useRef(null);
    const [firstOwner, updateFirstOwner] = useState(true);
    const [secondOwner, updateSecondOwner] = useState(true);
    setFirstOwner = updateFirstOwner;
    setSecondOwner = updateSecondOwner;
    observedScope = scope;

    useLayoutEffect(
      () => firstOwner
        ? scope.registerContainer(ref.current, firstMetadata)
        : undefined,
      [firstOwner, scope],
    );
    useLayoutEffect(
      () => secondOwner
        ? scope.registerContainer(ref.current, secondMetadata)
        : undefined,
      [scope, secondOwner],
    );
    return React.createElement("div", { ref, "data-testid": "shared-container" });
  }

  await withHydratedDom(
    React.createElement(StrictMode, null, React.createElement(Registrations)),
    async ({ dom }) => {
      const shared = dom.window.document.querySelector("[data-testid=shared-container]");
      assert.equal(observedScope.getContainers().length, 1);
      assert.deepEqual(observedScope.getContainerMetadata(shared), {
        focusContainment: "owned",
        tabParticipation: "delegate",
        scrollParticipation: "blocked",
        isolation: "owned",
      });

      await act(async () => setSecondOwner(false));
      assert.equal(observedScope.getContainers().length, 1);
      assert.deepEqual(observedScope.getContainerMetadata(shared), firstMetadata);

      await act(async () => setSecondOwner(true));
      await act(async () => setFirstOwner(false));
      assert.equal(observedScope.getContainers().length, 1);
      assert.deepEqual(observedScope.getContainerMetadata(shared), secondMetadata);
    },
  );
});

test("modal portal containers reject unsupported roots and cross-document elements", async () => {
  await withHydratedDom(React.createElement("div"), async ({ dom }) => {
    const valid = dom.window.document.createElement("div");
    assert.doesNotThrow(() => assertSupportedModalPortalContainer(valid));

    const fragment = dom.window.document.createDocumentFragment();
    assert.throws(
      () => assertSupportedModalPortalContainer(fragment),
      /current document/,
    );
    const shadowHost = dom.window.document.createElement("div");
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });
    assert.throws(
      () => assertSupportedModalPortalContainer(shadowRoot),
      /current document/,
    );

    const otherDom = new JSDOM("<!doctype html><body></body>");
    try {
      assert.throws(
        () => assertSupportedModalPortalContainer(otherDom.window.document.body),
        /current document/,
      );
    } finally {
      otherDom.window.close();
    }
  });
});
