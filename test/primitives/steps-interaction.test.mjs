import { test, assert, React } from "../test-utils.mjs";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { Steps, useSteps } from "../../dist/steps.js";
const h = React.createElement;
async function fixture(run) {
  const dom = new JSDOM("<div id='root'></div>", { url: "https://example.test/", pretendToBeVisual: true
  });
  const saved = new Map();
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement,
    MutationObserver: dom.window.MutationObserver,
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  }
  const root = createRoot(document.getElementById("root"));
  try {
    await run({
      dom,
      render: async (element) => React.act(async () => root.render(element)),
      event: async (node, type, options = {}) => {
        const event =
          type === "keydown"
            ? new dom.window.KeyboardEvent(type, {
                bubbles: true,
                cancelable: true,
                ...options,
              })
            : new dom.window.MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                ...options,
              });
        await React.act(async () => node.dispatchEvent(event));
        return event;
      },
    });
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved)
      descriptor
        ? Object.defineProperty(globalThis, key, descriptor)
        : delete globalThis[key];
  }
}

test("controller validates non-linear forward movement and reports the action", async () => fixture(async ({ render }) => {
  let api; const invalid = [];
  function Demo() { api = useSteps({ count: 3, isStepValid: () => false, onStepInvalid: x => invalid.push(x) }); return h(Steps.RootProvider, { value: api }); }
  await render(h(Demo));
  await React.act(async () => api.nextStep());
  assert.equal(api.step, 0);
  assert.deepEqual(invalid, [{ step: 0, targetStep: 1, action: "next" }]);
}));
test("optional stages skip next/previous but remain directly selectable", async () => fixture(async ({ render }) => {
  let api;
  function Demo() { api = useSteps({ count: 4, isStepSkippable: i => i === 1 || i === 2 }); return h(Steps.RootProvider, { value: api }); }
  await render(h(Demo));
  await React.act(async () => api.nextStep()); assert.equal(api.step, 3);
  await React.act(async () => api.prevStep()); assert.equal(api.step, 0);
  await React.act(async () => api.setStep(1)); assert.equal(api.step, 1);
  assert.equal(api.percent, 25); assert.equal(api.getItemState(1).skippable, true);
}));
test("linear jumps validate each nonoptional crossed stage; controlled state remains authoritative", async () => fixture(async ({ render }) => {
  let api; const invalid = []; const changes = [];
  function Demo({ step }) { api = useSteps({ count: 3, step, linear: true, isStepValid: i => i !== 1, onStepInvalid: x => invalid.push(x), onStepChange: x => changes.push(x) }); return h(Steps.RootProvider, { value: api }); }
  await render(h(Demo, { step: 0 }));
  await React.act(async () => api.setStep(3));
  assert.equal(invalid[0].step, 1); assert.deepEqual(changes, []);
  await render(h(Demo, { step: 2 })); assert.equal(api.step, 2);
  await React.act(async () => api.resetStep()); assert.deepEqual(changes, [0]); assert.equal(api.step, 2);
}));
for (const keepMounted of [true, false]) test(`focus recovery for keepMounted=${keepMounted}`, async () => fixture(async ({ render, event }) => {
  await render(h(Steps.Root, { count: 2 },
    h(Steps.Content, { index: 0, keepMounted, "aria-label": "First" }, h(Steps.NextTrigger, null, "Next")),
    h(Steps.Content, { index: 1, keepMounted, "aria-label": "Second" }, "Second")));
  const button = document.querySelector("button"); button.focus();
  await event(button, "click");
  assert.equal(document.activeElement.getAttribute("aria-label"), "Second");
}));
test("controller IDs, completion edges, disabled state and boundaries", async () => fixture(async ({ render }) => {
  let api; let completed = 0;
  function Demo({ disabled = false }) { api = useSteps({ count: 1, disabled, ids: { root: "workflow", title: i => `stage-${i}` }, onStepComplete: () => completed++ }); return h(Steps.RootProvider, { value: api }); }
  await render(h(Demo)); assert.equal(api.getId("title", 0), "stage-0");
  assert.equal(document.querySelector("[data-steps-root]").id, "workflow");
  await React.act(async () => api.nextStep()); assert.equal(completed, 1); assert.equal(api.percent, 100);
  await React.act(async () => api.nextStep()); assert.equal(completed, 1);
  await render(h(Demo, { disabled: true }));
  await React.act(async () => api.resetStep()); assert.equal(api.step, 1);
}));
test("nested focus recovery stays in the inner workflow and never steals external focus", async () => fixture(async ({ render, event }) => {
  let outer;
  function Demo() {
    outer = useSteps({ count: 2 });
    return h(React.Fragment, null, h("button", { id: "external" }, "External"),
      h(Steps.RootProvider, { value: outer },
        h(Steps.Content, { index: 0, "aria-label": "Outer first" },
          h(Steps.Root, { count: 2 },
            h(Steps.Content, { index: 0, keepMounted: false, "aria-label": "Inner first" }, h(Steps.NextTrigger, null, "Inner next")),
            h(Steps.Content, { index: 1, "aria-label": "Inner second" }, "Second"))),
        h(Steps.Content, { index: 1, "aria-label": "Outer second" }, "Second")));
  }
  await render(h(Demo));
  const next = Array.from(document.querySelectorAll("button")).find(node => node.textContent === "Inner next");
  next.focus(); await event(next, "click");
  assert.equal(document.activeElement.getAttribute("aria-label"), "Inner second");
  document.getElementById("external").focus();
  await React.act(async () => outer.nextStep());
  assert.equal(document.activeElement.id, "external");
}));
