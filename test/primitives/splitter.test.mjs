import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { Splitter } from "../../dist/splitter.js";
import { solve, resizePair, percent } from "../../dist/_internal/primitives/splitter/state.js";
const h = React.createElement;
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
  for (const value of [NaN, -1, "2em", "3pxjunk"]) assert.throws(() => percent(value, 1000));
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
