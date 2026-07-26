import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React } from "../test-utils.mjs";
import { Image } from "../../dist/index.js";

function installDom() {
  const dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "https://example.test/" });
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

test("Image reports source transitions and ignores events from replaced sources", async () => {
  const { container, instances, cleanup } = installDom();
  const root = createRoot(container);
  const changes = [];
  try {
    await React.act(async () => root.render(React.createElement(Fixture, { src: "/first.jpg", changes })));
    assert.equal(container.firstElementChild.dataset.state, "loading");
    assert.equal(instances.length, 1);

    await React.act(async () => root.render(React.createElement(Fixture, { src: "/second.jpg", changes })));
    assert.equal(instances.length, 2);
    await React.act(async () => instances[0].dispatchEvent(new Event("load")));
    assert.equal(container.firstElementChild.dataset.state, "loading");

    instances[1].naturalWidth = 640;
    await React.act(async () => instances[1].dispatchEvent(new Event("load")));
    assert.equal(container.firstElementChild.dataset.state, "loaded");
    assert.equal(container.querySelector("img")?.alt, "Workspace");

    await React.act(async () => root.render(React.createElement(Fixture, { changes })));
    assert.equal(container.firstElementChild.dataset.state, "idle");
    assert.equal(container.querySelector("img"), null);
    assert.match(container.textContent, /Unavailable/);
    assert.deepEqual(changes, ["loading", "loading", "loaded", "idle"]);
  } finally {
    await React.act(async () => root.unmount());
    cleanup();
  }
});
