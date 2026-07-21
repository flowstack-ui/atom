import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import {
  assert,
  test,
  React,
} from "../test-utils.mjs";

import { Tooltip } from "../../dist/index.js";

function installDom() {
  const dom = new JSDOM(
    "<!doctype html><html><body><div id=\"root\"></div></body></html>",
    { pretendToBeVisual: true, url: "https://example.test/" },
  );
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    HTMLElement: globalThis.HTMLElement,
    Element: globalThis.Element,
    Node: globalThis.Node,
    Event: globalThis.Event,
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Element = dom.window.Element;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

async function wait(milliseconds) {
  await React.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  });
}

function touch(identifier, clientX = 20, clientY = 20) {
  return { identifier, clientX, clientY };
}

async function dispatchTouch(target, type, { touches = [], changedTouches = touches } = {}) {
  const event = new window.Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    touches: { value: touches },
    targetTouches: { value: touches },
    changedTouches: { value: changedTouches },
  });
  await React.act(async () => {
    target.dispatchEvent(event);
  });
}

function TouchTooltip({
  disabled = false,
  variant = "plain",
  onOpenChange,
  showTrigger = true,
  triggerProps,
}) {
  return React.createElement(
    Tooltip.Provider,
    null,
    React.createElement(
      Tooltip.Root,
      { disabled, variant, onOpenChange },
      showTrigger ? React.createElement(
        Tooltip.Trigger,
        { asChild: true, ...triggerProps },
        React.createElement("button", { type: "button" }, "More information"),
      ) : null,
    ),
  );
}

test("Tooltip touch opens at 700ms and plain dismissal starts after release", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        onOpenChange: (open) => changes.push(open),
      }));
    });
    const trigger = container.querySelector("button");
    const activeTouch = touch(1);

    await dispatchTouch(trigger, "touchstart", { touches: [activeTouch] });
    await wait(640);
    assert.deepEqual(changes, []);
    assert.equal(trigger.hasAttribute("aria-describedby"), false);

    await wait(100);
    assert.deepEqual(changes, [true]);
    assert.equal(trigger.hasAttribute("aria-describedby"), true);

    await wait(100);
    assert.deepEqual(changes, [true]);
    await dispatchTouch(trigger, "touchend", {
      touches: [],
      changedTouches: [activeTouch],
    });

    await wait(1400);
    assert.deepEqual(changes, [true]);
    await wait(180);
    assert.deepEqual(changes, [true, false]);
    assert.equal(trigger.hasAttribute("aria-describedby"), false);
  } finally {
    if (container.childNodes.length > 0) {
      await React.act(async () => root.unmount());
    }
    cleanup();
  }
});

