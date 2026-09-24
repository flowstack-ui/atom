import { JSDOM } from "jsdom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { assert, test, React } from "../test-utils.mjs";
import { AvatarRoot, AvatarImage, AvatarFallback } from "../../dist/index.js";

function setup() {
  const dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "https://example.test/" });
  const saved = new Map();
  let preloads = 0;
  dom.window.Image = class { constructor() { preloads++; } };
  for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
    navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, Event: dom.window.Event,
    IS_REACT_ACT_ENVIRONMENT: true })) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  return { container: document.getElementById("root"), preloads: () => preloads, cleanup() {
    dom.window.close();
    for (const [key, descriptor] of saved) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
  } };
}

function fixture(src, imageRef) {
  return React.createElement(AvatarRoot, { src },
    React.createElement(AvatarImage, { alt: "Ada", loading: "lazy", ref: imageRef }),
    React.createElement(AvatarFallback, null, "AL"));
}

test("Avatar observes native events, preserves refs and resets source without preloading", async () => {
  const env = setup();
  const root = createRoot(env.container);
  const ref = React.createRef();
  try {
    await React.act(async () => root.render(fixture("/first.png", ref)));
    const image = env.container.querySelector("img");
    assert.equal(ref.current, image);
    assert.equal(env.preloads(), 0);
    assert.equal(image.getAttribute("loading"), "lazy");
    assert.equal(env.container.firstElementChild.dataset.state, "loading");
    await React.act(async () => image.dispatchEvent(new Event("load")));
    assert.equal(env.container.firstElementChild.dataset.state, "loaded");
    assert.equal(env.container.querySelector('[data-slot="avatar-fallback"]'), null);
    await React.act(async () => root.render(fixture("/second.png", ref)));
    assert.equal(env.container.querySelector("img"), image);
    assert.equal(env.container.firstElementChild.dataset.state, "loading");
    await React.act(async () => image.dispatchEvent(new Event("error")));
    assert.equal(image.hidden, true);
    assert.equal(env.container.textContent, "AL");
    await React.act(async () => root.render(fixture(undefined, ref)));
    assert.equal(env.container.firstElementChild.dataset.state, "idle");
    assert.equal(ref.current, null);
  } finally { await React.act(async () => root.unmount()); env.cleanup(); }
});

test("Avatar hydration retains a cached server-rendered image", async () => {
  const env = setup();
  const content = fixture("/cached.png");
  env.container.innerHTML = renderToString(content);
  const image = env.container.querySelector("img");
  Object.defineProperties(image, { complete: { value: true }, naturalWidth: { value: 40 }, currentSrc: { value: "https://example.test/cached.png" } });
  let root;
  try {
    await React.act(async () => { root = hydrateRoot(env.container, content); });
    assert.equal(env.container.querySelector("img"), image);
    assert.equal(env.container.firstElementChild.dataset.state, "loaded");
    assert.equal(env.preloads(), 0);
  } finally { await React.act(async () => root?.unmount()); env.cleanup(); }
});

test("fallback delay resets on source replacement and can be removed", async () => {
  const env = setup();
  const root = createRoot(env.container);
  const content = (src, delayMs) => React.createElement(AvatarRoot, { src },
    React.createElement(AvatarImage, { alt: "Ada" }),
    React.createElement(AvatarFallback, { delayMs }, "AL"));
  try {
    await React.act(async () => root.render(content("/first.png", 20)));
    assert.equal(env.container.textContent, "");
    await React.act(async () => new Promise(resolve => setTimeout(resolve, 30)));
    assert.equal(env.container.textContent, "AL");
    await React.act(async () => root.render(content("/next.png", 1000)));
    assert.equal(env.container.textContent, "");
    await React.act(async () => root.render(content("/next.png", undefined)));
    assert.equal(env.container.textContent, "AL");
  } finally { await React.act(async () => root.unmount()); env.cleanup(); }
});
