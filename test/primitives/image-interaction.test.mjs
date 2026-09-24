import { JSDOM } from "jsdom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { assert, test, React } from "../test-utils.mjs";
import { Image } from "../../dist/index.js";

function installDom() {
  const dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "https://example.test/" });
  // jsdom does not select srcset candidates and reports an empty-src image as
  // complete. Model pending candidate requests; cached tests override per host.
  const complete = Object.getOwnPropertyDescriptor(dom.window.HTMLImageElement.prototype, "complete").get;
  Object.defineProperty(dom.window.HTMLImageElement.prototype, "complete", {
    configurable: true,
    get() { return this.getAttribute("srcset") ? false : complete.call(this); },
  });
  const saved = new Map();
  const instances = [];
  class MockImage extends dom.window.EventTarget {
    complete = false;
    naturalWidth = 0;
    set src(value) { this.currentSrc = value; instances.push(this); }
  }
  for (const [key, value] of Object.entries({
    window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement, Event: dom.window.Event, IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  dom.window.Image = MockImage;
  return { container: dom.window.document.getElementById("root"), instances, cleanup() {
    dom.window.close();
    for (const [key, descriptor] of saved) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
  } };
}

function Fixture({ src, changes }) {
  return React.createElement(Image.Root, { src, onLoadingStatusChange: (status) => changes.push(status) },
    React.createElement(Image.Content, { alt: "Workspace" }),
    React.createElement(Image.Fallback, null, "Unavailable"));
}

test("Image observes its actual host without detached preloads and resets source state", async () => {
  const { container, instances, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(Fixture, { src: "/first.jpg", changes })));
    assert.equal(container.firstElementChild.dataset.state, "loading");
    assert.equal(instances.length, 0);
    const image = container.querySelector("img");
    assert.ok(image);

    await React.act(async () => root.render(React.createElement(Fixture, { src: "/second.jpg", changes })));
    assert.equal(instances.length, 0);
    assert.equal(container.querySelector("img"), image);
    assert.equal(container.firstElementChild.dataset.state, "loading");

    await React.act(async () => image.dispatchEvent(new Event("load")));
    assert.equal(container.querySelector('[data-slot="image"]').dataset.state, "loaded");
    assert.equal(container.querySelector("img")?.alt, "Workspace");
    await React.act(async () => image.dispatchEvent(new Event("error")));
    assert.equal(image.hidden, true);
    assert.match(container.textContent, /Unavailable/);

    await React.act(async () => root.render(React.createElement(Fixture, { changes })));
    assert.equal(container.firstElementChild.dataset.state, "idle");
    assert.equal(container.querySelector("img"), null);
    assert.match(container.textContent, /Unavailable/);
    assert.deepEqual(changes, ["loading", "loading", "loaded", "error", "idle"]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});

test("Image hydration preserves SSR host and detects a cached image", async () => {
  const { container, instances, cleanup } = installDom();
  const changes = [];
  const fixture = React.createElement(Fixture, { src: "/cached.jpg", changes });
  container.innerHTML = renderToString(fixture);
  const image = container.querySelector("img");
  Object.defineProperties(image, { complete: { value: true }, naturalWidth: { value: 640 }, currentSrc: { value: "https://example.test/cached.jpg" } });
  let root;
  try {
    await React.act(async () => { root = hydrateRoot(container, fixture); });
    assert.equal(container.querySelector("img"), image);
    assert.equal(container.querySelector('[data-slot="image"]').dataset.state, "loaded");
    assert.equal(instances.length, 0);
  } finally { await React.act(async () => root?.unmount()); cleanup(); }
});

test("Image keeps native delivery props, composed refs and event handlers", async () => {
  const { container, instances, cleanup } = installDom();
  const root = createRoot(container);
  const ref = React.createRef();
  let calls = 0;
  const fixture = (srcSet) => React.createElement(Image.Root, { src: "/fallback.jpg" },
    React.createElement(Image.Content, { asChild: true, ref, alt: "Media", srcSet, sizes: "50vw", loading: "lazy", decoding: "async", fetchPriority: "low", crossOrigin: "anonymous", referrerPolicy: "no-referrer", onLoad: () => calls++ }, React.createElement("img", { onLoad: () => calls++ })));
  try {
    await React.act(async () => root.render(fixture("/small.jpg 400w")));
    const image = container.querySelector("img");
    assert.equal(ref.current, image);
    for (const [key,value] of Object.entries({loading:"lazy", decoding:"async", fetchpriority:"low", crossorigin:"anonymous", referrerpolicy:"no-referrer",sizes:"50vw"})) assert.equal(image.getAttribute(key),value);
    await React.act(async () => image.dispatchEvent(new Event("load")));
    assert.equal(calls, 2);
    await React.act(async () => root.render(fixture("/large.jpg 1200w")));
    assert.equal(container.firstElementChild.dataset.state,"loading");
    assert.equal(container.querySelector("img"),image);
    assert.equal(instances.length,0);
  } finally { await React.act(async () => root.unmount()); assert.equal(ref.current,null); cleanup(); }
});

test("Image clears legacy Content-only srcSet after error and restores idle fallback", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  const fixture = (srcSet) => React.createElement(Image.Root, null,
    React.createElement(Image.Content, { srcSet, alt: "Media" }),
    React.createElement(Image.Fallback, null, "Unavailable"));
  try {
    await React.act(async () => root.render(fixture("/only.png 1x")));
    await React.act(async () => container.querySelector("img").dispatchEvent(new Event("error")));
    await React.act(async () => root.render(fixture(undefined)));
    assert.equal(container.firstElementChild.dataset.state, "idle");
    assert.equal(container.querySelector("img"), null);
    assert.match(container.textContent, /Unavailable/);
  } finally { await React.act(async () => root.unmount()); cleanup(); }
});

test("Image hydration detects cached broken hosts even without currentSrc", async () => {
  const { container, cleanup } = installDom();
  const fixture = React.createElement(Fixture, { src: "/broken.jpg", changes: [] });
  container.innerHTML = renderToString(fixture);
  const image = container.querySelector("img");
  Object.defineProperties(image, { complete: { value: true }, naturalWidth: { value: 0 }, currentSrc: { value: "" } });
  let root;
  try {
    await React.act(async () => { root = hydrateRoot(container, fixture); });
    assert.equal(container.querySelector('[data-slot="image"]').dataset.state, "error");
    assert.equal(image.hidden, true);
  } finally { await React.act(async () => root?.unmount()); cleanup(); }
});

test("Image Root candidates replace, clear independently and ignore detached hosts in StrictMode", async () => {
  const { container, instances, cleanup } = installDom();
  const root = createRoot(container);
  const ref = React.createRef();
  const fixture = (src, srcSet, key = "one") => React.createElement(React.StrictMode, null,
    React.createElement(Image.Root, { src, srcSet },
      React.createElement(Image.Content, { key, ref, alt: "Media", loading: "lazy" }),
      React.createElement(Image.Fallback, null, "Unavailable")));
  try {
    await React.act(async () => root.render(fixture("/first.jpg", "/small.jpg 1x")));
    const old = ref.current;
    await React.act(async () => old.dispatchEvent(new Event("error")));
    await React.act(async () => root.render(fixture(undefined, "/second.jpg 1x", "two")));
    assert.notEqual(ref.current, old);
    assert.equal(ref.current.hidden, false);
    await React.act(async () => old.dispatchEvent(new Event("error")));
    assert.equal(container.firstElementChild.dataset.state, "loading");
    await React.act(async () => ref.current.dispatchEvent(new Event("load")));
    assert.equal(container.firstElementChild.dataset.state, "loaded");
    await React.act(async () => root.render(fixture("/third.jpg", undefined, "two")));
    assert.equal(container.firstElementChild.dataset.state, "loading");
    await React.act(async () => root.render(fixture(undefined, undefined)));
    assert.equal(container.firstElementChild.dataset.state, "idle");
    assert.equal(ref.current, null);
    assert.equal(instances.length, 0);
  } finally { await React.act(async () => root.unmount()); cleanup(); }
});

test("Image observes custom-host mutations and preserves authored hidden and React cleanup", async () => {
  const { container, cleanup } = installDom();
  const root = createRoot(container);
  let disposed = 0;
  let host;
  const hostRef = (node) => { host = node; return () => { disposed++; }; };
  try {
    await React.act(async () => root.render(React.createElement(Image.Root, null,
      React.createElement(Image.Content, { asChild: true, alt: "Media", hidden: true },
        React.createElement("img", { src: "/custom.png", ref: hostRef })))));
    assert.equal(host.hidden, true);
    await React.act(async () => host.dispatchEvent(new Event("load")));
    assert.equal(container.firstElementChild.dataset.state, "loaded");
    assert.equal(host.hidden, true);
    await React.act(async () => host.removeAttribute("src"));
    assert.equal(container.firstElementChild.dataset.state, "idle");
    await React.act(async () => host.setAttribute("srcset", "/new.png 1x"));
    assert.equal(container.firstElementChild.dataset.state, "loading");
  } finally { await React.act(async () => root.unmount()); assert.ok(disposed > 0); cleanup(); }
});
