import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";
import { SwipeableItem, useSwipeableItem } from "../../dist/swipeable-item.js";

const h = React.createElement;
test("immediate settlement reports only the accepted target offset", async () => {
  const settled = [];
  await mount({ motion: "none", onSettle: (detail) => settled.push(detail) }, async ({ api }) => {
    settled.length = 0;
    await React.act(() => api().open("end"));
    assert.deepEqual(settled, [{ openSide: "end", offset: -80 }]);
    settled.length = 0;
    await React.act(() => api().reset());
    assert.deepEqual(settled, [{ openSide: null, offset: 0 }]);
  });
});

test("outside dismissal still works when an unrelated control has focus", async () => {
  await mount({ closeOnOutsideClick: true }, async ({ api, doc, event }) => {
    const outside = doc.createElement("button");
    doc.body.append(outside);
    await React.act(() => api().open("end"));
    outside.focus();
    await event(outside, "pointerdown");
    assert.equal(api().openSide, null);
  });
});
async function mount(options, run) {
  const dom = new JSDOM('<div id="root"></div>', { pretendToBeVisual: true });
  const keys = ["window", "document", "HTMLElement", "Element", "Node", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = keys.map((key) => globalThis[key]);
  keys.forEach((key) => { globalThis[key] = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key]; });
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  dom.window.HTMLElement.prototype.getBoundingClientRect = function () {
    const width = this.dataset.slot === "swipeable-item-actions" ? 80 : 320;
    return { x: 0, y: 0, width, height: 60, left: 0, top: 0, right: width, bottom: 60 };
  };
  let api;
  let setOptions;
  function Fixture() {
    const [props, update] = React.useState(options);
    setOptions = update;
    api = useSwipeableItem(props);
    return h(SwipeableItem.RootProvider, { value: api },
      h(SwipeableItem.Actions, { side: "start" }, h("button", null, "Archive")),
      h(SwipeableItem.Content, null, h("input", { "aria-label": "Nested" }), h("a", { href: "#record" }, "Record")),
      props.hideEnd ? null : h(SwipeableItem.Actions, { side: "end" }, h("button", null, "Save")));
  }
  const root = createRoot(document.getElementById("root"));
  const event = async (element, type, properties = {}) => {
    const e = new dom.window.Event(type, { bubbles: true, cancelable: true });
    const { timeStamp, ...rest } = properties;
    Object.assign(e, { pointerId: 1, button: 0, clientX: 160, clientY: 30, ...rest });
    if (timeStamp !== undefined) Object.defineProperty(e, 'timeStamp', { value: timeStamp });
    await React.act(() => element.dispatchEvent(e));
    return e;
  };
  try {
    await React.act(() => root.render(h(Fixture)));
    await run({ doc: document, api: () => api, content: document.querySelector('[data-slot="swipeable-item-content"]'), event,
      update: async (patch) => React.act(() => setOptions((props) => ({ ...props, ...patch }))) });
  } finally {
    await React.act(() => root.unmount());
    keys.forEach((key, index) => { globalThis[key] = previous[index]; });
    dom.window.close();
  }
}

test("delayed controlled acceptance and action removal preserve owner state", async () => {
  const requests = [];
  await mount({ openSide: null, onOpenSideChange: side => requests.push(side) }, async ({ api, update }) => {
    await React.act(() => api().open('end'));
    assert.equal(api().openSide, null);
    assert.equal(api().offset, 0);
    assert.deepEqual(requests, ['end']);
    await update({ openSide: 'end' });
    assert.equal(api().offset, -80);
    await update({ hideEnd: true });
    assert.equal(Math.abs(api().offset), 0);
    assert.equal(requests.at(-1), null);
    assert.equal(api().openSide, 'end'); // The controlled owner has not accepted close yet.
    await update({ openSide: null });
    assert.equal(api().openSide, null);
  });
});

test("action-owned popup keeps focus and owns outside dismissal", async () => {
  await mount({ closeOnOutsideClick: true }, async ({ api, doc, event }) => {
    const popup = doc.createElement('div'); popup.setAttribute('role', 'dialog');
    const button = doc.createElement('button'); popup.append(button); doc.body.append(popup);
    await React.act(() => api().open('end'));
    doc.querySelector('[data-side="end"][role="group"] button').focus();
    button.focus();
    await event(button, 'pointerdown');
    assert.equal(api().openSide, 'end');
    await React.act(() => api().close());
    assert.equal(doc.activeElement, button);
  });
});

test("reveal-only clamps; cancellation and controlled rejection restore accepted value", async () => {
  await mount({ openSide: null }, async ({ content, event, api }) => {
    await event(content, "pointerdown");
    await event(content, "pointermove", { clientX: 460 });
    assert.equal(api().offset, 80);
    await event(content, "pointerup", { clientX: 460 });
    assert.equal(api().openSide, null);
    assert.equal(api().offset, 0);
    await event(content, "pointerdown");
    await event(content, "pointermove", { clientX: 90 });
    await event(content, "pointercancel");
    assert.equal(api().offset, 0);
  });
});

