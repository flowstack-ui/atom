import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { assert, test, React, renderToStaticMarkup } from "../test-utils.mjs";
import { CheckboxCard, CheckboxGroup, useCheckboxCard } from "../../dist/index.js";
const h = React.createElement;
function card(props = {}, text = "Backups") {
  return h(CheckboxCard.Root, props, h(CheckboxCard.HiddenInput), h(CheckboxCard.Control, null, h(CheckboxCard.Label, null, text), h(CheckboxCard.Description, null, "Daily snapshots"), h(CheckboxCard.Indicator)));
}
async function mount(element, run) {
  const dom = new JSDOM("<div id='root'></div>", { pretendToBeVisual: true, url: "https://example.test" });
  const keys = ["window", "document", "HTMLElement", "Element", "Node", "Event", "IS_REACT_ACT_ENVIRONMENT"];
  const old = keys.map((key) => globalThis[key]);
  keys.forEach((key) => globalThis[key] = key === "IS_REACT_ACT_ENVIRONMENT" ? true : dom.window[key] ?? dom.window);
  const root = createRoot(document.getElementById("root"));
  try { await React.act(() => root.render(element)); await run(dom.window.document, root); }
  finally { await React.act(() => root.unmount()); keys.forEach((key, i) => globalThis[key] = old[i]); dom.window.close(); }
}
test("CheckboxCard SSR contains one accessible native input and no button", () => {
  const html = renderToStaticMarkup(card({ name: "options", defaultChecked: true }));
  assert.equal((html.match(/<input/g) ?? []).length, 1);
  assert.match(html, /<label/); assert.match(html, /type="checkbox"/);
  assert.doesNotMatch(html, /<button|tabindex="-1"/);
});
test("CheckboxCard label toggles exactly once and names/describes the input", async () => {
  const changes = [];
  await mount(card({ onCheckedChange: (value) => changes.push(value) }), async (doc) => {
    const input = doc.querySelector("input");
    assert.equal(doc.getElementById(input.getAttribute("aria-labelledby")).textContent, "Backups");
    assert.equal(doc.getElementById(input.getAttribute("aria-describedby")).textContent, "Daily snapshots");
    await React.act(() => doc.querySelector("label").click());
    assert.equal(input.checked, true); assert.deepEqual(changes, [true]);
    await React.act(() => input.click()); assert.deepEqual(changes, [true, false]);
  });
});
test("CheckboxCard submits and resets uncontrolled values", async () => {
  await mount(h("form", null, card({ name: "extra", value: "backup", defaultChecked: true })), async (doc) => {
    const form = doc.querySelector("form");
    assert.deepEqual([...new doc.defaultView.FormData(form)], [["extra", "backup"]]);
    await React.act(() => doc.querySelector("input").click());
    await React.act(() => form.reset());
    assert.equal(doc.querySelector("input").checked, true);
  });
});
for (const state of ["disabled", "readOnly"]) test(`CheckboxCard ${state} prevents activation`, async () => {
  const changes = [];
  await mount(card({ [state]: true, defaultChecked: true, onCheckedChange: (v) => changes.push(v) }), async (doc) => {
    await React.act(() => doc.querySelector("label").click());
    assert.equal(doc.querySelector("input").checked, true); assert.deepEqual(changes, []);
    await React.act(() => doc.querySelector("input").click());
    assert.equal(doc.querySelector("input").checked, true); assert.deepEqual(changes, []);
  });
});
test("CheckboxCard mixed state is exposed and toggles to checked", async () => {
  await mount(card({ defaultChecked: "indeterminate" }), async (doc) => {
    const input = doc.querySelector("input"); assert.equal(input.indeterminate, true);
    assert.equal(input.getAttribute("aria-checked"), "mixed");
    await React.act(() => input.click()); assert.equal(input.checked, true); assert.equal(input.indeterminate, false);
  });
});
test("CheckboxCard group coordinates values, limits, repeated forms and reset", async () => {
  await mount(h("form", null, h(CheckboxGroup.Root, { name: "extras", maxSelectedValues: 1, "aria-label": "Extras" }, card({ value: "a" }, "Alpha"), card({ value: "b" }, "Beta"))), async (doc) => {
    const [a, b] = doc.querySelectorAll("input");
    await React.act(() => a.click()); assert.equal(a.checked, true); assert.equal(b.disabled, true);
    assert.deepEqual([...new doc.defaultView.FormData(doc.querySelector("form"))], [["extras", "a"]]);
    await React.act(() => a.click()); assert.equal(b.disabled, false);
    await React.act(() => b.click()); await React.act(() => doc.querySelector("form").reset());
    assert.equal(a.checked, false); assert.equal(b.checked, false);
  });
});
test("CheckboxCard forwards root/input refs and supports controlled provider", async () => {
  const label = React.createRef(); const input = React.createRef();
  function Fixture() { const state = useCheckboxCard(); return h(CheckboxCard.RootProvider, { value: state, ref: label }, h(CheckboxCard.HiddenInput, { ref: input }), h(CheckboxCard.Label, null, "Choice")); }
  await mount(h(Fixture), async () => { assert.equal(label.current.tagName, "LABEL"); assert.equal(input.current.tagName, "INPUT"); await React.act(() => input.current.click()); assert.equal(input.current.checked, true); });
});
test("CheckboxCard consumer click cancellation preserves state", async () => {
  await mount(card({ onClick: (event) => event.preventDefault() }), async (doc) => { await React.act(() => doc.querySelector("label").click()); assert.equal(doc.querySelector("input").checked, false); });
});
test("CheckboxCard external form and read-only submission retain native ownership", async () => {
  await mount(h(React.Fragment, null, h("form", {id:"external"}), card({form:"external",name:"extra",value:"backup",defaultChecked:true,readOnly:true})), async (doc) => {
    assert.deepEqual([...new doc.defaultView.FormData(doc.querySelector("form"))], [["extra","backup"]]);
    assert.equal(doc.querySelector("input").form, doc.querySelector("form"));
  });
});
test("CheckboxCard descriptions clean up and explicit input ARIA wins", async () => {
  await mount(card(), async (doc,root) => {
    await React.act(() => root.render(h(CheckboxCard.Root, {ids:{input:"custom-input"}}, h(CheckboxCard.HiddenInput,{"aria-label":"Override"}), h(CheckboxCard.Control,null,"Choice"))));
    const input=doc.querySelector("input");
    assert.equal(input.id,"custom-input"); assert.equal(input.getAttribute("aria-label"),"Override");
    assert.equal(input.hasAttribute("aria-describedby"),false); assert.equal(input.hasAttribute("aria-labelledby"),false);
  });
});
test("CheckboxCard explicit input aria-label overrides the visual label",async()=>{
  await mount(h(CheckboxCard.Root,null,h(CheckboxCard.HiddenInput,{"aria-label":"Accessible override"}),h(CheckboxCard.Label,null,"Visual label")),async(doc)=>{
    assert.equal(doc.querySelector("input").getAttribute("aria-label"),"Accessible override");
    assert.equal(doc.querySelector("input").hasAttribute("aria-labelledby"),false);
  });
});
test("CheckboxCard asChild preserves a label host without extra controls", async () => {
  await mount(h(CheckboxCard.Root,{asChild:true},h("label",{"data-custom":"yes"},h(CheckboxCard.HiddenInput),h(CheckboxCard.Label,null,"Choice"))), async(doc)=>{
    assert.equal(doc.querySelectorAll("label").length,1); assert.equal(doc.querySelector("label").dataset.custom,"yes");
    await React.act(()=>doc.querySelector("label").click()); assert.equal(doc.querySelector("input").checked,true);
  });
});
