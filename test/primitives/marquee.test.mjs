import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { Marquee, useMarquee } from "../../dist/marquee.js";
import { marqueeDirection, marqueeGeometry, normalizeMarqueeNumbers, invalidMarqueeReplica } from "../../dist/_internal/primitives/marquee/geometry.js";

test("Marquee validates geometry, normalizes numbers and bounds copy count", () => {
  assert.deepEqual(normalizeMarqueeNumbers(NaN, -1, 1.5), { speed: 50, delay: 0, loopCount: 0 });
  assert.deepEqual(marqueeGeometry(100, 300, 20, 60, true), { distance: 120, duration: 2, copyCount: 3 });
  assert.equal(marqueeGeometry(0, 300, 20, 50, true), null);
  assert.equal(marqueeGeometry(1, 10000, 0, 50, true), null);
  assert.equal(marqueeGeometry(100, 300, 20, 50, false), null);
  for (const side of ["start", "end", "top", "bottom"]) for (const dir of ["ltr", "rtl"]) {
    const a = marqueeDirection(side, dir, false), b = marqueeDirection(side, dir, true);
    assert.notEqual(a.reversed, b.reversed);
    assert.equal(a.orientation, side === "top" || side === "bottom" ? "vertical" : "horizontal");
  }
  assert.equal(marqueeDirection("start", "ltr", false).reversed, false);
  assert.equal(marqueeDirection("start", "rtl", false).reversed, true);
});
test("Marquee SSR emits only the original and honors host projection", () => {
  const html = renderToStaticMarkup(React.createElement(Marquee.Root, { "aria-label": "News" }, React.createElement(Marquee.Viewport, null,
    React.createElement(Marquee.Content, { renderReplica: () => { throw Error("SSR cannot repeat content"); } }, React.createElement(Marquee.Item, { asChild: true }, React.createElement("span", null, "Original"))))));
  assert.match(html, /role="region"/); assert.match(html, /aria-live="off"/); assert.match(html, /data-static/);
  assert.match(html, /tabindex="0"/);
  assert.doesNotMatch(html, /data-replica/); assert.equal((html.match(/Original/g) || []).length, 1);
  assert.match(html, /<span data-slot="marquee-item"/);
});
test("Marquee replica validation rejects IDs, forms, focus and media", () => {
  const dom = new JSDOM("<div id='root'></div>"); const node = dom.window.document.getElementById("root");
  for (const child of ["<span id='duplicate'>x</span>", "<a href='/'>x</a>", "<input name='quantity'>", "<span tabindex='0'>x</span>", "<video></video>", "<div contenteditable='true'>x</div>"]) { node.innerHTML = child; assert.equal(invalidMarqueeReplica(node), true); }
  node.innerHTML = "<span>Acme</span><img alt='' src='/logo.png'>"; assert.equal(invalidMarqueeReplica(node), false); dom.window.close();
});
test("Marquee controlled pause requests, composed refs and independent safety state", async () => {
  const dom = new JSDOM("<div id='app'></div>", { pretendToBeVisual: true });
  const names = ["window", "document", "HTMLElement", "Element", "Node", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(names.map(name => [name, globalThis[name]]));
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element, Node: dom.window.Node, IS_REACT_ACT_ENVIRONMENT: true });
  const root = createRoot(document.getElementById("app")), ref = React.createRef(); let controller; const requests = [];
  function App({ controlled }) {
    controller = useMarquee({ ...(controlled ? { paused: false } : {}), onPauseChange: value => requests.push(value), pauseOnInteraction: true });
    return React.createElement(Marquee.RootProvider, { value: controller, ref, "aria-label": "Partners" }, React.createElement(Marquee.Viewport, null, React.createElement(Marquee.Content, null, "Acme")));
  }
  try {
    await React.act(async () => root.render(React.createElement(App, { controlled: true })));
    await React.act(async () => controller.pause()); assert.equal(controller.requestedPaused, false); assert.equal(requests.at(-1), true);
    assert.equal(ref.current.tagName, "DIV");
    await React.act(async () => root.render(React.createElement(App, { controlled: false })));
    await React.act(async () => controller.pause()); assert.equal(controller.requestedPaused, true);
    await React.act(async () => controller.setHovered(true)); await React.act(async () => controller.setHovered(false));
    assert.ok(controller.pauseReasons.includes("user"));
    await React.act(async () => controller.restart()); assert.equal(controller.requestedPaused, true); assert.equal(controller.iteration, 0);
    await React.act(async () => controller.resume()); assert.equal(controller.requestedPaused, false); assert.equal(controller.static, true);
  } finally { await React.act(async () => root.unmount()); for (const name of names) { if (previous[name] === undefined) delete globalThis[name]; else globalThis[name] = previous[name]; } dom.window.close(); }
});