test("Tooltip rich touch uses a finite 3000ms post-release dismissal", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        variant: "rich",
        onOpenChange: (open) => changes.push(open),
      }));
    });
    const trigger = container.querySelector("button");
    const activeTouch = touch(2);

    await dispatchTouch(trigger, "touchstart", { touches: [activeTouch] });
    await wait(740);
    assert.deepEqual(changes, [true]);
    await dispatchTouch(trigger, "touchend", {
      touches: [],
      changedTouches: [activeTouch],
    });

    await wait(2800);
    assert.deepEqual(changes, [true]);
    await wait(260);
    assert.deepEqual(changes, [true, false]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Tooltip touch dismisses on outside touch and scroll after release", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        onOpenChange: (open) => changes.push(open),
      }));
    });
    const trigger = container.querySelector("button");
    const outsideTouch = touch(20);
    await dispatchTouch(trigger, "touchstart", { touches: [outsideTouch] });
    await wait(740);
    await dispatchTouch(trigger, "touchend", {
      touches: [],
      changedTouches: [outsideTouch],
    });
    await dispatchTouch(document.body, "touchstart", { touches: [touch(21)] });
    assert.deepEqual(changes, [true, false]);

    const scrollTouch = touch(22);
    await dispatchTouch(trigger, "touchstart", { touches: [scrollTouch] });
    await wait(740);
    await dispatchTouch(trigger, "touchend", {
      touches: [],
      changedTouches: [scrollTouch],
    });
    await React.act(async () => window.dispatchEvent(new window.Event("scroll")));
    assert.deepEqual(changes, [true, false, true, false]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Tooltip cancels abandoned pending touch gestures", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        onOpenChange: (open) => changes.push(open),
      }));
    });
    const trigger = container.querySelector("button");

    const earlyRelease = touch(3);
    await dispatchTouch(trigger, "touchstart", { touches: [earlyRelease] });
    await dispatchTouch(trigger, "touchend", {
      touches: [],
      changedTouches: [earlyRelease],
    });

    const moved = touch(4);
    await dispatchTouch(trigger, "touchstart", { touches: [moved] });
    await dispatchTouch(trigger, "touchmove", {
      touches: [touch(4, 31, 20)],
    });

    const cancelled = touch(5);
    await dispatchTouch(trigger, "touchstart", { touches: [cancelled] });
    await dispatchTouch(trigger, "touchcancel", {
      touches: [],
      changedTouches: [cancelled],
    });

    const firstTouch = touch(6);
    await dispatchTouch(trigger, "touchstart", { touches: [firstTouch] });
    await dispatchTouch(trigger, "touchstart", {
      touches: [firstTouch, touch(7, 40, 40)],
      changedTouches: [touch(7, 40, 40)],
    });

    const scrolled = touch(8);
    await dispatchTouch(trigger, "touchstart", { touches: [scrolled] });
    await React.act(async () => {
      window.dispatchEvent(new window.Event("scroll"));
    });

    await wait(760);
    assert.deepEqual(changes, []);
    assert.equal(trigger.hasAttribute("aria-describedby"), false);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Tooltip preserves consumer touch handlers while cancelling internally", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const userEvents = [];
  try {
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        triggerProps: {
          onTouchStart: () => userEvents.push("start"),
          onTouchMove: () => userEvents.push("move"),
          onTouchCancel: () => userEvents.push("cancel"),
        },
      }));
    });
    const trigger = container.querySelector("button");
    await dispatchTouch(trigger, "touchstart", { touches: [touch(12)] });
    await dispatchTouch(trigger, "touchmove", {
      touches: [touch(12, 31, 20)],
    });
    await dispatchTouch(trigger, "touchcancel", {
      touches: [],
      changedTouches: [touch(12, 31, 20)],
    });

    assert.deepEqual(userEvents, ["start", "move", "cancel"]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Tooltip ignores compatibility hover and focus after a quick touch", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        onOpenChange: (open) => changes.push(open),
      }));
    });
    const trigger = container.querySelector("button");
    const quickTouch = touch(14);

    await dispatchTouch(trigger, "touchstart", { touches: [quickTouch] });
    await dispatchTouch(trigger, "touchend", {
      touches: [],
      changedTouches: [quickTouch],
    });
    await React.act(async () => {
      trigger.dispatchEvent(new window.MouseEvent("mouseover", {
        bubbles: true,
        cancelable: true,
      }));
      trigger.focus();
    });

    await wait(500);
    assert.deepEqual(changes, []);
    assert.equal(trigger.hasAttribute("aria-describedby"), false);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Tooltip suppresses selection and callout only during active touch tracking", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const userEvents = [];
  try {
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        triggerProps: {
          style: { color: "red" },
          onContextMenu: () => userEvents.push("contextmenu"),
        },
      }));
    });
    const trigger = container.querySelector("button");
    const activeTouch = touch(15);

    await dispatchTouch(trigger, "touchstart", { touches: [activeTouch] });
    assert.equal(trigger.style.color, "red");
    assert.equal(trigger.style.userSelect, "none");

    const contextMenuEvent = new window.MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    await React.act(async () => {
      trigger.dispatchEvent(contextMenuEvent);
    });
    assert.deepEqual(userEvents, ["contextmenu"]);
    assert.equal(contextMenuEvent.defaultPrevented, true);

    await dispatchTouch(trigger, "touchend", {
      touches: [],
      changedTouches: [activeTouch],
    });
    assert.equal(trigger.style.color, "red");
    assert.equal(trigger.style.userSelect, "");
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Tooltip closes an opened touch session when movement abandons it", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        onOpenChange: (open) => changes.push(open),
      }));
    });
    const trigger = container.querySelector("button");
    await dispatchTouch(trigger, "touchstart", { touches: [touch(9)] });
    await wait(740);
    assert.deepEqual(changes, [true]);

    await dispatchTouch(trigger, "touchmove", {
      touches: [touch(9, 20, 31)],
    });
    assert.deepEqual(changes, [true, false]);
    assert.equal(trigger.hasAttribute("aria-describedby"), false);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Tooltip closes an opened touch session when Trigger unmounts", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  const onOpenChange = (open) => changes.push(open);
  try {
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, { onOpenChange }));
    });
    const trigger = container.querySelector("button");
    const activeTouch = touch(13);
    await dispatchTouch(trigger, "touchstart", { touches: [activeTouch] });
    await wait(740);
    assert.deepEqual(changes, [true]);
    await dispatchTouch(trigger, "touchend", {
      touches: [],
      changedTouches: [activeTouch],
    });

    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        onOpenChange,
        showTrigger: false,
      }));
    });
    assert.deepEqual(changes, [true, false]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Tooltip clears pending touch work on disabled change and unmount", async () => {
  const { container, cleanup } = installDom();
  let root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        onOpenChange: (open) => changes.push(open),
      }));
    });
    let trigger = container.querySelector("button");
    await dispatchTouch(trigger, "touchstart", { touches: [touch(10)] });
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        disabled: true,
        onOpenChange: (open) => changes.push(open),
      }));
    });

    await React.act(async () => root.unmount());
    root = createRoot(container);
    await React.act(async () => {
      root.render(React.createElement(TouchTooltip, {
        onOpenChange: (open) => changes.push(open),
      }));
    });
    trigger = container.querySelector("button");
    await dispatchTouch(trigger, "touchstart", { touches: [touch(11)] });
    await React.act(async () => root.unmount());

    await wait(760);
    assert.deepEqual(changes, []);
  } finally {
    if (container.childNodes.length > 0) {
      await React.act(async () => root.unmount());
    }
    cleanup();
  }
});
