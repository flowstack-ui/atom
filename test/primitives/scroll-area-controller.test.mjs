import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { JSDOM } from "jsdom";

const compile = (source) =>
  `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64")}`;
const geometry = compile(
  await readFile(
    new URL("../../src/primitives/scroll-area/geometry.ts", import.meta.url),
    "utf8",
  ),
);
const source = await readFile(
  new URL("../../src/primitives/scroll-area/controller.ts", import.meta.url),
  "utf8",
);
const { createScrollAreaController } = await import(
  compile(source.replace('"./geometry.js"', JSON.stringify(geometry)))
);

function fixture({ reduced = false, observeNative = true } = {}) {
  const dom = new JSDOM(
    '<div id="root"><div id="viewport"><div id="content"></div></div><div id="vertical"><div id="vertical-thumb"></div></div></div>',
  );
  const w = dom.window,
    callbacks = new Map();
  let clock = 0,
    next = 0,
    observers = 0;
  w.requestAnimationFrame = (fn) => {
    callbacks.set(++next, fn);
    return next;
  };
  w.cancelAnimationFrame = (id) => callbacks.delete(id);
  w.performance.now = () => clock;
  w.matchMedia = () => ({ matches: reduced });
  w.ResizeObserver = class {
    active = false;
    observe() {
      if (!this.active) {
        this.active = true;
        observers++;
      }
    }
    disconnect() {
      if (this.active) {
        this.active = false;
        observers--;
      }
    }
  };
  const engine = createScrollAreaController({}, observeNative);
  const viewport = w.document.getElementById("viewport");
  for (const [key, value] of Object.entries({
    clientHeight: 100,
    scrollHeight: 1000,
    clientWidth: 100,
    scrollWidth: 100,
  }))
    Object.defineProperty(viewport, key, { configurable: true, value });
  viewport.scrollTo = ({
    top = viewport.scrollTop,
    left = viewport.scrollLeft,
  }) => {
    viewport.scrollTop = top;
    viewport.scrollLeft = left;
  };
  engine.register("root", w.document.getElementById("root"));
  engine.register("viewport", viewport);
  const flush = (time = clock + 16) => {
    clock = time;
    const pending = [...callbacks.values()];
    callbacks.clear();
    pending.forEach((fn) => fn(time));
  };
  return {
    dom,
    w,
    engine,
    viewport,
    callbacks,
    flush,
    observers: () => observers,
  };
}

test("native roots stay observer-free; custom readiness requires complete anatomy and platform support", () => {
  const f = fixture({ observeNative: false });
  const dispose = f.engine.mount();
  f.flush();
  assert.equal(f.observers(), 0);
  assert.equal(f.viewport.hasAttribute("data-custom-ready"), false);
  for (const part of ["content", "vertical", "vertical-thumb"])
    f.engine.register(part, f.w.document.getElementById(part));
  f.flush();
  assert.equal(f.viewport.hasAttribute("data-custom-ready"), true);
  f.w.MutationObserver = undefined;
  f.engine.schedule();
  f.flush();
  assert.equal(f.viewport.hasAttribute("data-custom-ready"), false);
  dispose();
  f.dom.window.close();
});

test("mount replay, frame coalescing, ref replacement and teardown do not retain observers or frames", () => {
  const f = fixture();
  let dispose = f.engine.mount();
  for (let i = 0; i < 10; i++) f.engine.schedule();
  assert.equal(f.callbacks.size, 1);
  dispose();
  assert.equal(f.callbacks.size, 0);
  assert.equal(f.observers(), 0);
  dispose = f.engine.mount();
  f.flush();
  assert.equal(f.observers(), 1);
  assert.equal(f.engine.api.hasOverflowY, true);
  f.engine.api.scrollTo({ top: 900, duration: 500 });
  f.engine.register("viewport", null);
  assert.equal(f.callbacks.size, 0);
  assert.equal(f.observers(), 0);
  f.engine.register("viewport", f.viewport);
  f.flush();
  assert.equal(f.observers(), 1);
  dispose();
  assert.equal(f.callbacks.size, 0);
  assert.equal(f.observers(), 0);
  f.dom.window.close();
});

test("bounded easing, interruption, new commands and reduced motion preserve native position", () => {
  const f = fixture();
  const dispose = f.engine.mount();
  f.flush(0);
  f.engine.api.scrollTo({ top: 1000, duration: 100, easing: (t) => t * t });
  f.flush(50);
  assert.equal(f.viewport.scrollTop, 225);
  f.engine.cancel();
  f.flush(100);
  assert.equal(f.viewport.scrollTop, 225);
  f.engine.api.scrollTo({ top: 800, duration: 100 });
  f.engine.api.scrollTo({ top: 30 });
  f.flush(200);
  assert.equal(f.viewport.scrollTop, 30);
  f.engine.api.scrollTo({ top: 900, duration: 100 });
  dispose();
  f.flush(400);
  assert.equal(f.viewport.scrollTop, 30);
  f.dom.window.close();
  const reduced = fixture({ reduced: true });
  reduced.engine.api.scrollTo({ top: 1000, duration: 500 });
  assert.equal(reduced.viewport.scrollTop, 900);
  assert.throws(
    () => reduced.engine.api.scrollTo({ top: 0, duration: -1 }),
    RangeError,
  );
  reduced.dom.window.close();
});

test("invalid easing terminates animation and changing ids notifies subscribers", () => {
  const f = fixture();
  const dispose = f.engine.mount();
  f.flush(0);
  f.engine.api.scrollTo({ top: 900, duration: 100, easing: () => NaN });
  assert.throws(() => f.flush(50), RangeError);
  assert.equal(f.callbacks.size, 0);
  let changes = 0;
  const unsubscribe = f.engine.subscribe(() => changes++);
  f.engine.configure({ ids: { viewport: "updated" } });
  assert.equal(changes, 1);
  assert.equal(f.engine.id("viewport"), "updated");
  unsubscribe();
  dispose();
  f.dom.window.close();
});
