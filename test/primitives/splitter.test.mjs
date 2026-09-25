import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { Splitter, useSplitter, createSplitterRegistry } from "../../dist/splitter.js";
import { solve, resizePair, percent } from "../../dist/_internal/primitives/splitter/state.js";
const h = React.createElement;
test("Splitter public store renders through RootProvider during SSR", () => {
  function Example() {
    const store = useSplitter({ panels: [{ id: "a" }, { id: "b" }], defaultSizes: { a: 30, b: 70 } });
    assert.equal(store.getPanelSize("a"), 30);
    assert.throws(() => store.getPanelSize("toString"));
    assert.equal(store.getLayout(), '["a","b"]');
    assert.deepEqual(store.getItems(), [{ type: "panel", id: "a" }, { type: "handle", before: "a", after: "b" }, { type: "panel", id: "b" }]);
    return h(Splitter.RootProvider, { value: store }, h(Splitter.Panel, { panelId: "a" }, "A"), h(Splitter.ResizeTrigger, { before: "a", after: "b", "aria-label": "Store boundary" }), h(Splitter.Panel, { panelId: "b" }, "B"));
  }
  assert.match(renderToStaticMarkup(h(Example)), /aria-valuenow="30"/);
  assert.throws(() => createSplitterRegistry({ hitAreaMargins: { fine: -1 } }));
});
test("Splitter cascades through constrained neighboring panels", () => {
  const p = [{ id: "a", minSize: 10 }, { id: "b", minSize: 20 }, { id: "c", minSize: 10 }];
  const m = solve(p, { a: 30, b: 20, c: 50 }, 1000);
  assert.deepEqual(resizePair(m.sizes, p, m.bounds, "a", "b", 40), { a: 40, b: 20, c: 40 });
  for (let target = -100; target <= 200; target++) {
    const next = resizePair(m.sizes, p, m.bounds, "a", "b", target);
    assert.ok(Math.abs(Object.values(next).reduce((a, b) => a + b) - 100) < 0.000001);
    assert.ok(next.a >= 10 && next.b >= 20 && next.c >= 10);
  }
});
test("Splitter keyboard crosses collapsed intervals on either side", () => {
  const p = [{ id: "a", minSize: 20, collapsible: true }, { id: "b", minSize: 20, collapsible: true }];
  const m = solve(p, { a: 0, b: 100 }, 1000);
  assert.equal(resizePair(m.sizes, p, m.bounds, "a", "b", 1, "keyboard").a, 20);
  const expanded = { a: 20, b: 80 };
  assert.equal(resizePair(expanded, p, m.bounds, "a", "b", 19, "keyboard").a, 0);
  assert.equal(resizePair({ a: 100, b: 0 }, p, m.bounds, "a", "b", 99, "keyboard").b, 20);
});
test("Splitter supports one remaining panel and rejects empty collections", () => {
  assert.deepEqual(solve([{ id: "a" }], {}, 1000).sizes, { a: 100 });
  assert.throws(() => solve([], {}, 1000));
});
const panels = [{ id: "a", minSize: 20 }, { id: "b", minSize: 30 }];
function sample(props = {}) { return h(Splitter.Root, { panels, ...props },
  h(Splitter.Panel, { panelId: "a" }, "Files"), h(Splitter.ResizeTrigger, { before: "a", after: "b", "aria-label": "Files width" }), h(Splitter.Panel, { panelId: "b" }, "Editor")); }