test("recent velocity reveals, a pause cancels fling, and reversal follows the latest direction", async () => {
  await mount({}, async ({ api, content, event }) => {
    await event(content, 'pointerdown', { timeStamp: 1 });
    await event(content, 'pointermove', { clientX: 180, timeStamp: 10 });
    await event(content, 'pointerup', { clientX: 180, timeStamp: 11 });
    assert.equal(api().openSide, 'start');
    await React.act(() => api().reset());
    await event(content, 'pointerdown', { timeStamp: 100 });
    await event(content, 'pointermove', { clientX: 180, timeStamp: 110 });
    await event(content, 'pointerup', { clientX: 180, timeStamp: 220 });
    assert.equal(api().openSide, null);
    await event(content, 'pointerdown', { timeStamp: 300 });
    await event(content, 'pointermove', { clientX: 220, timeStamp: 310 });
    await event(content, 'pointermove', { clientX: 195, timeStamp: 320 });
    await event(content, 'pointerup', { clientX: 195, timeStamp: 321 });
    assert.equal(api().openSide, null);
  });
});

test("other pointers cannot steal a session and release position disarms full swipe", async () => {
  let executions = 0;
  await mount({ onFullSwipe: () => executions++, fullSwipeSides: ['start'] }, async ({ api, content, event }) => {
    await event(content, 'pointerdown');
    await event(content, 'pointerdown', { pointerId: 2 });
    await event(content, 'pointermove', { pointerId: 2, clientX: 400 });
    assert.equal(api().dragging, false);
    await event(content, 'pointermove', { clientX: 430 });
    assert.equal(api().armedSide, 'start');
    await event(content, 'pointerup', { clientX: 180 });
    assert.equal(executions, 0);
  });
});

test("disable and readonly invalidate a live gesture and prevent late execution", async () => {
  for (const property of ["disabled", "readOnly"]) {
    let executions = 0;
    await mount({ onFullSwipe: () => executions++ }, async ({ content, event, api, update }) => {
      await event(content, "pointerdown");
      await event(content, "pointermove", { clientX: 440 });
      await update({ [property]: true });
      await event(content, "pointerup", { clientX: 440 });
      assert.equal(api().dragging, false);
      assert.equal(api().offset, 0);
      assert.equal(executions, 0);
      assert.equal(content.tabIndex, property === "disabled" ? -1 : 0);
    });
  }
});

test("full swipe requires enabled side and deliberate release, never lost capture or keys", async () => {
  const executions = [];
  await mount({ onFullSwipe: (side) => executions.push(side), fullSwipeSides: ["start"] }, async ({ content, event, api }) => {
    await event(content, "keydown", { key: "ArrowRight" });
    await event(content, "keydown", { key: "ArrowRight" });
    assert.deepEqual(executions, []);
    await event(content, "pointerdown");
    await event(content, "pointermove", { clientX: 440 });
    assert.equal(api().armedSide, "start");
    await event(content, "lostpointercapture");
    assert.deepEqual(executions, []);
    await React.act(() => api().reset());
    await event(content, "pointerdown");
    await event(content, "pointermove", { clientX: -140 });
    assert.equal(api().offset, -80);
    await event(content, "pointercancel");
    await event(content, "pointerdown");
    await event(content, "pointermove", { clientX: 440 });
    await event(content, "pointerup", { clientX: 440 });
    await event(content, "pointerup", { clientX: 440 });
    assert.deepEqual(executions, ["start"]);
  });
});

test("vertical intent and native editing never become swipe; descendants retain Escape", async () => {
  await mount({}, async ({ content, doc, event, api }) => {
    await event(content, "pointerdown");
    await event(content, "pointermove", { clientY: 80 });
    await event(content, "pointermove", { clientX: 400, clientY: 80 });
    assert.equal(api().dragging, false);
    await event(doc.querySelector("input"), "pointerdown");
    await event(content, "pointermove", { clientX: 400 });
    assert.equal(api().dragging, false);
    await React.act(() => api().open("end"));
    await event(doc.querySelector("a"), "keydown", { key: "Escape" });
    assert.equal(api().openSide, "end");
  });
});

test("recognized drag suppresses only its pointer click; normal tap and keyboard remain", async () => {
  await mount({}, async ({ content, doc, event }) => {
    await event(content, "pointerdown");
    await event(content, "pointermove", { clientX: 220 });
    await event(content, "pointerup", { clientX: 220 });
    const link = doc.querySelector("a");
    assert.equal((await event(link, "click", { detail: 1 })).defaultPrevented, true);
    await event(link, "pointerdown");
    await event(link, "pointerup");
    assert.equal((await event(link, "click", { detail: 1 })).defaultPrevented, false);
    assert.equal((await event(link, "click", { detail: 0 })).defaultPrevented, false);
  });
});

test("closing owned action focus returns to Content; padding clicks are not actions", async () => {
  await mount({}, async ({ doc, content, event, api }) => {
    await React.act(() => api().open("end"));
    const actions = doc.querySelector('[data-side="end"][role="group"]');
    await event(actions, "click");
    assert.equal(api().openSide, "end");
    actions.querySelector("button").focus();
    await event(actions.querySelector("button"), "click");
    assert.equal(api().openSide, null);
    assert.equal(doc.activeElement, content);
    assert.equal(actions.hasAttribute("inert"), true);
  });
});

test("content dismissal consumes only the closing click and reset preserves controlled ownership", async () => {
  await mount({ closeOnContentClick: true }, async ({ content, event, api, update }) => {
    await React.act(() => api().open("end"));
    assert.equal((await event(content, "click", { detail: 1 })).defaultPrevented, true);
    assert.equal(api().openSide, null);
    await update({ openSide: "end" });
    await React.act(() => api().reset());
    assert.equal(api().openSide, "end");
    assert.equal(api().offset, -80);
  });
});
