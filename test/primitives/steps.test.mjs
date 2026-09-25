import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { Steps } from "../../dist/steps.js";
import { firstInvalidStep, normalizeStep, normalizeStepsCount } from "../../dist/_internal/primitives/steps/state.js";
const h = React.createElement;
function sample(props = {}) {
  return h(Steps.Root, { count: 3, ...props },
    h(Steps.List, { "aria-label": "Checkout" }, ...[0, 1, 2].map(index => h(Steps.Item, { index, key: index },
      h(Steps.Trigger, null, h(Steps.Indicator), h(Steps.Title, null, `Stage ${index + 1}`)), h(Steps.Separator)))),
    ...[0, 1, 2].map(index => h(Steps.Content, { index, key: index }, `Panel ${index}`)),
    h(Steps.CompletedContent, null, "Finished"), h(Steps.PrevTrigger, null, "Previous"), h(Steps.NextTrigger, null, "Next"));
}
test("Steps renders ordered progress rather than tabs with stable title/content links", () => {
  const html = renderToStaticMarkup(sample({ defaultStep: 1 }));
  assert.match(html, /<ol[^>]*aria-label="Checkout"/);
  assert.equal((html.match(/<li/g) ?? []).length, 3);
  assert.equal((html.match(/aria-current="step"/g) ?? []).length, 1);
  assert.match(html, /data-state="complete"/);
  assert.match(html, /data-state="current"/);
  assert.match(html, /data-state="incomplete"/);
  assert.doesNotMatch(html, /role="tab/);
  const title = html.match(/id="([^"]+-title-1)"/)[1];
  assert.ok(html.includes(`aria-labelledby="${title}"`));
  assert.match(html, /type="button"/);
});
test("Steps controlled value wins, inactive content retained and last separator hidden", () => {
  const html = renderToStaticMarkup(sample({ step: 2, defaultStep: 0, dir: "rtl" }));
  assert.match(html, /dir="rtl"/);
  assert.match(html, /data-index="2"[^>]*data-state="current"/);
  assert.match(html, /data-state="inactive" hidden="">Panel 0/);
  assert.match(html, /steps-separator[^>]*hidden=""/);
});
test("Steps boundary navigation and completion render on the server", () => {
  const html = renderToStaticMarkup(sample({ step: 3 }));
  assert.doesNotMatch(html, /aria-current="step"/);
  assert.match(html, /steps-completed-content[^>]*data-state="active"/);
  assert.match(html, /disabled=""[^>]*data-slot="steps-next-trigger"/);
  const first = renderToStaticMarkup(sample());
  assert.match(first, /disabled=""[^>]*data-slot="steps-prev-trigger"/);
});
test("Steps normalizes bounds and rejects invalid item indexes", () => {
  assert.equal(normalizeStepsCount(NaN), 0);
  assert.equal(normalizeStepsCount(-1), 0);
  assert.equal(normalizeStepsCount(3.8), 3);
  assert.equal(normalizeStep(99, 3), 3);
  assert.equal(normalizeStep(-1, 3), 0);
  assert.equal(normalizeStep(Infinity, 3), 0);
  assert.throws(() => renderToStaticMarkup(h(Steps.Root, { count: 1 }, h(Steps.Item, { index: 2 }))), /index/);
  assert.throws(() => renderToStaticMarkup(h(Steps.Root, { count: 1 }, h(Steps.Content, { index: 1 }))), /index/);
});
test("Steps guards every crossed stage, never backward transitions", () => {
  const visited = [];
  assert.equal(firstInvalidStep(0, 3, index => { visited.push(index); return index !== 1; }), 1);
  assert.deepEqual(visited, [0, 1]);
  assert.equal(firstInvalidStep(2, 0, () => false), undefined);
  assert.equal(firstInvalidStep(0, 3, () => true), undefined);
});
test("Steps composition, custom context and content unmount are supported", () => {
  const html = renderToStaticMarkup(h(Steps.Root, { count: 1, asChild: true }, h("section", { "data-custom": "root" },
    h(Steps.List, null, h(Steps.Item, { index: 0 }, h(Steps.Title, { render: "strong" }, "Stage"), h(Steps.ItemContext, null, s => `Index ${s.index}`))),
    h(Steps.Content, { index: 0, "aria-label": "Custom" }, "Visible"),
    h(Steps.CompletedContent, { keepMounted: false }, "Do not render"),
    h(Steps.Context, null, state => `Step ${state.step}`))));
  assert.match(html, /^<section/);
  assert.match(html, /<strong/);
  assert.match(html, /Index 0/);
  assert.match(html, /Step 0/);
  assert.doesNotMatch(html, /Do not render/);
});