test("Splitter SSR owns separator orientation, ranges and relationship", () => {
  const html = renderToStaticMarkup(sample());
  assert.match(html, /role="separator"/); assert.match(html, /aria-orientation="vertical"/);
  assert.match(html, /aria-valuemin="20"/); assert.match(html, /aria-valuemax="70"/);
  const controls = html.match(/aria-controls="([^"]+)"/)[1]; assert.ok(html.includes(`id="${controls}"`));
  assert.match(html, /flex:0 0 50%/);
});
test("Splitter controlled and vertical SSR", () => {
  const html = renderToStaticMarkup(sample({ sizes: { a: 25, b: 75 }, defaultSizes: { a: 60, b: 40 }, orientation: "vertical", dir: "rtl", disabled: true }));
  assert.match(html, /aria-valuenow="25"/); assert.match(html, /aria-orientation="horizontal"/); assert.match(html, /aria-disabled="true"/);
});
test("Splitter solver clamps adjacent bounds and preserves totals", () => {
  assert.deepEqual(solve(panels, { a: 25 }, 1000).sizes, { a: 25, b: 75 });
  const m = solve(panels, {}, 1000);
  assert.deepEqual(resizePair(m.sizes, panels, m.bounds, "a", "b", 90), { a: 70, b: 30 });
  assert.deepEqual(resizePair(m.sizes, panels, m.bounds, "a", "b", -10), { a: 20, b: 80 });
  for (let target = -100; target < 200; target += 0.3) {
    const next = resizePair(m.sizes, panels, m.bounds, "a", "b", target);
    assert.ok(Math.abs(next.a + next.b - 100) < 0.00001); assert.ok(next.a >= 20 && next.b >= 30);
  }
});
test("Splitter collapses below midpoint, not in impossible gaps", () => {
  const p = [{ id: "a", minSize: 20, collapsible: true }, { id: "b", minSize: 20 }];
  const m = solve(p, {}, 1000);
  assert.equal(resizePair(m.sizes, p, m.bounds, "a", "b", 9).a, 0);
  assert.equal(resizePair(m.sizes, p, m.bounds, "a", "b", 11).a, 20);
});
test("Splitter validates units, IDs, bounds and adjacency", () => {
  assert.equal(percent("200px", 1000), 20); assert.equal(percent("25%", 0), 25);
  for (const value of [NaN, -1, "2pt", "3pxjunk"]) assert.throws(() => percent(value, 1000));
  assert.equal(percent("2em", 1000, 0, { em: 20, rem: 16, vw: 10, vh: 8 }), 4);
  assert.equal(percent("2rem", 1000, 0, { em: 20, rem: 16, vw: 10, vh: 8 }), 3.2);
  assert.throws(() => solve([{ id: "a" }, { id: "a" }], {}, 100));
  assert.throws(() => solve([{ id: "a", minSize: 70, maxSize: 20 }, { id: "b" }], {}, 100));
  assert.throws(() => renderToStaticMarkup(h(Splitter.Root, { panels }, h(Splitter.ResizeTrigger, { before: "b", after: "a" }))));
});
test("Splitter retains pixel minima on insufficient host and reconciles IDs", () => {
  const m = solve([{ id: "a", minSize: "200px" }, { id: "b", minSize: "200px" }], {}, 300);
  assert.equal(m.insufficientSpace, true); assert.ok(Math.abs(m.sizes.a - 200 / 3) < 0.000001);
  const narrow = solve([{ id: "a", minSize: "200px" }, { id: "b", minSize: "200px" }], {}, 100);
  assert.equal(narrow.insufficientSpace, true);
  assert.deepEqual(narrow.sizes, { a: 200, b: 200 });
  const dynamic = solve([{ id: "a" }, { id: "new" }], { a: 50, old: 50 }, 1000);
  assert.deepEqual(dynamic.sizes, { a: 50, new: 50 });
});
test("Splitter collapsed content and polymorphic hosts render without duplicate wrappers", () => {
  const html = renderToStaticMarkup(h(Splitter.Root, { panels: [{ id: "a", minSize: 20, collapsible: true }, { id: "b" }], defaultSizes: { a: 0, b: 100 }, asChild: true },
    h("section", null, h(Splitter.Panel, { panelId: "a" }, "Retained"), h(Splitter.ResizeTrigger, { before: "a", after: "b", "aria-label": "Files" }), h(Splitter.Panel, { panelId: "b" }, "Body"))));
  assert.match(html, /^<section/); assert.match(html, /inert=""/); assert.match(html, /aria-hidden="true"/); assert.match(html, /Retained/);
});
