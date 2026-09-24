import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { Collapsible, useCollapsible } from "../../dist/collapsible.js";
const h = React.createElement;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function withDom(run) {
  const dom = new JSDOM('<div id="root"></div>', { pretendToBeVisual: true });
  const globals = {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const saved = new Map(
    Object.keys(globals).map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  for (const [key, value] of Object.entries(globals))
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  const root = createRoot(dom.window.document.getElementById("root"));
  const render = async (element) => {
    await React.act(async () => root.render(element));
  };
  const settle = async () => {
    await React.act(async () => delay(80));
  };
  try {
    await run({ document: dom.window.document, render, settle });
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}
function Disclosure(props, contentProps) {
  return h(
    Collapsible.Root,
    props,
    h(Collapsible.Trigger, null, "Toggle"),
    h(
      Collapsible.Content,
      contentProps,
      h("input", { defaultValue: "retained" }),
    ),
  );
}
for (const lazyMount of [false, true])
  for (const unmountOnExit of [false, true]) {
    test(`Collapsible lifecycle lazy=${lazyMount} unmount=${unmountOnExit}`, async () =>
      withDom(async ({ document, render, settle }) => {
        const options = { lazyMount, unmountOnExit };
        await render(Disclosure(options));
        assert.equal(Boolean(document.querySelector("input")), !lazyMount);
        await React.act(async () => document.querySelector("button").click());
        await settle();
        document.querySelector("input").value = "changed";
        await React.act(async () => document.querySelector("button").click());
        await settle();
        assert.equal(Boolean(document.querySelector("input")), !unmountOnExit);
        if (!unmountOnExit) {
          assert.equal(document.querySelector("input").value, "changed");
          assert.equal(document.querySelector('[role="region"]').hidden, true);
        }
      }));
  }
test("Collapsible controller, IDs and close focus restoration", async () =>
  withDom(async ({ document, render, settle }) => {
    let api;
    function App() {
      api = useCollapsible({
        defaultOpen: true,
        ids: { trigger: "toggle", content: "panel" },
      });
      return h(
        Collapsible.RootProvider,
        { value: api },
        h(Collapsible.Trigger, null, "Toggle"),
        h(Collapsible.Content, null, h("button", null, "Inside")),
        h(Collapsible.Indicator),
        h(Collapsible.Context, null, (value) =>
          h("output", null, String(value.open)),
        ),
      );
    }
    await render(h(App));
    assert.equal(
      document.querySelector("button").getAttribute("aria-controls"),
      "panel",
    );
    document.querySelector('[role="region"] button').focus();
    await React.act(async () => api.setOpen(false));
    await settle();
    assert.equal(document.activeElement.id, "toggle");
    assert.equal(document.querySelector("output").textContent, "false");
    assert.equal(
      document.querySelector('[data-slot="collapsible-indicator"]').dataset
        .state,
      "closed",
    );
  }));
test("Collapsible partial preview stays mounted and inert regardless of mount policy", () => {
  const html = renderToStaticMarkup(
    Disclosure({ collapsedHeight: 80, collapsedWidth: "10rem" }),
  );
  assert.match(html, /data-has-collapsed-size=""/);
  assert.match(html, /inert=""/);
  assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, / hidden=""/);
  assert.match(html, /--collapsed-height:80px/);
  for (const value of [-1, Infinity, "-1px", "80px; color:red", "auto"])
    assert.throws(
      () => renderToStaticMarkup(Disclosure({ collapsedHeight: value })),
      /collapsed size/,
    );
});
test("Collapsible exits once and ignores descendant animation events", async () =>
  withDom(async ({ document, render, settle }) => {
    let exits = 0;
    const options = { onExitComplete: () => exits++ };
    await render(Disclosure(options));
    await settle();
    assert.equal(exits, 0);
    await React.act(async () => document.querySelector("button").click());
    await settle();
    await React.act(async () => document.querySelector("button").click());
    await settle();
    assert.equal(exits, 1);
    await render(Disclosure(options));
    await settle();
    assert.equal(exits, 1);
  }));
test("Collapsible Activity pauses retained effects and preserves state", async () =>
  withDom(async ({ document, render, settle }) => {
    let active = 0;
    function Child() {
      React.useEffect(() => {
        active++;
        return () => active--;
      }, []);
      return h("input", { defaultValue: "initial" });
    }
    await render(
      h(
        Collapsible.Root,
        { defaultOpen: true, hideMode: "activity", unmountOnExit: false },
        h(Collapsible.Trigger, null, "Toggle"),
        h(Collapsible.Content, null, h(Child)),
      ),
    );
    assert.equal(active, 1);
    document.querySelector("input").value = "changed";
    await React.act(async () => document.querySelector("button").click());
    await settle();
    assert.equal(active, 0);
    await React.act(async () => document.querySelector("button").click());
    await settle();
    assert.equal(active, 1);
    assert.equal(document.querySelector("input").value, "changed");
  }));
